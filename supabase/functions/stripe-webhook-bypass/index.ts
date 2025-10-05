import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// BYPASS: Cette fonction ne nécessite PAS d'authentification Supabase
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔍 Webhook received:', req.method, req.url)
    
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      console.error('❌ No Stripe signature found')
      throw new Error('No Stripe signature found')
    }

    const body = await req.text()
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    if (!webhookSecret) {
      console.error('❌ Stripe webhook secret not configured')
      throw new Error('Stripe webhook secret not configured')
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2024-06-20',
    })

    // Verify webhook signature
    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      console.log('✅ Webhook signature verified for event:', event.type)
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err)
      return new Response('Webhook signature verification failed', { 
        status: 400,
        headers: corsHeaders 
      })
    }

    // Process the webhook event
    await processWebhookEvent(event)

    return new Response(JSON.stringify({ received: true, event: event.type }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Webhook error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function processWebhookEvent(event: any) {
  const { type, data } = event
  const object = data.object

  console.log(`🔄 Processing webhook event: ${type}`)

  try {
    switch (type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(object)
        break

      default:
        console.log(`ℹ️ Unhandled event type: ${type}`)
    }

  } catch (error) {
    console.error(`❌ Error processing webhook event ${type}:`, error)
  }
}

async function handleCheckoutSessionCompleted(session: any) {
  console.log('🛒 Processing checkout session completed:', session.id)
  
  try {
    // Récupérer les détails de la session Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2024-06-20',
    })
    
    console.log('📋 Retrieving full session details...')
    const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items', 'customer', 'subscription']
    })
    
    const customerEmail = fullSession.customer_details?.email
    const customerName = fullSession.customer_details?.name || 'Coach'
    const planId = fullSession.line_items?.data[0]?.price?.id
    
    console.log('👤 Customer details:', { email: customerEmail, name: customerName, planId })
    
    if (!customerEmail) {
      console.error('❌ No customer email found in checkout session')
      throw new Error('Customer email is required for account creation')
    }
    
    // Appeler directement l'API Supabase REST (sans client SDK)
    await createCoachAccount(customerEmail, customerName, planId, fullSession)
    
    console.log('🎉 User onboarding completed successfully!')
    
  } catch (error) {
    console.error('❌ Error in handleCheckoutSessionCompleted:', error)
  }
}

async function createCoachAccount(email: string, name: string, planId: string, session: any) {
  console.log('👤 Creating coach account via REST API...')
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase configuration missing')
  }

  // Générer un mot de passe provisoire sécurisé
  const tempPassword = generateSecurePassword()
  
  // 1. Créer l'utilisateur via l'API REST Supabase
  console.log('👤 Creating user via REST API...')
  const createUserResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Content-Type': 'application/json',
      'apikey': supabaseServiceKey
    },
    body: JSON.stringify({
      email: email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        name: name,
        role: 'coach'
      }
    })
  })

  if (!createUserResponse.ok) {
    const errorData = await createUserResponse.text()
    console.error('❌ Error creating user:', errorData)
    throw new Error(`Failed to create user: ${errorData}`)
  }

  const userData = await createUserResponse.json()
  console.log('✅ User created successfully:', userData.user.id)
  
  // 2. Créer le profil utilisateur
  console.log('👤 Creating user profile...')
  const plan = getPlanFromPriceId(planId)
  const limits = getPlanLimits(plan)
  
  const profileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Content-Type': 'application/json',
      'apikey': supabaseServiceKey
    },
    body: JSON.stringify({
      id: userData.user.id,
      email: email,
      name: name,
      role: 'coach',
      subscription_plan: plan,
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription,
      subscription_status: 'trialing',
      subscription_start_date: new Date().toISOString(),
      subscription_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      plan_limits: limits
    })
  })
  
  if (!profileResponse.ok) {
    const errorData = await profileResponse.text()
    console.error('❌ Error creating profile:', errorData)
    throw new Error(`Failed to create profile: ${errorData}`)
  }
  
  console.log('✅ Profile created successfully for plan:', plan)
  
  // 3. Envoyer l'email de bienvenue
  console.log('📧 Sending welcome email...')
  try {
    const baseUrl = Deno.env.get('BASE_URL') || 'https://buildyourway.ovh'
    const loginUrl = `${baseUrl}/login`
    
    const emailPayload = {
      client_email: email,
      client_name: name,
      temp_password: tempPassword,
      login_url: loginUrl,
      plan_name: plan,
      coach_name: 'BYW Team',
      type: 'coach_welcome_with_password'
    }
    
    console.log('📤 Sending email payload:', JSON.stringify(emailPayload, null, 2))
    
    // Appeler la fonction d'email via REST API
    const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-email-reliable`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailPayload)
    })

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text()
      console.error('❌ Error sending welcome email:', errorData)
      console.log('⚠️ Continuing without email notification')
    } else {
      const emailResult = await emailResponse.json()
      console.log('✅ Welcome email sent successfully to:', email)
      console.log('📧 Email result:', JSON.stringify(emailResult, null, 2))
    }
  } catch (emailError) {
    console.error('❌ Error calling email service:', emailError)
    console.log('⚠️ Continuing without email notification')
  }
}

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
      max_workouts: -1, // illimité
      max_exercises: -1, // illimité
      timeline_weeks: 52,
      features: ['premium_dashboard', 'client_management', 'advanced_messaging', 'calendar', 'nutrition_ai', 'gamification']
    }
  }
  return limits[plan] || limits.warm_up
}
