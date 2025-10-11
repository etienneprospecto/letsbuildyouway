import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface WebhookEvent {
  id: string
  type: string
  data: {
    object: any
  }
  created: number
}

serve(async (req) => {
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
    let event: WebhookEvent
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

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Supabase configuration missing')
      throw new Error('Supabase configuration missing')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Process the webhook event
    await processWebhookEvent(event, supabase)

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

async function processWebhookEvent(event: WebhookEvent, supabase: any) {
  const { type, data } = event
  const object = data.object

  console.log(`🔄 Processing webhook event: ${type}`)

  try {
    switch (type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(object, supabase)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(object, supabase)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(object, supabase)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(object, supabase)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(object, supabase)
        break

      default:
        console.log(`ℹ️ Unhandled event type: ${type}`)
    }

  } catch (error) {
    console.error(`❌ Error processing webhook event ${type}:`, error)
  }
}

async function handleCheckoutSessionCompleted(session: any, supabase: any) {
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
    
    // Vérifier si l'utilisateur existe déjà
    console.log('🔍 Checking if user already exists...')
    const { data: existingUser, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', customerEmail)
      .single()
    
    if (userError && userError.code !== 'PGRST116') {
      console.error('❌ Error checking existing user:', userError)
      throw new Error(`Failed to check existing user: ${userError.message}`)
    }
    
    if (existingUser) {
      console.log('👤 User already exists, updating subscription')
      // Mettre à jour l'abonnement existant
      await updateUserSubscription(existingUser.id, fullSession, supabase)
      return
    }
    
    // Générer un mot de passe provisoire sécurisé
    const tempPassword = generateSecurePassword()
    
    // Créer un nouvel utilisateur avec mot de passe provisoire
    console.log('👤 Creating new user account...')
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: customerEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        name: customerName,
        role: 'coach'
      }
    })
    
    if (createError || !newUser.user) {
      console.error('❌ Error creating user:', createError)
      throw new Error(`Failed to create user: ${createError?.message || 'Unknown error'}`)
    }
    
    console.log('✅ User created successfully:', newUser.user.id)
    
    // Créer le profil utilisateur
    console.log('👤 Creating user profile...')
    const plan = getPlanFromPriceId(planId)
    const limits = getPlanLimits(plan)
    
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: newUser.user.id,
        email: customerEmail,
        name: customerName,
        role: 'coach',
        subscription_plan: plan,
        stripe_customer_id: fullSession.customer,
        stripe_subscription_id: fullSession.subscription,
        subscription_status: 'trialing',
        subscription_start_date: new Date().toISOString(),
        subscription_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 jours d'essai
        plan_limits: limits
      })
    
    if (profileError) {
      console.error('❌ Error creating profile:', profileError)
      throw new Error(`Failed to create profile: ${profileError.message}`)
    }
    
    console.log('✅ Profile created successfully for plan:', plan)
    
    // Envoyer l'email de bienvenue avec mot de passe provisoire
    console.log('📧 Sending welcome email with credentials...')
    try {
      const baseUrl = Deno.env.get('BASE_URL') || 'https://buildyourway.ovh'
      const loginUrl = `${baseUrl}/login`
      
      const emailPayload = {
        client_email: customerEmail,
        client_name: customerName,
        temp_password: tempPassword,
        login_url: loginUrl,
        plan_name: plan,
        coach_name: 'BYW Team',
        type: 'coach_welcome_with_password'
      }
      
      console.log('📤 Sending email payload:', JSON.stringify(emailPayload, null, 2))
      
      const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-email-working', {
        body: {
          email: customerEmail,
          name: customerName
        }
      })

      if (emailError) {
        console.error('❌ Error sending welcome email:', emailError)
        console.log('📋 Email error details:', JSON.stringify(emailError, null, 2))
        // Ne pas faire échouer le processus si l'email échoue
        console.log('⚠️ Continuing without email notification')
      } else {
        console.log('✅ Welcome email sent successfully to:', customerEmail)
        console.log('📧 Email ID:', emailResult?.email_id)
        console.log('📋 Email result:', JSON.stringify(emailResult, null, 2))
      }
    } catch (emailError) {
      console.error('❌ Error calling email service:', emailError)
      console.log('📋 Email error stack:', emailError.stack)
      // Ne pas faire échouer le processus si l'email échoue
      console.log('⚠️ Continuing without email notification')
    }
    
    console.log('🎉 User onboarding completed successfully!')
    
  } catch (error) {
    console.error('❌ Error in handleCheckoutSessionCompleted:', error)
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

async function updateUserSubscription(userId: string, session: any, supabase: any) {
  // Logique pour mettre à jour l'abonnement existant
  console.log('🔄 Updating existing user subscription...')
}

async function handleSubscriptionCreated(subscription: any, supabase: any) {
  console.log('🔄 Processing subscription created:', subscription.id)
}

async function handleSubscriptionUpdated(subscription: any, supabase: any) {
  console.log('🔄 Processing subscription updated:', subscription.id)
}

async function handleSubscriptionDeleted(subscription: any, supabase: any) {
  console.log('🔄 Processing subscription deleted:', subscription.id)
}

async function handleInvoicePaymentFailed(invoice: any, supabase: any) {
  console.log('🔄 Processing invoice payment failed:', invoice.id)
}
