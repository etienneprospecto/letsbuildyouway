// API pour créer une session Stripe Checkout
import Stripe from 'stripe';

const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(req: Request) {
  try {
    const { priceId, planName } = await req.json();

    if (!priceId || !planName) {
      return new Response(
        JSON.stringify({ error: 'priceId et planName requis' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Créer la session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${import.meta.env.VITE_APP_URL}/setup-account?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${import.meta.env.VITE_APP_URL}/pricing`,
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

    return new Response(JSON.stringify({ sessionId: session.id }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur lors de la création de la session' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}