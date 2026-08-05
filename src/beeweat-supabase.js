// ============================================================================
// BEEWEAT — Modulo di integrazione con Supabase
// ----------------------------------------------------------------------------
// Le chiavi vivono in beeweat-config.js: questo file NON va più modificato
// quando arrivano gli aggiornamenti.
// ============================================================================

import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./beeweat-config.js";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Cancellazione post (autore o amministratore; decidono le regole RLS) ─────
export async function deletePost(post) {
  const { error } = await supabase.from("posts").delete().eq("id", post.id);
  if (error) throw error;
  // best effort: rimozione del file dallo storage (se il percorso è ricavabile)
  try {
    const m = String(post.img || post.image_url || "").split("/object/public/posts/")[1];
    if (m) await supabase.storage.from("posts").remove([decodeURIComponent(m)]);
  } catch (_) {}
}

// ── Push (Web Push VAPID) e posizione per le allerte ─────────────────────────
export async function savePushSub(sub) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Utente non autenticato");
  const k = sub.keys || {};
  const { error } = await supabase.from("push_subs").upsert(
    { user_id: user.id, endpoint: sub.endpoint, p256dh: k.p256dh, auth: k.auth },
    { onConflict: "endpoint" });
  if (error) throw error;
}
export async function saveMyLocation(lat, lng) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("user_location").upsert(
    { user_id: user.id, lat, lng, updated_at: new Date().toISOString() },
    { onConflict: "user_id" });
}

// ── Cancellazione messaggi (singolo o intera chat diretta) ───────────────────
export async function deleteMessage(id) {
  const { error } = await supabase.from("messages").delete().eq("id", id);
  if (error) throw error;
}
export async function clearDirectChat(otherId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Utente non autenticato");
  const { error } = await supabase.from("messages").delete()
    .eq("scope", "direct")
    .or(`and(from_user_id.eq.${user.id},to_user_id.eq.${otherId}),and(from_user_id.eq.${otherId},to_user_id.eq.${user.id})`);
  if (error) throw error;
}

// ── Gestione avvisi ───────────────────────────────────────────────────────────
export async function markNotifRead(id) {
  await supabase.from("notifications").update({ read: true }).eq("id", id);
}
export async function markAllNotifsRead() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
}
export async function deleteNotification(id) {
  await supabase.from("notifications").delete().eq("id", id);
}

// ── Amministrazione: ban/sblocco utenti ──────────────────────────────────────
export async function banUser(userId, until, reason) {
  const { error } = await supabase.from("profiles")
    .update({ banned_until: until, ban_reason: reason }).eq("id", userId);
  if (error) throw error;
}

// ── Visualizzazioni dei post (una per utente) ────────────────────────────────
export async function registerView(postId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("post_views").upsert(
    { post_id: postId, user_id: user.id },
    { onConflict: "post_id,user_id", ignoreDuplicates: true });
}

// ── Chat pubbliche dei luoghi ─────────────────────────────────────────────────
export async function getPlaceMessages(place, limit = 50) {
  const { data, error } = await supabase.from("messages")
    .select("id, text, from_user_id, created_at")
    .eq("scope", "place").eq("place", place)
    .order("created_at", { ascending: true }).limit(limit);
  if (error) throw error;
  const rows = data || [];
  const ids = [...new Set(rows.map(r => r.from_user_id))];
  if (ids.length) {
    const { data: profs } = await supabase.from("profiles").select("id,name").in("id", ids);
    const pm = Object.fromEntries((profs || []).map(p => [p.id, p]));
    rows.forEach(r => { r.profiles = pm[r.from_user_id] || null; });
  }
  return rows;
}
export async function sendPlaceMessage(place, text) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Utente non autenticato");
  const { data, error } = await supabase.from("messages")
    .insert({ scope: "place", place, from_user_id: user.id, text })
    .select().single();
  if (error) throw error; return data;
}
export async function subscribePlaceChat(place, onNew) {
  await authRealtime();
  const ch = supabase.channel("place:" + place)
    .on("postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `place=eq.${place}` },
      payload => onNew(payload.new))
    .subscribe();
  return () => supabase.removeChannel(ch);
}

