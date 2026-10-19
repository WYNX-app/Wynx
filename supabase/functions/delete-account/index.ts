// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Trata requisição CORS (preflight)
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // Cliente admin com Service Role (pode deletar usuários)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Pega o token do usuário que fez a requisição
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    // Verifica quem é o usuário
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) throw new Error('Não autorizado')

    // 1. Verifica se ele é dono de alguma empresa
    const { data: companies } = await supabaseAdmin
      .from('companies')
      .select('id')
      .eq('owner_id', user.id)

    // 2. Se for dono, apaga a empresa inteira (o cascade cuidará de produtos, membros, etc)
    if (companies && companies.length > 0) {
      for (const company of companies) {
        await supabaseAdmin.from('companies').delete().eq('id', company.id)
      }
    }

    // 3. Deleta o usuário do Auth (isso também apaga o profile via cascade)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
    if (deleteError) throw deleteError

    return new Response(JSON.stringify({ message: 'Conta excluída com sucesso' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})