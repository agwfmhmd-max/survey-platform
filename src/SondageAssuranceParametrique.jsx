import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BarChart3, Check, CheckCircle2, ChevronLeft, ChevronRight, ClipboardList, CloudRain, Eye, EyeOff, Globe2, GripVertical, Info, LockKeyhole, LogOut, Pencil, Plus, RefreshCw, Save, ShieldCheck, Sprout, Trash2, TrendingUp, Users, X } from "lucide-react";
import { supabase } from "./lib/supabaseClient";

const COLORS = {
  navy: "#0b1e39",
  blue: "#1b4e8c",
  sky: "#4d8ac7",
  mist: "#eaf2fb",
  ivory: "#f6f8fb",
  white: "#ffffff",
  green: "#1d8b62",
  greenSoft: "#e6f6ee",
  gold: "#b68b3c",
  ink: "#182234",
  slate: "#5b687b",
  muted: "#8793a5",
  border: "#dce4ee",
  red: "#b53b42",
  redSoft: "#fff0f1",
};

const PIE_COLORS = [COLORS.blue, COLORS.sky, COLORS.gold, COLORS.green, "#8b78b8", "#d67b55"];
const SURVEY_SLUG = "assurance-parametrique-2026";
const ADMIN_TRIGGER_CLICKS = 5;
const ADMIN_TRIGGER_WINDOW_MS = 3000;

const T = {
  fr: {
    dir: "ltr",
    languageName: "Français",
    institute: "Institut Supérieur de Comptabilité et d’Administration des Entreprises (ISCAE)",
    kicker: "Projet de fin d’études · Banque & Assurance",
    title: "Enquête sur l’assurance paramétrique contre les risques climatiques en Mauritanie",
    subtitle: "Cette enquête fait partie d’une étude académique consacrée à la faisabilité d’un système d’assurance paramétrique pour les secteurs agricole et de l’élevage en Mauritanie.",
    badge: "Projet de fin d’études — Banque & Assurance",
    duration: "Durée estimée : 3 minutes",
    questionsCount: "questions",
    start: "Commencer le questionnaire",
    intro: "Votre expérience de terrain contribue à une meilleure compréhension des risques climatiques, des pertes économiques et des attentes en matière de couverture assurantielle.",
    anonymous: "Les réponses sont recueillies de manière anonyme et utilisées uniquement à des fins de recherche. Aucune information personnelle identifiable n’est demandée.",
    question: "Question",
    of: "sur",
    progress: "Progression",
    required: "Obligatoire",
    optional: "Facultatif",
    next: "Suivant",
    previous: "Précédent",
    submit: "Envoyer mes réponses",
    submitting: "Envoi en cours…",
    selected: "sélectionné",
    choose: "Sélectionnez une réponse",
    textPlaceholder: "Écrivez votre réponse ici…",
    numberPlaceholder: "Votre réponse numérique",
    requiredCurrent: "Merci de répondre à cette question obligatoire avant de continuer.",
    requiredAll: "Merci de répondre à toutes les questions obligatoires avant d’envoyer.",
    loading: "Chargement de l’enquête…",
    loadingResults: "Chargement des résultats…",
    retry: "Réessayer",
    errorLoad: "Une erreur est survenue lors du chargement de l’enquête.",
    errorSubmit: "Une erreur est survenue lors de l’envoi. Veuillez réessayer.",
    duplicate: "Vous avez déjà répondu à ce sondage.",
    thanksTitle: "Merci pour votre participation !",
    thanksText: "Votre réponse a été enregistrée avec succès et contribuera à cette étude académique.",
    backHome: "Retour à l’accueil",
    newResponse: "Répondre à nouveau",
    adminTitle: "Espace réservé à l’équipe du projet",
    emailLabel: "Adresse e-mail",
    passwordLabel: "Mot de passe",
    adminSubmit: "Se connecter",
    adminWrong: "Identifiants incorrects ou accès non autorisé.",
    adminBack: "Fermer",
    dashboard: "Tableau de bord",
    backSurvey: "Retour au sondage",
    signOut: "Se déconnecter",
    questions: "Questions",
    results: "Résultats",
    weather: "Météo",
    participants: "Participants",
    activeQuestions: "Questions actives",
    completion: "Taux de complétion",
    totalQuestions: "Questions au total",
    addQuestion: "Ajouter une question",
    editQuestion: "Modifier la question",
    readyQuestions: "Importer les questions académiques",
    save: "Enregistrer",
    add: "Ajouter",
    cancel: "Annuler",
    options: "Options de réponse",
    addOption: "Ajouter une option",
    questionType: "Type de question",
    singleChoice: "Choix unique",
    multipleChoice: "Choix multiples",
    text: "Réponse libre",
    number: "Nombre",
    active: "Active",
    inactive: "Inactive",
    delete: "Supprimer",
    disable: "Désactiver",
    enable: "Activer",
    moveUp: "Monter",
    moveDown: "Descendre",
    noQuestions: "Aucune question n’est encore configurée.",
    noResults: "Aucun résultat agrégé disponible.",
    noWeather: "Aucune région météo configurée.",
    addWeatherHint: "Les régions peuvent être ajoutées depuis Supabase sans modifier l’interface.",
    unknownError: "Une erreur est survenue.",
    footer: "Étude de faisabilité de l’assurance paramétrique contre les risques climatiques en Mauritanie · ISCAE",
    confirmDelete: "Supprimer définitivement cette question ? Si elle est déjà utilisée dans des réponses, elle sera désactivée à la place.",
    yes: "Oui",
    no: "Non",
    maybe: "Peut-être",
    other: "Autre",
  },
  ar: {
    dir: "rtl",
    languageName: "العربية",
    institute: "المعهد العالي للمحاسبة وإدارة المؤسسات",
    kicker: "مشروع تخرج · بنوك وتأمين",
    title: "استبيان حول التأمين البارامتري ضد المخاطر المناخية في موريتانيا",
    subtitle: "هذا الاستبيان جزء من دراسة أكاديمية حول إمكانية تطبيق نظام للتأمين البارامتري في قطاعي الزراعة وتربية المواشي في موريتانيا.",
    badge: "مشروع تخرج — بنوك وتأمين",
    duration: "المدة التقديرية: 3 دقائق",
    questionsCount: "أسئلة",
    start: "بدء الاستبيان",
    intro: "تساهم خبرتكم الميدانية في فهم المخاطر المناخية والخسائر الاقتصادية وتوقعات المستفيدين من التغطية التأمينية.",
    anonymous: "تُجمع الإجابات بشكل مجهول وتُستخدم لأغراض البحث العلمي فقط. لا نطلب أي معلومات شخصية مُعرِّفة.",
    question: "السؤال",
    of: "من",
    progress: "نسبة التقدم",
    required: "إجباري",
    optional: "اختياري",
    next: "التالي",
    previous: "السابق",
    submit: "إرسال إجاباتي",
    submitting: "جارٍ الإرسال…",
    selected: "محدد",
    choose: "اختر إجابة",
    textPlaceholder: "اكتب إجابتك هنا…",
    numberPlaceholder: "أدخل إجابة رقمية",
    requiredCurrent: "يرجى الإجابة عن هذا السؤال الإجباري قبل المتابعة.",
    requiredAll: "يرجى الإجابة عن جميع الأسئلة الإجبارية قبل الإرسال.",
    loading: "جارٍ تحميل الاستبيان…",
    loadingResults: "جارٍ تحميل النتائج…",
    retry: "إعادة المحاولة",
    errorLoad: "حدث خطأ أثناء تحميل الاستبيان.",
    errorSubmit: "حدث خطأ أثناء الإرسال. حاول مجددًا.",
    duplicate: "لقد أجبتم عن هذا الاستبيان من قبل.",
    thanksTitle: "شكرًا لمشاركتكم!",
    thanksText: "تم تسجيل إجابتكم بنجاح وستساهم في هذه الدراسة الأكاديمية.",
    backHome: "العودة إلى الصفحة الرئيسية",
    newResponse: "الإجابة مجددًا",
    adminTitle: "منطقة مخصصة لفريق المشروع",
    emailLabel: "البريد الإلكتروني",
    passwordLabel: "كلمة المرور",
    adminSubmit: "تسجيل الدخول",
    adminWrong: "بيانات الدخول غير صحيحة أو الوصول غير مصرح به.",
    adminBack: "إغلاق",
    dashboard: "لوحة المشرف",
    backSurvey: "العودة إلى الاستبيان",
    signOut: "تسجيل الخروج",
    questions: "الأسئلة",
    results: "النتائج",
    weather: "الطقس",
    participants: "المشاركون",
    activeQuestions: "الأسئلة النشطة",
    completion: "نسبة الإكمال",
    totalQuestions: "إجمالي الأسئلة",
    addQuestion: "إضافة سؤال",
    editQuestion: "تعديل السؤال",
    readyQuestions: "إدراج الأسئلة الأكاديمية الجاهزة",
    save: "حفظ",
    add: "إضافة",
    cancel: "إلغاء",
    options: "خيارات الإجابة",
    addOption: "إضافة خيار",
    questionType: "نوع السؤال",
    singleChoice: "اختيار واحد",
    multipleChoice: "اختيارات متعددة",
    text: "إجابة نصية",
    number: "رقم",
    active: "نشط",
    inactive: "غير نشط",
    delete: "حذف",
    disable: "تعطيل",
    enable: "تفعيل",
    moveUp: "تحريك للأعلى",
    moveDown: "تحريك للأسفل",
    noQuestions: "لا توجد أسئلة مُهيأة بعد.",
    noResults: "لا تتوفر نتائج مجمعة بعد.",
    noWeather: "لا توجد مناطق طقس مُهيأة.",
    addWeatherHint: "يمكن إضافة المناطق من Supabase دون تعديل الواجهة.",
    unknownError: "حدث خطأ غير متوقع.",
    footer: "دراسة جدوى التأمين البارامتري ضد المخاطر المناخية في موريتانيا · المعهد العالي للمحاسبة وإدارة المؤسسات",
    confirmDelete: "هل تريد حذف هذا السؤال نهائيًا؟ إذا كان مستخدمًا في إجابات سابقة فسيتم تعطيله بدلًا من ذلك.",
    yes: "نعم",
    no: "لا",
    maybe: "ربما",
    other: "آخر",
  },
};

