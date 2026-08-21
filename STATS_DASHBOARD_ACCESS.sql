-- إتاحة إحصائيات المشاركين حسب التاريخ والساعة في لوحة المشرف.
-- هذا الملف آمن تمامًا:
--   • لا يحذف أي جدول أو سجل أو سياسة موجودة.
--   • لا يغيّر حالة Row Level Security الحالية (لا يتم تفعيلها أو تعطيلها هنا).
--   • يضيف فقط سياسة قراءة إضافية مخصّصة للمشرفين على جدول survey_responses،
--     تُستخدم لعرض توقيت اكتمال كل استبيان (created_at) دون أي بيانات شخصية.
-- شغّله مرة واحدة في Supabase بصلاحية مالك المشروع.

do $$
begin
  if to_regclass('public.survey_responses') is not null
     and not exists (
       select 1 from pg_policies
       where schemaname = 'public'
         and tablename = 'survey_responses'
         and policyname = 'survey_responses_admin_read_all'
     ) then
    create policy "survey_responses_admin_read_all"
    on public.survey_responses for select
    to authenticated
    using (exists (select 1 from public.admins a where a.id = auth.uid()));
  end if;
end $$;

-- ملاحظة: إذا كانت RLS معطّلة أصلاً على هذا الجدول، فالمشرف يستطيع القراءة
-- بالفعل دون الحاجة لهذه السياسة، وتبقى غير مفعّلة بلا أي أثر جانبي.
