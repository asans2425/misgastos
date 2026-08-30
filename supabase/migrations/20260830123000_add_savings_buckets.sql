create table if not exists public.savings_buckets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric(14, 2),
  initial_balance numeric(14, 2) not null default 0,
  current_balance numeric(14, 2) not null default 0,
  color text,
  icon text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  unique (user_id, name),
  constraint savings_buckets_initial_balance_check
    check (initial_balance >= 0),
  constraint savings_buckets_target_amount_check
    check (target_amount is null or target_amount >= 0)
);

create table if not exists public.bucket_movements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  bucket_id uuid not null,
  date date not null,
  month text not null,
  type text not null,
  amount numeric(14, 2) not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (bucket_id, user_id)
    references public.savings_buckets(id, user_id)
    on delete cascade,
  constraint bucket_movements_type_check
    check (type in ('contribution', 'withdrawal')),
  constraint bucket_movements_amount_positive_check
    check (amount > 0),
  constraint bucket_movements_month_check
    check (month ~ '^[0-9]{4}-[0-9]{2}$')
);

create index if not exists savings_buckets_user_active_sort_idx
  on public.savings_buckets(user_id, is_active, sort_order);

create index if not exists bucket_movements_user_month_idx
  on public.bucket_movements(user_id, month);

create index if not exists bucket_movements_bucket_id_idx
  on public.bucket_movements(bucket_id);

drop trigger if exists set_savings_buckets_updated_at on public.savings_buckets;
create trigger set_savings_buckets_updated_at
before update on public.savings_buckets
for each row execute function public.set_updated_at();

drop trigger if exists set_bucket_movements_updated_at on public.bucket_movements;
create trigger set_bucket_movements_updated_at
before update on public.bucket_movements
for each row execute function public.set_updated_at();

alter table public.savings_buckets enable row level security;
alter table public.bucket_movements enable row level security;

create policy "savings_buckets_select_own"
on public.savings_buckets for select
to authenticated
using (user_id = auth.uid());

create policy "savings_buckets_insert_own"
on public.savings_buckets for insert
to authenticated
with check (user_id = auth.uid());

create policy "savings_buckets_update_own"
on public.savings_buckets for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "savings_buckets_delete_own"
on public.savings_buckets for delete
to authenticated
using (user_id = auth.uid());

create policy "bucket_movements_select_own"
on public.bucket_movements for select
to authenticated
using (user_id = auth.uid());

create policy "bucket_movements_insert_own"
on public.bucket_movements for insert
to authenticated
with check (user_id = auth.uid());

create policy "bucket_movements_update_own"
on public.bucket_movements for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "bucket_movements_delete_own"
on public.bucket_movements for delete
to authenticated
using (user_id = auth.uid());
