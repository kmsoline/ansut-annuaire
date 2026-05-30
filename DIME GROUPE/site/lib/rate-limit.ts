/**
 * Rate limiter en mémoire.
 * Pour production à haute charge, remplacer par Redis (Upstash ou autre).
 * Stocke IP + tentatives + timestamp dans une Map.
 */

interface RateLimitEntry {
  count: number;
  firstAttempt: number;
  blockedUntil?: number;
}

const store = new Map<string, RateLimitEntry>();

/** Nettoyage périodique des entrées expirées */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    const age = now - entry.firstAttempt;
    if (age > 60 * 60 * 1000) store.delete(key); // supprime après 1h
  }
}, 5 * 60 * 1000); // toutes les 5 min

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter?: number; // secondes
}

/**
 * Vérifie si la clé (IP) est autorisée.
 * @param key       Identifiant unique (IP, IP+route, etc.)
 * @param maxAttempts Nombre max de tentatives sur la fenêtre
 * @param windowMs  Fenêtre de temps en ms
 * @param blockMs   Durée de blocage après dépassement
 */
export function checkRateLimit(
  key: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000, // 15 min
  blockMs = 30 * 60 * 1000   // 30 min de blocage
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  // Blocage actif ?
  if (entry?.blockedUntil && entry.blockedUntil > now) {
    const retryAfter = Math.ceil((entry.blockedUntil - now) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  // Fenêtre expirée → réinitialiser
  if (!entry || now - entry.firstAttempt > windowMs) {
    store.set(key, { count: 1, firstAttempt: now });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  // Incrémenter
  entry.count += 1;

  if (entry.count > maxAttempts) {
    entry.blockedUntil = now + blockMs;
    const retryAfter = Math.ceil(blockMs / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  return { allowed: true, remaining: maxAttempts - entry.count };
}

/**
 * Réinitialise le compteur après un login réussi.
 */
export function resetRateLimit(key: string): void {
  store.delete(key);
}
