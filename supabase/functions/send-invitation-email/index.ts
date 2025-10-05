import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

interface EmailData {
  client_email: string;
  client_name: string;
  invitation_url: string;
  coach_name: string;
  type?: 'client_invitation' | 'coach_welcome';
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const emailData: EmailData = await req.json();
    const { client_email, client_name, invitation_url, coach_name, type = 'client_invitation' } = emailData;

    console.log('📧 ===== DÉBUT ENVOI EMAIL =====');
    console.log('📧 Type:', type);
    console.log('👤 Destinataire:', client_email);
    console.log('👤 Nom:', client_name);
    console.log('👨‍💼 Coach:', coach_name);
    console.log('🔗 URL:', invitation_url);
    console.log('⏰ Timestamp:', new Date().toISOString());

    // Configuration Resend avec validation
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'onboarding@resend.dev';
    const baseUrl = Deno.env.get('BASE_URL') || 'https://byw.app';

    console.log('🔧 Configuration:');
    console.log('   - RESEND_API_KEY:', resendApiKey ? `${resendApiKey.substring(0, 10)}...` : '❌ NON CONFIGURÉ');
    console.log('   - FROM_EMAIL:', fromEmail);
    console.log('   - BASE_URL:', baseUrl);

    if (!resendApiKey) {
      console.error('❌ ERREUR CRITIQUE: RESEND_API_KEY non configuré !');
      console.error('💡 Solution: Exécuter le script fix_email_system.sh');
      return await sendSimulatedEmail(emailData);
    }

    // Envoyer l'email via Resend
    const emailResult = await sendResendEmail({
      to: client_email,
      from: fromEmail,
      subject: type === 'coach_welcome' 
        ? `Bienvenue sur BYW, ${client_name} ! Configurez votre compte coach`
        : `Invitation de ${coach_name} - Rejoignez BYW`,
      html: generateEmailHTML(emailData, type, baseUrl),
      text: generateEmailText(emailData, type, baseUrl)
    });

