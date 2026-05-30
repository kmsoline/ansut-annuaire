"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3, FileText, Palette, Settings, HelpCircle, MessageCircle,
  Building2, Mail, Home, Info, ScrollText, Palmtree, Search, Image,
  Compass, Users, History, Download, Upload, LogOut, ShieldAlert, Menu, X,
  Sparkles, LayoutTemplate,
} from "lucide-react";
import { canAccess, ROLE_LABELS, type AdminRole } from "@/lib/permissions";

interface NavLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  adminOnly?: boolean;
}

const adminLinks: NavLink[] = [
  { href: "/admin",              label: "Dashboard",        icon: BarChart3 },
  { href: "/admin/blog",         label: "Articles",         icon: FileText },
  { href: "/admin/portfolio",    label: "Projets",          icon: Palette },
  { href: "/admin/services",     label: "Services",         icon: Settings },
  { href: "/admin/faq",          label: "FAQ",              icon: HelpCircle },
  { href: "/admin/testimonials", label: "Témoignages",      icon: MessageCircle },
  { href: "/admin/client-logos", label: "Logos clients",    icon: Building2 },
  { href: "/admin/media",        label: "Médiathèque",      icon: Image },
  { href: "/admin/contacts",     label: "Contacts",         icon: Mail },
  { href: "/admin/afrinomade",   label: "AfriNomade",       icon: Palmtree },
  { href: "/admin/newsletter",   label: "Newsletter",       icon: Mail,      adminOnly: true },
  { href: "/admin/homepage",     label: "Page d'accueil",   icon: Home,      adminOnly: true },
  { href: "/admin/pages",        label: "Pages du site",    icon: LayoutTemplate, adminOnly: true },
  { href: "/admin/icons",        label: "Icônes",           icon: Sparkles,  adminOnly: true },
  { href: "/admin/about",        label: "À propos",         icon: Info,      adminOnly: true },
  { href: "/admin/legal",        label: "Pages légales",    icon: ScrollText, adminOnly: true },
  { href: "/admin/metadata",     label: "SEO",              icon: Search,    adminOnly: true },
  { href: "/admin/navigation",   label: "Navigation",       icon: Compass,   adminOnly: true },
  { href: "/admin/users",        label: "Utilisateurs",     icon: Users,     adminOnly: true },
  { href: "/admin/audit-log",    label: "Historique",       icon: History,   adminOnly: true },
  { href: "/admin/export",       label: "Export",           icon: Download,  adminOnly: true },
  { href: "/admin/import",       label: "Import",           icon: Upload,    adminOnly: true },
  { href: "/admin/settings",     label: "Paramètres",       icon: Settings,  adminOnly: true },
];

