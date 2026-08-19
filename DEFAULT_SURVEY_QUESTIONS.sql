-- Questions par défaut — à exécuter une seule fois
-- N'efface aucune question existante. Les questions sont ensuite modifiables depuis le panneau admin.

insert into public.survey_questions (survey_id,question_ar,question_fr,question_type,required,active,sort_order)
select s.id,v.ar,v.fr,v.typ,true,true,v.ord
from public.surveys s
cross join (values
('كم عمرك؟','Quel âge as-tu ?','number',1),
('هل تعمل في قطاع الزراعة؟','Travaillez-vous dans le secteur agricole ?','single_choice',2),
('هل تعمل في قطاع تربية المواشي؟','Travaillez-vous dans le secteur de l’élevage ?','single_choice',3),
('هل تعرضت لخسائر مرتبطة بالمناخ خلال السنوات الأخيرة؟','Avez-vous subi des pertes liées au climat ces dernières années ?','single_choice',4),
('ما الخطر المناخي الأكثر تأثيرًا عليك؟','Quel risque climatique vous affecte le plus ?','single_choice',5),
('هل تعرف مفهوم التأمين البارامتري؟','Connaissez-vous le principe de l’assurance paramétrique ?','single_choice',6),
('هل ترى أن التأمين البارامتري يمكن أن يساعد في الحد من آثار المخاطر المناخية؟','Pensez-vous que l’assurance paramétrique peut aider à réduire les impacts des risques climatiques ?','single_choice',7),
('هل ستكون مستعدًا للاشتراك في تأمين بارامتري مناسب لقطاعك؟','Seriez-vous prêt à souscrire une assurance paramétrique adaptée à votre secteur ?','single_choice',8),
('ما مستوى ثقتك في شركات التأمين لتقديم هذا النوع من التغطية؟','Quel est votre niveau de confiance envers les assureurs pour proposer ce type de couverture ?','single_choice',9),
('ما اقتراحك لإنجاح التأمين البارامتري في موريتانيا؟','Quelle est votre suggestion pour réussir l’assurance paramétrique en Mauritanie ?','text',10)
) v(ar,fr,typ,ord) on true
where s.slug='assurance-parametrique-2026' and s.active=true
and not exists (select 1 from public.survey_questions q where q.survey_id=s.id and q.question_fr=v.fr);

insert into public.survey_options (question_id,label_ar,label_fr,value,sort_order)
select q.id,o.ar,o.fr,o.val,o.ord
from public.survey_questions q
join (values
('Travaillez-vous dans le secteur agricole ?','Oui','Oui','yes',1),('Travaillez-vous dans le secteur agricole ?','Non','Non','no',2),
('Travaillez-vous dans le secteur de l’élevage ?','Oui','Oui','yes',1),('Travaillez-vous dans le secteur de l’élevage ?','Non','Non','no',2),
('Avez-vous subi des pertes liées au climat ces dernières années ?','Oui','Oui','yes',1),('Avez-vous subi des pertes liées au climat ces dernières années ?','Non','Non','no',2),
('Quel risque climatique vous affecte le plus ?','الجفاف','Sécheresse','drought',1),('Quel risque climatique vous affecte le plus ?','الفيضانات','Inondations','flood',2),('Quel risque climatique vous affecte le plus ?','الحرارة الشديدة','Chaleur extrême','heat',3),('Quel risque climatique vous affecte le plus ?','قلة الأمطار','Faible pluviométrie','rain',4),
('Connaissez-vous le principe de l’assurance paramétrique ?','نعم','Oui','yes',1),('Connaissez-vous le principe de l’assurance paramétrique ?','لا','Non','no',2),
('Pensez-vous que l’assurance paramétrique peut aider à réduire les impacts des risques climatiques ?','نعم','Oui','yes',1),('Pensez-vous que l’assurance paramétrique peut aider à réduire les impacts des risques climatiques ?','لا','Non','no',2),('Pensez-vous que l’assurance paramétrique peut aider à réduire les impacts des risques climatiques ?','لا أعرف','Je ne sais pas','unknown',3),
('Seriez-vous prêt à souscrire une assurance paramétrique adaptée à votre secteur ?','نعم','Oui','yes',1),('Seriez-vous prêt à souscrire une assurance paramétrique adaptée à votre secteur ?','لا','Non','no',2),('Seriez-vous prêt à souscrire une assurance paramétrique adaptée à votre secteur ?','Peut-être','Peut-être','maybe',3),
('Quel est votre niveau de confiance envers les assureurs pour proposer ce type de couverture ?','مرتفع','Élevé','high',1),('Quel est votre niveau de confiance envers les assureurs pour proposer ce type de couverture ?','متوسط','Moyen','medium',2),('Quel est votre niveau de confiance envers les assureurs pour proposer ce type de couverture ?','ضعيف','Faible','low',3)
) o(qfr,ar,fr,val,ord) on q.question_fr=o.qfr
where q.question_type='single_choice' and not exists (select 1 from public.survey_options x where x.question_id=q.id);
