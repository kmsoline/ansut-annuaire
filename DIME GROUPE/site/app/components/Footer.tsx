"use client";

import Link from "next/link";
import Newsletter from "./Newsletter";
import AnimatedLogo from "./AnimatedLogo";
import { useWhatsApp } from "./WhatsAppNumber";
import { useState, useEffect } from "react";

interface FooterSection { id: string; title: string; links: Array<{ href: string; label: string }>; }
interface SiteSettings {
  footer_description: string;
  footer_copyright_suffix: string;
  newsletter_title: string;
  newsletter_subtitle: string;
  siteName: string;
}

const DEFAULTS: SiteSettings = {
  footer_description: "Technologie, créativité et stratégie au service de vos projets en Côte d'Ivoire.",
  footer_copyright_suffix: "Tous droits réservés.",
  newsletter_title: "Newsletter",
  newsletter_subtitle: "Recevez nos actualités et conseils",
  siteName: "DIME GROUPE",
};

export default function Footer() {
  const year = new Date().getFullYear();
  const whatsapp = useWhatsApp();
  const [footerSections, setFooterSections] = useState<FooterSection[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULTS);

  useEffect(() => {
    fetch("/api/navigation/footer")
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setFooterSections(data); })
      .catch(() => {});

    fetch("/api/settings")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && !d.error) setSettings({ ...DEFAULTS, ...d }); })
      .catch(() => {});
  }, []);

  return (
    <footer className="mt-16 border-t border-white/10">
      <div className="container grid gap-8 py-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="mb-3">
            <AnimatedLogo showText={true} />
          </div>
          <p className="text-sm max-w-md mb-4" style={{ color: "color-mix(in oklch, var(--foreground) 70%, transparent)" }}>
            {settings.footer_description}
          </p>
          <div>
            <h4 className="mb-2 text-sm font-semibold">{settings.newsletter_title}</h4>
            <p className="mb-3 text-xs" style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>
              {settings.newsletter_subtitle}
            </p>
            <Newsletter />
          </div>
        </div>
        {footerSections.map(section => (
          <div key={section.id}>
            <h4 className="mb-2 text-sm font-semibold">{section.title}</h4>
            <ul className="space-y-1 text-sm">
              {section.links.map((link, index) => {
                let finalHref = link.href;
                if (link.href.includes("wa.me") && link.href.includes("2250747555745")) {
                  finalHref = `https://wa.me/${whatsapp}`;
                }
                const isExternal = finalHref.startsWith("http") || finalHref.startsWith("mailto") || finalHref.startsWith("tel");
                const isAnchor = finalHref === "#";
                if (isAnchor) return (
                  <li key={index}><span style={{ color: "color-mix(in oklch, var(--foreground) 75%, transparent)" }}>{link.label}</span></li>
                );
                if (isExternal) return (
                  <li key={index}><a href={finalHref} target={finalHref.startsWith("http") ? "_blank" : undefined} rel={finalHref.startsWith("http") ? "noopener noreferrer" : undefined} className="hover:text-[var(--royal-blue)]">{link.label}</a></li>
                );
                return (
                  <li key={index}><Link href={finalHref} className="hover:text-[var(--royal-blue)]">{link.label}</Link></li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container py-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex flex-wrap justify-center gap-4 text-xs">
              <Link href="/legal/mentions-legales" className="hover:text-[var(--royal-blue)] transition-colors" style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>Mentions légales</Link>
              <Link href="/legal/cgv" className="hover:text-[var(--royal-blue)] transition-colors" style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>CGV</Link>
              <Link href="/legal/confidentialite" className="hover:text-[var(--royal-blue)] transition-colors" style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>Politique de confidentialité</Link>
            </div>
            <div className="text-xs text-center md:text-right" style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>
              <p>© {year} {settings.siteName}. {settings.footer_copyright_suffix}</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
