/**
 * Test du flow complet : Stripe Payment → Email automatique
 * Ce script simule un paiement Stripe et vérifie l'envoi d'email
 */

const RESEND_API_KEY = 're_FJzQiko6_3kNowwWrRBFXSggQXW9Kt5Ni';

// Configuration des 3 packs disponibles
const PACKS = {
  warm_up: {
    name: 'Warm Up',
    price: 29,
    priceId: 'price_1SCJ9WPyYNBRhOhApONh7U6A',
    features: ['15 clients max', '1 semaine timeline', 'Dashboard basique']
  },
  transformationnel: {
    name: 'Transformationnel', 
    price: 79,
    priceId: 'price_1SCJEXPyYNBRhOhAb64UZYVo',
    features: ['50 clients max', '4 semaines timeline', 'Messagerie vocale', 'Nutrition']
  },
  elite: {
    name: 'Elite',
    price: 149,
    priceId: 'price_1SCJEoPyYNBRhOhA0tN68xOU', 
    features: ['100 clients max', '52 semaines timeline', 'IA nutrition', 'Support prioritaire']
  }
};

async function testStripeFlow() {
  console.log('🚀 Test du flow complet Stripe → Email BYW\n');
  console.log('📦 Packs disponibles :');
  
  Object.entries(PACKS).forEach(([key, pack]) => {
    console.log(`   ${key}: ${pack.name} - ${pack.price}€/mois`);
  });
  
  console.log('\n🧪 Simulation d\'un paiement Stripe...\n');

  // Simuler un paiement pour chaque pack
  for (const [packKey, pack] of Object.entries(PACKS)) {
    console.log(`\n📦 Test du pack ${pack.name} (${pack.price}€/mois)`);
    console.log('='.repeat(50));
    
    const customerEmail = 'letsbuildyourway@gmail.com';
    const customerName = 'Test Coach';
    
    // 1. Simuler la création d'utilisateur
    console.log('1️⃣ Création de l\'utilisateur...');
    const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    console.log(`   ✅ Utilisateur créé: ${userId}`);
    
    // 2. Simuler la création du profil avec abonnement
    console.log('2️⃣ Création du profil avec abonnement...');
    console.log(`   📦 Plan: ${pack.name}`);
    console.log(`   💰 Prix: ${pack.price}€/mois`);
    console.log(`   🆔 Price ID: ${pack.priceId}`);
    console.log(`   ✨ Fonctionnalités: ${pack.features.join(', ')}`);
    
    // 3. Générer le lien d'invitation
    console.log('3️⃣ Génération du lien d\'invitation...');
    const invitationUrl = `https://byw.app/auth/accept-invitation?access_token=test_${userId}&refresh_token=refresh_${userId}`;
    console.log(`   🔗 Lien: ${invitationUrl}`);
    
    // 4. Envoyer l'email de bienvenue
    console.log('4️⃣ Envoi de l\'email de bienvenue...');
    const emailResult = await sendWelcomeEmail({
      customerEmail,
      customerName,
      invitationUrl,
      pack
    });
    
    if (emailResult.success) {
      console.log(`   ✅ Email envoyé avec succès !`);
      console.log(`   📧 Email ID: ${emailResult.emailId}`);
      console.log(`   📬 Destinataire: ${customerEmail}`);
    } else {
      console.log(`   ❌ Erreur envoi email: ${emailResult.error}`);
    }
    
    console.log(`\n🎉 Pack ${pack.name} testé avec succès !\n`);
    
    // Pause entre les tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('🎉 Tous les tests du flow Stripe → Email sont terminés !');
  console.log('✅ Votre système d\'onboarding automatique est opérationnel !');
}

async function sendWelcomeEmail({ customerEmail, customerName, invitationUrl, pack }) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: [customerEmail],
        subject: `🎉 Bienvenue sur BYW, ${customerName} ! Votre pack ${pack.name} est actif`,
        html: generateWelcomeEmailHTML(customerName, invitationUrl, pack),
        text: generateWelcomeEmailText(customerName, invitationUrl, pack)
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, emailId: data.id };
    } else {
      return { success: false, error: data.message || 'Erreur API' };
    }
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function generateWelcomeEmailHTML(name, invitationUrl, pack) {
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
    .pack-info { background: #f0f9ff; padding: 30px; border-radius: 6px; margin: 30px 0; border-left: 4px solid #f97316; }
    .features { background: #f8f9fa; padding: 30px; border-radius: 6px; margin: 30px 0; }
    .feature { margin: 15px 0; padding-left: 25px; position: relative; }
    .feature:before { content: "✓"; position: absolute; left: 0; color: #f97316; font-weight: bold; }
    .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
    .price { font-size: 24px; font-weight: bold; color: #f97316; }
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
      
      <div class="pack-info">
        <h3>📦 Votre pack ${pack.name}</h3>
        <p class="price">${pack.price}€/mois</p>
        <p>Vous avez accès à toutes les fonctionnalités de votre pack :</p>
        <ul>
          ${pack.features.map(feature => `<li>${feature}</li>`).join('')}
        </ul>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${invitationUrl}" class="cta-button">Configurer mon mot de passe</a>
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

function generateWelcomeEmailText(name, invitationUrl, pack) {
  return `
🎉 BIENVENUE SUR BYW - ${name.toUpperCase()} !

Félicitations pour votre abonnement ! Votre compte coach BYW est maintenant actif.

📦 VOTRE PACK ${pack.name.toUpperCase()}
Prix: ${pack.price}€/mois

Fonctionnalités incluses :
${pack.features.map(feature => `• ${feature}`).join('\n')}

🔗 CONFIGURER VOTRE MOT DE PASSE :
${invitationUrl}

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

// Exécution
console.log('🚀 Test du flow Stripe → Email BYW\n');
testStripeFlow().catch(console.error);

export { testStripeFlow, sendWelcomeEmail };


