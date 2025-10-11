import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      throw new Error('No Stripe signature found')
    }

    const body = await req.text()
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    if (!webhookSecret) {
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
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return new Response('Webhook signature verification failed', { 
        status: 400,
        headers: corsHeaders 
      })
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('PROJECT_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Store webhook event
    await supabase
      .from('stripe_webhooks')
      .insert({
        event_id: event.id,
        event_type: event.type,
        processed: false,
        data: event.data.object,
        created_at: new Date(event.created * 1000).toISOString()
      })
      .catch(err => console.log('Webhook already processed or table does not exist:', err.message))

    // Process the event
    await processWebhookEvent(event, supabase)

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})

async function processWebhookEvent(event: WebhookEvent, supabase: any) {
  const { type, data } = event
  const object = data.object

  console.log(`Processing webhook event: ${type}`)

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
        console.log(`Unhandled event type: ${type}`)
    }

    // Mark webhook as processed
    await supabase
      .from('stripe_webhooks')
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq('event_id', event.id)

  } catch (error) {
    console.error(`Error processing webhook event ${type}:`, error)
    
    // Mark webhook as failed
    await supabase
      .from('stripe_webhooks')
      .update({ 
        processed: false, 
        error: error.message,
        processed_at: new Date().toISOString()
      })
      .eq('event_id', event.id)
  }
}

async function handleInvoicePaymentSucceeded(invoice: any, supabase: any) {
  console.log('Processing invoice payment succeeded:', invoice.id)
  
  try {
    const customerId = invoice.customer
    
    // Mettre à jour le statut de l'abonnement
    const { error } = await supabase
      .from('profiles')
      .update({ 
        subscription_status: 'active',
        subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 jours
      })
      .eq('stripe_customer_id', customerId)
    
    if (error) {
      console.error('Error updating subscription status:', error)
    } else {
      console.log('Subscription status updated to active')
    }
  } catch (error) {
    console.error('Error in handleInvoicePaymentSucceeded:', error)
  }
}

async function handleInvoicePaymentFailed(invoice: any, supabase: any) {
  console.log('Processing invoice payment failed:', invoice.id)
  
  try {
    const customerId = invoice.customer
    
    // Mettre à jour le statut de l'abonnement
    const { error } = await supabase
      .from('profiles')
      .update({ 
        subscription_status: 'past_due',
        subscription_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 jours de grâce
      })
      .eq('stripe_customer_id', customerId)
    
    if (error) {
      console.error('Error updating subscription status:', error)
    } else {
      console.log('Subscription status updated to past_due')
    }
  } catch (error) {
    console.error('Error in handleInvoicePaymentFailed:', error)
  }
}

async function handleSubscriptionCreated(subscription: any, supabase: any) {
  console.log('Processing subscription created:', subscription.id)
  
  try {
    const customerId = subscription.customer
    const priceId = subscription.items.data[0]?.price?.id
    
    if (!priceId) {
      console.error('No price ID found in subscription')
      return
    }
    
    const plan = getPlanFromPriceId(priceId)
    const limits = getPlanLimits(plan)
    
    // Mettre à jour le profil avec les détails de l'abonnement
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_plan: plan,
        stripe_subscription_id: subscription.id,
        subscription_status: subscription.status,
        subscription_start_date: new Date(subscription.created * 1000).toISOString(),
        subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
        plan_limits: limits
      })
      .eq('stripe_customer_id', customerId)
    
    if (error) {
      console.error('Error updating subscription:', error)
    } else {
      console.log('Subscription created and profile updated')
    }
  } catch (error) {
    console.error('Error in handleSubscriptionCreated:', error)
  }
}

async function handleSubscriptionUpdated(subscription: any, supabase: any) {
  console.log('Processing subscription updated:', subscription.id)
  
  try {
    const customerId = subscription.customer
    const priceId = subscription.items.data[0]?.price?.id
    
    if (!priceId) {
      console.error('No price ID found in subscription')
      return
    }
    
    const plan = getPlanFromPriceId(priceId)
    const limits = getPlanLimits(plan)
    
    // Mettre à jour le profil avec les détails de l'abonnement
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_plan: plan,
        subscription_status: subscription.status,
        subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
        plan_limits: limits
      })
      .eq('stripe_subscription_id', subscription.id)
    
    if (error) {
      console.error('Error updating subscription:', error)
    } else {
      console.log('Subscription updated and profile updated')
    }
  } catch (error) {
    console.error('Error in handleSubscriptionUpdated:', error)
  }
}

async function handleSubscriptionDeleted(subscription: any, supabase: any) {
  console.log('Processing subscription deleted:', subscription.id)
  
  try {
    // Marquer l'abonnement comme annulé
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'canceled',
        subscription_end_date: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id)
    
    if (error) {
      console.error('Error updating subscription:', error)
    } else {
      console.log('Subscription marked as canceled')
    }
  } catch (error) {
    console.error('Error in handleSubscriptionDeleted:', error)
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
      const baseUrl = Deno.env.get('BASE_URL') || 'https://byw.app'
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
    console.error('Error in handleCheckoutSessionCompleted:', error)
  }
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
      timeline_weeks: 1,
      max_workouts: 15,
      max_exercises: 30,
      features: ['basic_dashboard', 'basic_messaging', 'simple_calendar', 'basic_client_dashboard', 'basic_settings_notifications']
    },
    transformationnel: {
      max_clients: 50,
      timeline_weeks: 4,
      max_workouts: 50,
      max_exercises: 100,
      features: ['advanced_dashboard', 'voice_messaging', 'nutrition_tracking', 'advanced_feedbacks', 'progress_photos_history', 'trophies', 'shared_resources', 'payment_retries']
    },
    elite: {
      max_clients: 100,
      timeline_weeks: 52,
      max_workouts: -1, // illimité
      max_exercises: -1,
      features: ['ai_nutrition', 'financial_dashboard', 'advanced_automation', 'full_calendar_integration', 'premium_resources_exports', 'priority_support', 'advanced_gamification', 'theme_customization']
    }
  }
  return limits[plan] || limits.warm_up
}

// ====================================
// FONCTION : Générer mot de passe sécurisé
// ====================================
function generateSecurePassword(): string {
  const length = 12
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*'
  
  const allChars = uppercase + lowercase + numbers + symbols
  let password = ''
  
  // Assurer au moins 1 de chaque type
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]
  
  // Compléter avec des caractères aléatoires
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }
  
  // Mélanger le mot de passe
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

async function updateUserSubscription(userId: string, session: any, supabase: any) {
  try {
    const plan = getPlanFromPriceId(session.line_items?.data[0]?.price?.id)
    const limits = getPlanLimits(plan)
    
    const { error } = await supabase
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
    
    if (error) {
      console.error('Error updating user subscription:', error)
    } else {
      console.log('User subscription updated successfully')
    }
  } catch (error) {
    console.error('Error in updateUserSubscription:', error)
  }
}