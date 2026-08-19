import React from "react";
import { UsersRound } from "lucide-react";

const copy = {
  fr: {
    eyebrow: "Équipe du projet",
    title: "Une recherche portée par une équipe engagée",
    text: "Découvrez les membres qui contribuent à cette étude académique.",
    fallbackRole: "Membre de l’équipe de recherche",
  },
  ar: {
    eyebrow: "فريق المشروع",
    title: "بحث علمي يقوده فريق ملتزم",
    text: "تعرّفوا على أعضاء الفريق المساهمين في هذه الدراسة الأكاديمية.",
    fallbackRole: "عضو في فريق البحث",
  },
};

export default function TeamSection({ members = [], lang = "fr" }) {
  const visibleMembers = members.filter((member) => member.active !== false);
  if (!visibleMembers.length) return null;
  const t = copy[lang];
  return <section className="team-section" aria-labelledby="team-title">
    <div className="team-heading">
      <div className="team-heading-icon"><UsersRound size={18} /></div>
      <div><span className="eyebrow">{t.eyebrow}</span><h2 id="team-title">{t.title}</h2><p>{t.text}</p></div>
    </div>
    <div className="team-grid">
      {visibleMembers.map((member) => <article className="team-member-card" key={member.id}>
        <div className="member-avatar-wrap">
          {member.image_url ? <img src={member.image_url} alt={lang === "ar" ? member.name_ar : member.name_fr} className="member-avatar" /> : <div className="member-avatar member-avatar-placeholder"><UsersRound size={25} /></div>}
          <span className="member-status-dot" />
        </div>
        <div className="member-copy"><h3>{lang === "ar" ? member.name_ar : member.name_fr}</h3><p>{(lang === "ar" ? member.role_ar : member.role_fr) || t.fallbackRole}</p></div>
      </article>)}
    </div>
  </section>;
}