    if (emailResult.success) {
      console.log('✅ ===== EMAIL ENVOYÉ AVEC SUCCÈS =====');
      console.log('📧 Email ID:', emailResult.emailId);
      console.log('👤 Destinataire:', client_email);
      console.log('⏰ Timestamp:', new Date().toISOString());
      console.log('📧 ======================================');
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        email_id: emailResult.emailId,
        recipient: client_email,
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      console.error('❌ ===== ERREUR RESEND =====');
      console.error('❌ Erreur:', emailResult.error);
      console.error('👤 Destinataire:', client_email);
      console.error('⏰ Timestamp:', new Date().toISOString());
      console.error('📧 =========================');
      
      // Fallback vers simulation
      return await sendSimulatedEmail(emailData);
    }

  } catch (error) {
    console.error('Error in send-invitation-email:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function sendResendEmail({ to, from, subject, html, text }: {
  to: string;
  from: string;
  subject: string;
  html: string;
  text: string;
}) {
  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    console.log('📤 ===== ENVOI VIA RESEND =====');
    console.log('📧 To:', to);
    console.log('📧 From:', from);
    console.log('📧 Subject:', subject);
    console.log('🔑 API Key:', resendApiKey ? `${resendApiKey.substring(0, 10)}...` : '❌ MANQUANTE');
    
    const emailPayload = {
      from,
      to: [to],
      subject,
      html,
      text,
    };
    
    console.log('📦 Payload:', JSON.stringify(emailPayload, null, 2));
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    const data = await response.json();
    
    console.log('📊 ===== RÉPONSE RESEND =====');
    console.log('📊 Status:', response.status);
    console.log('📊 Status Text:', response.statusText);
    console.log('📊 Data:', JSON.stringify(data, null, 2));
    console.log('📊 =========================');

    if (!response.ok) {
      console.error('❌ ERREUR API RESEND:');
      console.error('   Status:', response.status);
      console.error('   Message:', data.message || data.error || 'Erreur inconnue');
      console.error('   Details:', data);
      
      return { 
        success: false, 
        error: data.message || data.error || `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
        details: data
      };
    }

    console.log('✅ Email envoyé avec succès via Resend');
    console.log('📧 Email ID:', data.id);
    return { success: true, emailId: data.id };
  } catch (error) {
    console.error('❌ ERREUR FETCH RESEND:');
    console.error('   Type:', error.name);
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
    
    return { 
      success: false, 
      error: `Erreur réseau: ${error.message}`,
      type: error.name
    };
  }
}

async function sendSimulatedEmail(emailData: EmailData) {
  const { client_email, client_name, invitation_url, coach_name, type = 'client_invitation' } = emailData;
  
  const emailContent = generateEmailText(emailData, type);
  
  console.log('📧 SIMULATION EMAIL:');
  console.log('To:', client_email);
  console.log('Content:', emailContent);

  // Simuler un délai d'envoi
  await new Promise(resolve => setTimeout(resolve, 1000));

  return new Response(JSON.stringify({ 
    success: true, 
    message: 'Email simulation completed',
    email_content: emailContent,
    invitation_url: invitation_url,
    email_id: 'sim_' + Date.now()
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200
  });
}

function generateEmailHTML(data: EmailData, type: string, baseUrl: string): string {
  const { client_name, invitation_url, coach_name } = data;
  
  if (type === 'coach_welcome') {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue sur BYW</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1f2937 0%, #111827 100%); padding: 40px 30px; text-align: center; }
    .logo { color: #f97316; font-size: 32px; font-weight: bold; margin-bottom: 10px; }
    .content { padding: 40px 30px; }
    .cta-button { display: inline-block; background: #f97316; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .features { background: #f8f9fa; padding: 30px; border-radius: 6px; margin: 30px 0; }
    .feature { margin: 15px 0; padding-left: 25px; position: relative; }
    .feature:before { content: "✓"; position: absolute; left: 0; color: #f97316; font-weight: bold; }
    .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">BYW</div>
      <h1 style="color: white; margin: 0; font-size: 28px;">Bienvenue ${client_name} !</h1>
      <p style="color: #d1d5db; margin: 10px 0 0 0;">Votre compte coach est prêt</p>
    </div>
    
    <div class="content">
      <h2>🎉 Félicitations pour votre abonnement !</h2>
      <p>Votre compte coach BYW est maintenant actif. Configurez votre mot de passe pour accéder à votre dashboard et commencer à gérer vos clients.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${invitation_url}" class="cta-button">Configurer mon mot de passe</a>
      </div>
      
      <div class="features">
        <h3>🚀 Votre dashboard coach vous permet de :</h3>
        <div class="feature">Gérer vos clients et leurs programmes</div>
        <div class="feature">Créer des séances d'entraînement personnalisées</div>
        <div class="feature">Suivre les progrès de vos clients</div>
        <div class="feature">Communiquer via messagerie intégrée</div>
        <div class="feature">Gérer la facturation et les paiements</div>
        <div class="feature">Accéder à des ressources exclusives</div>
      </div>
      
      <p><strong>⏰ Important :</strong> Ce lien expire dans 24 heures pour des raisons de sécurité.</p>
      
      <p>Si vous avez des questions, notre équipe support est là pour vous aider !</p>
    </div>
    
    <div class="footer">
      <p><strong>BYW - Build Your Way</strong></p>
      <p>Votre plateforme de coaching personnalisé</p>
      <p>Si vous n'avez pas demandé ce compte, ignorez cet email.</p>
    </div>
  </div>
</body>
</html>`;
  }
  
  // Template pour invitation client
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation BYW</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1f2937 0%, #111827 100%); padding: 40px 30px; text-align: center; }
    .logo { color: #f97316; font-size: 32px; font-weight: bold; margin-bottom: 10px; }
    .content { padding: 40px 30px; }
    .cta-button { display: inline-block; background: #f97316; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">BYW</div>
      <h1 style="color: white; margin: 0; font-size: 28px;">Invitation de ${coach_name}</h1>
    </div>
    
    <div class="content">
      <h2>Bonjour ${client_name} !</h2>
      <p>Votre coach ${coach_name} vous a invité à rejoindre sa plateforme de coaching personnalisé.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${invitation_url}" class="cta-button">Rejoindre BYW</a>
      </div>
      
      <p>Vous pourrez consulter vos séances, suivre votre progression et communiquer avec votre coach.</p>
      <p><strong>⏰ Cette invitation expire dans 7 jours.</strong></p>
    </div>
    
    <div class="footer">
      <p><strong>BYW - Build Your Way</strong></p>
      <p>Si vous n'avez pas demandé cette invitation, ignorez cet email.</p>
    </div>
  </div>
</body>
</html>`;
}

function generateEmailText(data: EmailData, type: string): string {
  const { client_name, invitation_url, coach_name } = data;
  
  if (type === 'coach_welcome') {
    return `
🎉 BIENVENUE SUR BYW - ${client_name.toUpperCase()} !

Félicitations pour votre abonnement ! Votre compte coach BYW est maintenant actif.

🔗 CONFIGURER VOTRE MOT DE PASSE :
${invitation_url}

🚀 VOTRE DASHBOARD COACH VOUS PERMET DE :
• Gérer vos clients et leurs programmes
• Créer des séances d'entraînement personnalisées  
• Suivre les progrès de vos clients
• Communiquer via messagerie intégrée
• Gérer la facturation et les paiements
• Accéder à des ressources exclusives

⏰ IMPORTANT : Ce lien expire dans 24 heures pour des raisons de sécurité.

Si vous avez des questions, notre équipe support est là pour vous aider !

---
BYW - Build Your Way
Votre plateforme de coaching personnalisé

Si vous n'avez pas demandé ce compte, ignorez cet email.
    `.trim();
  }
  
  return `
INVITATION BYW - ${coach_name.toUpperCase()}

Bonjour ${client_name} !

Votre coach ${coach_name} vous a invité à rejoindre sa plateforme de coaching personnalisé.

🔗 REJOINDRE BYW :
${invitation_url}

Vous pourrez :
• Consulter vos séances d'entraînement
• Suivre votre progression  
• Communiquer avec votre coach
• Accéder à des ressources personnalisées

⏰ Cette invitation expire dans 7 jours.

Si vous n'avez pas demandé cette invitation, vous pouvez ignorer cet email.

---
BYW - Build Your Way
    `.trim();
}
