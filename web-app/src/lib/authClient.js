"use client";

/**
 * Auth client web.
 *
 * - Le *refresh token* n'est jamais exposé au JavaScript : il vit uniquement
 *   dans un cookie HttpOnly posé par les routes /api/auth/*.
 * - L'*access token* (courte durée, 15 min) reste en localStorage pour les
 *   appels directs à l'API NestJS, mais il est renouvelé automatiquement via
 *   /api/auth/refresh (qui lit le cookie HttpOnly) quand il est expiré ou
 *   qu'une requête renvoie 401.
 */

const ACCESS_KEY = "accessToken";
const SKEW_MS = 60_000; // marge avant expiration pour déclencher un refresh
const NEGATIVE_TTL_MS = 30_000; // pas de nouvel essai de refresh pendant ce délai

let refreshInFlight = null; // dédoublonne les refresh concurrents
let noSessionUntil = 0; // horodatage jusqu'auquel on considère qu'il n'y a pas de session

function jwtExpiryMs(token) {
  try {
    const [, payload] = token.split(".");
    const { exp } = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof exp === "number" ? exp * 1000 : 0;
  } catch {
    return 0;
  }
}

export function readAccessToken() {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(ACCESS_KEY);
  } catch {
    return null;
  }
}

export function storeAccessToken(token) {
  if (token) noSessionUntil = 0; // un token frais => session active
  try {
    if (token) localStorage.setItem(ACCESS_KEY, token);
    else localStorage.removeItem(ACCESS_KEY);
  } catch {
    /* stockage indisponible : on continue sans persistance */
  }
}

export function clearClientAuth() {
  noSessionUntil = Date.now() + NEGATIVE_TTL_MS;
  try {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem("jwt_token"); // ancienne clé éventuelle
  } catch {
    /* ignore */
  }
}

/** À appeler après un login réussi pour lever le cache négatif. */
export function markSessionActive() {
  noSessionUntil = 0;
}

async function performRefresh() {
  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      cache: "no-store",
    });
    if (res.status === 401) {
      // Pas de session : on évite de retenter à chaque appel pendant un moment.
      clearClientAuth();
      return null;
    }
    if (!res.ok) {
      // 5xx (backend indisponible) : on ne pose pas le cache négatif.
      return null;
    }
    const data = await res.json().catch(() => ({}));
    if (data && data.access_token) {
      storeAccessToken(data.access_token);
      return data.access_token;
    }
    // Le cookie a pu être renouvelé sans renvoyer de corps : on garde l'existant.
    return readAccessToken();
  } catch {
    return null;
  }
}

/** Renouvelle la session (un seul appel réseau même si invoqué en parallèle). */
export function refreshSession() {
  if (Date.now() < noSessionUntil) return Promise.resolve(null);
  if (!refreshInFlight) {
    refreshInFlight = performRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

/**
 * Retourne un access token valide, en le renouvelant si nécessaire.
 * `null` si l'utilisateur n'a pas (ou plus) de session.
 */
export async function getAccessToken({ allowRefresh = true } = {}) {
  const current = readAccessToken();
  if (current && jwtExpiryMs(current) - Date.now() > SKEW_MS) return current;
  if (!allowRefresh || Date.now() < noSessionUntil) return current;
  return refreshSession();
}

/** En-tête Authorization prêt à l'emploi, ou `null` si non authentifié. */
export async function authHeader() {
  const token = await getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : null;
}

/**
 * `fetch` avec injection du Bearer et un retry unique après refresh sur 401.
 */
export async function authFetch(url, options = {}) {
  const token = await getAccessToken();
  const baseHeaders = { ...(options.headers || {}) };
  if (token) baseHeaders.Authorization = `Bearer ${token}`;

  let res = await fetch(url, { ...options, headers: baseHeaders });
  if (res.status === 401) {
    const fresh = await refreshSession();
    if (fresh) {
      res = await fetch(url, {
        ...options,
        headers: { ...baseHeaders, Authorization: `Bearer ${fresh}` },
      });
    }
  }
  return res;
}
