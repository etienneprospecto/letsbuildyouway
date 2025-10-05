import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-11-20.acacia',
});

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
      },
    });
  }

  try {
    console.log('🔍 Function called with method:', req.method);
    
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    const { priceId, planName } = await req.json();
    console.log('📋 Received data:', { priceId, planName });

    if (!priceId || !planName) {
      return new Response(
        JSON.stringify({ error: 'priceId et planName requis' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          } 
        }
      );
    }

    // Créer la session Stripe Checkout
    console.log('🚀 Creating Stripe session...');
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `https://buildyourway.ovh/setup-account?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://buildyourway.ovh/pricing`,
      metadata: {
        plan_name: planName,
      },
      subscription_data: {
        metadata: {
          plan_name: planName,
        },
      },
      customer_creation: 'always',
      billing_address_collection: 'required',
    });

    console.log('✅ Session created:', session.id);
    return new Response(JSON.stringify({ sessionId: session.id }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur lors de la création de la session' }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        } 
      }
    );
  }
});