interface AuthUser { id: string; email: string; role: AdminRole; }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/admin/check-auth");
        if (response.ok) {
          const data = await response.json();
          const authUser: AuthUser = data.user;
          setUser(authUser);
          setAccessDenied(!canAccess(authUser.role, pathname));
        } else {
          if (pathname !== "/admin/login") router.push("/admin/login");
        }
      } catch {
        if (pathname !== "/admin/login") router.push("/admin/login");
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [pathname, router]);

  // Fermer sidebar sur changement de route
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
    } catch { /* ignore */ }
  };

  if (pathname === "/admin/login") return <>{children}</>;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--royal-blue)] mx-auto mb-4" />
          <p className="text-sm text-[color-mix(in_oklch,var(--foreground)_75%,transparent)]">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const visibleLinks = adminLinks.filter((link) => !link.adminOnly || user.role === "admin");
  const contentLinks   = visibleLinks.filter((l) => !l.adminOnly && l.href !== "/admin");
  const adminOnlyLinks = visibleLinks.filter((l) => l.adminOnly);

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-5 py-4 shrink-0 flex items-center justify-between"
        style={{ borderBottom: "1px solid color-mix(in oklch, var(--foreground) 7%, transparent)" }}>
        <Link href="/admin" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, var(--royal-blue), color-mix(in oklch, var(--royal-blue) 70%, var(--gold-premium)))" }}>
            <span className="text-white font-black text-sm">D</span>
          </div>
          <div>
            <div className="text-sm font-bold leading-none">DIME Admin</div>
            <div className="text-[10px] mt-0.5" style={{ color: "color-mix(in oklch, var(--foreground) 40%, transparent)" }}>Panneau de contrôle</div>
          </div>
        </Link>
        <button
          className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          onClick={() => setSidebarOpen(false)}
          aria-label="Fermer le menu"
        >
          <X size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-1">
        {visibleLinks.filter((l) => l.href === "/admin").map((link) => (
          <NavItem key={link.href} link={link} pathname={pathname} />
        ))}

        {contentLinks.length > 0 && (
          <>
            <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: "color-mix(in oklch, var(--foreground) 35%, transparent)" }}>
              Contenu
            </p>
            {contentLinks.map((link) => <NavItem key={link.href} link={link} pathname={pathname} />)}
          </>
        )}

        {adminOnlyLinks.length > 0 && (
          <>
            <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: "color-mix(in oklch, var(--foreground) 35%, transparent)" }}>
              Administration
            </p>
            {adminOnlyLinks.map((link) => <NavItem key={link.href} link={link} pathname={pathname} />)}
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="p-3 shrink-0"
        style={{ borderTop: "1px solid color-mix(in oklch, var(--foreground) 7%, transparent)" }}>
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-1"
          style={{ background: "color-mix(in oklch, var(--royal-blue) 8%, transparent)" }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white"
            style={{ background: "var(--royal-blue)" }}>
            {user.email[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold truncate">{user.email}</p>
            <p className="text-[10px]" style={{ color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>
              {ROLE_LABELS[user.role]}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200 group"
          style={{ color: "color-mix(in oklch, var(--foreground) 55%, transparent)" }}
        >
          <LogOut size={15} strokeWidth={1.8} className="group-hover:text-red-400 transition-colors" />
          <span className="text-xs group-hover:text-red-400 transition-colors">Déconnexion</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* ── Sidebar desktop (toujours visible lg+) ─────────────────────────── */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 border-r border-white/10 glass glass-strong z-40 flex-col">
        <SidebarContent />
      </aside>

      {/* ── Sidebar mobile (drawer) ─────────────────────────────────────────── */}
      {sidebarOpen && (
        <>
          {/* Overlay */}
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <aside className="lg:hidden fixed left-0 top-0 h-full w-72 border-r border-white/10 glass glass-strong z-50 flex flex-col animate-slide-in-left">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* ── Top bar mobile ──────────────────────────────────────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 z-30 flex items-center justify-between px-4 border-b border-white/10 glass glass-strong">
        <button
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          onClick={() => setSidebarOpen(true)}
          aria-label="Ouvrir le menu"
        >
          <Menu size={20} />
        </button>
        <div className="text-base font-bold bg-gradient-to-r from-[var(--royal-blue)] to-[var(--gold-premium)] bg-clip-text text-transparent">
          DIME Admin
        </div>
        <div className="w-9" />
      </div>

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <main className="lg:ml-64 pt-14 lg:pt-0 p-4 sm:p-6 lg:p-8 min-h-screen">
        {accessDenied ? <AccessDeniedPage /> : children}
      </main>
    </div>
  );
}

function NavItem({ link, pathname }: { link: NavLink; pathname: string }) {
  const Icon = link.icon;
  const active = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
  return (
    <Link
      href={link.href}
      className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group"
      style={active ? {
        background: "color-mix(in oklch, var(--royal-blue) 12%, transparent)",
        color: "var(--royal-blue)",
        fontWeight: 600,
      } : {
        color: "color-mix(in oklch, var(--foreground) 62%, transparent)",
      }}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
          style={{ background: "var(--royal-blue)" }} />
      )}
      <Icon size={16} strokeWidth={active ? 2.2 : 1.7} />
      <span className={`text-sm ${!active ? "group-hover:text-[var(--royal-blue)] transition-colors" : ""}`}>
        {link.label}
      </span>
    </Link>
  );
}

function AccessDeniedPage() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
      <ShieldAlert size={48} strokeWidth={1.5} style={{ color: "color-mix(in oklch, var(--foreground) 30%, transparent)" }} />
      <h2 className="text-2xl font-bold">Accès restreint</h2>
      <p className="text-sm max-w-sm" style={{ color: "color-mix(in oklch, var(--foreground) 60%, transparent)" }}>
        Vous n&apos;avez pas les droits nécessaires pour accéder à cette section. Contactez un administrateur.
      </p>
      <button onClick={() => router.push("/admin")} className="btn btn-primary mt-2">
        Retour au dashboard
      </button>
    </div>
  );
}
