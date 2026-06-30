import type { AppState } from "../data/types";

/**
 * Client for the lightweight profile server (server/index.mjs).
 *
 * There is no database: each learner is one JSON file on the server. When the
 * app runs behind YunoHost's SSO the logged-in user *is* the profile; otherwise
 * profiles are open and chosen from the landing page. All of this is best-effort
 * — if the server is unreachable, the app keeps working from localStorage.
 *
 * Base URL defaults to same-origin `/api` (the Node server serves both the
 * static site and the API). Override for dev with `VITE_API_URL`.
 */
const API: string = (import.meta.env.VITE_API_URL as string | undefined) || "/api";

export interface ProfileInfo {
  id: string;
  name: string;
}

export interface Me {
  user: string | null;
  sso: boolean;
}

/** Who am I? Returns the SSO user when behind YunoHost auth, else null. */
export async function getMe(): Promise<Me> {
  try {
    const res = await fetch(`${API}/me`);
    if (!res.ok) return { user: null, sso: false };
    return (await res.json()) as Me;
  } catch {
    return { user: null, sso: false };
  }
}

/** List existing profiles (open mode). Empty array if the server is down. */
export async function listProfiles(): Promise<ProfileInfo[]> {
  try {
    const res = await fetch(`${API}/users`);
    if (!res.ok) return [];
    return (await res.json()) as ProfileInfo[];
  } catch {
    return [];
  }
}

/** Generate a local-only profile id (used when no server is reachable). */
function localId(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const bytes = crypto.getRandomValues(new Uint8Array(8));
      return Array.from(bytes, (b) => (b % 36).toString(36)).join("");
    }
  } catch {
    /* ignore */
  }
  return Math.random().toString(36).slice(2, 10).padEnd(8, "0");
}

/**
 * Create a profile. Tries the server first; if it's unreachable (dev without
 * the backend, or a static-only deploy) it falls back to a **local-only**
 * profile so the learner can always get in — the app works entirely from
 * localStorage, and will start syncing if a server later becomes available.
 */
export async function createProfile(name: string): Promise<ProfileInfo | null> {
  const clean = name.trim();
  if (!clean) return null;
  try {
    const res = await fetch(`${API}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: clean }),
    });
    if (res.ok) return (await res.json()) as ProfileInfo;
  } catch {
    /* fall through to a local profile */
  }
  return { id: localId(), name: clean };
}

/** Load a profile's stored state, or null if missing / offline. */
export async function loadState(id: string): Promise<Partial<AppState> | null> {
  try {
    const res = await fetch(`${API}/state/${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    return (await res.json()) as Partial<AppState>;
  } catch {
    return null;
  }
}

/** Persist a profile's full state. Returns true on success. */
export async function saveState(id: string, state: AppState): Promise<boolean> {
  try {
    const res = await fetch(`${API}/state/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// The chosen profile id is remembered on the device so the same learner reopens
// automatically. The full state lives on the server.
const PROFILE_KEY = "lingua90-profile";

export function getStoredProfileId(): string | null {
  try {
    return localStorage.getItem(PROFILE_KEY);
  } catch {
    return null;
  }
}

export function setStoredProfileId(id: string | null) {
  try {
    if (id) localStorage.setItem(PROFILE_KEY, id);
    else localStorage.removeItem(PROFILE_KEY);
  } catch {
    /* ignore */
  }
}
