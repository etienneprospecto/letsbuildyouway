import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔍 Get Stripe session called')

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { sessionId } = await req.json()
    console.log('📋 Session ID:', sessionId)

    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Session ID required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2024-06-20',
    })

    console.log('🚀 Retrieving Stripe session...')
    
    // Récupérer la session avec tous les détails
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer', 'subscription']
    })

    console.log('✅ Session retrieved:', session.id)
    console.log('👤 Customer email:', session.customer_details?.email)

    return new Response(JSON.stringify({ 
      success: true, 
      session: {
        id: session.id,
        customer_details: session.customer_details,
        line_items: session.line_items,
        customer: session.customer,
        subscription: session.subscription,
        payment_status: session.payment_status
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    console.error('❌ Error retrieving session:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
