"use client";

import { useState } from "react";
import { MessageCircle, X, Mail } from "lucide-react";
import CTAButton from "./CTAButton";
import { useWhatsApp } from "./WhatsAppNumber";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const whatsapp = useWhatsApp();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Widget de chat */}
      {isOpen && (
        <div className="mb-4 w-80 rounded-xl glass glass-strong shadow-lg animate-fade-in-up" style={{ position: "relative", zIndex: 50 }}>
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <div>
              <h3 className="text-sm font-semibold">Chat avec nous</h3>
              <p className="text-xs text-[color-mix(in_oklch,var(--foreground)_65%,transparent)]">
                Réponse en quelques minutes
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-md p-1 hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Fermer le chat"
            >
              <X size={16} strokeWidth={2} />
            </button>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-xs text-[color-mix(in_oklch,var(--foreground)_75%,transparent)]">
              Bonjour ! Comment pouvons-nous vous aider aujourd'hui ?
            </p>
            <div className="flex flex-col gap-2">
              <CTAButton
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-sm"
              >
                <MessageCircle size={14} strokeWidth={2} className="inline-block mr-1.5 -mt-px" />
                Ouvrir WhatsApp
              </CTAButton>
              <CTAButton
                href="/contact"
                variant="outline"
                className="w-full text-sm"
              >
                <Mail size={14} strokeWidth={2} className="inline-block mr-1.5 -mt-px" />
                Formulaire de contact
              </CTAButton>
            </div>
          </div>
        </div>
      )}

      {/* Bouton flottant */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 glow"
        style={{
          background: "linear-gradient(135deg, var(--royal-blue), color-mix(in oklch, var(--royal-blue) 85%, var(--gold-premium)))",
          position: "relative",
          zIndex: 50,
        }}
        aria-label={isOpen ? "Fermer le chat" : "Ouvrir le chat"}
        aria-expanded={isOpen}
      >
        {isOpen
          ? <X size={22} strokeWidth={2.2} />
          : <MessageCircle size={22} strokeWidth={2} />
        }
      </button>
    </div>
  );
}
