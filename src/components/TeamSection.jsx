import React, { useEffect, useRef, useState } from "react";
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
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || typeof IntersectionObserver === "undefined") { setVisible(true); return; }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } });
    }, { threshold: 0.15 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  if (!visibleMembers.length) return null;
  const t = copy[lang];
  return <section className="team-section" aria-labelledby="team-title" ref={sectionRef}>
    <div className="team-heading">
      <div className="team-heading-icon"><UsersRound size={18} /></div>
      <div><span className="eyebrow">{t.eyebrow}</span><h2 id="team-title">{t.title}</h2><p>{t.text}</p></div>
    </div>
    <div className={`team-grid ${visible ? "is-visible" : ""} ${visibleMembers.length >= 4 ? "has-many" : ""}`}>
      {visibleMembers.map((member, index) => <article
        className="team-member-card"
        key={member.id}
        style={{ transitionDelay: visible ? `${Math.min(index, 8) * 70}ms` : "0ms" }}
      >
        <span className="team-member-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
        <div className="member-avatar-wrap">
          {member.image_url ? <img src={member.image_url} alt={lang === "ar" ? member.name_ar : member.name_fr} className="member-avatar" loading="lazy" /> : <div className="member-avatar member-avatar-placeholder"><UsersRound size={26} /></div>}
          <span className="member-status-dot" />
        </div>
        <div className="member-copy">
          <h3>{lang === "ar" ? member.name_ar : member.name_fr}</h3>
          <p>{(lang === "ar" ? member.role_ar : member.role_fr) || t.fallbackRole}</p>
        </div>
      </article>)}
    </div>
  </section>;
}
