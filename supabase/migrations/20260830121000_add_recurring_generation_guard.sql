create unique index if not exists transactions_user_recurring_month_unique_idx
  on public.transactions(user_id, recurring_item_id, generated_for_month)
  where recurring_item_id is not null and generated_for_month is not null;
