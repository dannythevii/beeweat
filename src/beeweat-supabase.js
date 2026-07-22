// ============================================================================
// BEEWEAT — Modulo di integrazione con Supabase
// ----------------------------------------------------------------------------
// 1) Installa il client:   npm install @supabase/supabase-js
// 2) Inserisci le TUE chiavi qui sotto (le trovi in Supabase → Project Settings → API).
//    Usa SEMPRE la "anon key" pubblica nell'app, MAI la service_role key.
// 3) Crea un bucket Storage chiamato "posts" (lettura pubblica) per le foto.
// ============================================================================

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://bdgypqgtzrqoqbkqgnnj.supabase.co/rest/v1/"; // ← incolla qui
const SUPABASE_ANON_KEY = "sb_publishable_HtXEzXb12JA-6GjY-EwQtw_VxmncYdC";                 // ← incolla qui

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// true quando le chiavi qui sopra sono state compilate (attiva il login reale nell'app)
export const isConfigured = !SUPABASE_URL.includes("IL-TUO-PROGETTO") && !SUPABASE_ANON_KEY.startsWith("LA-TUA");

// ============================================================================
// AUTENTICAZIONE
// ============================================================================

// Registrazione con email + password (name e city finiscono nei metadati → profilo)
export async function registerEmail({ email, password, name, city }) {
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { name, city } },
  });
  if (error) throw error;
  return data.user;
}

// Accesso con email + password
export async function loginEmail({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

// Accesso social: provider = 'google' | 'apple' | 'facebook'
export async function loginSocial(provider) {
  const { data, error } = await supabase.auth.signInWithOAuth({ provider });
  if (error) throw error;
  return data;
}

// Recupero password: invia l'email con il link sicuro (gestito da Supabase)
export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "https://IL-TUO-SITO/reset", // pagina dove l'utente imposta la nuova password
  });
  if (error) throw error;
  return true;
}

export async function logout() {
  await supabase.auth.signOut();
}

// Utente corrente + suo profilo
export async function getCurrentProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (error) throw error;
  return data;
}

// ============================================================================
// FOTO (Storage)  — carica nel bucket "posts" e restituisce l'URL pubblico
// ============================================================================
export async function uploadPhoto(file) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Utente non autenticato");
  const path = `${user.id}/${Date.now()}.jpg`;
  const { error } = await supabase.storage.from("posts").upload(path, file, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("posts").getPublicUrl(path);
  return data.publicUrl;
}

// ============================================================================
// POST
// ============================================================================

// Crea un post: prima carica la foto, poi salva il record
export async function createPost({ file, caption, condition, lat, lng }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Utente non autenticato");
  const image_url = await uploadPhoto(file);
  const { data, error } = await supabase.from("posts").insert({
    user_id: user.id, image_url, caption, condition, lat, lng, is_live: true,
  }).select().single();
  if (error) throw error;
  return data;
}

// Feed per prossimità (usa la funzione SQL feed_nearby)
export async function getFeedNearby({ lat, lng, radiusKm = 10 }) {
  const { data, error } = await supabase.rpc("feed_nearby", {
    p_lat: lat, p_lng: lng, p_radius_km: radiusKm,
  });
  if (error) throw error;
  return data;
}

// I miei post
export async function getMyPosts() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase.from("posts")
    .select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

// ============================================================================
// STELLE / LIKE  (metti o togli)
// ============================================================================
export async function toggleStar(postId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Utente non autenticato");
  const { data: existing } = await supabase.from("stars")
    .select("post_id").eq("post_id", postId).eq("user_id", user.id).maybeSingle();
  if (existing) {
    await supabase.from("stars").delete().eq("post_id", postId).eq("user_id", user.id);
    return false; // rimosso
  } else {
    await supabase.from("stars").insert({ post_id: postId, user_id: user.id });
    return true;  // aggiunto
  }
}

// ============================================================================
// EVENTI
// ============================================================================
export async function createEvent({ type, category, title, place, lat, lng, severity = "Media" }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Utente non autenticato");
  const { data, error } = await supabase.from("events").insert({
    user_id: user.id, type, category, title, place, lat, lng, severity,
  }).select().single();
  if (error) throw error;
  return data;
}

export async function getEventsNearby({ lat, lng, radiusKm = 10 }) {
  // Esempio: filtro lato client se non crei una funzione dedicata.
  const { data, error } = await supabase.from("events").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data; // (opzionale) filtra per distanza nel client, o crea una RPC come feed_nearby
}

// ============================================================================
// CHAT PUBBLICA DEL POST  (realtime)
// ============================================================================

// Carica gli ultimi messaggi della chat pubblica di un post
export async function getPostMessages(postId, limit = 50) {
  const { data, error } = await supabase.from("messages")
    .select("id, text, from_user_id, created_at, profiles(name, avatar_url)")
    .eq("scope", "post").eq("post_id", postId)
    .order("created_at", { ascending: true }).limit(limit);
  if (error) throw error;
  return data;
}

// Invia un messaggio nella chat pubblica del post
export async function sendPostMessage(postId, text) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Utente non autenticato");
  const { data, error } = await supabase.from("messages").insert({
    scope: "post", post_id: postId, from_user_id: user.id, text,
  }).select().single();
  if (error) throw error;
  return data;
}

// Ascolta in tempo reale i nuovi messaggi del post. Restituisce una funzione per disiscriversi.
export function subscribePostChat(postId, onNew) {
  const channel = supabase
    .channel(`post:${postId}`)
    .on("postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `post_id=eq.${postId}` },
      payload => onNew(payload.new))
    .subscribe();
  return () => supabase.removeChannel(channel);
}

// ============================================================================
// NOTIFICHE  (preferenze + token + posizione)
// ============================================================================
export async function saveNotifPrefs(prefs) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Utente non autenticato");
  const { error } = await supabase.from("notification_prefs")
    .upsert({ user_id: user.id, ...prefs });
  if (error) throw error;
  return true;
}

export async function saveDeviceToken(token, platform) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Utente non autenticato");
  const { error } = await supabase.from("device_tokens").upsert({ user_id: user.id, token, platform });
  if (error) throw error;
  return true;
}

export async function updateMyLocation(lat, lng) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Utente non autenticato");
  const { error } = await supabase.from("user_location")
    .upsert({ user_id: user.id, lat, lng, updated_at: new Date().toISOString() });
  if (error) throw error;
  return true;
}

// ============================================================================
// ESEMPIO D'USO (commentato)
// ----------------------------------------------------------------------------
// import { loginEmail, createPost, getFeedNearby, subscribePostChat } from "./beeweat-supabase";
//
// await loginEmail({ email, password });
// const post = await createPost({ file, caption: "Bel sole!", condition: "☀️ Sereno", lat, lng });
// const feed = await getFeedNearby({ lat, lng, radiusKm: 10 });
// const unsubscribe = subscribePostChat(post.id, (msg) => console.log("nuovo:", msg));
// // ... quando chiudi la chat: unsubscribe();
// ============================================================================
