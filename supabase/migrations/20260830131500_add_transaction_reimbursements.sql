alter table public.transactions
  add column if not exists is_reimbursement boolean not null default false,
  add column if not exists reimburses_transaction_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'transactions_reimburses_transaction_id_fkey'
  ) then
    alter table public.transactions
      add constraint transactions_reimburses_transaction_id_fkey
      foreign key (reimburses_transaction_id)
      references public.transactions(id)
      on delete set null;
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'transactions_reimbursement_type_check'
  ) then
    alter table public.transactions
      add constraint transactions_reimbursement_type_check
      check (
        (is_reimbursement = false and reimburses_transaction_id is null)
        or type = 'income'
      );
  end if;
end;
$$;

create index if not exists transactions_reimburses_transaction_id_idx
  on public.transactions(reimburses_transaction_id);