const DEFAULT_QUESTIONS = [
  { question_ar: "كم عمرك؟", question_fr: "Quel âge avez-vous ?", question_type: "number", required: true, options: [] },
  { question_ar: "ما هو قطاع نشاطك الرئيسي؟", question_fr: "Quel est votre secteur d’activité principal ?", question_type: "single_choice", required: true, options: [["الزراعة", "Agriculture", "agriculture"], ["تربية المواشي", "Élevage", "elevage"], ["الزراعة وتربية المواشي", "Agriculture et élevage", "agriculture_elevage"], ["نشاط آخر", "Autre activité", "autre"]] },
  { question_ar: "في أي ولاية تمارس نشاطك؟", question_fr: "Dans quelle wilaya exercez-vous votre activité ?", question_type: "text", required: true, options: [] },
  { question_ar: "هل تعرضت لخسائر بسبب مخاطر مناخية خلال السنوات الأخيرة؟", question_fr: "Avez-vous subi des pertes liées à des risques climatiques ces dernières années ?", question_type: "single_choice", required: true, options: [["نعم", "Oui", "oui"], ["لا", "Non", "non"]] },
  { question_ar: "ما الخطر المناخي الأكثر تأثيرًا على نشاطك؟", question_fr: "Quel risque climatique affecte le plus votre activité ?", question_type: "single_choice", required: true, options: [["الجفاف", "Sécheresse", "secheresse"], ["الأمطار غير المنتظمة", "Pluviométrie irrégulière", "pluviometrie"], ["الفيضانات", "Inondations", "inondations"], ["موجات الحرارة", "Vagues de chaleur", "chaleur"], ["خطر آخر", "Autre risque", "autre"]] },
  { question_ar: "ما مدى تكرار فترات الجفاف في منطقتك؟", question_fr: "À quelle fréquence les périodes de sécheresse surviennent-elles dans votre zone ?", question_type: "single_choice", required: true, options: [["نادرًا", "Rarement", "rarement"], ["أحيانًا", "Parfois", "parfois"], ["بشكل متكرر", "Fréquemment", "frequemment"], ["كل سنة تقريبًا", "Presque chaque année", "chaque_annee"]] },
  { question_ar: "هل تؤثر الأمطار غير المنتظمة على إنتاجك أو دخلك؟", question_fr: "La pluviométrie irrégulière affecte-t-elle votre production ou vos revenus ?", question_type: "single_choice", required: true, options: [["بشكل كبير", "Fortement", "fortement"], ["بشكل متوسط", "Modérément", "modere"], ["بشكل ضعيف", "Faiblement", "faiblement"], ["لا تؤثر", "Pas du tout", "aucun"]] },
  { question_ar: "ما طبيعة الخسارة الاقتصادية الأكثر شيوعًا لديك؟", question_fr: "Quelle est la perte économique la plus fréquente dans votre activité ?", question_type: "multiple_choice", required: true, options: [["انخفاض الإنتاج", "Baisse de production", "baisse_production"], ["نفوق المواشي", "Mortalité du bétail", "mortalite"], ["ارتفاع تكاليف العلف أو المدخلات", "Hausse du coût des intrants", "cout_intrants"], ["فقدان الدخل", "Perte de revenus", "perte_revenus"]] },
  { question_ar: "هل تعرف مفهوم التأمين البارامتري؟", question_fr: "Connaissez-vous le principe de l’assurance paramétrique ?", question_type: "single_choice", required: true, options: [["نعم وأعرف فكرته", "Oui, j’en connais le principe", "oui_connu"], ["سمعت عنه فقط", "J’en ai seulement entendu parler", "entendu"], ["لا", "Non", "non"]] },
  { question_ar: "هل تعتقد أن التأمين البارامتري يمكن أن يحمي نشاطك من المخاطر المناخية؟", question_fr: "Pensez-vous que l’assurance paramétrique peut protéger votre activité contre les risques climatiques ?", question_type: "single_choice", required: true, options: [["نعم", "Oui", "oui"], ["ربما", "Peut-être", "peut_etre"], ["لا أعرف", "Je ne sais pas", "inconnu"], ["لا", "Non", "non"]] },
  { question_ar: "هل ستكون مستعدًا للاشتراك في تأمين بارامتري مناسب لنشاطك؟", question_fr: "Seriez-vous prêt à souscrire une assurance paramétrique adaptée à votre activité ?", question_type: "single_choice", required: true, options: [["نعم", "Oui", "oui"], ["ربما", "Peut-être", "peut_etre"], ["لا", "Non", "non"]] },
  { question_ar: "ما مدى قدرتك على دفع قسط تأميني مناسب؟", question_fr: "Quelle serait votre capacité à payer une prime adaptée ?", question_type: "single_choice", required: true, options: [["ضعيفة", "Faible", "faible"], ["متوسطة", "Moyenne", "moyenne"], ["جيدة", "Bonne", "bonne"], ["تتوقف على السعر", "Cela dépend du prix", "depend_prix"]] },
  { question_ar: "ما العامل الأكثر أهمية عند اختيار هذا النوع من التأمين؟", question_fr: "Quel facteur serait le plus important dans le choix de cette assurance ?", question_type: "single_choice", required: true, options: [["السعر", "Le prix", "prix"], ["سرعة التعويض", "La rapidité de l’indemnisation", "rapidite"], ["وضوح المؤشر المناخي", "La clarté de l’indice climatique", "indice"], ["الثقة في شركة التأمين", "La confiance dans l’assureur", "confiance"]] },
  { question_ar: "ما مستوى ثقتك في شركات التأمين لتقديم هذا المنتج؟", question_fr: "Quel est votre niveau de confiance envers les assureurs pour proposer ce produit ?", question_type: "single_choice", required: true, options: [["مرتفع", "Élevé", "eleve"], ["متوسط", "Moyen", "moyen"], ["ضعيف", "Faible", "faible"]] },
  { question_ar: "ما نوع الدعم الذي تحتاجه لتبني التأمين البارامتري؟", question_fr: "Quel type de soutien serait nécessaire pour adopter l’assurance paramétrique ?", question_type: "multiple_choice", required: true, options: [["التوعية والتكوين", "Sensibilisation et formation", "formation"], ["دعم حكومي", "Soutien public", "soutien_public"], ["قسط منخفض أو مدعوم", "Prime réduite ou subventionnée", "prime_subvention"], ["إجراءات تعويض واضحة", "Procédure d’indemnisation claire", "procedure_claire"]] },
  { question_ar: "ما اقتراحك أو ملاحظتك حول التأمين ضد المخاطر المناخية؟", question_fr: "Quelle est votre suggestion concernant l’assurance contre les risques climatiques ?", question_type: "text", required: false, options: [] },
];

