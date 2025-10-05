// ========================================
// EDGE FUNCTION SIMPLIFIÉE - SEND EMAIL RELIABLE
// ========================================

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

    console.log('📧 ===== ENVOI EMAIL SIMPLE =====');
    console.log('📧 Type:', type);
    console.log('👤 Destinataire:', client_email);
    console.log('👤 Nom:', client_name);
    console.log('👨‍💼 Coach:', coach_name);
    console.log('🔗 URL:', invitation_url);
    console.log('⏰ Timestamp:', new Date().toISOString());

    // Configuration Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'letsbuildyourway@gmail.com';

    console.log('🔧 Configuration:');
    console.log('   - RESEND_API_KEY:', resendApiKey ? `${resendApiKey.substring(0, 10)}...` : '❌ NON CONFIGURÉ');
    console.log('   - FROM_EMAIL:', fromEmail);

    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY non configuré !');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'RESEND_API_KEY not configured',
        message: 'Email service not configured'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Envoyer l'email via Resend
    const emailResult = await sendResendEmail({
      to: client_email,
      from: fromEmail,
      subject: type === 'coach_welcome_with_password' 
        ? `Bienvenue sur BYW, ${client_name} ! Configurez votre compte coach`
        : type === 'coach_welcome'
        ? `Bienvenue sur BYW, ${client_name} ! Configurez votre compte coach`
        : `Invitation de ${coach_name} - Rejoignez BYW`,
      html: generateEmailHTML(emailData, type),
      text: generateEmailText(emailData, type)
    });

    if (emailResult.success) {
      console.log('✅ Email envoyé avec succès via Resend');
      console.log('📧 Email ID:', emailResult.emailId);
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        email_id: emailResult.emailId,
        provider: 'Resend',
        recipient: client_email,
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else {
      console.error('❌ Erreur Resend:', emailResult.error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: emailResult.error,
        message: 'Failed to send email via Resend'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      message: 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// ========================================
// FONCTIONS UTILITAIRES
// ========================================

async function sendResendEmail({ to, from, subject, html, text }: {
  to: string;
  from: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ success: boolean; emailId?: string; error?: string }> {
  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html,
        text
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Erreur Resend API:', response.status, errorData);
      return { success: false, error: `Resend API error: ${response.status} - ${errorData}` };
    }

    const result = await response.json();
    console.log('✅ Resend API success:', result);
    return { success: true, emailId: result.id };

  } catch (error) {
    console.error('❌ Erreur fetch Resend:', error);
    return { success: false, error: error.message };
  }
}

function generateEmailHTML(data: EmailData, type: string): string {
  const { client_name, invitation_url, temp_password, login_url, plan_name, coach_name } = data;
  
  if (type === 'client_invitation') {
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
      <p style="color: #d1d5db; margin: 10px 0 0 0;">Rejoignez BYW - Votre plateforme de coaching</p>
    </div>
    
    <div class="content">
      <h2>🎯 Bonjour ${client_name} !</h2>
      <p>Votre coach vous a invité à rejoindre BYW, la plateforme de coaching personnalisé qui va transformer votre approche du fitness.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${invitation_url}" class="cta-button">Accepter l'invitation</a>
      </div>
      
      <p><strong>⏰ Important :</strong> Ce lien expire dans 7 jours pour des raisons de sécurité.</p>
      
      <p>Si vous avez des questions, contactez votre coach ou notre équipe support !</p>
    </div>
    
    <div class="footer">
      <p><strong>BYW - Build Your Way</strong></p>
      <p>Votre plateforme de coaching personnalisé</p>
      <p>Si vous n'avez pas demandé cette invitation, ignorez cet email.</p>
    </div>
  </div>
</body>
</html>`;
  }
  
  // Template par défaut
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>BYW</title>
</head>
<body>
  <h1>Bonjour ${client_name} !</h1>
  <p>Message de ${coach_name}</p>
  <p>Type: ${type}</p>
  ${invitation_url ? `<p><a href="${invitation_url}">Cliquez ici</a></p>` : ''}
</body>
</html>`;
}

function generateEmailText(data: EmailData, type: string): string {
  const { client_name, invitation_url, coach_name } = data;
  
  if (type === 'client_invitation') {
    return `
🎯 INVITATION BYW - ${client_name.toUpperCase()} !

Bonjour ${client_name} !

Votre coach ${coach_name} vous a invité à rejoindre BYW, la plateforme de coaching personnalisé.

🔗 ACCEPTER L'INVITATION :
${invitation_url}

⏰ IMPORTANT : Ce lien expire dans 7 jours pour des raisons de sécurité.

Si vous avez des questions, contactez votre coach ou notre équipe support !

---
BYW - Build Your Way
Votre plateforme de coaching personnalisé

Si vous n'avez pas demandé cette invitation, ignorez cet email.
    `.trim();
  }
  
  return `Bonjour ${client_name} ! Message de ${coach_name}. Type: ${type}`;
}
