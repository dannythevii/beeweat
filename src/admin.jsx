// ============================================================================
// BEEWEAT — Area riservata: cruscotto web degli amministratori (14.66)
// Pagina a sé (admin.html) che usa la stessa sessione e lo stesso modulo Supabase dell'app.
// ============================================================================
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import * as sb from "./beeweat-supabase.js";

const NIGHT = "#0B1430", NIGHT2 = "#141F45", NIGHT3 = "#1C2852", HONEY = "#F5B82E", HONEY2 = "#FFD166", INK = "#2A1A00", ELEC = "#2457D6";
const TXT = "#FFFFFF", TXT2 = "#9DA7C4", LINE = "#26304F", RED = "#F0565B", GREEN = "#3BA776";
const CONDITIONS = ["☀️ Sereno", "⛅ Poco nuvoloso", "☁️ Molto nuvoloso", "🌧️ Pioggia", "⛈️ Temporale", "❄️ Neve", "🌫️ Nebbia", "🌬️ Ventoso", "🌈 Arcobaleno"];
const CSS = `
  *{box-sizing:border-box} html,body{margin:0;background:${NIGHT};color:${TXT};font-family:Inter,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;font-size:14px}
  a{color:${HONEY2}} button{font-family:inherit} input,select,textarea{font-family:inherit;font-size:14px;color:${TXT};background:${NIGHT3};border:1px solid ${LINE};border-radius:10px;padding:8px 10px;outline:none}
  input:focus,select:focus,textarea:focus{border-color:${HONEY}}
  .btn{display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 12px;border-radius:10px;border:1px solid ${LINE};background:${NIGHT3};color:${TXT};font-weight:600;font-size:13px;cursor:pointer;white-space:nowrap}
  .btn:hover{border-color:${HONEY}66} .btn:disabled{opacity:.5;cursor:default}
  .btn.p{background:${HONEY};color:${INK};border-color:${HONEY}} .btn.d{color:#FFB4B6;border-color:${RED}66} .btn.d:hover{background:${RED}22}
  .btn.s{height:28px;padding:0 9px;font-size:12px}
  table{width:100%;border-collapse:collapse} th{text-align:left;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:${TXT2};font-weight:600;padding:10px 10px;border-bottom:1px solid ${LINE};position:sticky;top:0;background:${NIGHT2};z-index:1}
  td{padding:10px;border-bottom:1px solid ${LINE};vertical-align:middle} tr:hover td{background:rgba(255,255,255,.025)}
  .card{background:${NIGHT2};border:1px solid ${LINE};border-radius:16px} .muted{color:${TXT2}} .tag{display:inline-flex;align-items:center;height:22px;padding:0 8px;border-radius:999px;font-size:11.5px;font-weight:700;background:${NIGHT3};color:${TXT2}}
  .tag.h{background:${HONEY}22;color:${HONEY2}} .tag.r{background:${RED}22;color:#FFB4B6} .tag.g{background:${GREEN}22;color:#9BE7BF} .tag.b{background:${ELEC}33;color:#BFD3FF}
  .nav{display:flex;align-items:center;gap:10px;width:100%;padding:10px 14px;border:none;background:none;color:${TXT2};font-weight:600;font-size:14px;border-radius:12px;cursor:pointer;text-align:left}
  .nav.on{background:${NIGHT3};color:${TXT}} .nav:hover{color:${TXT}} .nav .n{margin-left:auto;background:${HONEY};color:${INK};border-radius:999px;font-size:11px;padding:1px 7px}
  .ava{width:34px;height:34px;border-radius:50%;background:${NIGHT3};display:inline-flex;align-items:center;justify-content:center;font-size:16px;overflow:hidden;flex-shrink:0} .ava img{width:100%;height:100%;object-fit:cover}
  .thumb{width:56px;height:70px;border-radius:8px;object-fit:cover;background:${NIGHT3};display:block}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px}
  .kpi{padding:16px 18px} .kpi b{display:block;font-size:30px;font-weight:300;letter-spacing:-1px;line-height:1} .kpi span{font-size:12px;color:${TXT2}}
  .modal{position:fixed;inset:0;background:rgba(5,10,30,.7);display:flex;align-items:center;justify-content:center;z-index:50;padding:20px}
  .modal .box{width:100%;max-width:520px;max-height:90vh;overflow:auto;background:${NIGHT2};border:1px solid ${LINE};border-radius:18px;padding:20px}
  .toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:${HONEY};color:${INK};font-weight:700;padding:10px 16px;border-radius:999px;z-index:60;box-shadow:0 10px 30px rgba(0,0,0,.4)}
  .msg{max-width:72%;padding:8px 12px;border-radius:14px;font-size:13.5px;line-height:1.4;white-space:pre-wrap} .msg.me{background:${HONEY};color:${INK};margin-left:auto;border-bottom-right-radius:4px} .msg.them{background:${NIGHT3};border-bottom-left-radius:4px}
  @media (max-width:820px){ .side{display:none} .top-nav{display:flex!important} }
`;
const fmt = d => { try { return new Date(d).toLocaleString("it-IT", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }); } catch (_) { return String(d || ""); } };
const ago = d => { const m = Math.round((Date.now() - new Date(d).getTime()) / 60000); if (!isFinite(m)) return ""; if (m < 1) return "adesso"; if (m < 60) return m + " min"; const h = Math.round(m / 60); if (h < 48) return h + " h"; return Math.round(h / 24) + " g"; };
const Ava = ({ p, size }) => <span className="ava" style={size ? { width: size, height: size } : null}>{p?.avatar_url && /^https?:/.test(p.avatar_url) ? <img src={p.avatar_url} alt="" /> : (p?.avatar_url && p.avatar_url.length <= 4 ? p.avatar_url : "🐝")}</span>;
const Icon = ({ n }) => ({ home: "▦", bees: "🐝", reels: "🎞", help: "💬", flags: "⚑", events: "📅", mega: "📣", admins: "👑", out: "⏏" }[n] || "•");

