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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Log webhook event
    await supabase
      .from('stripe_webhooks')
      .insert({
        event_id: event.id,
        event_type: event.type,
        processed: false,
        data: event.data.object,
        created_at: new Date(event.created * 1000).toISOString()
      })

    // Process webhook event
    await processWebhookEvent(event, supabase)

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

async function processWebhookEvent(event: WebhookEvent, supabase: any) {
  const { type, data } = event
  const object = data.object

  console.log(`Processing webhook event: ${type}`)

  try {
    switch (type) {
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(object, supabase)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(object, supabase)
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

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(object, supabase)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(object, supabase)
        break

      case 'customer.created':
        await handleCustomerCreated(object, supabase)
        break

      case 'customer.updated':
        await handleCustomerUpdated(object, supabase)
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

  // Find the corresponding invoice in our database
  const { data: dbInvoice, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('stripe_invoice_id', invoice.id)
    .single()

  if (error || !dbInvoice) {
    console.error('Invoice not found in database:', invoice.id)
    return
  }

  // Update invoice status
  await supabase
    .from('invoices')
    .update({
      status: 'paid',
      amount_paid: invoice.amount_paid / 100, // Convert from cents
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', dbInvoice.id)

  // Create payment record
  await supabase
    .from('payments')
    .insert({
      invoice_id: dbInvoice.id,
      stripe_payment_intent_id: invoice.payment_intent,
      amount: invoice.amount_paid / 100,
      currency: invoice.currency,
      payment_method: 'card', // Default, could be determined from payment intent
      status: 'succeeded',
      processed_at: new Date().toISOString(),
      metadata: {
        stripe_invoice_id: invoice.id,
        stripe_payment_intent_id: invoice.payment_intent
      }
    })

  console.log('Invoice payment processed successfully')
}

async function handleInvoicePaymentFailed(invoice: any, supabase: any) {
  console.log('Processing invoice payment failed:', invoice.id)

  // Find the corresponding invoice in our database
  const { data: dbInvoice, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('stripe_invoice_id', invoice.id)
    .single()

  if (error || !dbInvoice) {
    console.error('Invoice not found in database:', invoice.id)
    return
  }

  // Update invoice status to overdue
  await supabase
    .from('invoices')
    .update({
      status: 'overdue',
      updated_at: new Date().toISOString()
    })
    .eq('id', dbInvoice.id)

  console.log('Invoice marked as overdue due to payment failure')
}

async function handleSubscriptionCreated(subscription: any, supabase: any) {
  console.log('Processing subscription created:', subscription.id)

  // Find the corresponding subscription in our database
  const { data: dbSubscription, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('stripe_subscription_id', subscription.id)
    .single()

  if (error || !dbSubscription) {
    console.error('Subscription not found in database:', subscription.id)
    return
  }

  // Update subscription status
  await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', dbSubscription.id)

  console.log('Subscription created successfully')
}

async function handleSubscriptionUpdated(subscription: any, supabase: any) {
  console.log('Processing subscription updated:', subscription.id)

  // Find the corresponding subscription in our database
  const { data: dbSubscription, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('stripe_subscription_id', subscription.id)
    .single()

  if (error || !dbSubscription) {
    console.error('Subscription not found in database:', subscription.id)
    return
  }

  // Update subscription status and dates
  await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', dbSubscription.id)

  console.log('Subscription updated successfully')
}

async function handleSubscriptionDeleted(subscription: any, supabase: any) {
  console.log('Processing subscription deleted:', subscription.id)

  // Find the corresponding subscription in our database
  const { data: dbSubscription, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('stripe_subscription_id', subscription.id)
    .single()

  if (error || !dbSubscription) {
    console.error('Subscription not found in database:', subscription.id)
    return
  }

  // Update subscription status to cancelled
  await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('id', dbSubscription.id)

  console.log('Subscription cancelled successfully')
}

async function handlePaymentIntentSucceeded(paymentIntent: any, supabase: any) {
  console.log('Processing payment intent succeeded:', paymentIntent.id)

  // Find the corresponding invoice in our database
  const { data: dbInvoice, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('stripe_invoice_id', paymentIntent.invoice)
    .single()

  if (error || !dbInvoice) {
    console.error('Invoice not found in database for payment intent:', paymentIntent.id)
    return
  }

  // Create payment record
  await supabase
    .from('payments')
    .insert({
      invoice_id: dbInvoice.id,
      stripe_payment_intent_id: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      payment_method: paymentIntent.payment_method?.type || 'card',
      status: 'succeeded',
      processed_at: new Date().toISOString(),
      metadata: {
        stripe_payment_intent_id: paymentIntent.id,
        payment_method_details: paymentIntent.payment_method
      }
    })

  console.log('Payment intent processed successfully')
}

async function handlePaymentIntentFailed(paymentIntent: any, supabase: any) {
  console.log('Processing payment intent failed:', paymentIntent.id)

  // Find the corresponding invoice in our database
  const { data: dbInvoice, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('stripe_invoice_id', paymentIntent.invoice)
    .single()

  if (error || !dbInvoice) {
    console.error('Invoice not found in database for payment intent:', paymentIntent.id)
    return
  }

  // Create payment record with failed status
  await supabase
    .from('payments')
    .insert({
      invoice_id: dbInvoice.id,
      stripe_payment_intent_id: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      payment_method: paymentIntent.payment_method?.type || 'card',
      status: 'failed',
      failure_reason: paymentIntent.last_payment_error?.message || 'Payment failed',
      processed_at: new Date().toISOString(),
      metadata: {
        stripe_payment_intent_id: paymentIntent.id,
        payment_method_details: paymentIntent.payment_method,
        failure_details: paymentIntent.last_payment_error
      }
    })

  console.log('Payment intent failure processed')
}

async function handleCustomerCreated(customer: any, supabase: any) {
  console.log('Processing customer created:', customer.id)
  // Customer creation is typically handled by the application, not webhooks
  // This is here for completeness
}

async function handleCustomerUpdated(customer: any, supabase: any) {
  console.log('Processing customer updated:', customer.id)
  // Customer updates are typically handled by the application, not webhooks
  // This is here for completeness
}