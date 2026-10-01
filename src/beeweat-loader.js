// Beeweat — loader degli aggiornamenti per l'app degli store (Capacitor).
// All'avvio confronta il version.json dentro l'app con quello su Vercel:
// se online c'è una versione più nuova scarica il pacchetto compilato di
// beeweat.jsx e lo attiva alla prossima apertura. Nel browser (PWA) non fa nulla.
import { Capacitor, CapacitorHttp } from "@capacitor/core";

export const BW_BASE = "https://beeweat.vercel.app";

// Confronto fra versioni tipo "13.7" / "14.1.2": >0 se a è più nuova di b.
export function cmpVersion(a, b) {
  const pa = String(a).split(".").map((n) => parseInt(n, 10) || 0);
  const pb = String(b).split(".").map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d !== 0) return d;
  }
  return 0;
}

// Cuore del loader, con le dipendenze passate da fuori (così è verificabile).
// Restituisce sempre un oggetto { stato, ... } e non lancia mai eccezioni.
export async function runLoader({ updater, getRemote, getLocal, base = BW_BASE }) {
  try {
    // 1. Conferma che il pacchetto in uso parte: senza questa chiamata il
    //    plugin lo considera guasto e torna da solo al precedente.
    await updater.notifyAppReady();

    const cur = await updater.current();
    const local = (await getLocal()) || cur.bundle.version;
    const remote = await getRemote();
    if (!remote || !remote.v) return { stato: "nessuna-info" };

    if (cmpVersion(remote.v, local) <= 0) return { stato: "aggiornata", versione: local };

    // 2. Il pacchetto nuovo richiede un guscio nativo più recente: si passa dallo store.
    if (remote.minNative && cmpVersion(remote.minNative, cur.native) > 0) {
      return { stato: "serve-store", versione: remote.v, minNative: remote.minNative };
    }

    // 3. Scarica e mette in coda: si attiva quando l'app va in background o viene riaperta.
    const bundle = await updater.download({
      url: `${base}/bundles/beeweat-${remote.v}.zip`,
      version: String(remote.v),
    });
    await updater.next({ id: bundle.id });
    return { stato: "scaricata", versione: remote.v };
  } catch (e) {
    return { stato: "errore", errore: String((e && e.message) || e) };
  }
}

export async function startLoader() {
  if (!Capacitor.isNativePlatform()) return { stato: "web" };
  const { CapacitorUpdater } = await import("@capgo/capacitor-updater");
  const esito = await runLoader({
    updater: CapacitorUpdater,
    // version.json del pacchetto in uso (sta dentro l'app)
    getLocal: async () => {
      try {
        const r = await fetch("version.json", { cache: "no-store" });
        return (await r.json()).v;
      } catch { return null; }
    },
    // version.json pubblicato su Vercel (richiesta nativa: niente blocchi CORS)
    getRemote: async () => {
      const r = await CapacitorHttp.get({ url: `${BW_BASE}/version.json?t=${Date.now()}` });
      return typeof r.data === "string" ? JSON.parse(r.data) : r.data;
    },
  });
  window.__bwLoader = esito;
  window.dispatchEvent(new CustomEvent("bw-loader", { detail: esito }));
  return esito;
}

if (typeof window !== "undefined") startLoader().catch(() => {});
