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
    const { email, name, temp_password, plan_name } = await req.json()

    console.log('📧 Envoi email coach à:', email)

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
        subject: `🎉 Bienvenue sur BYW, ${name} ! Vos accès sont prêts`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb;">🎉 Bienvenue ${name} !</h1>
            <p>Félicitations pour votre abonnement ! Votre compte coach BYW est prêt.</p>
            <p>Votre pack ${plan_name?.replace('_', ' ').toUpperCase()} est activé.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3>🔐 Vos identifiants de connexion :</h3>
              <p><strong>Email :</strong> ${email}</p>
              <p><strong>Mot de passe provisoire :</strong></p>
              <div style="background: #fff; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 18px; font-weight: bold; color: #1f2937; letter-spacing: 1px;">${temp_password}</div>
            </div>
            
            <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p><strong>⚠️ Important :</strong> Lors de votre première connexion, vous devrez changer ce mot de passe provisoire pour en créer un personnel et sécurisé.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://byw.app/login" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Se connecter maintenant</a>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 6px; margin: 30px 0;">
              <h3>✨ Prochaines étapes :</h3>
              <ul>
                <li>Connectez-vous avec vos identifiants</li>
                <li>Changez votre mot de passe</li>
                <li>Complétez votre profil coach</li>
                <li>Invitez vos premiers clients</li>
                <li>Créez vos programmes d'entraînement</li>
              </ul>
            </div>
            
            <p>Si vous avez des questions, notre équipe support est là pour vous aider !</p>
            
            <div style="margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
              <p><strong>BYW - Build Your Way</strong></p>
              <p>Votre plateforme de coaching personnalisé</p>
              <p>Si vous n'avez pas créé de compte, ignorez cet email.</p>
            </div>
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

    console.log('✅ Email coach envoyé:', data)

    return new Response(JSON.stringify({
      success: true,
      message: 'Coach email sent successfully',
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
