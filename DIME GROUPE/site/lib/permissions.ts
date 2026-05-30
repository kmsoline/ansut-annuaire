/**
 * Droits d'accès par rôle dans l'interface admin.
 * - "admin"  : accès complet
 * - "editor" : accès au contenu éditorial uniquement
 */

export type AdminRole = "admin" | "editor";

/** Préfixes de routes accessibles par les éditeurs */
export const EDITOR_ALLOWED_PATHS = [
  "/admin",               // dashboard (exact)
  "/admin/blog",
  "/admin/portfolio",
  "/admin/services",
  "/admin/faq",
  "/admin/testimonials",
  "/admin/client-logos",
  "/admin/media",
  "/admin/contacts",
  "/admin/afrinomade",
] as const;

/** Préfixes réservés aux admins uniquement */
export const ADMIN_ONLY_PATHS = [
  "/admin/newsletter",
  "/admin/homepage",
  "/admin/about",
  "/admin/legal",
  "/admin/metadata",
  "/admin/navigation",
  "/admin/users",
  "/admin/audit-log",
  "/admin/export",
  "/admin/import",
  "/admin/settings",
] as const;

/**
 * Vérifie si un rôle peut accéder à un chemin donné.
 * Les admins ont accès à tout.
 */
export function canAccess(role: AdminRole, pathname: string): boolean {
  if (role === "admin") return true;

  // L'éditeur peut accéder exactement à /admin (dashboard)
  if (pathname === "/admin") return true;

  // Vérifie si le chemin commence par un préfixe autorisé
  return EDITOR_ALLOWED_PATHS.some(
    (allowed) => allowed !== "/admin" && pathname.startsWith(allowed)
  );
}

/** Labels lisibles par rôle */
export const ROLE_LABELS: Record<AdminRole, string> = {
  admin: "Administrateur",
  editor: "Éditeur",
};
