-- إصلاح آمن لمنصة الاستبيان.
-- هذا الملف لا يحذف أي جدول أو سجل موجود.
-- شغّله مرة واحدة في Supabase بصلاحية مالك المشروع.

-- 1) إنشاء جدول أعضاء الفريق إن لم يكن موجودًا، ثم إضافة الأعمدة الناقصة فقط.
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  name_ar text,
  name_fr text,
  role_ar text,
  role_fr text,
  image_url text,
  sort_order integer not null default 1,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.team_members add column if not exists name_ar text;
alter table public.team_members add column if not exists name_fr text;
alter table public.team_members add column if not exists role_ar text;
alter table public.team_members add column if not exists role_fr text;
alter table public.team_members add column if not exists image_url text;
alter table public.team_members add column if not exists sort_order integer not null default 1;
alter table public.team_members add column if not exists active boolean not null default true;
alter table public.team_members add column if not exists created_at timestamptz not null default now();
alter table public.team_members add column if not exists updated_at timestamptz not null default now();

alter table public.team_members enable row level security;

drop policy if exists "team_members_public_read_active" on public.team_members;
drop policy if exists "team_members_admin_read_all" on public.team_members;
drop policy if exists "team_members_admin_insert" on public.team_members;
drop policy if exists "team_members_admin_update" on public.team_members;

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

-- 2) جعل أسماء الفريق فريدة فقط عند وجود قيمة، دون تعديل البيانات القديمة.
create unique index if not exists team_members_name_fr_unique
on public.team_members (lower(trim(name_fr)))
where name_fr is not null and trim(name_fr) <> '';

create unique index if not exists team_members_name_ar_unique
on public.team_members (lower(trim(name_ar)))
where name_ar is not null and trim(name_ar) <> '';

-- 3) إنشاء مساحة الصور وسياساتها بشكل قابل لإعادة التشغيل.
insert into storage.buckets (id, name, public)
values ('team-members', 'team-members', true)
on conflict (id) do update set public = true;

drop policy if exists "team_members_images_public_read" on storage.objects;
drop policy if exists "team_members_images_admin_insert" on storage.objects;
drop policy if exists "team_members_images_admin_update" on storage.objects;

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

-- 4) حل تعارض حذف السؤال.
-- لا يحذف أي رد عند تشغيل هذا الملف؛ يفعّل الحذف المتسلسل فقط للمستقبل.
-- عند حذف سؤال من لوحة المشرف، تُحذف خياراته وإجاباته التابعة له تلقائيًا.
do $$
begin
  if to_regclass('public.survey_answers') is not null
     and to_regclass('public.survey_questions') is not null then
    alter table public.survey_answers
      drop constraint if exists survey_answers_question_id_fkey;

    alter table public.survey_answers
      add constraint survey_answers_question_id_fkey
      foreign key (question_id)
      references public.survey_questions(id)
      on delete cascade
      not valid;
  end if;

  if to_regclass('public.survey_options') is not null
     and to_regclass('public.survey_questions') is not null then
    alter table public.survey_options
      drop constraint if exists survey_options_question_id_fkey;

    alter table public.survey_options
      add constraint survey_options_question_id_fkey
      foreign key (question_id)
      references public.survey_questions(id)
      on delete cascade
      not valid;
  end if;
end $$;