function getRespondentId() {
  const key = "survey_respondent_id";
  let id = window.localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(key, id);
  }
  return id;
}

function Card({ children, className = "" }) {
  return <div className={`surface-card ${className}`}>{children}</div>;
}

function ErrorNotice({ message, onRetry, lang }) {
  const retryLabel = lang === "ar" ? "إعادة المحاولة" : "Réessayer";
  return <div className="error-notice" role="alert"><Info size={18} /><div><strong>{message}</strong><button type="button" onClick={onRetry}>{retryLabel}</button></div></div>;
}

function ChoiceCard({ option, selected, label, onClick, multiple }) {
  return <button type="button" className={`choice-card ${selected ? "is-selected" : ""}`} onClick={onClick} aria-pressed={selected}>
    <span className={`choice-indicator ${selected ? "is-selected" : ""}`}>{selected && <Check size={15} strokeWidth={3} />}</span>
    <span className="choice-label">{label}</span>
    {multiple && <span className="choice-hint">{selected ? "✓" : ""}</span>}
  </button>;
}

function StatCard({ icon: Icon, label, value, tone = "blue" }) {
  return <div className={`stat-card stat-${tone}`}><div className="stat-icon"><Icon size={18} /></div><div><div className="stat-value">{value}</div><div className="stat-label">{label}</div></div></div>;
}

