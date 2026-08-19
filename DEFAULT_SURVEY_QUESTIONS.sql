-- Questions académiques par défaut — à exécuter une seule fois.
-- Ce script n’efface aucune donnée existante. Les questions et options
-- déjà présentes sont ignorées et restent modifiables depuis l’espace admin.

insert into public.survey_questions
  (survey_id, question_ar, question_fr, question_type, required, active, sort_order)
select
  s.id, seed.question_ar, seed.question_fr, seed.question_type, seed.required, true,
  coalesce((select max(existing.sort_order) from public.survey_questions existing where existing.survey_id = s.id), 0) + seed.sort_order
from public.surveys s
cross join (values
  ('كم عمرك؟', 'Quel âge avez-vous ?', 'number', true, 1),
  ('ما هو قطاع نشاطك الرئيسي؟', 'Quel est votre secteur d’activité principal ?', 'single_choice', true, 2),
  ('في أي ولاية تمارس نشاطك؟', 'Dans quelle wilaya exercez-vous votre activité ?', 'text', true, 3),
  ('هل تعرضت لخسائر بسبب مخاطر مناخية خلال السنوات الأخيرة؟', 'Avez-vous subi des pertes liées à des risques climatiques ces dernières années ?', 'single_choice', true, 4),
  ('ما الخطر المناخي الأكثر تأثيرًا على نشاطك؟', 'Quel risque climatique affecte le plus votre activité ?', 'single_choice', true, 5),
  ('ما مدى تكرار فترات الجفاف في منطقتك؟', 'À quelle fréquence les périodes de sécheresse surviennent-elles dans votre zone ?', 'single_choice', true, 6),
  ('هل تؤثر الأمطار غير المنتظمة على إنتاجك أو دخلك؟', 'La pluviométrie irrégulière affecte-t-elle votre production ou vos revenus ?', 'single_choice', true, 7),
  ('ما طبيعة الخسارة الاقتصادية الأكثر شيوعًا لديك؟', 'Quelle est la perte économique la plus fréquente dans votre activité ?', 'multiple_choice', true, 8),
  ('هل تعرف مفهوم التأمين البارامتري؟', 'Connaissez-vous le principe de l’assurance paramétrique ?', 'single_choice', true, 9),
  ('هل تعتقد أن التأمين البارامتري يمكن أن يحمي نشاطك من المخاطر المناخية؟', 'Pensez-vous que l’assurance paramétrique peut protéger votre activité contre les risques climatiques ?', 'single_choice', true, 10),
  ('هل ستكون مستعدًا للاشتراك في تأمين بارامتري مناسب لنشاطك؟', 'Seriez-vous prêt à souscrire une assurance paramétrique adaptée à votre activité ?', 'single_choice', true, 11),
  ('ما مدى قدرتك على دفع قسط تأميني مناسب؟', 'Quelle serait votre capacité à payer une prime adaptée ?', 'single_choice', true, 12),
  ('ما العامل الأكثر أهمية عند اختيار هذا النوع من التأمين؟', 'Quel facteur serait le plus important dans le choix de cette assurance ?', 'single_choice', true, 13),
  ('ما مستوى ثقتك في شركات التأمين لتقديم هذا المنتج؟', 'Quel est votre niveau de confiance envers les assureurs pour proposer ce produit ?', 'single_choice', true, 14),
  ('ما نوع الدعم الذي تحتاجه لتبني التأمين البارامتري؟', 'Quel type de soutien serait nécessaire pour adopter l’assurance paramétrique ?', 'multiple_choice', true, 15),
  ('ما اقتراحك أو ملاحظتك حول التأمين ضد المخاطر المناخية؟', 'Quelle est votre suggestion concernant l’assurance contre les risques climatiques ?', 'text', false, 16)
) as seed(question_ar, question_fr, question_type, required, sort_order) on true
where s.slug = 'assurance-parametrique-2026'
  and s.active = true
  and not exists (
    select 1 from public.survey_questions existing
    where existing.survey_id = s.id
      and lower(trim(existing.question_fr)) = lower(trim(seed.question_fr))
  );

