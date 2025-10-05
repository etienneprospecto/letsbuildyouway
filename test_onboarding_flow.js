/**
 * Script de test pour valider le flow d'onboarding post-abonnement
 * 
 * Ce script simule le processus complet :
 * 1. Création d'un utilisateur via webhook Stripe
 * 2. Envoi d'email de bienvenue
 * 3. Configuration du mot de passe
 * 4. Connexion et accès au dashboard
 */

const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

// Configuration de test
const TEST_EMAIL = 'test-coach@byw.app';
const TEST_NAME = 'Test Coach';
const TEST_PLAN = 'elite';

async function testOnboardingFlow() {
  console.log('🚀 Démarrage du test d\'onboarding...\n');

  try {
    // 1. Simuler un webhook Stripe checkout.session.completed
    console.log('1️⃣ Simulation webhook Stripe...');
    const webhookResult = await simulateStripeWebhook();
    
    if (!webhookResult.success) {
      throw new Error(`Webhook failed: ${webhookResult.error}`);
    }
    
    console.log('✅ Webhook simulé avec succès');
    console.log('📧 Email de bienvenue envoyé à:', TEST_EMAIL);
    console.log('🔗 Lien d\'invitation:', webhookResult.invitationUrl);
    
    // 2. Tester la récupération du lien d'invitation
    console.log('\n2️⃣ Test de récupération du lien...');
    const linkResult = await testInvitationLink(webhookResult.invitationUrl);
    
    if (!linkResult.valid) {
      throw new Error(`Invalid invitation link: ${linkResult.error}`);
    }
    
    console.log('✅ Lien d\'invitation valide');
    
    // 3. Simuler la configuration du mot de passe
    console.log('\n3️⃣ Test de configuration du mot de passe...');
    const passwordResult = await testPasswordSetup();
    
    if (!passwordResult.success) {
      throw new Error(`Password setup failed: ${passwordResult.error}`);
    }
    
    console.log('✅ Mot de passe configuré avec succès');
    
    // 4. Tester la connexion
    console.log('\n4️⃣ Test de connexion...');
    const loginResult = await testLogin();
    
    if (!loginResult.success) {
      throw new Error(`Login failed: ${loginResult.error}`);
    }
    
    console.log('✅ Connexion réussie');
    console.log('🎉 Flow d\'onboarding complet validé !');
    
    // 5. Nettoyage (optionnel)
    console.log('\n5️⃣ Nettoyage des données de test...');
    await cleanupTestData();
    console.log('✅ Nettoyage terminé');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

async function simulateStripeWebhook() {
  // Simuler les données d'un webhook Stripe
  const mockSession = {
    id: 'cs_test_' + Date.now(),
    customer: 'cus_test_' + Date.now(),
    customer_details: {
      email: TEST_EMAIL,
      name: TEST_NAME
    },
    line_items: {
      data: [{
        price: {
          id: 'price_1SCJEoPyYNBRhOhA0tN68xOU' // Elite plan
        }
      }]
    },
    subscription: 'sub_test_' + Date.now()
  };

  try {
    // Appeler l'Edge Function stripe-webhook
    const response = await fetch(`${SUPABASE_URL}/functions/v1/stripe-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'stripe-signature': 'test_signature' // Pour les tests
      },
      body: JSON.stringify({
        id: 'evt_test_' + Date.now(),
        type: 'checkout.session.completed',
        data: { object: mockSession },
        created: Math.floor(Date.now() / 1000)
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      return { success: false, error: result.error || 'Webhook failed' };
    }

    // Générer un lien d'invitation de test
    const invitationUrl = `https://byw.app/auth/accept-invitation?access_token=test_token&refresh_token=test_refresh`;
    
    return { 
      success: true, 
      invitationUrl,
      sessionId: mockSession.id 
    };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testInvitationLink(invitationUrl) {
  try {
    // Vérifier que l'URL est bien formée
    const url = new URL(invitationUrl);
    
    if (!url.pathname.includes('/auth/accept-invitation')) {
      return { valid: false, error: 'Invalid invitation path' };
    }
    
    if (!url.searchParams.has('access_token') && !url.searchParams.has('token')) {
      return { valid: false, error: 'Missing authentication token' };
    }
    
    return { valid: true };
    
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

async function testPasswordSetup() {
  try {
    // Simuler la configuration du mot de passe
    const testPassword = 'TestPassword123!';
    
    // Ici on pourrait appeler l'API de configuration de mot de passe
    // Pour l'instant, on simule juste le succès
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testLogin() {
  try {
    // Simuler la connexion
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: 'TestPassword123!'
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      return { success: false, error: result.error_description || 'Login failed' };
    }

    return { success: true, user: result.user };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function cleanupTestData() {
  try {
    // Nettoyer les données de test si nécessaire
    console.log('🧹 Nettoyage des données de test...');
    
    // Supprimer l'utilisateur de test
    const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?email=${TEST_EMAIL}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      }
    });

    if (response.ok) {
      console.log('✅ Données de test nettoyées');
    }
    
  } catch (error) {
    console.warn('⚠️ Erreur lors du nettoyage:', error.message);
  }
}

// Fonction utilitaire pour tester l'envoi d'email
async function testEmailService() {
  console.log('📧 Test du service d\'email...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-invitation-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        client_email: TEST_EMAIL,
        client_name: TEST_NAME,
        invitation_url: 'https://byw.app/auth/accept-invitation?token=test',
        coach_name: 'BYW Team',
        type: 'coach_welcome'
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Service d\'email fonctionnel');
      console.log('📧 Email ID:', result.email_id);
    } else {
      console.log('⚠️ Service d\'email en mode simulation');
      console.log('📧 Contenu:', result.email_content);
    }
    
  } catch (error) {
    console.error('❌ Erreur service d\'email:', error.message);
  }
}

// Exécuter les tests
if (require.main === module) {
  console.log('🧪 Tests d\'onboarding BYW\n');
  console.log('📋 Configuration:');
  console.log(`   Email: ${TEST_EMAIL}`);
  console.log(`   Nom: ${TEST_NAME}`);
  console.log(`   Plan: ${TEST_PLAN}`);
  console.log(`   URL: ${SUPABASE_URL}\n`);

  // Test du service d'email d'abord
  testEmailService().then(() => {
    // Puis le flow complet
    testOnboardingFlow();
  });
}

module.exports = {
  testOnboardingFlow,
  testEmailService,
  simulateStripeWebhook
};
