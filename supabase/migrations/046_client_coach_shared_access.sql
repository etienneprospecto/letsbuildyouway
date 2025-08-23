-- Coach-client relation table
create table if not exists coach_client_relations (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid references auth.users(id) on delete cascade,
  client_id uuid references auth.users(id) on delete cascade,
  coach_email text,
  client_email text,
  relation_active boolean default true,
  created_at timestamp with time zone default now(),
  unique (coach_id, client_id)
);

create index if not exists idx_ccr_coach_id on coach_client_relations(coach_id);
create index if not exists idx_ccr_client_id on coach_client_relations(client_id);

-- Link clients to auth.users
alter table if exists public.clients
  add column if not exists user_id uuid references auth.users(id);

-- RLS: clients shared access (coach or client)
alter table if exists public.clients enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'clients' and policyname = 'Coaches can access their clients data'
  ) then
    create policy "Coaches can access their clients data" on public.clients
      for all using (
        coach_id = auth.uid() or user_id = auth.uid()
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'clients' and policyname = 'Clients can access their own data'
  ) then
    create policy "Clients can access their own data" on public.clients
      for all using (
        user_id = auth.uid()
      );
  end if;
end $$;

-- RLS: seances shared access
alter table if exists public.seances enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'seances' and policyname = 'Coach and client shared access on seances'
  ) then
    create policy "Coach and client shared access on seances" on public.seances
      for all using (
        client_id in (
          select c.id from public.clients c
          where c.coach_id = auth.uid() or c.user_id = auth.uid()
        )
      );
  end if;
end $$;

-- RLS: feedbacks hebdomadaires shared access
alter table if exists public.weekly_feedbacks enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'weekly_feedbacks' and policyname = 'Shared access feedbacks'
  ) then
    create policy "Shared access feedbacks" on public.weekly_feedbacks
      for all using (
        client_id in (
          select c.id from public.clients c
          where c.coach_id = auth.uid() or c.user_id = auth.uid()
        )
      );
  end if;
end $$;

-- Seed coach-client relation if both users exist
insert into coach_client_relations (coach_id, client_id, coach_email, client_email)
select coach.id, client.id, coach.email, client.email
from auth.users coach, auth.users client
where coach.email = 'etienne.guimbard@gmail.com'
  and client.email = 'paulfst.business@gmail.com'
  and not exists (
    select 1 from coach_client_relations r
    where r.coach_id = coach.id and r.client_id = client.id
  );


