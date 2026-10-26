import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Required for https://jiyeonjungart.github.io/penn-degree-plan-prototype/
  base: "/penn-degree-plan-prototype/",
});