function ResultChart({ data, emptyLabel }) {
  if (!data.length) return <div className="empty-state compact"><BarChart3 size={25} /><p>{emptyLabel}</p></div>;
  const maxValue = Math.max(...data.map((item) => Number(item.value) || 0), 1);
  return <div className="result-bars">{data.map((item, index) => <div className="result-bar-row" key={`${item.name}-${index}`}><div className="result-bar-label"><span>{item.name || "—"}</span><strong>{item.percentage ?? 0}%</strong></div><div className="result-bar-track"><span style={{ width: `${Math.max(4, ((Number(item.value) || 0) / maxValue) * 100)}%`, background: PIE_COLORS[index % PIE_COLORS.length] }} /></div></div>)}</div>;
}

function AdminDashboard({ survey, questions, setQuestions, lang, t, loadResults, results, participants, handleSignOut, handleBackToSurvey }) {
  const [tab, setTab] = useState("questions");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [adminError, setAdminError] = useState(null);
  const [form, setForm] = useState({ question_ar: "", question_fr: "", question_type: "single_choice", required: true, active: true, options: [{ label_ar: "", label_fr: "", value: "", sort_order: 1 }] });
  const [weatherLocations, setWeatherLocations] = useState([]);

  const activeQuestions = questions.filter((q) => q.active).length;
  const completionRate = participants > 0 && questions.length > 0 ? "—" : "0%";
  const reset = () => { setEditing(null); setAdminError(null); setForm({ question_ar: "", question_fr: "", question_type: "single_choice", required: true, active: true, options: [{ label_ar: "", label_fr: "", value: "", sort_order: 1 }] }); };

  const surveyId = async () => {
    if (survey?.id) return survey.id;
    const { data, error } = await supabase.from("surveys").select("id").eq("slug", SURVEY_SLUG).eq("active", true).maybeSingle();
    if (error) throw error;
    if (!data?.id) throw new Error("SURVEY_NOT_FOUND");
    return data.id;
  };

  const reloadQuestions = useCallback(async () => {
    const id = await surveyId();
    const { data, error } = await supabase.from("survey_questions").select("id, question_ar, question_fr, question_type, required, active, sort_order, survey_options(id,label_ar,label_fr,value,sort_order)").eq("survey_id", id).order("sort_order", { ascending: true });
    if (error) throw error;
    setQuestions((data || []).map((q) => ({ ...q, options: (q.survey_options || []).slice().sort((a, b) => a.sort_order - b.sort_order) })));
  }, [survey, setQuestions]);

  const seedDefaultQuestions = async () => {
    setSaving(true); setAdminError(null);
    try {
      const id = await surveyId();
      const { data: existing, error } = await supabase.from("survey_questions").select("id, question_fr").eq("survey_id", id);
      if (error) throw error;
      const existingSet = new Set((existing || []).map((q) => q.question_fr.trim().toLowerCase()));
      let order = Math.max(0, ...questions.map((q) => q.sort_order || 0));
      for (const q of DEFAULT_QUESTIONS) {
        if (existingSet.has(q.question_fr.trim().toLowerCase())) continue;
        order += 1;
        const { data: inserted, error: qError } = await supabase.from("survey_questions").insert({ survey_id: id, question_ar: q.question_ar, question_fr: q.question_fr, question_type: q.question_type, required: q.required, active: true, sort_order: order }).select("id").single();
        if (qError) throw qError;
        if (q.options.length) {
          const rows = q.options.map(([label_ar, label_fr, value], index) => ({ question_id: inserted.id, label_ar, label_fr, value, sort_order: index + 1 }));
          const { error: optionsError } = await supabase.from("survey_options").insert(rows);
          if (optionsError) throw optionsError;
        }
      }
      await reloadQuestions();
    } catch (error) {
      console.error("[survey-admin-seed]", error);
      setAdminError(error?.message || t.unknownError);
    } finally { setSaving(false); }
  };

  const startEdit = (q) => { setEditing(q.id); setAdminError(null); setForm({ question_ar: q.question_ar || "", question_fr: q.question_fr || "", question_type: q.question_type, required: q.required, active: q.active, options: (q.options || []).map((o, i) => ({ ...o, sort_order: i + 1 })) }); };
  const addOption = () => setForm((f) => ({ ...f, options: [...f.options, { label_ar: "", label_fr: "", value: "", sort_order: f.options.length + 1 }] }));
  const updateOption = (index, key, value) => setForm((f) => ({ ...f, options: f.options.map((option, optionIndex) => optionIndex === index ? { ...option, [key]: value } : option) }));
  const removeOption = (index) => setForm((f) => ({ ...f, options: f.options.filter((_, optionIndex) => optionIndex !== index).map((option, optionIndex) => ({ ...option, sort_order: optionIndex + 1 })) }));

  const saveQuestion = async () => {
    setSaving(true); setAdminError(null);
    try {
      if (!form.question_ar.trim() || !form.question_fr.trim()) throw new Error(lang === "ar" ? "يرجى إدخال نص السؤال باللغتين." : "Saisissez le texte de la question dans les deux langues.");
      const choiceQuestion = ["single_choice", "multiple_choice"].includes(form.question_type);
      const options = form.options.filter((o) => o.label_ar?.trim() && o.label_fr?.trim() && o.value?.trim()).map((o, index) => ({ label_ar: o.label_ar.trim(), label_fr: o.label_fr.trim(), value: o.value.trim(), sort_order: index + 1 }));
      if (choiceQuestion && !options.length) throw new Error(lang === "ar" ? "أضف خيار إجابة واحدًا على الأقل." : "Ajoutez au moins une option de réponse.");
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) throw new Error("AUTH_REQUIRED");
      const { data: admin, error: adminErrorResponse } = await supabase.from("admins").select("id").eq("id", authData.user.id).maybeSingle();
      if (adminErrorResponse) throw adminErrorResponse;
      if (!admin) throw new Error("ADMIN_REQUIRED");
      let questionId = editing;
      if (editing) {
        const { error } = await supabase.from("survey_questions").update({ question_ar: form.question_ar.trim(), question_fr: form.question_fr.trim(), question_type: form.question_type, required: form.required, active: form.active }).eq("id", editing);
        if (error) throw error;
        const { error: deleteError } = await supabase.from("survey_options").delete().eq("question_id", editing);
        if (deleteError) throw deleteError;
      } else {
        const id = await surveyId();
        const maxOrder = Math.max(0, ...questions.map((q) => q.sort_order || 0));
        const { data, error } = await supabase.from("survey_questions").insert({ survey_id: id, question_ar: form.question_ar.trim(), question_fr: form.question_fr.trim(), question_type: form.question_type, required: form.required, active: form.active, sort_order: maxOrder + 1 }).select("id").single();
        if (error) throw error;
        questionId = data?.id;
      }
      if (choiceQuestion && options.length) {
        const { error } = await supabase.from("survey_options").insert(options.map((o) => ({ ...o, question_id: questionId })));
        if (error) throw error;
      }
      await reloadQuestions(); reset();
    } catch (error) {
      console.error("[survey-admin-save]", error);
      setAdminError(error?.message || t.unknownError);
    } finally { setSaving(false); }
  };

  const toggleQuestion = async (q) => {
    setAdminError(null);
    try {
      const { error } = await supabase.from("survey_questions").update({ active: !q.active }).eq("id", q.id);
      if (error) throw error;
      await reloadQuestions();
    } catch (error) { console.error("[survey-admin-toggle]", error); setAdminError(error?.message || t.unknownError); }
  };

  const deleteQuestion = async (q) => {
    if (!window.confirm(t.confirmDelete)) return;
    setAdminError(null);
    try {
      // Soft-delete by design: keeping the row protects existing answers and
      // preserves the research audit trail while removing it from the public form.
      const { error } = await supabase.from("survey_questions").update({ active: false }).eq("id", q.id);
      if (error) throw error;
      await reloadQuestions();
    } catch (error) { console.error("[survey-admin-delete]", error); setAdminError(error?.message || t.unknownError); }
  };

  const moveQuestion = async (q, direction) => {
    setAdminError(null);
    try {
      const sorted = [...questions].sort((a, b) => a.sort_order - b.sort_order);
      const index = sorted.findIndex((item) => item.id === q.id); const targetIndex = index + direction;
      if (index < 0 || targetIndex < 0 || targetIndex >= sorted.length) return;
      const current = sorted[index]; const target = sorted[targetIndex];
      const first = await supabase.from("survey_questions").update({ sort_order: target.sort_order }).eq("id", current.id);
      if (first.error) throw first.error;
      const second = await supabase.from("survey_questions").update({ sort_order: current.sort_order }).eq("id", target.id);
      if (second.error) throw second.error;
      await reloadQuestions();
    } catch (error) { console.error("[survey-admin-reorder]", error); setAdminError(error?.message || t.unknownError); }
  };

  const loadLocations = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("weather_locations").select("*").order("wilaya");
      if (error) throw error;
      setWeatherLocations(data || []);
    } catch (error) { console.error("[survey-admin-weather]", error); setAdminError(error?.message || t.unknownError); }
  }, [t.unknownError]);
  useEffect(() => { if (tab === "weather") loadLocations(); }, [tab, loadLocations]);

  const resultGroups = questions.map((question) => ({ question, data: (results || []).filter((row) => row.question_id === question.id).map((row) => ({ name: lang === "ar" ? row.option_label_ar : row.option_label_fr, value: row.response_count, percentage: row.percentage })) }));
  const tabs = [["questions", t.questions], ["results", t.results], ["weather", t.weather]];

  return <section className="admin-shell">
    <div className="admin-heading"><div><span className="eyebrow">{t.dashboard}</span><h2>{lang === "ar" ? "إدارة المنصة والنتائج" : "Gestion de la plateforme et des résultats"}</h2><p>{survey?.title_fr || SURVEY_SLUG}</p></div><div className="admin-actions"><button type="button" className="button button-secondary" onClick={handleBackToSurvey}><ChevronLeft size={16} />{t.backSurvey}</button><button type="button" className="button button-secondary" onClick={handleSignOut}><LogOut size={16} />{t.signOut}</button></div></div>
    <div className="stats-grid"><StatCard icon={Users} label={t.participants} value={participants} tone="blue" /><StatCard icon={ClipboardList} label={t.totalQuestions} value={questions.length} tone="navy" /><StatCard icon={CheckCircle2} label={t.activeQuestions} value={activeQuestions} tone="green" /><StatCard icon={TrendingUp} label={t.completion} value={completionRate} tone="gold" /></div>
    <div className="admin-tabs">{tabs.map(([value, label]) => <button type="button" key={value} className={tab === value ? "is-active" : ""} onClick={() => setTab(value)}>{label}</button>)}</div>
    {adminError && <div className="admin-error"><Info size={16} />{adminError}<button type="button" onClick={() => setAdminError(null)}><X size={15} /></button></div>}
    {tab === "questions" && <div className="admin-content-grid">
      <Card className="question-editor"><div className="editor-title"><div><span className="eyebrow">{editing ? t.editQuestion : t.addQuestion}</span><h3>{editing ? t.editQuestion : t.addQuestion}</h3></div>{editing ? <button type="button" className="icon-button" onClick={reset} aria-label={t.cancel}><X size={17} /></button> : <button type="button" className="button button-quiet" onClick={seedDefaultQuestions} disabled={saving}><Sprout size={15} />{t.readyQuestions}</button>}</div>
        <div className="field-grid"><label><span>العربية</span><input value={form.question_ar} onChange={(e) => setForm({ ...form, question_ar: e.target.value })} placeholder="نص السؤال بالعربية" dir="rtl" /></label><label><span>Français</span><input value={form.question_fr} onChange={(e) => setForm({ ...form, question_fr: e.target.value })} placeholder="Texte de la question en français" /></label></div>
        <div className="field-grid three"><label><span>{t.questionType}</span><select value={form.question_type} onChange={(e) => setForm({ ...form, question_type: e.target.value })}><option value="single_choice">{t.singleChoice}</option><option value="multiple_choice">{t.multipleChoice}</option><option value="text">{t.text}</option><option value="number">{t.number}</option></select></label><label className="check-field"><input type="checkbox" checked={form.required} onChange={(e) => setForm({ ...form, required: e.target.checked })} /><span>{t.required}</span></label><label className="check-field"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /><span>{t.active}</span></label></div>
        {["single_choice", "multiple_choice"].includes(form.question_type) && <div className="option-editor"><div className="option-header"><span>{t.options}</span><button type="button" className="text-button" onClick={addOption}><Plus size={15} />{t.addOption}</button></div>{form.options.map((option, index) => <div className="option-row" key={`${index}-${option.value}`}><input value={option.label_ar} onChange={(e) => updateOption(index, "label_ar", e.target.value)} placeholder="العربية" dir="rtl" /><input value={option.label_fr} onChange={(e) => updateOption(index, "label_fr", e.target.value)} placeholder="Français" /><input value={option.value} onChange={(e) => updateOption(index, "value", e.target.value)} placeholder="value" /><button type="button" className="icon-button danger" onClick={() => removeOption(index)} aria-label={t.delete}><Trash2 size={15} /></button></div>)}</div>}
        <div className="editor-footer"><button type="button" className="button button-primary" onClick={saveQuestion} disabled={saving}><Save size={16} />{saving ? (lang === "ar" ? "جارٍ الحفظ…" : "Enregistrement…") : editing ? t.save : t.add}</button>{editing && <button type="button" className="button button-secondary" onClick={reset}>{t.cancel}</button>}</div>
      </Card>
      <div className="question-list">{questions.length === 0 && <Card><div className="empty-state"><ClipboardList size={28} /><p>{t.noQuestions}</p></div></Card>}{questions.map((q, index) => <Card key={q.id} className={!q.active ? "is-muted" : ""}><div className="question-row"><GripVertical className="drag-icon" size={17} /><div className="question-row-copy"><span className="question-index">{String(index + 1).padStart(2, "0")}</span><strong>{lang === "ar" ? q.question_ar : q.question_fr}</strong><small>{q.question_type} · {q.required ? t.required : t.optional} · {q.active ? t.active : t.inactive}</small></div><div className="row-actions"><button type="button" className="icon-button" onClick={() => moveQuestion(q, -1)} disabled={index === 0} aria-label={t.moveUp}><ChevronLeft className="rotate-90" size={15} /></button><button type="button" className="icon-button" onClick={() => moveQuestion(q, 1)} disabled={index === questions.length - 1} aria-label={t.moveDown}><ChevronRight className="rotate-90" size={15} /></button><button type="button" className="icon-button" onClick={() => startEdit(q)} aria-label={t.editQuestion}><Pencil size={15} /></button><button type="button" className="icon-button" onClick={() => toggleQuestion(q)} aria-label={q.active ? t.disable : t.enable}>{q.active ? <EyeOff size={15} /> : <Eye size={15} />}</button><button type="button" className="icon-button danger" onClick={() => deleteQuestion(q)} aria-label={t.delete}><Trash2 size={15} /></button></div></div></Card>)}</div>
    </div>}
    {tab === "results" && <div className="results-panel"><Card className="results-summary"><div className="results-summary-icon"><BarChart3 size={22} /></div><div><span className="eyebrow">{t.results}</span><h3>{participants} {t.participants}</h3><p>{lang === "ar" ? "النتائج المعروضة مجمعة ولا تتضمن أي بيانات شخصية." : "Les résultats sont agrégés et ne contiennent aucune donnée personnelle."}</p></div><button type="button" className="button button-secondary" onClick={loadResults}><RefreshCw size={15} />{lang === "ar" ? "تحديث" : "Actualiser"}</button></Card><div className="result-grid">{resultGroups.map(({ question, data }) => <Card key={question.id}><h3 className="result-question">{lang === "ar" ? question.question_ar : question.question_fr}</h3><ResultChart data={data} emptyLabel={t.noResults} /></Card>)}</div></div>}
    {tab === "weather" && <Card><div className="section-title"><div className="title-icon"><CloudRain size={18} /></div><div><span className="eyebrow">{t.weather}</span><h3>{lang === "ar" ? "مناطق بيانات الطقس" : "Régions de données météo"}</h3></div></div>{weatherLocations.length === 0 ? <div className="empty-state"><CloudRain size={28} /><p>{t.noWeather}</p><small>{t.addWeatherHint}</small></div> : <div className="weather-list">{weatherLocations.map((location) => <div key={location.id} className="weather-row"><span>{location.wilaya} — {location.location_name}</span><small>{location.latitude}, {location.longitude}</small></div>)}</div>}</Card>}
  </section>;
}

