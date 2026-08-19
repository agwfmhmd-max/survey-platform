-- DEFAULT_SURVEY_QUESTIONS.sql
-- Ajout sécurisé des questions académiques de référence.
-- Ce script n'efface aucune question existante et ne modifie pas les réponses déjà enregistrées.
-- Exécuter une seule fois dans Supabase SQL Editor.

insert into public.survey_questions
  (survey_id, question_ar, question_fr, question_type, required, active, sort_order)
select
  s.id, v.ar, v.fr, v.typ, v.required, true, v.ord
from public.surveys s
cross join (
  values
    ('ما هو نشاطك الرئيسي؟','Quelle est votre activité principale ?','single_choice',true,1),
    ('ما هو نطاق نشاطك؟','Quelle est l’ampleur de votre activité ?','single_choice',true,2),
    ('هل سبق أن تعرضت لخسائر مرتبطة بالمخاطر المناخية؟','Avez-vous déjà subi des pertes liées aux risques climatiques ?','single_choice',true,3),
    ('ما الخطر المناخي الأكثر تأثيرًا على نشاطك؟','Quel risque climatique affecte le plus votre activité ?','single_choice',true,4),
    ('هل تعرف مفهوم التأمين البارامتري؟','Connaissez-vous le principe de l’assurance paramétrique ?','single_choice',true,5),
    ('هل تعتقد أن التأمين البارامتري يمكن أن يحد من آثار المخاطر المناخية؟','Pensez-vous que l’assurance paramétrique peut réduire les impacts des risques climatiques ?','single_choice',true,6),
    ('هل تعرضت خلال السنوات الأخيرة للجفاف أو نقص الأمطار بشكل مؤثر على نشاطك؟','Votre activité a-t-elle été affectée récemment par la sécheresse ou une faible pluviométrie ?','single_choice',true,7),
    ('هل تعتقد أن التعويض السريع المبني على مؤشر مناخي سيكون مفيدًا لك؟','Une indemnisation rapide basée sur un indice climatique vous serait-elle utile ?','single_choice',true,8),
    ('ما العامل الأكثر أهمية عند اختيار التأمين البارامتري؟','Quel facteur serait le plus important dans le choix d’une assurance paramétrique ?','single_choice',true,9),
    ('ما مستوى ثقتك في شركات التأمين لتقديم هذا النوع من المنتجات؟','Quel est votre niveau de confiance envers les assureurs pour proposer ce type de produit ?','single_choice',true,10),
    ('هل ستكون مستعدًا للاشتراك في تأمين بارامتري مناسب لنشاطك؟','Seriez-vous prêt à souscrire une assurance paramétrique adaptée à votre activité ?','single_choice',true,11),
    ('ما المبلغ الذي تعتبره مناسبًا كقسط تأمين دوري مقابل هذه التغطية؟','Quel niveau de prime périodique vous semblerait acceptable pour cette couverture ?','single_choice',false,12),
    ('هل تعتقد أن الدولة أو الجهات الداعمة يجب أن تساهم في دعم أقساط هذا النوع من التأمين؟','L’État ou les partenaires de développement devraient-ils contribuer au soutien des primes de ce type d’assurance ?','single_choice',true,13),
    ('ما اقتراحك أو ملاحظتك حول تطوير التأمين ضد المخاطر المناخية في موريتانيا؟','Quelle est votre suggestion ou remarque pour développer l’assurance contre les risques climatiques en Mauritanie ?','text',false,14)
) as v(ar,fr,typ,required,ord)
where s.slug = 'assurance-parametrique-2026'
  and s.active = true
  and not exists (
    select 1
    from public.survey_questions q
    where q.survey_id = s.id
      and lower(trim(q.question_fr)) = lower(trim(v.fr))
  );

insert into public.survey_options
  (question_id, label_ar, label_fr, value, sort_order)
