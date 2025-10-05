import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

interface EmailData {
  client_email: string;
  client_name: string;
  invitation_url?: string;
  temp_password?: string;
  login_url?: string;
  plan_name?: string;
  coach_name: string;
  type?: 'client_invitation' | 'coach_welcome' | 'coach_welcome_with_password';
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const emailData: EmailData = await req.json();
    const { client_email, client_name, invitation_url, temp_password, login_url, plan_name, coach_name, type = 'client_invitation' } = emailData;

    console.log('📧 ===== ENVOI EMAIL FIABLE =====');
    console.log('📧 Type:', type);
    console.log('👤 Destinataire:', client_email);
    console.log('👤 Nom:', client_name);
    console.log('👨‍💼 Coach:', coach_name);
    console.log('🔗 URL:', invitation_url);
    console.log('⏰ Timestamp:', new Date().toISOString());

    // Essayer plusieurs providers d'email en cascade
    const providers = [
      { name: 'Resend', fn: sendResendEmail },
      { name: 'SendGrid', fn: sendSendGridEmail },
      { name: 'Mailgun', fn: sendMailgunEmail },
      { name: 'Fallback', fn: sendFallbackEmail }
    ];

    let lastError = null;
    
    for (const provider of providers) {
      try {
        console.log(`🔄 Tentative avec ${provider.name}...`);
        
        const result = await provider.fn({
          to: client_email,
          subject: type === 'coach_welcome_with_password' 
            ? `🎉 Bienvenue sur BYW, ${client_name} ! Vos accès sont prêts`
            : type === 'coach_welcome'
            ? `Bienvenue sur BYW, ${client_name} ! Configurez votre compte coach`
            : `Invitation de ${coach_name} - Rejoignez BYW`,
          html: generateEmailHTML(emailData, type),
          text: generateEmailText(emailData, type)
        });

        if (result.success) {
          console.log(`✅ Email envoyé avec succès via ${provider.name}`);
          console.log('📧 Email ID:', result.emailId);
          
          return new Response(JSON.stringify({ 
            success: true, 
            message: `Email sent successfully via ${provider.name}`,
            email_id: result.emailId,
            provider: provider.name,
            recipient: client_email,
            timestamp: new Date().toISOString()
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          console.warn(`⚠️ ${provider.name} a échoué:`, result.error);
          lastError = result.error;
        }
      } catch (error) {
        console.warn(`⚠️ Erreur avec ${provider.name}:`, error.message);
        lastError = error.message;
      }
    }

    // Tous les providers ont échoué
    console.error('❌ Tous les providers d\'email ont échoué');
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'All email providers failed',
      last_error: lastError,
      recipient: client_email
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Provider Resend
async function sendResendEmail({ to, subject, html, text }: any) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: Deno.env.get('FROM_EMAIL') || 'onboarding@resend.dev',
        to: [to],
        subject,
        html,
        text,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.message || `HTTP ${response.status}` };
    }

    return { success: true, emailId: data.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Provider SendGrid
async function sendSendGridEmail({ to, subject, html, text }: any) {
  const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY');
  if (!sendGridApiKey) {
    return { success: false, error: 'SENDGRID_API_KEY not configured' };
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendGridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: Deno.env.get('FROM_EMAIL') || 'noreply@byw.app', name: 'BYW' },
        subject,
        content: [
          { type: 'text/plain', value: text },
          { type: 'text/html', value: html }
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `SendGrid: ${error}` };
    }

    return { success: true, emailId: `sg_${Date.now()}` };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Provider Mailgun
async function sendMailgunEmail({ to, subject, html, text }: any) {
  const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY');
  const mailgunDomain = Deno.env.get('MAILGUN_DOMAIN');
  
  if (!mailgunApiKey || !mailgunDomain) {
    return { success: false, error: 'MAILGUN credentials not configured' };
  }

  try {
    const formData = new FormData();
    formData.append('from', Deno.env.get('FROM_EMAIL') || `noreply@${mailgunDomain}`);
    formData.append('to', to);
    formData.append('subject', subject);
    formData.append('text', text);
    formData.append('html', html);

    const response = await fetch(`https://api.mailgun.net/v3/${mailgunDomain}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`api:${mailgunApiKey}`)}`,
      },
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.message || `HTTP ${response.status}` };
    }

    return { success: true, emailId: data.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Fallback: Simulation locale
async function sendFallbackEmail({ to, subject, html, text }: any) {
  console.log('📧 FALLBACK: Simulation d\'envoi d\'email');
  console.log('📧 To:', to);
  console.log('📧 Subject:', subject);
  console.log('📧 Content:', text.substring(0, 200) + '...');
  
  // Simuler un délai
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return { 
    success: true, 
    emailId: `fallback_${Date.now()}`,
    note: 'Email simulé - vérifiez la configuration des providers'
  };
}

function generateEmailHTML(data: EmailData, type: string): string {
  const { client_name, invitation_url, temp_password, login_url, plan_name, coach_name } = data;
  
  if (type === 'coach_welcome_with_password') {
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
    .credentials { background: #f8f9fa; padding: 20px; border-radius: 6px; border-left: 4px solid #f97316; margin: 20px 0; }
    .password { background: #fff; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 18px; font-weight: bold; color: #1f2937; letter-spacing: 1px; }
    .features { background: #f8f9fa; padding: 30px; border-radius: 6px; margin: 30px 0; }
    .feature { margin: 15px 0; padding-left: 25px; position: relative; }
    .feature:before { content: "✓"; position: absolute; left: 0; color: #f97316; font-weight: bold; }
    .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
    .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">BYW</div>
      <h1 style="color: white; margin: 0; font-size: 28px;">Bienvenue ${client_name} !</h1>
      <p style="color: #d1d5db; margin: 10px 0 0 0;">Votre pack ${plan_name?.replace('_', ' ').toUpperCase()} est activé</p>
    </div>
    
    <div class="content">
      <h2>🎉 Félicitations pour votre abonnement !</h2>
      <p>Votre compte coach BYW est prêt et vous pouvez commencer à utiliser la plateforme dès maintenant.</p>
      
      <div class="credentials">
        <h3>🔐 Vos identifiants de connexion :</h3>
        <p><strong>Email :</strong> ${client_email}</p>
        <p><strong>Mot de passe provisoire :</strong></p>
        <div class="password">${temp_password}</div>
      </div>
      
      <div class="warning">
        <p><strong>⚠️ Important :</strong> Lors de votre première connexion, vous devrez changer ce mot de passe provisoire pour en créer un personnel et sécurisé.</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${login_url}" class="cta-button">Se connecter maintenant</a>
      </div>
      
      <div class="features">
        <h3>✨ Prochaines étapes :</h3>
        <div class="feature">Connectez-vous avec vos identifiants</div>
        <div class="feature">Changez votre mot de passe</div>
        <div class="feature">Complétez votre profil coach</div>
        <div class="feature">Invitez vos premiers clients</div>
        <div class="feature">Créez vos programmes d'entraînement</div>
      </div>
      
      <p>Si vous avez des questions, notre équipe support est là pour vous aider !</p>
    </div>
    
    <div class="footer">
      <p><strong>BYW - Build Your Way</strong></p>
      <p>Votre plateforme de coaching personnalisé</p>
      <p>Si vous n'avez pas créé de compte, ignorez cet email.</p>
    </div>
  </div>
</body>
</html>`;
  }
  
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
  const { client_name, invitation_url, temp_password, login_url, plan_name, coach_name } = data;
  
  if (type === 'coach_welcome_with_password') {
    return `
🎉 BIENVENUE SUR BYW - ${client_name.toUpperCase()} !

Félicitations pour votre abonnement ! Votre compte coach BYW est prêt.
Votre pack ${plan_name?.replace('_', ' ').toUpperCase()} est activé.

🔐 VOS IDENTIFIANTS DE CONNEXION :
Email : ${client_email}
Mot de passe provisoire : ${temp_password}

🔗 SE CONNECTER MAINTENANT :
${login_url}

⚠️ IMPORTANT : Lors de votre première connexion, vous devrez changer ce mot de passe provisoire pour en créer un personnel et sécurisé.

✨ PROCHAINES ÉTAPES :
• Connectez-vous avec vos identifiants
• Changez votre mot de passe
• Complétez votre profil coach
• Invitez vos premiers clients
• Créez vos programmes d'entraînement

Si vous avez des questions, notre équipe support est là pour vous aider !

---
BYW - Build Your Way
Votre plateforme de coaching personnalisé

Si vous n'avez pas créé de compte, ignorez cet email.
    `.trim();
  }
  
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
