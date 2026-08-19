-- اختياري: شغّل هذا الملف مرة واحدة لإتاحة إدارة أعضاء فريق المشروع والصور.
-- لا يحذف أي جدول أو بيانات موجودة.

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  name_ar text not null,
  name_fr text not null,
  role_ar text,
  role_fr text,
  image_url text,
  sort_order integer not null default 1,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.team_members enable row level security;

create policy "team_members_public_read_active"
on public.team_members for select
to anon, authenticated
using (active = true);

create policy "team_members_admin_read_all"
on public.team_members for select
to authenticated
using (exists (select 1 from public.admins a where a.id = auth.uid()));

create policy "team_members_admin_insert"
on public.team_members for insert
to authenticated
with check (exists (select 1 from public.admins a where a.id = auth.uid()));

create policy "team_members_admin_update"
on public.team_members for update
to authenticated
using (exists (select 1 from public.admins a where a.id = auth.uid()))
with check (exists (select 1 from public.admins a where a.id = auth.uid()));

create unique index if not exists team_members_name_fr_unique
on public.team_members (lower(trim(name_fr)));

create unique index if not exists team_members_name_ar_unique
on public.team_members (lower(trim(name_ar)));

insert into storage.buckets (id, name, public)
values ('team-members', 'team-members', true)
on conflict (id) do update set public = true;

create policy "team_members_images_public_read"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'team-members');

create policy "team_members_images_admin_insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'team-members'
  and exists (select 1 from public.admins a where a.id = auth.uid())
);

create policy "team_members_images_admin_update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'team-members'
  and exists (select 1 from public.admins a where a.id = auth.uid())
)
with check (
  bucket_id = 'team-members'
  and exists (select 1 from public.admins a where a.id = auth.uid())
);
