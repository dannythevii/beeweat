// BEEWEAT — api/solano.js (Vercel Function) · 14.25
// Ponte verso Solano (solanometeo.fr): allerte ufficiali (MeteoAlarm, MeteoAM), rischio temporali e confronto modelli
// per BeeCast. Solano espone un server MCP pubblico (https://solanometeo.fr/mcp, nessuna chiave): il telefono non può
// chiamarlo direttamente (CORS), quindi passa da qui. Le coordinate arrivano già arrotondate (~10 km) e la risposta è
// messa in cache sulla rete Vercel per 15 minuti: tante api, poche chiamate.
// Uso: GET /api/solano?lat=40.55&lng=14.24  →  { alerts:[…], storm:{…}, models:[…], sea:{…}, url }

const MCP = "https://solanometeo.fr/mcp";
const PROTO = "2025-06-18";

async function rpc(method, params, id, session) {
  const h = { "Content-Type": "application/json", "Accept": "application/json, text/event-stream", "MCP-Protocol-Version": PROTO };
  if (session) h["Mcp-Session-Id"] = session;
  const r = await fetch(MCP, { method: "POST", headers: h, body: JSON.stringify({ jsonrpc: "2.0", id, method, params }) });
  const sid = r.headers.get("mcp-session-id") || session || null;
  const ct = r.headers.get("content-type") || "";
  const txt = await r.text();
  if (!r.ok) throw new Error(`MCP ${r.status}: ${txt.slice(0, 200)}`);
  let msg = null;
  if (ct.includes("text/event-stream")) {
    for (const line of txt.split("\n")) {
      if (!line.startsWith("data:")) continue;
      try { const j = JSON.parse(line.slice(5).trim()); if (j && j.id === id) msg = j; } catch (_) {}
    }
  } else if (txt.trim()) { try { msg = JSON.parse(txt); } catch (_) {} }
  return { msg, sid };
}

async function callTool(name, args, state) {
  const go = async () => {
    const { msg, sid } = await rpc("tools/call", { name, arguments: args }, state.n++, state.sid);
    if (sid) state.sid = sid;
    if (!msg) throw new Error("MCP: risposta vuota");
    if (msg.error) throw Object.assign(new Error(msg.error.message || "MCP error"), { code: msg.error.code });
    const text = (msg.result?.content || []).map(c => c.text || "").join("");
    try { return JSON.parse(text); } catch (_) { return { raw: text }; }
  };
  try { return await go(); }
  catch (e) {
    if (state.inited) throw e;
    // alcuni server vogliono l'handshake: initialize → notifications/initialized → riprova
    const { sid } = await rpc("initialize", { protocolVersion: PROTO, capabilities: {}, clientInfo: { name: "beeweat", version: "14.25" } }, state.n++, state.sid);
    if (sid) state.sid = sid;
    await rpc("notifications/initialized", {}, undefined, state.sid).catch(() => {});
    state.inited = true;
    return go();
  }
}

const EVENT_IT = { Rain: "Pioggia", Thunderstorm: "Temporali", Wind: "Vento", Snow: "Neve", "Snow/Ice": "Neve e ghiaccio", Fog: "Nebbia", "Coastal event": "Mareggiate", "Coastalevent": "Mareggiate", "High temperature": "Caldo", "Low temperature": "Freddo", "Forest fire": "Incendi", Flooding: "Alluvione", Flood: "Alluvione", Avalanches: "Valanghe" };
const COLOR_IT = { Red: "rossa", Orange: "arancione", Yellow: "gialla", Jaune: "gialla", Rouge: "rossa" };
const CAT_IT = { severe: "severo", marque: "marcato", "marked": "marcato", modere: "moderato", moderate: "moderato", faible: "basso", low: "basso", nul: "nullo", none: "nullo" };
const ORG_IT = { organise: "organizzato", organised: "organizzato", multi: "multicellulare", isole: "isolato", isolated: "isolato" };

