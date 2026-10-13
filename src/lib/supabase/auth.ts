import { supabase } from "./client";

export async function signUp(input: {
  email: string;
  password: string;
  name: string;
  company: string;
  segment: string;
  city: string;
  stateUf: string;
}) {
  const email = input.email.trim().toLowerCase();

  if (input.password.length < 6) {
    return { error: "A senha precisa ter pelo menos 6 caracteres." };
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: input.password,
    options: { data: { name: input.name.trim() } },
  });

  if (authError) return { error: authError.message };
  if (!authData.user) return { error: "Não foi possível criar a conta." };

  const { error: companyError } = await supabase.from("companies").insert({
    owner_id: authData.user.id,
    name: input.company.trim(),
    segment: input.segment,
    city: input.city.trim(),
    state: input.stateUf.trim().toUpperCase(),
  });

  if (companyError) {
    await supabase.auth.signOut();
    return { error: companyError.message };
  }

  return { error: null };
}

export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) return { error: "E-mail ou senha inválidos." };
  return { error: null };
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(
    email.trim().toLowerCase()
  );
  if (error) return { error: error.message };
  return { error: null };
}