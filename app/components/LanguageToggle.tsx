"use client";

import { useEffect, useState } from "react";

export default function LanguageToggle() {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const saved = localStorage.getItem("og-language");

    if (saved) {
      setLang(saved);
      document.documentElement.lang = saved;
      translate(saved);
    }
  }, []);

  function translate(language: string) {
    const elements = document.querySelectorAll("[data-es]");

    elements.forEach((el) => {
      const html = el as HTMLElement;

      const en = html.getAttribute("data-en");
      const es = html.getAttribute("data-es");

      html.innerText = language === "es"
        ? es || ""
        : en || "";
    });
  }

  function toggle() {
    const newLang = lang === "en" ? "es" : "en";

    setLang(newLang);

    localStorage.setItem("og-language", newLang);

    document.documentElement.lang = newLang;

    translate(newLang);
  }

  return (
    <button
      onClick={toggle}
      className="fixed left-5 top-5 z-[9998] rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-3 text-sm font-semibold text-violet-300 shadow-[0_0_30px_rgba(124,58,237,0.18)] backdrop-blur-xl transition hover:scale-105 hover:bg-violet-500/20"
    >
      {lang === "en" ? "ES" : "EN"}
    </button>
  );
}
