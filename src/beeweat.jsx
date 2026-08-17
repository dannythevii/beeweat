import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { VAPID_PUBLIC_KEY } from "./beeweat-config.js";

// ─── PALETTE (dai mockup) ─────────────────────────────────────────────────────
const APP_VERSION = "7.5";
const urlB64ToU8 = b64 => {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
};
const HBLUE   = "#235C9C";   // header (blu principale, scurito)
const PANEL_A = "#5A93C8";   // pannello meteo top
const PANEL_B = "#4585C1";   // pannello meteo bottom
const NAV     = "#235C9C";   // barra inferiore = stesso colore dell'header (HBLUE)
const NAVACT  = "#FFC61E";   // voce menu attiva (giallo dorato)
const GREYP   = "#FFFFFF";   // fondo frame meteo + radar (bianco)
const ACCENT  = "#FFC61E";   // giallo dorato (radar + attivo), uguale al menu
const BODY    = "#EAF1F8";   // sfondo azzurrino chiaro
const CARD    = "#FFFFFF";
const TXT      = "#1E3A5F";   // testo scuro
const TXT2     = "#7592AE";   // testo secondario
const LINE      = "#E1E9F2";
const WHITE     = "#FFFFFF";
const RED       = "#EF4444";
const STAR      = "#F2B01E";

// ─── ICONE METEO (linea bianca) ───────────────────────────────────────────────
const WIcon = ({ name, size = 30, color = WHITE, sw = 2 }) => {
  const p = { stroke: color, strokeWidth: sw, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" };
  const sun = (
    <>
      <circle cx="12" cy="12" r="4.2" {...p} />
      {[...Array(8)].map((_, i) => {
        const a = (Math.PI / 4) * i, r1 = 7, r2 = 9.6;
        return <line key={i} x1={12 + r1 * Math.cos(a)} y1={12 + r1 * Math.sin(a)} x2={12 + r2 * Math.cos(a)} y2={12 + r2 * Math.sin(a)} {...p} />;
      })}
    </>
  );
  const paths = {
    sun,
    thermo: <><path d="M14 14.8V4a2 2 0 10-4 0v10.8a4.5 4.5 0 104 0z" {...p} /><line x1="12" y1="9" x2="12" y2="15" {...p} /></>,
    drop: <><path d="M9 3.5C6.5 7 5 9.5 5 12a4 4 0 008 0c0-2.5-1.5-5-4-8.5z" {...p} transform="translate(-1,1) scale(0.85)" /><path d="M16 9c-1.4 2-2.2 3.4-2.2 4.8a2.3 2.3 0 004.6 0c0-1.4-.8-2.8-2.4-4.8z" {...p} /></>,
    compass: <><circle cx="12" cy="12" r="9.2" {...p} /><polygon points="12,5.5 14.8,13 12,11.4 9.2,13" fill={color} stroke="none" /></>,
    chat: <><path d="M21 11.5a8 8 0 01-11.6 7.1L4 20l1.4-5.4A8 8 0 1121 11.5z" {...p} /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", flexShrink: 0 }}>{paths[name]}</svg>;
};

// ─── ICONE NAV / UI ───────────────────────────────────────────────────────────
const NavIcon = ({ name, size = 24, color = WHITE, sw = 1.9 }) => {
  const p = { stroke: color, strokeWidth: sw, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" };
  const hexPts = (cx, cy, r) => [...Array(6)].map((_, i) => { const a = Math.PI / 180 * (60 * i - 90); return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`; }).join(" ");
  const paths = {
    vicini: <><path d="M12 21s7-6.3 7-11a7 7 0 10-14 0c0 4.7 7 11 7 11z" {...p} /><circle cx="12" cy="10" r="2.4" {...p} /></>,
    preferiti: <><polygon points={hexPts(12, 12, 9)} {...p} />{[...Array(6)].map((_, i) => { const a = Math.PI / 180 * (60 * i - 90); return <line key={i} x1={12 + 5 * Math.cos(a)} y1={12 + 5 * Math.sin(a)} x2={12 + 9 * Math.cos(a)} y2={12 + 9 * Math.sin(a)} {...p} />; })}<polygon points={hexPts(12, 12, 4)} fill={color} stroke="none" /></>,
    feed: <><rect x="3" y="4" width="18" height="5" rx="1.5" {...p} /><rect x="3" y="12" width="18" height="8" rx="1.5" {...p} /></>,
    eventi: <><rect x="5" y="3" width="14" height="18" rx="2" {...p} /><line x1="8.5" y1="8" x2="15.5" y2="8" {...p} /><line x1="8.5" y1="12" x2="15.5" y2="12" {...p} /><line x1="8.5" y1="16" x2="13" y2="16" {...p} /></>,
    contatti: <><circle cx="9" cy="8" r="3.2" {...p} /><path d="M3.5 20c0-3 2.5-5 5.5-5s5.5 2 5.5 5" {...p} /><circle cx="17" cy="7.5" r="2.5" {...p} /><path d="M16 14.6c2.6.2 4.5 2.1 4.5 4.9" {...p} /></>,
    camera: <><rect x="2" y="7" width="20" height="14" rx="3" {...p} /><circle cx="12" cy="14" r="3.4" {...p} /><path d="M8 7V5a1 1 0 011-1h6a1 1 0 011 1v2" {...p} /></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19" {...p} /><line x1="5" y1="12" x2="19" y2="12" {...p} /></>,
    back: <><path d="M15 18l-6-6 6-6" {...p} /></>,
    check: <><polyline points="20 6 9 17 4 12" {...p} /></>,
    star: <polygon points="12,2.5 15,9 22,9.7 16.8,14.5 18.3,21.5 12,17.8 5.7,21.5 7.2,14.5 2,9.7 9,9" stroke={color} strokeWidth={sw} fill="none" />,
    starFill: <polygon points="12,2.5 15,9 22,9.7 16.8,14.5 18.3,21.5 12,17.8 5.7,21.5 7.2,14.5 2,9.7 9,9" fill={STAR} stroke="none" />,
    send: <><line x1="22" y1="2" x2="11" y2="13" {...p} /><polygon points="22,2 15,22 11,13 2,9" {...p} /></>,
    flip: <><path d="M1 4v6h6M23 20v-6h-6" {...p} /><path d="M20.5 9A9 9 0 005.6 5.6L1 10M23 14l-4.6 4.4A9 9 0 013.5 15" {...p} /></>,
    grid: <><rect x="4" y="4" width="16" height="16" rx="2" {...p} /><line x1="9.3" y1="4" x2="9.3" y2="20" {...p} /><line x1="14.7" y1="4" x2="14.7" y2="20" {...p} /><line x1="4" y1="9.3" x2="20" y2="9.3" {...p} /><line x1="4" y1="14.7" x2="20" y2="14.7" {...p} /></>,
    edit: <><path d="M17 3a2.4 2.4 0 013.4 3.4L8 18.8 3 20l1.2-5L17 3z" {...p} /></>,
    trash: <><polyline points="3 6 5 6 21 6" {...p} /><path d="M19 6v13a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" {...p} /><line x1="10" y1="11" x2="10" y2="16.5" {...p} /><line x1="14" y1="11" x2="14" y2="16.5" {...p} /></>,
    capture: <><circle cx="12" cy="12" r="8" {...p} /><circle cx="12" cy="12" r="3" fill={color} stroke="none" /></>,
    pin: <><path d="M12 21s7-6.3 7-11a7 7 0 10-14 0c0 4.7 7 11 7 11z" {...p} /><circle cx="12" cy="10" r="2.4" {...p} /></>,
    eye: <><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" {...p} /><circle cx="12" cy="12" r="3.2" {...p} /></>,
    locate: <><circle cx="12" cy="12" r="3" {...p} /><circle cx="12" cy="12" r="8" {...p} /><line x1="12" y1="1" x2="12" y2="4" {...p} /><line x1="12" y1="20" x2="12" y2="23" {...p} /><line x1="1" y1="12" x2="4" y2="12" {...p} /><line x1="20" y1="12" x2="23" y2="12" {...p} /></>,
    logout: <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" {...p} /></>,
    comment: <><path d="M21 11.5a8 8 0 01-11.6 7.1L4 20l1.4-5.4A8 8 0 1121 11.5z" {...p} /></>,
    heart: <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" {...p} />,
    heartFill: <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#EF4D6A" stroke="none" />,
    search: <><circle cx="11" cy="11" r="7" {...p} /><line x1="16.5" y1="16.5" x2="21" y2="21" {...p} /></>,
    close: <><line x1="6" y1="6" x2="18" y2="18" {...p} /><line x1="18" y1="6" x2="6" y2="18" {...p} /></>,
    groups: <><circle cx="8" cy="8" r="3.3" {...p} /><path d="M2.5 20c0-3.3 2.6-5.6 5.5-5.6 1.5 0 2.9.6 3.9 1.6" {...p} /><line x1="18" y1="5" x2="18" y2="11" {...p} /><line x1="15" y1="8" x2="21" y2="8" {...p} /></>,
    bell: <><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" {...p} /><path d="M13.7 21a2 2 0 01-3.4 0" {...p} /></>,
    chevron: <><path d="M9 6l6 6-6 6" {...p} /></>,
    flag: <><line x1="5" y1="21" x2="5" y2="4" {...p} /><path d="M5 4.5h12l-2.3 3.5L17 11.5H5z" {...p} /></>,
    beecast: <><path d="M12 3.2l6.2 3.6v7.2L12 17.6l-6.2-3.6V6.8z" {...p} /><line x1="12" y1="17.6" x2="12" y2="21" {...p} /><line x1="5.8" y1="6.8" x2="3" y2="5.2" {...p} /><line x1="18.2" y1="6.8" x2="21" y2="5.2" {...p} /></>,
    clock: <><circle cx="12" cy="12" r="9" {...p} /><polyline points="12,7 12,12 16,14" {...p} /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", flexShrink: 0 }}>{paths[name]}</svg>;
};

// ─── LOGO ───────────────────────────────────────────────────────────────────
function BeeweatLogo({ size = 150 }) {
  const cx = 100, cy = 100;
  const sat = [[100, 38], [154, 69], [154, 131], [100, 162], [46, 131], [46, 69]];
  const hex = (cx, cy, r) => { let d = ""; for (let i = 0; i < 6; i++) { const a = Math.PI / 180 * (60 * i - 90); d += (i ? "L" : "M") + (cx + r * Math.cos(a)).toFixed(1) + "," + (cy + r * Math.sin(a)).toFixed(1); } return d + "Z"; };
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ display: "block", filter: `drop-shadow(0 10px 24px ${HBLUE}55)` }}>
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#3B7DD8" /><stop offset="100%" stopColor="#1B4E96" /></linearGradient>
        <linearGradient id="honey" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FFE08A" /><stop offset="100%" stopColor="#F2A63C" /></linearGradient>
        <radialGradient id="sun" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#FFE9A8" stopOpacity="0.9" /><stop offset="100%" stopColor="#FFE9A8" stopOpacity="0" /></radialGradient>
      </defs>
      <rect x="4" y="4" width="192" height="192" rx="44" fill="url(#bg)" />
      <circle cx={cx} cy={cy} r="70" fill="url(#sun)" />
      {sat.map((s, i) => <line key={i} x1={cx} y1={cy} x2={s[0]} y2={s[1]} stroke="#7FC6F0" strokeWidth="3.5" strokeLinecap="round" />)}
      {sat.map((s, i) => <path key={"h" + i} d={hex(s[0], s[1], 13)} fill="url(#honey)" />)}
      <path d={hex(cx, cy, 39)} fill="url(#honey)" />
      <path d={hex(cx, cy, 39)} fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="2" />
    </svg>
  );
}
const FacebookIcon = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff"><path d="M22 12a10 10 0 10-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0022 12z" /></svg>;
const GoogleIcon = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z" /><path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 010-4.2V7.06H2.18a11 11 0 000 9.88l3.66-2.84z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" /></svg>;
const MailIcon = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></svg>;
const AppleIcon = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff"><path d="M16.36 12.78c-.02-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.62-1.71-3.19-1.73-1.36-.14-2.65.8-3.34.8-.69 0-1.75-.78-2.88-.76-1.48.02-2.85.86-3.61 2.19-1.54 2.67-.39 6.62 1.1 8.79.73 1.06 1.6 2.25 2.74 2.21 1.1-.04 1.52-.71 2.85-.71 1.33 0 1.71.71 2.88.69 1.19-.02 1.94-1.08 2.67-2.15.84-1.23 1.19-2.42 1.21-2.48-.03-.01-2.32-.89-2.34-3.53zM14.13 6.13c.61-.74 1.02-1.77.91-2.79-.88.04-1.94.59-2.57 1.32-.56.65-1.06 1.7-.93 2.7.98.08 1.98-.5 2.59-1.23z" /></svg>;

// ─── AVATAR (emoji o immagine) ────────────────────────────────────────────────
function UserAvatar({ src, size = 44, ring = true }) {
  const isImg = typeof src === "string" && (src.startsWith("data:") || src.startsWith("http"));
  const common = { width: size, height: size, borderRadius: "50%", flexShrink: 0, border: ring ? `2px solid ${LINE}` : "none" };
  if (isImg) return <img src={src} alt="" style={{ ...common, objectFit: "cover", display: "block" }} />;
  return <div style={{ ...common, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.55, background: "linear-gradient(135deg,#DCEBF7,#fff)" }}>{src || <NavIcon name="contatti" size={size * 0.55} color={HBLUE} />}</div>;
}

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const CITY = "Sorrento";
const WEATHER = { condition: "☀️ Sereno", temp: "24°", hi: "26°", lo: "19°", humidity: "73%", wind: "NNW" };
// Codici meteo WMO (standard Open-Meteo) → emoji + etichetta italiana
const WMO = c => {
  if (c === 0) return { e: "☀️", l: "Sereno" };
  if (c <= 2) return { e: "⛅", l: "Poco nuvoloso" };
  if (c === 3) return { e: "☁️", l: "Coperto" };
  if (c === 45 || c === 48) return { e: "🌫️", l: "Nebbia" };
  if (c <= 57) return { e: "🌦️", l: "Pioviggine" };
  if (c <= 67) return { e: "🌧️", l: "Pioggia" };
  if (c <= 77) return { e: "🌨️", l: "Neve" };
  if (c <= 82) return { e: "🌦️", l: "Rovesci" };
  if (c <= 86) return { e: "🌨️", l: "Neve" };
  return { e: "⛈️", l: "Temporale" };
};
const moonPhase = () => {
  const synodic = 29.530588853;
  const days = (Date.now() - Date.UTC(2000, 0, 6, 18, 14)) / 86400000;
  const age = ((days % synodic) + synodic) % synodic;
  const idx = Math.round(age / (synodic / 8)) % 8;
  const phases = [["🌑", "Luna nuova"], ["🌒", "Crescente"], ["🌓", "Primo quarto"], ["🌔", "Gibbosa cresc."], ["🌕", "Luna piena"], ["🌖", "Gibbosa cal."], ["🌗", "Ultimo quarto"], ["🌘", "Calante"]];
  return { e: phases[idx][0], l: phases[idx][1] };
};
// Data+ora dei post: "oggi · 16:37", "ieri · 09:12", "31/07 · 18:45"
const fmtPostTime = ts => {
  const d = new Date(ts), now = new Date();
  const time = d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
  if (d.toDateString() === now.toDateString()) return "oggi · " + time;
  const yest = new Date(now); yest.setDate(now.getDate() - 1);
  if (d.toDateString() === yest.toDateString()) return "ieri · " + time;
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" }) + " · " + time;
};
// Rintocco Beeweat per il banner in-app (doppia nota, sintetizzata al volo)
let _bwAudio = null;
const playChime = () => {
  try {
    _bwAudio = _bwAudio || new (window.AudioContext || window.webkitAudioContext)();
    if (_bwAudio.state === "suspended") _bwAudio.resume();
    const t = _bwAudio.currentTime;
    [[880, 0], [1318.5, 0.13]].forEach(([f, off]) => {
      const o = _bwAudio.createOscillator(), g = _bwAudio.createGain();
      o.type = "sine"; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t + off);
      g.gain.exponentialRampToValueAtTime(0.16, t + off + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + off + 0.34);
      o.connect(g); g.connect(_bwAudio.destination);
      o.start(t + off); o.stop(t + off + 0.38);
    });
  } catch (_) {}
};
// Distanza (km) e direzione (gradi) tra due coordinate — matematica del grande cerchio
const haversine = (a, b) => {
  const R = Math.PI / 180;
  const dLat = (b.lat - a.lat) * R, dLng = (b.lng - a.lng) * R;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * R) * Math.cos(b.lat * R) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};
const bearingDeg = (a, b) => {
  const R = Math.PI / 180;
  const y = Math.sin((b.lng - a.lng) * R) * Math.cos(b.lat * R);
  const x = Math.cos(a.lat * R) * Math.sin(b.lat * R) - Math.sin(a.lat * R) * Math.cos(b.lat * R) * Math.cos((b.lng - a.lng) * R);
  return Math.round((Math.atan2(y, x) / R + 360) % 360);
};
// "capri" e "Capri" sono lo stesso posto: normalizzazione con iniziali maiuscole
const titleCase = s => (s || "").trim().replace(/\S+/g, w => w[0].toUpperCase() + w.slice(1).toLowerCase());
// Geocodifica inversa: coordinate → nome città (per battezzare i post col posto vero)
const reverseCity = async (lat, lng) => {
  try {
    const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=it`);
    const j = await r.json();
    const name = j.locality || j.city || j.principalSubdivision || null;
    if (name) return name;
  } catch (_) {}
  try {   // traduttore di riserva: se il primo tace, parla il secondo
    const r2 = await fetch(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}&lang=it`);
    const j2 = await r2.json();
    const p = j2?.features?.[0]?.properties;
    return p?.city || p?.town || p?.village || p?.name || null;
  } catch (_) { return null; }
};
// Geocodifica diretta: nome città → coordinate (Open-Meteo, gratuita senza chiavi)
const geocodeCity = async name => {
  try {
    const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=it&format=json`);
    const j = await r.json();
    const g = j?.results?.[0];
    return g ? { lat: g.latitude, lng: g.longitude } : null;
  } catch (_) { return null; }
};
const WDIR16 = d => ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSO","SO","OSO","O","ONO","NO","NNO"][Math.round(((d % 360) / 22.5)) % 16];
const CONDITIONS = ["☀️ Sereno", "⛅ Poco nuvoloso", "🌧️ Pioggia", "⛈️ Temporale", "❄️ Neve", "🌫️ Nebbia", "🌬️ Ventoso", "🌈 Arcobaleno"];

// ─── OCCHI AI DELL'ALVEARE: moderazione + classifica del cielo (nel telefono) ──
let _aiModelsP = null;
const loadAIModels = () => {
  if (_aiModelsP) return _aiModelsP;
  _aiModelsP = (async () => {
    const tf = await import("https://esm.sh/@tensorflow/tfjs@4.20.0");
    await tf.ready();
    const [cocoSsd, nsfwjs, mobilenetMod] = await Promise.all([
      import("https://esm.sh/@tensorflow-models/coco-ssd@2.2.3"),
      import("https://esm.sh/nsfwjs@4.2.0"),
      import("https://esm.sh/@tensorflow-models/mobilenet@2.1.1"),
    ]);
    const [detector, nsfw, scenes] = await Promise.all([
      cocoSsd.load({ base: "lite_mobilenet_v2" }),
      nsfwjs.load(),
      mobilenetMod.load({ version: 2, alpha: 0.5 }),
    ]);
    return { detector, nsfw, scenes };
  })();
  _aiModelsP.catch(() => { _aiModelsP = null; });
  return _aiModelsP;
};

const classifySky = canvas => {
  try {
    const w = 64, h = 64, c = document.createElement("canvas");
    c.width = w; c.height = h;
    const ctx = c.getContext("2d");
    // analizzo solo la FASCIA ALTA del fotogramma (45%): lì vive il cielo,
    // così mare, strade e terrazze non ingannano più il giudizio
    ctx.drawImage(canvas, 0, 0, canvas.width, Math.max(1, Math.round(canvas.height * 0.45)), 0, 0, w, h);
    const d = ctx.getImageData(0, 0, w, h).data;
    let blue = 0, grey = 0, dark = 0, warm = 0, bright = 0, n = 0;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i + 1], b = d[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b), sat = mx === 0 ? 0 : (mx - mn) / mx;
      n++;
      if (lum > 190) bright++;
      if (lum < 60) dark++;
      if (b > r + 18 && b > g + 6 && lum > 90) blue++;
      if (sat < 0.16 && lum >= 60 && lum <= 190) grey++;
      if (r > b + 25 && lum > 100) warm++;
    }
    let lumSum = 0;
    for (let i = 0; i < d.length; i += 4) lumSum += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    const meanLum = lumSum / n;
    const p = x => x / n;
    let cls, score;
    if (p(dark) > 0.5) { cls = "⛈️ Temporale"; score = p(dark); }
    else if (p(blue) > 0.45) { cls = "☀️ Sereno"; score = p(blue); }
    else if (p(warm) > 0.3) { cls = "☀️ Sereno"; score = p(warm); }
    else if (p(grey) > 0.55) {
      cls = p(bright) > 0.25 ? "🌫️ Nebbia" : "🌧️ Pioggia"; score = p(grey);
      if (cls === "🌫️ Nebbia") {
        // controprova sul terreno (metà bassa): la nebbia mangia ombre e colori, il controluce no
        const w2 = 64, h2 = 32, c2 = document.createElement("canvas");
        c2.width = w2; c2.height = h2;
        c2.getContext("2d").drawImage(canvas, 0, Math.round(canvas.height * 0.5), canvas.width, Math.round(canvas.height * 0.5), 0, 0, w2, h2);
        const d2 = c2.getContext("2d").getImageData(0, 0, w2, h2).data;
        let dk = 0, sat = 0, n2 = 0;
        for (let i = 0; i < d2.length; i += 4) {
          const r = d2[i], g = d2[i + 1], b = d2[i + 2];
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
          n2++; if (lum < 70) dk++; if (mx > 0 && (mx - mn) / mx > 0.35) sat++;
        }
        if (dk / n2 > 0.12 || sat / n2 > 0.18) { cls = "☀️ Sereno"; score = 0.55; }   // ombre dure o colori vivi = sole in controluce
      }
    }
    else if (p(blue) > 0.18) { cls = "⛅ Poco nuvoloso"; score = 0.5 + p(blue) / 2; }
    else { cls = "⛅ Poco nuvoloso"; score = 0.4; }
    return { cls, score: Math.min(0.95, Math.round(score * 100) / 100),
             stats: { blue: p(blue), grey: p(grey), dark: p(dark), warm: p(warm), bright: p(bright), meanLum } };
  } catch (_) { return null; }
};

// oggetti che tradiscono un interno o un soggetto ravvicinato: non è meteo
const INDOOR_OBJECTS = ["dining table", "bowl", "cup", "bottle", "wine glass", "fork", "knife", "spoon", "banana", "apple", "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza", "donut", "cake", "chair", "couch", "bed", "tv", "laptop", "mouse", "remote", "keyboard", "cell phone", "book", "refrigerator", "microwave", "oven", "toaster", "sink", "toilet", "vase", "scissors", "teddy bear", "clock"];
// scene da esterno riconosciute da MobileNet: cieli, mare, orizzonti, paesaggi
const OUTDOOR_RX = /alp|seashore|lakesid|cliff|promontor|volcano|valley|geyser|sandbar|breakwater|pier|dock|lighthous|castle|church|monaster|palace|fountain|suspension bridge|viaduct|street|park bench|balloon|parachut|airship|wing|kite|windmill|barn|boathous|patio|picket fence|worm fence|stone wall|dam|megalith|obelisk|flagpole|maypole|water tower|beacon|catamaran|canoe|gondola|speedboat|liner|container ship|schooner|trimaran|yawl|sail|mountain|snow|coral reef|dome|bell cote|mosque|stupa|triumphal/i;
// schermi e display: la loro foto non è mai cielo vero
const SCREEN_RX = /television|monitor|screen|home theater|desktop computer|laptop|notebook computer|cellular telephone|ipod|oscilloscope|projector/i;
const SCREEN_OBJECTS = ["tv", "laptop", "cell phone"];

// Frazione di pelle nell'inquadratura (firma cromatica degli incarnati)
const skinRatio = canvas => {
  try {
    const w = 64, h = 64, c = document.createElement("canvas");
    c.width = w; c.height = h;
    const ctx = c.getContext("2d");
    ctx.drawImage(canvas, 0, 0, w, h);
    const d = ctx.getImageData(0, 0, w, h).data;
    let skin = 0, n = 0;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i + 1], b = d[i + 2];
      n++;
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
      if (r > 95 && g > 40 && b > 20 && mx - mn > 15 && Math.abs(r - g) > 15 && r > g && r > b) skin++;
    }
    return skin / n;
  } catch (_) { return 0; }
};

// Statistiche cromatiche di una fascia alta dell'immagine (frazione dell'altezza)
const skyBand = (canvas, frac) => {
  try {
    const w = 64, h = 64, c = document.createElement("canvas");
    c.width = w; c.height = h;
    const ctx = c.getContext("2d");
    ctx.drawImage(canvas, 0, 0, canvas.width, Math.max(1, Math.round(canvas.height * frac)), 0, 0, w, h);
    const d = ctx.getImageData(0, 0, w, h).data;
    let blue = 0, grey = 0, dark = 0, warm = 0, bright = 0, lumSum = 0, n = 0;
    let roughSum = 0, rn = 0, prevLum = null;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i + 1], b = d[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b), sat = mx === 0 ? 0 : (mx - mn) / mx;
      n++; lumSum += lum;
      const col = (i / 4) % w;
      if (col > 0 && prevLum !== null) { roughSum += Math.abs(lum - prevLum); rn++; }
      prevLum = lum;
      if (lum > 190) bright++;
      if (lum < 60) dark++;
      if (b > r + 18 && b > g + 6 && lum > 90) blue++;
      if (sat < 0.16 && lum >= 60 && lum <= 190) grey++;
      if (r > b + 25 && lum > 100) warm++;
    }
    const p = x => x / n;
    return { blue: p(blue), grey: p(grey), dark: p(dark), warm: p(warm), bright: p(bright), meanLum: lumSum / n, rough: rn ? roughSum / rn : 0 };
  } catch (_) { return null; }
};
// Maschera del cielo: partendo dal bordo alto, mi espando dove il colore scorre liscio.
// Trova il cielo anche in uno spicchio tra i palazzi, e il meteo si legge SOLO lì.
const skyMask = canvas => {
  try {
    const w = 96, h = 72, c = document.createElement("canvas");
    c.width = w; c.height = h;
    const ctx = c.getContext("2d");
    ctx.drawImage(canvas, 0, 0, w, h);
    const d = ctx.getImageData(0, 0, w, h).data;
    const lum = new Float32Array(w * h), R = new Uint8Array(w * h), G = new Uint8Array(w * h), B = new Uint8Array(w * h);
    for (let i = 0, px = 0; i < d.length; i += 4, px++) {
      R[px] = d[i]; G[px] = d[i + 1]; B[px] = d[i + 2];
      lum[px] = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    }
    const mask = new Uint8Array(w * h);
    const queue = [];
    for (let x = 0; x < w; x++) { mask[x] = 1; queue.push(x); }   // semi: tutta la prima riga
    const TOL_L = 15, TOL_C = 20;
    const similar = (a, b) => Math.abs(lum[a] - lum[b]) < TOL_L &&
      Math.abs(R[a] - R[b]) < TOL_C && Math.abs(G[a] - G[b]) < TOL_C && Math.abs(B[a] - B[b]) < TOL_C;
    while (queue.length) {
      const p = queue.pop();
      const x = p % w, y = (p / w) | 0;
      const nb = [];
      if (x > 0) nb.push(p - 1);
      if (x < w - 1) nb.push(p + 1);
      if (y < h - 1) nb.push(p + w);
      if (y > 0) nb.push(p - w);
      for (const q of nb) if (!mask[q] && similar(p, q)) { mask[q] = 1; queue.push(q); }
    }
    // statistiche SOLO sui pixel del cielo trovato
    let n = 0, blue = 0, cloud = 0, warm = 0, dark = 0, bright = 0, lumSum = 0;
    for (let p = 0; p < w * h; p++) {
      if (!mask[p]) continue;
      n++;
      const r = R[p], g = G[p], b = B[p], L = lum[p];
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b), sat = mx === 0 ? 0 : (mx - mn) / mx;
      lumSum += L;
      if (L > 190) bright++;
      if (L < 60) dark++;
      if (b > r + 14 && b >= g && L > 85) blue++;
      if (sat < 0.18 && L > 150) cloud++;                          // nuvole: chiare e sbiancate
      if (r > b + 22 && L > 110) warm++;
    }
    if (!n) return null;
    const frac = n / (w * h), pp = x => x / n;
    return { frac, blue: pp(blue), cloud: pp(cloud), warm: pp(warm), dark: pp(dark), bright: pp(bright), meanLum: lumSum / n };
  } catch (_) { return null; }
};
// Il meteo letto dentro la maschera del cielo
const classifyFromMask = m => {
  if (!m) return null;
  if (m.dark > 0.6) return { cls: "⛈️ Temporale", score: Math.min(0.95, m.dark) };
  if (m.warm > 0.4) return { cls: "☀️ Sereno", score: 0.7 };                       // alba/tramonto
  if (m.blue > 0.6 && m.cloud < 0.25) return { cls: "☀️ Sereno", score: Math.min(0.95, m.blue) };
  if (m.blue > 0.2) return { cls: "⛅ Poco nuvoloso", score: 0.55 + m.cloud / 3 };
  if (m.cloud > 0.55) return { cls: m.meanLum > 200 ? "🌫️ Nebbia" : "🌧️ Pioggia", score: Math.min(0.9, m.cloud) };
  return { cls: "⛅ Poco nuvoloso", score: 0.45 };
};

// Le firme autentiche del cielo (azzurro, coperto luminoso, alba/tramonto, notte, pallido lattiginoso)
const hasSkySignature = st => !!st && (
  (st.blue > 0.30 && st.rough < 16) ||
  (st.grey > 0.45 && st.meanLum > 165 && st.rough < 11) ||
  (st.warm > 0.35 && st.meanLum > 150 && st.rough < 11) ||
  st.dark > 0.65 ||
  (st.bright > 0.35 && st.rough < 10)
);

const analyzePhoto = async fullCanvas => {
  const { detector, nsfw, scenes } = await loadAIModels();
  // miniatura di analisi: 384px bastano ai modelli, e i tempi crollano
  const MAXW = 384;
  let canvas = fullCanvas;
  if (fullCanvas.width > MAXW) {
    const k = MAXW / fullCanvas.width;
    canvas = document.createElement("canvas");
    canvas.width = MAXW; canvas.height = Math.max(1, Math.round(fullCanvas.height * k));
    canvas.getContext("2d").drawImage(fullCanvas, 0, 0, canvas.width, canvas.height);
  }
  const [dets, nsfwRes, preds] = await Promise.all([
    detector.detect(canvas), nsfw.classify(canvas), scenes.classify(canvas, 7),
  ]);
  const bad = nsfwRes.filter(x => ["Porn", "Hentai", "Sexy"].includes(x.className))
                     .reduce((sm, x) => sm + x.probability, 0);
  if (bad > 0.6) return { block: true, reason: "Contenuto non adatto rilevato. Beeweat è per il cielo. 🌤️", cls: "nsfw", score: Math.round(bad * 100) / 100 };
  // Persone: bloccano solo se RICONOSCIBILI (vicine); i passanti lontani nel paesaggio sono benvenuti
  const areaOf = x => (x.bbox ? (x.bbox[2] * x.bbox[3]) / (canvas.width * canvas.height) : 1);
  const person = dets.find(x => x.class === "person" && x.score > 0.55 && areaOf(x) > 0.07);
  if (person) return { block: true, reason: "Persona in primo piano rilevata: per la privacy, le persone vanno bene solo da lontano, come parte del paesaggio. 📷", cls: "person", score: Math.round(person.score * 100) / 100 };
  const skin = skinRatio(canvas);
  if (skin > 0.28) return { block: true, reason: `Sembra esserci pelle in primissimo piano (${Math.round(skin * 100)}% dell'inquadratura): per privacy e pertinenza, inquadra il cielo. 📷`, cls: "skin", score: Math.round(skin * 100) / 100 };
  // Schermi e display: sempre bocciati (il cielo in TV non è il tuo cielo)
  const screenObj = dets.find(x => SCREEN_OBJECTS.includes(x.class) && x.score > 0.45);
  const screenPred = preds.slice(0, 3).find(p => SCREEN_RX.test(p.className) && p.probability > 0.15);
  if (screenObj || screenPred) {
    const what = screenObj ? screenObj.class : screenPred.className.split(",")[0];
    return { block: true, reason: `Sembra la foto di uno schermo (rilevato: ${what}) 📺 — su Beeweat va il cielo vero, visto coi tuoi occhi.`, cls: "screen", score: Math.round((screenObj?.score || screenPred.probability) * 100) / 100 };
  }
  // È davvero una foto del cielo/paesaggio? Il cielo AUTENTICO assolve case, cupole e terrazze.
  const sky = classifySky(canvas);
  const mask = skyMask(canvas);
  const maskGood = mask && mask.frac >= 0.05;                       // cielo trovato: basta il 5% dell'inquadratura
  const skyEvidence = maskGood || hasSkySignature(skyBand(canvas, 0.45)) || hasSkySignature(skyBand(canvas, 0.22));
  const indoorObj = dets.find(x => INDOOR_OBJECTS.includes(x.class) && x.score > 0.5);
  const outdoorHit = preds.some(p => OUTDOOR_RX.test(p.className));
  const confidentNotOutdoor = !outdoorHit && preds[0] && preds[0].probability > 0.25;
  if (!skyEvidence && (indoorObj || confidentNotOutdoor)) {
    const what = indoorObj ? indoorObj.class : preds[0].className.split(",")[0];
    return { block: true, reason: `Questa non sembra una foto del cielo (rilevato: ${what}). Inquadra cielo, orizzonte o paesaggio. 🌤️`, cls: "not_sky", score: Math.round((indoorObj?.score || preds[0].probability) * 100) / 100 };
  }
  if (!skyEvidence)
    return { block: true, reason: "Non vedo cielo nell'inquadratura: alza un po' l'obiettivo e fai entrare più cielo nella foto. 🌤️", cls: "not_sky", score: sky?.score || null };
  const fine = maskGood ? classifyFromMask(mask) : null;            // il giudizio fine, se il cielo è stato trovato
  const cls = fine?.cls || sky?.cls || null;
  const score = fine?.score || sky?.score || null;
  return { block: false, reason: null, cls, score, suggest: cls };
};

const AVA_W = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop";
const AVA_M = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop";
// ── INTERRUTTORE PROVE: metti false in produzione per disattivare la foto demo ──
const TEST_MODE = true;
const CAPRI_PHOTO = "data:image/jpeg;base64,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";
// foto demo solo per le prove quando la fotocamera non è accessibile
const DEMO_PHOTOS = [
  CAPRI_PHOTO,
  "https://images.unsplash.com/photo-1601297183305-6df142704ea2?w=700&h=560&fit=crop",
  "https://images.unsplash.com/photo-1500740516770-92bd004b996e?w=700&h=560&fit=crop",
  "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=700&h=560&fit=crop",
  "https://images.unsplash.com/photo-1419833173245-f59e1b93f9ee?w=700&h=560&fit=crop",
];

