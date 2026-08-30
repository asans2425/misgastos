alter table public.user_preferences
  add column if not exists financial_month_start_day integer not null default 1,
  add column if not exists financial_month_label_mode text not null default 'same';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'user_preferences_financial_month_start_day_check'
  ) then
    alter table public.user_preferences
      add constraint user_preferences_financial_month_start_day_check
      check (financial_month_start_day between 1 and 31);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'user_preferences_financial_month_label_mode_check'
  ) then
    alter table public.user_preferences
      add constraint user_preferences_financial_month_label_mode_check
      check (financial_month_label_mode in ('same', 'next'));
  end if;
end;
$$;
