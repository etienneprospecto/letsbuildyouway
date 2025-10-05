// ========================================
// WEBHOOK STRIPE POUR INSCRIPTION COACHS
// ========================================
// Fichier: app/api/webhooks/stripe/route.ts
// Description: Gère l'inscription des nouveaux coachs via Stripe

import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import crypto from 'crypto';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Important : service role key
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return new Response('No signature', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook Error:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Gérer le paiement réussi
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const email = session.customer_details?.email;
      const name = session.customer_details?.name;

      if (!email) {
        throw new Error('No email in session');
      }

      // Récupérer les infos de l'abonnement
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      // Déterminer le plan selon le montant
      let planType: string;
      let planLimits: any;

      const amount = session.amount_total || 0;

      if (amount === 1999) {
        // Warm-Up (19.99€)
        planType = 'warm_up';
        planLimits = {
          max_clients: 15,
          max_workouts: 15,
          max_exercises: 30,
          timeline_weeks: 1,
          features: ['basic_dashboard', 'messaging', 'simple_calendar']
        };
      } else if (amount === 3999) {
        // Transformationnel (39.99€)
        planType = 'transformationnel';
        planLimits = {
          max_clients: 50,
          max_workouts: 50,
          max_exercises: 100,
          timeline_weeks: 4,
          features: [
            'advanced_dashboard',
            'voice_messaging',
            'nutrition_tracking',
            'advanced_calendar',
            'progress_photos',
            'trophies',
            'automatic_reminders'
          ]
        };
      } else if (amount === 7999) {
        // Elite (79.99€)
        planType = 'elite';
        planLimits = {
          max_clients: 100,
          max_workouts: -1,
          max_exercises: -1,
          timeline_weeks: 52,
          features: [
            'ai_nutrition',
            'financial_dashboard',
            'full_automation',
            'custom_theme',
            'video_messaging',
            'priority_support',
            'advanced_gamification'
          ]
        };
      } else {
        throw new Error(`Montant non reconnu: ${amount}`);
      }

      // Vérifier si l'utilisateur existe déjà
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (existingProfile) {
        // Mise à jour d'un coach existant qui change de plan
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            subscription_plan: planType,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            subscription_status: 'active',
            subscription_start_date: new Date().toISOString(),
            plan_limits: planLimits,
          })
          .eq('id', existingProfile.id);

        if (updateError) {
          console.error('Update error:', updateError);
          throw updateError;
        }

        console.log('Coach upgraded:', email);
      } else {
        // Nouveau coach : générer token de configuration
        const setupToken = crypto.randomBytes(32).toString('hex');
        const setupTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // Créer le profil coach dans Supabase
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            email: email,
            first_name: name?.split(' ')[0] || email.split('@')[0],
            last_name: name?.split(' ').slice(1).join(' ') || '',
            role: 'coach',
            subscription_plan: planType,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            subscription_status: 'active',
            subscription_start_date: new Date().toISOString(),
            plan_limits: planLimits,
            account_setup_token: setupToken,
            account_setup_token_expires: setupTokenExpires.toISOString(),
            current_clients_count: 0,
            current_workouts_count: 0,
            current_exercises_count: 0,
          })
          .select()
          .single();

        if (insertError) {
          console.error('Insert error:', insertError);
          throw insertError;
        }

        // Envoyer l'email de configuration
        await sendSetupEmail(email, setupToken, planType);

        console.log('New coach created:', email);
      }

      return new Response('Success', { status: 200 });
    } catch (error: any) {
      console.error('Processing error:', error);
      return new Response(`Error: ${error.message}`, { status: 500 });
    }
  }

  // Gérer l'annulation d'abonnement
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'cancelled',
          subscription_end_date: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id);

      if (error) {
        console.error('Error updating cancelled subscription:', error);
      } else {
        console.log('Subscription cancelled:', subscription.id);
      }
    } catch (error) {
      console.error('Error processing cancellation:', error);
    }
  }

  return new Response('Event not handled', { status: 200 });
}

async function sendSetupEmail(email: string, token: string, plan: string) {
  const setupUrl = `${process.env.NEXT_PUBLIC_APP_URL}/setup-account?token=${token}`;

  console.log('📧 Email à envoyer à:', email);
  console.log('🔗 Lien de configuration:', setupUrl);
  console.log('📦 Pack:', plan);

  // TODO: Implémenter l'envoi d'email avec Resend ou SendGrid
  // Exemple avec Resend :
  /*
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'noreply@byw-fitness.com',
      to: email,
      subject: '🎉 Configurez votre compte coach BYW Fitness',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Bienvenue chez BYW Fitness !</h1>
          <p>Votre pack <strong>${plan.replace('_', ' ')}</strong> est maintenant actif.</p>
          <p>Pour commencer à utiliser votre compte coach, cliquez sur le lien ci-dessous :</p>
          <a href="${setupUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
            Configurer mon compte
          </a>
          <p><small>Ce lien expire dans 24 heures.</small></p>
          <p>Si vous avez des questions, contactez-nous à support@byw-fitness.com</p>
        </div>
      `
    })
  });

  if (!response.ok) {
    throw new Error('Failed to send setup email');
  }
  */
}