const INITIAL_POSTS = [
  { id: 1, user: "Umberto Nats", ava: AVA_W, time: "15:35", city: "Capri", dist: 2, bearing: 40, cond: "☀️ Sereno", stars: 73, starred: false, comments: 350, views: 285, shares: 12, img: CAPRI_PHOTO, caption: "Tramonto spettacolare sul golfo di Capri 🌅 cielo rosa e mare calmo, una serata perfetta!" },
  { id: 2, user: "Sofia Greco", ava: AVA_M, time: "14:10", city: "Capri", dist: 6, bearing: 150, cond: "⛅ Poco nuvoloso", stars: 41, starred: false, comments: 96, views: 130, shares: 3, img: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=700&h=560&fit=crop", caption: "Cielo che cambia velocemente sul golfo, nuvole in arrivo da sud-ovest 🌤️" },
  { id: 3, user: "Luca Marino", ava: AVA_M, time: "12:48", city: "Massa Lubrense", dist: 9, bearing: 250, cond: "🌧️ Pioggia", stars: 18, starred: true, comments: 24, views: 62, shares: 1, img: "https://images.unsplash.com/photo-1428592953211-077101b2021b?w=700&h=560&fit=crop", caption: "Pioggia leggera ma costante qui sulla costa ☔" },
];

const PEOPLE = [
  { id: 11, name: "Umberto Nats", ava: AVA_W, city: "Capri" },
  { id: 12, name: "Sofia Greco", ava: AVA_M, city: "Napoli" },
  { id: 13, name: "Luca Marino", ava: AVA_M, city: "Salerno" },
  { id: 14, name: "Elena Vitale", ava: AVA_W, city: "Amalfi" },
];

const INITIAL_EVENTS = [
  { id: 21, type: "⛈️", title: "Forte temporale in arrivo", place: "Napoli", dist: 14, time: "30 min fa", user: "Luca Marino", sev: "Alta", lat: 40.8518, lng: 14.2681 },
  { id: 22, type: "🌊", title: "Mareggiata sulla costa", place: "Amalfi", dist: 22, time: "1 h fa", user: "Elena Vitale", sev: "Media", lat: 40.6340, lng: 14.6027 },
  { id: 23, type: "🌬️", title: "Raffiche di vento intense", place: "Sorrento", dist: 3, time: "2 h fa", user: "Umberto Nats", sev: "Bassa", lat: 40.6263, lng: 14.3757 },
  { id: 24, type: "🎉", title: "Festa sul lungomare", place: "Capri", dist: 5, time: "20 min fa", user: "Elena Vitale", sev: "Bassa", lat: 40.6310, lng: 14.4920, cat: "🎉 Party" },
];
const BASE_COORDS = { lat: 40.6263, lng: 14.3757 };

const EVENT_TYPES = ["— Nessun evento —", "⛈️ Temporale", "🌊 Mareggiata", "🌬️ Vento forte", "🌨️ Neve", "🔥 Caldo estremo", "🌫️ Nebbia fitta", "⚠️ Attenzione", "🚨 Incidente", "🚑 Soccorso"];
const EVENT_CATEGORIES = ["— Nessuna categoria —", "🎉 Party", "🪩 Disco dance", "🎀 Inaugurazione", "🎶 Concerto", "🍸 Aperitivo", "🎭 Spettacolo", "🎪 Festa / Sagra", "🏟️ Evento sportivo", "🍽️ Cena / Food"];
// luoghi vicini mostrati in Contatti (chat pubbliche + eventi per luogo)
const NEARBY_PLACES = [
  { id: 1, name: "Sorrento", dist: 0.2, chats: 194, events: 0 },
  { id: 2, name: "Priora", dist: 1.4, chats: 330, events: 5 },
  { id: 3, name: "Massa Lubrense", dist: 1.9, chats: 800, events: 100 },
  { id: 4, name: "Pontone", dist: 2, chats: 50, events: 55 },
  { id: 5, name: "Montecorbo", dist: 2.3, chats: 250, events: 32 },
  { id: 6, name: "Cepano", dist: 2.6, chats: 100, events: 10 },
  { id: 7, name: "Arorella", dist: 2.8, chats: 330, events: 25 },
];

// ─── STYLES ─────────────────────────────────────────────────────────────────
const G = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }
  body { background: ${BODY}; color: ${TXT}; font-family: 'Sora', sans-serif; overflow: hidden; height: 100vh; height: 100dvh; -webkit-font-smoothing: antialiased; }
  .safe-top { padding-top: env(safe-area-inset-top, 0px); }
  .safe-bottom { padding-bottom: env(safe-area-inset-bottom, 0px); }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: ${TXT2}66; border-radius: 4px; }
  #root, body { max-width: 100vw; overflow-x: hidden; }
  html, body { touch-action: pan-x pan-y; }
  @media (orientation: landscape) and (max-height: 520px) { .bw-rotate-guard { display: flex !important; } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(14px);} to { opacity:1; transform:translateY(0);} }
  @keyframes pop { 0%{transform:scale(1)} 45%{transform:scale(1.55) rotate(-8deg)} 100%{transform:scale(1)} }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  @keyframes ping { 0%{transform:scale(.6);opacity:.8} 80%,100%{transform:scale(2.4);opacity:0} }
  @keyframes drop { 0%{transform:translateY(-40px);opacity:0} 60%{transform:translateY(4px);opacity:1} 100%{transform:translateY(0)} }
  .fade-up { animation: fadeUp .35s ease both; }
  .star-pop { animation: pop .35s cubic-bezier(.36,.07,.19,.97) both; }
  input, textarea, select { font-family: 'Sora', sans-serif; }
  input::placeholder, textarea::placeholder { color: ${TXT2}; }
  input[type=range] { -webkit-appearance:none; appearance:none; height:5px; border-radius:5px; outline:none; cursor:pointer; }
  input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:22px; height:22px; border-radius:50%; background:${ACCENT}; border:3px solid #fff; box-shadow:0 2px 6px rgba(0,0,0,.25); cursor:pointer; }
  input[type=range]::-moz-range-thumb { width:18px; height:18px; border-radius:50%; background:${ACCENT}; border:3px solid #fff; cursor:pointer; }
`;

// ─── INFORMATIVA PRIVACY ──────────────────────────────────────────────────────
const PRIVACY = [
  { h: "1. Titolare del trattamento", p: "Il Titolare del trattamento dei dati è Beeweat (di seguito \"l'App\"). Per qualsiasi richiesta relativa ai tuoi dati personali puoi scrivere all'indirizzo privacy@beeweat.app. La presente informativa è resa ai sensi degli artt. 13 e 14 del Regolamento (UE) 2016/679 (GDPR)." },
  { h: "2. Dati personali raccolti", p: "Raccogliamo: (a) dati di registrazione (nome, città, email, password cifrata); (b) immagine del profilo (emoji o foto da te caricata); (c) dati di geolocalizzazione, se autorizzi l'accesso, per mostrarti il meteo e i contenuti vicino a te; (d) fotografie scattate in tempo reale tramite la fotocamera e da te pubblicate; (e) contenuti generati (post, didascalie, messaggi in chat, segnalazioni di eventi, like/stelle); (f) dati tecnici e di utilizzo (modello dispositivo, sistema operativo, log di accesso)." },
  { h: "3. Finalità del trattamento", p: "I dati sono trattati per: erogare il servizio e gestire il tuo account; mostrare meteo, post ed eventi nel raggio selezionato; consentire chat e interazioni tra utenti; garantire sicurezza, prevenzione abusi e moderazione; adempiere a obblighi di legge. Le foto sono acquisite esclusivamente in tempo reale dalla fotocamera e non dall'archivio del dispositivo." },
  { h: "4. Base giuridica", p: "Il trattamento si fonda su: l'esecuzione del contratto (fornitura del servizio, art. 6.1.b GDPR); il tuo consenso per geolocalizzazione e fotocamera (art. 6.1.a), revocabile in qualsiasi momento dalle impostazioni del dispositivo; il legittimo interesse alla sicurezza della piattaforma (art. 6.1.f); eventuali obblighi legali (art. 6.1.c)." },
  { h: "5. Geolocalizzazione e fotocamera", p: "L'accesso alla posizione e alla fotocamera è facoltativo e richiede un tuo consenso esplicito tramite il sistema operativo. Puoi negarlo o revocarlo in ogni momento; alcune funzioni (radar, pubblicazione di post, segnalazione eventi con posizione) potrebbero risultare limitate. La posizione precisa è usata solo quando attivi le relative funzioni." },
  { h: "6. Conservazione dei dati", p: "I dati dell'account sono conservati finché mantieni attivo il profilo. I post e le relative foto seguono un ciclo di vita a tempo: visibilità pubblica fino a 24 ore, archivio personale fino a 30 giorni, quindi eliminazione definitiva (fino a 90 giorni per contenuti legati a eventi estremi o in verifica a seguito di segnalazione). Dalle foto possono essere derivati dati meteorologici aggregati e anonimi (condizione osservata, zona, orario), privi di riferimenti personali, conservati per migliorare le previsioni collaborative. Se elimini un post o l'account, la rimozione dei dati personali è immediata, salvo obblighi di conservazione di legge e tempi tecnici di rotazione dei backup." },
  { h: "7. Comunicazione e condivisione", p: "I contenuti che pubblichi (post, foto, eventi, profilo) sono visibili agli altri utenti secondo le impostazioni di visibilità. I dati possono essere trattati da fornitori di servizi (hosting, infrastruttura cloud, servizi mappe e meteo) nominati responsabili del trattamento. Non vendiamo i tuoi dati personali a terzi e non mostriamo pubblicità di inserzionisti all'interno dei contenuti." },
  { h: "8. Trasferimento dati extra-UE", p: "Qualora i dati siano trasferiti fuori dallo Spazio Economico Europeo, ciò avverrà solo verso Paesi con decisione di adeguatezza oppure adottando garanzie adeguate (es. Clausole Contrattuali Standard della Commissione Europea)." },
  { h: "9. I tuoi diritti", p: "In qualità di interessato hai diritto di: accesso ai dati (art. 15); rettifica (art. 16); cancellazione/oblio (art. 17); limitazione (art. 18); portabilità (art. 20); opposizione (art. 21); revoca del consenso in qualsiasi momento. Hai inoltre diritto di proporre reclamo all'Autorità Garante per la protezione dei dati personali. Per esercitare i diritti scrivi a privacy@beeweat.app." },
  { h: "10. Minori", p: "Il servizio non è destinato a minori di 14 anni (o all'età minima prevista dalla normativa locale). Per i minori è richiesto il consenso di chi esercita la responsabilità genitoriale. Non raccogliamo consapevolmente dati di minori al di sotto di tale età." },
  { h: "11. Sicurezza", p: "Adottiamo misure tecniche e organizzative adeguate (cifratura delle credenziali, controlli di accesso, trasmissione protetta) per proteggere i dati da accessi non autorizzati, perdita o divulgazione." },
  { h: "12. Modifiche", p: "La presente informativa può essere aggiornata. In caso di modifiche sostanziali ti informeremo tramite l'App. L'uso continuato del servizio dopo l'aggiornamento implica presa visione della versione vigente." },
  { h: "13. Contatti", p: "Per domande o richieste sulla privacy: privacy@beeweat.app. Ultimo aggiornamento: maggio 2026." },
];

// ─── TERMINI DI SERVIZIO ──────────────────────────────────────────────────────
const TERMS = [
  { h: "1. Accettazione dei Termini", p: "Utilizzando Beeweat accetti integralmente i presenti Termini di Servizio. Se non li accetti, ti invitiamo a non utilizzare l'App. I Termini costituiscono un accordo vincolante tra te e Beeweat." },
  { h: "2. Descrizione del servizio", p: "Beeweat è una piattaforma social di meteo collaborativo che consente di pubblicare osservazioni meteo in tempo reale, visualizzare contenuti nelle vicinanze tramite il radar, interagire con altri utenti tramite chat, like e segnalazioni di eventi." },
  { h: "3. Account e registrazione", p: "Per usare le funzioni complete devi registrarti fornendo dati veritieri e mantenere riservate le credenziali. Sei responsabile delle attività svolte tramite il tuo account. Devi avere almeno 14 anni (o l'età minima prevista localmente) per registrarti." },
  { h: "4. Regole di condotta", p: "Ti impegni a non pubblicare contenuti illeciti, offensivi, diffamatori, osceni, violenti, discriminatori o che violino diritti altrui; a non molestare altri utenti; a non diffondere spam, informazioni false o fuorvianti; a non tentare accessi non autorizzati o compromettere la sicurezza della piattaforma." },
  { h: "5. Contenuti degli utenti", p: "Resti titolare dei contenuti che pubblichi (foto, post, messaggi). Concedi a Beeweat una licenza non esclusiva, gratuita e limitata a ospitare, mostrare e distribuire tali contenuti all'interno del servizio. Sei l'unico responsabile di ciò che pubblichi e garantisci di averne i diritti. I post seguono un ciclo di vita a tempo: restano visibili sul radar per 6 ore e nel feed pubblico per 24 ore dalla pubblicazione; successivamente sono visibili solo nel tuo profilo per 30 giorni, dopodiché la foto e il post vengono eliminati definitivamente insieme alla relativa chat pubblica. Le stelle ricevute e i contatori restano acquisiti nella tua reputazione. Puoi eliminare un tuo post in qualsiasi momento, con rimozione immediata. I contenuti oggetto di segnalazione possono essere conservati oltre tali termini fino alla conclusione della verifica; i contenuti collegati a eventi meteo estremi possono essere conservati fino a 90 giorni per finalità di documentazione." },
  { h: "6. Fotocamera e posizione", p: "Le foto possono essere acquisite esclusivamente in tempo reale tramite la fotocamera: non è consentito il caricamento dalla galleria per i post. L'uso di fotocamera e geolocalizzazione richiede il tuo consenso ed è soggetto ai permessi del sistema operativo." },
  { h: "7. Eventi e segnalazioni", p: "Le segnalazioni di eventi (temporali, mareggiate, attenzione, incidenti, soccorso, ecc.) sono generate dagli utenti a titolo informativo e collaborativo. NON costituiscono allerta ufficiale. In caso di pericolo o emergenza reale contatta sempre i numeri di emergenza (112) e le autorità competenti." },
  { h: "8. Dati meteo", p: "Le informazioni meteo derivano da una media di fonti pubbliche e sono fornite a scopo indicativo, senza garanzia di esattezza, completezza o tempestività. Non fare affidamento esclusivo su tali dati per decisioni critiche." },
  { h: "9. Proprietà intellettuale", p: "Il marchio Beeweat, il logo, il software e gli elementi grafici sono di proprietà del Titolare o dei rispettivi licenzianti e sono protetti dalle leggi vigenti. Non è consentito copiarli o utilizzarli senza autorizzazione." },
  { h: "10. Sospensione e cessazione", p: "Possiamo sospendere o chiudere account che violino i presenti Termini o la legge. Puoi cancellare il tuo account in qualsiasi momento; la cessazione comporta la rimozione dei contenuti secondo quanto previsto nell'Informativa sulla Privacy." },
  { h: "11. Esclusione di garanzie", p: "Il servizio è fornito \"così com'è\" e \"come disponibile\", senza garanzie di funzionamento ininterrotto o privo di errori. Beeweat non garantisce l'accuratezza dei contenuti generati dagli utenti." },
  { h: "12. Limitazione di responsabilità", p: "Nei limiti consentiti dalla legge, Beeweat non è responsabile per danni indiretti, incidentali o consequenziali derivanti dall'uso o dall'impossibilità di usare il servizio, né per condotte o contenuti di terzi/altri utenti." },
  { h: "13. Modifiche ai Termini", p: "Possiamo aggiornare i presenti Termini. In caso di modifiche rilevanti ti informeremo tramite l'App. L'uso continuato dopo l'aggiornamento implica accettazione della versione vigente." },
  { h: "14. Legge applicabile e foro", p: "I presenti Termini sono regolati dalla legge italiana. Per i consumatori resta competente il foro del luogo di residenza o domicilio; per gli altri casi è competente il foro indicato dal Titolare nel rispetto delle norme inderogabili." },
  { h: "15. Contatti", p: "Per domande sui Termini di Servizio: legal@beeweat.app. Ultimo aggiornamento: maggio 2026." },
];

function LegalDoc({ title, intro, sections, onClose, onAccept }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: "#fff", zIndex: 80, display: "flex", flexDirection: "column" }}>
      <div style={{ background: HBLUE, color: "#fff", padding: "14px 16px", paddingTop: "calc(14px + env(safe-area-inset-top, 0px))", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", display: "flex" }}><NavIcon name="back" size={22} color="#fff" /></button>
        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18 }}>{title}</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "18px 18px 8px" }}>
        {intro && <div style={{ fontSize: 13, color: TXT2, lineHeight: 1.5, marginBottom: 16 }}>{intro}</div>}
        {sections.map((s, i) => (
          <div key={i} style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 14.5, color: HBLUE, marginBottom: 5 }}>{s.h}</div>
            <div style={{ fontSize: 13.5, color: TXT, lineHeight: 1.55 }}>{s.p}</div>
          </div>
        ))}
      </div>
      {onAccept && (
        <div style={{ padding: "12px 16px", paddingBottom: "calc(16px + env(safe-area-inset-bottom,0px))", borderTop: `1px solid ${LINE}`, flexShrink: 0 }}>
          <button onClick={onAccept} style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", background: `linear-gradient(135deg,${HBLUE},#1B4E96)`, color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "'Sora',sans-serif" }}>Ho letto e accetto</button>
        </div>
      )}
    </div>
  );
}

// ─── AUTH ───────────────────────────────────────────────────────────────────
function AuthScreen({ onLogin, sb }) {
  const [view, setView] = useState("welcome");
  const [mode, setMode] = useState("register");
  const [form, setForm] = useState({ name: "", city: "", email: "", password: "" });
  const [accepted, setAccepted] = useState(false);
  const [legal, setLegal] = useState(null); // null | "privacy" | "terms"
  const [warn, setWarn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [authErr, setAuthErr] = useState(null);
  const [info, setInfo] = useState(null);
  const [recoverEmail, setRecoverEmail] = useState("");
  const [recoverSent, setRecoverSent] = useState(false);
  const inp = (ph, k, type = "text") => <input type={type} placeholder={ph} value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} style={{ width: "100%", background: "#F4F8FC", border: `1.5px solid ${LINE}`, borderRadius: 12, padding: "12px 16px", color: TXT, fontSize: 14, outline: "none" }} onFocus={e => e.target.style.borderColor = HBLUE} onBlur={e => e.target.style.borderColor = LINE} />;
  const handleEmail = async () => {
    if (mode === "register" && !accepted) { setWarn(true); return; }
    if (!form.email || !form.password) return;
    setAuthErr(null); setInfo(null);
    // Se Supabase è configurato → autenticazione reale; altrimenti demo locale
    if (sb?.isConfigured) {
      setBusy(true);
      try {
        if (mode === "register") {
          await sb.registerEmail({ email: form.email, password: form.password, name: form.name || "Utente Bee", city: form.city || CITY });
          // Se la conferma email non è richiesta, si entra subito; altrimenti si mostra l'avviso
          try {
            await sb.loginEmail({ email: form.email, password: form.password });
            let prof = null; try { prof = await sb.getCurrentProfile(); } catch (_) {}
            onLogin({ name: prof?.name || form.name || "Utente Bee", city: prof?.city || form.city || CITY });
            return;
          } catch (_) {
            setInfo("Registrazione inviata! Controlla la tua email e conferma il link, poi accedi.");
            setMode("login");
          }
        } else {
          await sb.loginEmail({ email: form.email, password: form.password });
          let prof = null; try { prof = await sb.getCurrentProfile(); } catch (_) {}
          onLogin({ name: prof?.name || form.name || "Utente Bee", city: prof?.city || form.city || CITY });
        }
      } catch (e) {
        let m = e?.message || e?.error_description || e?.msg || "";
        if (!m || m === "{}") { try { m = JSON.stringify(e, Object.getOwnPropertyNames(e || {})); } catch (_) { m = String(e); } }
        setAuthErr(m.includes("Invalid login") ? "Email o password errati." : /confirm/i.test(m) ? "Devi prima confermare l'email: controlla la posta." : m.includes("already registered") ? "Email già registrata: prova ad accedere." : /fetch|network/i.test(m) ? "Impossibile raggiungere il server: controlla che il progetto Supabase sia attivo (non in pausa) e l'URL delle chiavi." : "Errore: " + m);
      } finally { setBusy(false); }
    } else {
      onLogin({ name: form.name || "Utente Bee", city: form.city || CITY });
    }
  };

  if (view === "welcome") return (
    <div style={{ height: "100%", width: "100%", background: "linear-gradient(180deg,#FAFCFE 0%,#EAF4FB 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 28px", position: "relative", overflow: "hidden" }}>
      {/* motivo a nido d'ape soffuso */}
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.06, pointerEvents: "none" }} aria-hidden="true">
        <defs><pattern id="comb" width="56" height="48" patternUnits="userSpaceOnUse" patternTransform="scale(1)">
          <path d="M14 0 L42 0 L56 24 L42 48 L14 48 L0 24 Z" fill="none" stroke={HBLUE} strokeWidth="2" />
        </pattern></defs>
        <rect width="100%" height="100%" fill="url(#comb)" />
      </svg>
      <div className="fade-up" style={{ textAlign: "center", marginBottom: 60, position: "relative" }}>
        <div style={{ display: "inline-block", animation: "float 3.5s ease-in-out infinite" }}><BeeweatLogo size={150} /></div>
        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 42, letterSpacing: ".04em", color: "#2A7DC4", marginTop: 14 }}>BEEWEAT</div>
        <div style={{ fontSize: 14, color: "#6E8BA6", marginTop: 4, fontWeight: 500, letterSpacing: ".01em" }}>Le api del tempo · il meteo in tempo reale</div>
        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 15.5, color: HBLUE, marginTop: 10, fontWeight: 600, fontStyle: "italic", letterSpacing: ".02em" }}>Mille occhi, un solo cielo.</div>
        <div style={{ fontSize: 10.5, color: "#9FB4C8", marginTop: 6 }}>v{APP_VERSION}</div>
      </div>
      <div className="fade-up" style={{ width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", gap: 16, animationDelay: ".05s", position: "relative" }}>
        <button onClick={() => { setView("email"); setMode("register"); }} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: 15, borderRadius: 10, border: "none", cursor: "pointer", background: "#E07B43", color: "#fff", fontWeight: 600, fontSize: 15, fontFamily: "'Sora',sans-serif" }}><MailIcon /> Entra usando la tua Email</button>
        <div style={{ fontSize: 11.5, color: TXT2, textAlign: "center", lineHeight: 1.45, marginTop: 2 }}>Continuando accetti i <span onClick={() => setLegal("terms")} style={{ color: HBLUE, fontWeight: 600, textDecoration: "underline", cursor: "pointer" }}>Termini di Servizio</span> e l'<span onClick={() => setLegal("privacy")} style={{ color: HBLUE, fontWeight: 600, textDecoration: "underline", cursor: "pointer" }}>Informativa sulla Privacy</span>.</div>
      </div>
      {legal === "privacy" && <LegalDoc title="Informativa sulla Privacy" intro="Beeweat tiene alla tua privacy. Di seguito trovi l'informativa completa sul trattamento dei dati personali ai sensi del Regolamento (UE) 2016/679 (GDPR)." sections={PRIVACY} onClose={() => setLegal(null)} onAccept={() => { setAccepted(true); setWarn(false); setLegal(null); }} />}
      {legal === "terms" && <LegalDoc title="Termini di Servizio" intro="Leggi i termini che regolano l'uso di Beeweat." sections={TERMS} onClose={() => setLegal(null)} onAccept={() => { setAccepted(true); setWarn(false); setLegal(null); }} />}
    </div>
  );

  // ── RECUPERO PASSWORD ──
  if (view === "recover") return (
    <div style={{ height: "100%", width: "100%", background: `linear-gradient(160deg, ${BODY}, #B8E0F7)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "auto", position: "relative", padding: "20px 0" }}>
      <button onClick={() => { setView("email"); setMode("login"); setRecoverSent(false); }} style={{ position: "absolute", top: 20, left: 20, background: "#fff", border: `1.5px solid ${LINE}`, borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><NavIcon name="back" size={20} color={HBLUE} /></button>
      <div className="fade-up" style={{ textAlign: "center", marginBottom: 22 }}><span style={{ display: "inline-block" }}><BeeweatLogo size={84} /></span><div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 26, color: "#2A7DC4", marginTop: 8 }}>BEEWEAT</div></div>
      <div className="fade-up" style={{ background: "#fff", borderRadius: 24, padding: "26px 28px", width: 340, boxShadow: `0 20px 60px ${HBLUE}22`, animationDelay: ".05s" }}>
        {!recoverSent ? (
          <>
            <div style={{ fontWeight: 700, fontSize: 18, color: TXT, marginBottom: 6 }}>Reimposta la password</div>
            <div style={{ fontSize: 13, color: TXT2, lineHeight: 1.5, marginBottom: 16 }}>Inserisci l'email del tuo account: ti invieremo un link sicuro per reimpostare la password.</div>
            <input type="email" placeholder="La tua email" value={recoverEmail} onChange={e => setRecoverEmail(e.target.value)} style={{ width: "100%", background: "#F4F8FC", border: `1.5px solid ${LINE}`, borderRadius: 12, padding: "12px 16px", color: TXT, fontSize: 14, outline: "none", marginBottom: 14 }} onFocus={e => e.target.style.borderColor = HBLUE} onBlur={e => e.target.style.borderColor = LINE} />
            <button onClick={async () => { if (!recoverEmail.trim()) return; try { if (sb?.isConfigured) await sb.resetPassword(recoverEmail.trim()); } catch (_) {} setRecoverSent(true); }} style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", cursor: "pointer", background: `linear-gradient(135deg,${HBLUE},#1B4E96)`, color: "#fff", fontWeight: 600, fontSize: 14, fontFamily: "'Sora',sans-serif", opacity: recoverEmail.trim() ? 1 : .6 }}>Invia link di reimpostazione</button>
          </>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><div style={{ width: 56, height: 56, borderRadius: "50%", background: "#3BA77618", display: "flex", alignItems: "center", justifyContent: "center" }}><NavIcon name="check" size={28} color="#3BA776" sw={2.4} /></div></div>
            <div style={{ fontWeight: 700, fontSize: 17, color: TXT, textAlign: "center", marginBottom: 8 }}>Controlla la tua email</div>
            <div style={{ fontSize: 13, color: TXT2, lineHeight: 1.55, textAlign: "center" }}>Se <b>{recoverEmail}</b> è associata a un account Beeweat, riceverai un'email con un <b>link sicuro</b> per reimpostare la password.<br /><br />Il link è valido per <b>30 minuti</b>, è utilizzabile una sola volta e funziona solo dal dispositivo da cui lo apri. Controlla anche lo spam.</div>
            <button onClick={() => { setView("email"); setMode("login"); setRecoverSent(false); }} style={{ width: "100%", marginTop: 18, padding: 13, borderRadius: 12, border: `1.5px solid ${LINE}`, background: "#fff", color: HBLUE, fontWeight: 600, cursor: "pointer", fontFamily: "'Sora',sans-serif" }}>Torna all'accesso</button>
          </>
        )}
      </div>
      <div style={{ fontSize: 11, color: TXT2, textAlign: "center", marginTop: 14, maxWidth: 300, lineHeight: 1.5 }}>Per la tua sicurezza non comunichiamo se un'email è registrata o meno.</div>
    </div>
  );

  return (
    <div style={{ height: "100%", width: "100%", background: `linear-gradient(160deg, ${BODY}, #B8E0F7)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "auto", position: "relative", padding: "20px 0" }}>
      <button onClick={() => setView("welcome")} style={{ position: "absolute", top: 20, left: 20, background: "#fff", border: `1.5px solid ${LINE}`, borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><NavIcon name="back" size={20} color={HBLUE} /></button>
      <div className="fade-up" style={{ textAlign: "center", marginBottom: 22 }}><span style={{ display: "inline-block" }}><BeeweatLogo size={84} /></span><div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 26, color: "#2A7DC4", marginTop: 8 }}>BEEWEAT</div></div>
      <div className="fade-up" style={{ background: "#fff", borderRadius: 24, padding: "26px 28px", width: 340, boxShadow: `0 20px 60px ${HBLUE}22`, animationDelay: ".05s" }}>
        <div style={{ display: "flex", marginBottom: 20, background: BODY, borderRadius: 12, padding: 4 }}>{["login", "register"].map(m => <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: 9, borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "'Sora',sans-serif", background: mode === m ? "#fff" : "transparent", color: mode === m ? HBLUE : TXT2, boxShadow: mode === m ? `0 2px 8px ${HBLUE}22` : "none" }}>{m === "login" ? "Accedi" : "Registrati"}</button>)}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mode === "register" && <>{inp("Il tuo nome", "name")}{inp("La tua città", "city")}</>}
          {inp("Email", "email", "email")}{inp("Password", "password", "password")}
          {mode === "register" && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 2 }}>
              <button onClick={() => { setAccepted(a => !a); setWarn(false); }} style={{ flexShrink: 0, width: 22, height: 22, borderRadius: 6, border: `2px solid ${warn && !accepted ? RED : accepted ? HBLUE : LINE}`, background: accepted ? HBLUE : "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>{accepted && <NavIcon name="check" size={14} color="#fff" sw={3} />}</button>
              <div style={{ fontSize: 12.5, color: TXT2, lineHeight: 1.45 }}>
                Ho letto e accetto i <span onClick={() => setLegal("terms")} style={{ color: HBLUE, fontWeight: 600, textDecoration: "underline", cursor: "pointer" }}>Termini di Servizio</span> e l'<span onClick={() => setLegal("privacy")} style={{ color: HBLUE, fontWeight: 600, textDecoration: "underline", cursor: "pointer" }}>Informativa sulla Privacy</span>.
              </div>
            </div>
          )}
          {warn && mode === "register" && !accepted && <div style={{ fontSize: 12, color: RED }}>Per registrarti devi accettare i Termini di Servizio e l'informativa sulla privacy.</div>}
          {mode === "login" && <div style={{ textAlign: "right", marginTop: -4 }}><span onClick={() => { setRecoverEmail(form.email); setRecoverSent(false); setView("recover"); }} style={{ fontSize: 12.5, color: HBLUE, fontWeight: 600, cursor: "pointer" }}>Password dimenticata?</span></div>}
          {authErr && <div style={{ color: RED, fontSize: 12.5, fontWeight: 600 }}>{authErr}</div>}
          {info && <div style={{ color: "#3BA776", fontSize: 12.5, fontWeight: 600 }}>{info}</div>}
          <button onClick={handleEmail} disabled={busy} style={{ width: "100%", marginTop: 4, padding: 14, borderRadius: 12, border: "none", cursor: "pointer", background: `linear-gradient(135deg,${HBLUE},#1B4E96)`, color: "#fff", fontWeight: 600, fontSize: 14, fontFamily: "'Sora',sans-serif", letterSpacing: ".08em", opacity: mode === "register" && !accepted ? .6 : 1 }}>{busy ? "Attendere…" : "ENTER"}</button>
          {mode === "register" && <div style={{ fontSize: 11, color: TXT2, textAlign: "center", lineHeight: 1.4 }}>Servizio non destinato a minori di 14 anni.</div>}
        </div>
      </div>
      {legal === "privacy" && <LegalDoc title="Informativa sulla Privacy" intro="Beeweat tiene alla tua privacy. Di seguito trovi l'informativa completa sul trattamento dei dati personali ai sensi del Regolamento (UE) 2016/679 (GDPR)." sections={PRIVACY} onClose={() => setLegal(null)} onAccept={() => { setAccepted(true); setWarn(false); setLegal(null); }} />}
      {legal === "terms" && <LegalDoc title="Termini di Servizio" intro="Leggi i termini che regolano l'uso di Beeweat." sections={TERMS} onClose={() => setLegal(null)} onAccept={() => { setAccepted(true); setWarn(false); setLegal(null); }} />}
    </div>
  );
}

// ─── HEADER ─────────────────────────────────────────────────────────────────
function Header({ title, left, right }) {
  return (
    <div style={{ background: HBLUE, color: "#fff", padding: "14px 16px", paddingTop: "calc(14px + env(safe-area-inset-top, 0px))", display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 56, flexShrink: 0 }}>
      <div style={{ minWidth: 72, display: "flex", justifyContent: "flex-start" }}>{left}</div>
      <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 21, letterSpacing: ".02em", flex: 1, textAlign: "center", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{title}</div>
      <div style={{ minWidth: 72, display: "flex", justifyContent: "flex-end" }}>{right}</div>
    </div>
  );
}

// ─── WEATHER PANEL ────────────────────────────────────────────────────────────
function WeatherPanel({ commentCount, wx, onOpenChat }) {
  const W = wx || WEATHER;
  const M = ({ icon, children }) => <div style={{ display: "flex", alignItems: "center", gap: 5 }}><WIcon name={icon} size={21} color={HBLUE} sw={1.7} /><span style={{ fontSize: 13.5, fontWeight: 500 }}>{children}</span></div>;
  return (
    <div style={{ background: GREYP, color: HBLUE, padding: "7px 20px 8px", flexShrink: 0, borderBottom: `1px solid ${LINE}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1.05 }}>{new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}</div>
          <button onClick={onOpenChat} title="Chat pubblica del posto" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12.5, background: HBLUE + "12", border: "none", borderRadius: 9, padding: "3px 8px", cursor: "pointer", color: "inherit", fontFamily: "'Sora',sans-serif" }}><span>{commentCount}</span><WIcon name="chat" size={14} color={HBLUE} sw={1.8} /></button>
        </div>
        <span style={{ fontSize: 28, lineHeight: 1 }}>{W.condition.split(" ")[0]}</span>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.1 }}>{W.condition.replace(/^[^ ]+ /, "")}</div>
          <div style={{ fontSize: 18, fontWeight: 600, fontFamily: "'Space Grotesk',sans-serif" }}>{W.temp}</div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <M icon="thermo">{W.hi}/{W.lo}</M>
        <M icon="drop">{W.humidity}</M>
        <M icon="compass">{W.wind}</M>
      </div>
    </div>
  );
}

// ─── RADAR SLIDER ─────────────────────────────────────────────────────────────
const GlobeIcon = ({ size = 14, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="9" />
    <ellipse cx="12" cy="12" rx="4" ry="9" />
    <path d="M3.5 9h17M3.5 15h17" />
  </svg>
);
const WorldBtn = ({ on, onClick, h = 30 }) => (
  <button onClick={onClick} title="Tutto il mondo" style={{ height: h, padding: "0 12px", borderRadius: 10, border: "none", background: on ? ACCENT : HBLUE, cursor: "pointer", fontSize: 12, fontWeight: 700, color: on ? HBLUE : "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flexShrink: 0, fontFamily: "'Sora',sans-serif", boxShadow: on ? `0 2px 10px ${ACCENT}88` : `0 2px 8px ${HBLUE}44`, transition: "background .15s, color .15s" }}>
    <GlobeIcon size={13.5} color={on ? HBLUE : "#fff"} /> Mondo
  </button>
);

function RadarBar({ km, setKm }) {
  const pct = ((km - 1) / 99) * 100;
  return (
    <div style={{ background: GREYP, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0, borderTop: `1px solid ${LINE}` }}>
      <NavIcon name="locate" size={26} color={HBLUE} sw={1.8} />
      <input type="range" min={1} max={100} value={km} onChange={e => setKm(+e.target.value)} style={{ flex: 1, background: `linear-gradient(to right, ${ACCENT} 0%, ${ACCENT} ${pct}%, ${HBLUE}26 ${pct}%, ${HBLUE}26 100%)` }} />
      <span style={{ color: HBLUE, fontWeight: 600, fontSize: 15, fontFamily: "'Space Grotesk',sans-serif", minWidth: 92, textAlign: "right" }}>Raggio: {km} Km</span>
    </div>
  );
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────
function BottomNav({ tab, setTab }) {
  const tabs = [
    { id: "vicini", icon: "vicini", label: "Vicini" },
    { id: "beecast", icon: "beecast", label: "BeeCast" },
    { id: "feed", icon: "feed", label: "Feed" },
    { id: "eventi", icon: "eventi", label: "Eventi" },
    { id: "contatti", icon: "contatti", label: "Contatti" },
  ];
  return (
    <div style={{ display: "flex", background: NAV, minHeight: 64, paddingBottom: "env(safe-area-inset-bottom, 0px)", flexShrink: 0 }}>
      {tabs.map(t => {
        const a = tab === t.id;
        return (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, background: "none", border: "none", cursor: "pointer" }}>
            <NavIcon name={t.icon} size={24} color={a ? NAVACT : "#fff"} sw={a ? 2.1 : 1.8} />
            <span style={{ fontSize: 10.5, fontWeight: 500, color: a ? NAVACT : "#fff" }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── SEGNALAZIONE CONTENUTO ───────────────────────────────────────────────────
const REPORT_REASONS = ["Contenuto inappropriato", "Persone in primo piano", "Spam o pubblicità", "Foto non meteo", "Altro"];
function ReportModal({ post, onSubmit, onClose }) {
  const [reason, setReason] = useState(null);
  const [sent, setSent] = useState(false);
  return (
    <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(20,40,65,.5)", display: "flex", alignItems: "flex-end", zIndex: 60 }}>
      <div onClick={e => e.stopPropagation()} className="fade-up" style={{ width: "100%", background: "#fff", borderRadius: "20px 20px 0 0", padding: "20px 16px 24px" }}>
        {!sent ? (
          <>
            <div style={{ fontWeight: 700, fontSize: 18, color: TXT, marginBottom: 4 }}>Segnala il contenuto</div>
            <div style={{ fontSize: 13, color: TXT2, marginBottom: 14 }}>Perché vuoi segnalare il post di {post.user}?</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {REPORT_REASONS.map(r => (
                <button key={r} onClick={() => setReason(r)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${reason === r ? HBLUE : LINE}`, background: reason === r ? HBLUE + "0E" : "#fff", cursor: "pointer", textAlign: "left", fontSize: 14, color: TXT, fontFamily: "'Sora',sans-serif", fontWeight: 500 }}>
                  <span style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${reason === r ? HBLUE : LINE}`, background: reason === r ? HBLUE : "#fff", flexShrink: 0 }} />{r}
                </button>
              ))}
            </div>
            <button onClick={() => { if (reason) { onSubmit(post, reason); setSent(true); } }} disabled={!reason} style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", background: `linear-gradient(135deg,${HBLUE},#1B4E96)`, color: "#fff", fontWeight: 600, cursor: "pointer", fontFamily: "'Sora',sans-serif", opacity: reason ? 1 : .5 }}>Invia segnalazione</button>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "10px 0 4px" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#3BA77618", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}><NavIcon name="check" size={28} color="#3BA776" sw={2.4} /></div>
            <div style={{ fontWeight: 700, fontSize: 17, color: TXT, marginBottom: 6 }}>Segnalazione inviata</div>
            <div style={{ fontSize: 13, color: TXT2, lineHeight: 1.5, marginBottom: 16 }}>Grazie. Il contenuto è ora <b>in revisione</b> e verrà controllato dal nostro sistema di moderazione.</div>
            <button onClick={onClose} style={{ width: "100%", padding: 13, borderRadius: 12, border: `1.5px solid ${LINE}`, background: "#fff", color: HBLUE, fontWeight: 600, cursor: "pointer", fontFamily: "'Sora',sans-serif" }}>Chiudi</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── POST CARD ────────────────────────────────────────────────────────────────
function EditPostModal({ post, onSave, onClose, onDelete }) {
  const [caption, setCaption] = useState(post.caption || "");
  const [cond, setCond] = useState(post.cond || CONDITIONS[0]);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(10,18,30,.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}>
      <div onClick={e => e.stopPropagation()} className="fade-up" style={{ background: "#fff", borderRadius: 18, padding: 18, width: "100%", maxWidth: 400, boxShadow: "0 16px 44px rgba(0,0,0,.28)" }}>
        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 17, color: TXT, marginBottom: 12 }}>Modifica post</div>
        <textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="Descrivi il meteo…" rows={3} style={{ width: "100%", background: BODY, border: `1.5px solid ${LINE}`, borderRadius: 12, padding: "11px 14px", fontSize: 14, color: TXT, outline: "none", resize: "none", fontFamily: "'Sora',sans-serif", marginBottom: 10 }} />
        <select value={cond} onChange={e => setCond(e.target.value)} style={{ width: "100%", background: BODY, border: `1.5px solid ${LINE}`, borderRadius: 12, padding: "11px 14px", fontSize: 14, color: TXT, outline: "none", marginBottom: 14, fontFamily: "'Sora',sans-serif" }}>
          {CONDITIONS.map(c => <option key={c}>{c}</option>)}
        </select>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 12, border: `1.5px solid ${LINE}`, background: "#fff", color: HBLUE, fontWeight: 600, cursor: "pointer", fontFamily: "'Sora',sans-serif" }}>Annulla</button>
          <button onClick={() => onSave({ caption: caption.trim(), cond })} style={{ flex: 1, padding: 12, borderRadius: 12, border: "none", background: `linear-gradient(135deg,${HBLUE},#1B4E96)`, color: "#fff", fontWeight: 600, cursor: "pointer", fontFamily: "'Sora',sans-serif" }}>Salva</button>
        </div>
        {onDelete && <button onClick={() => { if (window.confirm("Eliminare definitivamente questo post?")) onDelete(); }} style={{ width: "100%", marginTop: 10, padding: 12, borderRadius: 12, border: "1.5px solid #E5484D55", background: "#E5484D0E", color: "#C43C41", fontWeight: 600, cursor: "pointer", fontFamily: "'Sora',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}><NavIcon name="trash" size={15} color="#C43C41" sw={2} /> Cancella elemento</button>}
      </div>
    </div>
  );
}

function EditEventModal({ ev, onSave, onDelete, onClose }) {
  const [title, setTitle] = useState(ev.title || "");
  const [place, setPlace] = useState(ev.place || "");
  const [sev, setSev] = useState(ev.sev || "Media");
  const [cat, setCat] = useState(ev.cat || EVENT_CATEGORIES[0]);
  const [ends, setEnds] = useState(ev.ends || new Date().toISOString().slice(0, 10));
  const F = { width: "100%", background: BODY, border: `1.5px solid ${LINE}`, borderRadius: 12, padding: "11px 14px", fontSize: 14, color: TXT, outline: "none", marginBottom: 10, fontFamily: "'Sora',sans-serif" };
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(10,18,30,.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}>
      <div onClick={e => e.stopPropagation()} className="fade-up" style={{ background: "#fff", borderRadius: 18, padding: 18, width: "100%", maxWidth: 400, maxHeight: "88vh", overflowY: "auto", boxShadow: "0 16px 44px rgba(0,0,0,.28)" }}>
        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 17, color: TXT, marginBottom: 12 }}>Modifica evento</div>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titolo" style={F} />
        <input value={place} onChange={e => setPlace(e.target.value)} placeholder="Luogo" style={F} />
        <select value={cat} onChange={e => setCat(e.target.value)} style={F}>{EVENT_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
        <select value={sev} onChange={e => setSev(e.target.value)} style={F}>{["Alta", "Media", "Bassa"].map(x => <option key={x}>{x}</option>)}</select>
        <div style={{ fontSize: 11, fontWeight: 600, color: TXT2, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Valido fino a</div>
        <input type="date" value={ends} onChange={e => setEnds(e.target.value)} style={{ ...F, marginBottom: 14 }} />
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 12, border: `1.5px solid ${LINE}`, background: "#fff", color: HBLUE, fontWeight: 600, cursor: "pointer", fontFamily: "'Sora',sans-serif" }}>Annulla</button>
          <button onClick={() => { if (!title.trim()) { alert("Il titolo è obbligatorio."); return; } onSave({ title: title.trim(), place: place.trim(), sev, cat, ends }); }} style={{ flex: 1, padding: 12, borderRadius: 12, border: "none", background: `linear-gradient(135deg,${HBLUE},#1B4E96)`, color: "#fff", fontWeight: 600, cursor: "pointer", fontFamily: "'Sora',sans-serif" }}>Salva</button>
        </div>
        <button onClick={() => { if (window.confirm(`Eliminare definitivamente l'evento "${ev.title}"?`)) onDelete(); }} style={{ width: "100%", marginTop: 10, padding: 12, borderRadius: 12, border: "1.5px solid #E5484D55", background: "#E5484D0E", color: "#C43C41", fontWeight: 600, cursor: "pointer", fontFamily: "'Sora',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}><NavIcon name="trash" size={15} color="#C43C41" sw={2} /> Cancella elemento</button>
      </div>
    </div>
  );
}

function PhotoViewer({ src, caption, onClose }) {
  const [saved, setSaved] = useState(false);
  const save = async () => {
    try {
      const blob = await (await fetch(src)).blob();
      const file = new File([blob], `beeweat_${Date.now()}.jpg`, { type: blob.type || "image/jpeg" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "Beeweat" });   // foglio nativo → "Salva immagine"
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = file.name;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
      }
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } catch (_) {}
  };
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(8,14,24,.94)", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "14px 16px" }}>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,.12)", border: "none", width: 40, height: 40, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><NavIcon name="close" size={20} color="#fff" sw={2} /></button>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 8px", minHeight: 0 }}>
        <img src={src} alt="" onClick={e => e.stopPropagation()} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 10 }} />
      </div>
      <div onClick={e => e.stopPropagation()} style={{ padding: "14px 16px calc(18px + env(safe-area-inset-bottom))" }}>
        {caption && <div style={{ color: "#C9D8E8", fontSize: 13.5, textAlign: "center", marginBottom: 12 }}>{caption}</div>}
        <button onClick={save} style={{ width: "100%", padding: 14, borderRadius: 14, border: "none", background: saved ? "#3BA776" : "#fff", color: saved ? "#fff" : HBLUE, fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "'Sora',sans-serif" }}>{saved ? "✓ Fatto" : "Condividi"}</button>
      </div>
    </div>
  );
}

