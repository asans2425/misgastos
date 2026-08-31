create or replace function public.get_app_home_data(p_selected_month text default null)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_start_day integer := 1;
  v_label_mode text := 'same';
  v_today date := (now() at time zone 'Europe/Madrid')::date;
  v_selected_month text;
  v_month_date date;
  v_start_month date;
  v_next_start_month date;
  v_start_last_day integer;
  v_next_start_last_day integer;
  v_range_start date;
  v_range_end date;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select
    coalesce(user_preferences.financial_month_start_day, 1),
    case
      when coalesce(user_preferences.financial_month_start_day, 1) >= 16
        then 'next'
      else coalesce(user_preferences.financial_month_label_mode, 'same')
    end
  into v_start_day, v_label_mode
  from public.user_preferences
  where user_preferences.user_id = v_user_id
  limit 1;

  if not found then
    v_start_day := 1;
    v_label_mode := 'same';
  end if;

  v_start_day := least(greatest(v_start_day, 1), 31);

  if p_selected_month ~ '^[0-9]{4}-[0-9]{2}$' then
    v_selected_month := p_selected_month;
  elsif v_start_day = 1 then
    v_selected_month := to_char(v_today, 'YYYY-MM');
  elsif v_label_mode = 'next' then
    v_selected_month := case
      when extract(day from v_today)::integer >= v_start_day
        then to_char(date_trunc('month', v_today)::date + interval '1 month', 'YYYY-MM')
      else to_char(v_today, 'YYYY-MM')
    end;
  else
    v_selected_month := case
      when extract(day from v_today)::integer >= v_start_day
        then to_char(v_today, 'YYYY-MM')
      else to_char(date_trunc('month', v_today)::date - interval '1 month', 'YYYY-MM')
    end;
  end if;

  v_month_date := to_date(v_selected_month || '-01', 'YYYY-MM-DD');

  if v_start_day = 1 then
    v_range_start := v_month_date;
    v_range_end := (v_month_date + interval '1 month - 1 day')::date;
  else
    v_start_month := case
      when v_label_mode = 'next' then (v_month_date - interval '1 month')::date
      else v_month_date
    end;
    v_next_start_month := (v_start_month + interval '1 month')::date;
    v_start_last_day := extract(
      day from (date_trunc('month', v_start_month)::date + interval '1 month - 1 day')
    )::integer;
    v_next_start_last_day := extract(
      day from (
        date_trunc('month', v_next_start_month)::date + interval '1 month - 1 day'
      )
    )::integer;
    v_range_start := v_start_month + (least(v_start_day, v_start_last_day) - 1);
    v_range_end :=
      v_next_start_month + (least(v_start_day, v_next_start_last_day) - 2);
  end if;

  return jsonb_build_object(
    'preferences',
    jsonb_build_object(
      'financial_month_start_day',
      v_start_day,
      'financial_month_label_mode',
      v_label_mode
    ),
    'selectedMonth',
    v_selected_month,
    'monthRange',
    jsonb_build_object(
      'start',
      to_char(v_range_start, 'YYYY-MM-DD'),
      'end',
      to_char(v_range_end, 'YYYY-MM-DD')
    ),
    'categories',
    (
      select coalesce(jsonb_agg(to_jsonb(category_row) order by category_row.name), '[]'::jsonb)
      from (
        select categories.id, categories.name
        from public.categories
        where categories.user_id = v_user_id
          and categories.is_active = true
      ) category_row
    ),
    'subcategories',
    (
      select coalesce(jsonb_agg(to_jsonb(subcategory_row) order by subcategory_row.name), '[]'::jsonb)
      from (
        select subcategories.id, subcategories.name
        from public.subcategories
        where subcategories.user_id = v_user_id
          and subcategories.is_active = true
      ) subcategory_row
    ),
    'accounts',
    (
      select coalesce(
        jsonb_agg(to_jsonb(account_row) order by account_row.sort_order, account_row.name),
        '[]'::jsonb
      )
      from (
        select accounts.id, accounts.name, accounts.sort_order, accounts.current_balance
        from public.accounts
        where accounts.user_id = v_user_id
          and accounts.is_active = true
          and accounts.type = 'normal'
      ) account_row
    ),
    'quickActions',
    (
      select coalesce(
        jsonb_agg(to_jsonb(quick_action_row) order by quick_action_row.sort_order, quick_action_row.label),
        '[]'::jsonb
      )
      from (
        select
          quick_actions.id,
          quick_actions.label,
          quick_actions.category_id,
          quick_actions.subcategory_id,
          quick_actions.sort_order,
          quick_actions.type
        from public.quick_actions
        where quick_actions.user_id = v_user_id
          and quick_actions.is_active = true
          and quick_actions.type = 'expense'
      ) quick_action_row
    ),
    'buckets',
    (
      select coalesce(
        jsonb_agg(to_jsonb(bucket_row) order by bucket_row.sort_order, bucket_row.name),
        '[]'::jsonb
      )
      from (
        select
          savings_buckets.id,
          savings_buckets.name,
          savings_buckets.current_balance,
          savings_buckets.target_amount,
          savings_buckets.initial_balance,
          savings_buckets.color,
          savings_buckets.is_active,
          savings_buckets.sort_order
        from public.savings_buckets
        where savings_buckets.user_id = v_user_id
          and savings_buckets.is_active = true
      ) bucket_row
    ),
    'transactions',
    (
      select coalesce(
        jsonb_agg(to_jsonb(transaction_row) order by transaction_row.date desc, transaction_row.created_at desc),
        '[]'::jsonb
      )
      from (
        select
          transactions.id,
          transactions.amount,
          transactions.date,
          transactions.description,
          transactions.type,
          transactions.status,
          transactions.is_investment,
          transactions.is_reimbursement,
          transactions.is_travel_income,
          transactions.reimburses_transaction_id,
          transactions.category_id,
          transactions.subcategory_id,
          transactions.created_at
        from public.transactions
        where transactions.user_id = v_user_id
          and transactions.date >= v_range_start
          and transactions.date <= v_range_end
      ) transaction_row
    )
  );
