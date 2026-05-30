/**
 * Helper partagé pour vérifier l'authentification dans les routes API admin.
 */
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth";

export async function checkAdminAuth(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token");
    if (!token?.value) return false;
    const payload = verifyJWT(token.value);
    return payload !== null;
  } catch {
    return false;
  }
}

export async function getAdminUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token");
    if (!token?.value) return null;
    return verifyJWT(token.value);
  } catch {
    return null;
  }
}

/**
 * Vérifie que l'utilisateur est connecté ET a le rôle "admin".
 * À utiliser dans les routes réservées aux administrateurs.
 */
export async function checkAdminRole(): Promise<boolean> {
  try {
    const payload = await getAdminUser();
    return payload?.role === "admin";
  } catch {
    return false;
  }
}
