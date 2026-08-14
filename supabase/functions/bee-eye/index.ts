// ═══════════════════════════════════════════════════════════════════
//  BEE-EYE — il secondo parere: un occhio che capisce le scene
//  Deploy:  supabase functions deploy bee-eye
//  Chiave:  supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
// ═══════════════════════════════════════════════════════════════════
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    // solo api autenticate: il gettone di sessione va verificato
    const supa = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization") || "" } } }
    );
    const { data: { user } } = await supa.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "non autenticato" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });

    const { image, hints } = await req.json();
    if (!image?.startsWith("data:image/")) return new Response(JSON.stringify({ error: "immagine mancante" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    const [meta, b64] = image.split(",");
    const mediaType = (meta.match(/data:(.*?);/) || [])[1] || "image/jpeg";

    const prompt = `Sei il moderatore fotografico di un'app meteo di comunità. Analizza la foto e rispondi SOLO con un JSON (nessun testo attorno) con questi campi:
{"esterno": bool, "cielo_visibile": bool, "persone_in_primo_piano": bool, "schermo_o_foto_di_foto": bool, "condizione": una tra ["Sereno","Poco nuvoloso","Pioggia","Temporale","Neve","Nebbia","Ventoso","Arcobaleno"], "fiducia": 0..1, "motivo": "breve frase in italiano"}
Regole: "persone_in_primo_piano" è true solo se una persona riconoscibile domina l'inquadratura; passanti piccoli e di spalle non contano. "schermo_o_foto_di_foto" è true per TV, monitor, o foto ri-fotografate. La condizione descrive il cielo/meteo visibile.${hints?.aiClass ? ` Suggerimento dell'occhio locale (non vincolante): ${hints.aiClass}.` : ""}`;

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 300,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: b64 } },
            { type: "text", text: prompt },
          ],
        }],
      }),
    });
    if (!r.ok) throw new Error("api " + r.status + ": " + (await r.text()).slice(0, 200));
    const out = await r.json();
    const txt = (out.content || []).map((c: any) => c.text || "").join("").trim()
      .replace(/```json|```/g, "").trim();
    const verdict = JSON.parse(txt);
    return new Response(JSON.stringify({ verdict }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