// ── piccoli strumenti ─────────────────────────────────────────────────────────
function useToast() { const [t, setT] = useState(null); const show = m => { setT(m); setTimeout(() => setT(null), 2600); }; return [t, show]; }
function Confirm({ title, text, danger, label, onOk, onClose, children }) {
  return <div className="modal" onClick={onClose}><div className="box" onClick={e => e.stopPropagation()}>
    <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>{title}</div>
    {text && <div className="muted" style={{ lineHeight: 1.5, marginBottom: 14 }}>{text}</div>}
    {children}
    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
      <button className="btn" onClick={onClose}>Annulla</button>
      <button className={"btn " + (danger ? "d" : "p")} onClick={onOk}>{label || "Conferma"}</button>
    </div>
  </div></div>;
}
const Err = ({ e }) => e ? <div style={{ background: RED + "22", border: `1px solid ${RED}66`, color: "#FFB4B6", borderRadius: 12, padding: "10px 12px", margin: "10px 0", fontSize: 13 }}>{String(e?.message || e)}</div> : null;

// ── accesso ───────────────────────────────────────────────────────────────────
function Login({ onIn }) {
  const [email, setEmail] = useState(""), [pw, setPw] = useState(""), [err, setErr] = useState(null), [busy, setBusy] = useState(false);
  const go = async e => { e.preventDefault(); setBusy(true); setErr(null); try { await sb.loginEmail({ email, password: pw }); onIn(); } catch (x) { setErr(x); } finally { setBusy(false); } };
  return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
    <form onSubmit={go} className="card" style={{ width: "100%", maxWidth: 380, padding: 26 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}><Hex /><div><div style={{ fontWeight: 700, fontSize: 18 }}>Beeweat · Area riservata</div><div className="muted" style={{ fontSize: 12 }}>Solo amministratori dell'alveare</div></div></div>
      <label style={{ display: "block", fontSize: 12, color: TXT2, marginBottom: 6 }}>Email</label>
      <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={{ width: "100%", marginBottom: 12 }} autoComplete="username" />
      <label style={{ display: "block", fontSize: 12, color: TXT2, marginBottom: 6 }}>Password</label>
      <input type="password" required value={pw} onChange={e => setPw(e.target.value)} style={{ width: "100%" }} autoComplete="current-password" />
      <Err e={err} />
      <button className="btn p" disabled={busy} style={{ width: "100%", justifyContent: "center", marginTop: 16, height: 42 }}>{busy ? "Entro…" : "Entra"}</button>
    </form>
  </div>;
}
const Hex = () => <svg width="40" height="40" viewBox="0 0 64 64"><polygon points="32,6 55,19 55,45 32,58 9,45 9,19" fill={HONEY} /><polygon points="32,12 50,22 50,42 32,52 14,42 14,22" fill="none" stroke={INK} strokeWidth="1.5" opacity=".5" /></svg>;

// ── Panoramica ────────────────────────────────────────────────────────────────
function Overview({ me, go }) {
  const [o, setO] = useState(null), [err, setErr] = useState(null), [rep, setRep] = useState([]), [inv, setInv] = useState([]);
  useEffect(() => { sb.adminOverview().then(setO).catch(setErr); sb.adminReports("open", 8).then(setRep).catch(() => {}); sb.adminInvites().then(x => setInv(x.filter(i => i.status === "pending"))).catch(() => {}); }, []);
  const K = ({ v, l, onClick }) => <div className="card kpi" onClick={onClick} style={onClick ? { cursor: "pointer" } : null}><b>{v ?? "—"}</b><span>{l}</span></div>;
  return <>
    <H title="Panoramica" sub={`Ciao ${me?.name || ""}, ecco l'alveare oggi.`} />
    <Err e={err} />
    <div className="grid">
      <K v={o?.api} l="api registrate" onClick={() => go("bees")} /><K v={o?.api_7g} l="nuove negli ultimi 7 giorni" />
      <K v={o?.cieli} l="cieli pubblicati" onClick={() => go("reels")} /><K v={o?.cieli_24h} l="cieli nelle ultime 24 ore" />
      <K v={o?.segnalazioni_aperte} l="segnalazioni aperte" onClick={() => go("flags")} /><K v={o?.sospese} l="api sospese" />
      <K v={o?.eventi_30g} l="eventi negli ultimi 30 giorni" onClick={() => go("events")} /><K v={o?.admin} l="amministratori" onClick={() => go("admins")} />
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 18 }}>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 10 }}>Ultime segnalazioni</div>
        {rep.length === 0 ? <div className="muted">Nessuna segnalazione aperta.</div> : rep.map(r => <div key={r.id} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0", borderTop: `1px solid ${LINE}` }}>
          {r.post?.thumb_url || r.post?.image_url ? <img className="thumb" style={{ width: 36, height: 45 }} src={r.post.thumb_url || r.post.image_url} alt="" /> : <span className="thumb" style={{ width: 36, height: 45 }} />}
          <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13 }}><b>{r.reason || "Segnalazione"}</b> · cielo di {r.author?.name || "—"}</div><div className="muted" style={{ fontSize: 12 }}>da {r.reporter?.name || "—"} · {ago(r.created_at)} fa</div></div>
          <button className="btn s" onClick={() => go("flags")}>Apri</button>
        </div>)}
      </div>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 10 }}>Inviti ad amministratore in attesa</div>
        {inv.length === 0 ? <div className="muted">Nessun invito in attesa.</div> : inv.map(i => <div key={i.id} className="muted" style={{ padding: "6px 0", borderTop: `1px solid ${LINE}`, fontSize: 13 }}>invito del {fmt(i.created_at)} · in attesa della risposta dell'ape</div>)}
        <div className="muted" style={{ fontSize: 12, marginTop: 10, lineHeight: 1.5 }}>Un'ape diventa amministratore solo con il consenso di entrambi: tu la proponi da «Api», lei accetta nell'app.</div>
      </div>
    </div>
  </>;
}
const H = ({ title, sub, right }) => <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginBottom: 16, flexWrap: "wrap" }}><div><div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-.02em" }}>{title}</div>{sub && <div className="muted" style={{ marginTop: 2 }}>{sub}</div>}</div>{right}</div>;

