alter table public.savings_buckets
  add column if not exists initial_balance numeric(14, 2) not null default 0;

alter table public.savings_buckets
  drop constraint if exists savings_buckets_initial_balance_check;

alter table public.savings_buckets
  add constraint savings_buckets_initial_balance_check
    check (initial_balance >= 0);

update public.savings_buckets
set current_balance = initial_balance + coalesce((
  select sum(
    case
      when bucket_movements.type = 'contribution' then bucket_movements.amount
      when bucket_movements.type = 'withdrawal' then -bucket_movements.amount
      else 0
    end
  )
  from public.bucket_movements
  where bucket_movements.bucket_id = savings_buckets.id
    and bucket_movements.user_id = savings_buckets.user_id
), 0);
