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

-- ============================================================
-- Competições — desafios entre amigos com código de convite
-- ============================================================
create extension if not exists pgcrypto;

create table if not exists public.desafios (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  nome text not null,
  tipo text not null check (tipo in ('diversao', 'moedas', 'pix')),
  valor numeric not null default 0,
  max_participantes int not null default 2 check (max_participantes between 2 and 10),
  dias int not null default 30,
  status text not null default 'aguardando' check (status in ('aguardando', 'ativo', 'finalizado')),
  criado_por uuid not null references auth.users(id) on delete cascade,
  criado_em timestamptz not null default now()
);

create table if not exists public.desafio_participantes (
  id bigint generated always as identity primary key,
  desafio_id uuid not null references public.desafios(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null default '',
  pago boolean not null default false,
  pontos int not null default 0,
  entrou_em timestamptz not null default now(),
  unique (desafio_id, user_id)
);

create index if not exists idx_desafios_codigo on public.desafios (codigo);
create index if not exists idx_desafio_participantes_desafio on public.desafio_participantes (desafio_id);

alter table public.desafios enable row level security;
alter table public.desafio_participantes enable row level security;

drop policy if exists "desafios_select_all" on public.desafios;
create policy "desafios_select_all"
  on public.desafios for select to authenticated using (true);

drop policy if exists "desafios_insert_own" on public.desafios;
create policy "desafios_insert_own"
  on public.desafios for insert to authenticated with check (auth.uid() = criado_por);

drop policy if exists "desafios_update_creator" on public.desafios;
create policy "desafios_update_creator"
  on public.desafios for update to authenticated using (auth.uid() = criado_por);

drop policy if exists "participantes_select_all" on public.desafio_participantes;
create policy "participantes_select_all"
  on public.desafio_participantes for select to authenticated using (true);

drop policy if exists "participantes_insert_own" on public.desafio_participantes;
create policy "participantes_insert_own"
  on public.desafio_participantes for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "participantes_update_own" on public.desafio_participantes;
create policy "participantes_update_own"
  on public.desafio_participantes for update to authenticated using (auth.uid() = user_id);

-- Trava de capacidade: nunca deixa entrar além do limite definido na criação
create or replace function public.checar_capacidade_desafio()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  max_p int;
  atual int;
begin
  select max_participantes into max_p from public.desafios where id = new.desafio_id;
  select count(*) into atual from public.desafio_participantes where desafio_id = new.desafio_id;
  if atual >= max_p then
    raise exception 'desafio_completo';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_checar_capacidade on public.desafio_participantes;
create trigger trg_checar_capacidade
  before insert on public.desafio_participantes
  for each row execute function public.checar_capacidade_desafio();

-- Quando o último participante entra (e todos que precisam pagar já pagaram), inicia o desafio
create or replace function public.atualizar_status_desafio()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  d record;
  atual int;
  pendentes int;
begin
  select * into d from public.desafios where id = new.desafio_id;
  select count(*) into atual from public.desafio_participantes where desafio_id = new.desafio_id;
  select count(*) into pendentes from public.desafio_participantes where desafio_id = new.desafio_id and pago = false;
  if d.status = 'aguardando' and atual >= d.max_participantes and (d.tipo <> 'pix' or pendentes = 0) then
    update public.desafios set status = 'ativo' where id = new.desafio_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_status_desafio on public.desafio_participantes;
create trigger trg_status_desafio
  after insert on public.desafio_participantes
  for each row execute function public.atualizar_status_desafio();