export default async function handler(req, res) {
  const lat = parseFloat(req.query?.lat), lng = parseFloat(req.query?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) { res.status(400).json({ error: "lat/lng mancanti" }); return; }
  const la = Math.round(lat * 10) / 10, lo = Math.round(lng * 10) / 10;   // ~10 km: stessa risposta per tutta la zona
  res.setHeader("Cache-Control", "public, s-maxage=900, stale-while-revalidate=1800");
  const state = { n: 1, sid: null, inited: false };
  const out = { lat: la, lng: lo, at: new Date().toISOString(), url: `https://solanometeo.fr/?lat=${la.toFixed(4)}&lon=${lo.toFixed(4)}`, alerts: [], storm: null, models: [], sea: null, errors: [] };

  const [al, st, fc] = await Promise.allSettled([
    callTool("get_zone_alerts", { latitude: la, longitude: lo }, state),
    callTool("get_storm_risk", { latitude: la, longitude: lo, days: 2 }, state),
    callTool("get_forecast", { latitude: la, longitude: lo, days: 2, include_sea_state: true }, state),
  ]);

  if (al.status === "fulfilled") {
    const list = Array.isArray(al.value?.alerts) ? al.value.alerts : [];
    out.alerts = list
      .filter(a => a.provider !== "meteoalarm" || a.coarse === false)   // MeteoAlarm: solo la regione giusta, non l'Italia intera
      .map(a => {
        const m = /^(?:Red|Orange|Yellow|Green|Rouge|Jaune|Vert)?\s*(.+?)\s+Warning\s*[—-]\s*(\w+)/i.exec(a.titre || "");
        const ev = m ? (EVENT_IT[m[1]] || m[1]) : (a.titre || "Avviso");
        const col = m ? (COLOR_IT[m[2]] || m[2].toLowerCase()) : (a.niveau === "warning" ? "arancione" : "gialla");
        return {
          source: a.source || a.provider, zone: (a.zone_label && a.zone_label !== a.titre) ? a.zone_label : "", level: a.level || (a.niveau === "warning" ? 3 : 2),
          title: a.provider === "meteoam" ? a.titre : `Allerta ${col} · ${ev}`,
          text: a.texte || "", onset: a.onset || null, expires: a.expires || null, url: a.detail_url || null,
          sectors: a.secteurs || null
        };
      })
      .sort((a, b) => (b.level || 0) - (a.level || 0));
  } else out.errors.push("alerts");

  if (st.status === "fulfilled" && Array.isArray(st.value?.daily)) {
    out.storm = {
      scope: "ambiente a scala di bacino (~25 km): non localizza le singole celle",
      days: st.value.daily.map(d => ({ date: d.date, score: d.peak_score_0_10, category: CAT_IT[d.peak_category] || d.peak_category, organisation: ORG_IT[d.organisation] || d.organisation, peakUtc: d.peak_hour_utc, confidence: d.confidence, cape: d.cape_max, loadedCap: !!d.loaded_cap }))
    };
  } else out.errors.push("storm");

  if (fc.status === "fulfilled") {
    out.models = (fc.value?.models || []).map(m => ({ key: m.key, label: m.label, run: m.run, days: (m.daily || []).map(d => ({ date: d.date, windKt: d.wind_kt_mean, windMaxKt: d.wind_kt_max, gustKt: d.gust_kt_max, windFrom: d.wind_from, tMin: d.temp_c_min, tMax: d.temp_c_max, rainMm: d.precip_mm_total, cape: d.cape_max })) }));
    const ss = fc.value?.sea_state;
    if (ss) out.sea = { label: ss.label, days: (ss.daily || []).map(d => ({ date: d.date, hs: d.wave_hs_m_mean, hsMax: d.wave_hs_m_max, hmax: d.wave_hmax_m_max, period: d.wave_period_s_mean, from: d.wave_from })) };
  } else out.errors.push("forecast");

  if (out.errors.length === 3) { res.setHeader("Cache-Control", "private, no-store"); res.status(502).json({ error: "Solano non raggiungibile", detail: [al, st, fc].map(x => x.reason?.message).filter(Boolean) }); return; }
  res.status(200).json(out);
}
