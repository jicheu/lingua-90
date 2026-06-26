import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// base: "./" => relative asset paths so the static build works no matter
// which sub-path YunoHost serves it from (e.g. https://domain.tld/lingua/).
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
});