// ── Api ───────────────────────────────────────────────────────────────────────
function Bees({ me, toast, openChat }) {
  const [rows, setRows] = useState(null), [err, setErr] = useState(null), [q, setQ] = useState(""), [filter, setFilter] = useState("all");
  const [edit, setEdit] = useState(null), [ban, setBan] = useState(null), [del, setDel] = useState(null), [promo, setPromo] = useState(null);
  const [invites, setInvites] = useState([]);
  const load = () => { sb.adminProfiles().then(setRows).catch(setErr); sb.adminInvites().then(setInvites).catch(() => {}); };
  useEffect(() => { load(); }, []);
  const pending = useMemo(() => new Set(invites.filter(i => i.status === "pending").map(i => i.to_user)), [invites]);
  const list = useMemo(() => (rows || []).filter(p => {
    const s = (p.name + " " + (p.city || "") + " " + (p.email || "")).toLowerCase(); if (q && !s.includes(q.toLowerCase())) return false;
    if (filter === "banned") return p.banned_until && new Date(p.banned_until) > new Date();
    if (filter === "admin") return p.is_admin; if (filter === "new") return p.created_at && Date.now() - new Date(p.created_at) < 7 * 86400000; return true;
  }), [rows, q, filter]);
  const act = async (fn, msg) => { try { await fn(); toast(msg); load(); } catch (e) { alert("Errore: " + (e?.message || e)); } };
  return <>
    <H title="Api" sub={rows ? `${rows.length} api nell'alveare` : "Carico…"} right={<div style={{ display: "flex", gap: 8 }}>
      <input placeholder="Cerca nome, città, email…" value={q} onChange={e => setQ(e.target.value)} style={{ width: 240 }} />
      <select value={filter} onChange={e => setFilter(e.target.value)}><option value="all">Tutte</option><option value="new">Nuove (7 giorni)</option><option value="banned">Sospese</option><option value="admin">Amministratori</option></select>
    </div>} />
    <Err e={err} />
    <div className="card" style={{ overflow: "auto", maxHeight: "calc(100vh - 170px)" }}><table>
      <thead><tr><th>Ape</th><th>Email</th><th>Città</th><th>Cieli</th><th>Ultimo cielo</th><th>Iscritta</th><th>Stato</th><th></th></tr></thead>
      <tbody>{list.map(p => { const banned = p.banned_until && new Date(p.banned_until) > new Date(); return <tr key={p.id}>
        <td><div style={{ display: "flex", alignItems: "center", gap: 10 }}><Ava p={p} /><div><div style={{ fontWeight: 600 }}>{p.name}{p.id === me.id && <span className="muted"> (tu)</span>}</div></div></div></td>
        <td className="muted" style={{ fontSize: 12.5 }}>{p.email || "—"}</td><td>{p.city || "—"}</td><td>{p.posts_count}</td>
        <td className="muted">{p.last_post_at ? ago(p.last_post_at) + " fa" : "—"}</td><td className="muted">{p.created_at ? fmt(p.created_at).slice(0, 8) : "—"}</td>
        <td>{p.is_admin && <span className="tag h">admin</span>} {banned && <span className="tag r" title={p.ban_reason || ""}>sospesa fino al {fmt(p.banned_until)}</span>} {pending.has(p.id) && <span className="tag b">invito inviato</span>}</td>
        <td style={{ whiteSpace: "nowrap" }}>
          <button className="btn s" onClick={() => openChat(p)}>Scrivi</button>{" "}
          <button className="btn s" onClick={() => setEdit({ ...p })}>Correggi</button>{" "}
          {banned ? <button className="btn s" onClick={() => act(() => sb.banUser(p.id, null, null), "Sospensione tolta")}>Riattiva</button> : <button className="btn s" onClick={() => setBan({ p, days: 7, reason: "" })}>Sospendi</button>}{" "}
          {!p.is_admin && !pending.has(p.id) && <button className="btn s" onClick={() => setPromo(p)}>Rendi admin</button>}
          {p.is_admin && p.id !== me.id && <button className="btn s" onClick={() => { if (confirm(`Togliere il ruolo di amministratore a ${p.name}?`)) act(() => sb.adminSetAdmin(p.id, false), "Ruolo tolto"); }}>Togli admin</button>}{" "}
          {p.id !== me.id && <button className="btn s d" onClick={() => setDel(p)}>Elimina</button>}
        </td>
      </tr>; })}</tbody>
    </table>{rows && list.length === 0 && <div className="muted" style={{ padding: 20 }}>Nessuna ape corrisponde.</div>}</div>
    {edit && <Confirm title="Correggi l'ape" label="Salva" onClose={() => setEdit(null)} onOk={() => act(async () => { await sb.adminUpdateProfile(edit.id, { name: edit.name.trim(), city: edit.city || "" }); setEdit(null); }, "Profilo corretto")}>
      <label className="muted" style={{ fontSize: 12 }}>Nome</label><input value={edit.name || ""} onChange={e => setEdit({ ...edit, name: e.target.value })} style={{ width: "100%", margin: "4px 0 10px" }} />
      <label className="muted" style={{ fontSize: 12 }}>Città</label><input value={edit.city || ""} onChange={e => setEdit({ ...edit, city: e.target.value })} style={{ width: "100%", marginTop: 4 }} />
    </Confirm>}
    {ban && <Confirm title={`Sospendi ${ban.p.name}`} text="L'ape non potrà pubblicare né scrivere fino alla data indicata. Vede il motivo nell'app." label="Sospendi" danger onClose={() => setBan(null)}
      onOk={() => act(async () => { await sb.banUser(ban.p.id, new Date(Date.now() + ban.days * 86400000).toISOString(), ban.reason || null); setBan(null); }, "Ape sospesa")}>
      <label className="muted" style={{ fontSize: 12 }}>Durata</label><select value={ban.days} onChange={e => setBan({ ...ban, days: +e.target.value })} style={{ width: "100%", margin: "4px 0 10px" }}>{[1, 3, 7, 30, 90, 365].map(d => <option key={d} value={d}>{d} {d === 1 ? "giorno" : "giorni"}</option>)}</select>
      <label className="muted" style={{ fontSize: 12 }}>Motivo (facoltativo)</label><input value={ban.reason} onChange={e => setBan({ ...ban, reason: e.target.value })} style={{ width: "100%", marginTop: 4 }} placeholder="Es. foto non meteo ripetute" />
    </Confirm>}
    {del && <Confirm title={`Elimina ${del.name}`} text="Elimina l'account, i cieli, i messaggi e tutto il resto. Non si torna indietro." label="Elimina definitivamente" danger onClose={() => setDel(null)} onOk={() => act(async () => { await sb.adminDeleteUser(del.id); setDel(null); }, "Ape eliminata")} />}
    {promo && <Confirm title={`Proporre ${promo.name} come amministratore?`} text="L'ape riceverà la proposta nell'app e diventerà amministratore solo se accetta. Puoi ritirare l'invito finché non risponde." label="Invia la proposta" onClose={() => setPromo(null)} onOk={() => act(async () => { await sb.adminInvite(promo.id); setPromo(null); }, "Proposta inviata")} />}
    {invites.some(i => i.status === "pending") && <div className="card" style={{ padding: 14, marginTop: 14 }}><div style={{ fontWeight: 700, marginBottom: 6 }}>Inviti in attesa</div>{invites.filter(i => i.status === "pending").map(i => { const p = (rows || []).find(x => x.id === i.to_user); return <div key={i.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderTop: `1px solid ${LINE}` }}><span>{p?.name || i.to_user}</span><span className="muted" style={{ fontSize: 12 }}>· {fmt(i.created_at)}</span><button className="btn s" style={{ marginLeft: "auto" }} onClick={() => act(() => sb.adminRevokeInvite(i.id), "Invito ritirato")}>Ritira</button></div>; })}</div>}
  </>;
}

