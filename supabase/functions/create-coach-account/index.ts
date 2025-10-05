import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': '*',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'true',
}

serve(async (req) => {
  console.log('🚀 Function called with method:', req.method)
  console.log('🌐 Headers:', Object.fromEntries(req.headers.entries()))
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight request handled')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔍 Create coach account called')

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { email, name, planId, session } = await req.json()
    console.log('📋 Creating coach:', { email, name, planId })

    if (!email || !name || !planId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Initialize Supabase with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing')
    }

        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        })

    // Générer un mot de passe provisoire
    const tempPassword = generateSecurePassword()
    console.log('🔑 Generated temp password for:', email)

    // Vérifier si l'utilisateur existe déjà via la table profiles
    console.log('🔍 Checking if user already exists...')
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()
    
    let userId: string
    
    if (existingProfile && !profileError) {
      console.log('👤 User already exists, updating profile...')
      userId = existingProfile.id
    } else {
      // Créer l'utilisateur
      console.log('👤 Creating user account...')
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          name: name,
          role: 'coach'
        }
      })

      if (createError || !newUser.user) {
        console.error('❌ Error creating user:', createError)
        throw new Error(`Failed to create user: ${createError?.message || 'Unknown error'}`)
      }

      console.log('✅ User created successfully:', newUser.user.id)
      userId = newUser.user.id
    }

    // Créer le profil
    console.log('👤 Creating user profile...')
    const plan = getPlanFromPriceId(planId)
    const limits = getPlanLimits(plan)

        // Vérifier si le profil existe déjà
        const { data: existingProfile, error: existingProfileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (existingProfile && !existingProfileError) {
          console.log('👤 Profile already exists, updating subscription...')
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              subscription_plan: plan,
              stripe_customer_id: session.customer,
              stripe_subscription_id: session.subscription,
              subscription_status: 'trialing',
              subscription_start_date: new Date().toISOString(),
              subscription_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
              plan_limits: limits
            })
            .eq('id', userId)

          if (updateError) {
            console.error('❌ Error updating profile:', updateError)
            throw new Error(`Failed to update profile: ${updateError.message}`)
          }
        } else {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
        email: email,
        first_name: name.split(' ')[0] || name,
        last_name: name.split(' ').slice(1).join(' ') || '',
        role: 'coach',
        subscription_plan: plan,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        subscription_status: 'trialing',
        subscription_start_date: new Date().toISOString(),
        subscription_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        plan_limits: limits
      })

      if (profileError) {
        console.error('❌ Error creating profile:', profileError)
        throw new Error(`Failed to create profile: ${profileError.message}`)
      }
    }

    console.log('✅ Profile created successfully for plan:', plan)

    // Envoyer l'email de bienvenue
    console.log('📧 Sending welcome email...')
    try {
      const baseUrl = Deno.env.get('BASE_URL') || 'https://buildyourway.ovh'
      const loginUrl = `${baseUrl}/login`

      const { error: emailError } = await supabase.functions.invoke('send-email-reliable', {
        body: {
          client_email: email,
          client_name: name,
          temp_password: tempPassword,
          login_url: loginUrl,
          plan_name: plan,
          coach_name: 'BYW Team',
          type: 'coach_welcome_with_password'
        }
      })

      if (emailError) {
        console.error('❌ Error sending welcome email:', emailError)
        console.log('⚠️ Continuing without email notification')
      } else {
        console.log('✅ Welcome email sent successfully to:', email)
      }
    } catch (emailError) {
      console.error('❌ Error calling email service:', emailError)
      console.log('⚠️ Continuing without email notification')
    }

    return new Response(JSON.stringify({ 
      success: true, 
      user: {
        id: newUser.user.id,
        email: email,
        tempPassword: tempPassword
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    console.error('❌ Error creating coach account:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

function generateSecurePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

function getPlanFromPriceId(priceId: string): string {
  const planMapping: { [key: string]: string } = {
    'price_1SCJ9WPyYNBRhOhApONh7U6A': 'warm_up',
    'price_1SCJEXPyYNBRhOhAb64UZYVo': 'transformationnel',
    'price_1SCJEoPyYNBRhOhA0tN68xOU': 'elite'
  }
  return planMapping[priceId] || 'warm_up'
}

function getPlanLimits(plan: string): any {
  const limits = {
    warm_up: {
      max_clients: 15,
      max_workouts: 15,
      max_exercises: 30,
      timeline_weeks: 1,
      features: ['basic_dashboard', 'client_management', 'messaging', 'calendar']
    },
    transformationnel: {
      max_clients: 50,
      max_workouts: 50,
      max_exercises: 100,
      timeline_weeks: 4,
      features: ['advanced_dashboard', 'client_management', 'messaging', 'calendar', 'nutrition_tracking']
    },
    elite: {
      max_clients: 100,
      max_workouts: -1,
      max_exercises: -1,
      timeline_weeks: 52,
      features: ['premium_dashboard', 'client_management', 'advanced_messaging', 'calendar', 'nutrition_ai', 'gamification']
    }
  }
  return limits[plan] || limits.warm_up
}