select q.id, v.ar, v.fr, v.val, v.ord
from public.survey_questions q
join (
  values
    ('Quelle est votre activité principale ?','الزراعة','Agriculture','agriculture',1),
    ('Quelle est votre activité principale ?','تربية المواشي','Élevage','elevage',2),
    ('Quelle est votre activité principale ?','الزراعة وتربية المواشي','Agriculture et élevage','agri_elevage',3),
    ('Quelle est votre activité principale ?','نشاط آخر','Autre activité','autre',4),

    ('Quelle est l’ampleur de votre activité ?','صغير','Petite','petite',1),
    ('Quelle est l’ampleur de votre activité ?','متوسط','Moyenne','moyenne',2),
    ('Quelle est l’ampleur de votre activité ?','كبير','Grande','grande',3),

    ('Avez-vous déjà subi des pertes liées aux risques climatiques ?','نعم','Oui','oui',1),
    ('Avez-vous déjà subi des pertes liées aux risques climatiques ?','لا','Non','non',2),

    ('Quel risque climatique affecte le plus votre activité ?','الجفاف','Sécheresse','secheresse',1),
    ('Quel risque climatique affecte le plus votre activité ?','الفيضانات','Inondations','inondations',2),
    ('Quel risque climatique affecte le plus votre activité ?','موجات الحرارة','Vagues de chaleur','chaleur',3),
    ('Quel risque climatique affecte le plus votre activité ?','عدم انتظام الأمطار','Pluviométrie irrégulière','pluie_irreguliere',4),
    ('Quel risque climatique affecte le plus votre activité ?','آخر','Autre','autre',5),

    ('Connaissez-vous le principe de l’assurance paramétrique ?','نعم، أعرفه','Oui, je le connais','oui',1),
    ('Connaissez-vous le principe de l’assurance paramétrique ?','سمعت عنه فقط','J’en ai seulement entendu parler','entendu',2),
    ('Connaissez-vous le principe de l’assurance paramétrique ?','لا','Non','non',3),

    ('Pensez-vous que l’assurance paramétrique peut réduire les impacts des risques climatiques ?','نعم','Oui','oui',1),
    ('Pensez-vous que l’assurance paramétrique peut réduire les impacts des risques climatiques ?','ربما','Peut-être','peut_etre',2),
    ('Pensez-vous que l’assurance paramétrique peut réduire les impacts des risques climatiques ?','لا','Non','non',3),

    ('Votre activité a-t-elle été affectée récemment par la sécheresse ou une faible pluviométrie ?','نعم','Oui','oui',1),
    ('Votre activité a-t-elle été affectée récemment par la sécheresse ou une faible pluviométrie ?','لا','Non','non',2),

    ('Une indemnisation rapide basée sur un indice climatique vous serait-elle utile ?','مفيد جدًا','Très utile','tres_utile',1),
    ('Une indemnisation rapide basée sur un indice climatique vous serait-elle utile ?','مفيد','Utile','utile',2),
    ('Une indemnisation rapide basée sur un indice climatique vous serait-elle utile ?','قليل الفائدة','Peu utile','peu_utile',3),

    ('Quel facteur serait le plus important dans le choix d’une assurance paramétrique ?','سعر القسط','Le prix de la prime','prix',1),
    ('Quel facteur serait le plus important dans le choix d’une assurance paramétrique ?','سرعة التعويض','La rapidité de l’indemnisation','rapidite',2),
    ('Quel facteur serait le plus important dans le choix d’une assurance paramétrique ?','وضوح المؤشر المناخي','La clarté de l’indice climatique','indice',3),
    ('Quel facteur serait le plus important dans le choix d’une assurance paramétrique ?','الثقة في شركة التأمين','La confiance envers l’assureur','confiance',4),

    ('Quel est votre niveau de confiance envers les assureurs pour proposer ce type de produit ?','مرتفع','Élevé','eleve',1),
    ('Quel est votre niveau de confiance envers les assureurs pour proposer ce type de produit ?','متوسط','Moyen','moyen',2),
    ('Quel est votre niveau de confiance envers les assureurs pour proposer ce type de produit ?','ضعيف','Faible','faible',3),

    ('Seriez-vous prêt à souscrire une assurance paramétrique adaptée à votre activité ?','نعم','Oui','oui',1),
    ('Seriez-vous prêt à souscrire une assurance paramétrique adaptée à votre activité ?','ربما','Peut-être','peut_etre',2),
    ('Seriez-vous prêt à souscrire une assurance paramétrique adaptée à votre activité ?','لا','Non','non',3),

    ('Quel niveau de prime périodique vous semblerait acceptable pour cette couverture ?','منخفض جدًا','Très faible','tres_faible',1),
    ('Quel niveau de prime périodique vous semblerait acceptable pour cette couverture ?','منخفض','Faible','faible',2),
    ('Quel niveau de prime périodique vous semblerait acceptable pour cette couverture ?','متوسط','Moyen','moyen',3),
    ('Quel niveau de prime périodique vous semblerait acceptable pour cette couverture ?','مرتفع','Élevé','eleve',4),

    ('L’État ou les partenaires de développement devraient-ils contribuer au soutien des primes de ce type d’assurance ?','نعم','Oui','oui',1),
    ('L’État ou les partenaires de développement devraient-ils contribuer au soutien des primes de ce type d’assurance ?','ربما','Peut-être','peut_etre',2),
    ('L’État ou les partenaires de développement devraient-ils contribuer au soutien des primes de ce type d’assurance ?','لا','Non','non',3)
) as v(qfr, ar, fr, val, ord)
  on q.question_fr = v.qfr
where q.question_type = 'single_choice'
  and not exists (
    select 1 from public.survey_options x where x.question_id = q.id
  );
