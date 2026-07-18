-- ============================================================
-- EVO — Saúde Gamificada · Schema Supabase
-- Cole este arquivo inteiro no SQL Editor do Supabase e execute.
-- ============================================================

-- Perfil público do jogador (alimenta ranking global)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null default '',
  xp int not null default 0,
  nivel int not null default 1,
  moedas int not null default 0,
  health_score int not null default 0,
  peso_atual numeric,
  imc numeric,
  plano text not null default 'free' check (plano in ('free', 'premium')),
  jornada_inicio date,
  estagio int not null default 1 check (estagio between 1 and 5),
  streak int not null default 0,
  atualizado_em timestamptz not null default now()
);

-- Check-ins diários (1 por dia por usuário)
create table if not exists public.daily_checkins (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  data date not null,
  sono_horas numeric,
  sono_qualidade int,
  agua_ml int,
  exercicio_min int,
  exercicio_tipo text,
  refeicoes int,
  frutas boolean,
  verduras boolean,
  acucar boolean,
  gordura boolean,
  humor int,
  estresse int,
  score int not null default 0,
  criado_em timestamptz not null default now(),
  unique (user_id, data)
);

create index if not exists idx_checkins_user_data on public.daily_checkins (user_id, data desc);
create index if not exists idx_profiles_xp on public.profiles (xp desc);

-- ============================================================
-- Row Level Security — usuário só escreve o que é dele;
-- perfis são legíveis por autenticados (necessário p/ ranking)
-- ============================================================
alter table public.profiles enable row level security;
alter table public.daily_checkins enable row level security;

drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all"
  on public.profiles for select to authenticated using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert to authenticated with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update to authenticated using (auth.uid() = id);

drop policy if exists "checkins_own" on public.daily_checkins;
create policy "checkins_own"
  on public.daily_checkins for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Cria o perfil automaticamente no cadastro
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nome)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nome', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
