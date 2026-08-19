import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  CloudRain,
  CloudSun,
  Eye,
  EyeOff,
  Globe2,
  Info,
  Lock,
  Minus,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Send,
  Settings2,
  ShieldCheck,
  Sprout,
  Trash2,
  Users,
  X,
} from "lucide-react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { supabase } from "./lib/supabaseClient";

const C = {
  navy: "#0B1E39",
  blue: "#1E5A9C",
  blue2: "#3277BC",
  blueSoft: "#EAF3FB",
  sky: "#F3F8FD",
  ivory: "#F7F9FC",
  white: "#FFFFFF",
  green: "#14855B",
  greenSoft: "#E7F6EE",
  gold: "#B38B3D",
  goldSoft: "#F8F1E4",
  ink: "#142033",
  slate: "#5D6B7C",
  muted: "#8A97A7",
  border: "#DDE5EE",
  red: "#BF3C35",
  redSoft: "#FDEDEC",
};

const PIE_COLORS = [C.blue, C.blue2, C.green, C.gold, C.red];

const SURVEY_SLUG = "assurance-parametrique-2026";
const ADMIN_TRIGGER_CLICKS = 5;
const ADMIN_TRIGGER_WINDOW_MS = 3000;
const ANSWERS_STORAGE_KEY = `survey_answers_${SURVEY_SLUG}`;
const STEP_STORAGE_KEY = `survey_step_${SURVEY_SLUG}`;

const T = {
  fr: {
    dir: "ltr",
    institute: "Institut Supérieur de Comptabilité et d’Administration des Entreprises (ISCAE)",
    kicker: "Projet de fin d’études · Banque & Assurance",
    title: "Enquête sur l’assurance paramétrique contre les risques climatiques en Mauritanie",
    shortTitle: "Assurance paramétrique & risques climatiques",
    subtitle:
      "Ce questionnaire contribue à une étude académique sur la faisabilité d’un système d’assurance paramétrique pour les secteurs agricole et de l’élevage en Mauritanie.",
    anonymous:
      "Vos réponses sont enregistrées de manière anonyme et utilisées uniquement sous forme agrégée pour la recherche. Aucune donnée personnelle directement identifiable n’est demandée.",
    duration: "Durée estimée",
    minutes: "3 minutes",
    questions: "questions",
    start: "Commencer le questionnaire",
    progress: "Progression",
    question: "Question",
    required: "Obligatoire",
    optional: "Facultatif",
    previous: "Précédent",
    next: "Suivant",
    submit: "Envoyer mes réponses",
    submitting: "Envoi en cours…",
    successTitle: "Merci pour votre participation !",
    successText: "Votre réponse a été enregistrée avec succès.",
    backHome: "Retour à l’accueil",
    validation: "Veuillez répondre à toutes les questions obligatoires avant de continuer.",
    loading: "Chargement du questionnaire…",
    loadingAdmin: "Chargement de l’espace administrateur…",
    genericError: "Une erreur est survenue.",
    retry: "Réessayer",
    adminTitle: "Espace réservé à l’équipe du projet",
    email: "Email",
    password: "Mot de passe",
    signIn: "Se connecter",
    signOut: "Se déconnecter",
    wrongCredentials: "Identifiants incorrects ou accès non autorisé.",
    dashboard: "Tableau de bord",
    survey: "Questionnaire",
    questionsTab: "Questions",
    resultsTab: "Résultats",
    weatherTab: "Météo",
    settingsTab: "Paramètres",
    participants: "Participants",
    activeQuestions: "Questions actives",
    totalQuestions: "Questions",
    completion: "Taux de complétion",
    completionHint: "Questions obligatoires renseignées",
    manageQuestions: "Gestion des questions",
    addQuestion: "Ajouter une question",
    editQuestion: "Modifier la question",
    seedQuestions: "Ajouter les questions académiques",
    arabicQuestion: "Question en arabe",
    frenchQuestion: "Question en français",
    questionType: "Type de question",
    single: "Choix unique",
    multiple: "Choix multiples",
    text: "Texte libre",
    number: "Nombre",
    active: "Active",
    reorder: "Réordonner",
    options: "Options de réponse",
    addOption: "Ajouter",
    save: "Enregistrer",
    cancel: "Annuler",
    noOptions: "Aucune option",
    noResults: "Aucun résultat agrégé disponible pour le moment.",
    aggregatedOnly: "Les résultats ci-dessous sont agrégés et accessibles uniquement à l’équipe du projet.",
    refresh: "Actualiser",
    weather: "Régions météo",
    noWeather: "Aucune région configurée dans Supabase.",
    retrySurvey: "Recharger le questionnaire",
    privacyTitle: "Confidentialité",
    oneResponse: "Une seule réponse par navigateur est autorisée lorsque l’enquête est configurée ainsi.",
    hiddenAdmin: "L’accès administrateur reste volontairement discret.",
    instituteArabic: "المعهد العالي للمحاسبة وإدارة المؤسسات",
  },
  ar: {
    dir: "rtl",
    institute: "المعهد العالي للمحاسبة وإدارة المؤسسات",
    kicker: "مشروع تخرج · البنوك والتأمين",
    title: "استبيان حول التأمين البارامتري ضد المخاطر المناخية في موريتانيا",
    shortTitle: "التأمين البارامتري والمخاطر المناخية",
    subtitle:
      "يساهم هذا الاستبيان في دراسة أكاديمية حول إمكانية تطبيق نظام للتأمين البارامتري في قطاعي الزراعة وتربية المواشي في موريتانيا.",
    anonymous:
      "تُسجَّل إجاباتكم بشكل مجهول وتُستخدم فقط في صورة نتائج مجمعة لأغراض البحث العلمي، ولا نطلب أي بيانات شخصية مُعرِّفة مباشرة.",
    duration: "المدة المتوقعة",
    minutes: "3 دقائق",
    questions: "أسئلة",
    start: "بدء الاستبيان",
    progress: "التقدم",
    question: "السؤال",
    required: "إجباري",
    optional: "اختياري",
    previous: "السابق",
    next: "التالي",
    submit: "إرسال الإجابات",
    submitting: "جارٍ الإرسال…",
    successTitle: "شكرًا لمشاركتكم!",
    successText: "تم تسجيل إجابتكم بنجاح.",
    backHome: "العودة إلى الصفحة الرئيسية",
    validation: "يرجى الإجابة عن جميع الأسئلة الإجبارية قبل المتابعة.",
    loading: "جارٍ تحميل الاستبيان…",
    loadingAdmin: "جارٍ تحميل لوحة المشرف…",
    genericError: "حدث خطأ غير متوقع.",
    retry: "إعادة المحاولة",
    adminTitle: "منطقة مخصصة لفريق المشروع",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    signIn: "تسجيل الدخول",
    signOut: "تسجيل الخروج",
    wrongCredentials: "بيانات الدخول غير صحيحة أو الوصول غير مصرح به.",
    dashboard: "لوحة المشرف",
    survey: "الاستبيان",
    questionsTab: "الأسئلة",
    resultsTab: "النتائج",
    weatherTab: "الطقس",
    settingsTab: "الإعدادات",
    participants: "المشاركون",
    activeQuestions: "الأسئلة النشطة",
    totalQuestions: "الأسئلة",
    completion: "نسبة الإكمال",
    completionHint: "الأسئلة الإجبارية التي تمت الإجابة عنها",
    manageQuestions: "إدارة الأسئلة",
    addQuestion: "إضافة سؤال",
    editQuestion: "تعديل السؤال",
    seedQuestions: "إضافة الأسئلة الأكاديمية",
    arabicQuestion: "السؤال بالعربية",
    frenchQuestion: "السؤال بالفرنسية",
    questionType: "نوع السؤال",
    single: "اختيار واحد",
    multiple: "اختيارات متعددة",
    text: "نص حر",
    number: "رقم",
    active: "نشط",
    reorder: "ترتيب",
    options: "خيارات الإجابة",
    addOption: "إضافة",
    save: "حفظ",
    cancel: "إلغاء",
    noOptions: "لا توجد خيارات",
    noResults: "لا توجد نتائج مجمعة متاحة حاليًا.",
    aggregatedOnly: "النتائج المعروضة مجمعة ومتاحة لفريق المشروع فقط.",
    refresh: "تحديث",
    weather: "مناطق الطقس",
    noWeather: "لا توجد مناطق مُهيأة في Supabase.",
    retrySurvey: "إعادة تحميل الاستبيان",
    privacyTitle: "الخصوصية",
    oneResponse: "يُسمح بإجابة واحدة لكل متصفح عندما تكون هذه القاعدة مفعلة في الاستبيان.",
    hiddenAdmin: "يبقى دخول المشرف مخفيًا بشكل مقصود.",
    instituteArabic: "المعهد العالي للمحاسبة وإدارة المؤسسات",
  },
};

