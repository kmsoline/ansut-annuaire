"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(data.error || "Identifiants incorrects");
      }
    } catch {
      setError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(135deg, color-mix(in oklch, var(--royal-blue) 8%, var(--background)) 0%, var(--background) 50%, color-mix(in oklch, var(--gold-premium) 6%, var(--background)) 100%)",
      }}
    >
      <div className="w-full max-w-md">
        <div
          className="rounded-2xl p-8 shadow-2xl"
          style={{
            background: "color-mix(in oklch, var(--foreground) 3%, var(--background))",
            border: "1px solid color-mix(in oklch, var(--foreground) 10%, transparent)",
          }}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3 mb-5">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, var(--royal-blue), color-mix(in oklch, var(--royal-blue) 70%, var(--gold-premium)))",
                }}
              >
                <Image
                  src="/dime-logo.png"
                  alt="DIME GROUPE"
                  width={48}
                  height={48}
                  className="object-contain w-10 h-10"
                  priority
                />
              </div>
              <span className="text-2xl font-bold tracking-tight">DIME GROUPE</span>
            </Link>
            <h1 className="text-xl font-bold mb-1">Espace Administration</h1>
            <p
              className="text-sm"
              style={{ color: "color-mix(in oklch, var(--foreground) 55%, transparent)" }}
            >
              Connectez-vous pour accéder au tableau de bord
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
            {error && (
              <div
                className="flex items-center gap-2 p-3 rounded-lg text-sm"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  color: "rgb(239,68,68)",
                }}
              >
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-1.5">
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                className="w-full px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--royal-blue)] transition-all"
                style={{
                  background: "color-mix(in oklch, var(--foreground) 5%, transparent)",
                  border: "1px solid color-mix(in oklch, var(--foreground) 12%, transparent)",
                }}
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-11 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--royal-blue)] transition-all"
                  style={{
                    background: "color-mix(in oklch, var(--foreground) 5%, transparent)",
                    border: "1px solid color-mix(in oklch, var(--foreground) 12%, transparent)",
                  }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{
                background:
                  "linear-gradient(135deg, var(--royal-blue), color-mix(in oklch, var(--royal-blue) 70%, var(--gold-premium)))",
                boxShadow:
                  "0 4px 20px color-mix(in oklch, var(--royal-blue) 25%, transparent)",
              }}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Connexion en cours…
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Se connecter
                </>
              )}
            </button>
          </form>

          <div
            className="mt-6 pt-5 text-center"
            style={{
              borderTop: "1px solid color-mix(in oklch, var(--foreground) 8%, transparent)",
            }}
          >
            <Link
              href="/"
              className="text-sm transition-colors hover:text-[var(--royal-blue)]"
              style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}
            >
              ← Retour au site
            </Link>
          </div>
        </div>

        <p
          className="text-center text-xs mt-4"
          style={{ color: "color-mix(in oklch, var(--foreground) 35%, transparent)" }}
        >
          Accès restreint — Connexion sécurisée
        </p>
      </div>
    </div>
  );
}
