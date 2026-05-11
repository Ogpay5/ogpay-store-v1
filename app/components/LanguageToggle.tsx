"use client";

import { useEffect, useState } from "react";

const dictionary: Record<string, string> = {
  "Register": "Registrarse",
  "Login": "Iniciar sesión",
  "CREATE YOUR ACCOUNT": "CREA TU CUENTA",
  "Already have an account? Login": "¿Ya tienes cuenta? Inicia sesión",
  "Email": "Correo",
  "Password": "Contraseña",
  "Privacy Notice": "Aviso de privacidad",
  "New client registrations require manual admin approval after email verification before access is granted.":
    "Los nuevos registros requieren aprobación manual del administrador después de verificar el correo electrónico.",
  "Client Dashboard": "Panel del cliente",
  "Wallet Balance": "Saldo disponible",
  "Available Balance": "Saldo disponible",
  "Add Funds": "Agregar fondos",
  "Cart": "Carrito",
  "Orders": "Órdenes",
  "Wallet": "Billetera",
  "Logout": "Cerrar sesión",
  "Products Available": "Productos disponibles",
  "Active Platform": "Plataforma activa",
  "Featured Products": "Productos disponibles",
  "Add to Cart": "Agregar al carrito",
  "Pay With Wallet": "Pagar con saldo",
  "Order History": "Historial de órdenes",
  "Download TXT": "Descargar TXT",
  "Preview delivery": "Ver entrega",
  "Copy": "Copiar",
};

export default function LanguageToggle() {
  const [lang, setLang] = useState("en");

  function translate(to: string) {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT
    );

    const nodes: Text[] = [];

    while (walker.nextNode()) {
      nodes.push(walker.currentNode as Text);
    }

    nodes.forEach((node) => {
      const original =
        node.parentElement?.getAttribute("data-original-text") ||
        node.textContent ||
        "";

      const clean = original.trim();

      if (!clean) return;

      if (!node.parentElement?.getAttribute("data-original-text")) {
        node.parentElement?.setAttribute("data-original-text", original);
      }

      if (to === "es" && dictionary[clean]) {
        node.textContent = original.replace(clean, dictionary[clean]);
      }

      if (to === "en") {
        node.textContent = original;
      }
    });
  }

  useEffect(() => {
    const saved = localStorage.getItem("og-language") || "en";
    setLang(saved);

    setTimeout(() => {
      translate(saved);
    }, 300);
  }, []);

  function toggle() {
    const next = lang === "en" ? "es" : "en";

    setLang(next);
    localStorage.setItem("og-language", next);

    translate(next);
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
