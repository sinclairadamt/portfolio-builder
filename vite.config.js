import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// Must match the GitHub repo name this app is deployed under, e.g. https://<user>.github.io/portfolio-builder/
// https://vite.dev/config/
export default defineConfig({
  base: '/portfolio-builder/',
  plugins: [svelte()],
})