function PostCard({ post, onStar, onChat, onOpenUser, isFollowing, onFollow, onReport, reported, onView, onOpenPhoto, canDelete, onDelete, onEdit }) {
  const [anim, setAnim] = useState(false);
  const cardRef = useRef(null);
  useEffect(() => {
    if (!onView || !cardRef.current || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { onView(post.id); io.disconnect(); } }), { threshold: 0.6 });
    io.observe(cardRef.current);
    return () => io.disconnect();
  }, []);
  const emoji = post.cond.split(" ")[0];
  const like = e => { e.stopPropagation(); if (post.mine) return; setAnim(true); setTimeout(() => setAnim(false), 360); onStar(post.id); };
  const Stat = ({ icon, count, color, onClick, active }) => (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 7, background: "none", border: "none", cursor: onClick ? "pointer" : "default", padding: 0 }}>
      <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 18, color: TXT }}>{count}</span>
      <span className={active ? "star-pop" : ""} style={{ display: "flex" }}><NavIcon name={icon} size={22} color={color} sw={1.9} /></span>
    </button>
  );
  return (
    <div ref={cardRef} className="fade-up" style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 12, padding: "12px 14px 14px", marginBottom: 16, boxShadow: `0 2px 10px ${HBLUE}0D` }}>
      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
        <div onClick={() => onOpenUser && !post.mine && onOpenUser(post)} style={{ cursor: onOpenUser && !post.mine ? "pointer" : "default", flexShrink: 0 }}><UserAvatar src={post.ava} size={48} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span onClick={() => onOpenUser && !post.mine && onOpenUser(post)} style={{ fontWeight: 500, fontSize: 21, color: HBLUE, lineHeight: 1.15, cursor: onOpenUser && !post.mine ? "pointer" : "default", display: "inline-block" }}>{post.user}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2, color: HBLUE, fontSize: 15, flexWrap: "wrap" }}>
            <NavIcon name="pin" size={16} color={HBLUE} sw={2} /><span>{post.city}</span>
            <NavIcon name="clock" size={16} color={HBLUE} sw={2} /><span>{post.time}</span>
            {post.pending && <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 700, color: "#8A5A12", background: ACCENT + "33", borderRadius: 8, padding: "2px 7px" }}>🎒 in attesa di rete</span>}
            {post.dir && <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><WIcon name="compass" size={16} color={HBLUE} sw={2} /><span>{post.dir.label}</span></span>}
            {onFollow && !post.mine && (
              <button onClick={e => { e.stopPropagation(); onFollow(post.user); }} style={{ marginLeft: 4, fontSize: 12, fontWeight: 600, fontFamily: "'Sora',sans-serif", padding: "3px 12px", borderRadius: 20, cursor: "pointer", border: `1.5px solid ${HBLUE}`, background: isFollowing ? HBLUE : "transparent", color: isFollowing ? "#fff" : HBLUE }}>{isFollowing ? "Seguito già" : "+ Segui"}</button>
            )}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 30, lineHeight: 1 }}>{emoji}</span>
          {onReport && !post.mine && <button onClick={e => { e.stopPropagation(); onReport(post); }} title="Segnala" style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 2 }}><NavIcon name="flag" size={18} color={reported ? "#E5484D" : TXT2} sw={1.9} /></button>}
          {onEdit && canDelete && <button onClick={e => { e.stopPropagation(); onEdit(post); }} title="Modifica post" style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 2 }}><NavIcon name="edit" size={17} color={HBLUE} sw={1.9} /></button>}
        </div>
      </div>

      {/* PHOTO (a tutta larghezza) */}
      <div style={{ position: "relative", width: "100%", aspectRatio: "3 / 2", borderRadius: 4, overflow: "hidden", background: "#dfe8f1" }}>
        <img src={post.img} alt="" onClick={() => onOpenPhoto && onOpenPhoto(post)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", cursor: onOpenPhoto ? "zoom-in" : "default" }} />
        {reported && <div style={{ position: "absolute", top: 10, left: 10, display: "flex", alignItems: "center", gap: 5, background: "rgba(30,40,60,.78)", color: "#fff", fontSize: 11, fontWeight: 600, borderRadius: 20, padding: "5px 11px" }}><NavIcon name="search" size={12} color="#fff" sw={2} /> In revisione</div>}
      </div>

      {/* CONTATORI: chat · like (cuore) · visualizzazioni */}
      <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", padding: "12px 4px 8px" }}>
        <Stat icon="comment" count={post.comments} color={HBLUE} onClick={onChat ? e => { e.stopPropagation(); onChat(post); } : undefined} />
        <Stat icon={post.starred ? "heartFill" : "heart"} count={post.stars} color={post.mine ? TXT2 + "88" : post.starred ? "#EF4D6A" : HBLUE} onClick={post.mine ? undefined : like} active={anim} />
        <Stat icon="eye" count={post.views} color={HBLUE} />
      </div>

      {/* DIDASCALIA troncata */}
      {post.caption && <div style={{ fontSize: 14, color: TXT2, lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", overflowWrap: "anywhere", wordBreak: "break-word" }}>{post.caption}</div>}
    </div>
  );
}

// ─── FEED ─────────────────────────────────────────────────────────────────────
function FeedScreen({ posts, km, onStar, onChat, onOpenUser, following, onFollow, onReport, reported, onView, onOpenPhoto, isAdmin, onDelete, onEdit, loading, worldOn, onToggleWorld }) {
  const visible = worldOn ? posts : posts.filter(p => p.dist <= km);
  return (
    <div className="scr" style={{ flex: 1, overflowY: "auto", padding: "16px 14px", background: BODY }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: TXT2, fontWeight: 500 }}>{worldOn ? `${visible.length} post da tutto il mondo` : `${visible.length} post entro ${km} km`}</span>
        {onToggleWorld && <WorldBtn on={worldOn} onClick={onToggleWorld} h={28} />}
      </div>
      {visible.length === 0
        ? (loading
            ? <div style={{ textAlign: "center", padding: "56px 20px", color: TXT2 }}>
                <div style={{ marginBottom: 12, display: "flex", justifyContent: "center" }}><span style={{ animation: "blink 1.1s infinite", display: "flex" }}><NavIcon name="beecast" size={40} color={HBLUE} sw={1.6} /></span></div>
                Lettura del cielo in corso…
              </div>
            : <div style={{ textAlign: "center", padding: "50px 20px", color: TXT2 }}><div style={{ marginBottom: 10, display: "flex", justifyContent: "center" }}><NavIcon name="locate" size={44} color={TXT2} sw={1.6} /></div>Nessun post in questo raggio. Allarga il radar!</div>)
        : visible.map(p => <PostCard key={p.id} post={p} onStar={onStar} onChat={onChat} onOpenUser={onOpenUser} isFollowing={following?.includes(p.user)} onFollow={onFollow} onReport={onReport} reported={reported?.includes(p.id)} onView={onView} onOpenPhoto={onOpenPhoto} canDelete={p.mine || isAdmin} onDelete={onDelete} onEdit={onEdit} />)}
    </div>
  );
}

// ─── BEECAST (previsione collaborativa 12h) ───────────────────────────────────
function BeeCastScreen({ km, wxHours, wxSea, wxSky, sense, onArmAlert, onDisarmAlert, alertArmed }) {
  const S = sense || { text: "In ascolto del cielo…", conf: "In attesa di foto", photos: 0, why: `Nessuna foto della community nelle ultime 3 ore entro ${km} km. Appena qualcuno pubblica, BeeCast confronta le osservazioni reali con i modelli e corregge la previsione.` };
  const AL = sense
    ? (sense.alert || { icon: "🌤️", title: "Nessun maltempo osservato in avvicinamento", dir: "osservazioni nel raggio", photos: sense.photos, speed: null, conf: sense.conf.replace("Affidabilità ", "") })
    : { icon: "🐝", title: "Allerte di prossimità", dir: "si attivano con le foto della community", photos: 0, speed: null, conf: "—" };
  const [alertOn, setAlertOn] = useState(!!alertArmed);
  useEffect(() => { setAlertOn(!!alertArmed); }, [alertArmed]);
  const [toast, setToast] = useState(false);
  const armAlert = () => {
    if (alertOn) { if (onDisarmAlert) onDisarmAlert(); setAlertOn(false); return; }   // secondo tocco: spegne
    if (onArmAlert) onArmAlert();
    setAlertOn(true); setToast(true);
    setTimeout(() => setToast(false), 4200);
  };
  const SEA = { state: "Poco mosso", trend: "in aumento verso mosso in serata", photos: 7, wave: "0,5–1 m", scale: 2 };
  const WaveIcon = () => {
    const p = { stroke: HBLUE, strokeWidth: 1.7, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" };
    return (
      <svg width="30" height="30" viewBox="0 0 24 24" style={{ display: "block" }}>
        <path d="M2 9c1.6 0 1.6-1.6 3.2-1.6S6.8 9 8.4 9 10 7.4 11.6 7.4 13.2 9 14.8 9s1.6-1.6 3.2-1.6S19.6 9 22 9" {...p} />
        <path d="M2 14c1.6 0 1.6-1.6 3.2-1.6S6.8 14 8.4 14 10 12.4 11.6 12.4 13.2 14 14.8 14s1.6-1.6 3.2-1.6S19.6 14 22 14" {...p} />
        <path d="M2 19c1.6 0 1.6-1.6 3.2-1.6S6.8 19 8.4 19 10 17.4 11.6 17.4 13.2 19 14.8 19s1.6-1.6 3.2-1.6S19.6 19 22 19" {...p} />
      </svg>
    );
  };
  // effemeridi simulate (nel backend: calcolate da lat/lon e data, es. libreria SunCalc)
  const SkyIcon = ({ kind }) => {
    const p = { stroke: HBLUE, strokeWidth: 1.6, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" };
    if (kind === "sunrise" || kind === "sunset")
      return (
        <svg width="30" height="30" viewBox="0 0 24 24" style={{ display: "block", margin: "0 auto" }}>
          <path d="M6 15a6 6 0 0112 0" {...p} />
          <line x1="2" y1="19" x2="22" y2="19" {...p} />
          {[[12, 4.5, 12, 7.5], [4.8, 8.2, 6.6, 9.6], [19.2, 8.2, 17.4, 9.6]].map((l, i) => <line key={i} x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]} {...p} />)}
          {kind === "sunrise"
            ? <polyline points="9.5,12 12,9.5 14.5,12" {...p} />
            : <polyline points="9.5,10 12,12.5 14.5,10" {...p} />}
        </svg>
      );
    // luna (sorgere/calare): mezzaluna + freccia su/giù
    return (
      <svg width="30" height="30" viewBox="0 0 24 24" style={{ display: "block", margin: "0 auto" }}>
        <path d="M15.5 14.5A6 6 0 018.2 5.6a6.5 6.5 0 107.3 8.9z" {...p} />
        {kind === "moonrise"
          ? <polyline points="18.5,10 20.5,7.5 22.5,10" {...p} />
          : <polyline points="18.5,7.5 20.5,10 22.5,7.5" {...p} />}
      </svg>
    );
  };
  const SKY = wxSky ? [
    { kind: "sunrise", label: "Alba", time: wxSky.sunrise || "—" },
    { kind: "sunset", label: "Tramonto", time: wxSky.sunset || "—" },
    { kind: "moon", label: wxSky.moon?.l || "Luna", time: wxSky.moon?.e || "🌙" },
  ] : [
    { kind: "sunrise", label: "Alba", time: "05:42" },
    { kind: "sunset", label: "Tramonto", time: "20:31" },
    { kind: "moon", label: "Luna", time: "🌙" },
  ];
  const HOURS = [
    { h: "Ora", e: "☀️", t: 24 }, { h: "+1h", e: "☀️", t: 24 }, { h: "+2h", e: "🌤️", t: 23 },
    { h: "+3h", e: "⛅", t: 22 }, { h: "+4h", e: "⛅", t: 22 }, { h: "+5h", e: "☁️", t: 21 },
    { h: "+6h", e: "☁️", t: 21 }, { h: "+8h", e: "🌧️", t: 19 }, { h: "+10h", e: "🌧️", t: 18 }, { h: "+12h", e: "⛅", t: 18 },
  ];
  return (
    <div className="scr" style={{ flex: 1, overflowY: "auto", background: BODY, padding: 16 }}>
      {/* riquadro principale */}
      <div style={{ background: `linear-gradient(160deg,${PANEL_A},${PANEL_B})`, color: "#fff", borderRadius: 16, padding: "16px 16px 14px", boxShadow: `0 4px 16px ${HBLUE}26` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <NavIcon name="beecast" size={20} color="#fff" sw={2} />
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18 }}>BeeCast</span>
          <span style={{ marginLeft: "auto", fontSize: 11, background: "rgba(255,255,255,.2)", borderRadius: 12, padding: "3px 10px", fontWeight: 600 }}>{S.conf}</span>
        </div>
        <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.3 }}>{S.text}</div>
        <div style={{ fontSize: 12, opacity: .92, marginTop: 6, lineHeight: 1.5 }}>{S.why}</div>
      </div>

      {/* allerta di prossimità (dalle foto della community) */}
      <div style={{ marginTop: 12, background: "#fff", borderRadius: 14, border: `1.5px solid ${ACCENT}`, boxShadow: `0 2px 10px ${HBLUE}0D`, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "12px 14px", background: ACCENT + "1F" }}>
          <span style={{ fontSize: 26, lineHeight: 1 }}>{AL.icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14.5, color: "#8A5A12" }}>{AL.title}</div>
            <div style={{ fontSize: 12, color: "#9A6B25", marginTop: 1 }}>{AL.dir}{AL.photos ? ` · ${AL.photos} foto` : ""}{AL.conf !== "—" ? ` · affidabilità ${AL.conf}` : ""}</div>
          </div>
        </div>
        <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1, fontSize: 11.5, color: TXT2, lineHeight: 1.4 }}>{AL.speed ? `Fenomeno in avvicinamento a ~${AL.speed} km/h. ` : ""}Vuoi essere avvisato quando BeeCast rileva maltempo vicino a te?</div>
          <button onClick={armAlert} style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 20, border: "none", background: alertOn ? "#3BA776" : `linear-gradient(135deg,${HBLUE},#1B4E96)`, color: "#fff", fontWeight: 600, fontSize: 12.5, cursor: "pointer", fontFamily: "'Sora',sans-serif" }}>
            <NavIcon name={alertOn ? "check" : "bell"} size={15} color="#fff" sw={2} />{alertOn ? "Allerte attive" : "Avvisami"}
          </button>
        </div>
      </div>

      {/* toast: simulazione notifica push in arrivo */}
      {toast && (
        <div className="fade-up" style={{ position: "fixed", left: 12, right: 12, margin: "0 auto", bottom: 96, zIndex: 90, maxWidth: 360, background: "#1E2A3A", color: "#fff", borderRadius: 14, padding: "12px 14px", boxShadow: "0 8px 26px rgba(0,0,0,.35)", display: "flex", alignItems: "center", gap: 11 }}>
          <span style={{ fontSize: 22 }}>{AL.icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700 }}>Beeweat · Allerta meteo</div>
            <div style={{ fontSize: 12, opacity: .9, marginTop: 1 }}>{AL.title} {AL.dir} — {AL.photos} foto</div>
          </div>
        </div>
      )}

      {/* prossime 12 ore */}
      <div style={{ fontSize: 11, fontWeight: 700, color: TXT2, textTransform: "uppercase", letterSpacing: ".06em", margin: "16px 2px 8px" }}>Prossime 12 ore</div>
      <div style={{ background: "#fff", borderRadius: 14, padding: "12px 6px", boxShadow: `0 2px 10px ${HBLUE}0D`, display: "flex", overflowX: "auto", gap: 2 }}>
        {(wxHours || HOURS).map((x, i) => (
          <div key={i} style={{ minWidth: 52, textAlign: "center", padding: "4px 2px" }}>
            <div style={{ fontSize: 11, color: TXT2, fontWeight: 600 }}>{x.h}</div>
            <div style={{ fontSize: 22, margin: "4px 0" }}>{x.e}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: TXT, fontFamily: "'Space Grotesk',sans-serif" }}>{x.t}°</div>
          </div>
        ))}
      </div>

      {/* sole e luna */}
      <div style={{ fontSize: 11, fontWeight: 700, color: TXT2, textTransform: "uppercase", letterSpacing: ".06em", margin: "16px 2px 8px" }}>Sole e luna</div>
      <div style={{ background: "#fff", borderRadius: 14, padding: "12px 8px", boxShadow: `0 2px 10px ${HBLUE}0D`, display: "flex" }}>
        {SKY.map((s, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center", borderRight: i < SKY.length - 1 ? `1px solid ${LINE}` : "none" }}>
            {s.kind === "moon" ? <div style={{ fontSize: 26, lineHeight: "30px" }}>{s.time}</div> : <SkyIcon kind={s.kind} />}
            <div style={{ fontSize: 15, fontWeight: 700, color: HBLUE, fontFamily: "'Space Grotesk',sans-serif", marginTop: 3 }}>{s.kind === "moon" ? "" : s.time}</div>
            <div style={{ fontSize: 10.5, color: TXT2, marginTop: 1 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* stato del mare */}
      <div style={{ fontSize: 11, fontWeight: 700, color: TXT2, textTransform: "uppercase", letterSpacing: ".06em", margin: "16px 2px 8px" }}>Stato del mare</div>
      <div style={{ background: "#fff", borderRadius: 14, padding: "13px 14px", boxShadow: `0 2px 10px ${HBLUE}0D` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <WaveIcon />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: TXT }}>{(wxSea || SEA).state}</div>
            <div style={{ fontSize: 12.5, color: TXT2, marginTop: 1 }}>
              {wxSea
                ? <>Onda {wxSea.wave} da {wxSea.dir}{wxSea.period ? ` · periodo ${wxSea.period}` : ""}{wxSea.sst ? ` · mare ${wxSea.sst}` : ""}</>
                : <>Onda {SEA.wave} · {SEA.trend}</>}
            </div>
          </div>
          <div style={{ textAlign: "right", fontSize: 11, color: TXT2 }}>{wxSea ? <>modello<br />Copernicus</> : <>{SEA.photos} foto<br />della costa</>}</div>
        </div>
        {/* scala Douglas semplificata */}
        <div style={{ display: "flex", gap: 4, marginTop: 10 }}>
          {["Calmo", "Poco mosso", "Mosso", "Molto mosso", "Agitato"].map((s, i) => (
            <div key={s} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ height: 6, borderRadius: 4, background: i <= (wxSea || SEA).scale - 1 ? HBLUE : LINE }} />
              <div style={{ fontSize: 8.5, color: i === (wxSea || SEA).scale - 1 ? HBLUE : TXT2, fontWeight: i === (wxSea || SEA).scale - 1 ? 700 : 500, marginTop: 3 }}>{s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* come funziona */}
      <div style={{ fontSize: 11, fontWeight: 700, color: TXT2, textTransform: "uppercase", letterSpacing: ".06em", margin: "16px 2px 8px" }}>Come funziona</div>
      <div style={{ background: "#fff", borderRadius: 14, padding: "13px 14px", boxShadow: `0 2px 10px ${HBLUE}0D`, fontSize: 13, color: TXT, lineHeight: 1.55 }}>
        BeeCast analizza le <b>foto della community</b> entro <b>{km} km</b> ({S.photos} nelle ultime ore), riconosce le condizioni reali — incluso lo <b>stato del mare</b> nelle foto della costa — e la loro direzione di spostamento, e le incrocia con i <b>modelli meteo e marini</b> per correggere la previsione delle prossime 12 ore.
        <div style={{ fontSize: 11.5, color: TXT2, marginTop: 8 }}>Stima collaborativa indicativa, non è un'allerta ufficiale. Più foto ci sono, più è accurata.</div>
      </div>
    </div>
  );
}

// ─── VICINI (mappa radar) ───────────────────────────────────────────────────
function ViciniScreen({ posts, events, km, onChat, onEvent, onOpenUser, following, onFollow }) {
  const [sel, setSel] = useState(null);
  const [vb, setVb] = useState({ x: 0, y: 0, w: 320, h: 320 });
  const svgRef = useRef(null);
  const selRef = useRef(null);
  const vbRef = useRef(vb); vbRef.current = vb;
  const gest = useRef(null);
  const MINW = 90, MAXW = 320, PAN_THRESHOLD = 8;
  const zoomed = Math.round(vb.w) !== 320;

  useEffect(() => { if (sel) selRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [sel]);

  useEffect(() => {
    const el = svgRef.current; if (!el) return;
    const dist = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    const toSvg = (cx, cy, base) => { const r = el.getBoundingClientRect(); return { x: base.x + (cx - r.left) / r.width * base.w, y: base.y + (cy - r.top) / r.height * base.h }; };
    const clampW = w => Math.min(MAXW, Math.max(MINW, w));
    const onStart = e => {
      if (e.touches.length === 2) {
        const m = { cx: (e.touches[0].clientX + e.touches[1].clientX) / 2, cy: (e.touches[0].clientY + e.touches[1].clientY) / 2 };
        gest.current = { mode: "pinch", startVB: { ...vbRef.current }, startDist: dist(e.touches), mid: toSvg(m.cx, m.cy, vbRef.current) };
      } else if (e.touches.length === 1 && Math.round(vbRef.current.w) !== 320) {
        // pan possibile solo se già zoomato; parte solo dopo una soglia di movimento
        gest.current = { mode: "pan", startVB: { ...vbRef.current }, sx: e.touches[0].clientX, sy: e.touches[0].clientY, active: false };
      } else {
        gest.current = null; // vista intera: lascia passare il tap sui cerchi
      }
    };
    const onMove = e => {
      const g = gest.current; if (!g) return;
      const r = el.getBoundingClientRect();
      if (g.mode === "pinch" && e.touches.length === 2) {
        e.preventDefault();
        const s = dist(e.touches) / g.startDist;
        const newW = clampW(g.startVB.w / s), k = newW / g.startVB.w;
        setVb({ x: g.mid.x - (g.mid.x - g.startVB.x) * k, y: g.mid.y - (g.mid.y - g.startVB.y) * k, w: newW, h: newW });
      } else if (g.mode === "pan" && e.touches.length === 1) {
        const ddx = e.touches[0].clientX - g.sx, ddy = e.touches[0].clientY - g.sy;
        if (!g.active && Math.hypot(ddx, ddy) < PAN_THRESHOLD) return; // sotto soglia: non è un trascinamento → consenti il tap
        g.active = true;
        e.preventDefault();
        const dx = ddx / r.width * g.startVB.w, dy = ddy / r.height * g.startVB.h;
        setVb({ x: g.startVB.x - dx, y: g.startVB.y - dy, w: g.startVB.w, h: g.startVB.h });
      }
    };
    const onEnd = e => { gest.current = (e.touches.length === 1 && Math.round(vbRef.current.w) !== 320) ? { mode: "pan", startVB: { ...vbRef.current }, sx: e.touches[0].clientX, sy: e.touches[0].clientY, active: false } : null; };
    const onWheel = e => {
      e.preventDefault();
      const r = el.getBoundingClientRect(), b = vbRef.current;
      const M = { x: b.x + (e.clientX - r.left) / r.width * b.w, y: b.y + (e.clientY - r.top) / r.height * b.h };
      const newW = clampW(b.w * (e.deltaY < 0 ? 0.9 : 1.1)), k = newW / b.w;
      setVb({ x: M.x - (M.x - b.x) * k, y: M.y - (M.y - b.y) * k, w: newW, h: newW });
    };
    el.addEventListener("touchstart", onStart, { passive: false });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd);
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => { el.removeEventListener("touchstart", onStart); el.removeEventListener("touchmove", onMove); el.removeEventListener("touchend", onEnd); el.removeEventListener("wheel", onWheel); };
  }, []);

  const EMERG = /🌧|⛈|❄|🌨|🌫|🌬/;
  const visible = posts.filter(p => p.dist <= km && EMERG.test(p.cond || ""));   // sul radar solo il maltempo (+ eventi)
  const evVisible = (events || []).filter(e => e.dist <= km);
  const R = 150, cx = 160, cy = 160;
  const bearingOf = e => (e.bearing != null ? e.bearing : (Math.atan2((e.lng || 0) - BASE_COORDS.lng, (e.lat || 0) - BASE_COORDS.lat) * 180 / Math.PI));
  return (
    <div className="scr" style={{ flex: 1, overflowY: "auto", background: BODY, padding: 16 }}>
      <div style={{ fontSize: 12, color: TXT2, marginBottom: 12, fontWeight: 500 }}>{visible.length} post · {evVisible.length} eventi entro {km} km</div>
      <div style={{ position: "relative", background: `radial-gradient(circle at center, #DCEBF7, #C2DCF0)`, borderRadius: 18, padding: 10, border: `2px solid ${HBLUE}33`, boxShadow: `0 2px 12px ${HBLUE}18`, overflow: "hidden" }}>
        <svg ref={svgRef} viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} style={{ width: "100%", display: "block", touchAction: "none", cursor: zoomed ? "grab" : "default" }}>
          {[0.33, 0.66, 1].map((f, i) => <circle key={i} cx={cx} cy={cy} r={R * f} fill="none" stroke={HBLUE + "33"} strokeWidth="1.5" />)}
          <line x1={cx} y1={cy - R} x2={cx} y2={cy + R} stroke={HBLUE + "22"} strokeWidth="1" />
          <line x1={cx - R} y1={cy} x2={cx + R} y2={cy} stroke={HBLUE + "22"} strokeWidth="1" />
          {[0.33, 0.66, 1].map((f, i) => <text key={i} x={cx + 4} y={cy - R * f + 14} fill={HBLUE + "99"} fontSize="11" fontFamily="Space Grotesk">{Math.round(km * f)}km</text>)}
          {/* user center */}
          <circle cx={cx} cy={cy} r="18" fill={ACCENT} opacity="0.3"><animate attributeName="r" values="10;26" dur="2s" repeatCount="indefinite" /><animate attributeName="opacity" values="0.5;0" dur="2s" repeatCount="indefinite" /></circle>
          <circle cx={cx} cy={cy} r="7" fill={ACCENT} stroke="#fff" strokeWidth="2.5" />
          {/* posts */}
          {visible.map(p => {
            const a = (p.bearing - 90) * Math.PI / 180, r = (p.dist / km) * R;
            const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
            return (
              <g key={p.id} onClick={() => setSel(p)} style={{ cursor: "pointer" }}>
                <circle cx={x} cy={y} r="16" fill="#fff" stroke={HBLUE} strokeWidth="2" />
                <text x={x} y={y + 5} fontSize="15" textAnchor="middle" style={{ pointerEvents: "none" }}>{p.cond.split(" ")[0]}</text>
              </g>
            );
          })}
          {/* eventi: cerchio rosso con piccolo filo radiale sulla circonferenza */}
          {evVisible.map(e => {
            const a = (bearingOf(e) - 90) * Math.PI / 180, r = (e.dist / km) * R;
            const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
            const ux = Math.cos(a), uy = Math.sin(a), rc = 12;
            return (
              <g key={"ev" + e.id} onClick={() => onEvent && onEvent(e)} style={{ cursor: "pointer" }}>
                <circle cx={x} cy={y} r={rc} fill="#fff" stroke="#E5484D" strokeWidth="2.5" />
                <line x1={x + ux * rc} y1={y + uy * rc} x2={x + ux * (rc + 8)} y2={y + uy * (rc + 8)} stroke="#E5484D" strokeWidth="2.5" strokeLinecap="round" style={{ pointerEvents: "none" }} />
                <text x={x} y={y + 5} fontSize="13" textAnchor="middle" style={{ pointerEvents: "none" }}>{e.type || (e.cat ? e.cat.split(" ")[0] : "📍")}</text>
              </g>
            );
          })}
        </svg>
        {zoomed && <button onClick={() => setVb({ x: 0, y: 0, w: 320, h: 320 })} style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,.92)", border: `1px solid ${LINE}`, borderRadius: 10, padding: "6px 10px", fontSize: 12, fontWeight: 600, color: HBLUE, cursor: "pointer", fontFamily: "'Sora',sans-serif", boxShadow: "0 2px 8px rgba(0,0,0,.12)" }}>Reimposta</button>}
      </div>
      {/* legenda */}
      <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 10, fontSize: 11, color: TXT2 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ width: 12, height: 12, borderRadius: "50%", border: `2px solid ${HBLUE}`, background: "#fff", display: "inline-block" }} /> Maltempo</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid #E5484D", background: "#fff", display: "inline-block" }} /> Eventi</span>
      </div>
      <div style={{ textAlign: "center", color: TXT2, fontSize: 11, marginTop: 6 }}>Pizzica per zoomare · trascina per spostarti</div>
      {sel
        ? <div ref={selRef} className="fade-up" style={{ marginTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 6 }}>
              <button onClick={() => setSel(null)} style={{ background: "none", border: "none", color: TXT2, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Sora',sans-serif", display: "flex", alignItems: "center", gap: 4 }}><NavIcon name="close" size={13} color={TXT2} sw={2.2} /> Chiudi</button>
            </div>
            <PostCard post={sel} onStar={() => {}} onChat={onChat} onOpenUser={onOpenUser} isFollowing={following?.includes(sel.user)} onFollow={onFollow} />
          </div>
        : <div style={{ textAlign: "center", color: TXT2, fontSize: 13, marginTop: 10 }}>Radar delle emergenze: 🔵 maltempo · 🔴 eventi. Nessun segnale = tutto tranquillo nel raggio. 🌤️</div>}
    </div>
  );
}

// ─── EVENTI ─────────────────────────────────────────────────────────────────
function EventiScreen({ events, km, onOpen, userName, myUid, isAdmin, onEditEnds }) {
  const sevColor = { Alta: "#E5484D", Media: "#EFA23C", Bassa: "#3BA776" };
  const today = new Date().toISOString().slice(0, 10);
  const [fCity, setFCity] = useState("Luogo");
  const [fUser, setFUser] = useState("Ape");
  const [fCat, setFCat] = useState("Evento");
  const [evKm, setEvKm] = useState(km);
  const [inf, setInf] = useState(false);
  const alive = events.filter(e => !e.ends || e.ends >= today);
  const cities = ["Luogo", ...new Set(alive.map(e => e.place).filter(Boolean))];
  const users = ["Ape", ...new Set(alive.map(e => e.user).filter(Boolean))];
  const cats = ["Evento", ...new Set(alive.map(e => e.cat).filter(Boolean))];
  const visible = alive.filter(e =>
    (inf || e.dist <= evKm) &&
    (fCity === "Luogo" || e.place === fCity) &&
    (fUser === "Ape" || e.user === fUser) &&
    (fCat === "Evento" || e.cat === fCat));
  const FSel = ({ v, set, opts }) => (
    <select value={v} onChange={e => set(e.target.value)} style={{ flex: 1, minWidth: 0, background: "#fff", border: `1.5px solid ${LINE}`, borderRadius: 10, padding: "8px 8px", fontSize: 12.5, color: TXT, outline: "none", fontFamily: "'Sora',sans-serif" }}>
      {opts.map(o => <option key={o}>{o}</option>)}
    </select>
  );
  const avaOf = name => (PEOPLE.find(p => p.name === name) || {}).ava || null;
  return (
    <div className="scr" style={{ flex: 1, overflowY: "auto", background: BODY, padding: "14px 14px" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <FSel v={fCity} set={setFCity} opts={cities} />
        <FSel v={fUser} set={setFUser} opts={users} />
        <FSel v={fCat} set={setFCat} opts={cats} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", border: `1.5px solid ${LINE}`, borderRadius: 12, padding: "9px 12px", marginBottom: 12 }}>
        <input type="range" min={1} max={100} value={evKm} disabled={inf} onChange={e => setEvKm(+e.target.value)} style={{ flex: 1, accentColor: ACCENT, opacity: inf ? .35 : 1 }} />
        <span style={{ fontSize: 12.5, fontWeight: 700, color: inf ? TXT2 : HBLUE, minWidth: 56, textAlign: "right" }}>{inf ? "mondo" : evKm + " km"}</span>
        <WorldBtn on={inf} onClick={() => setInf(v => !v)} h={32} />
      </div>
      <div style={{ fontSize: 12, color: TXT2, marginBottom: 12, fontWeight: 500 }}>{visible.length} eventi {inf ? "in tutto il mondo" : "segnalati nella zona"}</div>
      {visible.map(e => (
        <div key={e.id} className="fade-up" onClick={() => onOpen(e)} style={{ background: "#fff", borderRadius: 14, padding: 14, marginBottom: 12, boxShadow: `0 2px 10px ${HBLUE}0D`, borderLeft: `5px solid ${sevColor[e.sev]}`, cursor: "pointer" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ fontSize: 34 }}>{e.type || (e.cat ? e.cat.split(" ")[0] : "📍")}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 15, color: TXT }}>{e.title}</div>
              {e.cat && <span style={{ display: "inline-block", marginTop: 4, fontSize: 11, fontWeight: 600, color: HBLUE, background: HBLUE + "12", borderRadius: 8, padding: "2px 8px" }}>{e.cat}</span>}
              <div style={{ fontSize: 12, color: TXT2, marginTop: 2 }}>{e.time}{e.ends ? ` · fino al ${e.ends.split("-").reverse().join("/")}` : ""}</div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: sevColor[e.sev], background: sevColor[e.sev] + "1A", borderRadius: 8, padding: "4px 9px" }}>{e.sev}</span>
            {(isAdmin || e.user === userName || (myUid && e.uid === myUid)) && <button onClick={ev => { ev.stopPropagation(); onEditEnds(e); }} title="Modifica evento" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}><NavIcon name="edit" size={17} color={HBLUE} sw={1.9} /></button>}
          </div>
          {/* terzo rigo: localizzazione (tocca per la mappa) */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, padding: "9px 10px", background: HBLUE + "0E", borderRadius: 10 }}>
            <NavIcon name="pin" size={16} color={HBLUE} sw={2} />
            <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: HBLUE }}>{e.place}</span>
            <span style={{ fontSize: 11, color: HBLUE, fontWeight: 600 }}>Vedi sulla mappa</span>
            <NavIcon name="back" size={14} color={HBLUE} sw={2.4} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${LINE}` }}>
            <UserAvatar src={e.ava || avaOf(e.user)} size={28} />
            <span style={{ fontSize: 12, color: TXT2 }}>Segnalato da</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: HBLUE }}>{e.user}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── CONTATTI ──────────────────────────────────────────────────────────────
function ContattiScreen({ contacts, groups, km, onChat, onOpenGroup, onOpenPlace, onOpenPlaceEvents, people, favs, toggleFav, nearPlaces, onOpenUser, onOpenSelf, worldOn, onToggleWorld, worldPlaces, contactDist, isAdminG, onEditGroup }) {
  const [q, setQ] = useState("");
  const [sub, setSub] = useState("contatti"); // "contatti" | "preferiti"
  const ql = q.trim().toLowerCase();
  const inf = !!worldOn;
  const inRange = c => c.me || inf || (contactDist && contactDist[c.id] !== undefined && contactDist[c.id] <= km);
  const list = contacts.filter(inRange)
    .filter(c => !ql || c.name.toLowerCase().includes(ql) || c.city.toLowerCase().includes(ql))
    .slice().sort((a, b) => (b.me ? 1 : 0) - (a.me ? 1 : 0) || a.name.localeCompare(b.name, "it"));
  const places = (inf ? (worldPlaces || []) : (nearPlaces || []).filter(p => p.dist <= km))
    .slice().sort((a, b) => inf ? a.name.localeCompare(b.name, "it") : a.dist - b.dist);
  const fmt = d => (d % 1 === 0 ? String(d) : String(d).replace(".", ",")) + " km";
  const favList = (people || []).filter(p => favs?.includes(p.id));
  const FavRow = ({ p }) => {
    const on = favs.includes(p.id);
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderBottom: `1px solid ${LINE}` }}>
        <UserAvatar src={p.ava} size={50} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: HBLUE }}>{p.name}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: TXT2 }}><NavIcon name="pin" size={13} color={TXT2} /> {p.city}</div>
        </div>
        <button onClick={() => toggleFav(p.id)} style={{ background: "none", border: "none", cursor: "pointer" }}><NavIcon name={on ? "starFill" : "star"} size={26} color={on ? STAR : TXT2} /></button>
      </div>
    );
  };
  return (
    <div className="scr" style={{ flex: 1, overflowY: "auto", background: "#fff" }}>
      {/* schede: Contatti | Preferiti */}
      <div style={{ display: "flex", gap: 22, padding: "12px 16px 0", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
        {[["contatti", "Contatti"], ["preferiti", "Preferiti"], ["gruppi", "Gruppi"]].map(([id, label]) => (
          <button key={id} onClick={() => setSub(id)} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 0 8px", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 16, color: sub === id ? HBLUE : TXT2, borderBottom: `3px solid ${sub === id ? ACCENT : "transparent"}` }}>{label}</button>
        ))}
      </div>

      {sub === "preferiti" ? (
        <>
          <div style={{ padding: "14px 16px 8px", fontSize: 12, fontWeight: 600, color: TXT2, textTransform: "uppercase", letterSpacing: ".06em" }}>I tuoi preferiti ({favList.length})</div>
          {favList.length === 0 ? <div style={{ padding: "20px 16px", color: TXT2, fontSize: 14 }}>Nessun preferito ancora — aggiungili dalla lista sotto ⭐</div> : favList.map(p => <FavRow key={p.id} p={p} />)}
          <div style={{ padding: "18px 16px 8px", fontSize: 12, fontWeight: 600, color: TXT2, textTransform: "uppercase", letterSpacing: ".06em" }}>Tutti gli utenti</div>
          {(people || []).map(p => <FavRow key={p.id} p={p} />)}
        </>
      ) : sub === "gruppi" ? (
        <>
          <div style={{ padding: "14px 16px 8px", fontSize: 12, fontWeight: 600, color: TXT2, textTransform: "uppercase", letterSpacing: ".06em" }}>I tuoi gruppi ({(groups || []).length})</div>
          {(!groups || groups.length === 0)
            ? <div style={{ padding: "26px 16px", color: TXT2, fontSize: 14, textAlign: "center" }}>Nessun gruppo ancora.<br />Creane uno con l'icona 👥+ in alto!</div>
            : groups.map(g => (
              <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 16px", borderBottom: `1px solid ${LINE}` }}>
                {(isAdminG || g.mine) && <button onClick={() => onEditGroup(g)} title="Modifica gruppo" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex", flexShrink: 0 }}><NavIcon name="edit" size={16} color={HBLUE} sw={1.9} /></button>}
                <div onClick={() => onOpenGroup(g)} style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, cursor: "pointer", minWidth: 0 }}>
                <div style={{ width: 50, height: 50, borderRadius: "50%", background: HBLUE + "15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><NavIcon name="groups" size={26} color={HBLUE} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: HBLUE, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.name}</div>
                  <div style={{ fontSize: 12.5, color: TXT2, marginTop: 1 }}>{g.members.length} membri · {g.members.slice(0, 3).map(id => ((contacts || []).find(c => c.id === id) || {}).name || "").filter(Boolean).join(", ")}{g.members.length > 3 ? "…" : ""}</div>
                </div>
                <NavIcon name="chevron" size={18} color={TXT2} sw={2} />
              </div>
              </div>
            ))}
        </>
      ) : (
        <>
      {/* campo cerca contatti */}
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${LINE}`, position: "sticky", top: 0, zIndex: 30, background: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: BODY, borderRadius: 12, padding: "9px 12px" }}>
          <NavIcon name="search" size={17} color={TXT2} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder={inf ? "Cerca in tutto il mondo…" : "Cerca tra i contatti…"} style={{ flex: 1, border: "none", outline: "none", background: "none", fontSize: 14, color: TXT, fontFamily: "'Sora',sans-serif" }} />
          {q && <button onClick={() => setQ("")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0 }}><NavIcon name="close" size={15} color={TXT2} sw={2.2} /></button>}
          <WorldBtn on={inf} onClick={onToggleWorld} h={30} />
        </div>
      </div>

      {/* luoghi vicini (chat pubbliche + eventi per luogo, in base al raggio) */}
      {!ql && (places.length > 0 || inf) && (
        <div>
          <div style={{ padding: "12px 16px 6px", fontSize: 11, fontWeight: 700, color: TXT2, textTransform: "uppercase", letterSpacing: ".06em" }}>{inf ? "Luoghi · tutto il mondo" : "Luoghi vicini"}</div>
          {places.map(p => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", borderBottom: `1px solid ${LINE}` }}>
              <button onClick={() => onOpenPlace(p)} style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 12, padding: "12px 8px 12px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 18, color: HBLUE, lineHeight: 1.1 }}>{p.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, color: HBLUE, fontSize: 15, marginTop: 3 }}><NavIcon name="pin" size={15} color={HBLUE} sw={2} /> {fmt(p.dist)} <span style={{ color: TXT2, fontSize: 12 }}>da te</span></div>
                  <div style={{ fontSize: 12.5, color: TXT2, marginTop: 2 }}>{p.photos ?? 0} post · {p.events ?? 0} eventi · {p.users?.length ?? 0} utenti</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: HBLUE, minWidth: 60, justifyContent: "flex-end" }}>
                  <WIcon name="chat" size={21} color={HBLUE} sw={1.9} />
                </div>
              </button>
              <button onClick={() => onOpenPlaceEvents(p)} style={{ display: "flex", alignItems: "center", gap: 6, color: HBLUE, padding: "12px 16px 12px 10px", background: "none", border: "none", cursor: "pointer" }}>
                <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 17 }}>{p.events}</span><NavIcon name="eventi" size={18} color={HBLUE} sw={1.8} />
              </button>
            </div>
          ))}
        </div>
      )}

      {!ql && <div style={{ padding: "12px 16px 6px", fontSize: 11, fontWeight: 700, color: TXT2, textTransform: "uppercase", letterSpacing: ".06em" }}>Contatti</div>}
      {list.length === 0
        ? <div style={{ textAlign: "center", color: TXT2, padding: "36px 20px", fontSize: 14 }}>Nessun contatto trovato.</div>
        : list.map(c => (
          <div key={c.id} onClick={() => c.me ? (onOpenSelf && onOpenSelf()) : (onOpenUser && onOpenUser(c))} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 16px", borderBottom: `1px solid ${LINE}`, cursor: "pointer", background: c.me ? HBLUE + "08" : "transparent" }}>
            <UserAvatar src={c.ava} size={56} />
            <div style={{ flex: 1, fontSize: 19, color: HBLUE, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>{c.name}{c.me && <span style={{ fontSize: 13.5, color: TXT2, fontWeight: 500 }}>(tu)</span>} <NavIcon name="pin" size={16} color={HBLUE} /> <span>{titleCase(c.city)}</span></div>
            {!c.me && <button onClick={e => { e.stopPropagation(); onChat(c); }} title="Chat" style={{ width: 38, height: 38, borderRadius: "50%", background: HBLUE, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><WIcon name="chat" size={19} color="#fff" sw={2} /></button>}
            {c.me && <NavIcon name="chevron" size={18} color={TXT2} sw={2.2} />}
          </div>
        ))}
      </>
      )}
    </div>
  );
}

