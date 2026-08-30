create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null,
  initial_balance numeric(14, 2) not null default 0,
  current_balance numeric(14, 2) not null default 0,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  unique (user_id, name),
  constraint accounts_type_check
    check (type in ('normal', 'savings', 'travel', 'cash', 'other'))
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null,
  icon text,
  color text,
  is_system boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  unique (user_id, name),
  constraint categories_type_check
    check (type in ('income', 'expense', 'special'))
);

create table public.subcategories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null,
  name text not null,
  default_destination text not null default 'normal',
  is_travel_income boolean not null default false,
  is_investment boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  unique (user_id, category_id, name),
  foreign key (category_id, user_id)
    references public.categories(id, user_id)
    on delete cascade,
  constraint subcategories_default_destination_check
    check (default_destination in ('normal', 'ahorros', 'viajes'))
);

create table public.recurring_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null,
  amount numeric(14, 2) not null,
  category_id uuid,
  subcategory_id uuid,
  account_id uuid,
  day_of_month integer not null,
  frequency text not null default 'monthly',
  is_investment boolean not null default false,
  is_travel_income boolean not null default false,
  include_in_living_expenses boolean not null default true,
  auto_create boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  unique (user_id, name),
  foreign key (category_id, user_id)
    references public.categories(id, user_id)
    on delete restrict,
  foreign key (subcategory_id, user_id)
    references public.subcategories(id, user_id)
    on delete restrict,
  foreign key (account_id, user_id)
    references public.accounts(id, user_id)
    on delete restrict,
  constraint recurring_items_type_check
    check (type in ('income', 'expense')),
  constraint recurring_items_amount_non_negative_check
    check (amount >= 0),
  constraint recurring_items_day_of_month_check
    check (day_of_month between 1 and 31),
  constraint recurring_items_frequency_check
    check (length(trim(frequency)) > 0)
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  month text not null,
  type text not null,
  amount numeric(14, 2) not null,
  category_id uuid,
  subcategory_id uuid,
  account_id uuid,
  destination_account_id uuid,
  description text,
  merchant text,
  is_fixed boolean not null default false,
  is_recurring boolean not null default false,
  is_investment boolean not null default false,
  is_travel_income boolean not null default false,
  counts_for_savings boolean not null default true,
  include_in_living_expenses boolean not null default true,
  status text not null default 'confirmed',
  recurring_item_id uuid,
  generated_for_month text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (category_id, user_id)
    references public.categories(id, user_id)
    on delete restrict,
  foreign key (subcategory_id, user_id)
    references public.subcategories(id, user_id)
    on delete restrict,
  foreign key (account_id, user_id)
    references public.accounts(id, user_id)
    on delete restrict,
  foreign key (destination_account_id, user_id)
    references public.accounts(id, user_id)
    on delete restrict,
  foreign key (recurring_item_id, user_id)
    references public.recurring_items(id, user_id)
    on delete restrict,
  constraint transactions_type_check
    check (type in ('income', 'expense', 'transfer')),
  constraint transactions_amount_positive_check
    check (amount > 0),
  constraint transactions_status_check
    check (status in ('pending', 'confirmed', 'edited')),
  constraint transactions_month_check
    check (month ~ '^[0-9]{4}-[0-9]{2}$'),
  constraint transactions_generated_for_month_check
    check (generated_for_month is null or generated_for_month ~ '^[0-9]{4}-[0-9]{2}$')
);

create table public.quick_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  type text not null,
  category_id uuid,
  subcategory_id uuid,
  default_amount numeric(14, 2),
  icon text,
  color text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  unique (user_id, label),
  foreign key (category_id, user_id)
    references public.categories(id, user_id)
    on delete restrict,
  foreign key (subcategory_id, user_id)
    references public.subcategories(id, user_id)
    on delete restrict,
  constraint quick_actions_type_check
    check (type in ('income', 'expense')),
  constraint quick_actions_default_amount_positive_check
    check (default_amount is null or default_amount > 0)
);

create table public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  default_account_id uuid,
  default_month text,
  hide_investment_from_living_expenses boolean not null default true,
  currency text not null default 'EUR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id),
  unique (id, user_id),
  foreign key (default_account_id, user_id)
    references public.accounts(id, user_id)
    on delete restrict,
  constraint user_preferences_default_month_check
    check (default_month is null or default_month ~ '^[0-9]{4}-[0-9]{2}$'),
  constraint user_preferences_currency_check
    check (length(trim(currency)) = 3)
);

create index accounts_user_id_idx on public.accounts(user_id);
create index accounts_user_active_sort_idx on public.accounts(user_id, is_active, sort_order);

