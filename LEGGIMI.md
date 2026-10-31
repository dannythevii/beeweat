# Beeweat app — pacchetto completo alla 14.68 (cruscotto + statistiche)

Questo pacchetto contiene lo STATO FINALE dei file: li copi al loro posto e sei alla 14.68, qualunque versione tu abbia ora (dalla 14.62 in su). Niente script da lanciare.

## 1 · Supabase (SQL Editor, una volta ciascuno, in quest'ordine)
- `sql/beeweat-14.66-cruscotto.sql`  → segnalazioni, inviti ad amministratore, funzioni del cruscotto
- `sql/beeweat-14.67-statistiche.sql` → statistiche e campo «genere»
Ognuno deve finire con `esito: ok`.

## 2 · File del progetto (la cartella ha la stessa struttura del progetto: sovrascrivi)
- `src/beeweat.jsx`           → sostituisce src/beeweat.jsx          (app, 14.68)
- `src/admin.jsx`             → nuovo in src/                        (cruscotto)
- `src/beeweat-supabase.js`   → sostituisce src/beeweat-supabase.js  (funzioni, incluse quelle del cruscotto)
- `admin.html`                → nuovo, nella radice accanto a index.html
- `vite.config.js`            → sostituisce quello nella radice (seconda pagina admin.html)
- `public/version.json`       → sostituisce public/version.json  ({"v":"14.68"})
NON toccare `src/beeweat-config.js` (le tue chiavi) e `src/main.jsx`.

## 3 · Pubblica su Vercel, poi verifica
- https://app.beeweat.com/version.json → {"v":"14.68"}
- https://app.beeweat.com/admin.html → Panoramica → «Cosa fa l'alveare» con i grafici (ricarica forzata: Cmd+Shift+R)
- Nell'app: Profilo → riga «Area riservata» (solo admin) e riga «Chi sei».

## Cosa c'è dentro (dalla 14.62 ripristinata)
14.63 temperatura del post nel feed · 14.64 ingresso diretto, zaino in IndexedDB, analisi più veloce, tastiera iPhone, feed senza rete, GPS all'apertura · 14.65 solo posizione precisa · 14.66 area riservata (cruscotto) · 14.67 statistiche · 14.68 icone del cruscotto come l'app.
