// Beeweat 14.53 — api/co2.js (Vercel serverless)
// CO₂ atmosferica misurata all'Osservatorio di Mauna Loa (NOAA GML): ultimo dato settimanale,
// confronto a 30 giorni, a 1 anno e a 10 anni. Il browser non può leggere il file NOAA
// direttamente (niente CORS): questa funzione lo legge, lo riassume e lo tiene in cache 6 ore.
// Fonte: https://gml.noaa.gov/ccgg/trends/  (file: co2_weekly_mlo.csv — pubblico, NOAA/GML)
const SRC = "https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_weekly_mlo.csv";
let cache = { t: 0, body: null };

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "public, s-maxage=21600, stale-while-revalidate=86400");
  try {
    if (cache.body && Date.now() - cache.t < 6 * 3600 * 1000) return res.status(200).json(cache.body);
    const r = await fetch(SRC, { headers: { "User-Agent": "Beeweat/14 (beeweat.com)" } });
    if (!r.ok) throw new Error("NOAA " + r.status);
    const txt = await r.text();
    // righe dati: numeri separati da virgola (year, month, day, decimal, average, ndays, 1 yr ago, 10 yr ago, since 1800)
    const rows = txt.split("\n").map(l => l.trim()).filter(l => l && !l.startsWith("#") && /^\d{4},/.test(l))
      .map(l => l.split(",").map(Number)).filter(a => a.length >= 5 && a[4] > 0);   // -999.99 = settimana senza dato
    if (!rows.length) throw new Error("nessun dato");
    const last = rows[rows.length - 1];
    const date = a => `${a[0]}-${String(a[1]).padStart(2, "0")}-${String(a[2]).padStart(2, "0")}`;
    const dayOf = a => Date.UTC(a[0], a[1] - 1, a[2]);
    const target = dayOf(last) - 30 * 86400000;
    let ago30 = null, best = Infinity;
    for (const a of rows) { const d = Math.abs(dayOf(a) - target); if (d < best) { best = d; ago30 = a; } }   // la settimana più vicina a 30 giorni fa
    const body = {
      source: "NOAA GML · Mauna Loa Observatory", unit: "ppm",
      date: date(last), ppm: +last[4].toFixed(2),
      ago30: ago30 ? { date: date(ago30), ppm: +ago30[4].toFixed(2) } : null,
      ago365: last[6] > 0 ? +last[6].toFixed(2) : null,
      ago10y: last[7] > 0 ? +last[7].toFixed(2) : null,
      since1800: last[8] > 0 ? +last[8].toFixed(2) : null,
      updated: new Date().toISOString(),
    };
    cache = { t: Date.now(), body };
    return res.status(200).json(body);
  } catch (e) {
    if (cache.body) return res.status(200).json({ ...cache.body, stale: true });
    return res.status(503).json({ error: String(e?.message || e) });
  }
}
