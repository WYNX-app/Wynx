import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Separa o React e o roteamento básico
          'vendor-react': ['react', 'react-dom'],
          
          // Separa as bibliotecas de animação e ícones
          'vendor-ui': ['framer-motion', 'lucide-react'],
          
          // Separa o cliente do Supabase (que é pesado)
          'vendor-supabase': ['@supabase/supabase-js'],
          
          // Separa as bibliotecas de banco de dados local e estado
          'vendor-db': ['rxdb', 'dexie', 'zustand'],
          
          // Separa as bibliotecas de exportação (Excel, PDF)
          'vendor-export': ['exceljs', 'jspdf', 'jspdf-autotable', 'file-saver', 'papaparse']
        }
      }
    }
  },
});