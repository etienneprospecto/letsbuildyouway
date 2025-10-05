// ========================================
// API CRÉATION SESSION STRIPE CHECKOUT
// ========================================
// Fichier: app/api/create-checkout-session/route.ts
// Description: Créer une session Stripe Checkout pour l'inscription coach

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(req: NextRequest) {
  try {
    const { priceId, planName } = await req.json();

    if (!priceId || !planName) {
      return NextResponse.json(
        { error: 'priceId et planName requis' },
        { status: 400 }
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
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/setup-account?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: {
        plan_name: planName,
      },
      subscription_data: {
        metadata: {
          plan_name: planName,
        },
      },
      // Collecter les informations du client
      customer_creation: 'always',
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['FR', 'BE', 'CH', 'CA', 'US'],
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session' },
      { status: 500 }
    );
  }
}
