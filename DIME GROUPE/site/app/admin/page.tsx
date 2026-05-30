"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText, Palette, Settings, MessageCircle, HelpCircle, Building2,
  Mail, ExternalLink, TrendingUp, Users, Globe, BarChart3,
  ArrowRight, Plus, Bell, Eye
} from "lucide-react";

interface Stats {
  blogPosts: { total: number; published: number; drafts: number };
  portfolioItems: { total: number; published: number };
  services: { total: number; active: number };
  contacts: { total: number; unread: number };
  testimonials: { total: number; active: number };
  clientLogos: { total: number };
  newsletter: { total: number };
  faq: { total: number; active: number };
}

const ACTIONS = [
  { href: "/admin/blog/new",         label: "Article",      icon: FileText,     color: "var(--royal-blue)" },
  { href: "/admin/portfolio/new",    label: "Projet",       icon: Palette,      color: "var(--gold-premium)" },
  { href: "/admin/services/new",     label: "Service",      icon: Settings,     color: "var(--turquoise)" },
  { href: "/admin/testimonials/new", label: "Témoignage",   icon: MessageCircle,color: "var(--royal-blue)" },
  { href: "/admin/faq/new",          label: "FAQ",          icon: HelpCircle,   color: "var(--gold-premium)" },
  { href: "/admin/client-logos/new", label: "Logo client",  icon: Building2,    color: "var(--turquoise)" },
];

const CONTENT_LINKS = [
  { href: "/admin/homepage",   label: "Page d'accueil",  icon: Globe,         note: "Hero, services, CTA…" },
  { href: "/admin/pages",      label: "En-têtes pages",  icon: BarChart3,     note: "Titres, sous-titres, CTA" },
  { href: "/admin/navigation", label: "Navigation",      icon: ArrowRight,    note: "Menus header & footer" },
  { href: "/admin/metadata",   label: "SEO",             icon: Eye,           note: "Titres, descriptions, og" },
  { href: "/admin/settings",   label: "Paramètres",      icon: Settings,      note: "Contact, réseaux, footer" },
  { href: "/admin/icons",      label: "Icônes",          icon: TrendingUp,    note: "Emojis & images du site" },
];