insert into public.survey_options (question_id, label_ar, label_fr, value, sort_order)
select q.id, seed.label_ar, seed.label_fr, seed.value, seed.sort_order
from public.survey_questions q
join (values
  ('Quel est votre secteur d’activité principal ?', 'الزراعة', 'Agriculture', 'agriculture', 1),
  ('Quel est votre secteur d’activité principal ?', 'تربية المواشي', 'Élevage', 'elevage', 2),
  ('Quel est votre secteur d’activité principal ?', 'الزراعة وتربية المواشي', 'Agriculture et élevage', 'agriculture_elevage', 3),
  ('Quel est votre secteur d’activité principal ?', 'نشاط آخر', 'Autre activité', 'autre', 4),
  ('Avez-vous subi des pertes liées à des risques climatiques ces dernières années ?', 'نعم', 'Oui', 'oui', 1),
  ('Avez-vous subi des pertes liées à des risques climatiques ces dernières années ?', 'لا', 'Non', 'non', 2),
  ('Quel risque climatique affecte le plus votre activité ?', 'الجفاف', 'Sécheresse', 'secheresse', 1),
  ('Quel risque climatique affecte le plus votre activité ?', 'الأمطار غير المنتظمة', 'Pluviométrie irrégulière', 'pluviometrie', 2),
  ('Quel risque climatique affecte le plus votre activité ?', 'الفيضانات', 'Inondations', 'inondations', 3),
  ('Quel risque climatique affecte le plus votre activité ?', 'موجات الحرارة', 'Vagues de chaleur', 'chaleur', 4),
  ('Quel risque climatique affecte le plus votre activité ?', 'خطر آخر', 'Autre risque', 'autre', 5),
  ('À quelle fréquence les périodes de sécheresse surviennent-elles dans votre zone ?', 'نادرًا', 'Rarement', 'rarement', 1),
  ('À quelle fréquence les périodes de sécheresse surviennent-elles dans votre zone ?', 'أحيانًا', 'Parfois', 'parfois', 2),
  ('À quelle fréquence les périodes de sécheresse surviennent-elles dans votre zone ?', 'بشكل متكرر', 'Fréquemment', 'frequemment', 3),
  ('À quelle fréquence les périodes de sécheresse surviennent-elles dans votre zone ?', 'كل سنة تقريبًا', 'Presque chaque année', 'chaque_annee', 4),
  ('La pluviométrie irrégulière affecte-t-elle votre production ou vos revenus ?', 'بشكل كبير', 'Fortement', 'fortement', 1),
  ('La pluviométrie irrégulière affecte-t-elle votre production ou vos revenus ?', 'بشكل متوسط', 'Modérément', 'modere', 2),
  ('La pluviométrie irrégulière affecte-t-elle votre production ou vos revenus ?', 'بشكل ضعيف', 'Faiblement', 'faiblement', 3),
  ('La pluviométrie irrégulière affecte-t-elle votre production ou vos revenus ?', 'لا تؤثر', 'Pas du tout', 'aucun', 4),
  ('Quelle est la perte économique la plus fréquente dans votre activité ?', 'انخفاض الإنتاج', 'Baisse de production', 'baisse_production', 1),
  ('Quelle est la perte économique la plus fréquente dans votre activité ?', 'نفوق المواشي', 'Mortalité du bétail', 'mortalite', 2),
  ('Quelle est la perte économique la plus fréquente dans votre activité ?', 'ارتفاع تكاليف العلف أو المدخلات', 'Hausse du coût des intrants', 'cout_intrants', 3),
  ('Quelle est la perte économique la plus fréquente dans votre activité ?', 'فقدان الدخل', 'Perte de revenus', 'perte_revenus', 4),
  ('Connaissez-vous le principe de l’assurance paramétrique ?', 'نعم وأعرف فكرته', 'Oui, j’en connais le principe', 'oui_connu', 1),
  ('Connaissez-vous le principe de l’assurance paramétrique ?', 'سمعت عنه فقط', 'J’en ai seulement entendu parler', 'entendu', 2),
  ('Connaissez-vous le principe de l’assurance paramétrique ?', 'لا', 'Non', 'non', 3),
  ('Pensez-vous que l’assurance paramétrique peut protéger votre activité contre les risques climatiques ?', 'نعم', 'Oui', 'oui', 1),
  ('Pensez-vous que l’assurance paramétrique peut protéger votre activité contre les risques climatiques ?', 'ربما', 'Peut-être', 'peut_etre', 2),
  ('Pensez-vous que l’assurance paramétrique peut protéger votre activité contre les risques climatiques ?', 'لا أعرف', 'Je ne sais pas', 'inconnu', 3),
  ('Pensez-vous que l’assurance paramétrique peut protéger votre activité contre les risques climatiques ?', 'لا', 'Non', 'non', 4),
  ('Seriez-vous prêt à souscrire une assurance paramétrique adaptée à votre activité ?', 'نعم', 'Oui', 'oui', 1),
  ('Seriez-vous prêt à souscrire une assurance paramétrique adaptée à votre activité ?', 'ربما', 'Peut-être', 'peut_etre', 2),
  ('Seriez-vous prêt à souscrire une assurance paramétrique adaptée à votre activité ?', 'لا', 'Non', 'non', 3),
  ('Quelle serait votre capacité à payer une prime adaptée ?', 'ضعيفة', 'Faible', 'faible', 1),
  ('Quelle serait votre capacité à payer une prime adaptée ?', 'متوسطة', 'Moyenne', 'moyenne', 2),
  ('Quelle serait votre capacité à payer une prime adaptée ?', 'جيدة', 'Bonne', 'bonne', 3),
  ('Quelle serait votre capacité à payer une prime adaptée ?', 'تتوقف على السعر', 'Cela dépend du prix', 'depend_prix', 4),
  ('Quel facteur serait le plus important dans le choix de cette assurance ?', 'السعر', 'Le prix', 'prix', 1),
  ('Quel facteur serait le plus important dans le choix de cette assurance ?', 'سرعة التعويض', 'La rapidité de l’indemnisation', 'rapidite', 2),
  ('Quel facteur serait le plus important dans le choix de cette assurance ?', 'وضوح المؤشر المناخي', 'La clarté de l’indice climatique', 'indice', 3),
  ('Quel facteur serait le plus important dans le choix de cette assurance ?', 'الثقة في شركة التأمين', 'La confiance dans l’assureur', 'confiance', 4),
  ('Quel est votre niveau de confiance envers les assureurs pour proposer ce produit ?', 'مرتفع', 'Élevé', 'eleve', 1),
  ('Quel est votre niveau de confiance envers les assureurs pour proposer ce produit ?', 'متوسط', 'Moyen', 'moyen', 2),
  ('Quel est votre niveau de confiance envers les assureurs pour proposer ce produit ?', 'ضعيف', 'Faible', 'faible', 3),
  ('Quel type de soutien serait nécessaire pour adopter l’assurance paramétrique ?', 'التوعية والتكوين', 'Sensibilisation et formation', 'formation', 1),
  ('Quel type de soutien serait nécessaire pour adopter l’assurance paramétrique ?', 'دعم حكومي', 'Soutien public', 'soutien_public', 2),
  ('Quel type de soutien serait nécessaire pour adopter l’assurance paramétrique ?', 'قسط منخفض أو مدعوم', 'Prime réduite ou subventionnée', 'prime_subvention', 3),
  ('Quel type de soutien serait nécessaire pour adopter l’assurance paramétrique ?', 'إجراءات تعويض واضحة', 'Procédure d’indemnisation claire', 'procedure_claire', 4)
) as seed(question_fr, label_ar, label_fr, value, sort_order)
  on q.question_fr = seed.question_fr
where q.question_type in ('single_choice', 'multiple_choice')
  and not exists (
    select 1 from public.survey_options existing
    where existing.question_id = q.id
  );
