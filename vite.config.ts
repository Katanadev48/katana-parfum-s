import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "node:path"
// Chantan Element Editor tagger (dev only) — stamps data-chantan-src on JSX
// @ts-ignore
import chantanTagger from "./chantan-tagger.mjs"
import pkg from "./package.json"

const PREBUNDLE_EXCLUDE = new Set(["tailwindcss-animate"])
const prebundle = [
  "react/jsx-runtime",
  "react-dom/client",
  ...Object.keys((pkg as { dependencies?: Record<string, string> }).dependencies || {}).filter(
    (d) => !PREBUNDLE_EXCLUDE.has(d)
  ),
]

export default defineConfig(({ mode }) => ({
  plugins: [react(mode === "production" ? {} : { babel: { plugins: [[chantanTagger, { root: process.cwd() }]] } })],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  optimizeDeps: {
    include: prebundle,
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: true,
    hmr: { overlay: false },
  },
}))
