-- ============================================================
-- MediMind AI — Initial Schema Migration
-- Run this in Supabase SQL Editor, or via `supabase db push`
-- ============================================================

-- Enable required extensions
create extension if not exists vector;
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Public profile mirror of auth.users.
-- Supabase Auth already manages the real user table (auth.users);
-- this table holds app-specific profile data and is kept in sync
-- via a trigger (see below).
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  file_type text not null check (file_type in ('pdf', 'docx', 'txt')),
  file_size_bytes bigint,
  status text not null default 'processing' check (status in ('processing', 'ready', 'failed')),
  uploaded_at timestamptz not null default now()
);

create table if not exists public.document_chunks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  chunk_text text not null,
  chunk_index int not null default 0,
  embedding vector(768), -- text-embedding-004 dimension
  created_at timestamptz not null default now()
);

-- Centralized, admin-seeded knowledge base — readable by all
-- authenticated users, writable only by the service role.
create table if not exists public.global_medical_dataset (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  category text,
  chunk_text text not null,
  embedding vector(768),
  created_at timestamptz not null default now()
);

create table if not exists public.chat_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  question text not null,
  answer text not null,
  source_document_ids uuid[] default '{}',
  created_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists idx_documents_user_id on public.documents(user_id);
create index if not exists idx_document_chunks_user_id on public.document_chunks(user_id);
create index if not exists idx_document_chunks_document_id on public.document_chunks(document_id);
create index if not exists idx_chat_history_user_id on public.chat_history(user_id);

-- Vector indexes (IVFFlat) for fast approximate nearest-neighbor search.
-- `lists` is a tuning parameter — 100 is a reasonable default for
-- small-to-medium datasets; increase as row counts grow.
create index if not exists idx_document_chunks_embedding
  on public.document_chunks using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create index if not exists idx_global_dataset_embedding
  on public.global_medical_dataset using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY — CRITICAL FOR MULTI-TENANT ISOLATION
-- ============================================================
-- Every user-owned table is locked down so a user can only ever
-- read/write rows where user_id = auth.uid(). This is enforced
-- at the database layer, not just in application code, so even
-- a bug in API logic cannot leak one user's data to another.

alter table public.users enable row level security;
alter table public.documents enable row level security;
alter table public.document_chunks enable row level security;
alter table public.global_medical_dataset enable row level security;
alter table public.chat_history enable row level security;

-- users: a person can read/update only their own profile row
drop policy if exists "users_select_own" on public.users;
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

-- documents: full CRUD restricted to owner
drop policy if exists "documents_select_own" on public.documents;
create policy "documents_select_own" on public.documents
  for select using (auth.uid() = user_id);

drop policy if exists "documents_insert_own" on public.documents;
create policy "documents_insert_own" on public.documents
  for insert with check (auth.uid() = user_id);

drop policy if exists "documents_update_own" on public.documents;
create policy "documents_update_own" on public.documents
  for update using (auth.uid() = user_id);

drop policy if exists "documents_delete_own" on public.documents;
create policy "documents_delete_own" on public.documents
  for delete using (auth.uid() = user_id);

-- document_chunks: full CRUD restricted to owner
drop policy if exists "chunks_select_own" on public.document_chunks;
create policy "chunks_select_own" on public.document_chunks
  for select using (auth.uid() = user_id);

drop policy if exists "chunks_insert_own" on public.document_chunks;
create policy "chunks_insert_own" on public.document_chunks
  for insert with check (auth.uid() = user_id);

drop policy if exists "chunks_delete_own" on public.document_chunks;
create policy "chunks_delete_own" on public.document_chunks
  for delete using (auth.uid() = user_id);

-- global_medical_dataset: every authenticated user can READ,
-- nobody can write via the client (only service-role seed script can)
drop policy if exists "global_dataset_select_all" on public.global_medical_dataset;
create policy "global_dataset_select_all" on public.global_medical_dataset
  for select using (auth.role() = 'authenticated');

-- chat_history: full CRUD restricted to owner
drop policy if exists "chat_history_select_own" on public.chat_history;
create policy "chat_history_select_own" on public.chat_history
  for select using (auth.uid() = user_id);

drop policy if exists "chat_history_insert_own" on public.chat_history;
create policy "chat_history_insert_own" on public.chat_history
  for insert with check (auth.uid() = user_id);

drop policy if exists "chat_history_delete_own" on public.chat_history;
create policy "chat_history_delete_own" on public.chat_history
  for delete using (auth.uid() = user_id);

-- ============================================================
-- RPC FUNCTIONS FOR VECTOR SEARCH
-- ============================================================
-- These wrap the pgvector cosine-distance search and, critically,
-- filter document_chunks by the requesting user's id server-side,
-- so a malformed query can never cross tenant boundaries.

create or replace function public.match_user_document_chunks(
  query_embedding vector(768),
  match_user_id uuid,
  match_count int default 5,
  match_threshold float default 0.3
)
returns table (
  id uuid,
  document_id uuid,
  chunk_text text,
  similarity float
)
language sql stable
security definer set search_path = public
as $$
  select
    document_chunks.id,
    document_chunks.document_id,
    document_chunks.chunk_text,
    1 - (document_chunks.embedding <=> query_embedding) as similarity
  from document_chunks
  where document_chunks.user_id = match_user_id
    and 1 - (document_chunks.embedding <=> query_embedding) > match_threshold
  order by document_chunks.embedding <=> query_embedding
  limit match_count;
$$;

create or replace function public.match_global_medical_chunks(
  query_embedding vector(768),
  match_count int default 5,
  match_threshold float default 0.3
)
returns table (
  id uuid,
  title text,
  category text,
  chunk_text text,
  similarity float
)
language sql stable
security definer set search_path = public
as $$
  select
    global_medical_dataset.id,
    global_medical_dataset.title,
    global_medical_dataset.category,
    global_medical_dataset.chunk_text,
    1 - (global_medical_dataset.embedding <=> query_embedding) as similarity
  from global_medical_dataset
  where 1 - (global_medical_dataset.embedding <=> query_embedding) > match_threshold
  order by global_medical_dataset.embedding <=> query_embedding
  limit match_count;
$$;

-- ============================================================
-- STORAGE BUCKET (run once — also creatable via Dashboard)
-- ============================================================
-- This sets up the private bucket where uploaded medical files live.
-- Files are scoped by a /{user_id}/{filename} path convention, and
-- the storage policies below enforce that a user can only access
-- objects inside their own folder prefix.

insert into storage.buckets (id, name, public)
values ('medical-documents', 'medical-documents', false)
on conflict (id) do nothing;

drop policy if exists "storage_select_own_folder" on storage.objects;
create policy "storage_select_own_folder" on storage.objects
  for select using (
    bucket_id = 'medical-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "storage_insert_own_folder" on storage.objects;
create policy "storage_insert_own_folder" on storage.objects
  for insert with check (
    bucket_id = 'medical-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "storage_delete_own_folder" on storage.objects;
create policy "storage_delete_own_folder" on storage.objects
  for delete using (
    bucket_id = 'medical-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