end;
$$;

create or replace function public.get_transactions_page_data(
  p_selected_month text default null
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_start_day integer := 1;
  v_label_mode text := 'same';
  v_today date := (now() at time zone 'Europe/Madrid')::date;
  v_selected_month text;
  v_month_date date;
  v_start_month date;
  v_next_start_month date;
  v_start_last_day integer;
  v_next_start_last_day integer;
  v_range_start date;
  v_range_end date;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select
    coalesce(user_preferences.financial_month_start_day, 1),
    case
      when coalesce(user_preferences.financial_month_start_day, 1) >= 16
        then 'next'
      else coalesce(user_preferences.financial_month_label_mode, 'same')
    end
  into v_start_day, v_label_mode
  from public.user_preferences
  where user_preferences.user_id = v_user_id
  limit 1;

  if not found then
    v_start_day := 1;
    v_label_mode := 'same';
  end if;

  v_start_day := least(greatest(v_start_day, 1), 31);

  if p_selected_month ~ '^[0-9]{4}-[0-9]{2}$' then
    v_selected_month := p_selected_month;
  elsif v_start_day = 1 then
    v_selected_month := to_char(v_today, 'YYYY-MM');
  elsif v_label_mode = 'next' then
    v_selected_month := case
      when extract(day from v_today)::integer >= v_start_day
        then to_char(date_trunc('month', v_today)::date + interval '1 month', 'YYYY-MM')
      else to_char(v_today, 'YYYY-MM')
    end;
  else
    v_selected_month := case
      when extract(day from v_today)::integer >= v_start_day
        then to_char(v_today, 'YYYY-MM')
      else to_char(date_trunc('month', v_today)::date - interval '1 month', 'YYYY-MM')
    end;
  end if;

  v_month_date := to_date(v_selected_month || '-01', 'YYYY-MM-DD');

  if v_start_day = 1 then
    v_range_start := v_month_date;
    v_range_end := (v_month_date + interval '1 month - 1 day')::date;
  else
    v_start_month := case
      when v_label_mode = 'next' then (v_month_date - interval '1 month')::date
      else v_month_date
    end;
    v_next_start_month := (v_start_month + interval '1 month')::date;
    v_start_last_day := extract(
      day from (date_trunc('month', v_start_month)::date + interval '1 month - 1 day')
    )::integer;
    v_next_start_last_day := extract(
      day from (
        date_trunc('month', v_next_start_month)::date + interval '1 month - 1 day'
      )
    )::integer;
    v_range_start := v_start_month + (least(v_start_day, v_start_last_day) - 1);
    v_range_end :=
      v_next_start_month + (least(v_start_day, v_next_start_last_day) - 2);
  end if;

  return jsonb_build_object(
    'selectedMonth',
    v_selected_month,
    'monthRange',
    jsonb_build_object(
      'start',
      to_char(v_range_start, 'YYYY-MM-DD'),
      'end',
      to_char(v_range_end, 'YYYY-MM-DD')
    ),
    'categories',
    (
      select coalesce(
        jsonb_agg(to_jsonb(category_row) order by category_row.sort_order, category_row.name),
        '[]'::jsonb
      )
      from (
        select categories.id, categories.name, categories.type, categories.sort_order
        from public.categories
        where categories.user_id = v_user_id
          and categories.is_active = true
      ) category_row
    ),
    'subcategories',
    (
      select coalesce(
        jsonb_agg(to_jsonb(subcategory_row) order by subcategory_row.sort_order, subcategory_row.name),
        '[]'::jsonb
      )
      from (
        select
          subcategories.id,
          subcategories.name,
          subcategories.category_id,
          subcategories.is_travel_income,
          subcategories.sort_order
        from public.subcategories
        where subcategories.user_id = v_user_id
          and subcategories.is_active = true
      ) subcategory_row
    ),
    'transactions',
    (
      select coalesce(
        jsonb_agg(to_jsonb(transaction_row) order by transaction_row.date desc, transaction_row.created_at desc),
        '[]'::jsonb
      )
      from (
        select
          transactions.id,
          transactions.amount,
          transactions.date,
          transactions.description,
          transactions.type,
          transactions.status,
          transactions.is_investment,
          transactions.is_reimbursement,
          transactions.is_travel_income,
          transactions.reimburses_transaction_id,
          transactions.category_id,
          transactions.subcategory_id,
          transactions.created_at
        from public.transactions
        where transactions.user_id = v_user_id
          and transactions.date >= v_range_start
          and transactions.date <= v_range_end
      ) transaction_row
    )
  );
end;
$$;
