import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    emptyOutDir: false, // Prevent deleting popup builds
    rollupOptions: {
      input: {
        content_gemini: resolve(import.meta.dirname, 'src/content/gemini.ts'),
        
      },
      output: {
        format: 'iife',
        dir: 'dist',
        entryFileNames: 'assets/[name].js',
        inlineDynamicImports: false,
      }
    }
  }
})