// ── Cieli (reel) ──────────────────────────────────────────────────────────────
function Reels({ toast }) {
  const [rows, setRows] = useState(null), [err, setErr] = useState(null), [q, setQ] = useState(""), [edit, setEdit] = useState(null), [del, setDel] = useState(null), [award, setAward] = useState(null), [big, setBig] = useState(null);
  const load = () => sb.adminPosts(300).then(setRows).catch(setErr);
  useEffect(() => { load(); }, []);
  const list = useMemo(() => (rows || []).filter(p => !q || ((p.profiles?.name || "") + " " + (p.city || "") + " " + (p.caption || "") + " " + (p.condition || "")).toLowerCase().includes(q.toLowerCase())), [rows, q]);
  const act = async (fn, msg) => { try { await fn(); toast(msg); load(); } catch (e) { alert("Errore: " + (e?.message || e)); } };
  return <>
    <H title="Cieli" sub={rows ? `Ultimi ${rows.length} cieli pubblicati (anche archiviati)` : "Carico…"} right={<input placeholder="Cerca ape, città, testo…" value={q} onChange={e => setQ(e.target.value)} style={{ width: 260 }} />} />
    <Err e={err} />
    <div className="card" style={{ overflow: "auto", maxHeight: "calc(100vh - 170px)" }}><table>
      <thead><tr><th></th><th>Ape</th><th>Cielo</th><th>Dove</th><th>Quando</th><th>⭐</th><th>👁</th><th>💬</th><th>AI</th><th></th></tr></thead>
      <tbody>{list.map(p => <tr key={p.id}>
        <td><img className="thumb" src={p.thumb_url || p.image_url} alt="" onClick={() => setBig(p)} style={{ cursor: "zoom-in" }} /></td>
        <td><div style={{ display: "flex", alignItems: "center", gap: 8 }}><Ava p={p.profiles} size={28} /><span style={{ fontWeight: 600 }}>{p.profiles?.name || "—"}</span></div></td>
        <td><div>{p.condition}{p.temp != null && <span className="muted"> · {Math.round(p.temp)}°</span>}</div>{p.caption && <div className="muted" style={{ fontSize: 12.5, maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.caption}</div>}</td>
        <td>{p.city || "—"}{p.precision === "city" && <span className="muted"> ≈</span>}</td>
        <td className="muted" style={{ whiteSpace: "nowrap" }}>{fmt(p.created_at)}{p.archived_at && <div><span className="tag">archiviato</span></div>}</td>
        <td>{p.stars_count || 0}</td><td>{p.views_count || 0}</td><td>{p.comments_count || 0}</td>
        <td className="muted" style={{ fontSize: 12 }}>{p.ai_class ? `${p.ai_class}${p.ai_score != null ? " · " + Math.round(p.ai_score * 100) + "%" : ""}` : "—"}</td>
        <td style={{ whiteSpace: "nowrap" }}>
          <button className="btn s" onClick={() => setEdit({ id: p.id, caption: p.caption || "", condition: p.condition || CONDITIONS[0], img: p.image_url })}>Correggi</button>{" "}
          <button className="btn s" onClick={() => setAward({ id: p.id, message: "" })}>Premia</button>{" "}
          <button className="btn s d" onClick={() => setDel(p)}>Elimina</button>
        </td>
      </tr>)}</tbody>
    </table></div>
    {big && <div className="modal" onClick={() => setBig(null)}><img src={big.image_url} alt="" style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: 16 }} /></div>}
    {edit && <Confirm title="Correggi il cielo" label="Salva" onClose={() => setEdit(null)} onOk={() => act(async () => { await sb.updatePost(edit.id, { caption: edit.caption, condition: edit.condition }); setEdit(null); }, "Cielo corretto")}>
      <label className="muted" style={{ fontSize: 12 }}>Condizione</label><select value={edit.condition} onChange={e => setEdit({ ...edit, condition: e.target.value })} style={{ width: "100%", margin: "4px 0 10px" }}>{CONDITIONS.map(c => <option key={c}>{c}</option>)}</select>
      <label className="muted" style={{ fontSize: 12 }}>Descrizione</label><textarea rows={3} value={edit.caption} onChange={e => setEdit({ ...edit, caption: e.target.value })} style={{ width: "100%", marginTop: 4 }} />
    </Confirm>}
    {award && <Confirm title="Foto premiata" text="Il cielo sale in cima al feed con la coccarda e il tuo messaggio." label="Premia" onClose={() => setAward(null)} onOk={() => act(async () => { await sb.createAward(award.id, award.message || null); setAward(null); }, "Cielo premiato")}>
      <input value={award.message} onChange={e => setAward({ ...award, message: e.target.value })} placeholder="Messaggio (facoltativo), es. «Che luce!»" style={{ width: "100%" }} />
    </Confirm>}
    {del && <Confirm title="Elimina il cielo" text={`Il cielo di ${del.profiles?.name || "—"} sparisce da feed, radar e profilo, con la foto.`} label="Elimina" danger onClose={() => setDel(null)} onOk={() => act(async () => { await sb.deletePost({ id: del.id, image_url: del.image_url }); setDel(null); }, "Cielo eliminato")} />}
  </>;
}

