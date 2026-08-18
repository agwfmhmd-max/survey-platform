import React, { useState, useEffect, useCallback, useRef } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Globe, ClipboardList, CheckCircle2, Repeat, Info, Shield, Lock, ArrowRight, Plus, Pencil, Trash2, Eye, EyeOff, GripVertical, Save, X, CloudRain } from "lucide-react";
import { supabase } from "./lib/supabaseClient";

/* ============================================================
   DESIGN TOKENS (unchanged — matches the official platform)
   ============================================================ */
const C = {
  navy: "#0B1E39", blue: "#1B4E8C", blueLight: "#3B6FAE", blueSoft: "#EAF1FA",
  ivory: "#F6F7FA", white: "#FFFFFF", green: "#1E8A5F", greenSoft: "#E4F5EC",
  gold: "#B08A3E", ink: "#111827", slate: "#4B5563", slateLight: "#8792A2",
  red: "#B93A32", border: "#E2E6ED",
};
const PIE_COLORS = [C.blue, C.blueLight, C.gold, C.red];

/* ============================================================
   UI STRINGS (not survey content — the questions themselves now
   come from Supabase, not from this file)
   ============================================================ */
const T = {
  fr: {
    dir: "ltr",
    kicker: "ISCAE Mauritanie · Licence 3 · Banque & Assurance",
    title: "Sondage — Assurance Paramétrique Climatique",
    subtitle: "Votre avis compte pour notre étude de faisabilité sur les secteurs agricole et de l'élevage en Mauritanie.",
    shareNote: "Vos réponses sont enregistrées de façon anonyme pour alimenter les résultats agrégés de l'étude. Aucune donnée personnelle identifiante n'est demandée.",
    submit: "Envoyer mes réponses", submitting: "Envoi en cours…",
    thanksTitle: "Merci pour votre réponse !", thanksText: "Votre réponse a été enregistrée.",
    newResponse: "Répondre à nouveau",
    totalResponses: "Réponses collectées", noResponses: "Aucune réponse collectée pour le moment.",
    loading: "Chargement…", errorSubmit: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
    errorLoad: "Une erreur est survenue lors du chargement des résultats.", refresh: "Actualiser",
    required: "Merci de répondre à toutes les questions avant d'envoyer.",
    duplicate: "Vous avez déjà répondu à ce sondage.",
    adminTitle: "Espace réservé à l'équipe du projet",
    emailLabel: "Email", passwordLabel: "Mot de passe", adminSubmit: "Se connecter",
    adminWrong: "Identifiants incorrects ou accès non autorisé.", adminBack: "Retour au sondage",
    footer: "Étude de faisabilité de l'assurance paramétrique climatique en Mauritanie — Projet de fin d'études, Banque et Assurance, ISCAE — Développé par MDA",
    signOut: "Se déconnecter",
  },
  ar: {
    dir: "rtl",
    kicker: "إسكاي موريتانيا · الإجازة 3 · بنوك وتأمين",
    title: "استبيان — التأمين التأشيري المناخي",
    subtitle: "رأيكم يهمّنا لدراسة الجدوى التي نُعدّها حول قطاعي الزراعة وتربية الماشية في موريتانيا.",
    shareNote: "تُسجَّل إجاباتكم بشكل مجهول لتغذية النتائج الإجمالية للدراسة. لا تُطلب أي بيانات شخصية مُعرِّفة.",
    submit: "إرسال إجاباتي", submitting: "جارٍ الإرسال…",
    thanksTitle: "شكرًا على إجابتك!", thanksText: "تم تسجيل إجابتك.",
    newResponse: "الإجابة مجددًا",
    totalResponses: "عدد الردود المجمَّعة", noResponses: "لم يتم جمع أي رد حتى الآن.",
    loading: "جارٍ التحميل…", errorSubmit: "حدث خطأ أثناء الإرسال. حاول مجددًا.",
    errorLoad: "حدث خطأ أثناء تحميل النتائج.", refresh: "تحديث",
    required: "يرجى الإجابة على جميع الأسئلة قبل الإرسال.",
    duplicate: "لقد أجبت على هذا الاستبيان من قبل.",
    adminTitle: "منطقة مخصصة لفريق المشروع",
    emailLabel: "البريد الإلكتروني", passwordLabel: "كلمة المرور", adminSubmit: "تسجيل الدخول",
    adminWrong: "بيانات الدخول غير صحيحة أو الوصول غير مصرح به.", adminBack: "العودة إلى الاستبيان",
    footer: "دراسة جدوى التأمين التأشيري المناخي في موريتانيا — مشروع تخرج، بنوك وتأمين، إسكاي — تطوير MDA",
    signOut: "تسجيل الخروج",
  },
};

// Slug of the survey to render. Change if you manage several surveys.
const SURVEY_SLUG = "assurance-parametrique-2026";

