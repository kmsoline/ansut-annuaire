"use client";
import { useEffect, useState, useMemo } from "react";
import { Mail, Search, Trash2, CheckCheck, Download, Loader2, MessageSquare, Reply } from "lucide-react";

interface Contact { id: string; name: string; email: string; phone?: string; subject: string; message: string; read: boolean; created_at: string; }

const CARD = { background: "color-mix(in oklch, var(--foreground) 2%, transparent)", border: "1px solid color-mix(in oklch, var(--foreground) 8%, transparent)" };

export default function AdminContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all"|"unread"|"read">("all");
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => { fetch("/api/admin/contacts").then(r => r.ok ? r.json() : []).then(setContacts).catch(() => []).finally(() => setLoading(false)); }, []);

  const filtered = useMemo(() => contacts.filter(c => {
    if (filter === "unread" && c.read) return false;
    if (filter === "read" && !c.read) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.email.toLowerCase().includes(search.toLowerCase()) && !c.subject.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()), [contacts, filter, search]);

  const markRead = async (id: string) => {
    await fetch(`/api/admin/contacts/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ read: true }) });
    setContacts(prev => prev.map(x => x.id === id ? { ...x, read: true } : x));
  };
  const del = async (id: string) => {
    if (!confirm("Supprimer ce message ?")) return;
    await fetch(`/api/admin/contacts/${id}`, { method: "DELETE" });
    setContacts(prev => prev.filter(x => x.id !== id));
    if (selected === id) setSelected(null);
  };
  const exportCSV = () => {
    // Protège contre l'injection de formule CSV (cells commençant par =, +, -, @)
    const esc = (v: string) => {
      const s = v.replace(/"/g, '""');
      return /^[=+\-@|\t]/.test(s) ? `"'${s}"` : `"${s}"`;
    };
    const headers = ["Nom","Email","Téléphone","Sujet","Message","Date","Lu"];
    const rows = contacts.map(c => [
      c.name, c.email, c.phone||"", c.subject,
      c.message.replace(/\n/g," "),
      new Date(c.created_at).toLocaleDateString("fr-FR"),
      c.read ? "Oui" : "Non",
    ]);
    const csv = [headers, ...rows].map(r => r.map(esc).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" }));
    a.download = `contacts-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={24} className="animate-spin text-[var(--royal-blue)]" /></div>;
  const unread = contacts.filter(c => !c.read).length;
  const selectedContact = selected ? contacts.find(c => c.id === selected) : null;

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "color-mix(in oklch, var(--royal-blue) 12%, transparent)" }}>
                <Mail size={16} strokeWidth={2} style={{ color: "var(--royal-blue)" }} />
              </div>
              {unread > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-black text-white flex items-center justify-center" style={{ background: "#ef4444" }}>{unread}</span>}
            </div>
            <h1 className="text-2xl font-bold">Contacts</h1>
          </div>
          <p className="text-sm ml-12" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>
            {contacts.length} message{contacts.length > 1 ? "s" : ""} · {unread > 0 ? <span style={{ color: "#ef4444" }}>{unread} non lu{unread > 1 ? "s" : ""}</span> : "Tous lus"}
          </p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
          style={{ border: "1px solid color-mix(in oklch, var(--foreground) 12%, transparent)", color: "color-mix(in oklch, var(--foreground) 70%, transparent)" }}>
          <Download size={14} /> Exporter CSV
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "color-mix(in oklch, var(--foreground) 38%, transparent)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--royal-blue)]" style={CARD} />
        </div>
        <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid color-mix(in oklch, var(--foreground) 8%, transparent)" }}>
          {([["all",`Tous (${contacts.length})`], ["unread", `Non lus (${unread})`], ["read","Lus"]] as const).map(([f, label]) => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-2.5 text-xs font-semibold transition-all"
              style={{ background: filter === f ? "var(--royal-blue)" : "color-mix(in oklch, var(--foreground) 2%, transparent)", color: filter === f ? "#fff" : "color-mix(in oklch, var(--foreground) 60%, transparent)" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Split layout: liste + aperçu */}
      <div className={`grid gap-5 ${selectedContact ? "lg:grid-cols-[1fr_400px]" : ""}`}>
        {/* Liste */}
        <div className="rounded-2xl overflow-hidden" style={CARD}>
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <MessageSquare size={36} strokeWidth={1.2} className="mx-auto mb-3" style={{ color: "color-mix(in oklch, var(--foreground) 25%, transparent)" }} />
              <p className="text-sm font-medium" style={{ color: "color-mix(in oklch, var(--foreground) 50%, transparent)" }}>
                {search ? "Aucun résultat" : filter === "unread" ? "Aucun message non lu" : "Aucun message"}
              </p>
            </div>
          ) : (
            <div className="divide-y" style={{ "--tw-divide-color": "color-mix(in oklch, var(--foreground) 5%, transparent)" } as React.CSSProperties}>
              {filtered.map(c => (
                <div key={c.id}
                  className="group flex items-start gap-4 px-5 py-4 cursor-pointer transition-all hover:bg-[color-mix(in_oklch,var(--foreground)_2%,transparent)]"
                  style={selected === c.id ? { background: "color-mix(in oklch, var(--royal-blue) 6%, transparent)" } : {}}
                  onClick={() => { setSelected(selected === c.id ? null : c.id); if (!c.read) markRead(c.id); }}>
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white"
                    style={{ background: !c.read ? "var(--royal-blue)" : "color-mix(in oklch, var(--foreground) 20%, transparent)" }}>
                    {c.name[0]?.toUpperCase()}
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className={`text-sm ${!c.read ? "font-bold" : "font-medium"}`}>{c.name}</span>
                      <span className="text-[10px] shrink-0" style={{ color: "color-mix(in oklch, var(--foreground) 40%, transparent)" }}>
                        {new Date(c.created_at).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <p className={`text-xs truncate ${!c.read ? "font-semibold" : ""}`} style={{ color: !c.read ? "var(--foreground)" : "color-mix(in oklch, var(--foreground) 65%, transparent)" }}>
                      {c.subject}
                    </p>
                    <p className="text-[11px] truncate mt-0.5" style={{ color: "color-mix(in oklch, var(--foreground) 45%, transparent)" }}>{c.message}</p>
                  </div>
                  {/* Actions hover */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                    {!c.read && (
                      <button onClick={e => { e.stopPropagation(); markRead(c.id); }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: "color-mix(in oklch, #22c55e 12%, transparent)" }} title="Marquer lu">
                        <CheckCheck size={12} style={{ color: "#16a34a" }} />
                      </button>
                    )}
                    <button onClick={e => { e.stopPropagation(); del(c.id); }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: "color-mix(in oklch, #ef4444 10%, transparent)" }}>
                      <Trash2 size={12} style={{ color: "#ef4444" }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Aperçu détaillé */}
        {selectedContact && (
          <div className="rounded-2xl p-6 space-y-5 h-fit sticky top-8" style={CARD}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: "var(--royal-blue)" }}>
                  {selectedContact.name[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-sm">{selectedContact.name}</p>
                  <a href={`mailto:${selectedContact.email}`} className="text-xs hover:underline" style={{ color: "var(--royal-blue)" }}>{selectedContact.email}</a>
                </div>
              </div>
              <span className="text-[11px]" style={{ color: "color-mix(in oklch, var(--foreground) 42%, transparent)" }}>
                {new Date(selectedContact.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
            {selectedContact.phone && (
              <p className="text-xs" style={{ color: "color-mix(in oklch, var(--foreground) 55%, transparent)" }}>📞 {selectedContact.phone}</p>
            )}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "color-mix(in oklch, var(--foreground) 38%, transparent)" }}>Sujet</p>
              <p className="text-sm font-semibold">{selectedContact.subject}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "color-mix(in oklch, var(--foreground) 38%, transparent)" }}>Message</p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "color-mix(in oklch, var(--foreground) 72%, transparent)" }}>{selectedContact.message}</p>
            </div>
            <div className="flex flex-col gap-2 pt-2" style={{ borderTop: "1px solid color-mix(in oklch, var(--foreground) 7%, transparent)" }}>
              <a href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`}
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02]"
                style={{ background: "var(--royal-blue)" }}>
                <Reply size={15} /> Répondre par email
              </a>
              <button onClick={() => del(selectedContact.id)}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ border: "1px solid color-mix(in oklch, #ef4444 25%, transparent)", color: "#ef4444" }}>
                <Trash2 size={14} /> Supprimer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