// ── Assistenza (chat con le api) ──────────────────────────────────────────────
function Support({ me, toast, initial, onConsumed }) {
  const [msgs, setMsgs] = useState(null), [err, setErr] = useState(null), [sel, setSel] = useState(null), [text, setText] = useState(""), [profiles, setProfiles] = useState([]);
  const endRef = useRef(null);
  const load = () => sb.adminSupportMessages().then(setMsgs).catch(setErr);
  useEffect(() => { load(); sb.getProfiles().then(setProfiles).catch(() => {}); const iv = setInterval(load, 20000); return () => clearInterval(iv); }, []);
  useEffect(() => { if (initial) { setSel({ id: initial.id, name: initial.name, avatar_url: initial.avatar_url }); onConsumed && onConsumed(); } }, [initial]);
  // un filo per ogni ape (non amministratore): tutti i suoi messaggi con qualunque admin
  const threads = useMemo(() => {
    const m = new Map();
    (msgs || []).forEach(x => { const other = x.from?.is_admin ? x.to : x.from; const oid = x.from?.is_admin ? x.to_user_id : x.from_user_id; if (!oid) return; if (other?.is_admin && x.from?.is_admin) return;
      const t = m.get(oid) || { id: oid, p: other, msgs: [], last: null, unread: 0 }; t.msgs.push(x); if (!t.last || x.created_at > t.last.created_at) t.last = x; if (!x.from?.is_admin && !x.read_at && !x.read) t.unread++; m.set(oid, t); });
    return [...m.values()].sort((a, b) => (b.last?.created_at || "").localeCompare(a.last?.created_at || ""));
  }, [msgs]);
  const cur = sel ? threads.find(t => t.id === sel.id) : null;
  const curMsgs = (cur?.msgs || []).slice().sort((a, b) => a.created_at.localeCompare(b.created_at));
  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [curMsgs.length, sel?.id]);
  const send = async () => { if (!sel || !text.trim()) return; try { await sb.sendDirectMessage(sel.id, text.trim()); setText(""); toast("Risposta inviata"); load(); } catch (e) { alert("Errore: " + (e?.message || e)); } };
  return <>
    <H title="Assistenza" sub="Le chat delle api con gli amministratori. Rispondi da qui: l'ape riceve il messaggio nell'app, a tuo nome." right={<select value={sel?.id || ""} onChange={e => { const p = profiles.find(x => x.id === e.target.value); if (p) setSel(p); }}><option value="">Nuova chat con un'ape…</option>{profiles.map(p => <option key={p.id} value={p.id}>{p.name} · {p.city || ""}</option>)}</select>} />
    <Err e={err} />
    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 14, height: "calc(100vh - 170px)" }}>
      <div className="card" style={{ overflow: "auto" }}>
        {threads.length === 0 && <div className="muted" style={{ padding: 16 }}>{msgs ? "Nessuna richiesta finora." : "Carico…"}</div>}
        {threads.map(t => <button key={t.id} className="nav" style={{ borderRadius: 0, padding: "12px 14px", borderBottom: `1px solid ${LINE}`, background: sel?.id === t.id ? NIGHT3 : "none", color: TXT }} onClick={() => setSel({ id: t.id, name: t.p?.name, avatar_url: t.p?.avatar_url })}>
          <Ava p={t.p} /><div style={{ flex: 1, minWidth: 0 }}><div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontWeight: 600 }}>{t.p?.name || "—"}</span><span className="muted" style={{ fontSize: 11 }}>{ago(t.last.created_at)}</span></div><div className="muted" style={{ fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.last.from?.is_admin ? "Tu: " : ""}{t.last.text}</div></div>{t.unread > 0 && <span className="n">{t.unread}</span>}
        </button>)}
      </div>
      <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
        {!sel ? <div className="muted" style={{ margin: "auto" }}>Scegli una chat a sinistra, o un'ape dal menu in alto.</div> : <>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: `1px solid ${LINE}` }}><Ava p={sel} /><b>{sel.name}</b></div>
          <div style={{ flex: 1, overflow: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            {curMsgs.length === 0 && <div className="muted">Nessun messaggio ancora.</div>}
            {curMsgs.map(x => <div key={x.id} className={"msg " + (x.from?.is_admin ? "me" : "them")}>{x.text}<div style={{ fontSize: 10.5, opacity: .7, marginTop: 3 }}>{x.from?.is_admin ? (x.from_user_id === me.id ? "tu" : x.from?.name) + " · " : ""}{fmt(x.created_at)}</div></div>)}
            <div ref={endRef} />
          </div>
          <div style={{ display: "flex", gap: 8, padding: 12, borderTop: `1px solid ${LINE}` }}><textarea rows={2} value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send(); }} placeholder="Scrivi la risposta… (Ctrl+Invio per inviare)" style={{ flex: 1, resize: "none" }} /><button className="btn p" onClick={send} disabled={!text.trim()}>Invia</button></div>
        </>}
      </div>
    </div>
  </>;
}

