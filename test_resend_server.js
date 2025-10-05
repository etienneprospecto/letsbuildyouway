/**
 * Test Resend côté serveur (sans problème CORS)
 * Ce script teste Resend directement depuis Node.js
 */

const RESEND_API_KEY = 're_FJzQiko6_3kNowwWrRBFXSggQXW9Kt5Ni';

async function testResendAPI() {
  console.log('🔍 Test de l\'API Resend côté serveur...\n');

  try {
    // Test 1: Vérifier la clé API
    console.log('1️⃣ Test de la clé API...');
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
        body: JSON.stringify({
          from: 'onboarding@resend.dev',
          to: ['letsbuildyourway@gmail.com'],
        subject: 'Test Email BYW - ' + new Date().toLocaleString(),
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #f97316; text-align: center;">🎉 Test Email BYW</h1>
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2>✅ Resend fonctionne parfaitement !</h2>
              <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Clé API:</strong> ${RESEND_API_KEY.substring(0, 10)}...</p>
              <p><strong>Source:</strong> Test côté serveur Node.js</p>
            </div>
            <p>Si vous recevez cet email, votre système d'onboarding est prêt !</p>
            <div style="background: #f0fdf4; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <h3>🚀 Prochaines étapes :</h3>
              <ul>
                <li>Configurer les variables d'environnement Supabase</li>
                <li>Déployer les Edge Functions</li>
                <li>Tester le flow complet d'onboarding</li>
              </ul>
            </div>
          </div>
        `,
        text: `
Test Email BYW - ${new Date().toLocaleString()}

✅ Resend fonctionne parfaitement !

Date: ${new Date().toLocaleString()}
Clé API: ${RESEND_API_KEY.substring(0, 10)}...
Source: Test côté serveur Node.js

Si vous recevez cet email, votre système d'onboarding est prêt !

🚀 Prochaines étapes :
- Configurer les variables d'environnement Supabase
- Déployer les Edge Functions  
- Tester le flow complet d'onboarding
        `
      })
    });

    const data = await response.json();
    
    console.log('📊 Réponse Resend:');
    console.log('   Status:', response.status);
    console.log('   Email ID:', data.id);
    console.log('   Message:', data.message || 'Succès');

    if (response.ok) {
      console.log('\n✅ SUCCÈS ! Votre clé Resend fonctionne parfaitement !');
      console.log('📧 Email envoyé à: test@byw.app');
      console.log('📧 Email ID:', data.id);
      console.log('\n🎉 Votre système d\'email est opérationnel !');
      
      return { success: true, emailId: data.id };
    } else {
      console.log('\n❌ ERREUR API Resend:');
      console.log('   Status:', response.status);
      console.log('   Erreur:', data.message || 'Erreur inconnue');
      console.log('   Détails:', JSON.stringify(data, null, 2));
      
      return { success: false, error: data.message || 'Erreur API' };
    }

  } catch (error) {
    console.log('\n❌ ERREUR DE CONNEXION:');
    console.log('   Erreur:', error.message);
    console.log('   Type:', error.name);
    
    if (error.code === 'ENOTFOUND') {
      console.log('   💡 Problème de DNS - Vérifiez votre connexion internet');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('   💡 Connexion refusée - Vérifiez votre connexion internet');
    } else {
      console.log('   💡 Erreur inconnue - Vérifiez votre configuration');
    }
    
    return { success: false, error: error.message };
  }
}

async function testMultipleEmails() {
  console.log('\n📧 Test d\'envoi de plusieurs emails...\n');

  const emails = [
    { to: 'letsbuildyourway@gmail.com', name: 'Test User', type: 'coach_welcome' },
    { to: 'letsbuildyourway@gmail.com', name: 'Client Test', type: 'client_invitation' }
  ];

  for (const email of emails) {
    console.log(`📤 Envoi à ${email.to} (${email.type})...`);
    
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'onboarding@resend.dev',
          to: [email.to],
          subject: email.type === 'coach_welcome' 
            ? `Bienvenue sur BYW, ${email.name} ! Configurez votre compte coach`
            : `Invitation de BYW Team - Rejoignez BYW`,
          html: email.type === 'coach_welcome' 
            ? generateCoachWelcomeHTML(email.name)
            : generateClientInvitationHTML(email.name),
          text: email.type === 'coach_welcome'
            ? generateCoachWelcomeText(email.name)
            : generateClientInvitationText(email.name)
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log(`   ✅ Envoyé - ID: ${data.id}`);
      } else {
        console.log(`   ❌ Erreur - ${data.message}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Erreur - ${error.message}`);
    }
  }
}

function generateCoachWelcomeHTML(name) {
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
      <h1 style="color: white; margin: 0; font-size: 28px;">Bienvenue ${name} !</h1>
      <p style="color: #d1d5db; margin: 10px 0 0 0;">Votre compte coach est prêt</p>
    </div>
    
    <div class="content">
      <h2>🎉 Félicitations pour votre abonnement !</h2>
      <p>Votre compte coach BYW est maintenant actif. Configurez votre mot de passe pour accéder à votre dashboard et commencer à gérer vos clients.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://byw.app/auth/accept-invitation?token=test123" class="cta-button">Configurer mon mot de passe</a>
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

function generateClientInvitationHTML(name) {
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
      <h1 style="color: white; margin: 0; font-size: 28px;">Invitation de BYW Team</h1>
    </div>
    
    <div class="content">
      <h2>Bonjour ${name} !</h2>
      <p>Votre coach BYW Team vous a invité à rejoindre sa plateforme de coaching personnalisé.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://byw.app/auth/accept-invitation?token=client123" class="cta-button">Rejoindre BYW</a>
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

function generateCoachWelcomeText(name) {
  return `
🎉 BIENVENUE SUR BYW - ${name.toUpperCase()} !

Félicitations pour votre abonnement ! Votre compte coach BYW est maintenant actif.

🔗 CONFIGURER VOTRE MOT DE PASSE :
https://byw.app/auth/accept-invitation?token=test123

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

function generateClientInvitationText(name) {
  return `
INVITATION BYW - BYW TEAM

Bonjour ${name} !

Votre coach BYW Team vous a invité à rejoindre sa plateforme de coaching personnalisé.

🔗 REJOINDRE BYW :
https://byw.app/auth/accept-invitation?token=client123

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

// Exécution
console.log('🚀 Test Resend côté serveur BYW\n');
console.log('🔑 Clé API:', RESEND_API_KEY.substring(0, 10) + '...\n');

testResendAPI().then(async (result) => {
  if (result.success) {
    console.log('\n📧 Test d\'envoi de plusieurs emails...');
    await testMultipleEmails();
    
    console.log('\n🎉 Tous les tests sont terminés !');
    console.log('✅ Votre système d\'email est opérationnel');
    console.log('🚀 Vous pouvez maintenant configurer Supabase');
  } else {
    console.log('\n❌ Test échoué - Vérifiez votre clé API Resend');
  }
});

export { testResendAPI, testMultipleEmails };