function StatCard({ href, icon: Icon, label, value, sub, color, urgent }: {
  href: string; icon: React.ElementType;
  label: string; value: number; sub?: string; color: string; urgent?: boolean;
}) {
  return (
    <Link href={href} className="group relative rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
      style={{
        background: `color-mix(in oklch, ${color} 7%, var(--background))`,
        border: `1px solid color-mix(in oklch, ${color} 18%, transparent)`,
        boxShadow: urgent ? `0 0 0 2px color-mix(in oklch, ${color} 35%, transparent)` : "none",
      }}>
      {urgent && (
        <span className="absolute top-3 right-3 w-2 h-2 rounded-full animate-pulse" style={{ background: color }} />
      )}
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `color-mix(in oklch, ${color} 15%, transparent)` }}>
          <Icon size={18} strokeWidth={1.8} style={{ color }} />
        </div>
        <span className="text-3xl font-black tabular-nums" style={{ color }}>{value}</span>
      </div>
      <p className="text-sm font-semibold mb-0.5">{label}</p>
      {sub && <p className="text-[11px]" style={{ color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>{sub}</p>}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
        style={{ background: `linear-gradient(to right, ${color}, transparent)` }} />
    </Link>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    blogPosts: { total: 0, published: 0, drafts: 0 },
    portfolioItems: { total: 0, published: 0 },
    services: { total: 0, active: 0 },
    contacts: { total: 0, unread: 0 },
    testimonials: { total: 0, active: 0 },
    clientLogos: { total: 0 },
    newsletter: { total: 0 },
    faq: { total: 0, active: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [hour] = useState(new Date().getHours());

  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";
  const today = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/blog").then(r => r.ok ? r.json() : []),
      fetch("/api/admin/portfolio").then(r => r.ok ? r.json() : []),
      fetch("/api/admin/services").then(r => r.ok ? r.json() : []),
      fetch("/api/admin/contacts").then(r => r.ok ? r.json() : []),
      fetch("/api/admin/testimonials").then(r => r.ok ? r.json() : []),
      fetch("/api/admin/client-logos").then(r => r.ok ? r.json() : []),
      fetch("/api/admin/newsletter").then(r => r.ok ? r.json() : []),
      fetch("/api/admin/faq").then(r => r.ok ? r.json() : []),
    ]).then(([blog, portfolio, services, contacts, testimonials, logos, newsletter, faq]) => {
      type AnyItem = { published?: boolean; active?: boolean; read?: boolean };
      setStats({
        blogPosts: { total: blog.length, published: blog.filter((p: AnyItem) => p.published).length, drafts: blog.filter((p: AnyItem) => !p.published).length },
        portfolioItems: { total: portfolio.length, published: portfolio.filter((p: AnyItem) => p.published).length },
        services: { total: services.length, active: services.filter((s: AnyItem) => s.active).length },
        contacts: { total: contacts.length, unread: contacts.filter((c: AnyItem) => !c.read).length },
        testimonials: { total: testimonials.length, active: testimonials.filter((t: AnyItem) => t.active).length },
        clientLogos: { total: logos.length },
        newsletter: { total: newsletter.length },
        faq: { total: faq.length, active: faq.filter((f: AnyItem) => f.active).length },
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-xl animate-pulse" style={{ background: "var(--royal-blue)" }} />
        <p className="text-sm" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>Chargement…</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-[1200px]">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1"
            style={{ color: "color-mix(in oklch, var(--foreground) 40%, transparent)" }}>{today}</p>
          <h1 className="text-3xl font-bold mb-1">{greeting} 👋</h1>
          <p className="text-sm" style={{ color: "color-mix(in oklch, var(--foreground) 55%, transparent)" }}>
            Voici l'état de votre site DIME GROUPE
          </p>
        </div>
        <div className="flex items-center gap-3">
          {stats.contacts.unread > 0 && (
            <Link href="/admin/contacts"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "var(--royal-blue)" }}>
              <Bell size={14} />
              {stats.contacts.unread} nouveau{stats.contacts.unread > 1 ? "x" : ""} message{stats.contacts.unread > 1 ? "s" : ""}
            </Link>
          )}
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
            style={{
              border: "1px solid color-mix(in oklch, var(--foreground) 12%, transparent)",
              color: "color-mix(in oklch, var(--foreground) 70%, transparent)",
            }}>
            <ExternalLink size={14} />
            Voir le site
          </a>
        </div>
      </div>

      {/* ── KPIs principaux ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard href="/admin/contacts" icon={Mail} label="Messages" value={stats.contacts.total}
          sub={stats.contacts.unread ? `${stats.contacts.unread} non lu${stats.contacts.unread > 1 ? "s" : ""}` : "Tous lus"}
          color="var(--royal-blue)" urgent={stats.contacts.unread > 0} />
        <StatCard href="/admin/newsletter" icon={Users} label="Abonnés newsletter" value={stats.newsletter.total}
          sub="Total inscrits" color="var(--turquoise)" />
        <StatCard href="/admin/blog" icon={FileText} label="Articles publiés" value={stats.blogPosts.published}
          sub={`${stats.blogPosts.drafts} brouillon${stats.blogPosts.drafts > 1 ? "s" : ""}`}
          color="var(--gold-premium)" />
        <StatCard href="/admin/portfolio" icon={Palette} label="Projets en ligne" value={stats.portfolioItems.published}
          sub={`${stats.portfolioItems.total} au total`} color="var(--royal-blue)" />
      </div>

      {/* ── Contenu + Actions ── */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">

        {/* Contenu */}
        <div className="space-y-5">
          {/* Contenu éditorial */}
          <div className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid color-mix(in oklch, var(--foreground) 8%, transparent)" }}>
            <div className="px-5 py-3.5 flex items-center justify-between"
              style={{ background: "color-mix(in oklch, var(--foreground) 3%, transparent)", borderBottom: "1px solid color-mix(in oklch, var(--foreground) 6%, transparent)" }}>
              <h2 className="font-semibold text-sm">Contenu éditorial</h2>
              <span className="text-[11px]" style={{ color: "color-mix(in oklch, var(--foreground) 40%, transparent)" }}>Cliquer pour gérer</span>
            </div>
            <div className="divide-y" style={{ "--tw-divide-opacity": 1, borderColor: "color-mix(in oklch, var(--foreground) 5%, transparent)" } as React.CSSProperties}>
              {[
                { href: "/admin/blog", icon: FileText, label: "Articles blog", value: stats.blogPosts.total, sub: `${stats.blogPosts.published} publiés`, color: "var(--royal-blue)", new: "/admin/blog/new" },
                { href: "/admin/portfolio", icon: Palette, label: "Projets portfolio", value: stats.portfolioItems.total, sub: `${stats.portfolioItems.published} publiés`, color: "var(--gold-premium)", new: "/admin/portfolio/new" },
                { href: "/admin/services", icon: Settings, label: "Services", value: stats.services.total, sub: `${stats.services.active} actifs`, color: "var(--turquoise)", new: "/admin/services/new" },
                { href: "/admin/faq", icon: HelpCircle, label: "FAQ", value: stats.faq.total, sub: `${stats.faq.active} active${stats.faq.active > 1 ? "s" : ""}`, color: "var(--royal-blue)", new: "/admin/faq/new" },
                { href: "/admin/testimonials", icon: MessageCircle, label: "Témoignages", value: stats.testimonials.total, sub: `${stats.testimonials.active} actifs`, color: "var(--gold-premium)", new: "/admin/testimonials/new" },
                { href: "/admin/client-logos", icon: Building2, label: "Logos clients", value: stats.clientLogos.total, sub: "Marque de confiance", color: "var(--turquoise)", new: "/admin/client-logos/new" },
              ].map(item => (
                <div key={item.href} className="group flex items-center justify-between px-5 py-3.5 transition-all hover:bg-[color-mix(in_oklch,var(--foreground)_2%,transparent)]">
                  <Link href={item.href} className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `color-mix(in oklch, ${item.color} 12%, transparent)` }}>
                      <item.icon size={14} strokeWidth={2} style={{ color: item.color }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-[11px]" style={{ color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>{item.sub}</p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-3">
                    {item.value > 0 && <span className="text-lg font-bold tabular-nums" style={{ color: item.color }}>{item.value}</span>}
                    <Link href={item.new}
                      className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                      style={{ background: `color-mix(in oklch, ${item.color} 15%, transparent)` }}
                      title="Créer">
                      <Plus size={13} style={{ color: item.color }} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Config du site */}
          <div className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid color-mix(in oklch, var(--foreground) 8%, transparent)" }}>
            <div className="px-5 py-3.5"
              style={{ background: "color-mix(in oklch, var(--foreground) 3%, transparent)", borderBottom: "1px solid color-mix(in oklch, var(--foreground) 6%, transparent)" }}>
              <h2 className="font-semibold text-sm">Configuration du site</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px"
              style={{ background: "color-mix(in oklch, var(--foreground) 5%, transparent)" }}>
              {CONTENT_LINKS.map(item => (
                <Link key={item.href} href={item.href}
                  className="group flex items-center gap-3 px-4 py-3.5 transition-all hover:bg-[color-mix(in_oklch,var(--royal-blue)_5%,transparent)]"
                  style={{ background: "var(--background)" }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "color-mix(in oklch, var(--royal-blue) 10%, transparent)" }}>
                    <item.icon size={13} strokeWidth={2} style={{ color: "var(--royal-blue)" }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold">{item.label}</p>
                    <p className="text-[10px] truncate" style={{ color: "color-mix(in oklch, var(--foreground) 42%, transparent)" }}>{item.note}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Panneau latéral */}
        <div className="space-y-5">
          {/* Créer rapidement */}
          <div className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid color-mix(in oklch, var(--foreground) 8%, transparent)" }}>
            <div className="px-5 py-3.5"
              style={{ background: "color-mix(in oklch, var(--foreground) 3%, transparent)", borderBottom: "1px solid color-mix(in oklch, var(--foreground) 6%, transparent)" }}>
              <h2 className="font-semibold text-sm">Créer rapidement</h2>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2.5">
              {ACTIONS.map(a => (
                <Link key={a.href} href={a.href}
                  className="group flex flex-col items-center gap-2 p-3.5 rounded-xl text-center transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    background: `color-mix(in oklch, ${a.color} 6%, transparent)`,
                    border: `1px solid color-mix(in oklch, ${a.color} 15%, transparent)`,
                  }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: `color-mix(in oklch, ${a.color} 15%, transparent)` }}>
                    <a.icon size={16} strokeWidth={2} style={{ color: a.color }} />
                  </div>
                  <span className="text-[11px] font-semibold">{a.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Messages non lus */}
          {stats.contacts.unread > 0 && (
            <Link href="/admin/contacts"
              className="flex items-center gap-3 p-4 rounded-2xl transition-all hover:-translate-y-0.5 group"
              style={{
                background: "color-mix(in oklch, var(--royal-blue) 8%, transparent)",
                border: "1px solid color-mix(in oklch, var(--royal-blue) 20%, transparent)",
              }}>
              <div className="relative">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "var(--royal-blue)" }}>
                  <Mail size={16} strokeWidth={2} className="text-white" />
                </div>
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                  style={{ background: "#ef4444" }}>
                  {stats.contacts.unread}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{stats.contacts.unread} message{stats.contacts.unread > 1 ? "s" : ""} non lu{stats.contacts.unread > 1 ? "s" : ""}</p>
                <p className="text-[11px]" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>Cliquer pour voir</p>
              </div>
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" style={{ color: "var(--royal-blue)" }} />
            </Link>
          )}

          {/* État du site */}
          <div className="rounded-2xl p-5 space-y-3"
            style={{ background: "color-mix(in oklch, var(--foreground) 3%, transparent)", border: "1px solid color-mix(in oklch, var(--foreground) 8%, transparent)" }}>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "color-mix(in oklch, var(--foreground) 40%, transparent)" }}>État du site</p>
            {[
              { label: "Services actifs",     value: stats.services.active,       total: stats.services.total,      color: "#22c55e" },
              { label: "Témoignages visibles", value: stats.testimonials.active,   total: stats.testimonials.total,  color: "#22c55e" },
              { label: "Logos clients",        value: stats.clientLogos.total,     total: stats.clientLogos.total,   color: "#22c55e" },
            ].map(item => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs">{item.label}</span>
                  <span className="text-xs font-bold">{item.value}/{item.total}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "color-mix(in oklch, var(--foreground) 10%, transparent)" }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${item.total > 0 ? (item.value / item.total) * 100 : 0}%`, background: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