// ── Seguiti / Follower ────────────────────────────────────────────────────────
export async function getMyFollows() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase.from("follows").select("followed_id").eq("follower_id", user.id);
  if (error) throw error; return (data || []).map(r => r.followed_id);
}
export async function getMyFollowers() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase.from("follows").select("follower_id").eq("followed_id", user.id);
  if (error) throw error; return (data || []).map(r => r.follower_id);
}
export async function setFollow(followedId, on) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Utente non autenticato");
  if (on) {
    const { error } = await supabase.from("follows")
      .upsert({ follower_id: user.id, followed_id: followedId }, { onConflict: "follower_id,followed_id", ignoreDuplicates: true });
    if (error) throw error;
  } else {
    const { error } = await supabase.from("follows").delete()
      .eq("follower_id", user.id).eq("followed_id", followedId);
    if (error) throw error;
  }
}

// ── Notifiche in-app ──────────────────────────────────────────────────────────
export async function getNotifications(limit = 30) {
  const { data, error } = await supabase.from("notifications").select("*")
    .order("created_at", { ascending: false }).limit(limit);
  if (error) throw error; return data || [];
}
export async function markDirectNotifsRead(fromId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("notifications").update({ read: true })
    .eq("user_id", user.id).eq("type", "direct").eq("from_user_id", fromId);
}
export async function subscribeNotifications(myId, onEvent) {
  await authRealtime();
  const ch = supabase.channel("notif-" + myId)
    .on("postgres_changes",
      { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${myId}` },
      payload => onEvent(payload.eventType, payload.new, payload.old))
    .subscribe();
  return () => supabase.removeChannel(ch);
}

// ── Profili e chat dirette ────────────────────────────────────────────────────
export async function getProfiles() {
  const { data, error } = await supabase.from("profiles").select("id,name,city,avatar_url").order("name");
  if (error) throw error; return data || [];
}
export async function getDirectMessages(otherId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Utente non autenticato");
  const { data, error } = await supabase.from("messages").select("*")
    .eq("scope", "direct")
    .or(`and(from_user_id.eq.${user.id},to_user_id.eq.${otherId}),and(from_user_id.eq.${otherId},to_user_id.eq.${user.id})`)
    .order("created_at", { ascending: true });
  if (error) throw error; return data || [];
}
export async function sendDirectMessage(toId, text) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Utente non autenticato");
  const { data, error } = await supabase.from("messages")
    .insert({ scope: "direct", from_user_id: user.id, to_user_id: toId, text })
    .select().single();
  if (error) throw error; return data;
}
export async function subscribeDirect(myId, onMessage) {
  await authRealtime();
  const ch = supabase.channel("direct-" + myId)
    .on("postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `to_user_id=eq.${myId}` },
      payload => { if (payload.new?.scope === "direct") onMessage(payload.new); })
    .subscribe();
  return () => supabase.removeChannel(ch);
}

// true quando le chiavi qui sopra sono state compilate (attiva il login reale nell'app)
export const isConfigured = !SUPABASE_URL.includes("IL-TUO-PROGETTO") && !SUPABASE_ANON_KEY.includes("INCOLLA") && !SUPABASE_ANON_KEY.startsWith("LA-TUA");

// I canali realtime devono "presentarsi" con il token dell'utente,
// altrimenti le regole RLS (es. chat dirette private) non consegnano gli eventi.
async function authRealtime() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) supabase.realtime.setAuth(session.access_token);
  } catch (_) {}
}
try {
  supabase.auth.onAuthStateChange((_e, session) => {
    try { supabase.realtime.setAuth(session?.access_token ?? SUPABASE_ANON_KEY); } catch (_) {}
  });
} catch (_) {}

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
export async function createPost({ file, caption, condition, lat, lng, camDeg, camDir, city, aiClass, aiScore }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Utente non autenticato");
  const image_url = await uploadPhoto(file);
  const { data, error } = await supabase.from("posts").insert({
    user_id: user.id, image_url, caption, condition, lat, lng, is_live: true,
    cam_deg: camDeg ?? null, cam_dir: camDir ?? null, city: city ?? null, ai_class: aiClass ?? null, ai_score: aiScore ?? null,
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
    .select("id, text, from_user_id, created_at")
    .eq("scope", "post").eq("post_id", postId)
    .order("created_at", { ascending: true }).limit(limit);
  if (error) throw error;
  const rows = data || [];
  // nomi dei mittenti risolti a parte (la join diretta è ambigua: mittente/destinatario)
  const ids = [...new Set(rows.map(r => r.from_user_id))];
  if (ids.length) {
    const { data: profs } = await supabase.from("profiles").select("id,name,avatar_url").in("id", ids);
    const pm = Object.fromEntries((profs || []).map(p => [p.id, p]));
    rows.forEach(r => { r.profiles = pm[r.from_user_id] || null; });
  }
  return rows;
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
export async function subscribePostChat(postId, onNew) {
  await authRealtime();
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