const DEFAULT_QUESTIONS = [
  { question_ar: "ما هو عمرك؟", question_fr: "Quel âge avez-vous ?", question_type: "number", required: true, options: [] },
  { question_ar: "ما هو نشاطك الرئيسي؟", question_fr: "Quelle est votre activité principale ?", question_type: "single_choice", required: true, options: [
    ["الزراعة", "Agriculture", "agriculture"], ["تربية المواشي", "Élevage", "elevage"], ["الزراعة وتربية المواشي", "Agriculture et élevage", "agri_elevage"], ["نشاط آخر", "Autre activité", "autre"]
  ]},
  { question_ar: "هل سبق أن تعرضت لخسائر بسبب مخاطر مناخية؟", question_fr: "Avez-vous déjà subi des pertes liées à des risques climatiques ?", question_type: "single_choice", required: true, options: [["نعم", "Oui", "oui"], ["لا", "Non", "non"]] },
  { question_ar: "ما الخطر المناخي الأكثر تأثيرًا على نشاطك؟", question_fr: "Quel risque climatique affecte le plus votre activité ?", question_type: "single_choice", required: true, options: [["الجفاف", "Sécheresse", "secheresse"], ["الفيضانات", "Inondations", "inondations"], ["موجات الحرارة", "Vagues de chaleur", "chaleur"], ["الأمطار غير المنتظمة", "Pluviométrie irrégulière", "pluie_irreguliere"], ["آخر", "Autre", "autre"]] },
  { question_ar: "هل تعرف التأمين البارامتري؟", question_fr: "Connaissez-vous l’assurance paramétrique ?", question_type: "single_choice", required: true, options: [["نعم", "Oui", "oui"], ["سمعت عنه فقط", "J’en ai seulement entendu parler", "entendu"], ["لا", "Non", "non"]] },
  { question_ar: "هل تعتقد أن التأمين البارامتري يمكن أن يساعد في حماية النشاط من المخاطر المناخية؟", question_fr: "Pensez-vous que l’assurance paramétrique peut aider à protéger l’activité contre les risques climatiques ?", question_type: "single_choice", required: true, options: [["نعم", "Oui", "oui"], ["ربما", "Peut-être", "peut_etre"], ["لا", "Non", "non"]] },
  { question_ar: "هل ستكون مستعدًا للاشتراك في تأمين بارامتري مناسب لنشاطك؟", question_fr: "Seriez-vous prêt à souscrire une assurance paramétrique adaptée à votre activité ?", question_type: "single_choice", required: true, options: [["نعم", "Oui", "oui"], ["ربما", "Peut-être", "peut_etre"], ["لا", "Non", "non"]] },
  { question_ar: "ما العامل الأكثر أهمية بالنسبة لك عند اختيار هذا النوع من التأمين؟", question_fr: "Quel facteur serait le plus important pour vous dans le choix de cette assurance ?", question_type: "single_choice", required: true, options: [["السعر", "Le prix", "prix"], ["سرعة التعويض", "La rapidité de l’indemnisation", "rapidite"], ["وضوح المؤشر المناخي", "La clarté de l’indice climatique", "indice"], ["الثقة في شركة التأمين", "La confiance dans l’assureur", "confiance"]] },
  { question_ar: "ما مستوى ثقتك في شركات التأمين لتقديم هذا المنتج؟", question_fr: "Quel est votre niveau de confiance envers les assureurs pour proposer ce produit ?", question_type: "single_choice", required: true, options: [["مرتفع", "Élevé", "eleve"], ["متوسط", "Moyen", "moyen"], ["ضعيف", "Faible", "faible"]] },
  { question_ar: "ما اقتراحك أو ملاحظتك حول التأمين ضد المخاطر المناخية؟", question_fr: "Quelle est votre suggestion ou remarque concernant l’assurance contre les risques climatiques ?", question_type: "text", required: false, options: [] }
];

// Hidden admin-login trigger: N clicks on the platform name within a
// time window. Adjust here only — never expose this as a visible button.
const ADMIN_TRIGGER_CLICKS = 5;
const ADMIN_TRIGGER_WINDOW_MS = 3000;

