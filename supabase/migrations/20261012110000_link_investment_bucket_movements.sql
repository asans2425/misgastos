alter table public.bucket_movements
  add column if not exists transaction_id uuid;

alter table public.bucket_movements
  drop constraint if exists bucket_movements_transaction_id_fkey;

alter table public.bucket_movements
  add constraint bucket_movements_transaction_id_fkey
  foreign key (transaction_id)
  references public.transactions(id)
  on delete cascade;

create unique index if not exists bucket_movements_transaction_id_unique_idx
  on public.bucket_movements(transaction_id)
  where transaction_id is not null;

create index if not exists bucket_movements_transaction_id_idx
  on public.bucket_movements(transaction_id);
