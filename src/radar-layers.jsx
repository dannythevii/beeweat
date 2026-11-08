// ── 14.78: strati meteo veri sul disco del Radar: pioggia (radar RainViewer, animata), nuvole (modello Open-Meteo,
//    prossime ore), satellite (Meteosat via EUMETView, ultime 2 ore). Tutto in scala con il raggio scelto. ───────────
const RV_API = "https://api.rainviewer.com/public/weather-maps.json";
const EUMET_WMS = "https://view.eumetsat.int/geoserver/wms";
const SAT_LAYERS = { day: ["mtg_fd:rgb_truecolour", "msg_fes:rgb_naturalenhncd", "msg_fes:rgb_naturalcolor"], night: ["mtg_fd:ir105", "msg_fes:ir108", "msg_fes:rgb_naturalenhncd"] };
const _mercPx = (lat, lng, z) => { const n = 256 * Math.pow(2, z), r = lat * Math.PI / 180; return { x: (lng + 180) / 360 * n, y: (1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * n }; };
const _hhmm = t => new Date(t).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
const _bbox = (geo, km) => { const dLat = km / 111.32, dLng = km / (111.32 * Math.max(0.2, Math.cos(geo.lat * Math.PI / 180))); return { lat0: geo.lat - dLat, lat1: geo.lat + dLat, lng0: geo.lng - dLng, lng1: geo.lng + dLng }; };

// Pioggia: le piastrelle RainViewer che coprono il disco, in scala; 10 fotogrammi (70 min passati + 30 min previsti)
async function rvFrames(geo, km, R) {
  const d = await (await fetch(RV_API)).json();
  const list = [...(d.radar?.past || []).slice(-7), ...(d.radar?.nowcast || []).slice(0, 3)];
  if (!list.length) return [];
  const want = (2 * km * 1000) / 600;   // metri per pixel desiderati: il disco ≈ 600 px
  const z = Math.max(3, Math.min(10, Math.round(Math.log2(156543.03 * Math.cos(geo.lat * Math.PI / 180) / want))));
  const mpp = 156543.03 * Math.cos(geo.lat * Math.PI / 180) / Math.pow(2, z);
  const c = _mercPx(geo.lat, geo.lng, z), rpx = km * 1000 / mpp, k = R / rpx, n = Math.pow(2, z);
  const tx0 = Math.floor((c.x - rpx) / 256), tx1 = Math.floor((c.x + rpx) / 256), ty0 = Math.max(0, Math.floor((c.y - rpx) / 256)), ty1 = Math.min(n - 1, Math.floor((c.y + rpx) / 256));
  const tiles = []; for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) tiles.push({ tx: ((tx % n) + n) % n, ty, x: (tx * 256 - c.x) * k, y: (ty * 256 - c.y) * k, s: 256 * k });
  if (tiles.length > 36) return [];   // raggio enorme: non ha senso
  return list.map(f => ({ time: f.time * 1000, nowcast: (d.radar?.nowcast || []).includes(f), imgs: tiles.map(t => ({ ...t, href: `${d.host}${f.path}/256/${z}/${t.tx}/${t.ty}/2/1_1.png` })) }));
}
// Nuvole: copertura nuvolosa del modello su una griglia 9×9 dentro il disco, ora dopo ora (1 h passata + 6 future)
async function cloudFrames(geo, km, R) {
  const b = _bbox(geo, km), N = 9, lats = [], lngs = [];
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { lats.push((b.lat1 - (b.lat1 - b.lat0) * j / (N - 1)).toFixed(3)); lngs.push((b.lng0 + (b.lng1 - b.lng0) * i / (N - 1)).toFixed(3)); }
  const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lats.join(",")}&longitude=${lngs.join(",")}&hourly=cloud_cover&past_hours=1&forecast_hours=6&timezone=auto`);
  if (!r.ok) throw new Error("Open-Meteo " + r.status);
  const d = await r.json(), arr = Array.isArray(d) ? d : [d]; if (!arr[0]?.hourly) return [];
  const times = arr[0].hourly.time, out = [];
  for (let h = 0; h < times.length; h++) {
    const c = document.createElement("canvas"); c.width = c.height = N; const img = c.getContext("2d").createImageData(N, N);
    for (let k = 0; k < N * N; k++) { const cc = arr[k]?.hourly?.cloud_cover?.[h] || 0, o = k * 4; img.data[o] = 255; img.data[o + 1] = 255; img.data[o + 2] = 255; img.data[o + 3] = Math.round(Math.max(0, cc - 15) / 85 * 210); }
    c.getContext("2d").putImageData(img, 0, 0);
    const big = document.createElement("canvas"); big.width = big.height = 256; const bx = big.getContext("2d"); bx.imageSmoothingEnabled = true; bx.imageSmoothingQuality = "high"; bx.drawImage(c, -256 / (N - 1) / 2, -256 / (N - 1) / 2, 256 * N / (N - 1), 256 * N / (N - 1));
    out.push({ time: new Date(times[h]).getTime(), model: true, imgs: [{ x: -R, y: -R, s: 2 * R, href: big.toDataURL("image/png") }] });
  }
  return out;
}
// Satellite: Meteosat (EUMETView WMS), un'immagine quadrata in chilometri sul disco; ultime 2 ore a passi di 15 min
function satFrames(geo, km, R, isDay) {
  const b = _bbox(geo, km), layers = isDay === false ? SAT_LAYERS.night : SAT_LAYERS.day;
  const url = (layer, t) => `${EUMET_WMS}?service=WMS&version=1.3.0&request=GetMap&layers=${encodeURIComponent(layer)}&styles=&crs=EPSG:4326&bbox=${b.lat0.toFixed(4)},${b.lng0.toFixed(4)},${b.lat1.toFixed(4)},${b.lng1.toFixed(4)}&width=512&height=512&format=image/png&transparent=true${t ? "&time=" + encodeURIComponent(new Date(t).toISOString().replace(/\.\d{3}Z$/, ".000Z")) : ""}`;
  const now = Date.now(), q = 15 * 60000, last = Math.floor((now - 20 * 60000) / q) * q;   // l'ultima immagine disponibile è di ~20 min fa
  const times = []; for (let i = 7; i >= 0; i--) times.push(last - i * q);
  return { layers, frames: times.map(t => ({ time: t, sat: true, imgs: [{ x: -R, y: -R, s: 2 * R, href: null, urls: layers.map(l => url(l, t)) }] })) };
}
function useRadarLayers(geo, km, R, on, isDay) {
  const [data, setData] = useState({ rain: [], clouds: [], sat: [], err: {} });
  const [idx, setIdx] = useState(0), [playing, setPlaying] = useState(true);
  const key = `${geo?.lat?.toFixed(3)},${geo?.lng?.toFixed(3)},${km}`;
  useEffect(() => {
    if (!geo || !(on.rain || on.clouds || on.sat)) return;
    let dead = false;
    const put = (k, v) => { if (!dead) setData(d => ({ ...d, [k]: v })); };
    const fail = (k, e) => { if (!dead) setData(d => ({ ...d, [k]: [], err: { ...d.err, [k]: e?.message || "non disponibile" } })); };
    if (on.rain) rvFrames(geo, km, R).then(f => put("rain", f)).catch(e => fail("rain", e));
    if (on.clouds) cloudFrames(geo, km, R).then(f => put("clouds", f)).catch(e => fail("clouds", e));
    if (on.sat) {
      const { frames } = satFrames(geo, km, R, isDay);
      // provo gli strati in ordine sul fotogramma più recente: il primo che carica vale per tutti
      (async () => {
        const f0 = frames[frames.length - 1].imgs[0];
        let li = -1;
        for (let i = 0; i < f0.urls.length && li < 0; i++) { const ok = await new Promise(res => { const im = new Image(); im.onload = () => res(im.naturalWidth > 1); im.onerror = () => res(false); im.src = f0.urls[i]; }); if (ok) li = i; }
        if (li < 0) return fail("sat", new Error("satellite non raggiungibile"));
        const good = [];
        for (const fr of frames) { const u = fr.imgs[0].urls[li]; const ok = await new Promise(res => { const im = new Image(); im.onload = () => res(im.naturalWidth > 1); im.onerror = () => res(false); im.src = u; }); if (ok) good.push({ ...fr, imgs: [{ ...fr.imgs[0], href: u }] }); }
        if (!good.length) return fail("sat", new Error("nessuna immagine satellite"));
        put("sat", good);
      })();
    }
    return () => { dead = true; };
  }, [key, on.rain, on.clouds, on.sat]);
  const n = Math.max(on.rain ? data.rain.length : 0, on.clouds ? data.clouds.length : 0, on.sat ? data.sat.length : 0);
  useEffect(() => { if (!playing || n < 2) return; const t = setInterval(() => setIdx(i => (i + 1) % n), 650); return () => clearInterval(t); }, [playing, n]);
  useEffect(() => { setIdx(0); }, [key]);
  const pick = (arr) => arr.length ? arr[Math.min(arr.length - 1, Math.round(idx / Math.max(1, n - 1) * (arr.length - 1)))] : null;
  return { rain: on.rain ? pick(data.rain) : null, clouds: on.clouds ? pick(data.clouds) : null, sat: on.sat ? pick(data.sat) : null, err: data.err, idx, n, playing, setPlaying, has: { rain: data.rain.length, clouds: data.clouds.length, sat: data.sat.length } };
}
function RadarLayerImgs({ frame, cx, cy, opacity }) {
  if (!frame) return null;
  return <g opacity={opacity} style={{ pointerEvents: "none" }}>{frame.imgs.map((t, i) => t.href ? <image key={i} href={t.href} x={cx + t.x} y={cy + t.y} width={t.s} height={t.s} preserveAspectRatio="none" /> : null)}</g>;
}