// ── Segnalazioni ──────────────────────────────────────────────────────────────
function Flags({ toast }) {
  const [rows, setRows] = useState(null), [err, setErr] = useState(null), [status, setStatus] = useState("open"), [big, setBig] = useState(null);
  const load = () => sb.adminReports(status, 300).then(setRows).catch(setErr);
  useEffect(() => { load(); }, [status]);
  const act = async (fn, msg) => { try { await fn(); toast(msg); load(); } catch (e) { alert("Errore: " + (e?.message || e)); } };
  return <>
    <H title="Segnalazioni" sub="Quello che le api segnalano con il tasto «Segnala». Decidi tu: tutto a posto, elimina il cielo, sospendi l'ape." right={<select value={status} onChange={e => setStatus(e.target.value)}><option value="open">Aperte</option><option value="resolved">Gestite</option><option value="dismissed">Archiviate</option><option value="all">Tutte</option></select>} />
    <Err e={err} />
    <div className="card" style={{ overflow: "auto", maxHeight: "calc(100vh - 170px)" }}><table>
      <thead><tr><th></th><th>Motivo</th><th>Cielo di</th><th>Segnalato da</th><th>Quando</th><th>Stato</th><th></th></tr></thead>
      <tbody>{(rows || []).map(r => <tr key={r.id}>
        <td>{r.post ? <img className="thumb" src={r.post.thumb_url || r.post.image_url} alt="" onClick={() => setBig(r.post)} style={{ cursor: "zoom-in" }} /> : <span className="tag">cielo rimosso</span>}</td>
        <td><b>{r.reason || "—"}</b>{r.note && <div className="muted" style={{ fontSize: 12.5 }}>{r.note}</div>}{r.post?.caption && <div className="muted" style={{ fontSize: 12, maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>«{r.post.caption}»</div>}</td>
        <td>{r.author?.name || "—"}{r.author?.banned_until && new Date(r.author.banned_until) > new Date() && <div><span className="tag r">sospesa</span></div>}</td>
        <td>{r.reporter?.name || "—"}</td><td className="muted" style={{ whiteSpace: "nowrap" }}>{fmt(r.created_at)}</td>
        <td>{r.status === "open" ? <span className="tag h">aperta</span> : r.status === "resolved" ? <span className="tag g">gestita{r.outcome ? " · " + r.outcome : ""}</span> : <span className="tag">archiviata</span>}</td>
        <td style={{ whiteSpace: "nowrap" }}>{r.status === "open" && <>
          <button className="btn s" onClick={() => act(() => sb.adminResolveReport(r.id, "dismissed", "tutto a posto"), "Segnalazione archiviata")}>Tutto a posto</button>{" "}
          {r.post && <button className="btn s d" onClick={() => { if (confirm("Eliminare il cielo segnalato?")) act(async () => { await sb.deletePost({ id: r.post.id, image_url: r.post.image_url }); await sb.adminResolveReport(r.id, "resolved", "cielo eliminato"); }, "Cielo eliminato"); }}>Elimina cielo</button>}{" "}
          {r.author && <button className="btn s d" onClick={() => { const d = prompt("Sospendere " + r.author.name + " per quanti giorni?", "7"); const n = +d; if (n > 0) act(async () => { await sb.banUser(r.author.id, new Date(Date.now() + n * 86400000).toISOString(), r.reason || "segnalazione"); await sb.adminResolveReport(r.id, "resolved", `ape sospesa ${n} g`); }, "Ape sospesa"); }}>Sospendi ape</button>}
        </>}</td>
      </tr>)}</tbody>
    </table>{rows && rows.length === 0 && <div className="muted" style={{ padding: 20 }}>Niente qui.</div>}</div>
    {big && <div className="modal" onClick={() => setBig(null)}><img src={big.image_url} alt="" style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: 16 }} /></div>}
  </>;
}