// ─── CREA GRUPPO ──────────────────────────────────────────────────────────────
function CreateGroupModal({ contacts, onCreate, onClose }) {
  const [name, setName] = useState("");
  const [sel, setSel] = useState([]);
  const toggle = id => setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const submit = () => { if (!name.trim() || sel.length === 0) return; onCreate({ name: name.trim(), members: sel }); };
  return (
    <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(20,40,65,.5)", display: "flex", alignItems: "flex-end", zIndex: 50 }}>
      <div onClick={e => e.stopPropagation()} className="fade-up" style={{ width: "100%", background: "#fff", borderRadius: "20px 20px 0 0", padding: "20px 16px 24px", maxHeight: "78%", display: "flex", flexDirection: "column" }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: TXT, marginBottom: 14 }}>Nuovo gruppo</div>
        <input placeholder="Nome del gruppo" value={name} onChange={e => setName(e.target.value)} style={{ background: BODY, border: `1.5px solid ${LINE}`, borderRadius: 12, padding: "12px 14px", fontSize: 14, color: TXT, outline: "none", marginBottom: 14 }} />
        <div style={{ fontSize: 11, fontWeight: 600, color: TXT2, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Seleziona i membri ({sel.length}) · tu sei incluso automaticamente</div>
        <div style={{ flex: 1, overflowY: "auto", marginBottom: 14 }}>
          {contacts.filter(c => !c.me).length === 0 ? <div style={{ color: TXT2, fontSize: 14, padding: "10px 0" }}>Servono altri utenti registrati per formare un gruppo.</div> : contacts.filter(c => !c.me).map(c => {
            const on = sel.includes(c.id);
            return (
              <div key={c.id} onClick={() => toggle(c.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 4px", cursor: "pointer", borderBottom: `1px solid ${LINE}` }}>
                <UserAvatar src={c.ava} size={42} />
                <div style={{ flex: 1 }}><div style={{ fontWeight: 600, color: HBLUE }}>{c.name}</div><div style={{ fontSize: 12, color: TXT2 }}>{c.city}</div></div>
                <div style={{ width: 24, height: 24, borderRadius: 7, border: `2px solid ${on ? HBLUE : LINE}`, background: on ? HBLUE : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>{on && <NavIcon name="check" size={14} color="#fff" sw={3} />}</div>
              </div>
            );
          })}
        </div>
        <button onClick={submit} disabled={!name.trim() || sel.length === 0} style={{ padding: 14, borderRadius: 12, border: "none", background: `linear-gradient(135deg,${HBLUE},#1B4E96)`, color: "#fff", fontWeight: 600, cursor: "pointer", fontFamily: "'Sora',sans-serif", opacity: (!name.trim() || sel.length === 0) ? .5 : 1 }}>Crea gruppo</button>
      </div>
    </div>
  );
}

// ─── CHAT 1-A-1 ───────────────────────────────────────────────────────────────
function ChatView({ contact, msgs, onSend, onBack, group, contacts, onUpdateGroup, onDeleteMsg, onClearChat }) {
  const clearAll = () => { if (window.confirm("Svuotare l'intera conversazione? I messaggi saranno eliminati per entrambi.")) onClearChat(); };
  const [text, setText] = useState("");
  const [manage, setManage] = useState(false);
  const ref = useRef(null);
  useEffect(() => { ref.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
  const send = () => { if (!text.trim()) return; onSend(text.trim()); setText(""); };
  const members = group ? group.members.map(id => (contacts || []).find(c => c.id === id)).filter(Boolean) : [];
  const toggleMember = id => {
    const m = group.members.includes(id) ? group.members.filter(x => x !== id) : [...group.members, id];
    onUpdateGroup(group.id, m);
  };
  return (
    <>
      <Header title={group ? group.name : contact.public ? contact.name : contact.name.split(" ")[0]} left={<button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: "#fff" }}><NavIcon name="back" size={22} color="#fff" /></button>} right={<span style={{ display: "flex", alignItems: "center", gap: 10 }}>{onClearChat && <button onClick={clearAll} title="Svuota conversazione" style={{ background: "rgba(255,255,255,.14)", border: "none", width: 34, height: 34, borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><NavIcon name="trash" size={16} color="#fff" sw={2} /></button>}{contact.public ? <span style={{ fontSize: 20 }}>🌐</span> : <UserAvatar src={contact.ava} size={34} ring={false} />}</span>} />

      {/* banner chat pubblica */}
      {contact.public && (
        <div style={{ background: "#fff", borderBottom: `1px solid ${LINE}`, padding: "10px 14px", flexShrink: 0, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: HBLUE + "14", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><NavIcon name="groups" size={18} color={HBLUE} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: TXT }}>Chat pubblica · visibile a tutti</div>
            {contact.sub && <div style={{ fontSize: 11.5, color: TXT2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{contact.sub}</div>}
          </div>
        </div>
      )}

      {/* barra membri del gruppo */}
      {group && (
        <div style={{ background: "#fff", borderBottom: `1px solid ${LINE}`, padding: "10px 12px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, overflowX: "auto" }}>
            {members.map(m => (
              <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, minWidth: 46 }}>
                <UserAvatar src={m.ava} size={36} />
                <span style={{ fontSize: 9, color: TXT2, maxWidth: 46, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name.split(" ")[0]}</span>
              </div>
            ))}
            <button onClick={() => setManage(true)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, minWidth: 46, background: "none", border: "none", cursor: "pointer" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: HBLUE + "14", border: `1.5px dashed ${HBLUE}66`, display: "flex", alignItems: "center", justifyContent: "center" }}><NavIcon name="plus" size={18} color={HBLUE} sw={2.2} /></div>
              <span style={{ fontSize: 9, color: HBLUE, fontWeight: 600 }}>Gestisci</span>
            </button>
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10, background: BODY }}>
        {msgs.map(m => (
          <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: m.me ? "flex-end" : "flex-start" }} onContextMenu={e => { if (onDeleteMsg) { e.preventDefault(); if (window.confirm("Eliminare questo messaggio?")) onDeleteMsg(m); } }}>
            {!m.me && (group || contact.public) && m.who && <span style={{ fontSize: 11, color: HBLUE, fontWeight: 600, margin: "0 0 2px 6px" }}>{m.who}</span>}
            <div style={{ maxWidth: "75%", background: m.me ? `linear-gradient(135deg,${HBLUE},#1B4E96)` : "#fff", color: m.me ? "#fff" : TXT, borderRadius: m.me ? "16px 16px 4px 16px" : "16px 16px 16px 4px", padding: "11px 14px", fontSize: 15.5, lineHeight: 1.45, boxShadow: `0 2px 8px ${HBLUE}14` }}>{m.text}<div style={{ fontSize: 10, opacity: .7, marginTop: 4, display: "flex", gap: 8, justifyContent: "flex-end", alignItems: "center" }}>{m.time}{onDeleteMsg && <span onClick={e => { e.stopPropagation(); if (window.confirm("Eliminare questo messaggio?")) onDeleteMsg(m); }} style={{ cursor: "pointer", opacity: .85, display: "inline-flex" }}><NavIcon name="trash" size={11} color={m.me ? "#fff" : TXT2} sw={2} /></span>}</div></div>
          </div>
        ))}
        <div ref={ref} />
      </div>
      <div style={{ padding: "12px 16px", background: "#fff", borderTop: `1px solid ${LINE}`, display: "flex", gap: 10, alignItems: "flex-end", flexShrink: 0 }}>
        <textarea rows={1} placeholder="Scrivi un messaggio…" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} style={{ flex: 1, background: BODY, border: `1.5px solid ${LINE}`, borderRadius: 18, padding: "10px 16px", fontSize: 14, resize: "none", outline: "none", color: TXT }} />
        <button onClick={send} style={{ width: 46, height: 46, borderRadius: 14, background: `linear-gradient(135deg,${HBLUE},#1B4E96)`, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><NavIcon name="send" size={18} color="#fff" /></button>
      </div>

      {/* gestione membri */}
      {manage && group && (
        <div onClick={() => setManage(false)} style={{ position: "absolute", inset: 0, background: "rgba(20,40,65,.5)", display: "flex", alignItems: "flex-end", zIndex: 60 }}>
          <div onClick={e => e.stopPropagation()} className="fade-up" style={{ width: "100%", background: "#fff", borderRadius: "20px 20px 0 0", padding: "20px 16px 24px", maxHeight: "78%", display: "flex", flexDirection: "column" }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: TXT, marginBottom: 4 }}>Membri di “{group.name}”</div>
            <div style={{ fontSize: 12, color: TXT2, marginBottom: 14 }}>Tocca per aggiungere o rimuovere dai contatti</div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {(contacts || []).length === 0 ? <div style={{ color: TXT2, fontSize: 14 }}>Nessun contatto disponibile.</div> : (contacts || []).map(c => {
                const on = group.members.includes(c.id);
                return (
                  <div key={c.id} onClick={() => toggleMember(c.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 4px", cursor: "pointer", borderBottom: `1px solid ${LINE}` }}>
                    <UserAvatar src={c.ava} size={42} />
                    <div style={{ flex: 1 }}><div style={{ fontWeight: 600, color: HBLUE }}>{c.name}</div><div style={{ fontSize: 12, color: TXT2 }}>{c.city}</div></div>
                    <div style={{ width: 24, height: 24, borderRadius: 7, border: `2px solid ${on ? HBLUE : LINE}`, background: on ? HBLUE : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>{on && <NavIcon name="check" size={14} color="#fff" sw={3} />}</div>
                  </div>
                );
              })}
            </div>
            <button onClick={() => setManage(false)} style={{ marginTop: 14, padding: 13, borderRadius: 12, border: "none", background: `linear-gradient(135deg,${HBLUE},#1B4E96)`, color: "#fff", fontWeight: 600, cursor: "pointer", fontFamily: "'Sora',sans-serif" }}>Fatto</button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── CAMERA / POST ────────────────────────────────────────────────────────────
function CameraView({ onPost, onBack, geoReal, onCloudCheck }) {
  const videoRef = useRef(null), canvasRef = useRef(null), streamRef = useRef(null);
  const [streaming, setStreaming] = useState(false), [captured, setCaptured] = useState(null);
  const [caption, setCaption] = useState(""), [cond, setCond] = useState(CONDITIONS[0]);
  const [err, setErr] = useState(null), [facing, setFacing] = useState("environment"), [posting, setPosting] = useState(false);
  // ── fotocamera pro: zoom (hardware o digitale), torcia, griglia ──
  const [zoom, setZoom] = useState(1);
  const [zoomCaps, setZoomCaps] = useState(null);   // {min,max,step} se lo zoom hardware esiste
  const [torchAvail, setTorchAvail] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [grid, setGrid] = useState(false);
  const [format, setFormat] = useState("std");     // std | wide (16:9) | pano (21:9)
  const FORMAT_AR = { std: null, wide: 16 / 9, pano: 21 / 9 };
  const pinchRef = useRef(null);
  const maxZoom = zoomCaps ? Math.min(zoomCaps.max, 8) : 5;
  const applyZoom = z => {
    const cl = Math.max(1, Math.min(maxZoom, z));
    setZoom(cl);
    const track = streamRef.current?.getVideoTracks?.()[0];
    if (zoomCaps && track) track.applyConstraints({ advanced: [{ zoom: cl }] }).catch(() => {});
  };
  const toggleTorch = () => {
    const track = streamRef.current?.getVideoTracks?.()[0];
    if (!track) return;
    const next = !torchOn;
    track.applyConstraints({ advanced: [{ torch: next }] }).then(() => setTorchOn(next)).catch(() => {});
  };
  const onPinchStart = e => { if (e.touches?.length === 2) { const [a, b] = e.touches; pinchRef.current = { d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), z: zoom }; } };
  const onPinchMove = e => {
    if (e.touches?.length === 2 && pinchRef.current) {
      const [a, b] = e.touches;
      const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      applyZoom(pinchRef.current.z * (d / pinchRef.current.d));
    }
  };
  const onPinchEnd = () => { pinchRef.current = null; };
  // bussola: direzione della fotocamera (gradi 0-360, 0 = Nord)
  const [heading, setHeading] = useState(40);      // valore demo di partenza
  const [headingReal, setHeadingReal] = useState(false);
  const [shotDir, setShotDir] = useState(null);    // direzione congelata allo scatto
  const DIRS = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
  // iOS: i sensori di movimento richiedono un permesso esplicito, attivabile solo da un tocco
  const canAskSensor = typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function";
  const askSensor = async () => { try { await DeviceOrientationEvent.requestPermission(); } catch (_) {} };
  const dirLabel = h => DIRS[Math.round(((h % 360) + 360) % 360 / 45) % 8];
  useEffect(() => {
    const onOri = e => {
      let h = null;
      if (typeof e.webkitCompassHeading === "number") h = e.webkitCompassHeading;      // iOS
      else if (typeof e.alpha === "number") h = 360 - e.alpha;                          // standard
      if (h != null && !isNaN(h)) { setHeading(((h % 360) + 360) % 360); setHeadingReal(true); }
    };
    window.addEventListener("deviceorientationabsolute", onOri, true);
    window.addEventListener("deviceorientation", onOri, true);
    return () => { window.removeEventListener("deviceorientationabsolute", onOri, true); window.removeEventListener("deviceorientation", onOri, true); };
  }, []);
  const Compass = ({ h }) => (
    <div onClick={askSensor} style={{ position: "absolute", top: 12, right: 14, width: 62, textAlign: "center", cursor: "pointer" }}>
      <div style={{ width: 54, height: 54, margin: "0 auto", borderRadius: "50%", background: "rgba(0,0,0,.38)", border: "1.5px solid rgba(255,255,255,.65)", position: "relative" }}>
        {/* rosa dei venti che ruota: il Nord segue il mondo reale */}
        <div style={{ position: "absolute", inset: 0, transform: `rotate(${-h}deg)`, transition: "transform .25s ease-out" }}>
          <span style={{ position: "absolute", top: 2, left: "50%", transform: "translateX(-50%)", fontSize: 9, fontWeight: 800, color: "#FF5A5A" }}>N</span>
          <span style={{ position: "absolute", bottom: 2, left: "50%", transform: "translateX(-50%)", fontSize: 8, fontWeight: 700, color: "#fff" }}>S</span>
          <span style={{ position: "absolute", left: 4, top: "50%", transform: "translateY(-50%)", fontSize: 8, fontWeight: 700, color: "#fff" }}>O</span>
          <span style={{ position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)", fontSize: 8, fontWeight: 700, color: "#fff" }}>E</span>
        </div>
        {/* indicatore fisso: dove punta la fotocamera */}
        <div style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: `7px solid ${ACCENT}` }} />
      </div>
      <div style={{ marginTop: 3, fontSize: 10.5, fontWeight: 800, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,.6)", letterSpacing: ".04em" }}>{dirLabel(h)} · {Math.round(h)}°{!headingReal && <span style={{ fontWeight: 600, opacity: .85 }}> {canAskSensor ? "tocca 👆" : "demo"}</span>}</div>
    </div>
  );
  const start = useCallback(async () => {
    try {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErr({ kind: "unsupported", msg: "Questo browser non dà accesso alla fotocamera. Succede nei browser interni di WhatsApp, Instagram o Facebook: apri beeweat.vercel.app direttamente in Safari o Chrome (tocca ⋯ → \"Apri nel browser\")." });
        return;
      }
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
      streamRef.current = s; if (videoRef.current) { videoRef.current.srcObject = s; videoRef.current.play(); } setStreaming(true); setErr(null);
      // capacità del sensore: zoom hardware e torcia (dove il dispositivo le espone)
      setZoom(1); setTorchOn(false);
      try {
        const caps = s.getVideoTracks()[0].getCapabilities?.() || {};
        setZoomCaps(caps.zoom && caps.zoom.max > 1 ? { min: caps.zoom.min || 1, max: caps.zoom.max, step: caps.zoom.step || 0.1 } : null);
        setTorchAvail(!!caps.torch);
      } catch (_) { setZoomCaps(null); setTorchAvail(false); }
    } catch (e) {
      const name = e?.name || "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError")
        setErr({ kind: "denied", msg: "Permesso fotocamera negato (ora o in passato). Riattivalo: icona 🔒 nella barra dell'indirizzo → Autorizzazioni → Fotocamera → Consenti. Su iPhone: Impostazioni → Safari → Fotocamera → Consenti." });
      else if (name === "NotFoundError")
        setErr({ kind: "nocam", msg: "Nessuna fotocamera trovata su questo dispositivo." });
      else if (name === "NotReadableError")
        setErr({ kind: "busy", msg: "La fotocamera è occupata da un'altra app: chiudila e riprova." });
      else
        setErr({ kind: "err", msg: "Fotocamera non avviabile: " + (e?.message || name || "errore sconosciuto") });
      if (n === "NotAllowedError" || n === "SecurityError") setErr({ kind: "denied", msg: "Accesso alla fotocamera negato o bloccato." });
      else if (n === "NotFoundError" || n === "OverconstrainedError") setErr({ kind: "notfound", msg: "Nessuna fotocamera disponibile su questo dispositivo." });
      else setErr({ kind: "blocked", msg: "Impossibile aprire la fotocamera in questa finestra." });
    }
  }, [facing]);
  useEffect(() => { start(); return () => { if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()); }; }, [facing]);
  const [flash, setFlash] = useState(false);
  const capture = () => { const v = videoRef.current, c = canvasRef.current; if (!v || !c) return;
    setFlash(true); setTimeout(() => setFlash(false), 140);
    const dz = zoomCaps ? 1 : zoom;               // zoom digitale: ritaglio reale del fotogramma
    let sw = v.videoWidth / dz, sh = v.videoHeight / dz;
    const ar = FORMAT_AR[format];                 // formato scelto: ritaglio centrato (16:9 / pano 21:9)
    if (ar) { if (sw / sh > ar) sw = sh * ar; else sh = sw / ar; }
    c.width = Math.round(sw); c.height = Math.round(sh);
    c.getContext("2d").drawImage(v, (v.videoWidth - sw) / 2, (v.videoHeight - sh) / 2, sw, sh, 0, 0, c.width, c.height); setCaptured(c.toDataURL("image/jpeg", .85)); setTimeout(runAI, 60); setShotDir({ deg: Math.round(heading), label: dirLabel(heading) }); streamRef.current?.getTracks().forEach(t => t.stop()); setStreaming(false); };
  const [ai, setAi] = useState(null);
  const aiSeqRef = useRef(0);
  const CLOUD_MAP = { "Sereno": "☀️ Sereno", "Poco nuvoloso": "⛅ Poco nuvoloso", "Pioggia": "🌧️ Pioggia", "Temporale": "⛈️ Temporale", "Neve": "❄️ Neve", "Nebbia": "🌫️ Nebbia", "Ventoso": "🌬️ Ventoso", "Arcobaleno": "🌈 Arcobaleno" };
  const runAI = () => {
    const c = canvasRef.current; if (!c) return;
    const my = ++aiSeqRef.current;                     // ogni analisi ha il suo numero
    setAi({ checking: true });
    analyzePhoto(c).then(async v => {
      if (aiSeqRef.current !== my) return;             // verdetto di uno scatto passato: ignorato
      // ── CASCATA: sui casi incerti si chiede il secondo parere a Bee-Eye ──
      const uncertain = onCloudCheck && (
        (v.block && v.cls === "not_sky") ||            // bocciata per "niente cielo": forse l'occhio fine si sbaglia
        (!v.block && (!v.score || v.score < 0.6))      // approvata ma con poca convinzione
      );
      if (!uncertain) {
        setAi(v);
        if (!v.block && v.suggest && CONDITIONS.includes(v.suggest)) setCond(v.suggest);
        return;
      }
      setAi({ ...v, checking: true, secondOpinion: true });
      try {
        const t = document.createElement("canvas");
        const k = Math.min(1, 384 / c.width);
        t.width = Math.round(c.width * k); t.height = Math.round(c.height * k);
        t.getContext("2d").drawImage(c, 0, 0, t.width, t.height);
        const verdict = await onCloudCheck(t.toDataURL("image/jpeg", 0.8), { aiClass: v.cls });
        if (aiSeqRef.current !== my) return;
        if (!verdict) { setAi(v); if (!v.block && v.suggest && CONDITIONS.includes(v.suggest)) setCond(v.suggest); return; }
        if (verdict.persone_in_primo_piano)
          setAi({ block: true, reason: "Bee-Eye 👁️: c'è una persona in primo piano. Inquadra il cielo, non le persone.", cls: "person" });
        else if (verdict.schermo_o_foto_di_foto)
          setAi({ block: true, reason: "Bee-Eye 👁️: sembra uno schermo o una foto ri-fotografata. Serve il cielo vero. 📵", cls: "screen" });
        else if (verdict.cielo_visibile || verdict.esterno) {
          const cls = CLOUD_MAP[verdict.condizione] || v.cls || "⛅ Poco nuvoloso";
          setAi({ block: false, reason: null, cls, score: verdict.fiducia || 0.7, suggest: cls, byCloud: true });
          if (CONDITIONS.includes(cls)) setCond(cls);
        } else
          setAi({ block: true, reason: "Bee-Eye 👁️: " + (verdict.motivo || "non vedo cielo nell'inquadratura. Alza l'obiettivo. 🌤️"), cls: "not_sky" });
      } catch (_) {
        if (aiSeqRef.current === my) { setAi(v); if (!v.block && v.suggest && CONDITIONS.includes(v.suggest)) setCond(v.suggest); }
      }
    }).catch(e => { if (aiSeqRef.current === my) { console.warn("AI:", e?.message || e); setAi({ error: true }); } });
  };
  const retake = () => { aiSeqRef.current++; setCaptured(null); setAi(null); start(); };
  useEffect(() => {   // blocco in verticale mentre la fotocamera è aperta (Android; il web su iPhone non lo consente)
    try { screen.orientation?.lock?.("portrait").catch(() => {}); } catch (_) {}
    loadAIModels().catch(() => {});   // pre-riscaldamento: gli occhi AI si preparano mentre inquadri
    return () => { try { screen.orientation?.unlock?.(); } catch (_) {} };
  }, []);
  const [saved, setSaved] = useState(false);
  const savePhoto = async () => {
    try {
      const blob = await (await fetch(captured)).blob();
      const file = new File([blob], `beeweat_${Date.now()}.jpg`, { type: "image/jpeg" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "Beeweat" });   // iOS/Android: "Salva immagine" → galleria
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = file.name;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
      }
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } catch (_) {}
  };
  const publish = () => { if (!captured || !ai || ai.block || ai.checking || ai.error || !geoReal) return; setPosting(true); setTimeout(() => { onPost({ img: captured, caption, cond, dir: shotDir, aiClass: ai?.cls || null, aiScore: ai?.score || null }); }, 600); };
  const GeoChip = () => geoReal ? null : (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 12, marginBottom: 10, fontSize: 12.5, lineHeight: 1.4, background: "#E5484D14", color: "#C43C41", border: "1px solid #E5484D44" }}>
      <span style={{ fontSize: 15, flexShrink: 0 }}>📍</span>
      <span><b>Posizione non rilevata</b> — Beeweat pubblica solo cieli con il loro posto vero. Consenti la geolocalizzazione al sito (icona 🔒 nella barra → Posizione → Consenti, poi ricarica).</span>
    </div>
  );
  const AiChip0 = () => ai?.checking && ai?.secondOpinion ? (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 12, marginBottom: 10, fontSize: 12.5, background: HBLUE + "12", color: HBLUE, border: `1px solid ${HBLUE}33` }}>
      <span style={{ fontSize: 15 }}>👁️</span><span>Caso difficile: sto chiedendo il <b>secondo parere</b> a Bee-Eye…</span>
    </div>
  ) : null;
  const AiChip = () => !ai ? null : ai.error ? (
    <div onClick={runAI} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 12, marginBottom: 10, fontSize: 12.5, lineHeight: 1.4, background: "#B4690E14", color: "#8A5A12", border: "1px solid #F0B92966", cursor: "pointer" }}>
      <span style={{ fontSize: 15, flexShrink: 0 }}>⚠️</span>
      <span>Occhi AI non raggiungibili (serve la rete per il primo caricamento dei modelli). <b>Tocca qui per riprovare</b> — senza analisi la foto non può essere pubblicata.</span>
    </div>
  ) : (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 12, marginBottom: 10, fontSize: 12.5, lineHeight: 1.4, background: ai.checking ? HBLUE + "0E" : ai.block ? "#E5484D14" : "#3BA77614", color: ai.checking ? HBLUE : ai.block ? "#C43C41" : "#2C7A57", border: `1px solid ${ai.checking ? HBLUE + "33" : ai.block ? "#E5484D44" : "#3BA77644"}` }}>
      <span style={{ fontSize: 15, flexShrink: 0 }}>{ai.checking ? "🐝" : ai.block ? "🚫" : "✅"}</span>
      <span>{ai.checking ? "Gli occhi dell'alveare stanno guardando la foto…" : ai.block ? ai.reason : `Foto approvata${ai.cls ? ` · sembra ${ai.cls}` : ""}${ai.score ? ` (${Math.round(ai.score * 100)}%)` : ""}`}</span>
    </div>
  );
  return (
    <>
      <Header title="Nuovo Post" left={<button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", display: "flex" }}><NavIcon name="back" size={22} color="#fff" /></button>} />
      {flash && <div style={{ position: "fixed", inset: 0, zIndex: 450, background: "#fff", opacity: .85, pointerEvents: "none" }} />}
      <div className="bw-rotate-guard" style={{ position: "fixed", inset: 0, zIndex: 500, background: "#12203A", color: "#fff", display: "none", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, textAlign: "center", padding: 30 }}>
        <span style={{ fontSize: 44 }}>📱</span>
        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18 }}>Ruota il telefono in verticale</div>
        <div style={{ fontSize: 13.5, opacity: .85, lineHeight: 1.5 }}>Le foto di Beeweat si scattano in verticale: il cielo ha bisogno d'altezza. 🐝</div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", background: BODY }}>
        <div style={{ margin: 16, borderRadius: 16, overflow: "hidden", background: "#0B1524", minHeight: format === "std" ? 280 : undefined, position: "relative", boxShadow: `0 4px 18px ${HBLUE}22` }}>
          {!captured ? <>
            <div onTouchStart={onPinchStart} onTouchMove={onPinchMove} onTouchEnd={onPinchEnd} style={{ overflow: "hidden", display: streaming ? "block" : "none", position: "relative", aspectRatio: format === "pano" ? "21 / 9" : format === "wide" ? "16 / 9" : undefined }}>
              <video ref={videoRef} playsInline muted style={{ width: "100%", height: format === "std" ? undefined : "100%", maxHeight: format === "std" ? 360 : undefined, objectFit: "cover", display: "block", transform: zoomCaps ? "none" : `scale(${zoom})`, transformOrigin: "center center", transition: "transform .12s ease-out" }} />
              {streaming && (
                <div style={{ position: "absolute", left: 0, right: 0, bottom: 10, display: "flex", justifyContent: "center", gap: 8, zIndex: 5 }}>
                  {[1, 2, 3, ...(maxZoom >= 5 ? [5] : [])].map(zv => {
                    const on = Math.abs(zoom - zv) < 0.2;
                    return (
                      <button key={zv} onClick={() => applyZoom(zv)} style={{ minWidth: 40, height: 32, padding: "0 10px", borderRadius: 16, border: "none", cursor: "pointer", background: on ? "rgba(20,28,40,.78)" : "rgba(20,28,40,.42)", color: on ? ACCENT : "#fff", fontWeight: 700, fontSize: on ? 13.5 : 12, fontFamily: "'Space Grotesk',sans-serif", backdropFilter: "blur(4px)" }}>
                        {zv}{on ? "×" : ""}
                      </button>
                    );
                  })}
                </div>
              )}
              {grid && <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                {[1, 2].map(i => <div key={"v" + i} style={{ position: "absolute", top: 0, bottom: 0, left: `${i * 33.33}%`, width: 1, background: "rgba(255,255,255,.5)" }} />)}
                {[1, 2].map(i => <div key={"h" + i} style={{ position: "absolute", left: 0, right: 0, top: `${i * 33.33}%`, height: 1, background: "rgba(255,255,255,.5)" }} />)}
              </div>}
              {zoom > 1.02 && <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,.45)", color: "#fff", fontSize: 12, fontWeight: 700, borderRadius: 14, padding: "3px 10px" }}>{zoom.toFixed(1)}×</div>}
            </div>
            {!streaming && !err && <div style={{ height: 280, display: "flex", alignItems: "center", justifyContent: "center", color: TXT2 }}>Avvio fotocamera…</div>}
            {err && <div style={{ minHeight: 280, display: "flex", flexDirection: "column", gap: 12, alignItems: "center", justifyContent: "center", padding: "26px 22px", textAlign: "center" }}>
              <NavIcon name="camera" size={40} color={TXT2} />
              <span style={{ color: RED, fontSize: 14, fontWeight: 600 }}>{err.msg}</span>
              {err.kind === "denied" && <div style={{ fontSize: 12.5, color: TXT2, lineHeight: 1.6, textAlign: "left", background: "#fff", borderRadius: 10, padding: "10px 12px", border: `1px solid ${LINE}` }}>
                Per attivare la fotocamera:<br />
                • tocca l'icona 🔒/📷 nella barra degli indirizzi del browser<br />
                • imposta la Fotocamera su <b>Consenti</b><br />
                • ricarica la pagina e premi <b>Riprova</b><br />
                Su iPhone: Impostazioni → Safari → Fotocamera → Consenti.
              </div>}
              {(err.kind === "blocked" || err.kind === "unsupported") && <div style={{ fontSize: 12.5, color: TXT2, lineHeight: 1.6 }}>Se stai usando un'anteprima incorporata, apri l'app in una scheda del browser dedicata: la fotocamera richiede HTTPS e il permesso del sito.</div>}
              <button onClick={start} style={{ padding: "9px 20px", borderRadius: 10, border: "none", background: HBLUE, color: "#fff", cursor: "pointer", fontWeight: 600, fontFamily: "'Sora',sans-serif" }}>Riprova</button>
              {TEST_MODE && <button onClick={() => { setErr(null); setCaptured(DEMO_PHOTOS[Math.floor(Math.random() * DEMO_PHOTOS.length)]); setShotDir({ deg: Math.round(heading), label: dirLabel(heading) }); }} style={{ padding: "8px 16px", borderRadius: 10, border: `1.5px solid ${LINE}`, background: "transparent", color: TXT2, cursor: "pointer", fontSize: 12.5, fontWeight: 600, fontFamily: "'Sora',sans-serif" }}>Usa una foto demo (solo prova)</button>}
            </div>}
            {streaming && <div style={{ position: "absolute", top: 12, left: 14, display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,.35)", borderRadius: 20, padding: "4px 10px" }}><div style={{ width: 7, height: 7, borderRadius: "50%", background: RED, animation: "blink 1s infinite" }} /><span style={{ fontSize: 10, fontWeight: 700, color: "#fff", letterSpacing: ".1em" }}>LIVE</span></div>}
            {streaming && <Compass h={heading} />}
          </> : <><img src={captured} alt="" style={{ width: "100%", maxHeight: 360, objectFit: "cover", display: "block" }} />{typeof captured === "string" && captured.startsWith("http") && <div style={{ position: "absolute", top: 12, left: 14, background: "rgba(0,0,0,.5)", color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: ".1em", borderRadius: 20, padding: "4px 10px" }}>DEMO</div>}{shotDir && <div style={{ position: "absolute", top: 12, right: 14, background: "rgba(0,0,0,.5)", color: "#fff", fontSize: 11, fontWeight: 700, borderRadius: 20, padding: "5px 11px" }}><span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><WIcon name="compass" size={14} color="#fff" sw={2} />{shotDir.label} · {shotDir.deg}°</span></div>}</>}
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
        <div style={{ padding: "0 16px 20px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, background: ACCENT + "1A", border: `1px solid ${ACCENT}55`, borderRadius: 12, padding: "9px 12px", marginBottom: 14 }}>
            <span style={{ fontSize: 16, lineHeight: 1.3 }}>🌤️</span>
            <span style={{ fontSize: 12, color: "#9A6418", lineHeight: 1.45 }}>Inquadra il <b>cielo o il meteo</b>, non le persone: le foto con persone in primo piano non sono ammesse e verranno scartate.</span>
          </div>
          {!captured && streaming && <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 12 }}>
            {[["std", "Std"], ["wide", "16:9"], ["pano", "Pano"]].map(([id, label]) => (
              <button key={id} onClick={() => setFormat(id)} style={{ padding: "5px 14px", borderRadius: 14, border: `1.5px solid ${format === id ? HBLUE : LINE}`, background: format === id ? HBLUE : "#fff", color: format === id ? "#fff" : HBLUE, fontWeight: 700, fontSize: 12.5, cursor: "pointer", letterSpacing: ".02em" }}>{label}</button>
            ))}
          </div>}
          {!captured && streaming && <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, padding: "0 6px" }}>
            {[1, 2, 3].filter(z => z <= maxZoom).map(z => (
              <button key={z} onClick={() => applyZoom(z)} style={{ minWidth: 40, padding: "5px 0", borderRadius: 12, border: `1.5px solid ${Math.abs(zoom - z) < .25 ? HBLUE : LINE}`, background: Math.abs(zoom - z) < .25 ? HBLUE : "#fff", color: Math.abs(zoom - z) < .25 ? "#fff" : HBLUE, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{z}×</button>
            ))}
            <input type="range" min={1} max={maxZoom} step={0.1} value={zoom} onChange={e => applyZoom(+e.target.value)} style={{ flex: 1, accentColor: HBLUE }} />
          </div>}
          {!captured ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginTop: 12 }}>
            <button onClick={() => setFacing(f => f === "environment" ? "user" : "environment")} style={{ width: 46, height: 46, borderRadius: 14, background: "#fff", border: `1.5px solid ${LINE}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><NavIcon name="flip" size={20} color={HBLUE} /></button>
            {streaming && <button onClick={() => setGrid(g => !g)} title="Griglia" style={{ width: 46, height: 46, borderRadius: 14, background: grid ? HBLUE : "#fff", border: `1.5px solid ${grid ? HBLUE : LINE}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><NavIcon name="grid" size={20} color={grid ? "#fff" : HBLUE} sw={1.7} /></button>}
            {streaming && <button onPointerDown={e => { e.preventDefault(); capture(); }} style={{ width: 72, height: 72, borderRadius: "50%", background: `linear-gradient(135deg,${HBLUE},#1B4E96)`, border: "4px solid #fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 22px ${HBLUE}55`, touchAction: "none" }}><NavIcon name="capture" size={30} color="#fff" sw={2} /></button>}
            {streaming && torchAvail && <button onClick={toggleTorch} title="Torcia" style={{ width: 46, height: 46, borderRadius: 14, background: torchOn ? ACCENT : "#fff", border: `1.5px solid ${torchOn ? ACCENT : LINE}`, cursor: "pointer", fontSize: 19 }}>🔦</button>}
          </div> : <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <textarea rows={2} placeholder="Descrivi il meteo…" value={caption} onChange={e => setCaption(e.target.value)} style={{ background: "#fff", border: `1.5px solid ${LINE}`, borderRadius: 14, padding: "12px 14px", fontSize: 14, resize: "none", outline: "none", color: TXT, lineHeight: 1.5 }} />
            <select value={cond} onChange={e => setCond(e.target.value)} style={{ background: "#fff", border: `1.5px solid ${LINE}`, borderRadius: 12, padding: "11px 10px", fontSize: 14, outline: "none", color: TXT }}>{CONDITIONS.map(c => <option key={c}>{c}</option>)}</select>
            <GeoChip />
      <AiChip0 />
      <AiChip />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={retake} style={{ flex: 1, padding: 13, borderRadius: 12, border: `1.5px solid ${LINE}`, background: "#fff", color: HBLUE, fontWeight: 600, cursor: "pointer", fontFamily: "'Sora',sans-serif" }}>↩ Rifai</button>
              <button onClick={savePhoto} title="Salva nel telefono" style={{ flex: 1, padding: 13, borderRadius: 12, border: `1.5px solid ${saved ? "#3BA776" : LINE}`, background: saved ? "#3BA77614" : "#fff", color: saved ? "#3BA776" : HBLUE, fontWeight: 600, cursor: "pointer", fontFamily: "'Sora',sans-serif" }}>{saved ? "✓ Salvata" : "⬇ Salva"}</button>
              <button onClick={publish} disabled={posting || !ai || ai.block || ai.checking || ai.error || !geoReal} style={{ flex: 2, padding: 13, borderRadius: 12, border: "none", background: (ai?.block || ai?.error || !ai) ? "#9AA7B8" : `linear-gradient(135deg,${HBLUE},#1B4E96)`, color: "#fff", fontWeight: 600, cursor: (ai?.block || ai?.error || !ai) ? "not-allowed" : "pointer", opacity: posting || ai?.checking ? .6 : 1, fontFamily: "'Sora',sans-serif" }}>{posting ? "Pubblicazione…" : ai?.checking ? "Analisi foto…" : ai?.error ? "Analisi non riuscita" : ai?.block ? "Non pubblicabile" : !ai ? "In attesa dell'analisi" : "Pubblica ora"}</button>
            </div>
          </div>}
        </div>
      </div>
    </>
  );
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────
function ProfileView({ user, posts, onLogout, onBack, onAvatar, onOpenNotif, notif, onDelete, onEdit, followingList, followersList, onFollow, following, onOpenPhoto, onRename, onRenameCity }) {
  const [followTab, setFollowTab] = useState(null);
  const mine = posts.filter(p => p.mine).slice().sort((a, b) => new Date(b.ts) - new Date(a.ts));
  const stars = mine.reduce((s, p) => s + p.stars, 0);
  const [editing, setEditing] = useState(false);
  return (
    <>
      <Header title="Profilo" left={<button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", display: "flex" }}><NavIcon name="back" size={22} color="#fff" /></button>} />
      <div style={{ flex: 1, overflowY: "auto", background: BODY, position: "relative" }}>
        <div style={{ background: `linear-gradient(160deg,${PANEL_A},${PANEL_B})`, height: 78 }} />
        <div style={{ padding: "0 20px", marginTop: -42 }}>
          <button onClick={() => setEditing(true)} style={{ position: "relative", padding: 0, border: "none", background: "none", cursor: "pointer", borderRadius: "50%", marginBottom: 12, display: "block" }}>
            <div style={{ width: 90, height: 90, borderRadius: "50%", background: "#fff", border: "3px solid #fff", boxShadow: `0 8px 24px ${HBLUE}33`, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <UserAvatar src={user.avatar} size={84} ring={false} />
            </div>
            <div style={{ position: "absolute", right: 2, bottom: 2, width: 30, height: 30, borderRadius: "50%", background: HBLUE, border: "2.5px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}><NavIcon name="camera" size={15} color="#fff" sw={2} /></div>
          </button>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 24, color: TXT, display: "flex", alignItems: "center", gap: 8 }}>{user.name}
            {onRename && <button onClick={onRename} title="Modifica nome" style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 2 }}><NavIcon name="edit" size={16} color={HBLUE} sw={1.9} /></button>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: TXT2, marginTop: 4 }}><NavIcon name="pin" size={13} color={TXT2} /> {user.city}
            {onRenameCity && <button onClick={onRenameCity} title="Modifica città" style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 2 }}><NavIcon name="edit" size={13} color={HBLUE} sw={1.9} /></button>}
          </div>
        </div>
        <div style={{ display: "flex", margin: "16px 16px 0", background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: `0 2px 12px ${HBLUE}10` }}>
          {[{ l: "Post", v: mine.length, i: "camera" }, { l: "Stelle", v: stars, i: "starFill" }, { l: "Giorni", v: 7, i: "feed" }].map((s, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center", padding: "16px 8px", borderRight: i < 2 ? `1px solid ${LINE}` : "none" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}><NavIcon name={s.i} size={20} color={HBLUE} /></div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 22, color: TXT }}>{s.v}</div>
              <div style={{ fontSize: 11, color: TXT2 }}>{s.l}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: "14px 16px 0" }}>
          <div style={{ display: "flex", background: "#fff", borderRadius: 14, border: `1px solid ${LINE}`, overflow: "hidden", marginBottom: 12 }}>
            {[["Seguiti", followingList], ["Follower", followersList]].map(([label, list], i) => (
              <button key={label} onClick={() => setFollowTab(t => t === label ? null : label)} style={{ flex: 1, padding: "12px 8px", background: followTab === label ? HBLUE + "0E" : "transparent", border: "none", borderRight: i === 0 ? `1px solid ${LINE}` : "none", cursor: "pointer" }}>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 20, color: TXT }}>{(list || []).length}</div>
                <div style={{ fontSize: 11.5, color: TXT2 }}>{label}</div>
              </button>
            ))}
          </div>
          {followTab && (
            <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${LINE}`, marginBottom: 12, overflow: "hidden" }}>
              {((followTab === "Seguiti" ? followingList : followersList) || []).length === 0
                ? <div style={{ padding: "18px 16px", color: TXT2, fontSize: 13.5, textAlign: "center" }}>{followTab === "Seguiti" ? "Non segui ancora nessuno." : "Nessun follower per ora — pubblica bei cieli!"}</div>
                : (followTab === "Seguiti" ? followingList : followersList).map(c => (
                  <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderBottom: `1px solid ${LINE}` }}>
                    <UserAvatar src={c.ava} size={38} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: TXT }}>{c.name}</div>
                      {c.city && <div style={{ fontSize: 11.5, color: TXT2 }}>{c.city}</div>}
                    </div>
                    {onFollow && <button onClick={() => onFollow(c.name)} style={{ fontSize: 11.5, fontWeight: 600, fontFamily: "'Sora',sans-serif", padding: "4px 12px", borderRadius: 16, cursor: "pointer", border: `1.5px solid ${HBLUE}`, background: following?.includes(c.name) ? HBLUE : "transparent", color: following?.includes(c.name) ? "#fff" : HBLUE }}>{following?.includes(c.name) ? "Seguito già" : "+ Segui"}</button>}
                  </div>
                ))}
            </div>
          )}
          <button onClick={onOpenNotif} style={{ width: "100%", background: "#fff", border: `1px solid ${LINE}`, borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: HBLUE + "12", display: "flex", alignItems: "center", justifyContent: "center" }}><NavIcon name="bell" size={19} color={HBLUE} /></div>
            <div style={{ flex: 1, textAlign: "left" }}>
              <div style={{ fontWeight: 600, fontSize: 14.5, color: TXT }}>Configurazione</div>
              <div style={{ fontSize: 12, color: TXT2 }}>{notif?.enabled ? `Attive · entro ${notif.radiusKm} km` : "Disattivate"}</div>
            </div>
            <NavIcon name="chevron" size={18} color={TXT2} sw={2.2} />
          </button>
          <button onClick={onLogout} style={{ width: "100%", marginTop: 12, padding: 13, borderRadius: 12, border: `1.5px solid ${RED}44`, background: "transparent", color: RED, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "'Sora',sans-serif" }}><NavIcon name="logout" size={16} color={RED} /> Logout</button>
          <div style={{ textAlign: "center", color: TXT2, fontSize: 11.5, marginTop: 10, letterSpacing: ".03em" }}>Beeweat v{APP_VERSION} 🐝</div>
        </div>
        <div style={{ padding: "18px 16px 20px" }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: TXT, marginBottom: 12 }}>I miei post</div>
          {mine.length === 0 ? <div style={{ background: "#fff", borderRadius: 14, padding: "30px 20px", textAlign: "center", color: TXT2 }}>Nessun post ancora — scatta il tuo meteo!</div> : mine.map(p => <PostCard key={p.id} post={p} onStar={() => {}} canDelete onDelete={onDelete} onEdit={onEdit} onOpenPhoto={onOpenPhoto} />)}
        </div>
      </div>
      {editing && <AvatarEditor current={user.avatar} onPick={a => { onAvatar(a); setEditing(false); }} onClose={() => setEditing(false)} />}
    </>
  );
}

// ─── PAGINA PUBBLICA DI UN UTENTE (con i suoi post) ───────────────────────────
function UserProfileView({ profile, posts, events, isFollowing, onFollow, onBack, onChat, onPostChat, onOpenEvent, isAdmin, onBan, onEdit, onDeleteUser, onOpenPhoto, onStar, onAdminEdit }) {
  const mine = posts.filter(p => p.user === profile.name).slice().sort((a, b) => new Date(b.ts) - new Date(a.ts));
  const myEvents = (events || []).filter(e => e.user === profile.name);
  const sevColor = { Alta: "#E5484D", Media: "#EFA23C", Bassa: "#3BA776" };
  const totStars = mine.reduce((s, p) => s + (p.stars || 0), 0);
  return (
    <>
      <Header title={(profile.name || "Utente").split(" ")[0]} left={<button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", color: "#fff" }}><NavIcon name="back" size={22} color="#fff" /></button>} right={<span style={{ width: 24 }} />} />
      <div style={{ flex: 1, overflowY: "auto", background: BODY }}>
        <div style={{ background: "#fff", padding: "12px 16px", display: "flex", alignItems: "center", gap: 14, color: HBLUE, borderBottom: `1px solid ${LINE}` }}>
          <UserAvatar src={profile.ava} size={56} ring />
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "flex-start", textAlign: "left" }}>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 17, lineHeight: 1.15 }}>{profile.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: TXT2, marginTop: 1 }}><NavIcon name="pin" size={12} color={HBLUE} /> {profile.city}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
              <button onClick={() => onChat(profile)} style={{ padding: "6px 14px", borderRadius: 18, border: `1.5px solid ${HBLUE}`, cursor: "pointer", fontWeight: 600, fontSize: 12.5, fontFamily: "'Sora',sans-serif", background: "transparent", color: HBLUE, display: "flex", alignItems: "center", gap: 5 }}><NavIcon name="send" size={13} color={HBLUE} /> Messaggio</button>
              {isAdmin && <button onClick={() => onAdminEdit && onAdminEdit(profile)} style={{ padding: "6px 14px", borderRadius: 18, border: `1.5px solid ${HBLUE}`, cursor: "pointer", fontWeight: 600, fontSize: 12.5, fontFamily: "'Sora',sans-serif", background: "transparent", color: HBLUE }}>Modifica</button>}
              {isAdmin && <button onClick={() => onBan && onBan(profile)} style={{ padding: "6px 14px", borderRadius: 18, border: `1.5px solid ${RED}`, cursor: "pointer", fontWeight: 600, fontSize: 12.5, fontFamily: "'Sora',sans-serif", background: "transparent", color: RED }}>Ban</button>}
              {isAdmin && <button onClick={() => onDeleteUser && onDeleteUser(profile)} style={{ padding: "6px 14px", borderRadius: 18, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 12.5, fontFamily: "'Sora',sans-serif", background: RED, color: "#fff" }}>Elimina</button>}
              <button onClick={() => onFollow(profile.name)} style={{ padding: "6px 14px", borderRadius: 18, border: `1.5px solid ${HBLUE}`, cursor: "pointer", fontWeight: 600, fontSize: 12.5, fontFamily: "'Sora',sans-serif", background: isFollowing ? HBLUE : "transparent", color: isFollowing ? "#fff" : HBLUE }}>{isFollowing ? "Seguito già" : "+ Segui"}</button>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
            <div style={{ textAlign: "center" }}><div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18, lineHeight: 1 }}>{mine.length}</div><div style={{ fontSize: 10.5, color: TXT2 }}>post</div></div>
            <div style={{ textAlign: "center" }}><div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18, lineHeight: 1 }}>{myEvents.length}</div><div style={{ fontSize: 10.5, color: TXT2 }}>eventi</div></div>
            <div style={{ textAlign: "center" }}><div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18, lineHeight: 1 }}>{totStars}</div><div style={{ fontSize: 10.5, color: TXT2 }}>stelle</div></div>
          </div>
        </div>
        {myEvents.length > 0 && (
          <div style={{ padding: "14px 16px 0" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: TXT2, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Eventi pubblicati</div>
            {myEvents.map(e => (
              <div key={e.id} onClick={() => onOpenEvent && onOpenEvent(e)} style={{ background: "#fff", borderRadius: 14, padding: 13, marginBottom: 10, boxShadow: `0 2px 10px ${HBLUE}0D`, borderLeft: `5px solid ${sevColor[e.sev]}`, cursor: "pointer", display: "flex", gap: 13, alignItems: "center" }}>
                <div style={{ fontSize: 30 }}>{e.type || (e.cat ? e.cat.split(" ")[0] : "📍")}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14.5, color: TXT }}>{e.title}</div>
                  <div style={{ fontSize: 12, color: TXT2, marginTop: 1 }}>📍 {e.place} · {e.time}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: sevColor[e.sev], background: sevColor[e.sev] + "1A", borderRadius: 8, padding: "4px 9px", flexShrink: 0 }}>{e.sev}</span>
              </div>
            ))}
          </div>
        )}
        <div style={{ padding: 16 }}>
          {mine.length === 0
            ? <div style={{ background: "#fff", borderRadius: 14, padding: "30px 20px", textAlign: "center", color: TXT2 }}>Nessun post da mostrare.</div>
            : mine.map(p => <PostCard key={p.id} post={p} onStar={onStar} onChat={onPostChat} canDelete={isAdmin} onEdit={onEdit} onOpenPhoto={onOpenPhoto} />)}
        </div>
      </div>
    </>
  );
}

// ─── ADD CONTACT MODAL ──────────────────────────────────────────────────────
function AddContactModal({ people, contacts, onAdd, onClose }) {
  const available = people.filter(p => !contacts.some(c => c.id === p.id));
  return (
    <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(20,40,65,.5)", display: "flex", alignItems: "flex-end", zIndex: 50 }}>
      <div onClick={e => e.stopPropagation()} className="fade-up" style={{ width: "100%", background: "#fff", borderRadius: "20px 20px 0 0", padding: "20px 16px 28px", maxHeight: "70%", overflowY: "auto" }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: TXT, marginBottom: 14 }}>Aggiungi contatto</div>
        {available.length === 0 ? <div style={{ color: TXT2, fontSize: 14, padding: "10px 0" }}>Hai già aggiunto tutti gli utenti disponibili 🎉</div> : available.map(p => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderBottom: `1px solid ${LINE}` }}>
            <img src={p.ava} style={{ width: 46, height: 46, borderRadius: "50%", objectFit: "cover" }} alt="" />
            <div style={{ flex: 1 }}><div style={{ fontWeight: 600, color: HBLUE }}>{p.name}</div><div style={{ fontSize: 12, color: TXT2 }}>{p.city}</div></div>
            <button onClick={() => onAdd(p)} style={{ width: 36, height: 36, borderRadius: "50%", background: HBLUE, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><NavIcon name="plus" size={18} color="#fff" sw={2.4} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ADD EVENT MODAL ──────────────────────────────────────────────────────────
function AddEventModal({ onAdd, onClose, user, geo, locName }) {
  const [type, setType] = useState(EVENT_TYPES[0]);
  const [cat, setCat] = useState(EVENT_CATEGORIES[0]);
  const [title, setTitle] = useState("");
  const [place, setPlace] = useState(locName || user.city);
  const [sev, setSev] = useState("Media");
  const [ends, setEnds] = useState(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));   // scadenza consigliata: un mese
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  useEffect(() => { if (geo && !coords) setCoords({ lat: +geo.lat.toFixed(5), lng: +geo.lng.toFixed(5) }); }, [geo]);   // posizione viva, subito
  const locate = () => {
    setLocating(true);
    if (!navigator.geolocation) { setCoords(geo ? { ...geo } : { ...BASE_COORDS, approx: true }); setLocating(false); return; }
    navigator.geolocation.getCurrentPosition(
      pos => { setCoords({ lat: +pos.coords.latitude.toFixed(5), lng: +pos.coords.longitude.toFixed(5) }); setLocating(false); },
      () => { setCoords(geo ? { ...geo } : { ...BASE_COORDS, approx: true }); setLocating(false); },   // ripiego: la posizione viva dell'app
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };
  const submit = () => {
    if (!title.trim()) return;
    const c = coords || (geo ? { lat: +geo.lat.toFixed(5), lng: +geo.lng.toFixed(5) } : { lat: +(BASE_COORDS.lat + (Math.random() - .5) * .05).toFixed(5), lng: +(BASE_COORDS.lng + (Math.random() - .5) * .05).toFixed(5), approx: true });
    const category = cat === EVENT_CATEGORIES[0] ? "" : cat;
    const t = type === EVENT_TYPES[0] ? "" : type.split(" ")[0];
    onAdd({ type: t, title: title.trim(), place, sev, user: user.name, lat: c.lat, lng: c.lng, cat: category, ends });
  };
  return (
    <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(20,40,65,.5)", display: "flex", alignItems: "flex-end", zIndex: 50 }}>
      <div onClick={e => e.stopPropagation()} className="fade-up" style={{ width: "100%", background: "#fff", borderRadius: "20px 20px 0 0", padding: "20px 16px 28px" }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: TXT, marginBottom: 14 }}>Segnala un evento</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* 1° rigo: tipo */}
          <select value={type} onChange={e => setType(e.target.value)} style={{ background: BODY, border: `1.5px solid ${LINE}`, borderRadius: 12, padding: "11px 10px", fontSize: 14, color: type === EVENT_TYPES[0] ? TXT2 : TXT }}>{EVENT_TYPES.map(t => <option key={t}>{t}</option>)}</select>
          {/* 2° rigo: categoria evento */}
          <select value={cat} onChange={e => setCat(e.target.value)} style={{ background: BODY, border: `1.5px solid ${LINE}`, borderRadius: 12, padding: "11px 10px", fontSize: 14, color: cat === EVENT_CATEGORIES[0] ? TXT2 : TXT }}>{EVENT_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
          {/* titolo */}
          <input placeholder="Titolo (es. Temporale violento)" value={title} onChange={e => setTitle(e.target.value)} style={{ background: BODY, border: `1.5px solid ${LINE}`, borderRadius: 12, padding: "12px 14px", fontSize: 14, color: TXT, outline: "none" }} />
          {/* 3° rigo: localizzazione */}
          <div>
            <div style={{ fontSize: 11, color: TXT2, marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em" }}>Localizzazione</div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: TXT2, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Valido fino a</div>
        <input type="date" value={ends} min={new Date().toISOString().slice(0, 10)} onChange={e => setEnds(e.target.value)} style={{ background: BODY, border: `1.5px solid ${LINE}`, borderRadius: 12, padding: "11px 14px", fontSize: 14, color: TXT, outline: "none", marginBottom: 12, width: "100%" }} />
        <input placeholder="Luogo" value={place} onChange={e => setPlace(e.target.value)} style={{ flex: 1, background: BODY, border: `1.5px solid ${LINE}`, borderRadius: 12, padding: "12px 14px", fontSize: 14, color: TXT, outline: "none" }} />
              <button onClick={locate} style={{ flexShrink: 0, padding: "0 14px", borderRadius: 12, border: `1.5px solid ${HBLUE}`, background: coords ? HBLUE : HBLUE + "10", color: coords ? "#fff" : HBLUE, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "'Sora',sans-serif" }}>
                <NavIcon name="locate" size={18} color={coords ? "#fff" : HBLUE} /> {locating ? "…" : "GPS"}
              </button>
            </div>
            {coords && <div style={{ marginTop: 6, fontSize: 12, color: "#3BA776", display: "flex", alignItems: "center", gap: 5 }}><NavIcon name="check" size={14} color="#3BA776" sw={2.4} /> Posizione {coords.approx ? "approssimativa" : "acquisita"}: {coords.lat}, {coords.lng}</div>}
          </div>
          {/* 4° rigo: gravità */}
          <div style={{ display: "flex", gap: 8 }}>{["Bassa", "Media", "Alta"].map(s => <button key={s} onClick={() => setSev(s)} style={{ flex: 1, padding: 10, borderRadius: 10, border: sev === s ? `2px solid ${HBLUE}` : `1.5px solid ${LINE}`, background: sev === s ? HBLUE + "12" : "#fff", color: sev === s ? HBLUE : TXT2, fontWeight: 600, cursor: "pointer", fontFamily: "'Sora',sans-serif" }}>{s}</button>)}</div>
          <button onClick={submit} style={{ padding: 13, borderRadius: 12, border: "none", background: `linear-gradient(135deg,${HBLUE},#1B4E96)`, color: "#fff", fontWeight: 600, cursor: "pointer", fontFamily: "'Sora',sans-serif" }}>Pubblica evento</button>
        </div>
      </div>
    </div>
  );
}

// ─── AVATAR EDITOR ────────────────────────────────────────────────────────────
function AvatarEditor({ current, onPick, onClose }) {
  const emojis = ["🌤️", "🌻", "🦋", "🌺", "⚡", "🌊", "🔥", "❄️", "🍃", "☀️", "🌈", "🌙", "⛅", "🌧️", "🐞", "🦉"];
  const fileRef = useRef(null);
  const upload = e => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => onPick(r.result); r.readAsDataURL(f); };
  return (
    <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(20,40,65,.5)", display: "flex", alignItems: "flex-end", zIndex: 60 }}>
      <div onClick={e => e.stopPropagation()} className="fade-up" style={{ width: "100%", background: "#fff", borderRadius: "20px 20px 0 0", padding: "20px 16px 28px" }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: TXT, marginBottom: 16 }}>Icona profilo</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
          <UserAvatar src={current} size={64} />
          <button onClick={() => fileRef.current?.click()} style={{ flex: 1, padding: "13px", borderRadius: 12, border: `1.5px solid ${HBLUE}`, background: HBLUE + "10", color: HBLUE, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "'Sora',sans-serif" }}>
            <NavIcon name="camera" size={18} color={HBLUE} /> Carica un'immagine
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={upload} style={{ display: "none" }} />
        </div>
        <div style={{ fontSize: 12, color: TXT2, marginBottom: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em" }}>Oppure scegli un'emoji</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(8,1fr)", gap: 8 }}>
          {emojis.map(e => (
            <button key={e} onClick={() => onPick(e)} style={{ aspectRatio: "1", borderRadius: 12, border: current === e ? `2px solid ${HBLUE}` : `1.5px solid ${LINE}`, background: current === e ? HBLUE + "14" : BODY, fontSize: 22, cursor: "pointer" }}>{e}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── EVENT MAP (cartina con il punto) ─────────────────────────────────────────
// ─── PAGINA LUOGO (utenti collegati + chat + eventi) ──────────────────────────
function PlaceView({ place, people, events, posts, onBack, onChat, onPostChat, onEvents, onOpenUser, onStar, following, onFollow, onReport, reported, isAdmin, onEdit, onOpenPhoto }) {
  const fmt = d => (d % 1 === 0 ? String(d) : String(d).replace(".", ",")) + " km";
  const evCount = events.filter(e => e.place === place.name).length || place.events;
  const placePosts = (posts || []).filter(p => p.city === place.name)
    .slice().sort((a, b) => new Date(b.ts) - new Date(a.ts));
  // le api del luogo: chi ci ha scattato post, o chi ci abita (città del profilo)
  const authorIds = new Set(placePosts.map(p => p.uid).filter(Boolean));
  const authorNames = new Set(placePosts.map(p => p.user).filter(Boolean));
  const users = (place.users && place.users.length) ? place.users
    : (people || []).filter(c => authorIds.has(c.id) || authorNames.has(c.name) || (c.city || "").toLowerCase() === place.name.toLowerCase());
  return (
    <>
      <Header title={place.name} left={<button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", color: "#fff" }}><NavIcon name="back" size={22} color="#fff" /></button>} right={<span style={{ width: 24 }} />} />
      <div style={{ flex: 1, overflowY: "auto", background: BODY }}>
        {/* riepilogo luogo */}
        <div style={{ background: "#fff", padding: "14px 16px", borderBottom: `1px solid ${LINE}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 46, height: 46, borderRadius: "50%", background: HBLUE + "12", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><NavIcon name="pin" size={24} color={HBLUE} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 20, color: HBLUE, lineHeight: 1.1 }}>{place.name}</div>
              <div style={{ fontSize: 13, color: TXT2, marginTop: 1 }}>{fmt(place.dist)} da te · {users.length} utenti collegati{placePosts.length > 0 ? ` · ${placePosts.length} foto` : ""}</div>
            </div>
          </div>
          {/* azioni */}
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button onClick={() => onChat(place)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "10px 8px", borderRadius: 12, border: "none", background: `linear-gradient(135deg,${HBLUE},#1B4E96)`, color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "'Sora',sans-serif" }}><span style={{ fontSize: 14 }}>🌐</span> Chat pubblica</button>
            <button onClick={() => onEvents(place)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "10px 8px", borderRadius: 12, border: `1.5px solid ${HBLUE}`, background: "#fff", color: HBLUE, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "'Sora',sans-serif" }}><NavIcon name="eventi" size={16} color={HBLUE} /> Eventi ({evCount})</button>
          </div>
        </div>

        {/* post pubblicati nel luogo (in tempo reale) */}
        <div style={{ padding: "12px 16px 2px", fontSize: 11, fontWeight: 700, color: TXT2, textTransform: "uppercase", letterSpacing: ".06em" }}>Post da {place.name}</div>
        <div style={{ padding: "8px 14px 0" }}>
          {placePosts.length === 0
            ? <div style={{ background: "#fff", borderRadius: 12, padding: "26px 20px", textAlign: "center", color: TXT2, fontSize: 13.5, border: `1px solid ${LINE}` }}>Ancora nessun post da {place.name}. Sii il primo a condividere il meteo!</div>
            : placePosts.map(p => <PostCard key={p.id} post={p} onStar={onStar} onChat={onPostChat} onOpenUser={onOpenUser} isFollowing={following?.includes(p.user)} onFollow={onFollow} onReport={onReport} reported={reported?.includes(p.id)} canDelete={p.mine || isAdmin} onEdit={onEdit} onOpenPhoto={onOpenPhoto} />)}
        </div>

        {/* utenti collegati al luogo */}
        <div style={{ padding: "12px 16px 6px", fontSize: 11, fontWeight: 700, color: TXT2, textTransform: "uppercase", letterSpacing: ".06em" }}>Api a {place.name} 🐝</div>
        {users.map(u => (
          <div key={u.uid || u.id || u.name} onClick={() => onOpenUser(u)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderBottom: `1px solid ${LINE}`, background: "#fff", cursor: "pointer" }}>
            <UserAvatar src={u.ava} size={50} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: HBLUE }}>{u.name}{u.me && <span style={{ color: TXT2, fontWeight: 500 }}> (tu)</span>}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: TXT2 }}><NavIcon name="pin" size={13} color={TXT2} /> {place.name}</div>
            </div>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#3BA776", flexShrink: 0 }} title="online" />
          </div>
        ))}
      </div>
    </>
  );
}

// ─── EVENTI DI UN LUOGO (overlay) ─────────────────────────────────────────────
function PlaceEventsView({ place, events, onBack, onOpen }) {
  const sevColor = { Alta: "#E5484D", Media: "#EFA23C", Bassa: "#3BA776" };
  const list = events.filter(e => e.place === place.name);
  return (
    <>
      <Header title={`Eventi · ${place.name}`} left={<button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", color: "#fff" }}><NavIcon name="back" size={22} color="#fff" /></button>} right={<span style={{ width: 24 }} />} />
      <div style={{ flex: 1, overflowY: "auto", background: BODY, padding: "14px 14px" }}>
        <div style={{ fontSize: 12, color: TXT2, marginBottom: 12, fontWeight: 500 }}>{list.length} eventi a {place.name}</div>
        {list.length === 0
          ? <div style={{ background: "#fff", borderRadius: 14, padding: "34px 20px", textAlign: "center", color: TXT2, fontSize: 14 }}>Nessun evento attivo a {place.name} in questo momento.</div>
          : list.map(e => (
            <div key={e.id} className="fade-up" onClick={() => onOpen(e)} style={{ background: "#fff", borderRadius: 14, padding: 14, marginBottom: 12, boxShadow: `0 2px 10px ${HBLUE}0D`, borderLeft: `5px solid ${sevColor[e.sev]}`, cursor: "pointer" }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div style={{ fontSize: 34 }}>{e.type || (e.cat ? e.cat.split(" ")[0] : "📍")}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, color: TXT }}>{e.title}</div>
                  {e.cat && <span style={{ display: "inline-block", marginTop: 4, fontSize: 11, fontWeight: 600, color: HBLUE, background: HBLUE + "12", borderRadius: 8, padding: "2px 8px" }}>{e.cat}</span>}
                  <div style={{ fontSize: 12, color: TXT2, marginTop: 2 }}>{e.time}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: sevColor[e.sev], background: sevColor[e.sev] + "1A", borderRadius: 8, padding: "4px 9px" }}>{e.sev}</span>
              </div>
            </div>
          ))}
      </div>
    </>
  );
}


function EventMapView({ event, onBack }) {
  const sevColor = { Alta: "#E5484D", Media: "#EFA23C", Bassa: "#3BA776" };
  const { lat, lng } = event;
  const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
  return (
    <>
      <Header title="Posizione evento" left={<button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", display: "flex" }}><NavIcon name="back" size={22} color="#fff" /></button>} />
      <div style={{ flex: 1, overflowY: "auto", background: BODY }}>
        {/* riepilogo evento */}
        <div style={{ background: "#fff", margin: 14, borderRadius: 14, padding: 14, display: "flex", gap: 12, alignItems: "center", boxShadow: `0 2px 10px ${HBLUE}0D`, borderLeft: `5px solid ${sevColor[event.sev]}` }}>
          <div style={{ fontSize: 32 }}>{event.type || (event.cat ? event.cat.split(" ")[0] : "📍")}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 15, color: TXT }}>{event.title}</div>
            {event.cat && <span style={{ display: "inline-block", marginTop: 3, fontSize: 11, fontWeight: 600, color: HBLUE, background: HBLUE + "12", borderRadius: 8, padding: "2px 8px" }}>{event.cat}</span>}
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: TXT2, marginTop: 2 }}><NavIcon name="pin" size={13} color={TXT2} /> {event.place} · {event.time}</div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: sevColor[event.sev], background: sevColor[event.sev] + "1A", borderRadius: 8, padding: "4px 9px" }}>{event.sev}</span>
        </div>

        {/* cartina schematica */}
        <div style={{ position: "relative", margin: "0 14px", height: 320, borderRadius: 16, overflow: "hidden", boxShadow: `0 2px 14px ${HBLUE}1A` }}>
          <svg viewBox="0 0 360 320" style={{ width: "100%", height: "100%", display: "block" }}>
            <rect width="360" height="320" fill="#E7EFE3" />
            {/* blocchi/isolati */}
            {[[18, 20], [150, 18], [255, 30], [30, 130], [240, 150], [60, 235], [230, 250]].map((b, i) => <rect key={i} x={b[0]} y={b[1]} width="70" height="52" rx="6" fill="#DCE6D5" />)}
            {/* corsi d'acqua / verde */}
            <path d="M0 300 Q120 250 200 300 T360 290 L360 320 L0 320 Z" fill="#BFE0EA" />
            {/* strade */}
            <line x1="0" y1="110" x2="360" y2="125" stroke="#fff" strokeWidth="10" />
            <line x1="0" y1="210" x2="360" y2="200" stroke="#fff" strokeWidth="8" />
            <line x1="120" y1="0" x2="135" y2="320" stroke="#fff" strokeWidth="9" />
            <line x1="245" y1="0" x2="230" y2="320" stroke="#fff" strokeWidth="7" />
            {/* alone precisione */}
            <circle cx="180" cy="160" r="40" fill={HBLUE} opacity="0.12" />
            <circle cx="180" cy="160" r="40" fill="none" stroke={HBLUE} strokeOpacity="0.3" strokeWidth="1.5" />
          </svg>
          {/* pin */}
          <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-100%)", animation: "drop .5s cubic-bezier(.2,.8,.3,1) both" }}>
            <svg width="44" height="56" viewBox="0 0 44 56">
              <path d="M22 2C11 2 2 11 2 22c0 14 20 32 20 32s20-18 20-32C42 11 33 2 22 2z" fill={sevColor[event.sev]} stroke="#fff" strokeWidth="2.5" />
              <circle cx="22" cy="22" r="8" fill="#fff" />
              <text x="22" y="28" fontSize="13" textAnchor="middle">{event.type || (event.cat ? event.cat.split(" ")[0] : "📍")}</text>
            </svg>
          </div>
          {/* chip coordinate */}
          <div style={{ position: "absolute", left: 12, bottom: 12, background: "rgba(255,255,255,.92)", borderRadius: 10, padding: "6px 10px", fontSize: 12, color: TXT, fontFamily: "'Space Grotesk',sans-serif", boxShadow: "0 2px 8px rgba(0,0,0,.12)" }}>
            📍 {lat}, {lng}
          </div>
        </div>

        <div style={{ padding: 14 }}>
          <button onClick={() => window.open(mapsUrl, "_blank")} style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", background: `linear-gradient(135deg,${HBLUE},#1B4E96)`, color: "#fff", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "'Sora',sans-serif" }}>
            <NavIcon name="pin" size={18} color="#fff" /> Apri in Google Maps
          </button>
        </div>
      </div>
    </>
  );
}