create index categories_user_id_idx on public.categories(user_id);
create index categories_user_type_sort_idx on public.categories(user_id, type, is_active, sort_order);

create index subcategories_user_id_idx on public.subcategories(user_id);
create index subcategories_category_id_idx on public.subcategories(category_id);

create index recurring_items_user_id_idx on public.recurring_items(user_id);
create index recurring_items_user_active_idx on public.recurring_items(user_id, is_active);

create index transactions_user_id_idx on public.transactions(user_id);
create index transactions_user_month_idx on public.transactions(user_id, month);
create index transactions_user_date_idx on public.transactions(user_id, date desc);
create index transactions_recurring_item_id_idx on public.transactions(recurring_item_id);

create index quick_actions_user_id_idx on public.quick_actions(user_id);
create index quick_actions_user_active_sort_idx on public.quick_actions(user_id, is_active, sort_order);

create index user_preferences_user_id_idx on public.user_preferences(user_id);

create trigger set_accounts_updated_at
before update on public.accounts
for each row execute function public.set_updated_at();

create trigger set_categories_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create trigger set_subcategories_updated_at
before update on public.subcategories
for each row execute function public.set_updated_at();

create trigger set_recurring_items_updated_at
before update on public.recurring_items
for each row execute function public.set_updated_at();

create trigger set_transactions_updated_at
before update on public.transactions
for each row execute function public.set_updated_at();

create trigger set_quick_actions_updated_at
before update on public.quick_actions
for each row execute function public.set_updated_at();

create trigger set_user_preferences_updated_at
before update on public.user_preferences
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.subcategories enable row level security;
alter table public.recurring_items enable row level security;
alter table public.transactions enable row level security;
alter table public.quick_actions enable row level security;
alter table public.user_preferences enable row level security;

create policy "profiles_select_own"
on public.profiles for select
to authenticated
using (id = auth.uid());

create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "profiles_delete_own"
on public.profiles for delete
to authenticated
using (id = auth.uid());

create policy "accounts_select_own"
on public.accounts for select
to authenticated
using (user_id = auth.uid());

create policy "accounts_insert_own"
on public.accounts for insert
to authenticated
with check (user_id = auth.uid());

create policy "accounts_update_own"
on public.accounts for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "accounts_delete_own"
on public.accounts for delete
to authenticated
using (user_id = auth.uid());

create policy "categories_select_own"
on public.categories for select
to authenticated
using (user_id = auth.uid());

create policy "categories_insert_own"
on public.categories for insert
to authenticated
with check (user_id = auth.uid());

create policy "categories_update_own"
on public.categories for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "categories_delete_own"
on public.categories for delete
to authenticated
using (user_id = auth.uid());

create policy "subcategories_select_own"
on public.subcategories for select
to authenticated
using (user_id = auth.uid());

create policy "subcategories_insert_own"
on public.subcategories for insert
to authenticated
with check (user_id = auth.uid());

create policy "subcategories_update_own"
on public.subcategories for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "subcategories_delete_own"
on public.subcategories for delete
to authenticated
using (user_id = auth.uid());

create policy "recurring_items_select_own"
on public.recurring_items for select
to authenticated
using (user_id = auth.uid());

create policy "recurring_items_insert_own"
on public.recurring_items for insert
to authenticated
with check (user_id = auth.uid());

create policy "recurring_items_update_own"
on public.recurring_items for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "recurring_items_delete_own"
on public.recurring_items for delete
to authenticated
using (user_id = auth.uid());

create policy "transactions_select_own"
on public.transactions for select
to authenticated
using (user_id = auth.uid());

create policy "transactions_insert_own"
on public.transactions for insert
to authenticated
with check (user_id = auth.uid());

create policy "transactions_update_own"
on public.transactions for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "transactions_delete_own"
on public.transactions for delete
to authenticated
using (user_id = auth.uid());

create policy "quick_actions_select_own"
on public.quick_actions for select
to authenticated
using (user_id = auth.uid());

create policy "quick_actions_insert_own"
on public.quick_actions for insert
to authenticated
with check (user_id = auth.uid());

create policy "quick_actions_update_own"
on public.quick_actions for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "quick_actions_delete_own"
on public.quick_actions for delete
to authenticated
using (user_id = auth.uid());

create policy "user_preferences_select_own"
on public.user_preferences for select
to authenticated
using (user_id = auth.uid());

create policy "user_preferences_insert_own"
on public.user_preferences for insert
to authenticated
with check (user_id = auth.uid());

create policy "user_preferences_update_own"
on public.user_preferences for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "user_preferences_delete_own"
on public.user_preferences for delete
to authenticated
using (user_id = auth.uid());