// ── Eventi ────────────────────────────────────────────────────────────────────
function Events({ toast }) {
  const [rows, setRows] = useState(null), [err, setErr] = useState(null), [edit, setEdit] = useState(null);
  const load = () => sb.getEvents(300).then(setRows).catch(setErr);
  useEffect(() => { load(); }, []);
  const act = async (fn, msg) => { try { await fn(); toast(msg); load(); } catch (e) { alert("Errore: " + (e?.message || e)); } };
  return <>
    <H title="Eventi" sub="Segnalazioni meteo e eventi social pubblicati dalle api." />
    <Err e={err} />
    <div className="card" style={{ overflow: "auto", maxHeight: "calc(100vh - 170px)" }}><table>
      <thead><tr><th>Tipo</th><th>Titolo</th><th>Luogo</th><th>Ape</th><th>Quando</th><th>Fine</th><th></th></tr></thead>
      <tbody>{(rows || []).map(e => <tr key={e.id}>
        <td><span className={"tag " + (e.kind === "social" ? "h" : "b")}>{e.type || ""} {e.kind === "social" ? "social" : "meteo"}</span></td>
        <td><b>{e.title}</b>{e.cat && <div className="muted" style={{ fontSize: 12 }}>{e.cat}</div>}</td><td>{e.place || "—"}</td><td>{e.profiles?.name || "—"}</td>
        <td className="muted" style={{ whiteSpace: "nowrap" }}>{fmt(e.starts_at || e.created_at)}</td><td className="muted">{e.ends ? String(e.ends).slice(0, 16) : "—"}</td>
        <td style={{ whiteSpace: "nowrap" }}><button className="btn s" onClick={() => setEdit({ ...e })}>Correggi</button>{" "}<button className="btn s d" onClick={() => { if (confirm("Eliminare l'evento «" + e.title + "»?")) act(() => sb.deleteEvent(e.id), "Evento eliminato"); }}>Elimina</button></td>
      </tr>)}</tbody>
    </table>{rows && rows.length === 0 && <div className="muted" style={{ padding: 20 }}>Nessun evento.</div>}</div>
    {edit && <Confirm title="Correggi l'evento" label="Salva" onClose={() => setEdit(null)} onOk={() => act(async () => { await sb.updateEvent(edit.id, { title: edit.title, place: edit.place, description: edit.description, ends: edit.ends }); setEdit(null); }, "Evento corretto")}>
      {[["title", "Titolo"], ["place", "Luogo"], ["ends", "Fine (data/ora)"], ["description", "Descrizione"]].map(([k, l]) => <div key={k} style={{ marginBottom: 10 }}><label className="muted" style={{ fontSize: 12 }}>{l}</label>{k === "description" ? <textarea rows={3} value={edit[k] || ""} onChange={ev => setEdit({ ...edit, [k]: ev.target.value })} style={{ width: "100%", marginTop: 4 }} /> : <input value={edit[k] || ""} onChange={ev => setEdit({ ...edit, [k]: ev.target.value })} style={{ width: "100%", marginTop: 4 }} />}</div>)}
    </Confirm>}
  </>;
}

// ── Megafono ──────────────────────────────────────────────────────────────────
function Megaphone({ toast }) {
  const [text, setText] = useState(""), [busy, setBusy] = useState(false);
  const send = async () => { if (!text.trim()) return; if (!confirm("Inviare l'avviso a TUTTE le api?")) return; setBusy(true); try { const n = await sb.adminBroadcast(text.trim()); toast(`Avviso inviato a ${n} api`); setText(""); } catch (e) { alert("Errore: " + (e?.message || e)); } finally { setBusy(false); } };
  return <>
    <H title="Megafono" sub="Un avviso a tutte le api, nella campanella dell'app." />
    <div className="card" style={{ padding: 18, maxWidth: 640 }}>
      <textarea rows={5} value={text} onChange={e => setText(e.target.value)} placeholder="Es. Stasera manutenzione dalle 23 alle 24: lo zaino conserva i cieli, partono dopo." style={{ width: "100%" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}><span className="muted" style={{ fontSize: 12 }}>{text.length} caratteri</span><button className="btn p" disabled={busy || !text.trim()} onClick={send}>Invia a tutte le api</button></div>
    </div>
  </>;
}

// ── Amministratori ────────────────────────────────────────────────────────────
function Admins({ me, toast }) {
  const [rows, setRows] = useState([]), [inv, setInv] = useState([]);
  const load = () => { sb.getAdmins().then(setRows).catch(() => {}); sb.adminInvites().then(setInv).catch(() => {}); };
  useEffect(() => { load(); }, []);
  return <>
    <H title="Amministratori" sub="Chi tiene in piedi l'alveare. Per aggiungerne uno: «Api» → «Rendi admin» → l'ape accetta nell'app." />
    <div className="card" style={{ maxWidth: 720 }}>{rows.map(p => <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: `1px solid ${LINE}` }}><Ava p={p} /><div style={{ flex: 1 }}><b>{p.name}</b>{p.id === me.id && <span className="muted"> (tu)</span>}<div className="muted" style={{ fontSize: 12 }}>{p.city || ""}</div></div>{p.id !== me.id && <button className="btn s" onClick={async () => { if (!confirm(`Togliere il ruolo a ${p.name}?`)) return; try { await sb.adminSetAdmin(p.id, false); toast("Ruolo tolto"); load(); } catch (e) { alert("Errore: " + (e?.message || e)); } }}>Togli ruolo</button>}</div>)}</div>
    <div className="card" style={{ maxWidth: 720, marginTop: 14, padding: 16 }}><div style={{ fontWeight: 700, marginBottom: 8 }}>Storico inviti</div>{inv.length === 0 ? <div className="muted">Nessun invito.</div> : inv.map(i => <div key={i.id} className="muted" style={{ fontSize: 13, padding: "6px 0", borderTop: `1px solid ${LINE}` }}>{fmt(i.created_at)} · <span className={"tag " + (i.status === "accepted" ? "g" : i.status === "pending" ? "h" : "")}>{{ pending: "in attesa", accepted: "accettato", declined: "rifiutato", revoked: "ritirato" }[i.status] || i.status}</span>{i.answered_at && ` · risposta ${fmt(i.answered_at)}`}</div>)}</div>
  </>;
}