// ─── INTERRUTTORE (switch) ────────────────────────────────────────────────────
function Toggle({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} style={{ width: 46, height: 27, borderRadius: 14, border: "none", cursor: "pointer", background: on ? HBLUE : "#C9D7E6", position: "relative", transition: "background .2s", flexShrink: 0, padding: 0 }}>
      <span style={{ position: "absolute", top: 3, left: on ? 22 : 3, width: 21, height: 21, borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.25)" }} />
    </button>
  );
}

// ─── IMPOSTAZIONI NOTIFICHE ───────────────────────────────────────────────────
// ── Permessi del telefono: stato + richiesta ripetibile ──────────────────────
function PermissionsPanel({ onGeoGranted }) {
  const [st, setSt] = useState({ geo: "?", cam: "?", ntf: typeof Notification !== "undefined" ? Notification.permission : "unsupported" });
  const refresh = async () => {
    const next = { ...st };
    try { next.geo = (await navigator.permissions.query({ name: "geolocation" })).state; } catch (_) {}
    try { next.cam = (await navigator.permissions.query({ name: "camera" })).state; } catch (_) {}
    if (typeof Notification !== "undefined") next.ntf = Notification.permission;
    setSt(next);
  };
  useEffect(() => { refresh(); }, []);
  const deniedHelp = () => alert("Il sistema ha memorizzato il rifiuto e non rimostra la domanda.\nSblocca a mano: icona 🔒 nella barra dell'indirizzo → Autorizzazioni → Consenti, poi ricarica.\nSu iPhone: Impostazioni → Safari → (Posizione / Fotocamera) → Consenti.");
  const askGeo = () => {
    if (!navigator.geolocation) { alert("GPS non disponibile in questo browser."); return; }
    navigator.geolocation.getCurrentPosition(
      p => { onGeoGranted && onGeoGranted({ lat: p.coords.latitude, lng: p.coords.longitude }); alert("Posizione consentita ✓"); refresh(); },
      e => { if (e.code === 1) deniedHelp(); else alert("Posizione non ottenuta: " + e.message); refresh(); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };
  const askCam = async () => {
    if (!navigator.mediaDevices?.getUserMedia) { alert("Fotocamera non disponibile in questo browser (se sei in WhatsApp/Instagram: apri in Safari o Chrome)."); return; }
    try { const t = await navigator.mediaDevices.getUserMedia({ video: true }); t.getTracks().forEach(x => x.stop()); alert("Fotocamera consentita ✓"); }
    catch (e) { if (e?.name === "NotAllowedError") deniedHelp(); else alert("Fotocamera non ottenuta: " + (e?.message || e)); }
    refresh();
  };
  const askNtf = async () => {
    if (typeof Notification === "undefined") { alert("Notifiche non supportate in questo browser."); return; }
    const r = await Notification.requestPermission();
    if (r === "granted") alert("Notifiche consentite ✓"); else if (r === "denied") deniedHelp();
    refresh();
  };
  const Row = ({ emoji, label, state, onAsk }) => {
    const ok = state === "granted";
    const no = state === "denied";
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: `1px solid ${LINE}` }}>
        <span style={{ fontSize: 18, width: 26, textAlign: "center" }}>{emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: TXT }}>{label}</div>
          <div style={{ fontSize: 11.5, color: ok ? "#2C7A57" : no ? "#C43C41" : TXT2 }}>{ok ? "Consentito ✓" : no ? "Negato dal sistema" : "Da richiedere"}</div>
        </div>
        {!ok && <button onClick={onAsk} style={{ padding: "7px 12px", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${HBLUE},#1B4E96)`, color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: "'Sora',sans-serif" }}>Richiedi</button>}
      </div>
    );
  };
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "6px 16px 4px", marginTop: 14, boxShadow: `0 2px 12px ${HBLUE}14` }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: TXT2, textTransform: "uppercase", letterSpacing: ".06em", padding: "10px 0 4px" }}>Permessi del telefono</div>
      <Row emoji="📍" label="Posizione" state={st.geo} onAsk={askGeo} />
      <Row emoji="📷" label="Fotocamera" state={st.cam} onAsk={askCam} />
      <div style={{ borderBottom: "none" }}><Row emoji="🔔" label="Notifiche" state={st.ntf} onAsk={askNtf} /></div>
    </div>
  );
}

