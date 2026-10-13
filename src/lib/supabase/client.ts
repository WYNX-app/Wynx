import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Faltam VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.local. " +
    "Reinicie o Vite após criar o arquivo."
  );
}

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Tipos auxiliares para uso no restante do app
export type { Session, User } from "@supabase/supabase-js";