import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, name } = await req.json()
    
    console.log('📧 Envoi email à:', email)
    
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ 
        error: 'RESEND_API_KEY not configured' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'no-reply@buildyourway.ovh',
        to: email,
        subject: `${name}, rejoins ton coach sur BYW !`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb;">Bonjour ${name} !</h1>
            <p>Ton coach t'a invité à rejoindre BYW, la plateforme de coaching personnalisé.</p>
            <p>Clique sur le bouton ci-dessous pour créer ton compte :</p>
            <a href="https://byw.app/accept-invitation?token=test123" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
              Créer mon compte
            </a>
            <p><small>Ce lien expire dans 7 jours.</small></p>
            <p>Si tu as des questions, contacte ton coach.</p>
          </div>
        `
      })
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      return new Response(JSON.stringify({ 
        error: `Resend error: ${data.message || 'Unknown error'}` 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    console.log('✅ Email envoyé:', data)
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Email sent successfully',
      data 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('❌ Erreur:', error)
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})