function NotifSettingsView({ settings, onChange, onClose, pushState, onEnablePush, onGeoGranted }) {
  const [perm, setPerm] = useState(typeof Notification !== "undefined" ? Notification.permission : "unsupported");
  const set = (k, v) => onChange({ ...settings, [k]: v });
  const enableMaster = async v => {
    if (v && typeof Notification !== "undefined" && Notification.requestPermission) {
      try { const r = await Notification.requestPermission(); setPerm(r); } catch { /* ignora */ }
    }
    set("enabled", v);
  };
  const pushLabel = { on: "Attive su questo dispositivo ✓", off: "Da attivare su questo dispositivo", denied: "Bloccate dal browser (sbloccale nelle impostazioni del sito)", unsupported: "Non supportate qui (iPhone: aggiungi ad Home)" }[pushState || "off"];
  const Row = ({ icon, label, desc, children }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: `1px solid ${LINE}` }}>
      {icon && <div style={{ width: 38, height: 38, borderRadius: 11, background: HBLUE + "12", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><NavIcon name={icon} size={19} color={HBLUE} /></div>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14.5, color: TXT }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: TXT2, marginTop: 1, lineHeight: 1.4 }}>{desc}</div>}
      </div>
      {children}
    </div>
  );
  const off = !settings.enabled;
  const permLabel = { granted: "Permesso concesso", denied: "Permesso negato dal browser", default: "Permesso non ancora richiesto", unsupported: "Non supportato in questo contesto" }[perm] || "";
  return (
    <div style={{ position: "absolute", inset: 0, background: BODY, zIndex: 80, display: "flex", flexDirection: "column" }}>
      <Header title="Notifiche" left={<button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", color: "#fff" }}><NavIcon name="back" size={22} color="#fff" /></button>} right={<span style={{ width: 24 }} />} />
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ background: "#fff", marginTop: 12 }}>
          <Row icon="bell" label="Abilita notifiche" desc={permLabel}><Toggle on={settings.enabled} onChange={enableMaster} /></Row>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: `1px solid ${LINE}`, background: HBLUE + "06" }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: ACCENT + "33", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><NavIcon name="bell" size={19} color="#8A5A12" /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14.5, color: TXT }}>Push sul telefono</div>
              <div style={{ fontSize: 12, color: TXT2, marginTop: 1, lineHeight: 1.4 }}>{pushLabel}</div>
            </div>
            {(pushState === "off" || !pushState) &&
              <button onClick={onEnablePush} style={{ flexShrink: 0, padding: "8px 14px", borderRadius: 18, border: "none", background: `linear-gradient(135deg,${HBLUE},#1B4E96)`, color: "#fff", fontWeight: 600, fontSize: 12.5, cursor: "pointer", fontFamily: "'Sora',sans-serif" }}>Attiva</button>}
            {pushState === "on" && <NavIcon name="check" size={20} color="#3BA776" sw={2.4} />}
          </div>
        </div>

        <div style={{ padding: "16px 16px 6px", fontSize: 11, fontWeight: 700, color: TXT2, textTransform: "uppercase", letterSpacing: ".06em", opacity: off ? .5 : 1 }}>Raggio di prossimità</div>
        <div style={{ background: "#fff", padding: "14px 16px", borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}`, opacity: off ? .5 : 1, pointerEvents: off ? "none" : "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: TXT, marginBottom: 8 }}><span>Avvisami entro</span><b style={{ color: HBLUE }}>{settings.radiusKm} km</b></div>
          <input type="range" min="1" max="100" value={settings.radiusKm} onChange={e => set("radiusKm", +e.target.value)} style={{ width: "100%", accentColor: ACCENT }} />
        </div>

        <div style={{ padding: "16px 16px 6px", fontSize: 11, fontWeight: 700, color: TXT2, textTransform: "uppercase", letterSpacing: ".06em", opacity: off ? .5 : 1 }}>Cosa notificare</div>
        <div style={{ background: "#fff", borderTop: `1px solid ${LINE}`, opacity: off ? .5 : 1, pointerEvents: off ? "none" : "auto" }}>
          <Row icon="camera" label="Nuovi post" desc="Foto meteo pubblicate vicino a te"><Toggle on={settings.posts} onChange={v => set("posts", v)} /></Row>
          <Row icon="pin" label="Eventi" desc="Eventi e segnalazioni nella tua zona"><Toggle on={settings.eventi} onChange={v => set("eventi", v)} /></Row>
          <Row icon="bell" label="Allerte meteo" desc="Temporali, mareggiate e avvisi importanti"><Toggle on={settings.allerte} onChange={v => set("allerte", v)} /></Row>
          <Row icon="send" label="Messaggi" desc="Chat e messaggi di gruppo"><Toggle on={settings.messaggi} onChange={v => set("messaggi", v)} /></Row>
        </div>

        <div style={{ padding: "16px 16px 6px", fontSize: 11, fontWeight: 700, color: TXT2, textTransform: "uppercase", letterSpacing: ".06em", opacity: off ? .5 : 1 }}>Orari di silenzio</div>
        <div style={{ background: "#fff", borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}`, opacity: off ? .5 : 1, pointerEvents: off ? "none" : "auto" }}>
          <Row label="Non disturbare (22:00 – 8:00)" desc="Nessuna notifica durante la notte"><Toggle on={settings.quiet} onChange={v => set("quiet", v)} /></Row>
        </div>

        <div style={{ padding: "16px", fontSize: 12, color: TXT2, lineHeight: 1.5 }}>
          Le notifiche di prossimità usano la tua posizione e richiedono il permesso del dispositivo. Le notifiche push reali funzionano solo con l'app installata dallo store; in anteprima questa è una simulazione delle impostazioni.
        </div>
        <PermissionsPanel onGeoGranted={onGeoGranted} />
      </div>
    </div>
  );
}