// Anonymous per-browser respondent id, used ONLY to enforce "one
// response per participant" when the survey disallows repeat answers.
// This is a random device/browser marker, not personal data, and it is
// never treated as the source of truth — Supabase is.
function getRespondentId() {
  const KEY = "survey_respondent_id";
  let id = window.localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(KEY, id);
  }
  return id;
}

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl border p-6 ${className}`} style={{ borderColor: C.border }}>{children}</div>
);


function AdminDashboard({ survey, questions, setQuestions, lang, t, loadResults, results, participants, handleSignOut, handleBackToSurvey }) {
  const [tab, setTab] = useState("questions");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [adminError, setAdminError] = useState(null);
  const [form, setForm] = useState({ question_ar: "", question_fr: "", question_type: "single_choice", required: true, active: true, options: [] });
  const [weatherLocations, setWeatherLocations] = useState([]);

  const reset = () => { setEditing(null); setForm({ question_ar: "", question_fr: "", question_type: "single_choice", required: true, active: true, options: [{label_ar:"",label_fr:"",value:"",sort_order:1} ]}); setAdminError(null); };

  const seedDefaultQuestions = async () => {
    setSaving(true); setAdminError(null);
    try {
      let surveyId = survey?.id;
      if (!surveyId) {
        const { data, error } = await supabase.from("surveys").select("id").eq("slug", SURVEY_SLUG).eq("active", true).maybeSingle();
        if (error) throw error;
        surveyId = data?.id;
      }
      if (!surveyId) throw new Error("SURVEY_NOT_FOUND");
      const { data: existing, error: existingError } = await supabase.from("survey_questions").select("id, question_fr").eq("survey_id", surveyId);
      if (existingError) throw existingError;
      const existingSet = new Set((existing || []).map(q => q.question_fr.trim().toLowerCase()));
      let order = Math.max(0, ...(questions || []).map(q => q.sort_order || 0));
      for (const q of DEFAULT_QUESTIONS) {
        if (existingSet.has(q.question_fr.trim().toLowerCase())) continue;
        order += 1;
        const { data: inserted, error: qErr } = await supabase.from("survey_questions").insert({ survey_id: surveyId, question_ar: q.question_ar, question_fr: q.question_fr, question_type: q.question_type, required: q.required, active: true, sort_order: order }).select("id").single();
        if (qErr || !inserted?.id) throw qErr || new Error("QUESTION_INSERT_FAILED");
        if (q.options.length) {
          const rows = q.options.map((o, i) => ({ question_id: inserted.id, label_ar: o[0], label_fr: o[1], value: o[2], sort_order: i + 1 }));
          const { error: oErr } = await supabase.from("survey_options").insert(rows);
          if (oErr) throw oErr;
        }
      }
      await reloadQuestions();
    } catch (e) {
      setAdminError(e?.message || String(e));
    } finally { setSaving(false); }
  };
  const startEdit = (q) => { setEditing(q.id); setForm({ question_ar:q.question_ar, question_fr:q.question_fr, question_type:q.question_type, required:q.required, active:q.active, options:(q.options||[]).map((o,i)=>({...o,sort_order:i+1})) }); setAdminError(null); };
  const addOption = () => setForm(f => ({...f, options:[...(f.options||[]), {label_ar:"",label_fr:"",value:"",sort_order:(f.options||[]).length+1}]}));
  const updateOption = (i,key,value) => setForm(f => ({...f, options:f.options.map((o,idx)=>idx===i?{...o,[key]:value}:o)}));
  const removeOption = (i) => setForm(f => ({...f, options:f.options.filter((_,idx)=>idx!==i).map((o,idx)=>({...o,sort_order:idx+1}))}));

  const reloadQuestions = async () => {
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
    const { data, error } = await supabase.from("survey_questions").select("id, question_ar, question_fr, question_type, required, active, sort_order, survey_options(id,label_ar,label_fr,value,sort_order)").eq("survey_id", surveyId).order("sort_order", {ascending:true});
    if (error) throw error;
    setQuestions((data||[]).map(q=>({...q, options:(q.survey_options||[]).sort((a,b)=>a.sort_order-b.sort_order)})));
  };
  const saveQuestion = async () => {
    setSaving(true); setAdminError(null);
    try {
      if (!form.question_ar.trim() || !form.question_fr.trim()) throw new Error("question");
      if (["single_choice","multiple_choice"].includes(form.question_type) && !form.options.filter(o=>o.label_ar.trim()&&o.label_fr.trim()&&o.value.trim()).length) throw new Error("options");
      let questionId = editing;
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) throw new Error("AUTH_REQUIRED");
      const { data: adminCheck, error: adminCheckError } = await supabase.from("admins").select("id").eq("id", authData.user.id).maybeSingle();
      if (adminCheckError) throw adminCheckError;
      if (!adminCheck) throw new Error("ADMIN_REQUIRED");
      if (editing) {
        const {error} = await supabase.from("survey_questions").update({question_ar:form.question_ar.trim(),question_fr:form.question_fr.trim(),question_type:form.question_type,required:form.required,active:form.active}).eq("id",editing);
        if(error) throw error;
        const { error: deleteOptionsError } = await supabase.from("survey_options").delete().eq("question_id",editing);
        if (deleteOptionsError) throw deleteOptionsError;
      } else {
        // The admin dashboard can open immediately after login, before the
        // parent component has finished restoring the survey state. Resolve
        // the survey by its stable slug as a fallback instead of failing with
        // SURVEY_ID_MISSING.
        let activeSurveyId = survey?.id;
        if (!activeSurveyId) {
          const { data: surveyRow, error: surveyLookupError } = await supabase
            .from("surveys")
            .select("id")
            .eq("slug", SURVEY_SLUG)
            .eq("active", true)
            .maybeSingle();
          if (surveyLookupError) throw surveyLookupError;
          activeSurveyId = surveyRow?.id;
        }
        if (!activeSurveyId) throw new Error("SURVEY_NOT_FOUND");
        const maxOrder = Math.max(0,...questions.map(q=>q.sort_order||0));
        const insertPayload = {
          survey_id: activeSurveyId,
          question_ar: form.question_ar.trim(),
          question_fr: form.question_fr.trim(),
          question_type: form.question_type,
          required: form.required,
          active: form.active,
          sort_order: maxOrder + 1,
        };
        const { data, error } = await supabase
          .from("survey_questions")
          .insert(insertPayload)
          .select("id")
          .maybeSingle();
        if (error) throw error;
        if (!data?.id) {
          throw new Error("QUESTION_ID_NOT_RETURNED: la question a peut-être été créée, mais Supabase n'a pas retourné son ID. Vérifiez la policy SELECT de survey_questions.");
        }
        questionId = data.id;
      }
      if (["single_choice","multiple_choice"].includes(form.question_type)) {
        if (!questionId) throw new Error("QUESTION_ID_MISSING");
        const opts=form.options.filter(o=>String(o.label_ar||"").trim()&&String(o.label_fr||"").trim()&&String(o.value||"").trim()).map((o,i)=>({question_id:questionId,label_ar:String(o.label_ar).trim(),label_fr:String(o.label_fr).trim(),value:String(o.value).trim(),sort_order:i+1}));
        if(opts.length) { const {error}=await supabase.from("survey_options").insert(opts); if(error) throw error; }
      }
      await reloadQuestions(); reset();
    } catch(e) {
      const msg = e?.message || "UNKNOWN_ERROR";
      console.error("[survey-admin-save]", e);
      setAdminError(lang === "ar" ? `تعذر حفظ السؤال: ${msg}` : `Impossible d'enregistrer la question : ${msg}`);
    }
    finally { setSaving(false); }
  };
  const toggleQuestion = async (q) => { const {error}=await supabase.from("survey_questions").update({active:!q.active}).eq("id",q.id); if(error) setAdminError(error.message); else reloadQuestions(); };
  const deleteQuestion = async (q) => { if(!window.confirm(lang === "ar" ? "هل تريد تعطيل هذا السؤال؟" : "Désactiver cette question ?")) return; toggleQuestion(q); };
  const moveQuestion = async (q, direction) => {
    const sorted=[...questions].sort((a,b)=>a.sort_order-b.sort_order); const i=sorted.findIndex(x=>x.id===q.id); const j=i+direction; if(i<0||j<0||j>=sorted.length)return;
    const a=sorted[i], b=sorted[j]; await supabase.from("survey_questions").update({sort_order:b.sort_order}).eq("id",a.id); await supabase.from("survey_questions").update({sort_order:a.sort_order}).eq("id",b.id); reloadQuestions();
  };
  const loadLocations = async () => { const {data,error}=await supabase.from("weather_locations").select("*").order("wilaya"); if(!error)setWeatherLocations(data||[]); else setAdminError(error.message); };
  useEffect(()=>{ if(tab==="weather") loadLocations(); },[tab]);

  const rByQ = questions.map(q=>({question:q,data:(results||[]).filter(r=>r.question_id===q.id).map(r=>({name:lang==="ar"?r.option_label_ar:r.option_label_fr,v:r.response_count,pct:r.percentage}))}));
  return <div className="mt-6 space-y-5">
    <div className="flex items-center justify-between flex-wrap gap-3"><div><div className="text-lg font-bold" style={{color:C.navy}}>{lang==="ar"?"لوحة المشرف":"Tableau de bord administrateur"}</div><div className="text-xs" style={{color:C.slate}}>{lang==="ar"?"إدارة الاستبيان والنتائج والطقس":"Gestion du sondage, résultats et météo"}</div></div><div className="flex gap-2"><button onClick={loadResults} className="px-3 py-2 rounded-lg text-xs font-semibold border" style={{borderColor:C.border,color:C.blue}}><Repeat size={13} className="inline mr-1"/>{t.refresh}</button><button onClick={handleBackToSurvey} className="px-3 py-2 rounded-lg text-xs font-semibold border" style={{borderColor:C.border,color:C.blue}}>{lang==="ar"?"العودة إلى الاستبيان":"Retour au sondage"}</button><button onClick={handleSignOut} className="px-3 py-2 rounded-lg text-xs font-semibold border" style={{borderColor:C.border,color:C.slate}}>{t.signOut}</button></div></div>
    <div className="grid grid-cols-3 gap-2"><button onClick={()=>setTab("questions")} className="py-2 rounded-lg text-xs font-semibold" style={tab==="questions"?{background:C.navy,color:C.white}:{background:C.white,color:C.slate,border:`1px solid ${C.border}`}}>{lang==="ar"?"الأسئلة":"Questions"}</button><button onClick={()=>setTab("results")} className="py-2 rounded-lg text-xs font-semibold" style={tab==="results"?{background:C.navy,color:C.white}:{background:C.white,color:C.slate,border:`1px solid ${C.border}`}}>{lang==="ar"?"النتائج":"Résultats"}</button><button onClick={()=>setTab("weather")} className="py-2 rounded-lg text-xs font-semibold" style={tab==="weather"?{background:C.navy,color:C.white}:{background:C.white,color:C.slate,border:`1px solid ${C.border}`}}>{lang==="ar"?"الطقس":"Météo"}</button></div>
    {adminError && <div className="rounded-lg p-3 text-xs" style={{background:"#FDECEC",color:C.red}}>{adminError}</div>}
    {tab==="questions" && <>
      <Card><div className="flex items-center justify-between mb-4"><div className="font-semibold text-sm" style={{color:C.navy}}>{editing? (lang==="ar"?"تعديل السؤال":"Modifier la question"):(lang==="ar"?"إضافة سؤال":"Ajouter une question")}</div><div className="flex items-center gap-2">{!editing&&<button onClick={seedDefaultQuestions} disabled={saving} className="px-3 py-1.5 rounded-lg text-[11px] font-semibold border disabled:opacity-50" style={{borderColor:C.border,color:C.blue}}>{lang==="ar"?"إضافة الأسئلة الجاهزة":"Ajouter les questions prêtes"}</button>}{editing&&<button onClick={reset} className="text-xs"><X size={15}/></button>}</div></div>
        <div className="grid md:grid-cols-2 gap-3"><input value={form.question_ar} onChange={e=>setForm({...form,question_ar:e.target.value})} placeholder="السؤال بالعربية" className="border rounded-lg px-3 py-2 text-sm"/><input value={form.question_fr} onChange={e=>setForm({...form,question_fr:e.target.value})} placeholder="Question en français" className="border rounded-lg px-3 py-2 text-sm"/></div>
        <div className="grid md:grid-cols-3 gap-3 mt-3"><select value={form.question_type} onChange={e=>setForm({...form,question_type:e.target.value})} className="border rounded-lg px-3 py-2 text-sm"><option value="single_choice">Single choice</option><option value="multiple_choice">Multiple choice</option><option value="text">Text</option><option value="number">Number</option></select><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.required} onChange={e=>setForm({...form,required:e.target.checked})}/> {lang==="ar"?"إجباري":"Obligatoire"}</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={e=>setForm({...form,active:e.target.checked})}/> {lang==="ar"?"نشط":"Actif"}</label></div>
        {["single_choice","multiple_choice"].includes(form.question_type)&&<div className="mt-4 space-y-2"><div className="flex justify-between"><span className="text-xs font-semibold">{lang==="ar"?"الاختيارات":"Options"}</span><button onClick={addOption} className="text-xs font-semibold" style={{color:C.blue}}><Plus size={13} className="inline"/> {lang==="ar"?"إضافة":"Ajouter"}</button></div>{form.options.map((o,i)=><div key={i} className="grid grid-cols-[1fr_1fr_110px_32px] gap-2"><input value={o.label_ar} onChange={e=>updateOption(i,"label_ar",e.target.value)} placeholder="العربية" className="border rounded px-2 py-1.5 text-xs"/><input value={o.label_fr} onChange={e=>updateOption(i,"label_fr",e.target.value)} placeholder="Français" className="border rounded px-2 py-1.5 text-xs"/><input value={o.value} onChange={e=>updateOption(i,"value",e.target.value)} placeholder="value" className="border rounded px-2 py-1.5 text-xs"/><button onClick={()=>removeOption(i)} className="border rounded"><Trash2 size={13} className="mx-auto"/></button></div>)}</div>}
        <button onClick={saveQuestion} disabled={saving} className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold disabled:opacity-50" style={{background:C.navy,color:C.white}}><Save size={13} className="inline mr-1"/>{saving?(lang==="ar"?"جارٍ الحفظ…":"Enregistrement…"):(editing?(lang==="ar"?"حفظ التعديلات":"Enregistrer"):(lang==="ar"?"إضافة السؤال":"Ajouter"))}</button>
      </Card>
      <div className="space-y-3">{questions.map((q,i)=><Card key={q.id}><div className="flex gap-3"><GripVertical size={16} style={{color:C.slateLight}}/><div className="flex-1"><div className="text-sm font-semibold" style={{color:C.navy}}>{lang==="ar"?q.question_ar:q.question_fr}</div><div className="text-[11px] mt-1" style={{color:C.slate}}>{q.question_type} · {q.required?(lang==="ar"?"إجباري":"obligatoire"):(lang==="ar"?"اختياري":"facultatif")} · {q.active?(lang==="ar"?"نشط":"actif"):(lang==="ar"?"معطل":"inactif")}</div></div><div className="flex gap-1"><button title="up" onClick={()=>moveQuestion(q,-1)} className="p-2 border rounded"><span>↑</span></button><button title="down" onClick={()=>moveQuestion(q,1)} className="p-2 border rounded"><span>↓</span></button><button onClick={()=>startEdit(q)} className="p-2 border rounded"><Pencil size={13}/></button><button onClick={()=>toggleQuestion(q)} className="p-2 border rounded">{q.active?<EyeOff size={13}/>:<Eye size={13}/>}</button><button onClick={()=>deleteQuestion(q)} className="p-2 border rounded"><Trash2 size={13}/></button></div></div></Card>)}</div>
    </>}
    {tab==="results" && <><Card><div className="text-sm font-semibold" style={{color:C.navy}}>{t.totalResponses}: <span style={{color:C.blue}}>{participants}</span></div></Card><div className="grid sm:grid-cols-2 gap-6">{rByQ.map(({question,data})=><Card key={question.id}><div className="text-sm font-semibold mb-3" style={{color:C.navy}}>{lang==="ar"?question.question_ar:question.question_fr}</div>{data.length?<ResponsiveContainer width="100%" height={210}><PieChart><Pie data={data} dataKey="v" nameKey="name" cx="50%" cy="50%" outerRadius={68} label={({name,pct})=>`${name}: ${pct}%`}>{data.map((_,idx)=><Cell key={idx} fill={PIE_COLORS[idx%PIE_COLORS.length]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer>:<p className="text-xs" style={{color:C.slate}}>No aggregated options.</p>}</Card>)}</div></>}
    {tab==="weather" && <Card><div className="flex items-center gap-2 mb-4"><CloudRain size={17} style={{color:C.blue}}/><span className="font-semibold text-sm" style={{color:C.navy}}>{lang==="ar"?"مناطق بيانات الطقس":"Régions météo"}</span></div>{weatherLocations.length===0?<p className="text-xs" style={{color:C.slate}}>{lang==="ar"?"لا توجد مناطق بعد. أضفها من Supabase SQL أو أنشئ CRUD لاحقًا.":"Aucune région configurée. Ajoutez-les dans Supabase SQL."}</p>:<div className="space-y-2">{weatherLocations.map(w=><div key={w.id} className="text-xs border rounded-lg p-3 flex justify-between"><span>{w.wilaya} — {w.location_name}</span><span>{w.latitude}, {w.longitude}</span></div>)}</div>}</Card>}
  </div>;
}

export default function SondageStandalone() {
  const [lang, setLang] = useState("fr");
  const [mode, setMode] = useState("form"); // "form" | "results"

  const [survey, setSurvey] = useState(null);
  const [questions, setQuestions] = useState([]); // [{id, question_ar, question_fr, options:[{id,label_ar,label_fr,value}]}]
  const [loadingSurvey, setLoadingSurvey] = useState(true);

  const [answers, setAnswers] = useState({}); // questionId -> optionId
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const [results, setResults] = useState(null); // rows from public_survey_results (admin uses raw, but same shape works)
  const [participants, setParticipants] = useState(0);
  const [loadingResults, setLoadingResults] = useState(false);

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
  const qText = (q) => (lang === "ar" ? q.question_ar : q.question_fr);
  const oText = (o) => (lang === "ar" ? o.label_ar : o.label_fr);
  const allAnswered = questions.length > 0 && questions.every((q) => {
    if (!q.required) return true;
    const value = answers[q.id];
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && String(value).trim() !== "";
  });

  /* ---------------- Load survey + questions + options from Supabase ---------------- */
  const loadSurvey = useCallback(async () => {
    setLoadingSurvey(true);
    setError(null);
    try {
      const { data: surveyRow, error: sErr } = await supabase
        .from("surveys")
        .select("id, slug, title_ar, title_fr, active")
        .eq("slug", SURVEY_SLUG)
        .eq("active", true)
        .single();
      if (sErr || !surveyRow) throw sErr || new Error("survey not found");
      setSurvey(surveyRow);

      const { data: qRows, error: qErr } = await supabase
        .from("survey_questions")
        .select("id, question_ar, question_fr, sort_order, survey_options(id, label_ar, label_fr, value, sort_order)")
        .eq("survey_id", surveyRow.id)
        .eq("active", true)
        .order("sort_order", { ascending: true });
      if (qErr) throw qErr;

      const normalized = (qRows || []).map((q) => ({
        ...q,
        options: (q.survey_options || []).slice().sort((a, b) => a.sort_order - b.sort_order),
      }));
      setQuestions(normalized);
    } catch (e) {
      setError(t.errorLoad);
    } finally {
      setLoadingSurvey(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { loadSurvey(); }, [loadSurvey]);

  /* ---------------- Auth state ---------------- */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function checkAdmin() {
      if (!session?.user) { setIsAdmin(false); return; }
      const { data, error: aErr } = await supabase
        .from("admins")
        .select("id")
        .eq("id", session.user.id)
        .maybeSingle();
      if (!cancelled) setIsAdmin(!aErr && !!data);
    }
    checkAdmin();
    return () => { cancelled = true; };
  }, [session]);

  /* ---------------- Hidden admin trigger: N clicks within window ---------------- */
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
      const { data, error: signErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signErr || !data.session) throw signErr || new Error("no session");
      const { data: adminRow, error: aErr } = await supabase
        .from("admins")
        .select("id")
        .eq("id", data.session.user.id)
        .maybeSingle();
      if (aErr || !adminRow) {
        await supabase.auth.signOut();
        throw new Error("not admin");
      }
      setIsAdmin(true);
      setAdminPromptOpen(false);
      setMode("results");
      setEmail(""); setPassword("");
    } catch (e) {
      setAuthError(t.adminWrong);
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setSession(null);
    setMode("form");
  }

  function handleBackToSurvey() {
    // Keep the Supabase session alive so the admin can move between the
    // public survey and the dashboard without being logged out.
    setMode("form");
    setAdminPromptOpen(false);
  }

  /* ---------------- Load aggregated results (public view — safe for anyone, but only surfaced in admin mode here) ---------------- */
  const loadResults = useCallback(async () => {
    if (!survey) return;
    setLoadingResults(true);
    setError(null);
    try {
      const { data, error: rErr } = await supabase
        .from("public_survey_results")
        .select("*")
        .eq("survey_id", survey.id);
      if (rErr) throw rErr;
      setResults(data || []);

      const { data: pc, error: pErr } = await supabase
        .from("public_survey_participant_counts")
        .select("total_participants")
        .eq("survey_id", survey.id)
        .maybeSingle();
      if (!pErr) setParticipants(pc?.total_participants || 0);
    } catch (e) {
      setError(t.errorLoad);
    } finally {
      setLoadingResults(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [survey]);

  useEffect(() => { if (mode === "results" && isAdmin) loadResults(); }, [mode, isAdmin, loadResults]);

  /* ---------------- Submit response ---------------- */
  async function handleSubmit() {
    if (!allAnswered || !survey) { setError(t.required); return; }
    setError(null);
    setSubmitting(true);
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
            return { question_id: q.id, answer_value: opt?.value ?? String(v), answer_text: opt ? oText(opt) : String(v) };
          });
        });
      // Prefer the secure RPC when it exists. The original Supabase setup
      // already permits anonymous INSERTs on these two tables, so fall back
      // to direct inserts when the RPC has not yet been created. This keeps
      // the existing database working while remaining compatible with the
      // secure final schema.
      const { data: rpcResponseId, error: rpcErr } = await supabase.rpc("submit_survey_response", {
        p_survey_id: survey.id,
        p_respondent_id: respondentId,
        p_answers: payload,
      });
      if (!rpcErr && rpcResponseId) {
        setSubmitted(true);
        return;
      }
      const rpcMessage = String(rpcErr?.message || "");
      if (rpcMessage.includes("DUPLICATE_RESPONSE")) {
        setError(t.duplicate);
        return;
      }
      // Fallback for projects using the original SUPABASE_SETUP.sql.
      if (rpcErr) {
        const { error: responseErr } = await supabase
          .from("survey_responses")
          .insert({ id: responseId, survey_id: survey.id, respondent_id: respondentId });
        if (responseErr) {
          if (String(responseErr.message || "").includes("duplicate") || String(responseErr.message || "").includes("DUPLICATE_RESPONSE")) {
            setError(t.duplicate);
            return;
          }
          throw responseErr;
        }
        const answerRows = payload.map((a) => ({
          response_id: responseId,
          question_id: a.question_id,
          answer_value: a.answer_value,
          answer_text: a.answer_text,
        }));
        if (answerRows.length) {
          const { error: answersErr } = await supabase.from("survey_answers").insert(answerRows);
          if (answersErr) throw answersErr;
        }
        setSubmitted(true);
      } else {
        throw new Error("Response was not created");
      }
    } catch (e) {
      setError(t.errorSubmit);
    } finally {
      setSubmitting(false);
    }
  }

  /* ---------------- Group results by question for the pie charts ---------------- */
  const resultsByQuestion = questions.map((q) => {
    const rows = (results || []).filter((r) => r.question_id === q.id);
    return {
      question: q,
      data: rows.map((r) => ({
        name: lang === "ar" ? r.option_label_ar : r.option_label_fr,
        v: r.response_count,
        pct: r.percentage,
      })),
    };
  });

  return (
    <div dir={dir} style={{ backgroundColor: C.ivory, color: C.ink, fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }} className="min-h-screen w-full">
      {/* HEADER */}
      <header style={{ backgroundColor: C.navy }} className="py-10 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            {/* Clicking the platform name/logo 5x within 3s opens the hidden admin login. No visible "Admin" button anywhere. */}
            <div className="flex items-center gap-2 cursor-pointer select-none" onClick={handleTitleClick}>
              <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: C.white }}>
                <Shield size={16} color={C.navy} />
              </div>
              <span className="text-xs font-semibold" style={{ color: "#B9C6DA" }}>{t.kicker}</span>
            </div>
            <button
              onClick={() => setLang((l) => (l === "fr" ? "ar" : "fr"))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border"
              style={{ borderColor: C.white, color: C.white }}
            >
              <Globe size={13} />
              {lang === "fr" ? "FR | العربية" : "العربية | FR"}
            </button>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2" style={{ fontFamily: "Georgia, serif" }} onClick={handleTitleClick}>
            {t.title}
          </h1>
          <p className="text-sm" style={{ color: "#B9C6DA" }}>{t.subtitle}</p>
        </div>
      </header>

      {/* BODY */}
      <main className="max-w-3xl mx-auto px-4 md:px-8 py-10">
        {loadingSurvey && <p className="text-sm" style={{ color: C.slate }}>{t.loading}</p>}

        {!loadingSurvey && mode === "form" && (
          submitted ? (
            <Card className="text-center py-10">
              <CheckCircle2 size={32} style={{ color: C.green }} className="mx-auto mb-3" />
              <div className="font-bold mb-1" style={{ color: C.navy }}>{t.thanksTitle}</div>
              <p className="text-sm mb-5" style={{ color: C.slate }}>{t.thanksText}</p>
              <button onClick={() => { setSubmitted(false); setAnswers({}); }} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ backgroundColor: C.navy, color: C.white }}>
                {t.newResponse}
              </button>
            </Card>
          ) : (
            <div className="space-y-5">
              <div className="rounded-lg p-3 flex items-start gap-2 text-xs" style={{ backgroundColor: C.blueSoft, color: C.blue }}>
                <Info size={14} className="shrink-0 mt-0.5" /> {t.shareNote}
              </div>
              {questions.map((q) => (
                <Card key={q.id}>
                  <div className="text-sm font-semibold mb-3" style={{ color: C.navy }}>{qText(q)} {q.required && <span style={{color:C.red}}>*</span>}</div>
                  {q.question_type === "text" && <textarea value={answers[q.id] ?? ""} onChange={e=>setAnswers(a=>({...a,[q.id]:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm" rows={3} />}
                  {q.question_type === "number" && <input type="number" value={answers[q.id] ?? ""} onChange={e=>setAnswers(a=>({...a,[q.id]:e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm" />}
                  {q.question_type === "single_choice" && <div className="flex flex-wrap gap-2">{q.options.map((opt) => <button key={opt.id} onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt.id }))} className="px-3.5 py-2 rounded-full text-xs font-medium border transition-colors" style={answers[q.id] === opt.id ? { backgroundColor: C.blue, borderColor: C.blue, color: C.white } : { borderColor: C.border, color: C.slate }}>{oText(opt)}</button>)}</div>}
                  {q.question_type === "multiple_choice" && <div className="flex flex-wrap gap-2">{q.options.map((opt) => { const selected=Array.isArray(answers[q.id])&&answers[q.id].includes(opt.id); return <button key={opt.id} onClick={()=>setAnswers(a=>{const cur=Array.isArray(a[q.id])?a[q.id]:[]; return {...a,[q.id]:selected?cur.filter(x=>x!==opt.id):[...cur,opt.id]};})} className="px-3.5 py-2 rounded-full text-xs font-medium border" style={selected?{backgroundColor:C.blue,borderColor:C.blue,color:C.white}:{borderColor:C.border,color:C.slate}}>{oText(opt)}</button>; })}</div>}
                </Card>
              ))}
              {error && <p className="text-sm font-medium" style={{ color: C.red }}>{error}</p>}
              <button onClick={handleSubmit} disabled={submitting}
                className="px-5 py-3 rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-60"
                style={{ backgroundColor: C.navy, color: C.white }}>
                <ClipboardList size={16} /> {submitting ? t.submitting : t.submit}
              </button>
              {/* No visible admin link/button anywhere on this page — access is via the hidden click trigger only. */}
            </div>
          )
        )}

        {adminPromptOpen && !isAdmin && (
          <Card className="max-w-sm mt-6">
            <div className="flex items-center gap-2 mb-2">
              <Lock size={15} style={{ color: C.navy }} />
              <span className="font-semibold text-sm" style={{ color: C.navy }}>{t.adminTitle}</span>
            </div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: C.navy }}>{t.emailLabel}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm mb-2" style={{ borderColor: C.border, color: C.navy }} />
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: C.navy }}>{t.passwordLabel}</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAdminLogin(); }}
              className="w-full border rounded-lg px-3 py-2 text-sm mb-2" style={{ borderColor: authError ? C.red : C.border, color: C.navy }} />
            {authError && <p className="text-xs font-medium mb-2" style={{ color: C.red }}>{authError}</p>}
            <div className="flex gap-2">
              <button onClick={handleAdminLogin} disabled={authBusy} className="px-4 py-2 rounded-lg text-xs font-semibold disabled:opacity-60" style={{ backgroundColor: C.navy, color: C.white }}>
                {t.adminSubmit}
              </button>
              <button onClick={() => setAdminPromptOpen(false)} className="px-4 py-2 rounded-lg text-xs font-semibold border" style={{ borderColor: C.border, color: C.slate }}>
                {t.adminBack}
              </button>
            </div>
          </Card>
        )}

        {mode === "results" && isAdmin && (
          <AdminDashboard survey={survey} questions={questions} setQuestions={setQuestions} lang={lang} t={t} loadResults={loadResults} results={results} participants={participants} handleSignOut={handleSignOut} handleBackToSurvey={handleBackToSurvey} />
        )}
      </main>

      <footer className="py-6 px-4 md:px-8 text-center text-xs" style={{ color: C.slateLight }}>
        {t.footer}
      </footer>
    </div>
  );
}
