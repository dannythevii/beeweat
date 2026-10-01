// Dopo "vite build": impacchetta dist/ in dist/bundles/beeweat-<versione>.zip,
// il file che il loader dell'app scarica da Vercel.
import fs from "node:fs";
import path from "node:path";
import AdmZip from "adm-zip";

const dist = path.resolve("dist");
const vfile = path.join(dist, "version.json");
if (!fs.existsSync(path.join(dist, "index.html"))) throw new Error("dist/index.html mancante: eseguire prima vite build");
if (!fs.existsSync(vfile)) throw new Error("dist/version.json mancante (public/version.json)");
const v = JSON.parse(fs.readFileSync(vfile, "utf8")).v;
if (!v) throw new Error('version.json senza campo "v"');

const out = path.join(dist, "bundles");
fs.rmSync(out, { recursive: true, force: true });
const zip = new AdmZip();
for (const name of fs.readdirSync(dist)) {
  const p = path.join(dist, name);
  if (fs.statSync(p).isDirectory()) zip.addLocalFolder(p, name);
  else zip.addLocalFile(p);
}
fs.mkdirSync(out);
const target = path.join(out, `beeweat-${v}.zip`);
zip.writeZip(target);
console.log(`Pacchetto loader: ${path.relative(".", target)} (${(fs.statSync(target).size / 1024).toFixed(0)} KB)`);