// ─── RICERCA (persone, luoghi, eventi) ────────────────────────────────────────
function SearchView({ people, events, places, km, setKm, onClose, onPerson, onPlace, onOpenNearPlace, onEvent, nearPlaces, onRemotePlaces, contactDist, tab, onTab }) {
  const [q, setQ] = useState("");
  const [remote, setRemote] = useState([]);
  const [worldOn, setWorldOn] = useState(false);
  const [worldAll, setWorldAll] = useState(null);
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);
  useEffect(() => {
    if (worldOn && worldAll === null && onRemotePlaces)
      onRemotePlaces("").then(setWorldAll).catch(() => setWorldAll([]));   // Mondo: tutte le città con post
  }, [worldOn]);
  useEffect(() => {
    if (worldOn || !onRemotePlaces || q.trim().length < 3) { setRemote([]); return; }
    const t = setTimeout(() => { onRemotePlaces(q.trim()).then(setRemote).catch(() => setRemote([])); }, 400);
    return () => clearTimeout(t);
  }, [q, worldOn]);
  const ql = q.trim().toLowerCase();
  const match = s => (s || "").toLowerCase().includes(ql);
  const nearBase = (nearPlaces || []).filter(p => p.dist <= km);
  const baseNames = new Set(nearBase.map(p => p.name.toLowerCase()));
  const near = (worldOn
    ? (worldAll || []).slice().sort((a, b) => a.name.localeCompare(b.name, "it"))
    : [...nearBase, ...remote.filter(r => !baseNames.has(r.name.toLowerCase()))]
  ).filter(p => !ql || match(p.name));
  const nearNames = new Set(near.map(p => p.name));
  const inRange = p => worldOn || !contactDist || contactDist[p.id] === undefined || contactDist[p.id] <= km;
  const fp = people.filter(inRange)
    .filter(p => !ql || match(p.name) || match(p.city))
    .slice().sort((a, b) => a.name.localeCompare(b.name, "it"));
  const fpl = worldOn ? [] : places.filter(c => !nearNames.has(c)).filter(c => !ql || match(c));
  const fe = events.filter(e => (worldOn || e.dist <= km) && (!ql || match(e.title) || match(e.place)));
  const fmt = d => (d % 1 === 0 ? String(d) : String(d).replace(".", ",")) + " km";
  const Section = ({ label, children, count }) => count === 0 ? null : (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: TXT2, textTransform: "uppercase", letterSpacing: ".07em", padding: "0 16px 8px" }}>{label} ({count})</div>
      {children}
    </div>
  );
  const Row = ({ icon, ava, title, sub, onClick }) => (
    <button onClick={onClick} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", background: "none", border: "none", borderBottom: `1px solid ${LINE}`, cursor: "pointer", textAlign: "left" }}>
      {ava ? <UserAvatar src={ava} size={40} /> : <div style={{ width: 40, height: 40, borderRadius: 12, background: HBLUE + "12", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{typeof icon === "string" ? <span style={{ fontSize: 20 }}>{icon}</span> : icon}</div>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 15, color: TXT }}>{title}</div>
        {sub && <div style={{ fontSize: 12.5, color: TXT2, marginTop: 1 }}>{sub}</div>}
      </div>
      <NavIcon name="back" size={15} color={TXT2} sw={2.2} />
    </button>
  );
  const empty = ql && near.length === 0 && fp.length === 0 && fpl.length === 0 && fe.length === 0;
  return (
    <div style={{ position: "absolute", inset: 0, background: BODY, zIndex: 80, display: "flex", flexDirection: "column" }}>
      {/* barra di ricerca */}
      <div style={{ background: HBLUE, padding: "12px 14px", paddingTop: "calc(12px + env(safe-area-inset-top, 0px))", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", display: "flex" }}><NavIcon name="back" size={22} color="#fff" /></button>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: "#ffffff", borderRadius: 12, padding: "9px 12px" }}>
          <NavIcon name="search" size={18} color={TXT2} />
          <input ref={ref} value={q} onChange={e => setQ(e.target.value)} placeholder={worldOn ? "Cerca in tutto il mondo…" : "Cerca persone, luoghi, eventi…"} style={{ flex: 1, border: "none", outline: "none", background: "none", fontSize: 14, color: TXT, fontFamily: "'Sora',sans-serif" }} />
          {q && <button onClick={() => setQ("")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0 }}><NavIcon name="close" size={16} color={TXT2} sw={2.2} /></button>}
          <WorldBtn on={worldOn} onClick={() => setWorldOn(v => !v)} h={30} />
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", paddingTop: 14 }}>
        {empty ? (
          <div style={{ textAlign: "center", color: TXT2, padding: "50px 24px", fontSize: 14 }}>
            <div style={{ marginBottom: 10 }}><NavIcon name="search" size={40} color={TXT2} sw={1.5} /></div>
            Nessun risultato per “{q}”.
          </div>
        ) : (
          <>
            <Section label="Luoghi vicino a te" count={near.length}>
              {near.map(p => <Row key={"n" + p.id} icon={<NavIcon name="pin" size={20} color={HBLUE} />} title={p.name} sub={`📍 ${fmt(p.dist)} da te · ${p.photos ?? 0} post · ${p.events ?? 0} eventi · ${p.users?.length ?? 0} utenti`} onClick={() => onOpenNearPlace(p)} />)}
            </Section>
            <Section label="Persone" count={fp.length}>
              {fp.map(p => <Row key={"p" + p.id} ava={p.ava} title={p.name} sub={"📍 " + p.city} onClick={() => onPerson(p)} />)}
            </Section>
            <Section label="Altri luoghi" count={fpl.length}>
              {fpl.map(c => <Row key={"l" + c} icon={<NavIcon name="pin" size={20} color={HBLUE} />} title={c} sub="Esplora la zona sulla mappa" onClick={() => onPlace(c)} />)}
            </Section>
            <Section label="Eventi" count={fe.length}>
              {fe.map(e => <Row key={"e" + e.id} icon={e.type} title={e.title} sub={"📍 " + e.place + " · " + e.time} onClick={() => onEvent(e)} />)}
            </Section>
          </>
        )}
      </div>
      {!worldOn && setKm && <RadarBar km={km} setKm={setKm} />}
      {onTab && <BottomNav tab={tab} setTab={onTab} />}
    </div>
  );
}

// ─── FRAME RESPONSIVO (scala in base a telefono/OS) ──────────────────────────
function Frame({ children }) {
  const [vp, setVp] = useState(() => ({
    w: typeof window !== "undefined" ? window.innerWidth : 390,
    h: typeof window !== "undefined" ? window.innerHeight : 780,
  }));
  useEffect(() => {
    const onR = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onR);
    window.addEventListener("orientationchange", onR);
    if (window.visualViewport) window.visualViewport.addEventListener("resize", onR);
    onR();
    return () => {
      window.removeEventListener("resize", onR);
      window.removeEventListener("orientationchange", onR);
      if (window.visualViewport) window.visualViewport.removeEventListener("resize", onR);
    };
  }, []);
  const DESIGN_W = 390;            // larghezza di riferimento (telefono base)
  const MAX_W = 520;               // oltre questa larghezza resta centrato (tablet/desktop)
  const visualW = Math.min(vp.w, MAX_W);
  const scale = visualW / DESIGN_W;          // proporzionale alla grandezza del telefono
  const frameH = vp.h / scale;               // così, scalato, riempie esattamente l'altezza
  const isWide = vp.w > MAX_W;
  return (
    <>
      <style>{G}</style>
      <div style={{ position: "fixed", inset: 0, background: isWide ? "#C7D9E8" : BODY, display: "flex", justifyContent: "center", alignItems: "flex-start", overflow: "hidden" }}>
        <div style={{ position: "relative", width: DESIGN_W, height: frameH, transform: `scale(${scale})`, transformOrigin: "top center", display: "flex", flexDirection: "column", overflow: "hidden", background: BODY, boxShadow: isWide ? "0 0 50px rgba(20,40,65,.28)" : "none" }}>
          {children}
        </div>
      </div>
    </>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
function AppInner() {
  const [sb, setSb] = useState(null);           // modulo Supabase (se presente e configurato)
  const [myUid, setMyUid] = useState(null);
  useEffect(() => {
    import("./beeweat-supabase.js")
      .then(m => { setSb(m); if (m.isConfigured) m.getCurrentProfile().then(p => { if (p) setUser({ name: p.name, city: p.city || CITY, mine: true, avatar: p.avatar_url || "🌤️" }); }).catch(() => {}); })
      .catch(() => {});                          // modulo assente (anteprima): resta la demo
  }, []);

  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("feed");
  const [overlay, setOverlay] = useState(null); // null | "post" | "profile" | {chat} | "addContact" | "addEvent"
  // ── Tasto/gesto "indietro" del browser: chiude i sottomenu invece di uscire dal sito ──
  const overlayNavRef = useRef(null); overlayNavRef.current = overlay;
  const prevOverlayRef = useRef(null);
  const popHandledRef = useRef(false);
  useEffect(() => {
    const prev = prevOverlayRef.current; prevOverlayRef.current = overlay;
    if (popHandledRef.current) { popHandledRef.current = false; return; }         // transizione causata dal back: storia già a posto
    if (prev === null && overlay !== null) window.history.pushState({ bw: 1 }, ""); // apro un sottomenu: pianto la sentinella
    else if (prev !== null && overlay === null) { try { window.history.back(); } catch (_) {} } // chiuso con la "<": consumo la sentinella
  }, [overlay]);
  useEffect(() => {
    const onPop = () => {
      const o = overlayNavRef.current;
      if (o === null) return;                                                     // nulla di aperto: il browser fa il suo corso
      popHandledRef.current = true;
      const next = (typeof o === "object" && o !== null && "back" in o) ? (o.back || null) : null;
      setOverlay(next);                                                           // stesso passo indietro della "<"
      if (next !== null) window.history.pushState({ bw: 1 }, "");                 // ancora dentro: la sentinella resta di guardia
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const [km, setKm] = useState(() => { try { const v = +localStorage.getItem("bw_km"); return v >= 1 && v <= 100 ? v : 10; } catch (_) { return 10; } });
  useEffect(() => { try { localStorage.setItem("bw_km", String(km)); } catch (_) {} }, [km]);
  const [posts, setPosts] = useState([]);   // niente post demo: si parte dal database reale
  const [events, setEvents] = useState([]);   // niente eventi demo: solo quelli reali degli utenti
  const [favs, setFavs] = useState([]);   // preferiti: si parte puliti, solo scelte reali
  const [contacts, setContacts] = useState([]);   // niente contatti demo: solo utenti reali
  const [groups, setGroups] = useState([]);
  const [notif, setNotif] = useState({ enabled: false, radiusKm: 10, posts: true, eventi: true, allerte: true, messaggi: true, quiet: false });
  // preferenze notifiche persistenti sul profilo (colonna notif_prefs)
  useEffect(() => {
    if (!sb?.isConfigured || !user) return;
    (async () => { try {
      const p = await sb.getCurrentProfile();
      if (p?.notif_prefs) setNotif(n => ({ ...n, ...p.notif_prefs }));
    } catch (_) {} })();
  }, [sb, user]);
  const saveNotif = next => {
    setNotif(next);
    if (!sb?.isConfigured) return;
    (async () => { try {
      const { data: { user: au } } = await sb.supabase.auth.getUser(); if (!au) return;
      await sb.supabase.from("profiles").update({ notif_prefs: next }).eq("id", au.id);
    } catch (e) { console.warn("notifiche:", e?.message || e); } })();
  };
  const [following, setFollowing] = useState([]);
  const [reported, setReported] = useState([]);
  const [reportTarget, setReportTarget] = useState(null);
  const reportPost = (post, reason) => { setReported(r => r.includes(post.id) ? r : [...r, post.id]); };
  const [followingIds, setFollowingIds] = useState([]);
  const [followerIds, setFollowerIds] = useState([]);
  const [socialTick, setSocialTick] = useState(0);
  useEffect(() => {
    if (!sb?.isConfigured || !user || contacts.length === 0) return;
    (async () => { try {
      const ids = await sb.getMyFollows();
      setFollowingIds(ids);
      setFollowing(contacts.filter(c => ids.includes(c.id)).map(c => c.name));
      setFollowerIds(await sb.getMyFollowers());
    } catch (e) { console.warn("follow:", e?.message || e); } })();
  }, [sb, user, contacts, socialTick]);
  // Gruppi reali
  useEffect(() => {
    if (!sb?.isConfigured || !user) return;
    (async () => { try {
      const { data: { user: au } } = await sb.supabase.auth.getUser(); if (!au) return;
      const { groups: gs, members } = await sb.getMyGroups();
      setGroups(gs.map(g => ({
        id: g.id, name: g.name, owner: g.owner_id, mine: g.owner_id === au.id,
        members: members.filter(m => m.group_id === g.id).map(m => m.user_id),
      })));
    } catch (e) { console.warn("gruppi:", e?.message || e); } })();
  }, [sb, user, socialTick]);
  const toggleFollow = name => {
    const on = !following.includes(name);
    setFollowing(f => on ? [...f, name] : f.filter(x => x !== name));
    const c = contacts.find(x => x.name === name);
    if (sb?.isConfigured && c) {
      setFollowingIds(ids => on ? [...ids, c.id] : ids.filter(i => i !== c.id));
      sb.setFollow(c.id, on).catch(e => {
        setFollowing(f => on ? f.filter(x => x !== name) : [...f, name]);
        setFollowingIds(ids => on ? ids.filter(i => i !== c.id) : [...ids, c.id]);
        alert("Segui non salvato: " + (e?.message || e));
      });
    }
  };
  const openUser = post => setOverlay({ user: { name: post.user, ava: post.ava, city: post.city, uid: post.uid } });
  // Luoghi vicini reali: le località dei post nel raggio
  const realPlaces = useMemo(() => {
    const map = {};
    posts.forEach(p => {
      if (!p.city) return;
      const key = p.city.trim().toLowerCase();
      if (!map[key]) map[key] = { id: "pl_" + key, name: titleCase(p.city), dist: p.dist ?? 0, photos: 0, users: [], events: 0 };
      const pl = map[key];
      pl.photos += 1;
      pl.dist = Math.min(pl.dist, p.dist ?? pl.dist);
      if (!pl.users.some(u => u.name === p.user)) pl.users.push({ name: p.user, ava: p.ava, city: p.city, uid: p.uid, me: !!p.mine });
    });
    const list = Object.values(map).sort((a, b) => a.dist - b.dist);
    list.forEach(pl => {
      pl.users.sort((a, b) => (b.me ? 1 : 0) - (a.me ? 1 : 0));       // tu per primo
      pl.events = (events || []).filter(e => e.place === pl.name).length;
    });
    return list;
  }, [posts, events]);
  const openGroupChat = g => {
    const id = "g_" + g.id;
    setOverlay({ chat: { id, name: g.name, ava: "👥", group: true }, groupId: g.id });
    if (!(sb?.isConfigured && typeof g.id === "string" && g.id.includes("-"))) { if (!threads[id]) setThreads(th => ({ ...th, [id]: [] })); return; }
    setThreads(th => ({ ...th, [id]: th[id] || [] }));
    (async () => { try {
      const { data: { user: au } } = await sb.supabase.auth.getUser();
      const rows = await sb.getGroupMessages(g.id);
      setThreads(th => ({ ...th, [id]: (rows || []).map(r => ({ id: r.id, me: !!au && r.from_user_id === au.id, who: r.profiles?.name || "Utente", text: r.text, time: fmtTime(r.created_at) })) }));
      if (chatUnsubRef.current) chatUnsubRef.current();
      chatUnsubRef.current = await sb.subscribeGroupChat(g.id, async m => {
        if (au && m.from_user_id === au.id) return;
        let who = "Utente";
        try { const { data: pr } = await sb.supabase.from("profiles").select("name").eq("id", m.from_user_id).single(); who = pr?.name || who; } catch (_) {}
        setThreads(th => ({ ...th, [id]: [...(th[id] || []), { id: m.id, me: false, who, text: m.text, time: fmtTime(m.created_at) }] }));
      });
    } catch (e) { console.warn("chat gruppo:", e?.message || e); } })();
  };
  const openPlaceChat = (place, back) => {
    const id = "place_" + place.name;
    setOverlay({ chat: { id, name: place.name, ava: "🌐", public: true, sub: `Chat pubblica di ${place.name}` }, back });
    if (sb?.isConfigured) {
      setThreads(th => ({ ...th, [id]: th[id] || [] }));
      (async () => { try {
        const { data: { user: au } } = await sb.supabase.auth.getUser();
        const rows = await sb.getPlaceMessages(place.name);
        setThreads(th => ({ ...th, [id]: (rows || []).map(r => ({ id: r.id, me: !!au && r.from_user_id === au.id, who: r.profiles?.name || "Utente", text: r.text, time: fmtTime(r.created_at) })) }));
        if (chatUnsubRef.current) chatUnsubRef.current();
        chatUnsubRef.current = await sb.subscribePlaceChat(place.name, async m => {
          if (au && m.from_user_id === au.id) return;
          let who = "Utente";
          try { const { data: pr } = await sb.supabase.from("profiles").select("name").eq("id", m.from_user_id).single(); who = pr?.name || who; } catch (_) {}
          setThreads(th => ({ ...th, [id]: [...(th[id] || []), { id: m.id, me: false, who, text: m.text, time: fmtTime(m.created_at) }] }));
        });
      } catch (e) { console.warn("chat luogo:", e?.message || e); } })();
      return;
    }
    if (!threads[id]) setThreads(th => ({ ...th, [id]: [] }));
  };
  const [threads, setThreads] = useState({});
  const [nextId, setNextId] = useState(1000);
  // Posizione reale dell'utente (fallback: coordinate base)
  const [geo, setGeo] = useState(BASE_COORDS);
  const [geoReal, setGeoReal] = useState(false);   // vera solo quando arriva dal GPS
  useEffect(() => {
    if (!navigator.geolocation) return;
    // monitoraggio continuo: aggancia il permesso anche se concesso dopo, e segue gli spostamenti
    const id = navigator.geolocation.watchPosition(
      p => { setGeo({ lat: p.coords.latitude, lng: p.coords.longitude }); setGeoReal(true); },
      () => {}, { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 });
    return () => navigator.geolocation.clearWatch(id);
  }, []);
  // Meteo reale Open-Meteo per la posizione attuale (senza chiavi; ogni 30 min)
  const [wx, setWx] = useState(null);
  const geoKey = geo ? geo.lat.toFixed(2) + "," + geo.lng.toFixed(2) : null;
  useEffect(() => {
    if (!geo) return;
    let stop = false;
    const load = async () => { try {
      const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${geo.lat}&longitude=${geo.lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&forecast_days=2&timezone=auto`);
      const j = await r.json();
      if (stop || !j?.current) return;
      const cw = WMO(j.current.weather_code);
      const nowIdx = Math.max(1, j.hourly.time.findIndex(t => new Date(t) > new Date()));
      const hours = [];
      for (let k = 2; k <= 12; k += 2) {
        const idx = Math.min(nowIdx - 1 + k, j.hourly.time.length - 1);
        hours.push({ h: "+" + k + "h", e: WMO(j.hourly.weather_code[idx]).e, t: Math.round(j.hourly.temperature_2m[idx]) });
      }
      // Stato del mare: modello d'onda MFWAM (Copernicus Marine) via Open-Meteo Marine
      let sea = null;
      try {
        let mr = await fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${geo.lat}&longitude=${geo.lng}&current=wave_height,wave_direction,wave_period,sea_surface_temperature&timezone=auto`);
        let mj = await mr.json();
        if (!mj?.current) {
          mr = await fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${geo.lat}&longitude=${geo.lng}&current=wave_height,wave_direction,wave_period&timezone=auto`);
          mj = await mr.json();
        }
        if (mj?.current && mj.current.wave_height != null) {
          const h = mj.current.wave_height;
          const scale = h < 0.1 ? 1 : h < 0.5 ? 1 : h < 1.25 ? 2 : h < 2.5 ? 3 : h < 4 ? 4 : 5;
          const state = ["", "Calmo", "Poco mosso", "Mosso", "Molto mosso", "Agitato"][scale];
          sea = {
            state, scale,
            wave: h.toFixed(1).replace(".", ",") + " m",
            dir: WDIR16(mj.current.wave_direction ?? 0),
            period: mj.current.wave_period != null ? Math.round(mj.current.wave_period) + "s" : null,
            sst: mj.current.sea_surface_temperature != null ? Math.round(mj.current.sea_surface_temperature) + "°" : null
          };
        }
      } catch (_) {}
      setWx({
        sea,
        condition: cw.e + " " + cw.l,
        temp: Math.round(j.current.temperature_2m) + "°",
        hi: Math.round(j.daily.temperature_2m_max[0]) + "°",
        lo: Math.round(j.daily.temperature_2m_min[0]) + "°",
        humidity: Math.round(j.current.relative_humidity_2m) + "%",
        wind: WDIR16(j.current.wind_direction_10m),
        windDeg: j.current.wind_direction_10m,
        windKmh: Math.round(j.current.wind_speed_10m),
        sunrise: j.daily.sunrise?.[0]?.slice(11, 16) || null,
        sunset: j.daily.sunset?.[0]?.slice(11, 16) || null,
        moon: moonPhase(),
        hours
      });
    } catch (e) { console.warn("meteo:", e?.message || e); } };
    load();
    const iv = setInterval(load, 30 * 60000);
    return () => { stop = true; clearInterval(iv); };
  }, [geoKey]);
  // ── BeeCast: gli occhi della community ──────────────────────────────────────
  // Foto recenti nel raggio → condizione prevalente, confronto col modello,
  // e rilevamento del maltempo osservato SOPRAVENTO (in arrivo col vento).
  const beeSense = useMemo(() => {
    const angDiff = (a, b) => { const d = Math.abs(((a - b) % 360 + 360) % 360); return d > 180 ? 360 - d : d; };
    const now = Date.now();
    const recent = posts.filter(p => p.ts && now - new Date(p.ts).getTime() < 3 * 3600000 && (p.dist ?? 999) <= km);
    if (recent.length === 0) return null;
    const byCond = {};
    recent.forEach(p => { const c = p.cond || "—"; byCond[c] = (byCond[c] || 0) + 1; });
    const [domCond, domN] = Object.entries(byCond).sort((a, b) => b[1] - a[1])[0];
    const share = Math.round((domN / recent.length) * 100);
    const conf = recent.length >= 8 ? "alta" : recent.length >= 3 ? "media" : "bassa";
    const agree = wx ? domCond.includes(wx.condition.split(" ")[0]) : null;
    let incoming = null;
    if (wx?.windDeg != null) {
      const bad = recent.filter(p => /🌧|⛈|🌦|❄|🌨/.test(p.cond || ""));
      const upwind = bad.filter(p => (p.dist ?? 0) >= 2 && angDiff(p.bearing ?? 0, wx.windDeg) <= 50);
      if (upwind.length >= 2) {
        const avgDist = upwind.reduce((sm, p) => sm + p.dist, 0) / upwind.length;
        const speed = Math.max(8, wx.windKmh || 15);
        incoming = { n: upwind.length, dir: WDIR16(wx.windDeg), etaMin: Math.round((avgDist / speed) * 60), speed };
      }
    }
    return { count: recent.length, domCond, share, conf, agree, incoming };
  }, [posts, km, wx]);
  const senseCard = beeSense ? {
    text: beeSense.incoming
      ? `Maltempo osservato in avvicinamento da ${beeSense.incoming.dir} (~${beeSense.incoming.etaMin} min)`
      : `${beeSense.domCond} — lo dice la community (${beeSense.share}%)`,
    conf: "Affidabilità " + beeSense.conf,
    photos: beeSense.count,
    why: `${beeSense.count} foto della community nelle ultime 3 ore entro ${km} km. Condizione prevalente: ${beeSense.domCond} (${beeSense.share}%). `
      + (wx ? (beeSense.agree ? `Il modello (${wx.condition}) è confermato dalle osservazioni reali.` : `Il modello indica ${wx.condition}: le osservazioni raccontano altro e lo correggono.`) : "")
      + (beeSense.incoming ? ` ${beeSense.incoming.n} foto di maltempo sopravento (${beeSense.incoming.dir}), vento ~${beeSense.incoming.speed} km/h.` : ""),
    alert: beeSense.incoming ? {
      icon: "🌧️", title: `Maltempo in arrivo tra ~${beeSense.incoming.etaMin} min`,
      dir: "da " + beeSense.incoming.dir, photos: beeSense.incoming.n,
      speed: beeSense.incoming.speed, conf: beeSense.conf
    } : null
  } : null;
  // Località attuale dal GPS (geocodifica inversa, servizio gratuito senza chiave)
  const [locName, setLocName] = useState(null);
  useEffect(() => {
    if (!geo) return;
    let stop = false, timer = null;
    const attempt = async () => {
      const name = await reverseCity(geo.lat, geo.lng);
      if (stop) return;
      if (name) {
        setLocName(name);
        // la città del profilo segue la realtà: addio "Sorrento" di fabbrica
        let cityManual = false; try { cityManual = localStorage.getItem("bw_city_manual") === "1"; } catch (_) {}
        if (user && user.city !== name && !cityManual) {
          setUser(u => u ? { ...u, city: name } : u);
          if (sb?.isConfigured && myUid)
            sb.supabase.from("profiles").update({ city: name }).eq("id", myUid).then(() => {}, () => {});
        }
      } else timer = setTimeout(attempt, 30 * 1000);   // niente nome? si riprova tra 30s, finché serve
    };
    attempt();
    return () => { stop = true; if (timer) clearTimeout(timer); };
  }, [geo]);
  const dataURLtoBlob = du => { const [h, b] = du.split(","); const mime = (h.match(/data:(.*?);/) || [])[1] || "image/jpeg"; const bin = atob(b); const arr = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i); return new Blob([arr], { type: mime }); };
  const kmDist = (a, b) => { const R = 6371, dLa = (b.lat - a.lat) * Math.PI / 180, dLo = (b.lng - a.lng) * Math.PI / 180; const q = Math.sin(dLa / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLo / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(q)); };
  const bearingTo = (a, b) => (Math.atan2(b.lng - a.lng, b.lat - a.lat) * 180 / Math.PI + 360) % 360;
  // Feed reale dal database (quando Supabase è collegato)
  const [feedReady, setFeedReady] = useState(false);
  const loadFeed = useCallback(async () => {
    if (!sb?.isConfigured || !user) return;
    try {
      const rows = await sb.getFeedNearby({ lat: geo.lat, lng: geo.lng, radiusKm: 100 });
      const { data: { user: au } } = await sb.supabase.auth.getUser();
      let myStars = new Set();
      if (au) { const { data: st } = await sb.supabase.from("stars").select("post_id").eq("user_id", au.id); myStars = new Set((st || []).map(x => x.post_id)); }
      const ids = [...new Set((rows || []).map(r => r.user_id))];
      const { data: profs } = ids.length ? await sb.supabase.from("profiles").select("id,name,city,avatar_url").in("id", ids) : { data: [] };
      const pmap = Object.fromEntries((profs || []).map(p => [p.id, p]));
      setPosts((rows || []).map(r => {
        const pr = pmap[r.user_id] || {}; const pt = { lat: r.lat, lng: r.lng };
        return { id: r.id, user: pr.name || "Utente Bee", ava: pr.avatar_url || null,
          time: fmtPostTime(r.created_at),
          ts: r.created_at,
          city: titleCase(r.city || pr.city || ""), dist: +kmDist(geo, pt).toFixed(1), bearing: Math.round(bearingTo(geo, pt)),
          dir: r.cam_dir ? { label: r.cam_dir, deg: r.cam_deg } : undefined,
          cond: r.condition || "☀️ Sereno", stars: r.stars_count || 0, starred: myStars.has(r.id),
          comments: r.comments_count || 0, views: r.views_count || 0,
          img: r.image_url, caption: r.caption || "", mine: !!au && r.user_id === au.id, uid: r.user_id };
      }));
    } catch (e) { console.warn("feed:", e?.message || e); }
    finally { setFeedReady(true); }
  }, [sb, user, geo]);
  // niente attese infinite: dopo il login, al massimo 5s di caricamento
  useEffect(() => {
    if (!user) { setFeedReady(false); return; }
    const t = setTimeout(() => setFeedReady(true), 5000);
    return () => clearTimeout(t);
  }, [user]);
  useEffect(() => { loadFeed(); }, [loadFeed]);
  // Avvisi (campanella): elenco reale + arrivo in tempo reale
  const [alerts, setAlerts] = useState([]);
  const [notifToast, setNotifToast] = useState(null);
  const toastTimerRef = useRef(null);
  const pendingNotifRef = useRef(null);
  // Chi segui ti avvisa: ascolto in tempo reale dei nuovi post delle tue api
  useEffect(() => {
    if (!sb?.isConfigured || !followingIds.length) return;
    const ch = sb.supabase.channel("follow-posts")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts" }, payload => {
        const r = payload?.new;
        if (!r || r.user_id === myUid || !followingIds.includes(r.user_id)) return;
        const who = contacts.find(c => c.id === r.user_id);
        const name = who?.name || "Un'ape che segui";
        const text = `${name} ha pubblicato un nuovo cielo${r.city ? " da " + r.city : ""} 📸`;
        setNotifToast({ kind: "followPost", text, from: { uid: r.user_id, name, ava: who?.ava || null, city: who?.city || r.city } });
        setTimeout(() => setNotifToast(t => (t?.kind === "followPost" && t.text === text) ? null : t), 6500);
        try {
          if (document.visibilityState === "hidden" && typeof Notification !== "undefined" && Notification.permission === "granted")
            new Notification("Beeweat 🐝", { body: text });
        } catch (_) {}
        loadFeed();                                                // il cielo nuovo entra subito nel feed
      }).subscribe();
    return () => { try { sb.supabase.removeChannel(ch); } catch (_) {} };
  }, [sb, followingIds, myUid, contacts]);

  const routeNotifTap = (kind, from) => {
    if (!user) { pendingNotifRef.current = { kind, from }; return; }
    if (kind === "nudge") { setOverlay("post"); return; }        // il verso del poeta apre la fotocamera
    if (kind === "followPost" && from?.uid) { setOverlay({ user: { name: from.name, ava: from.ava, city: from.city, uid: from.uid } }); return; }
    if (kind === "direct" && from) {
      openDirectChat({ id: from, name: nameOf(from), ava: (contacts.find(c => c.id === from) || {}).ava || null });
      return;
    }
    setOverlay("alerts");
  };
  useEffect(() => {
    if (user && pendingNotifRef.current) {
      const { kind, from } = pendingNotifRef.current; pendingNotifRef.current = null;
      setTimeout(() => routeNotifTap(kind, from), 500);
    }
  }, [user, contacts]);
  const nameOf = uid => (contacts.find(c => c.id === uid) || {}).name || "Un utente";
  useEffect(() => {
    if (!sb?.isConfigured || !user) return;
    let unsub = null;
    (async () => { try {
      const { data: { user: au } } = await sb.supabase.auth.getUser(); if (!au) return;
      setAlerts(await sb.getNotifications());
      unsub = await sb.subscribeNotifications(au.id, (ev, n, old) => {
        if (ev === "INSERT" && n) {
          setAlerts(a => a.some(x => x.id === n.id) ? a : [n, ...a]);
          if (n.type === "follow" && n.from_user_id) setFollowerIds(ids => ids.includes(n.from_user_id) ? ids : [...ids, n.from_user_id]);
          setNotifToast({ kind: n.type, from: n.from_user_id || null, text: n.text || (n.type === "follow" ? "Nuovo follower" : "Nuovo messaggio") });
          playChime();
          if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
          toastTimerRef.current = setTimeout(() => setNotifToast(null), 4500);
        } else if (ev === "UPDATE" && n) {
          setAlerts(a => a.map(x => x.id === n.id ? { ...x, ...n } : x));   // letto su un dispositivo → letto ovunque
        } else if (ev === "DELETE" && old) {
          setAlerts(a => a.filter(x => x.id !== old.id));                   // eliminato su uno → sparisce ovunque
        }
      });
    } catch (e) { console.warn("avvisi:", e?.message || e); } })();
    const refreshA = () => { if (!document.hidden) sb.getNotifications().then(setAlerts).catch(() => {}); };
    document.addEventListener("visibilitychange", refreshA);
    const ivA = setInterval(refreshA, 20000);       // rete di sicurezza: riallinea ogni 20s
    return () => { document.removeEventListener("visibilitychange", refreshA); clearInterval(ivA); try { if (unsub) unsub(); } catch (_) {} };
  }, [sb, user]);
  useEffect(() => {
    const noZoom = e => e.preventDefault();
    document.addEventListener("gesturestart", noZoom);           // pinch su iOS
    const noPinch = e => { if (e.touches && e.touches.length > 1) e.preventDefault(); };
    document.addEventListener("touchmove", noPinch, { passive: false });
    return () => { document.removeEventListener("gesturestart", noZoom); document.removeEventListener("touchmove", noPinch); };
  }, []);
  useEffect(() => {
    const h = e => { if (e.data?.type === "notif-tap") routeNotifTap(e.data.kind, e.data.from || null); };
    if ("serviceWorker" in navigator) navigator.serviceWorker.addEventListener("message", h);
    try {
      const u = new URL(window.location.href);
      const k = u.searchParams.get("notif");
      const fr = u.searchParams.get("from");
      if (k) { routeNotifTap(k, fr || null); u.searchParams.delete("notif"); u.searchParams.delete("from"); window.history.replaceState({}, "", u.pathname + u.hash); }
    } catch (_) {}
    return () => { if ("serviceWorker" in navigator) navigator.serviceWorker.removeEventListener("message", h); };
  }, []);
  const unreadCount = alerts.filter(a => !a.read).length;
  // Amministratore Beeweat? (colonna is_admin sul profilo)
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => { if (sb?.isConfigured && user) sb.supabase.auth.getUser().then(({ data }) => setMyUid(data?.user?.id || null)); }, [sb, user]);
  useEffect(() => {
    if (!sb?.isConfigured) return;
    const { data: sub } = sb.supabase.auth.onAuthStateChange(ev => {
      if (ev === "PASSWORD_RECOVERY") {
        const p = window.prompt("Link di reimpostazione riconosciuto 🐝\nScegli la NUOVA password (minimo 6 caratteri):");
        if (p && p.length >= 6) sb.supabase.auth.updateUser({ password: p })
          .then(() => alert("Password aggiornata ✓ D'ora in poi accedi con quella nuova."))
          .catch(e => alert("Aggiornamento non riuscito: " + (e?.message || e)));
        else if (p !== null) alert("Password troppo corta: riapri il link e riprova.");
      }
    });
    return () => sub?.subscription?.unsubscribe();
  }, [sb]);
  useEffect(() => {
    if (!sb?.isConfigured || !user) { setIsAdmin(false); return; }
    (async () => { try {
      const p = await sb.getCurrentProfile();
      setIsAdmin(!!p?.is_admin);
      setBanInfo(p?.banned_until && new Date(p.banned_until) > new Date() ? { until: p.banned_until, reason: p.ban_reason } : null);
    } catch (_) {} })();
  }, [sb, user]);
  const [banInfo, setBanInfo] = useState(null);
  // ── Push sul dispositivo (Web Push VAPID) ──
  const [pushState, setPushState] = useState("off");   // off | on | denied | unsupported
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) { setPushState("unsupported"); return; }
    if (typeof Notification !== "undefined" && Notification.permission === "denied") { setPushState("denied"); return; }
    navigator.serviceWorker.getRegistration().then(reg => {
      reg?.update().catch(() => {});                          // aggiorna sw.js se è uscita una versione nuova
      reg?.pushManager.getSubscription().then(sub => { if (sub) setPushState("on"); });
    });
  }, []);
  const enablePush = async () => {
    try {
      if (pushState === "unsupported") { alert("Questo browser non supporta le push. Su iPhone: aggiungi prima Beeweat alla schermata Home."); return; }
      if (VAPID_PUBLIC_KEY.startsWith("INCOLLA")) { alert("Chiave VAPID mancante nel file (vedi istruzioni)."); return; }
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { setPushState("denied"); return; }
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64ToU8(VAPID_PUBLIC_KEY) });
      if (sb?.isConfigured) await sb.savePushSub(sub.toJSON());
      setPushState("on");
    } catch (e) { alert("Attivazione push non riuscita: " + (e?.message || e)); }
  };
  // posizione per lo scanner delle allerte (solo con allerte attive)
  useEffect(() => {
    if (!sb?.isConfigured || !user || !geo || !notif?.enabled || !notif?.allerte) return;
    sb.saveMyLocation(geo.lat, geo.lng).catch(() => {});
  }, [sb, user, geoKey, notif?.enabled, notif?.allerte]);
  // Memoria di scorrimento: al ritorno da post/chat/profili si resta dove si era
  const scrollMem = useRef({});
  useEffect(() => {
    const h = e => { const el = e.target; if (el?.classList?.contains("scr")) scrollMem.current[tab] = el.scrollTop; };
    document.addEventListener("scroll", h, true);
    return () => document.removeEventListener("scroll", h, true);
  }, [tab]);
  const overlayOpen = overlay != null;
  useEffect(() => {
    if (overlayOpen) return;
    const top = scrollMem.current[tab] || 0;
    requestAnimationFrame(() => { const el = document.querySelector(".scr"); if (el) el.scrollTop = top; });
  }, [overlayOpen, tab]);
  const banUser = profile => {
    if (!profile?.uid) { alert("Utente non identificabile."); return; }
    const d = window.prompt(`Ban per "${profile.name}"\nGiorni di sospensione (0 = rimuovi il ban):`, "10");
    if (d === null) return;
    const days = Math.max(0, parseInt(d, 10) || 0);
    if (days === 0) {
      sb.banUser(profile.uid, null, null).then(() => alert(`${profile.name} è stato sbloccato.`)).catch(e => alert("Errore: " + (e?.message || e)));
      return;
    }
    const reason = window.prompt("Messaggio per l'utente:", `Sei stato bannato per ${days} giorni per condotta scorretta.`);
    if (reason === null) return;
    const until = new Date(Date.now() + days * 86400000).toISOString();
    sb.banUser(profile.uid, until, reason).then(() => alert(`${profile.name} è stato bannato per ${days} giorni.`)).catch(e => alert("Errore: " + (e?.message || e)));
  };
  // Post a lungo raggio (profili altrui e luoghi fuori dal feed)
  const [extraPosts, setExtraPosts] = useState([]);
  const mapRemoteRow = (r, auId) => {
    const pr = r.profiles || {};
    const dist = geo && r.lat != null ? haversine(geo, { lat: r.lat, lng: r.lng }) : 999;
    return {
      id: r.id, uid: r.user_id, user: pr.name || "Utente", ava: pr.avatar_url || null,
      mine: !!auId && r.user_id === auId,
      time: fmtPostTime(r.created_at), ts: r.created_at,
      city: titleCase(r.city || pr.city || ""),
      dist: Math.round(dist * 10) / 10,
      bearing: geo && r.lat != null ? bearingDeg(geo, { lat: r.lat, lng: r.lng }) : 0,
      img: r.image_url, caption: r.caption || "", cond: r.condition || "☀️ Sereno",
      stars: r.stars_count || 0, starred: false, comments: r.comments_count || 0, views: r.views_count || 0,
      camDir: r.cam_dir || null,
    };
  };
  const loadUserPosts = async uid => { try {
    const { data: { user: au } } = await sb.supabase.auth.getUser();
    const rows = await sb.getPostsByUser(uid);
    setExtraPosts(rows.map(r => mapRemoteRow(r, au?.id)));
  } catch (e) { console.warn("post utente:", e?.message || e); } };
  const loadCityPosts = async city => { try {
    const { data: { user: au } } = await sb.supabase.auth.getUser();
    const rows = await sb.getPostsByCity(city);
    setExtraPosts(rows.map(r => mapRemoteRow(r, au?.id)));
  } catch (e) { console.warn("post città:", e?.message || e); } };
  useEffect(() => {
    if (!sb?.isConfigured) return;
    if (overlay?.user?.uid) { setExtraPosts([]); loadUserPosts(overlay.user.uid); }
    else if (overlay?.place?.name) { setExtraPosts([]); loadCityPosts(overlay.place.name); }
    else if (overlay === "profile" && myUid) { setExtraPosts([]); loadUserPosts(myUid); }   // il MIO profilo: tutti i miei post, da ovunque
    else if (!overlay?.user && !overlay?.place && overlay !== "profile") setExtraPosts([]);
  }, [sb, overlay?.user?.uid, overlay?.place?.name, overlay === "profile" ? myUid : null]);
  // vista unificata: feed vicino + post caricati a lungo raggio (senza doppioni)
  const allPosts = useMemo(() => {
    const ids = new Set(posts.map(p => p.id));
    return [...posts, ...extraPosts.filter(p => !ids.has(p.id))];
  }, [posts, extraPosts]);
  // Eventi reali dal database (persistenti e condivisi)
  useEffect(() => {
    if (!sb?.isConfigured || !user) return;
    (async () => { try {
      const rows = await sb.getEvents();
      setEvents(rows.map(r => ({
        id: r.id, uid: r.user_id, user: r.profiles?.name || "Utente", ava: r.profiles?.avatar_url || null,
        type: r.type, cat: r.cat, title: r.title, place: r.place, sev: r.sev,
        lat: r.lat, lng: r.lng, ends: r.ends, time: fmtPostTime(r.created_at),
        dist: geo && r.lat != null ? Math.round(haversine(geo, { lat: r.lat, lng: r.lng }) * 10) / 10 : 999,
      })));
    } catch (e) { console.warn("eventi:", e?.message || e); } })();
  }, [sb, user, socialTick, geoKey]);
  // "Mondo" nel Feed: gli ultimi cieli del pianeta
  const [feedWorld, setFeedWorld] = useState(false);
  const [worldFeedPosts, setWorldFeedPosts] = useState([]);
  useEffect(() => { if (tab !== "feed") setFeedWorld(false); }, [tab]);
  useEffect(() => {
    if (!feedWorld || !sb?.isConfigured) { setWorldFeedPosts([]); return; }
    (async () => { try {
      const { data: { user: au } } = await sb.supabase.auth.getUser();
      const rows = await sb.getWorldFeed();
      setWorldFeedPosts(rows.map(r => mapRemoteRow(r, au?.id)));
    } catch (e) { console.warn("feed mondo:", e?.message || e); } })();
  }, [feedWorld, sb, socialTick]);
  const feedShown = useMemo(() => {
    if (!feedWorld) return posts;
    const ids = new Set(posts.map(p => p.id));
    return [...posts, ...worldFeedPosts.filter(p => !ids.has(p.id))]
      .slice().sort((a, b) => new Date(b.ts) - new Date(a.ts));
  }, [feedWorld, posts, worldFeedPosts]);
  // "Mondo" nei Contatti: attivo finché resti nella scheda, si spegne quando esci
  const [contactsWorld, setContactsWorld] = useState(false);
  const [worldPlaces, setWorldPlaces] = useState(null);
  useEffect(() => { if (tab !== "contatti") setContactsWorld(false); }, [tab]);
  useEffect(() => {
    if (contactsWorld && worldPlaces === null && sb?.isConfigured) {
      sb.searchCities("").then(rows => setWorldPlaces(rows.map(r => ({
        id: "plr_" + r.city.trim().toLowerCase(), name: titleCase(r.city),
        dist: geo && r.lat != null ? Math.round(haversine(geo, { lat: r.lat, lng: r.lng })) : 0,
        photos: r.count, users: [], events: 0,
      })))).catch(() => setWorldPlaces([]));
    }
  }, [contactsWorld, sb]);
  // distanza approssimata di ogni contatto: dal suo post più recente, o dalla sua città
  const contactDist = useMemo(() => {
    const m = {};
    for (const p of allPosts) if (p.uid && (m[p.uid] === undefined || p.dist < m[p.uid])) m[p.uid] = p.dist;
    const cityDist = {};
    for (const pl of realPlaces) cityDist[pl.name.toLowerCase()] = pl.dist;
    for (const c of contacts) {
      if (m[c.id] === undefined && c.city && cityDist[c.city.toLowerCase()] !== undefined)
        m[c.id] = cityDist[c.city.toLowerCase()];
    }
    return m;
  }, [allPosts, realPlaces, contacts]);
  // Modifica post (autore o admin)
  const [editTarget, setEditTarget] = useState(null);
  const saveEdit = ({ caption, cond }) => {
    const p = editTarget; setEditTarget(null);
    if (!p) return;
    setPosts(ps => ps.map(x => x.id === p.id ? { ...x, caption, cond } : x));
    if (sb?.isConfigured && typeof p.id === "string" && p.id.includes("-"))
      sb.updatePost(p.id, { caption, condition: cond }).catch(e => { alert("Modifica non salvata: " + (e?.message || e)); loadFeed(); });
  };
  // Cancellazione post (autore o admin) — senza doppia conferma (il modale l'ha già chiesta)
  const doDeletePost = p => {
    setPosts(ps => ps.filter(x => x.id !== p.id));
    if (sb?.isConfigured && typeof p.id === "string" && p.id.includes("-"))
      sb.deletePost(p).then(() => loadFeed())
        .catch(e => { alert("Eliminazione non riuscita: " + (e?.message || e)); loadFeed(); });
    else if (sb?.isConfigured) setTimeout(loadFeed, 800);   // post appena creato (id provvisorio): riallineo col database
  };
  // Cancellazione post (autore o admin)
  const deletePost = post => {
    if (!window.confirm("Eliminare definitivamente questo post?")) return;
    const real = sb?.isConfigured && typeof post.id === "string" && post.id.includes("-");
    setPosts(ps => ps.filter(p => p.id !== post.id));
    if (real) sb.deletePost(post).catch(e => { alert("Eliminazione non riuscita: " + (e?.message || e)); loadFeed(); });
  };
  // Visualizzazioni: conta quando il post appare sullo schermo, una volta per utente
  const seenRef = useRef(new Set());
  const onView = pid => {
    if (!sb?.isConfigured || typeof pid !== "string" || !pid.includes("-") || seenRef.current.has(pid)) return;
    seenRef.current.add(pid);
    const target = posts.find(p => p.id === pid);
    if (!target || target.mine) return;
    setPosts(ps => ps.map(p => p.id === pid ? { ...p, views: (p.views || 0) + 1 } : p));
    sb.registerView(pid).catch(() => {});
  };
  const markAlertRead = a => {
    if (a.read) return;
    setAlerts(al => al.map(n => n.id === a.id ? { ...n, read: true } : n));
    if (sb?.isConfigured) sb.markNotifRead(a.id).catch(() => {});
  };
  const markAllRead = () => {
    setAlerts(al => al.map(n => ({ ...n, read: true })));
    if (sb?.isConfigured) sb.markAllNotifsRead().catch(() => {});
  };
  const removeAlert = a => {
    setAlerts(al => al.filter(n => n.id !== a.id));
    if (sb?.isConfigured) sb.deleteNotification(a.id).catch(() => {});
  };
  const openAlertChat = a => {
    markAlertRead(a);
    if (a.type === "alert") { setOverlay(null); setTab("beecast"); return; }
    if (a.type === "nudge") { setOverlay("post"); return; }
    if ((a.type === "follow" || a.type === "followPost") && a.from_user_id) { const c = contacts.find(x => x.id === a.from_user_id); setOverlay({ user: c ? { name: c.name, ava: c.ava, city: c.city, uid: c.id } : { name: nameOf(a.from_user_id), ava: null, city: "", uid: a.from_user_id } }); return; }
    if (a.type !== "direct" || !a.from_user_id) return;
    openDirectChat({ id: a.from_user_id, name: nameOf(a.from_user_id), ava: (contacts.find(c => c.id === a.from_user_id) || {}).ava || null });
  };
  // Contatti reali: gli utenti Beeweat dal database (escluso me)
  useEffect(() => {
    if (!sb?.isConfigured || !user) return;
    (async () => { try {
      const { data: { user: au } } = await sb.supabase.auth.getUser();
      const profs = await sb.getProfiles();
      setContacts(profs
        .map(p => ({ id: p.id, name: p.name || "Utente Bee", city: p.city || "", ava: p.avatar_url || null, me: !!au && p.id === au.id }))
        .sort((a, b) => (b.me ? 1 : 0) - (a.me ? 1 : 0)));
    } catch (e) { console.warn("contatti:", e?.message || e); } })();
  }, [sb, user, socialTick]);
  // Chat dirette: apertura con storico dal database
  const deleteDirectMsg = (cid, m) => {
    setThreads(th => ({ ...th, [cid]: (th[cid] || []).filter(x => x.id !== m.id) }));
    if (sb?.isConfigured && typeof m.id === "string" && String(m.id).includes("-")) sb.deleteMessage(m.id).catch(e => console.warn("elimina msg:", e?.message || e));
  };
  const clearDirect = cid => {
    setThreads(th => ({ ...th, [cid]: [] }));
    if (sb?.isConfigured && typeof cid === "string" && cid.includes("-")) sb.clearDirectChat(cid).catch(e => console.warn("svuota chat:", e?.message || e));
  };
  const openDirectChat = c => {
    if (c?.me) { setOverlay("profile"); return; }
    const real = sb?.isConfigured && typeof c.id === "string" && c.id.includes("-");
    setOverlay({ chat: c });
    if (!real) return;
    setAlerts(a => a.map(n => n.type === "direct" && n.from_user_id === c.id ? { ...n, read: true } : n));
    sb.markDirectNotifsRead(c.id).catch(() => {});
    (async () => { try {
      const { data: { user: au } } = await sb.supabase.auth.getUser();
      const rows = await sb.getDirectMessages(c.id);
      setThreads(th => ({ ...th, [c.id]: (rows || []).map(r => ({ id: r.id, me: !!au && r.from_user_id === au.id, text: r.text, time: fmtTime(r.created_at) })) }));
    } catch (e) { console.warn("chat diretta:", e?.message || e); } })();
  };
  // Messaggi diretti in arrivo, in tempo reale (una sola iscrizione globale)
  useEffect(() => {
    if (!sb?.isConfigured || !user) return;
    let unsub = null;
    (async () => { try {
      const { data: { user: au } } = await sb.supabase.auth.getUser(); if (!au) return;
      unsub = await sb.subscribeDirect(au.id, m => {
        setThreads(th => ({ ...th, [m.from_user_id]: [...(th[m.from_user_id] || []), { id: m.id, me: false, text: m.text, time: fmtTime(m.created_at) }] }));
      });
    } catch (_) {} })();
    return () => { try { if (unsub) unsub(); } catch (_) {} };
  }, [sb, user]);
  // Avatar: salva anche sul profilo Supabase (emoji diretta, foto caricata nello storage)
  const saveAvatar = a => {
    setUser(u => ({ ...u, avatar: a }));
    if (!sb?.isConfigured) return;
    (async () => { try {
      const { data: { user: au } } = await sb.supabase.auth.getUser(); if (!au) return;
      let url = a;
      if (typeof a === "string" && a.startsWith("data:")) {
        const blob = dataURLtoBlob(a);
        const path = `${au.id}/avatar_${Date.now()}.jpg`;
        const { error } = await sb.supabase.storage.from("posts").upload(path, blob, { contentType: blob.type || "image/jpeg", upsert: true });
        if (error) throw error;
        url = sb.supabase.storage.from("posts").getPublicUrl(path).data.publicUrl;
        setUser(u => ({ ...u, avatar: url }));
      }
      await sb.supabase.from("profiles").update({ avatar_url: url }).eq("id", au.id);
    } catch (e) { console.warn("avatar:", e?.message || e); } })();
  };
  // Aggiornamento automatico del feed: al ritorno sull'app, ogni 60s e in tempo reale
  useEffect(() => {
    if (!sb?.isConfigured || !user) return;
    const onVis = () => { if (!document.hidden) { loadFeed(); setSocialTick(t => t + 1); } };
    document.addEventListener("visibilitychange", onVis);
    const iv = setInterval(() => { loadFeed(); setSocialTick(t => t + 1); }, 60000);
    let ch = null;
    try {
      ch = sb.supabase.channel("posts-feed")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts" }, () => loadFeed())
        .subscribe();
    } catch (_) {}
    return () => { document.removeEventListener("visibilitychange", onVis); clearInterval(iv); try { if (ch) sb.supabase.removeChannel(ch); } catch (_) {} };
  }, [sb, user, loadFeed]);

  const totalComments = useMemo(() => posts.reduce((s, p) => s + p.stars, 0), [posts]);

  // adatta al sistema operativo: abilita le safe-area senza alterare lo zoom
  useEffect(() => {
    try {
      const m = document.querySelector('meta[name="viewport"]');
      const cur = m ? (m.getAttribute("content") || "") : "";
      if (m && !/viewport-fit/.test(cur)) {
        m.setAttribute("content", (cur || "width=device-width, initial-scale=1") + ", viewport-fit=cover");
      }
    } catch (e) { /* ignora in ambienti senza document */ }
  }, []);

  const onStar = id => {
    const flip = ps => ps.map(p => p.id === id ? { ...p, starred: !p.starred, stars: p.starred ? p.stars - 1 : p.stars + 1 } : p);
    setPosts(flip); setExtraPosts(flip); setWorldFeedPosts(flip);   // il cuoricino vale ovunque: vicino, lungo raggio e Mondo
    if (sb?.isConfigured) sb.toggleStar(id).catch(() => {});
  };
  const toggleFav = id => setFavs(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id]);
  // ── Zaino offline: i post senza rete si salvano e partono da soli ────────────
  const OUTBOX_KEY = "bw_outbox";
  const loadOutbox = () => { try { return JSON.parse(localStorage.getItem(OUTBOX_KEY) || "[]"); } catch (_) { return []; } };
  const saveOutbox = box => { try { localStorage.setItem(OUTBOX_KEY, JSON.stringify(box)); return true; } catch (_) { return false; } };
  const isNetErr = e => !navigator.onLine || /fetch|network|internet|connessione|timeout|load failed/i.test(String(e?.message || e));
  const flushingRef = useRef(false);
  const flushOutbox = async () => {
    if (flushingRef.current || !sb?.isConfigured || !navigator.onLine) return;
    const box = loadOutbox();
    if (!box.length) return;
    flushingRef.current = true;
    const remain = [];
    let sent = 0;
    for (const it of box) {
      try {
        await sb.createPost({ file: dataURLtoBlob(it.img), caption: it.caption, condition: it.cond, lat: it.lat, lng: it.lng, camDeg: it.camDeg, camDir: it.camDir, city: it.city, aiClass: it.aiClass, aiScore: it.aiScore });
        sent++;
      } catch (e) {
        if (sessionLost(e)) { remain.push(it); break; }
        it.tries = (it.tries || 0) + 1;
        if (it.tries < 10) remain.push(it);                       // dopo 10 tentativi falliti si arrende
      }
    }
    saveOutbox(remain);
    flushingRef.current = false;
    if (sent) { setPosts(ps => ps.filter(p => !p.pending)); await loadFeed(); }
  };
  useEffect(() => {
    const go = () => { flushOutbox(); };
    window.addEventListener("online", go);
    const iv = setInterval(go, 60 * 1000);
    go();                                                          // anche all'avvio: consegna gli arretrati
    return () => { window.removeEventListener("online", go); clearInterval(iv); };
  }, [sb]);
  // all'avvio, i post ancora nello zaino ricompaiono nel feed come "in attesa"
  useEffect(() => {
    if (!user) return;
    const box = loadOutbox();
    if (!box.length) return;
    setPosts(ps => {
      const have = new Set(ps.filter(p => p.pending).map(p => p.id));
      const cards = box.filter(it => !have.has("ob_" + it.ts)).map(it => ({ id: "ob_" + it.ts, user: user.name, ava: user.avatar, time: fmtPostTime(new Date(it.ts)), ts: new Date(it.ts).toISOString(), city: it.city, dist: 0, bearing: 0, dir: { deg: it.camDeg, label: it.camDir }, cond: it.cond, stars: 0, starred: false, comments: 0, views: 0, shares: 0, img: it.img, caption: it.caption, mine: true, pending: true }));
      return cards.length ? [...cards, ...ps] : ps;
    });
  }, [user]);

  const onPost = ({ img, caption, cond, dir, aiClass, aiScore }) => {
    const localAdd = pending => { setPosts(ps => [{ id: pending ? "ob_" + pendTs : nextId, user: user.name, ava: user.avatar, time: fmtPostTime(new Date()), ts: new Date().toISOString(), city: locName || user.city, dist: 0, bearing: 0, dir, cond, stars: 0, starred: false, comments: 0, views: 0, shares: 0, img, caption, mine: true, pending: !!pending }, ...ps]); if (!pending) setNextId(n => n + 1); };
    const pendTs = Date.now();
    const toOutbox = () => {
      const box = loadOutbox();
      box.push({ ts: pendTs, img, caption, cond, lat: geo.lat, lng: geo.lng, camDeg: dir?.deg, camDir: dir?.label, city: locName || user.city, aiClass, aiScore, tries: 0 });
      if (!saveOutbox(box)) { alert("Memoria piena: non riesco a conservare il post offline. Riprova quando torna la rete."); return; }
      localAdd(true);
      alert("📡 Sei senza rete: il post è al sicuro nello zaino e partirà da solo appena torna la connessione. 🎒");
    };
    if (sb?.isConfigured) {
      if (!navigator.onLine) { toOutbox(); }
      else (async () => {
        try {
          const file = img.startsWith("data:") ? dataURLtoBlob(img) : await (await fetch(img)).blob();
          const postCity = locName || await reverseCity(geo.lat, geo.lng) || user.city;   // il posto VERO dello scatto
          await sb.createPost({ file, caption, condition: cond, lat: geo.lat, lng: geo.lng, camDeg: dir?.deg, camDir: dir?.label, city: postCity, aiClass, aiScore });
          await loadFeed();
        } catch (e) {
          if (isNetErr(e)) toOutbox();
          else if (!sessionLost(e)) { alert("Pubblicazione non riuscita: " + (e?.message || e)); localAdd(); }
        }
      })();
    } else localAdd();
    setOverlay(null); setTab("feed");
  };
  const sendMsg = (cid, text) => {
    const t = new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
    setThreads(th => ({ ...th, [cid]: [...(th[cid] || []), { id: Date.now(), me: true, text, time: t }] }));
    if (sb?.isConfigured && cid.startsWith("post_") && cid.includes("-")) {
      const pid = cid.slice(5);
      setPosts(ps => ps.map(p => p.id === pid ? { ...p, comments: (p.comments || 0) + 1 } : p));
      sb.sendPostMessage(pid, text).catch(e => console.warn("invio:", e?.message || e));
    } else if (sb?.isConfigured && cid.startsWith("place_")) {
      sb.sendPlaceMessage(cid.slice(6), text).catch(e => console.warn("invio:", e?.message || e));
    } else if (sb?.isConfigured && cid.startsWith("g_") && cid.slice(2).includes("-")) {
      sb.sendGroupMessage(cid.slice(2), text).catch(e => console.warn("invio:", e?.message || e));
    } else if (sb?.isConfigured && typeof cid === "string" && cid.includes("-") && !cid.startsWith("post_") && !cid.startsWith("place_") && !cid.startsWith("g_")) {
      sb.sendDirectMessage(cid, text).catch(e => console.warn("invio:", e?.message || e));
    }
  };
  const chatUnsubRef = useRef(null);
  const fmtTime = ts => fmtPostTime(ts);   // nelle chat: "oggi · 16:37", "ieri · 09:12", "31/07 · 18:45"
  const openChatFromPost = (post, back) => {
    const id = "post_" + post.id;
    const isReal = sb?.isConfigured && typeof post.id === "string" && post.id.includes("-");
    if (isReal) {
      setThreads(th => ({ ...th, [id]: th[id] || [] }));
      setOverlay({ back, chat: { id, name: "Chat pubblica", ava: "🌐", sub: `Post di ${post.user} · ${post.city}`, public: true } });
      (async () => { try {
        const { data: { user: au } } = await sb.supabase.auth.getUser();
        const rows = await sb.getPostMessages(post.id);
        setThreads(th => ({ ...th, [id]: (rows || []).map(r => ({ id: r.id, me: !!au && r.from_user_id === au.id, who: r.profiles?.name || "Utente", text: r.text, time: fmtTime(r.created_at) })) }));
        if (chatUnsubRef.current) chatUnsubRef.current();
        chatUnsubRef.current = await sb.subscribePostChat(post.id, async m => {
          if (au && m.from_user_id === au.id) return; // i miei li aggiungo già all'invio
          let who = "Utente";
          try { const { data: pr } = await sb.supabase.from("profiles").select("name").eq("id", m.from_user_id).single(); who = pr?.name || who; } catch (_) {}
          setThreads(th => ({ ...th, [id]: [...(th[id] || []), { id: m.id, me: false, who, text: m.text, time: fmtTime(m.created_at) }] }));
        });
      } catch (e) { console.warn("chat:", e?.message || e); } })();
      return;
    }
    if (!threads[id]) setThreads(th => ({ ...th, [id]: [
      { id: 1, me: false, who: post.user, text: `Che spettacolo qui a ${post.city}! 🌤️`, time: post.time },
      { id: 2, me: false, who: "Giulia", text: "Confermo, anche da me cielo così!", time: post.time },
    ] }));
    setOverlay({ back, chat: { id, name: "Chat pubblica", ava: "🌐", sub: `Post di ${post.user} · ${post.city}`, public: true } });
  };
  // chiusura chat → stop ascolto in tempo reale
  useEffect(() => { if (!overlay?.chat && chatUnsubRef.current) { chatUnsubRef.current(); chatUnsubRef.current = null; } }, [overlay]);
  const addContact = p => { setContacts(c => [...c, p]); setOverlay(null); };
  const createGroup = g => {
    setOverlay(null);
    if (sb?.isConfigured) {
      sb.createGroup(g.name, g.members)
        .then(() => setSocialTick(t => t + 1))
        .catch(e => alert("Creazione gruppo non riuscita: " + (e?.message || e)));
      return;
    }
    setGroups(gs => [...gs, { id: nextId, ...g }]); setNextId(n => n + 1);
  };
  const updateGroup = (id, members) => {
    const cur = (groups.find(g => g.id === id) || {}).members || [];
    setGroups(gs => gs.map(g => g.id === id ? { ...g, members } : g));
    if (sb?.isConfigured && typeof id === "string" && id.includes("-")) {
      const add = members.filter(x => !cur.includes(x));
      const rem = cur.filter(x => !members.includes(x));
      sb.updateGroupMembers(id, add, rem).catch(e => { alert("Aggiornamento membri non riuscito: " + (e?.message || e)); setSocialTick(t => t + 1); });
    }
  };
  const [editEventTarget, setEditEventTarget] = useState(null);
  const saveEventEdit = async patch => {
    const e = editEventTarget; setEditEventTarget(null);
    if (!e) return;
    setEvents(ev => ev.map(x => x.id === e.id ? { ...x, ...patch } : x));
    const onDb = sb?.isConfigured && typeof e.id === "string" && e.id.includes("-");
    let coords = null;
    if (patch.place && patch.place.trim().toLowerCase() !== (e.place || "").trim().toLowerCase()) {
      coords = await geocodeCity(patch.place);                       // città cambiata → nuove coordinate
      if (coords) setEvents(ev => ev.map(x => x.id === e.id ? { ...x, lat: coords.lat, lng: coords.lng, dist: geo ? Math.round(haversine(geo, coords) * 10) / 10 : x.dist } : x));
    }
    if (onDb) sb.updateEvent(e.id, { ...patch, ...(coords ? { lat: coords.lat, lng: coords.lng } : {}) })
      .catch(err => { alert("Modifica non salvata: " + (err?.message || err)); setSocialTick(t => t + 1); });
  };
  const doDeleteEvent = () => {
    const e = editEventTarget; setEditEventTarget(null);
    if (!e) return;
    setEvents(ev => ev.filter(x => x.id !== e.id));
    if (sb?.isConfigured && typeof e.id === "string" && e.id.includes("-"))
      sb.deleteEvent(e.id).catch(err => { alert("Eliminazione non riuscita: " + (err?.message || err)); setSocialTick(t => t + 1); });
  };
  const sessionLost = err => {
    if (!/autenticat|jwt|token|session/i.test(String(err?.message || err))) return false;
    alert("La tua sessione non è più valida: accedi di nuovo per continuare. 🐝");
    if (sb?.isConfigured) sb.logout().catch(() => {});
    setUser(null);
    return true;
  };
  const addEvent = async e => {
    setOverlay(null);
    let ee = { ...e };
    if (ee.place && locName && ee.place.trim().toLowerCase() !== locName.trim().toLowerCase()) {
      const c = await geocodeCity(ee.place);                         // città diversa da qui → coordinate della città
      if (c) { ee.lat = c.lat; ee.lng = c.lng; }
    }
    if (sb?.isConfigured) {
      try { await sb.createEvent(ee); setSocialTick(t => t + 1); }
      catch (err) { if (!sessionLost(err)) alert("Evento non salvato: " + (err?.message || err)); }
      return;
    }
    const id = nextId; setNextId(n => n + 1);
    const dist = geo && ee.lat != null ? Math.round(haversine(geo, { lat: ee.lat, lng: ee.lng }) * 10) / 10 : 1;
    setEvents(ev => [{ id, dist, time: "adesso", ava: user.avatar, ...ee }, ...ev]);
  };

  if (!user) return <Frame><AuthScreen sb={sb} onLogin={u => setUser({ ...u, mine: true, avatar: "🌤️" })} /></Frame>;
  if (banInfo) return (
    <Frame>
      <div style={{ minHeight: "100%", background: BODY, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 28, textAlign: "center" }}>
        <div style={{ fontSize: 52, marginBottom: 14 }}>🚫</div>
        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 21, color: TXT, marginBottom: 10 }}>Account sospeso</div>
        <div style={{ fontSize: 15, color: TXT, lineHeight: 1.5, marginBottom: 8 }}>{banInfo.reason || "Il tuo account è stato temporaneamente sospeso."}</div>
        <div style={{ fontSize: 13, color: TXT2, marginBottom: 24 }}>Fino al {new Date(banInfo.until).toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" })}</div>
        <button onClick={() => { if (sb?.isConfigured) sb.logout().catch(() => {}); setUser(null); setBanInfo(null); }} style={{ padding: "12px 28px", borderRadius: 12, border: `1.5px solid ${LINE}`, background: "#fff", color: HBLUE, fontWeight: 600, cursor: "pointer", fontFamily: "'Sora',sans-serif" }}>Esci</button>
      </div>
    </Frame>
  );

  // overlay screens (full-screen, hide bottom nav)
  if (overlay === "post") return wrap(<CameraView onPost={onPost} onBack={() => setOverlay(null)} geoReal={geoReal} onCloudCheck={sb?.isConfigured && sb.beeEye ? async (img, hints) => { try { return await sb.beeEye(img, hints); } catch (e) { console.warn("bee-eye:", e?.message || e); return null; } } : null} />);
  const openPhoto = p => setOverlay(o => ({ photo: { src: p.img, caption: p.caption }, back: o }));
  if (overlay === "profile") return wrap(<ProfileView user={user} posts={allPosts} onLogout={() => { if (sb?.isConfigured) sb.logout().catch(() => {}); setUser(null); setTab("feed"); setOverlay(null); }} onBack={() => setOverlay(null)} onAvatar={saveAvatar} onOpenNotif={() => setOverlay("notif")} notif={notif} onDelete={deletePost} onEdit={p => setEditTarget(p)} onOpenPhoto={openPhoto}
    onRename={async () => {
      const v = window.prompt("Il tuo nome su Beeweat:", user.name);
      if (v === null) return;
      const name = v.trim();
      if (name.length < 2) { alert("Il nome è troppo corto."); return; }
      const old = user.name;
      setUser(u => u ? { ...u, name } : u);
      setPosts(ps => ps.map(p => p.mine ? { ...p, user: name } : p));
      if (sb?.isConfigured && myUid) {
        try { await sb.supabase.from("profiles").update({ name }).eq("id", myUid); setSocialTick(t => t + 1); }
        catch (e) { alert("Nome non salvato: " + (e?.message || e)); setUser(u => u ? { ...u, name: old } : u); }
      }
    }}
    onRenameCity={async () => {
      const v = window.prompt("La tua città su Beeweat:", user.city || "");
      if (v === null) return;
      const city = v.trim();
      if (!city) { alert("La città non può essere vuota."); return; }
      try { localStorage.setItem("bw_city_manual", "1"); } catch (_) {}
      setUser(u => u ? { ...u, city } : u);
      if (sb?.isConfigured && myUid) {
        try { await sb.supabase.from("profiles").update({ city }).eq("id", myUid); setSocialTick(t => t + 1); }
        catch (e) { alert("Città non salvata: " + (e?.message || e)); }
      }
    }} followingList={contacts.filter(c => followingIds.includes(c.id))} followersList={contacts.filter(c => followerIds.includes(c.id))} onFollow={toggleFollow} following={following} />);
  if (overlay?.photo) return wrap(<PhotoViewer src={overlay.photo.src} caption={overlay.photo.caption} onClose={() => setOverlay(overlay.back || null)} />);
  if (overlay === "alerts") return wrap(
    <div style={{ background: BODY, minHeight: "100%" }}>
      <div style={{ background: HBLUE, color: "#fff", padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => setOverlay(null)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}><NavIcon name="back" size={22} color="#fff" sw={2} /></button>
        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18, flex: 1 }}>Avvisi</span>
        {unreadCount > 0 && <button onClick={markAllRead} style={{ background: "rgba(255,255,255,.16)", border: "none", color: "#fff", fontSize: 12, fontWeight: 600, borderRadius: 14, padding: "6px 12px", cursor: "pointer", fontFamily: "'Sora',sans-serif" }}>Segna tutti letti</button>}
      </div>
      {alerts.length === 0
        ? <div style={{ padding: "40px 20px", textAlign: "center", color: TXT2, fontSize: 14 }}>Nessun avviso per ora.<br />Quando qualcuno ti scrive, lo troverai qui.</div>
        : alerts.map(a => (
          <div key={a.id} onClick={() => openAlertChat(a)} style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 16px", borderBottom: `1px solid ${LINE}`, cursor: "pointer", background: a.read ? "transparent" : HBLUE + "0C" }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: (a.type === "alert" || a.type === "nudge") ? "#F0B92933" : HBLUE + "15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{a.type === "alert" ? <span style={{ fontSize: 20 }}>⛈️</span> : (a.type === "nudge" || a.type === "followPost") ? <span style={{ fontSize: 20 }}>📸</span> : <NavIcon name="comment" size={20} color={HBLUE} />}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14.5, color: TXT }}>{a.type === "alert"
                ? <b style={{ color: HBLUE }}>Allerta BeeCast</b>
                : a.type === "nudge"
                ? <b style={{ color: HBLUE }}>Il cielo ti chiama</b>
                : <><b style={{ color: HBLUE }}>{nameOf(a.from_user_id)}</b> {a.type === "follow" ? "ha iniziato a seguirti" : a.type === "followPost" ? "ha pubblicato un nuovo cielo 📸" : "ti ha scritto"}</>}</div>
              {a.text && <div style={{ fontSize: 12.5, color: TXT2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 1 }}>{a.text}</div>}
              <div style={{ fontSize: 11, color: TXT2, marginTop: 2 }}>{new Date(a.created_at).toLocaleString("it-IT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</div>
            </div>
            {!a.read && <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#E5484D", flexShrink: 0 }} />}
            <button onClick={e => { e.stopPropagation(); removeAlert(a); }} title="Elimina avviso" style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", flexShrink: 0 }}><NavIcon name="close" size={15} color={TXT2} sw={2} /></button>
          </div>
        ))}
    </div>
  );
  if (overlay === "notif") return wrap(<NotifSettingsView settings={notif} onChange={saveNotif} onClose={() => setOverlay("profile")} pushState={pushState} onEnablePush={enablePush} onGeoGranted={c => { setGeo(c); setGeoReal(true); }} />);
  if (overlay?.user) return wrap(<UserProfileView profile={overlay.user} posts={allPosts} events={events} isAdmin={isAdmin} onBan={banUser} onOpenEvent={e => setOverlay({ eventMap: e, back: { user: overlay.user, back: overlay.back } })} isFollowing={following.includes(overlay.user.name)} onFollow={toggleFollow} onBack={() => setOverlay(overlay.back || null)} onChat={u => { if (u.uid) { openDirectChat({ id: u.uid, name: u.name, ava: u.ava }); setOverlay(o => ({ ...o, back: { user: overlay.user, back: overlay.back } })); } else setOverlay({ chat: { id: "u_" + u.name, name: u.name, ava: u.ava }, back: { user: overlay.user, back: overlay.back } }); }} onPostChat={p => openChatFromPost(p, { user: overlay.user, back: overlay.back })} onEdit={p => setEditTarget(p)}
    onOpenPhoto={openPhoto} onStar={onStar}
    onAdminEdit={async u => {
      if (!u.uid) { alert("Identificativo utente mancante."); return; }
      const name = window.prompt("Nome dell'ape:", u.name); if (name === null) return;
      const city = window.prompt("Città dell'ape:", u.city || ""); if (city === null) return;
      try {
        await sb.adminUpdateProfile(u.uid, { name: name.trim() || u.name, city: city.trim() });
        alert("Profilo aggiornato ✓"); setSocialTick(t => t + 1);
        setOverlay(o => o?.user ? { ...o, user: { ...o.user, name: name.trim() || u.name, city: city.trim() } } : o);
      } catch (e) { alert("Aggiornamento non riuscito: " + (e?.message || e)); }
    }} onDeleteUser={async u => {
      if (!u.uid) { alert("Identificativo utente mancante."); return; }
      if (!window.confirm(`ELIMINARE TOTALMENTE l'utente "${u.name}"?\nSpariranno account, post, messaggi, gruppi e notifiche. Irreversibile.`)) return;
      if (!window.confirm("Seconda conferma: procedere davvero con l'eliminazione definitiva?")) return;
      try { await sb.adminDeleteUser(u.uid); alert(`Utente "${u.name}" eliminato.`); setOverlay(null); setSocialTick(t => t + 1); loadFeed(); }
      catch (e) { alert("Eliminazione non riuscita: " + (e?.message || e)); }
    }} />);
  if (overlay?.chat) { const grp = overlay.groupId ? groups.find(g => g.id === overlay.groupId) : null; return wrap(<ChatView contact={overlay.chat} onDeleteMsg={typeof overlay.chat.id === "string" && overlay.chat.id.includes("-") && !overlay.chat.public && !overlay.chat.id.startsWith("g_") ? (mm => deleteDirectMsg(overlay.chat.id, mm)) : undefined} onClearChat={typeof overlay.chat.id === "string" && overlay.chat.id.includes("-") && !overlay.chat.public && !overlay.chat.id.startsWith("g_") ? (() => clearDirect(overlay.chat.id)) : undefined} msgs={threads[overlay.chat.id] || []} onSend={t => sendMsg(overlay.chat.id, t)} onBack={() => setOverlay(overlay.back || null)} group={grp} contacts={contacts} onUpdateGroup={updateGroup} />); }
  if (overlay?.eventMap) return wrap(<EventMapView event={overlay.eventMap} onBack={() => setOverlay(overlay.back || null)} />);
  if (overlay?.placeEvents) return wrap(<PlaceEventsView place={overlay.placeEvents} events={events} onBack={() => setOverlay(overlay.back || null)} onOpen={e => setOverlay({ eventMap: e, back: { placeEvents: overlay.placeEvents, back: overlay.back } })} />);
  if (overlay?.place) return wrap(<PlaceView place={overlay.place} people={contacts.filter(c => !c.me)} isAdmin={isAdmin} onEdit={p => setEditTarget(p)} onOpenPhoto={openPhoto} events={events} posts={allPosts} onBack={() => setOverlay(null)} onChat={pl => openPlaceChat(pl, { place: overlay.place })} onPostChat={p => openChatFromPost(p, { place: overlay.place })} onEvents={p => setOverlay({ placeEvents: p, back: { place: overlay.place } })} onOpenUser={u => setOverlay({ user: { name: u.name || u.user || "Utente", ava: u.ava, city: overlay.place.name, uid: u.uid || u.id }, back: { place: overlay.place } })} onStar={onStar} following={following} onFollow={toggleFollow} onReport={p => setReportTarget(p)} reported={reported} />);
  if (overlay === "search") {
    const places = [...new Set([...posts.map(p => p.city), ...events.map(e => e.place)])].filter(Boolean).sort();
    return wrap(<SearchView nearPlaces={realPlaces} people={contacts.filter(c => !c.me)} events={events} places={places} km={km} setKm={setKm} contactDist={contactDist} tab={tab} onTab={t => { setOverlay(null); setTab(t); }}
      onRemotePlaces={async qq => {
        const rows = await sb.searchCities(qq);
        return rows.map(r => ({
          id: "plr_" + r.city.trim().toLowerCase(),
          name: titleCase(r.city),
          dist: geo && r.lat != null ? Math.round(haversine(geo, { lat: r.lat, lng: r.lng })) : 0,
          photos: r.count, users: [], events: 0,
        }));
      }}
      onClose={() => setOverlay(null)}
      onPerson={p => setOverlay({ user: { name: p.name, ava: p.ava, city: p.city, uid: p.uid || p.id }, back: "search" })}
      onEvent={e => setOverlay({ eventMap: e })}
      onPlace={() => { setTab("vicini"); setOverlay(null); }}
      onOpenNearPlace={p => setOverlay({ place: p })}
    />);
  }

  const showWeather = tab === "feed" || tab === "vicini";
  const showRadar = tab === "feed" || tab === "vicini" || tab === "contatti" || tab === "beecast";
  const feedTitle = (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <NavIcon name="pin" size={18} color="#fff" sw={2} />
      {locName || "…"}
    </span>
  );
  const titles = { vicini: "Vicini", beecast: "BeeCast", feed: feedTitle, eventi: "Eventi", contatti: "Contatti" };
  const action = tab === "contatti"
    ? <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={() => setOverlay("createGroup")} style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", display: "flex" }}><NavIcon name="groups" size={23} color="#fff" sw={2} /></button>
        <button onClick={() => setOverlay("addContact")} style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", display: "flex" }}><NavIcon name="plus" size={24} color="#fff" sw={2.2} /></button>
      </div>
    : tab === "eventi"
      ? <button onClick={() => setOverlay("addEvent")} style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", display: "flex" }}><NavIcon name="plus" size={24} color="#fff" sw={2.2} /></button>
      : <button onClick={() => setOverlay("post")} title="Nuovo post" style={{ width: 40, height: 40, borderRadius: "50%", background: ACCENT, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px rgba(0,0,0,.28)" }}><NavIcon name="plus" size={22} color={HBLUE} sw={2.8} /></button>;
  const rightBtn = (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <button onClick={() => setOverlay("alerts")} style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", display: "flex", marginRight: 8, position: "relative" }}>
        <NavIcon name="bell" size={22} color="#fff" sw={2} />
        {unreadCount > 0 && <span style={{ position: "absolute", top: -4, right: -6, minWidth: 16, height: 16, borderRadius: 8, background: "#E5484D", color: "#fff", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>{unreadCount > 9 ? "9+" : unreadCount}</span>}
      </button>
      <button onClick={() => setOverlay("search")} style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", display: "flex", marginRight: 6 }}><NavIcon name="search" size={22} color="#fff" sw={2} /></button>
      {action}
    </div>
  );

  function wrap(content) {
    return <Frame>{content}
      {reportTarget && <ReportModal post={reportTarget} onSubmit={reportPost} onClose={() => setReportTarget(null)} />}
      {editTarget && <EditPostModal post={editTarget} onSave={saveEdit} onClose={() => setEditTarget(null)} onDelete={() => { const p = editTarget; setEditTarget(null); doDeletePost(p); }} />}
      {editEventTarget && <EditEventModal ev={editEventTarget} onSave={saveEventEdit} onDelete={doDeleteEvent} onClose={() => setEditEventTarget(null)} />}
    </Frame>;
  }

  return (
    <Frame>
      <Header title={titles[tab]} left={<button onClick={() => setOverlay("profile")} style={{ padding: 0, borderRadius: "50%", background: "#ffffff22", border: "1.5px solid #ffffff66", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}><UserAvatar src={user.avatar} size={36} ring={false} /></button>} right={rightBtn} />
      {notifToast && (
        <div onClick={() => { const k = notifToast; setNotifToast(null); routeNotifTap(k.kind, k.from); }} style={{ position: "fixed", top: 12, left: 12, right: 12, margin: "0 auto", zIndex: 400, background: "#1E2B3D", color: "#fff", borderRadius: 14, padding: "10px 16px", boxShadow: "0 8px 26px rgba(0,0,0,.38)", display: "flex", gap: 10, alignItems: "center", maxWidth: 380, width: "fit-content", cursor: "pointer" }} className="fade-up">
          <span style={{ fontSize: 18, flexShrink: 0 }}>{notifToast.kind === "alert" ? "⛈️" : notifToast.kind === "followPost" ? "📸" : notifToast.kind === "follow" ? "🐝" : "💬"}</span>
          <span style={{ fontSize: 13.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{notifToast.text}</span>
        </div>
      )}
      {showWeather && <WeatherPanel commentCount={totalComments} wx={wx} onOpenChat={() => openPlaceChat({ name: locName || user.city || "Beeweat" }, null)} />}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {tab === "feed" && <FeedScreen posts={feedShown} km={km} worldOn={feedWorld} onToggleWorld={() => setFeedWorld(v => !v)} onStar={onStar} onChat={openChatFromPost} onOpenUser={openUser} following={following} onFollow={toggleFollow} onReport={p => setReportTarget(p)} reported={reported} onView={onView} onOpenPhoto={openPhoto} isAdmin={isAdmin} onDelete={deletePost} onEdit={p => setEditTarget(p)} loading={!feedReady && posts.length === 0} />}
        {tab === "vicini" && <ViciniScreen posts={posts} events={events} km={km} onChat={openChatFromPost} onEvent={e => setOverlay({ eventMap: e })} onOpenUser={openUser} following={following} onFollow={toggleFollow} />}
        {tab === "beecast" && <BeeCastScreen km={km} wxHours={wx?.hours} wxSea={wx?.sea} wxSky={wx && { sunrise: wx.sunrise, sunset: wx.sunset, moon: wx.moon }} sense={senseCard} alertArmed={!!(notif?.enabled && notif?.allerte)} onArmAlert={() => { saveNotif({ ...notif, enabled: true, allerte: true }); enablePush(); }} onDisarmAlert={() => saveNotif({ ...notif, allerte: false })} />}
        {tab === "eventi" && <EventiScreen events={events} km={km} onOpen={e => setOverlay({ eventMap: e })} userName={user.name} myUid={myUid} isAdmin={isAdmin} onEditEnds={e => setEditEventTarget(e)} />}
        {tab === "contatti" && <ContattiScreen onOpenSelf={() => setOverlay("profile")} onOpenUser={c => setOverlay({ user: { name: c.name, ava: c.ava, city: c.city, uid: c.id } })} nearPlaces={realPlaces} contacts={contacts} groups={groups} km={km} onChat={openDirectChat} onOpenGroup={openGroupChat} onOpenPlace={p => setOverlay({ place: p })} onOpenPlaceEvents={p => setOverlay({ placeEvents: p })} people={contacts.filter(c => !c.me)} favs={favs} toggleFav={toggleFav} contactDist={contactDist} isAdminG={isAdmin}
          onEditGroup={async g => {
            const name = window.prompt("Nome del gruppo (lascia VUOTO per eliminarlo):", g.name);
            if (name === null) return;
            if (name.trim() === "") {
              if (!window.confirm(`Eliminare il gruppo "${g.name}" per tutti i membri?`)) return;
              try { await sb.deleteGroup(g.id); setSocialTick(t => t + 1); } catch (e) { alert("Eliminazione non riuscita: " + (e?.message || e)); }
              return;
            }
            try { await sb.updateGroup(g.id, { name: name.trim() }); setSocialTick(t => t + 1); } catch (e) { alert("Modifica non riuscita: " + (e?.message || e)); }
          }} worldOn={contactsWorld} onToggleWorld={() => setContactsWorld(v => !v)} worldPlaces={worldPlaces} />}
      </div>

      {showRadar && <RadarBar km={km} setKm={setKm} />}
      <BottomNav tab={tab} setTab={setTab} />

      {overlay === "addContact" && <AddContactModal people={[]} contacts={contacts} onAdd={addContact} onClose={() => setOverlay(null)} />}
      {overlay === "createGroup" && <CreateGroupModal contacts={contacts} onCreate={createGroup} onClose={() => setOverlay(null)} />}
      {reportTarget && <ReportModal post={reportTarget} onSubmit={reportPost} onClose={() => setReportTarget(null)} />}
      {overlay === "addEvent" && <AddEventModal user={user} geo={geo} locName={locName} onAdd={addEvent} onClose={() => setOverlay(null)} />}
      {editEventTarget && <EditEventModal ev={editEventTarget} onSave={saveEventEdit} onDelete={doDeleteEvent} onClose={() => setEditEventTarget(null)} />}
      {editTarget && <EditPostModal post={editTarget} onSave={saveEdit} onClose={() => setEditTarget(null)} onDelete={() => { const p = editTarget; setEditTarget(null); doDeletePost(p); }} />}
    </Frame>
  );
}


// ── Postino delle versioni: avvisa quando c'è una Beeweat più fresca ──────────
function UpdateBanner() {
  const [nv, setNv] = useState(null);
  useEffect(() => {
    let stop = false;
    const check = async () => {
      try {
        const r = await fetch("/version.json?t=" + Date.now(), { cache: "no-store" });
        const j = await r.json();
        if (!stop && j?.v && j.v !== APP_VERSION) setNv(j.v);
      } catch (_) {}
    };
    check();
    const iv = setInterval(check, 5 * 60 * 1000);
    const onVis = () => { if (document.visibilityState === "visible") check(); };
    document.addEventListener("visibilitychange", onVis);
    return () => { stop = true; clearInterval(iv); document.removeEventListener("visibilitychange", onVis); };
  }, []);
  if (!nv) return null;
  return (
    <div onClick={() => { window.location.href = window.location.pathname + "?u=" + Date.now(); }}
      style={{ position: "fixed", top: 10, left: 12, right: 12, zIndex: 600, background: "linear-gradient(135deg,#F0B929,#E0A315)", color: "#3A2B05", borderRadius: 14, padding: "12px 16px", fontSize: 13.5, fontWeight: 600, fontFamily: "'Sora',sans-serif", boxShadow: "0 8px 26px rgba(224,163,21,.45)", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
      <span style={{ fontSize: 18 }}>🐝</span>
      <span style={{ flex: 1 }}>È pronta <b>Beeweat v{nv}</b> — tocca qui per aggiornare</span>
      <span style={{ fontSize: 16 }}>🔄</span>
    </div>
  );
}

// ── Paracadute globale: qualsiasi errore diventa una schermata leggibile ──────
class BeeBoundary extends React.Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(e) { return { err: e }; }
  render() {
    if (this.state.err) return (
      <div style={{ minHeight: "100vh", background: "#EAF2FA", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Sora',sans-serif" }}>
        <div style={{ background: "#fff", borderRadius: 18, padding: 24, maxWidth: 420, width: "100%", boxShadow: "0 10px 34px rgba(27,78,150,.18)", textAlign: "center" }}>
          <div style={{ fontSize: 40 }}>🐝</div>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 19, color: "#22467A", margin: "8px 0 6px" }}>Ops, l'alveare è inciampato</div>
          <div style={{ fontSize: 13, color: "#5B7397", marginBottom: 12 }}>Fai uno screenshot di questo messaggio e mandalo agli sviluppatori:</div>
          <pre style={{ textAlign: "left", background: "#F2F6FB", borderRadius: 10, padding: 10, fontSize: 11, color: "#C43C41", whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: 140, overflowY: "auto" }}>{String(this.state.err?.message || this.state.err)}</pre>
          <button onClick={() => window.location.reload()} style={{ marginTop: 12, padding: "12px 22px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#2E6BB8,#1B4E96)", color: "#fff", fontWeight: 600, cursor: "pointer", fontFamily: "'Sora',sans-serif" }}>Ricarica Beeweat</button>
        </div>
      </div>
    );
    return this.props.children;
  }
}
export default function App() { return <BeeBoundary><UpdateBanner /><AppInner /></BeeBoundary>; }
