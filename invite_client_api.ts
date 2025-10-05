// ========================================
// API D'INVITATION CLIENT
// ========================================
// Fichier: app/api/invite-client/route.ts
// Description: API pour inviter de nouveaux clients

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { clientEmail, clientName, coachId } = await req.json();

    // Validation des données
    if (!clientEmail || !clientName || !coachId) {
      return Response.json(
        { error: 'Email, nom et coachId requis' }, 
        { status: 400 }
      );
    }

    // Vérifier les limites du coach
    const { data: coach } = await supabase
      .from('profiles')
      .select('plan_limits, current_clients_count, subscription_status')
      .eq('id', coachId)
      .eq('role', 'coach')
      .single();

    if (!coach) {
      return Response.json({ error: 'Coach non trouvé' }, { status: 404 });
    }

    if (coach.subscription_status !== 'active') {
      return Response.json(
        { error: 'Abonnement non actif' }, 
        { status: 403 }
      );
    }

    if (coach.current_clients_count >= coach.plan_limits.max_clients) {
      return Response.json(
        { error: 'Limite de clients atteinte pour votre pack' }, 
        { status: 403 }
      );
    }

    // Vérifier si le client existe déjà
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('email', clientEmail)
      .eq('coach_id', coachId)
      .single();

    if (existingClient) {
      return Response.json(
        { error: 'Ce client existe déjà' }, 
        { status: 409 }
      );
    }

    // Générer token d'invitation
    const invitationToken = crypto.randomBytes(32).toString('hex');

    // Créer le client
    const { data: client, error } = await supabase
      .from('clients')
      .insert({
        coach_id: coachId,
        email: clientEmail,
        first_name: clientName.split(' ')[0],
        last_name: clientName.split(' ').slice(1).join(' ') || '',
        invitation_token: invitationToken,
        invitation_sent_at: new Date().toISOString(),
        invitation_status: 'pending',
        status: 'active',
        objective: 'À définir',
        level: 'Débutant',
        mentality: 'À définir',
        coaching_type: 'À définir',
        contact: clientEmail,
        sports_history: 'À définir'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating client:', error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    // Incrémenter le compteur (déjà fait par le trigger)
    // await supabase
    //   .from('profiles')
    //   .update({
    //     current_clients_count: coach.current_clients_count + 1,
    //   })
    //   .eq('id', coachId);

    // Envoyer email d'invitation
    await sendInvitationEmail(clientEmail, clientName, invitationToken);

    return Response.json({ 
      success: true, 
      client: {
        id: client.id,
        email: client.email,
        name: `${client.first_name} ${client.last_name}`,
        invitation_token: client.invitation_token
      }
    });
  } catch (error: any) {
    console.error('Error in invite-client API:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

async function sendInvitationEmail(
  email: string,
  name: string,
  token: string
) {
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invitation?token=${token}`;

  console.log('📧 Invitation à envoyer à:', email);
  console.log('🔗 Lien:', inviteUrl);

  // TODO: Implémenter l'envoi d'email avec Resend ou SendGrid
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
      subject: '🎯 Invitation à rejoindre BYW Fitness',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Bonjour ${name} !</h1>
          <p>Votre coach vous a invité à rejoindre BYW Fitness, la plateforme de coaching personnalisé.</p>
          <p>Cliquez sur le lien ci-dessous pour accepter l'invitation et créer votre compte :</p>
          <a href="${inviteUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
            Accepter l'invitation
          </a>
          <p><small>Ce lien expire dans 7 jours.</small></p>
          <p>Si vous avez des questions, contactez votre coach ou support@byw-fitness.com</p>
        </div>
      `
    })
  });

  if (!response.ok) {
    throw new Error('Failed to send invitation email');
  }
  */
}
