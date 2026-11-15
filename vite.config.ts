import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { beasties } from 'vite-plugin-beasties'; // <-- Import do Beasties
import path from "path";

export default defineConfig({
  base: './',
  plugins: [
    react(), 
    tailwindcss(),
    beasties() // <-- Plugin adicionado aqui
  ],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  build: {
    sourcemap: 'hidden',
    target: 'es2020', 
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-ui': ['framer-motion', 'lucide-react'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-db': ['rxdb', 'dexie', 'zustand'],
        }
      }
    }
  },
});