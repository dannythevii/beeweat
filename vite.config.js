import react from "@vitejs/plugin-react";
import { resolve } from "path";
// 14.66: due pagine — l'app (index.html) e l'area riservata (admin.html)
export default { plugins: [react()], build: { target: "es2020", rollupOptions: { input: { main: resolve(__dirname, "index.html"), admin: resolve(__dirname, "admin.html") } } } };
