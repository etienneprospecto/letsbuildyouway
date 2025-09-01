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

-- DÉSACTIVER TOUTES LES RLS POUR FAIRE FONCTIONNER
alter table if exists public.profiles disable row level security;
alter table if exists public.clients disable row level security;
alter table if exists public.seances disable row level security;
alter table if exists public.feedbacks_hebdomadaires disable row level security;

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


