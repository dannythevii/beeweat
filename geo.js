// BEEWEAT — api/geo.js (Vercel Function)
// Posizione approssimativa dalla rete: Vercel aggiunge a ogni richiesta la città e le coordinate
// stimate dall'indirizzo IP (x-vercel-ip-*). Nessun permesso, nessun popup, nessun tracciamento:
// non si salva nulla, si rispedisce solo la zona (arrotondata a ~1 km) al telefono che l'ha chiesta.
// In locale (vite dev) le intestazioni non ci sono: risponde 204 e l'app resta sulla posizione di base.
export default function handler(req, res) {
  const h = req.headers || {};
  const lat = parseFloat(h["x-vercel-ip-latitude"]);
  const lng = parseFloat(h["x-vercel-ip-longitude"]);
  res.setHeader("Cache-Control", "private, no-store");
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) { res.status(204).end(); return; }
  let city = "";
  try { city = decodeURIComponent(h["x-vercel-ip-city"] || ""); } catch (_) { city = String(h["x-vercel-ip-city"] || ""); }
  res.status(200).json({
    city,
    region: h["x-vercel-ip-country-region"] || "",
    country: h["x-vercel-ip-country"] || "",
    lat: Math.round(lat * 100) / 100,
    lng: Math.round(lng * 100) / 100,
    approx: true,
  });
}