const DEFAULT_QUESTIONS = [
  {
    question_ar: "ما هو نشاطك الرئيسي؟",
    question_fr: "Quelle est votre activité principale ?",
    question_type: "single_choice",
    required: true,
    options: [
      ["الزراعة", "Agriculture", "agriculture"],
      ["تربية المواشي", "Élevage", "elevage"],
      ["الزراعة وتربية المواشي", "Agriculture et élevage", "agri_elevage"],
      ["نشاط آخر", "Autre activité", "autre"],
    ],
  },
  {
    question_ar: "ما هو نطاق نشاطك؟",
    question_fr: "Quelle est l’ampleur de votre activité ?",
    question_type: "single_choice",
    required: true,
    options: [
      ["صغير", "Petite", "petite"],
      ["متوسط", "Moyenne", "moyenne"],
      ["كبير", "Grande", "grande"],
    ],
  },
  {
    question_ar: "هل سبق أن تعرضت لخسائر مرتبطة بالمخاطر المناخية؟",
    question_fr: "Avez-vous déjà subi des pertes liées aux risques climatiques ?",
    question_type: "single_choice",
    required: true,
    options: [
      ["نعم", "Oui", "oui"],
      ["لا", "Non", "non"],
    ],
  },
  {
    question_ar: "ما الخطر المناخي الأكثر تأثيرًا على نشاطك؟",
    question_fr: "Quel risque climatique affecte le plus votre activité ?",
    question_type: "single_choice",
    required: true,
    options: [
      ["الجفاف", "Sécheresse", "secheresse"],
      ["الفيضانات", "Inondations", "inondations"],
      ["موجات الحرارة", "Vagues de chaleur", "chaleur"],
      ["عدم انتظام الأمطار", "Pluviométrie irrégulière", "pluie_irreguliere"],
      ["آخر", "Autre", "autre"],
    ],
  },
  {
    question_ar: "هل تعرف مفهوم التأمين البارامتري؟",
    question_fr: "Connaissez-vous le principe de l’assurance paramétrique ?",
    question_type: "single_choice",
    required: true,
    options: [
      ["نعم، أعرفه", "Oui, je le connais", "oui"],
      ["سمعت عنه فقط", "J’en ai seulement entendu parler", "entendu"],
      ["لا", "Non", "non"],
    ],
  },
  {
    question_ar: "هل تعتقد أن التأمين البارامتري يمكن أن يحد من آثار المخاطر المناخية؟",
    question_fr: "Pensez-vous que l’assurance paramétrique peut réduire les impacts des risques climatiques ?",
    question_type: "single_choice",
    required: true,
    options: [
      ["نعم", "Oui", "oui"],
      ["ربما", "Peut-être", "peut_etre"],
      ["لا", "Non", "non"],
    ],
  },
  {
    question_ar: "هل تعرضت خلال السنوات الأخيرة للجفاف أو نقص الأمطار بشكل مؤثر على نشاطك؟",
    question_fr: "Votre activité a-t-elle été affectée récemment par la sécheresse ou une faible pluviométrie ?",
    question_type: "single_choice",
    required: true,
    options: [
      ["نعم", "Oui", "oui"],
      ["لا", "Non", "non"],
    ],
  },
  {
    question_ar: "هل تعتقد أن التعويض السريع المبني على مؤشر مناخي سيكون مفيدًا لك؟",
    question_fr: "Une indemnisation rapide basée sur un indice climatique vous serait-elle utile ?",
    question_type: "single_choice",
    required: true,
    options: [
      ["مفيد جدًا", "Très utile", "tres_utile"],
      ["مفيد", "Utile", "utile"],
      ["غير مفيد", "Peu utile", "peu_utile"],
    ],
  },
  {
    question_ar: "ما العامل الأكثر أهمية عند اختيار التأمين البارامتري؟",
    question_fr: "Quel facteur serait le plus important dans le choix d’une assurance paramétrique ?",
    question_type: "single_choice",
    required: true,
    options: [
      ["سعر القسط", "Le prix de la prime", "prix"],
      ["سرعة التعويض", "La rapidité de l’indemnisation", "rapidite"],
      ["وضوح المؤشر المناخي", "La clarté de l’indice climatique", "indice"],
      ["الثقة في شركة التأمين", "La confiance envers l’assureur", "confiance"],
    ],
  },
  {
    question_ar: "ما مستوى ثقتك في شركات التأمين لتقديم هذا النوع من المنتجات؟",
    question_fr: "Quel est votre niveau de confiance envers les assureurs pour proposer ce type de produit ?",
    question_type: "single_choice",
    required: true,
    options: [
      ["مرتفع", "Élevé", "eleve"],
      ["متوسط", "Moyen", "moyen"],
      ["ضعيف", "Faible", "faible"],
    ],
  },
  {
    question_ar: "هل ستكون مستعدًا للاشتراك في تأمين بارامتري مناسب لنشاطك؟",
    question_fr: "Seriez-vous prêt à souscrire une assurance paramétrique adaptée à votre activité ?",
    question_type: "single_choice",
    required: true,
    options: [
      ["نعم", "Oui", "oui"],
      ["ربما", "Peut-être", "peut_etre"],
      ["لا", "Non", "non"],
    ],
  },
  {
    question_ar: "ما المبلغ الذي تعتبره مناسبًا كقسط تأمين دوري مقابل هذه التغطية؟",
    question_fr: "Quel niveau de prime périodique vous semblerait acceptable pour cette couverture ?",
    question_type: "single_choice",
    required: false,
    options: [
      ["منخفض جدًا", "Très faible", "tres_faible"],
      ["منخفض", "Faible", "faible"],
      ["متوسط", "Moyen", "moyen"],
      ["مرتفع", "Élevé", "eleve"],
    ],
  },
  {
    question_ar: "هل تعتقد أن الدولة أو الجهات الداعمة يجب أن تساهم في دعم أقساط هذا النوع من التأمين؟",
    question_fr: "L’État ou les partenaires de développement devraient-ils contribuer au soutien des primes de ce type d’assurance ?",
    question_type: "single_choice",
    required: true,
    options: [
      ["نعم", "Oui", "oui"],
      ["ربما", "Peut-être", "peut_etre"],
      ["لا", "Non", "non"],
    ],
  },
  {
    question_ar: "ما اقتراحك أو ملاحظتك حول تطوير التأمين ضد المخاطر المناخية في موريتانيا؟",
    question_fr: "Quelle est votre suggestion ou remarque pour développer l’assurance contre les risques climatiques en Mauritanie ?",
    question_type: "text",
    required: false,
    options: [],
  },
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

function loadLocalAnswers() {
  try {
    return JSON.parse(window.localStorage.getItem(ANSWERS_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function formatErrorMessage(lang, fallback, error) {
  const raw = String(error?.message || "");
  if (raw.includes("DUPLICATE_RESPONSE") || raw.toLowerCase().includes("duplicate")) {
    return lang === "ar"
      ? "لقد تم تسجيل إجابتك مسبقًا على هذا الاستبيان."
      : "Votre réponse à ce questionnaire a déjà été enregistrée.";
  }
  return fallback;
}

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Card({ children, className = "" }) {
  return (
    <div className={cn("rounded-3xl border bg-white shadow-sm", className)} style={{ borderColor: C.border }}>
      {children}
    </div>
  );
}

function ChoiceCard({ selected, disabled, icon, title, onClick, multiple = false }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "group w-full rounded-2xl border p-4 text-start transition duration-200",
        "hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
      )}
      style={{
        borderColor: selected ? C.blue : C.border,
        background: selected ? C.blueSoft : C.white,
        boxShadow: selected ? `0 0 0 2px ${C.blueSoft}` : undefined,
      }}
      aria-pressed={selected}
    >
      <div className="flex items-center gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition"
          style={{
            borderColor: selected ? C.blue : C.border,
            background: selected ? C.blue : C.sky,
            color: selected ? C.white : C.slate,
          }}
        >
          {selected ? <Check size={17} strokeWidth={2.8} /> : icon || (multiple ? <span className="text-xs">□</span> : <span className="text-xs">○</span>)}
        </span>
        <span className="min-w-0 flex-1 text-sm font-semibold" style={{ color: C.ink }}>
          {title}
        </span>
      </div>
    </button>
  );
}

function ErrorState({ lang, onRetry, message }) {
  const t = T[lang];
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <Card className="p-6 text-center md:p-8">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: C.redSoft, color: C.red }}>
          <X size={24} />
        </div>
        <h2 className="mb-2 text-lg font-bold" style={{ color: C.navy }}>
          {message || t.genericError}
        </h2>
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ background: C.navy }}
        >
          <RefreshCw size={15} />
          {t.retry}
        </button>
      </Card>
    </div>
  );
}

