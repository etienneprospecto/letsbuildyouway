import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Resend } from 'npm:resend@2.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY non configurée')
    }

    const resend = new Resend(resendApiKey)
    const { email, firstName, lastName, invitationUrl } = await req.json()

    console.log('📧 Envoi email à:', email)

    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: `${firstName}, rejoins ton coach sur notre plateforme !`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .button { 
                display: inline-block; 
                padding: 12px 30px; 
                background: #4F46E5; 
                color: white; 
                text-decoration: none; 
                border-radius: 5px; 
                margin: 20px 0;
              }
              .footer { margin-top: 30px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Bonjour ${firstName} ${lastName} !</h1>
              
              <p>Tu as été invité(e) à rejoindre ton coach sur notre plateforme.</p>
              
              <p>Clique sur le bouton ci-dessous pour créer ton compte et commencer ton suivi :</p>
              
              <a href="${invitationUrl}" class="button">
                Créer mon compte
              </a>
              
              <p>Ou copie ce lien dans ton navigateur :</p>
              <p style="background: #f5f5f5; padding: 10px; word-break: break-all;">
                ${invitationUrl}
              </p>
              
              <div class="footer">
                <p>Si tu n'as pas demandé cette invitation, tu peux ignorer cet email.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('❌ Erreur Resend:', error)
      return new Response(
        JSON.stringify({ error: error.message }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('✅ Email envoyé:', data)
    
    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Erreur:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
