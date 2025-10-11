import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    console.log('📧 Création invitation Supabase Auth pour:', email)

    // Créer le client Supabase avec service role
    // Utiliser les variables d'environnement correctes
    const supabaseUrl = Deno.env.get('SUPABASE_URL')! // Automatiquement injectée par Supabase
    const supabaseServiceKey = Deno.env.get('SERVICE_ROLE_KEY')! // Variable personnalisée
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Utiliser Supabase Auth pour envoyer l'invitation
    const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(
      email,
      {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: 'client',
          coach_id: coachId,
          client_data: clientData
        },
        redirectTo: 'http://buildyourway.fr/app/dashboard'
      }
    )

    if (authError) {
      console.error('❌ Erreur Supabase Auth:', authError)
      return new Response(
        JSON.stringify({ error: authError.message }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('✅ Invitation Supabase Auth envoyée:', authData)
    
    return new Response(
      JSON.stringify({ success: true, data: authData }),
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