export default function SondageStandalone() {
  const [lang, setLang] = useState("fr");
  const [mode, setMode] = useState("form");
  const [started, setStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [survey, setSurvey] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loadingSurvey, setLoadingSurvey] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [participants, setParticipants] = useState(0);
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPromptOpen, setAdminPromptOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState(null);
  const [authBusy, setAuthBusy] = useState(false);
  const clickTimestamps = useRef([]);
  const t = T[lang];
  const dir = t.dir;

  const qText = useCallback((q) => lang === "ar" ? q.question_ar : q.question_fr, [lang]);
  const oText = useCallback((o) => lang === "ar" ? o.label_ar : o.label_fr, [lang]);
  const currentQuestion = questions[currentStep];
  const requiredAnswered = useCallback((question) => {
    if (!question || !question.required) return true;
    const value = answers[question.id];
    return Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null && String(value).trim() !== "";
  }, [answers]);
  const allAnswered = useMemo(() => questions.every(requiredAnswered), [questions, requiredAnswered]);
  const progress = questions.length ? Math.round(((currentStep + 1) / questions.length) * 100) : 0;

  const loadSurvey = useCallback(async () => {
    setLoadingSurvey(true); setError(null);
    try {
      const { data: surveyRow, error: surveyError } = await supabase.from("surveys").select("id, slug, title_ar, title_fr, active").eq("slug", SURVEY_SLUG).eq("active", true).single();
      if (surveyError || !surveyRow) throw surveyError || new Error("SURVEY_NOT_FOUND");
      setSurvey(surveyRow);
      const { data: questionRows, error: questionError } = await supabase.from("survey_questions").select("id, question_ar, question_fr, question_type, required, sort_order, survey_options(id, label_ar, label_fr, value, sort_order)").eq("survey_id", surveyRow.id).eq("active", true).order("sort_order", { ascending: true });
      if (questionError) throw questionError;
      setQuestions((questionRows || []).map((q) => ({ ...q, options: (q.survey_options || []).slice().sort((a, b) => a.sort_order - b.sort_order) })));
    } catch (loadError) {
      console.error("[survey-load]", loadError);
      setError(T[lang].errorLoad);
    } finally { setLoadingSurvey(false); }
  }, [lang]);

  useEffect(() => { loadSurvey(); }, [loadSurvey]);
  useEffect(() => { document.documentElement.lang = lang; document.documentElement.dir = dir; document.title = t.title; }, [dir, lang, t.title]);
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => { if (active) setSession(data.session ?? null); }).catch((authLoadError) => console.error("[auth-session]", authLoadError));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => { active = false; subscription.subscription.unsubscribe(); };
  }, []);
  useEffect(() => {
    let cancelled = false;
    if (!session?.user) { setIsAdmin(false); return () => { cancelled = true; }; }
    supabase.from("admins").select("id").eq("id", session.user.id).maybeSingle().then(({ data, error: adminLoadError }) => { if (adminLoadError) console.error("[admin-check]", adminLoadError); if (!cancelled) setIsAdmin(!adminLoadError && !!data); }).catch((adminCheckError) => { console.error("[admin-check]", adminCheckError); if (!cancelled) setIsAdmin(false); });
    return () => { cancelled = true; };
  }, [session]);

  const loadResults = useCallback(async () => {
    if (!survey) return;
    try {
      const { data, error: resultsError } = await supabase.from("public_survey_results").select("*").eq("survey_id", survey.id);
      if (resultsError) throw resultsError;
      setResults(data || []);
      const { data: countData, error: countError } = await supabase.from("public_survey_participant_counts").select("total_participants").eq("survey_id", survey.id).maybeSingle();
      if (countError) console.error("[public-participant-count]", countError); else setParticipants(countData?.total_participants || 0);
    } catch (resultsError) { console.error("[survey-results]", resultsError); setError(t.errorLoad); }
  }, [survey, t.errorLoad]);
  useEffect(() => { if (mode === "results" && isAdmin) loadResults(); }, [isAdmin, loadResults, mode]);

  const updateAnswer = (questionId, value) => { setAnswers((previous) => ({ ...previous, [questionId]: value })); setError(null); };
  const handleTitleClick = () => { const now = Date.now(); clickTimestamps.current = clickTimestamps.current.filter((timestamp) => now - timestamp < ADMIN_TRIGGER_WINDOW_MS); clickTimestamps.current.push(now); if (clickTimestamps.current.length >= ADMIN_TRIGGER_CLICKS) { clickTimestamps.current = []; setAdminPromptOpen(true); setAuthError(null); } };
  const handleNext = () => { if (!requiredAnswered(currentQuestion)) { setError(t.requiredCurrent); return; } setError(null); setCurrentStep((step) => Math.min(step + 1, questions.length - 1)); };
  const handlePrevious = () => { setError(null); setCurrentStep((step) => Math.max(step - 1, 0)); };

  const handleSubmit = async () => {
    if (!allAnswered || !survey) { setError(t.requiredAll); return; }
    setSubmitting(true); setError(null);
    try {
      const respondentId = getRespondentId();
      const responseId = crypto.randomUUID();
      const payload = questions.flatMap((q) => { const value = answers[q.id]; const values = Array.isArray(value) ? value : [value]; return values.filter((item) => item !== undefined && item !== null && String(item).trim() !== "").map((item) => { const option = q.options.find((o) => o.id === item); return { question_id: q.id, answer_value: option?.value ?? String(item), answer_text: option ? oText(option) : String(item) }; }); });
      const { data: rpcResponseId, error: rpcError } = await supabase.rpc("submit_survey_response", { p_survey_id: survey.id, p_respondent_id: respondentId, p_answers: payload });
      if (!rpcError && rpcResponseId) { setSubmitted(true); return; }
      if (String(rpcError?.message || "").includes("DUPLICATE_RESPONSE")) { setError(t.duplicate); return; }
      const { error: responseError } = await supabase.from("survey_responses").insert({ id: responseId, survey_id: survey.id, respondent_id: respondentId });
      if (responseError) { if (String(responseError.message || "").toLowerCase().includes("duplicate")) { setError(t.duplicate); return; } throw responseError; }
      const { error: answersError } = await supabase.from("survey_answers").insert(payload.map((answer) => ({ response_id: responseId, ...answer })));
      if (answersError) { await supabase.from("survey_responses").delete().eq("id", responseId); throw answersError; }
      setSubmitted(true);
    } catch (submitError) { console.error("[survey-submit]", submitError); setError(String(submitError?.message || "").includes("DUPLICATE_RESPONSE") ? t.duplicate : t.errorSubmit); }
    finally { setSubmitting(false); }
  };

  const handleAdminLogin = async () => {
    setAuthBusy(true); setAuthError(null);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError || !data.session) throw signInError || new Error("NO_SESSION");
      const { data: adminRow, error: adminErrorResponse } = await supabase.from("admins").select("id").eq("id", data.session.user.id).maybeSingle();
      if (adminErrorResponse || !adminRow) { await supabase.auth.signOut(); throw adminErrorResponse || new Error("NOT_ADMIN"); }
      setSession(data.session); setIsAdmin(true); setMode("results"); setAdminPromptOpen(false); setEmail(""); setPassword("");
    } catch (loginError) { console.error("[admin-login]", loginError); setAuthError(t.adminWrong); }
    finally { setAuthBusy(false); }
  };
  const handleSignOut = async () => { try { await supabase.auth.signOut(); } catch (signOutError) { console.error("[admin-signout]", signOutError); } setIsAdmin(false); setSession(null); setMode("form"); };
  const returnHome = () => { setMode("form"); setStarted(false); setSubmitted(false); setCurrentStep(0); setAnswers({}); setError(null); };

  return <div dir={dir} className="app-shell">
    <header className="site-header"><div className="header-inner"><button type="button" className="brand-button" onClick={handleTitleClick} aria-label="ISCAE"><span className="brand-mark"><ShieldCheck size={21} /></span><span><strong>{t.institute}</strong><small>{t.kicker}</small></span></button><div className="header-actions"><button type="button" className="language-switcher" onClick={() => setLang((current) => current === "fr" ? "ar" : "fr")}><Globe2 size={16} /><span>{lang === "fr" ? "العربية" : "Français"}</span></button>{isAdmin && <button type="button" className="header-admin-button" onClick={() => setMode("results")}><BarChart3 size={15} />{t.dashboard}</button>}</div></div></header>
    <main className="page-wrap">
      {loadingSurvey && <div className="loading-state"><span className="spinner" />{t.loading}</div>}
      {!loadingSurvey && error && !currentQuestion && <ErrorNotice message={error} onRetry={loadSurvey} lang={lang} />}
      {!loadingSurvey && mode === "form" && !submitted && <>
        {!started && <section className="hero-section"><div className="hero-copy"><span className="academic-badge"><Sprout size={15} />{t.badge}</span><h1>{t.title}</h1><p className="hero-subtitle">{t.subtitle}</p><p className="hero-intro">{t.intro}</p><div className="hero-meta"><span><ClipboardList size={16} />{questions.length} {t.questionsCount}</span><span><CloudRain size={16} />{t.duration}</span></div><button type="button" className="button button-primary hero-cta" disabled={!questions.length} onClick={() => { setStarted(true); setCurrentStep(0); }}>{t.start}<span className="directional-icon">{lang === "ar" ? <ChevronLeft size={19} /> : <ChevronRight size={19} />}</span></button></div><div className="hero-visual"><div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" /><div className="visual-card"><div className="visual-icon"><CloudRain size={34} /></div><span>{lang === "ar" ? "المخاطر المناخية" : "Risques climatiques"}</span><small>{lang === "ar" ? "الزراعة · المواشي · التأمين" : "Agriculture · élevage · assurance"}</small></div><div className="visual-pulse"><ShieldCheck size={20} /></div></div></section>}
        {started && currentQuestion && <section className="survey-flow"><div className="survey-topline"><div><span className="eyebrow">{t.question} {currentStep + 1} {t.of} {questions.length}</span><strong>{progress}%</strong></div><span>{t.progress}</span></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div><Card className="question-card"><div className="question-card-head"><span className="question-number">{String(currentStep + 1).padStart(2, "0")}</span><div><span className="question-kicker">{t.question} {currentStep + 1}</span><span className={`question-badge ${currentQuestion.required ? "required" : "optional"}`}>{currentQuestion.required ? t.required : t.optional}</span></div></div><h2>{qText(currentQuestion)}</h2>{currentQuestion.question_type === "text" && <textarea value={answers[currentQuestion.id] ?? ""} onChange={(e) => updateAnswer(currentQuestion.id, e.target.value)} placeholder={t.textPlaceholder} rows={6} autoFocus />}{currentQuestion.question_type === "number" && <input type="number" inputMode="numeric" value={answers[currentQuestion.id] ?? ""} onChange={(e) => updateAnswer(currentQuestion.id, e.target.value)} placeholder={t.numberPlaceholder} autoFocus />}{currentQuestion.question_type === "single_choice" && <div className="choices-grid">{currentQuestion.options.map((option) => <ChoiceCard key={option.id} option={option} selected={answers[currentQuestion.id] === option.id} label={oText(option)} onClick={() => updateAnswer(currentQuestion.id, option.id)} />)}</div>}{currentQuestion.question_type === "multiple_choice" && <div className="choices-grid">{currentQuestion.options.map((option) => { const selected = Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].includes(option.id); return <ChoiceCard key={option.id} option={option} multiple selected={selected} label={oText(option)} onClick={() => { const current = Array.isArray(answers[currentQuestion.id]) ? answers[currentQuestion.id] : []; updateAnswer(currentQuestion.id, selected ? current.filter((id) => id !== option.id) : [...current, option.id]); }} />; })}</div>}{error && <div className="inline-error" role="alert"><Info size={16} />{error}</div>}</Card><div className="survey-navigation"><button type="button" className="button button-secondary" onClick={handlePrevious} disabled={currentStep === 0}><span className="directional-icon">{lang === "ar" ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}</span>{t.previous}</button>{currentStep < questions.length - 1 ? <button type="button" className="button button-primary" onClick={handleNext}>{t.next}<span className="directional-icon">{lang === "ar" ? <ChevronLeft size={17} /> : <ChevronRight size={17} />}</span></button> : <button type="button" className="button button-primary" onClick={handleSubmit} disabled={submitting}>{submitting ? t.submitting : t.submit}<CheckCircle2 size={17} /></button>}</div><p className="privacy-note"><LockKeyhole size={14} />{t.anonymous}</p></section>}
      </>}
      {!loadingSurvey && mode === "form" && submitted && <section className="success-screen"><div className="success-icon"><Check size={35} strokeWidth={3} /></div><span className="eyebrow">{lang === "ar" ? "تم الإرسال بنجاح" : "Réponse enregistrée"}</span><h1>{t.thanksTitle}</h1><p>{t.thanksText}</p><button type="button" className="button button-primary" onClick={returnHome}>{t.backHome}</button></section>}
      {adminPromptOpen && !isAdmin && <Card className="admin-login"><div className="section-title"><div className="title-icon"><LockKeyhole size={18} /></div><div><span className="eyebrow">ISCAE</span><h2>{t.adminTitle}</h2></div><button type="button" className="icon-button" onClick={() => setAdminPromptOpen(false)} aria-label={t.adminBack}><X size={17} /></button></div><label><span>{t.emailLabel}</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" /></label><label><span>{t.passwordLabel}</span><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleAdminLogin(); }} autoComplete="current-password" /></label>{authError && <div className="inline-error"><Info size={16} />{authError}</div>}<div className="login-actions"><button type="button" className="button button-primary" onClick={handleAdminLogin} disabled={authBusy}>{authBusy ? "…" : t.adminSubmit}</button><button type="button" className="button button-secondary" onClick={() => setAdminPromptOpen(false)}>{t.adminBack}</button></div></Card>}
      {mode === "results" && isAdmin && <AdminDashboard survey={survey} questions={questions} setQuestions={setQuestions} lang={lang} t={t} loadResults={loadResults} results={results} participants={participants} handleSignOut={handleSignOut} handleBackToSurvey={() => setMode("form")} />}
    </main>
    <footer className="site-footer"><span>{t.footer}</span><button type="button" onClick={handleTitleClick}>{t.institute}</button></footer>
  </div>;
}