function SuccessScreen({ lang }) {
  const t = T[lang];
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Card className="relative overflow-hidden p-8 text-center md:p-12">
        <div className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${C.blue}, ${C.green}, ${C.gold})` }} />
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full" style={{ background: C.greenSoft, color: C.green }}>
          <CheckCircle2 size={42} strokeWidth={1.8} />
        </div>
        <div className="mb-2 text-2xl font-black md:text-3xl" style={{ color: C.navy }}>
          {t.successTitle}
        </div>
        <p className="mx-auto max-w-lg text-sm leading-7" style={{ color: C.slate }}>
          {t.successText}
        </p>
        <div className="mt-7 rounded-2xl p-4 text-xs leading-6" style={{ background: C.sky, color: C.slate }}>
          {t.oneResponse}
        </div>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition hover:bg-slate-50"
          style={{ borderColor: C.border, color: C.navy }}
        >
          {t.backHome}
        </button>
      </Card>
    </div>
  );
}

function QuestionCard({ q, index, total, answer, setAnswer, lang }) {
  const t = T[lang];
  const selectedMultiple = Array.isArray(answer) ? answer : [];
  return (
    <Card className="overflow-hidden">
      <div className="border-b px-5 py-5 md:px-7" style={{ borderColor: C.border, background: "linear-gradient(180deg,#FFFFFF,#F9FBFD)" }}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full px-3 py-1 text-[11px] font-extrabold tracking-[0.14em]" style={{ background: C.navy, color: C.white }}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: C.muted }}>
            {t.question} {index + 1} / {total}
          </span>
          <span className="ms-auto rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ background: q.required ? C.redSoft : C.sky, color: q.required ? C.red : C.slate }}>
            {q.required ? t.required : t.optional}
          </span>
        </div>
        <h2 className="mt-4 text-base font-extrabold leading-8 md:text-lg" style={{ color: C.navy }}>
          {lang === "ar" ? q.question_ar : q.question_fr}
        </h2>
        {lang === "ar" && q.question_fr && (
          <p className="mt-1 text-xs leading-6" dir="ltr" style={{ color: C.muted }}>
            {q.question_fr}
          </p>
        )}
        {lang === "fr" && q.question_ar && (
          <p className="mt-1 text-xs leading-6" dir="rtl" style={{ color: C.muted }}>
            {q.question_ar}
          </p>
        )}
      </div>

      <div className="space-y-3 p-5 md:p-7">
        {q.question_type === "single_choice" &&
          q.options.map((opt) => (
            <ChoiceCard
              key={opt.id}
              selected={answer === opt.id}
              title={lang === "ar" ? opt.label_ar : opt.label_fr}
              onClick={() => setAnswer(opt.id)}
            />
          ))}

        {q.question_type === "multiple_choice" &&
          q.options.map((opt) => {
            const selected = selectedMultiple.includes(opt.id);
            return (
              <ChoiceCard
                key={opt.id}
                selected={selected}
                multiple
                title={lang === "ar" ? opt.label_ar : opt.label_fr}
                onClick={() =>
                  setAnswer(
                    selected
                      ? selectedMultiple.filter((id) => id !== opt.id)
                      : [...selectedMultiple, opt.id]
                  )
                }
              />
            );
          })}

        {q.question_type === "text" && (
          <textarea
            rows={6}
            value={answer ?? ""}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={lang === "ar" ? "اكتب ملاحظتك هنا…" : "Écrivez votre réponse ici…"}
            className="w-full resize-y rounded-2xl border px-4 py-3 text-sm outline-none transition focus:ring-4"
            style={{ borderColor: C.border, color: C.ink, outlineColor: C.blueSoft }}
          />
        )}

        {q.question_type === "number" && (
          <input
            type="number"
            inputMode="numeric"
            min="0"
            value={answer ?? ""}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={lang === "ar" ? "أدخل رقمًا" : "Saisissez un nombre"}
            className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:ring-4"
            style={{ borderColor: C.border, color: C.ink }}
          />
        )}
      </div>
    </Card>
  );
}

function AdminDashboard({ survey, questions, setQuestions, lang, t, loadResults, results, participants, handleSignOut, handleBackToSurvey }) {
  const [tab, setTab] = useState("questions");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [adminError, setAdminError] = useState(null);
  const [weatherLocations, setWeatherLocations] = useState([]);
  const [form, setForm] = useState({
    question_ar: "",
    question_fr: "",
    question_type: "single_choice",
    required: true,
    active: true,
    options: [{ label_ar: "", label_fr: "", value: "", sort_order: 1 }],
  });

  const reset = () => {
    setEditing(null);
    setAdminError(null);
    setForm({
      question_ar: "",
      question_fr: "",
      question_type: "single_choice",
      required: true,
      active: true,
      options: [{ label_ar: "", label_fr: "", value: "", sort_order: 1 }],
    });
  };

  const reloadQuestions = useCallback(async () => {
    let surveyId = survey?.id;
    if (!surveyId) {
      const { data, error } = await supabase.from("surveys").select("id").eq("slug", SURVEY_SLUG).eq("active", true).maybeSingle();
      if (error) throw error;
      surveyId = data?.id;
    }
    if (!surveyId) throw new Error("SURVEY_NOT_FOUND");
    const { data, error } = await supabase
      .from("survey_questions")
      .select("id, question_ar, question_fr, question_type, required, active, sort_order, survey_options(id,label_ar,label_fr,value,sort_order)")
      .eq("survey_id", surveyId)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    setQuestions(
      (data || []).map((q) => ({
        ...q,
        options: (q.survey_options || []).slice().sort((a, b) => a.sort_order - b.sort_order),
      }))
    );
  }, [setQuestions, survey]);

  const seedDefaultQuestions = async () => {
    setSaving(true);
    setAdminError(null);
    try {
      let surveyId = survey?.id;
      if (!surveyId) {
        const { data, error } = await supabase.from("surveys").select("id").eq("slug", SURVEY_SLUG).eq("active", true).maybeSingle();
        if (error) throw error;
        surveyId = data?.id;
      }
      const { data: existing, error: existingError } = await supabase.from("survey_questions").select("id, question_fr").eq("survey_id", surveyId);
      if (existingError) throw existingError;

      const existingSet = new Set((existing || []).map((q) => q.question_fr.trim().toLowerCase()));
      let order = Math.max(0, ...questions.map((q) => q.sort_order || 0));

      for (const q of DEFAULT_QUESTIONS) {
        if (existingSet.has(q.question_fr.trim().toLowerCase())) continue;
        order += 1;
        const { data: inserted, error: qErr } = await supabase
          .from("survey_questions")
          .insert({
            survey_id: surveyId,
            question_ar: q.question_ar,
            question_fr: q.question_fr,
            question_type: q.question_type,
            required: q.required,
            active: true,
            sort_order: order,
          })
          .select("id")
          .single();
        if (qErr || !inserted?.id) throw qErr || new Error("QUESTION_INSERT_FAILED");
        if (q.options.length) {
          const rows = q.options.map((o, i) => ({
            question_id: inserted.id,
            label_ar: o[0],
            label_fr: o[1],
            value: o[2],
            sort_order: i + 1,
          }));
          const { error: oErr } = await supabase.from("survey_options").insert(rows);
          if (oErr) throw oErr;
        }
      }
      await reloadQuestions();
    } catch (error) {
      console.error("[survey-admin-seed]", error);
      setAdminError(String(error?.message || error));
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (q) => {
    setEditing(q.id);
    setAdminError(null);
    setForm({
      question_ar: q.question_ar,
      question_fr: q.question_fr,
      question_type: q.question_type,
      required: q.required,
      active: q.active,
      options:
        (q.options || []).length > 0
          ? q.options.map((o, i) => ({ ...o, sort_order: i + 1 }))
          : [{ label_ar: "", label_fr: "", value: "", sort_order: 1 }],
    });
  };

  const saveQuestion = async () => {
    setSaving(true);
    setAdminError(null);
    try {
      if (!form.question_ar.trim() || !form.question_fr.trim()) throw new Error("question");
      if (["single_choice", "multiple_choice"].includes(form.question_type)) {
        const validOptions = form.options.filter(
          (o) => String(o.label_ar || "").trim() && String(o.label_fr || "").trim() && String(o.value || "").trim()
        );
        if (!validOptions.length) throw new Error("options");
      }

      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) throw new Error("AUTH_REQUIRED");

      const { data: adminCheck, error: adminCheckError } = await supabase.from("admins").select("id").eq("id", authData.user.id).maybeSingle();
      if (adminCheckError) throw adminCheckError;
      if (!adminCheck) throw new Error("ADMIN_REQUIRED");

      let questionId = editing;

      if (editing) {
        const { error } = await supabase
          .from("survey_questions")
          .update({
            question_ar: form.question_ar.trim(),
            question_fr: form.question_fr.trim(),
            question_type: form.question_type,
            required: form.required,
            active: form.active,
          })
          .eq("id", editing);
        if (error) throw error;
        const { error: deleteOptionsError } = await supabase.from("survey_options").delete().eq("question_id", editing);
        if (deleteOptionsError) throw deleteOptionsError;
      } else {
        let surveyId = survey?.id;
        if (!surveyId) {
          const { data: surveyRow, error: surveyLookupError } = await supabase
            .from("surveys")
            .select("id")
            .eq("slug", SURVEY_SLUG)
            .eq("active", true)
            .maybeSingle();
          if (surveyLookupError) throw surveyLookupError;
          surveyId = surveyRow?.id;
        }
        if (!surveyId) throw new Error("SURVEY_NOT_FOUND");
        const maxOrder = Math.max(0, ...questions.map((q) => q.sort_order || 0));
        const { data, error } = await supabase
          .from("survey_questions")
          .insert({
            survey_id: surveyId,
            question_ar: form.question_ar.trim(),
            question_fr: form.question_fr.trim(),
            question_type: form.question_type,
            required: form.required,
            active: form.active,
            sort_order: maxOrder + 1,
          })
          .select("id")
          .single();
        if (error) throw error;
        questionId = data.id;
      }

      if (["single_choice", "multiple_choice"].includes(form.question_type)) {
        const options = form.options
          .filter((o) => String(o.label_ar || "").trim() && String(o.label_fr || "").trim() && String(o.value || "").trim())
          .map((o, i) => ({
            question_id: questionId,
            label_ar: String(o.label_ar).trim(),
            label_fr: String(o.label_fr).trim(),
            value: String(o.value).trim(),
            sort_order: i + 1,
          }));
        if (options.length) {
          const { error } = await supabase.from("survey_options").insert(options);
          if (error) throw error;
        }
      }

      await reloadQuestions();
      reset();
    } catch (error) {
      console.error("[survey-admin-save]", error);
      const msg = String(error?.message || error);
      setAdminError(
        lang === "ar"
          ? `تعذر حفظ السؤال: ${msg}`
          : `Impossible d’enregistrer la question : ${msg}`
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleQuestion = async (q) => {
    try {
      const { error } = await supabase.from("survey_questions").update({ active: !q.active }).eq("id", q.id);
      if (error) throw error;
      await reloadQuestions();
    } catch (error) {
      console.error("[survey-admin-toggle]", error);
      setAdminError(String(error?.message || error));
    }
  };

  const moveQuestion = async (q, direction) => {
    try {
      const sorted = [...questions].sort((a, b) => a.sort_order - b.sort_order);
      const i = sorted.findIndex((x) => x.id === q.id);
      const j = i + direction;
      if (i < 0 || j < 0 || j >= sorted.length) return;
      const a = sorted[i];
      const b = sorted[j];
      const first = await supabase.from("survey_questions").update({ sort_order: b.sort_order }).eq("id", a.id);
      if (first.error) throw first.error;
      const second = await supabase.from("survey_questions").update({ sort_order: a.sort_order }).eq("id", b.id);
      if (second.error) throw second.error;
      await reloadQuestions();
    } catch (error) {
      console.error("[survey-admin-reorder]", error);
      setAdminError(String(error?.message || error));
    }
  };

  useEffect(() => {
    if (tab !== "weather") return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.from("weather_locations").select("*").order("wilaya");
      if (!cancelled) {
        if (error) setAdminError(error.message);
        else setWeatherLocations(data || []);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tab]);

  const rByQ = useMemo(
    () =>
      questions.map((q) => ({
        question: q,
        data: (results || [])
          .filter((r) => r.question_id === q.id)
          .map((r) => ({
            name: lang === "ar" ? r.option_label_ar : r.option_label_fr,
            value: r.response_count,
            pct: r.percentage,
          })),
      })),
    [questions, results, lang]
  );

  const activeCount = questions.filter((q) => q.active).length;
  const requiredCount = questions.filter((q) => q.required && q.active).length;

  const stats = [
    { label: t.participants, value: participants, icon: Users, tone: C.blue },
    { label: t.totalQuestions, value: questions.length, icon: ClipboardList, tone: C.navy },
    { label: t.activeQuestions, value: activeCount, icon: CheckCircle2, tone: C.green },
    { label: t.completion, value: "—", icon: BarChart3, tone: C.gold },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl p-6 text-white shadow-xl" style={{ background: `linear-gradient(135deg, ${C.navy} 0%, #173A64 60%, ${C.blue} 100%)` }}>
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 text-xs font-semibold tracking-widest text-white/60">{t.dashboard}</div>
            <h2 className="text-2xl font-black">{t.institute}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-white/75">{t.aggregatedOnly}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={loadResults} className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/15">
              <RefreshCw size={14} /> {t.refresh}
            </button>
            <button onClick={handleBackToSurvey} className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/15">
              {t.survey}
            </button>
            <button onClick={handleSignOut} className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/15">
              {t.signOut}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <Card key={label} className="p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${tone}16`, color: tone }}>
              <Icon size={18} />
            </div>
            <div className="text-2xl font-black" style={{ color: C.navy }}>{value}</div>
            <div className="mt-1 text-xs font-semibold" style={{ color: C.muted }}>{label}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {[
          ["questions", t.questionsTab, ClipboardList],
          ["results", t.resultsTab, BarChart3],
          ["weather", t.weatherTab, CloudRain],
          ["settings", t.settingsTab, Settings2],
        ].map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="rounded-xl border px-3 py-3 text-xs font-bold transition"
            style={tab === key ? { borderColor: C.navy, background: C.navy, color: C.white } : { borderColor: C.border, background: C.white, color: C.slate }}
          >
            <Icon size={14} className="mb-1 inline-block" />
            <span className="ms-1">{label}</span>
          </button>
        ))}
      </div>

      {adminError && (
        <div className="rounded-2xl border p-4 text-xs" style={{ borderColor: "#F1C4C0", background: C.redSoft, color: C.red }}>
          {adminError}
        </div>
      )}

      {tab === "questions" && (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
          <Card className="overflow-hidden">
            <div className="border-b px-5 py-5 md:px-6" style={{ borderColor: C.border }}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-extrabold" style={{ color: C.navy }}>{t.manageQuestions}</h3>
                  <p className="mt-1 text-xs" style={{ color: C.muted }}>{questions.length} {t.questions}</p>
                </div>
                <div className="flex gap-2">
                  {!editing && (
                    <button onClick={seedDefaultQuestions} disabled={saving} className="rounded-xl border px-3 py-2 text-xs font-bold disabled:opacity-50" style={{ borderColor: C.border, color: C.blue }}>
                      <Plus size={14} className="me-1 inline" />
                      {t.seedQuestions}
                    </button>
                  )}
                  {editing && <button onClick={reset} className="rounded-xl border p-2" style={{ borderColor: C.border, color: C.slate }}><X size={14} /></button>}
                </div>
              </div>
            </div>
            <div className="divide-y" style={{ borderColor: C.border }}>
              {questions.length === 0 && <div className="p-7 text-center text-xs" style={{ color: C.muted }}>{t.noResults}</div>}
              {questions.map((q, i) => (
                <div key={q.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-black" style={{ background: C.sky, color: C.blue }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold leading-6" style={{ color: C.navy }}>{lang === "ar" ? q.question_ar : q.question_fr}</div>
                      <div className="mt-1 text-[11px]" style={{ color: C.muted }}>
                        {q.question_type} · {q.required ? t.required : t.optional} · {q.active ? t.active : t.cancel}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button onClick={() => moveQuestion(q, -1)} title={t.reorder} className="hidden rounded-lg border p-2 sm:block" style={{ borderColor: C.border }}><ChevronUp size={14} /></button>
                      <button onClick={() => moveQuestion(q, 1)} title={t.reorder} className="hidden rounded-lg border p-2 sm:block" style={{ borderColor: C.border }}><ChevronDown size={14} /></button>
                      <button onClick={() => startEdit(q)} className="rounded-lg border p-2" style={{ borderColor: C.border }}><Pencil size={14} /></button>
                      <button onClick={() => toggleQuestion(q)} className="rounded-lg border p-2" style={{ borderColor: C.border }}>{q.active ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 md:p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: C.blueSoft, color: C.blue }}>
                {editing ? <Pencil size={17} /> : <Plus size={17} />}
              </div>
              <div>
                <h3 className="text-sm font-extrabold" style={{ color: C.navy }}>{editing ? t.editQuestion : t.addQuestion}</h3>
                <p className="text-[11px]" style={{ color: C.muted }}>Supabase · survey_questions</p>
              </div>
            </div>

            <div className="space-y-3">
              <input value={form.question_ar} onChange={(e) => setForm({ ...form, question_ar: e.target.value })} dir="rtl" placeholder={t.arabicQuestion} className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none" style={{ borderColor: C.border }} />
              <input value={form.question_fr} onChange={(e) => setForm({ ...form, question_fr: e.target.value })} placeholder={t.frenchQuestion} className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none" style={{ borderColor: C.border }} />

              <div className="grid gap-3 sm:grid-cols-3">
                <select value={form.question_type} onChange={(e) => setForm({ ...form, question_type: e.target.value })} className="rounded-xl border px-3 py-2.5 text-sm" style={{ borderColor: C.border }}>
                  <option value="single_choice">{t.single}</option>
                  <option value="multiple_choice">{t.multiple}</option>
                  <option value="text">{t.text}</option>
                  <option value="number">{t.number}</option>
                </select>
                <label className="flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold" style={{ borderColor: C.border }}>
                  <input type="checkbox" checked={form.required} onChange={(e) => setForm({ ...form, required: e.target.checked })} />
                  {t.required}
                </label>
                <label className="flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold" style={{ borderColor: C.border }}>
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                  {t.active}
                </label>
              </div>

              {["single_choice", "multiple_choice"].includes(form.question_type) && (
                <div className="pt-2">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-xs font-extrabold" style={{ color: C.navy }}>{t.options}</div>
                    <button onClick={() => setForm((f) => ({ ...f, options: [...f.options, { label_ar: "", label_fr: "", value: "", sort_order: f.options.length + 1 }] }))} className="text-xs font-bold" style={{ color: C.blue }}>
                      <Plus size={13} className="me-1 inline" />{t.addOption}
                    </button>
                  </div>

                  <div className="space-y-2">
                    {form.options.map((o, i) => (
                      <div key={`${i}-${o.id || "new"}`} className="grid gap-2 sm:grid-cols-[1fr_1fr_110px_34px]">
                        <input value={o.label_ar} onChange={(e) => setForm((f) => ({ ...f, options: f.options.map((x, idx) => idx === i ? { ...x, label_ar: e.target.value } : x) }))} dir="rtl" placeholder="العربية" className="rounded-lg border px-2.5 py-2 text-xs" style={{ borderColor: C.border }} />
                        <input value={o.label_fr} onChange={(e) => setForm((f) => ({ ...f, options: f.options.map((x, idx) => idx === i ? { ...x, label_fr: e.target.value } : x) }))} placeholder="Français" className="rounded-lg border px-2.5 py-2 text-xs" style={{ borderColor: C.border }} />
                        <input value={o.value} onChange={(e) => setForm((f) => ({ ...f, options: f.options.map((x, idx) => idx === i ? { ...x, value: e.target.value } : x) }))} placeholder="value" className="rounded-lg border px-2.5 py-2 text-xs" style={{ borderColor: C.border }} />
                        <button onClick={() => setForm((f) => ({ ...f, options: f.options.length === 1 ? f.options : f.options.filter((_, idx) => idx !== i) }))} className="rounded-lg border" style={{ borderColor: C.border, color: C.red }}><Trash2 size={13} className="mx-auto" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={saveQuestion} disabled={saving} className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white disabled:opacity-60" style={{ background: C.navy }}>
                <Save size={14} /> {saving ? t.submitting : t.save}
              </button>
            </div>
          </Card>
        </div>
      )}

      {tab === "results" && (
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-extrabold" style={{ color: C.navy }}>{t.resultsTab}</div>
                <div className="mt-1 text-xs" style={{ color: C.muted }}>{t.aggregatedOnly}</div>
              </div>
              <div className="rounded-xl px-4 py-3" style={{ background: C.blueSoft }}>
                <div className="text-2xl font-black" style={{ color: C.blue }}>{participants}</div>
                <div className="text-[11px] font-semibold" style={{ color: C.slate }}>{t.participants}</div>
              </div>
            </div>
          </Card>
          {rByQ.map(({ question, data }) => (
            <Card key={question.id} className="p-5 md:p-6">
              <div className="mb-2 text-sm font-extrabold leading-6" style={{ color: C.navy }}>{lang === "ar" ? question.question_ar : question.question_fr}</div>
              {data.length ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={85} label={({ name, pct }) => `${name}: ${pct}%`}>
                        {data.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="py-10 text-center text-xs" style={{ color: C.muted }}>{t.noOptions}</div>
              )}
            </Card>
          ))}
        </div>
      )}

      {tab === "weather" && (
        <Card className="p-5 md:p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: C.sky, color: C.blue }}><CloudRain size={17} /></div>
            <div>
              <div className="text-sm font-extrabold" style={{ color: C.navy }}>{t.weather}</div>
              <div className="text-xs" style={{ color: C.muted }}>Données existantes · weather_locations</div>
            </div>
          </div>
          {weatherLocations.length === 0 ? (
            <div className="rounded-2xl p-5 text-center text-xs" style={{ background: C.sky, color: C.muted }}>{t.noWeather}</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {weatherLocations.map((w) => (
                <div key={w.id} className="rounded-2xl border p-4" style={{ borderColor: C.border }}>
                  <div className="text-sm font-bold" style={{ color: C.navy }}>{w.wilaya} — {w.location_name}</div>
                  <div className="mt-1 text-xs" style={{ color: C.muted }}>{w.latitude}, {w.longitude}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {tab === "settings" && (
        <Card className="p-6">
          <div className="mb-3 flex items-center gap-2">
            <Settings2 size={17} style={{ color: C.blue }} />
            <div className="text-sm font-extrabold" style={{ color: C.navy }}>{t.settingsTab}</div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl p-4" style={{ background: C.sky }}>
              <div className="text-xs font-bold" style={{ color: C.navy }}>Survey slug</div>
              <div className="mt-1 text-sm" style={{ color: C.slate }}>{SURVEY_SLUG}</div>
            </div>
            <div className="rounded-2xl p-4" style={{ background: C.sky }}>
              <div className="text-xs font-bold" style={{ color: C.navy }}>Supabase</div>
              <div className="mt-1 text-sm" style={{ color: C.slate }}>Connexion existante conservée</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function App() {
  const [lang, setLang] = useState("fr");
  const [mode, setMode] = useState("form"); // form | admin
  const [survey, setSurvey] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loadingSurvey, setLoadingSurvey] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [answers, setAnswers] = useState(loadLocalAnswers);
  const [step, setStep] = useState(() => Number(window.localStorage.getItem(STEP_STORAGE_KEY) || 0));
  const [started, setStarted] = useState(() => Number(window.localStorage.getItem(STEP_STORAGE_KEY) || 0) > 0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPromptOpen, setAdminPromptOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState(null);
  const [authBusy, setAuthBusy] = useState(false);

  const [results, setResults] = useState(null);
  const [participants, setParticipants] = useState(0);

  const clickTimestamps = useRef([]);
  const t = T[lang];

  const qText = (q) => lang === "ar" ? q.question_ar : q.question_fr;

  const loadSurvey = useCallback(async () => {
    setLoadingSurvey(true);
    setLoadError(null);
    try {
      const { data: surveyRow, error: sErr } = await supabase
        .from("surveys")
        .select("id, slug, title_ar, title_fr, active")
        .eq("slug", SURVEY_SLUG)
        .eq("active", true)
        .single();
      if (sErr || !surveyRow) throw sErr || new Error("SURVEY_NOT_FOUND");

      const { data: qRows, error: qErr } = await supabase
        .from("survey_questions")
        .select("id, question_ar, question_fr, question_type, required, sort_order, active, survey_options(id, label_ar, label_fr, value, sort_order)")
        .eq("survey_id", surveyRow.id)
        .eq("active", true)
        .order("sort_order", { ascending: true });
      if (qErr) throw qErr;

      setSurvey(surveyRow);
      setQuestions((qRows || []).map((q) => ({
        ...q,
        options: (q.survey_options || []).slice().sort((a, b) => a.sort_order - b.sort_order),
      })));
    } catch (error) {
      console.error("[survey-load]", error);
      setLoadError(t.genericError);
    } finally {
      setLoadingSurvey(false);
    }
  }, [t.genericError]);

  useEffect(() => { loadSurvey(); }, [loadSurvey]);

  useEffect(() => {
    const { data: authSubscription } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    supabase.auth.getSession().then(({ data }) => setSession(data.session || null));
    return () => authSubscription.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!session?.user) {
        setIsAdmin(false);
        return;
      }
      const { data, error } = await supabase.from("admins").select("id").eq("id", session.user.id).maybeSingle();
      if (!cancelled) setIsAdmin(!error && !!data);
    })();
    return () => { cancelled = true; };
  }, [session]);

  useEffect(() => {
    window.localStorage.setItem(ANSWERS_STORAGE_KEY, JSON.stringify(answers));
  }, [answers]);

  useEffect(() => {
    window.localStorage.setItem(STEP_STORAGE_KEY, String(step));
  }, [step]);

  const answeredCount = useMemo(() => {
    return questions.filter((q) => {
      const value = answers[q.id];
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null && String(value).trim() !== "";
    }).length;
  }, [answers, questions]);

  const requiredAnsweredCount = useMemo(() => {
    return questions.filter((q) => {
      if (!q.required) return false;
      const value = answers[q.id];
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null && String(value).trim() !== "";
    }).length;
  }, [answers, questions]);

  const isCurrentAnswered = useMemo(() => {
    const q = questions[step];
    if (!q || !q.required) return true;
    const value = answers[q.id];
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && String(value).trim() !== "";
  }, [answers, questions, step]);

  function updateAnswer(questionId, value) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
    setFormError(null);
  }

  function startSurvey() {
    setStarted(true);
    setStep(0);
    setFormError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goNext() {
    if (!isCurrentAnswered) {
      setFormError(t.validation);
      return;
    }
    setFormError(null);
    setStep((s) => Math.min(questions.length - 1, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goPrevious() {
    setFormError(null);
    setStep((s) => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleTitleClick() {
    const now = Date.now();
    clickTimestamps.current = clickTimestamps.current.filter((ts) => now - ts < ADMIN_TRIGGER_WINDOW_MS);
    clickTimestamps.current.push(now);
    if (clickTimestamps.current.length >= ADMIN_TRIGGER_CLICKS) {
      clickTimestamps.current = [];
      setAdminPromptOpen(true);
    }
  }

  async function handleAdminLogin() {
    setAuthBusy(true);
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.session) throw error || new Error("AUTH");
      const { data: adminRow, error: aErr } = await supabase.from("admins").select("id").eq("id", data.session.user.id).maybeSingle();
      if (aErr || !adminRow) {
        await supabase.auth.signOut();
        throw new Error("NOT_ADMIN");
      }
      setIsAdmin(true);
      setAdminPromptOpen(false);
      setMode("admin");
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("[survey-admin-auth]", error);
      setAuthError(t.wrongCredentials);
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setMode("form");
  }

  const loadResults = useCallback(async () => {
    if (!survey || !isAdmin) return;
    try {
      const { data, error } = await supabase.from("public_survey_results").select("*").eq("survey_id", survey.id);
      if (error) throw error;
      setResults(data || []);

      const { data: participantData } = await supabase
        .from("public_survey_participant_counts")
        .select("total_participants")
        .eq("survey_id", survey.id)
        .maybeSingle();
      setParticipants(participantData?.total_participants || 0);
    } catch (error) {
      console.error("[survey-results]", error);
      setFormError(t.genericError);
    }
  }, [isAdmin, survey, t.genericError]);

  useEffect(() => {
    if (mode === "admin" && isAdmin) loadResults();
  }, [mode, isAdmin, loadResults]);

  async function handleSubmit() {
    if (!survey) return;
    if (!isCurrentAnswered) {
      setFormError(t.validation);
      return;
    }

    const missingRequired = questions.some((q) => {
      if (!q.required) return false;
      const value = answers[q.id];
      return Array.isArray(value) ? value.length === 0 : value === undefined || value === null || String(value).trim() === "";
    });

    if (missingRequired) {
      setFormError(t.validation);
      const firstMissing = questions.findIndex((q) => {
        if (!q.required) return false;
        const value = answers[q.id];
        return Array.isArray(value) ? value.length === 0 : value === undefined || value === null || String(value).trim() === "";
      });
      if (firstMissing >= 0) setStep(firstMissing);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const respondentId = getRespondentId();
      const responseId = crypto.randomUUID();
      const payload = questions
        .filter((q) => answers[q.id] !== undefined && answers[q.id] !== null && String(answers[q.id]).trim() !== "")
        .flatMap((q) => {
          const value = answers[q.id];
          const values = Array.isArray(value) ? value : [value];
          return values.map((v) => {
            const opt = q.options.find((o) => o.id === v);
            return {
              question_id: q.id,
              answer_value: opt?.value ?? String(v),
              answer_text: opt ? (lang === "ar" ? opt.label_ar : opt.label_fr) : String(v),
            };
          });
        });

      if (!payload.length) throw new Error("NO_ANSWERS");

      const { data: rpcResponseId, error: rpcErr } = await supabase.rpc("submit_survey_response", {
        p_survey_id: survey.id,
        p_respondent_id: respondentId,
        p_answers: payload,
      });

      if (!rpcErr && rpcResponseId) {
        setSubmitted(true);
        window.localStorage.removeItem(ANSWERS_STORAGE_KEY);
        window.localStorage.removeItem(STEP_STORAGE_KEY);
        return;
      }

      if (String(rpcErr?.message || "").includes("DUPLICATE_RESPONSE")) {
        throw rpcErr;
      }

      if (rpcErr) {
        const { error: responseErr } = await supabase.from("survey_responses").insert({
          id: responseId,
          survey_id: survey.id,
          respondent_id: respondentId,
        });
        if (responseErr) throw responseErr;

        const answerRows = payload.map((a) => ({
          response_id: responseId,
          question_id: a.question_id,
          answer_value: a.answer_value,
          answer_text: a.answer_text,
        }));
        const { error: answersErr } = await supabase.from("survey_answers").insert(answerRows);
        if (answersErr) {
          await supabase.from("survey_responses").delete().eq("id", responseId);
          throw answersErr;
        }
      } else {
        throw new Error("RESPONSE_NOT_CREATED");
      }

      setSubmitted(true);
      window.localStorage.removeItem(ANSWERS_STORAGE_KEY);
      window.localStorage.removeItem(STEP_STORAGE_KEY);
    } catch (error) {
      console.error("[survey-submit]", error);
      setFormError(formatErrorMessage(lang, t.genericError, error));
    } finally {
      setSubmitting(false);
    }
  }

  const progressPct = questions.length ? Math.round(((step + 1) / questions.length) * 100) : 0;

  if (loadingSurvey) {
    return (
      <div className="min-h-screen" style={{ background: C.ivory }} dir={t.dir}>
        <div className="mx-auto max-w-4xl px-4 py-14">
          <div className="animate-pulse space-y-4">
            <div className="h-24 rounded-3xl bg-white shadow-sm" />
            <div className="h-8 w-1/3 rounded-lg bg-white" />
            <div className="h-64 rounded-3xl bg-white shadow-sm" />
          </div>
          <div className="mt-5 text-center text-xs" style={{ color: C.muted }}>{t.loading}</div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return <ErrorState lang={lang} onRetry={loadSurvey} message={loadError} />;
  }

  return (
    <div dir={t.dir} className="min-h-screen" style={{ background: C.ivory, color: C.ink }}>
      <header className="relative overflow-hidden text-white" style={{ background: `radial-gradient(circle at 85% 15%, rgba(66,127,190,.38), transparent 35%), linear-gradient(135deg, ${C.navy} 0%, #153B68 62%, #1D5E96 100%)` }}>
        <div className="absolute -right-20 -top-16 h-64 w-64 rounded-full border border-white/10 bg-white/5" />
        <div className="absolute -left-24 bottom-0 h-56 w-56 rounded-full border border-white/10 bg-white/5" />
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button type="button" onClick={handleTitleClick} className="flex items-center gap-3 text-start">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm">
                <ShieldCheck size={20} />
              </span>
              <span>
                <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">{t.kicker}</span>
                <span className="mt-0.5 block max-w-[220px] text-xs font-semibold leading-5 text-white/85 md:max-w-none">{t.institute}</span>
              </span>
            </button>

            <div className="flex items-center gap-2">
              {isAdmin && (
                <button onClick={() => setMode("admin")} className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold backdrop-blur-sm">
                  <BarChart3 size={13} className="me-1 inline" />
                  {t.dashboard}
                </button>
              )}
              <button
                onClick={() => setLang((current) => current === "fr" ? "ar" : "fr")}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold backdrop-blur-sm"
              >
                <Globe2 size={14} />
                {lang === "fr" ? "العربية" : "Français"}
              </button>
            </div>
          </div>

          {mode === "form" && (
            <div className="grid items-center gap-9 pb-12 pt-12 lg:grid-cols-[1.25fr_.75fr] lg:pb-16">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold backdrop-blur-sm">
                  <Sprout size={13} />
                  {t.kicker}
                </div>
                <h1 className="max-w-4xl text-3xl font-black leading-tight tracking-tight md:text-5xl md:leading-[1.12]" onClick={handleTitleClick}>
                  {t.title}
                </h1>
                <p className="mt-5 max-w-3xl text-sm leading-7 text-white/72 md:text-base">{t.subtitle}</p>

                <div className="mt-7 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-white/50">{t.duration}</div>
                    <div className="mt-1 text-sm font-extrabold">{t.minutes}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-white/50">{t.questions}</div>
                    <div className="mt-1 text-sm font-extrabold">{questions.length}</div>
                  </div>
                  <div className="col-span-2 rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm sm:col-span-1">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-white/50">ISCAE</div>
                    <div className="mt-1 text-sm font-extrabold">{lang === "ar" ? t.instituteArabic : "Mauritanie"}</div>
                  </div>
                </div>

                {!started && (
                  <button onClick={startSurvey} className="mt-8 inline-flex items-center gap-3 rounded-2xl px-5 py-3.5 text-sm font-black shadow-lg transition hover:-translate-y-0.5" style={{ background: C.white, color: C.navy }}>
                    <ClipboardList size={18} />
                    {t.start}
                    {lang === "fr" ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
                  </button>
                )}
              </div>

              <div className="hidden lg:block">
                <div className="relative mx-auto max-w-sm">
                  <div className="absolute inset-0 rounded-[2.5rem] bg-white/10 blur-2xl" />
                  <div className="relative rounded-[2.5rem] border border-white/10 bg-white/10 p-7 shadow-2xl backdrop-blur-md">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-3xl bg-white p-5" style={{ color: C.navy }}>
                        <CloudRain size={28} style={{ color: C.blue }} />
                        <div className="mt-8 text-sm font-black">Climat</div>
                        <div className="mt-1 text-xs" style={{ color: C.muted }}>Sécheresse · pluie · chaleur</div>
                      </div>
                      <div className="rounded-3xl p-5 text-white" style={{ background: "rgba(20,133,91,.9)" }}>
                        <Sprout size={28} />
                        <div className="mt-8 text-sm font-black">Agriculture</div>
                        <div className="mt-1 text-xs text-white/70">Résilience du secteur</div>
                      </div>
                      <div className="col-span-2 rounded-3xl bg-white p-5" style={{ color: C.navy }}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.muted }}>Paramétrique</div>
                            <div className="mt-1 text-2xl font-black">Protection</div>
                          </div>
                          <ShieldCheck size={38} style={{ color: C.gold }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-7 md:px-8 md:py-10">
        {mode === "admin" && isAdmin ? (
          <AdminDashboard
            survey={survey}
            questions={questions}
            setQuestions={setQuestions}
            lang={lang}
            t={t}
            loadResults={loadResults}
            results={results}
            participants={participants}
            handleSignOut={handleSignOut}
            handleBackToSurvey={() => setMode("form")}
          />
        ) : submitted ? (
          <SuccessScreen lang={lang} />
        ) : (
          <>
            <div className="mx-auto max-w-4xl">
              <Card className="mb-5 overflow-hidden">
                <div className="p-4 md:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-extrabold uppercase tracking-[0.14em]" style={{ color: C.muted }}>{t.progress}</div>
                      <div className="mt-1 text-sm font-black" style={{ color: C.navy }}>
                        {started ? `${t.question} ${Math.min(step + 1, questions.length)} / ${questions.length}` : t.shortTitle}
                      </div>
                    </div>
                    <div className="rounded-full px-3 py-1.5 text-xs font-black" style={{ background: C.blueSoft, color: C.blue }}>
                      {started ? `${progressPct}%` : `${answeredCount}/${questions.length}`}
                    </div>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full" style={{ background: "#E8EEF5" }}>
                    <div className="h-full rounded-full transition-all duration-300" style={{ width: `${started ? progressPct : 0}%`, background: `linear-gradient(90deg, ${C.blue}, ${C.green})` }} />
                  </div>
                </div>
              </Card>

              {!started ? (
                <div className="grid gap-5 md:grid-cols-[1.1fr_.9fr]">
                  <Card className="p-6 md:p-8">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: C.blueSoft, color: C.blue }}>
                      <ClipboardList size={21} />
                    </div>
                    <h2 className="text-xl font-black" style={{ color: C.navy }}>{lang === "ar" ? "قبل البدء" : "Avant de commencer"}</h2>
                    <p className="mt-3 text-sm leading-7" style={{ color: C.slate }}>{t.anonymous}</p>
                    <button onClick={startSurvey} className="mt-7 inline-flex items-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5" style={{ background: C.navy }}>
                      <ClipboardList size={17} />
                      {t.start}
                    </button>
                  </Card>
                  <Card className="p-6 md:p-8">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl p-4" style={{ background: C.sky }}>
                        <CloudSun size={20} style={{ color: C.gold }} />
                        <div className="mt-6 text-xs font-black" style={{ color: C.navy }}>{t.duration}</div>
                        <div className="mt-1 text-sm" style={{ color: C.slate }}>{t.minutes}</div>
                      </div>
                      <div className="rounded-2xl p-4" style={{ background: C.sky }}>
                        <ClipboardList size={20} style={{ color: C.blue }} />
                        <div className="mt-6 text-xs font-black" style={{ color: C.navy }}>{t.questions}</div>
                        <div className="mt-1 text-sm" style={{ color: C.slate }}>{questions.length}</div>
                      </div>
                      <div className="col-span-2 rounded-2xl p-4" style={{ background: C.greenSoft }}>
                        <div className="flex items-center gap-2">
                          <ShieldCheck size={20} style={{ color: C.green }} />
                          <span className="text-xs font-black" style={{ color: C.green }}>{t.privacyTitle}</span>
                        </div>
                        <p className="mt-2 text-xs leading-6" style={{ color: C.slate }}>{t.anonymous}</p>
                      </div>
                    </div>
                  </Card>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="rounded-2xl border p-4 text-xs leading-6" style={{ borderColor: C.border, background: C.sky, color: C.slate }}>
                    <Info size={14} className="me-2 inline align-[-2px]" style={{ color: C.blue }} />
                    {t.anonymous}
                  </div>

                  {questions[step] && (
                    <QuestionCard
                      q={questions[step]}
                      index={step}
                      total={questions.length}
                      answer={answers[questions[step].id]}
                      setAnswer={(value) => updateAnswer(questions[step].id, value)}
                      lang={lang}
                    />
                  )}

                  {formError && (
                    <div className="rounded-2xl border p-4 text-xs font-semibold" style={{ borderColor: "#F1C4C0", background: C.redSoft, color: C.red }}>
                      {formError}
                    </div>
                  )}

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <button onClick={goPrevious} disabled={step === 0 || submitting} className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold disabled:opacity-40" style={{ borderColor: C.border, color: C.navy }}>
                      {lang === "fr" ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                      {t.previous}
                    </button>
                    {step < questions.length - 1 ? (
                      <button onClick={goNext} disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-black text-white shadow-lg disabled:opacity-60" style={{ background: C.navy }}>
                        {t.next}
                        {lang === "fr" ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
                      </button>
                    ) : (
                      <button onClick={handleSubmit} disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-black text-white shadow-lg disabled:opacity-60" style={{ background: C.green }}>
                        <Send size={16} />
                        {submitting ? t.submitting : t.submit}
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pb-4">
                    {questions.map((q, i) => {
                      const answered = Array.isArray(answers[q.id]) ? answers[q.id].length > 0 : answers[q.id] !== undefined && String(answers[q.id]).trim() !== "";
                      return (
                        <button key={q.id} onClick={() => { setStep(i); setFormError(null); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="h-2.5 rounded-full transition-all" style={{ width: i === step ? 26 : 10, background: i === step ? C.navy : answered ? C.green : "#CBD5E1" }} aria-label={`${t.question} ${i + 1}`} />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {adminPromptOpen && !isAdmin && (
          <Card className="mx-auto mt-6 max-w-md p-5 md:p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: C.goldSoft, color: C.gold }}><Lock size={17} /></div>
              <div>
                <div className="text-sm font-extrabold" style={{ color: C.navy }}>{t.adminTitle}</div>
                <div className="text-[11px]" style={{ color: C.muted }}>{t.hiddenAdmin}</div>
              </div>
            </div>
            <div className="space-y-3">
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder={t.email} className="w-full rounded-xl border px-3 py-2.5 text-sm" style={{ borderColor: C.border }} />
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder={t.password} onKeyDown={(e) => { if (e.key === "Enter") handleAdminLogin(); }} className="w-full rounded-xl border px-3 py-2.5 text-sm" style={{ borderColor: C.border }} />
              {authError && <div className="rounded-xl p-3 text-xs" style={{ background: C.redSoft, color: C.red }}>{authError}</div>}
              <div className="flex gap-2">
                <button onClick={handleAdminLogin} disabled={authBusy} className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black text-white disabled:opacity-60" style={{ background: C.navy }}>
                  <Lock size={14} /> {authBusy ? "…" : t.signIn}
                </button>
                <button onClick={() => { setAdminPromptOpen(false); setAuthError(null); }} className="rounded-xl border px-4 py-2.5 text-xs font-bold" style={{ borderColor: C.border, color: C.slate }}>
                  {t.cancel}
                </button>
              </div>
            </div>
          </Card>
        )}
      </main>

      <footer className="border-t bg-white/60 px-4 py-8 md:px-8" style={{ borderColor: C.border }}>
        <div className="mx-auto flex max-w-6xl flex-col gap-3 text-xs sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="font-bold" style={{ color: C.navy }}>{t.institute}</div>
            <div className="mt-1 leading-6" style={{ color: C.muted }}>{t.title}</div>
          </div>
          <div className="text-right leading-6" style={{ color: C.muted }}>
            {t.kicker}<br />
            {t.instituteArabic}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
