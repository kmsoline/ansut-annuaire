// Fichier pour l'historique des modifications (audit log)
// TODO: Remplacer par une vraie base de données

export interface AuditLog {
  id: string;
  type: "blog" | "portfolio" | "service" | "faq" | "testimonial" | "client-logo" | "homepage" | "about" | "legal" | "afrinomade" | "metadata" | "navigation" | "settings" | "user";
  action: "created" | "updated" | "deleted";
  entityId: string;
  entityTitle: string;
  userId?: string;
  changes?: Record<string, any>;
  createdAt: string;
}

export let auditLogs: AuditLog[] = [];

export function addAuditLog(log: Omit<AuditLog, "id" | "createdAt">): void {
  auditLogs.push({
    ...log,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  });

  // Garder seulement les 1000 derniers logs
  if (auditLogs.length > 1000) {
    auditLogs = auditLogs.slice(-1000);
  }
}

export function getAuditLogs(limit: number = 100): AuditLog[] {
  return [...auditLogs]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

export function getAuditLogsByType(type: AuditLog["type"], limit: number = 100): AuditLog[] {
  return getAuditLogs(limit).filter((log) => log.type === type);
}

export function getAuditLogsByEntity(type: AuditLog["type"], entityId: string): AuditLog[] {
  return auditLogs
    .filter((log) => log.type === type && log.entityId === entityId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}


