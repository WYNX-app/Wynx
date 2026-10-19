// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  const { productName, currentQty, minQty, companyName, userEmail } = await req.json()

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'WYNX <onboarding@resend.dev>',
      to: userEmail, // <-- Já voltamos para o dinâmico!
      subject: `⚠️ Alerta de Estoque: ${productName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #F9A8D4; border-radius: 12px;">
          <h2 style="color: #1A3A6B;">WYNX - Alerta de Estoque</h2>
          <p>Olá, equipe <strong>${companyName}</strong>!</p>
          <p>O produto <strong>${productName}</strong> atingiu o nível mínimo de estoque.</p>
          <ul>
            <li><strong>Estoque atual:</strong> ${currentQty} unidades</li>
            <li><strong>Estoque mínimo:</strong> ${minQty} unidades</li>
          </ul>
          <p>Recomendamos fazer uma reposição o quanto antes.</p>
          <a href="https://wynx.vercel.app" style="background-color: #F9A8D4; color: #0A0514; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin-top: 20px;">Acessar WYNX</a>
          <p style="color: #6B7280; font-size: 12px; margin-top: 30px;">Este é um e-mail automático. Não responda.</p>
        </div>
      `,
    }),
  })

  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'Falha ao enviar e-mail' }), { status: 500 })
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 })
})