// ── radice ────────────────────────────────────────────────────────────────────
const NAV = [["home", "Panoramica"], ["bees", "Api"], ["reels", "Cieli"], ["help", "Assistenza"], ["flags", "Segnalazioni"], ["events", "Eventi"], ["mega", "Megafono"], ["admins", "Amministratori"]];
function Admin() {
  const [state, setState] = useState("loading");   // loading | login | denied | ok
  const [me, setMe] = useState(null);
  const [view, setView] = useState(() => (location.hash || "#home").slice(1));
  const [toast, showToast] = useToast();
  const [openFlags, setOpenFlags] = useState(0);
  const [chatWith, setChatWith] = useState(null);
  const check = async () => {
    try {
      const { data: { session } } = await sb.supabase.auth.getSession();
      if (!session) { setState("login"); return; }
      const p = await sb.getCurrentProfile();
      if (!p?.is_admin) { setMe(p); setState("denied"); return; }
      setMe(p); setState("ok");
      sb.adminReports("open", 1).then(r => setOpenFlags(r.length)).catch(() => {});
      sb.adminOverview().then(o => setOpenFlags(o?.segnalazioni_aperte || 0)).catch(() => {});
    } catch (e) { setState("login"); }
  };
  useEffect(() => { check(); }, []);
  useEffect(() => { if ((location.hash || "#home").slice(1) !== view) location.hash = view; }, [view]);
  useEffect(() => { const h = () => setView((location.hash || "#home").slice(1)); window.addEventListener("hashchange", h); return () => window.removeEventListener("hashchange", h); }, []);
  const go = v => setView(v);
  const openChat = p => { setChatWith(p); setView("help"); };
  if (state === "loading") return <><style>{CSS}</style><div className="muted" style={{ padding: 40 }}>Un attimo…</div></>;
  if (state === "login") return <><style>{CSS}</style><Login onIn={check} /></>;
  if (state === "denied") return <><style>{CSS}</style><div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}><div className="card" style={{ padding: 26, maxWidth: 420, textAlign: "center" }}><Hex /><div style={{ fontWeight: 700, fontSize: 18, marginTop: 10 }}>Area riservata</div><div className="muted" style={{ marginTop: 6, lineHeight: 1.5 }}>Ciao {me?.name}: questo cruscotto è solo per gli amministratori dell'alveare.</div><button className="btn" style={{ marginTop: 16 }} onClick={async () => { await sb.logout(); setState("login"); }}>Esci</button></div></div></>;
  const page = { home: <Overview me={me} go={go} />, bees: <Bees me={me} toast={showToast} openChat={openChat} />, reels: <Reels toast={showToast} />, help: <Support me={me} toast={showToast} initial={chatWith} onConsumed={() => setChatWith(null)} />, flags: <Flags toast={showToast} />, events: <Events toast={showToast} />, mega: <Megaphone toast={showToast} />, admins: <Admins me={me} toast={showToast} /> }[view] || <Overview me={me} go={go} />;
  return <>
    <style>{CSS}</style>
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside className="side" style={{ width: 230, flexShrink: 0, borderRight: `1px solid ${LINE}`, padding: 16, display: "flex", flexDirection: "column", gap: 4, position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 8px 16px" }}><Hex /><div><div style={{ fontWeight: 700 }}>Beeweat</div><div className="muted" style={{ fontSize: 11.5 }}>Area riservata</div></div></div>
        {NAV.map(([k, l]) => <button key={k} className={"nav" + (view === k ? " on" : "")} onClick={() => go(k)}><Icon n={k} /> {l}{k === "flags" && openFlags > 0 && <span className="n">{openFlags}</span>}</button>)}
        <div style={{ marginTop: "auto", padding: 8, display: "flex", alignItems: "center", gap: 10 }}><Ava p={me} /><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis" }}>{me?.name}</div><div className="muted" style={{ fontSize: 11 }}>amministratore</div></div><button className="btn s" title="Esci" onClick={async () => { await sb.logout(); setState("login"); }}><Icon n="out" /></button></div>
        <a href="/" className="muted" style={{ fontSize: 12, padding: "0 8px 4px", textDecoration: "none" }}>← Torna all'app</a>
      </aside>
      <main style={{ flex: 1, minWidth: 0, padding: "22px 26px" }}>
        <div className="top-nav" style={{ display: "none", gap: 6, overflowX: "auto", marginBottom: 14 }}>{NAV.map(([k, l]) => <button key={k} className={"btn s" + (view === k ? " p" : "")} onClick={() => go(k)}>{l}</button>)}</div>
        {page}
      </main>
    </div>
    {toast && <div className="toast">{toast}</div>}
  </>;
}
createRoot(document.getElementById("root")).render(<Admin />);
