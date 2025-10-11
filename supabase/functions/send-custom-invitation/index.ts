import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
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
    const { email, firstName, lastName, coachId, clientData } = await req.json()

    console.log('📧 Envoi invitation personnalisée pour:', email)

    // Créer le client Supabase avec service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Créer l'utilisateur directement dans Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      email_confirm: true, // Confirmer l'email automatiquement
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        role: 'client',
        coach_id: coachId,
        client_data: clientData
      }
    })

    if (authError) {
      console.error('❌ Erreur création utilisateur:', authError)
      return new Response(
        JSON.stringify({ error: authError.message }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('✅ Utilisateur créé:', authData.user.id)
    console.log('ℹ️ Le profil client sera créé automatiquement par le trigger Supabase')

    // Envoyer l'email personnalisé avec Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY non configurée')
    }

    const resend = new Resend(resendApiKey)
    
    // Générer un token d'invitation personnalisé
    const invitationToken = crypto.randomUUID()
    const invitationUrl = `http://buildyourway.fr/app/dashboard?token=${invitationToken}&type=invite&email=${email}`

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: `${firstName}, rejoins ton coach sur notre plateforme !`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Invitation</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Bienvenue sur BYW !</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Votre coach vous invite à rejoindre la plateforme</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e1e5e9; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Salut ${firstName} ! 👋</h2>
            
            <p style="color: #666; line-height: 1.6; font-size: 16px;">
              Votre coach vous a invité à rejoindre <strong>Build Your Way</strong>, la plateforme qui va révolutionner votre parcours fitness !
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">🎯 Ce qui vous attend :</h3>
              <ul style="color: #666; margin: 10px 0;">
                <li>Programmes d'entraînement personnalisés</li>
                <li>Suivi nutritionnel adapté</li>
                <li>Communication directe avec votre coach</li>
                <li>Progression en temps réel</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${invitationUrl}" 
                 style="background: linear-gradient(135deg, #ff6b6b, #ffa500); 
                        color: white; 
                        text-decoration: none; 
                        padding: 15px 30px; 
                        border-radius: 25px; 
                        font-weight: bold; 
                        font-size: 16px;
                        display: inline-block;
                        box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);">
                🚀 Rejoindre la plateforme
              </a>
            </div>
            
            <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
              Si le bouton ne fonctionne pas, copiez ce lien :<br>
              <a href="${invitationUrl}" style="color: #667eea; word-break: break-all;">${invitationUrl}</a>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>Cet email a été envoyé par Build Your Way</p>
          </div>
        </body>
        </html>
      `,
    })

    if (emailError) {
      console.error('❌ Erreur envoi email:', emailError)
      return new Response(
        JSON.stringify({ error: emailError.message }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('✅ Invitation personnalisée envoyée:', emailData)
    
    return new Response(
      JSON.stringify({ success: true, data: { user: authData.user, email: emailData } }),
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
