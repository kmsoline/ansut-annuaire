"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error" | "already";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setErrorMsg("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: name.trim() }),
      });

      const data = await response.json();

      if (response.ok || data.success) {
        setStatus(data.message?.includes("Deja") ? "already" : "success");
        setEmail("");
        setName("");
        setTimeout(() => setStatus("idle"), 5000);
      } else if (response.status === 429) {
        setStatus("error");
        setErrorMsg("Trop de tentatives, réessayez dans une heure.");
      } else {
        setStatus("error");
        setErrorMsg(data.error || "Une erreur est survenue. Veuillez réessayer.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Impossible de contacter le serveur. Vérifiez votre connexion.");
    }
  };

  if (status === "success" || status === "already") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 px-5 py-4">
        <span className="text-2xl">
          {status === "success" ? "🎉" : "✅"}
        </span>
        <div>
          <p className="font-semibold text-green-400">
            {status === "success" ? "Inscription confirmée !" : "Vous êtes déjà inscrit !"}
          </p>
          <p className="text-sm text-green-400/70">
            {status === "success"
              ? "Merci ! Vous recevrez nos prochaines actualités."
              : "Votre email est déjà enregistré dans notre liste."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Votre prénom (optionnel)"
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-white/30 focus:border-white/30 focus:bg-white/8"
          aria-label="Prénom"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Votre adresse email"
          required
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-white/30 focus:border-white/30 focus:bg-white/8"
          aria-label="Adresse email pour la newsletter"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="btn btn-primary whitespace-nowrap disabled:opacity-60"
        >
          {status === "loading" ? (
            <span className="flex items-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Envoi…
            </span>
          ) : (
            "S'inscrire"
          )}
        </button>
      </div>
      {status === "error" && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
          ⚠️ {errorMsg}
        </p>
      )}
    </form>
  );
}
