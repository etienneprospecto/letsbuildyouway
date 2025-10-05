/**
 * Test simple du service d'email
 * Ce script teste directement l'Edge Function send-invitation-email
 */

// Configuration - REMPLACEZ par vos vraies valeurs
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

// Clé Resend configurée dans Supabase
const RESEND_API_KEY = 're_FJzQiko6_3kNowwWrRBFXSggQXW9Kt5Ni';

async function testEmailService() {
  console.log('🧪 Test du service d\'email...\n');

  try {
    // Test 1: Email de bienvenue coach
    console.log('1️⃣ Test email de bienvenue coach...');
    const coachEmailResult = await sendTestEmail({
      client_email: 'test-coach@byw.app',
      client_name: 'Test Coach',
      invitation_url: 'https://byw.app/auth/accept-invitation?token=test123',
      coach_name: 'BYW Team',
      type: 'coach_welcome'
    });

    if (coachEmailResult.success) {
      console.log('✅ Email coach envoyé avec succès');
      console.log('📧 Email ID:', coachEmailResult.email_id);
      console.log('📄 Contenu:', coachEmailResult.email_content.substring(0, 200) + '...');
    } else {
      console.log('❌ Erreur email coach:', coachEmailResult.error);
    }

    console.log('\n2️⃣ Test email d\'invitation client...');
    const clientEmailResult = await sendTestEmail({
      client_email: 'test-client@byw.app',
      client_name: 'Test Client',
      invitation_url: 'https://byw.app/auth/accept-invitation?token=client123',
      coach_name: 'Test Coach',
      type: 'client_invitation'
    });

    if (clientEmailResult.success) {
      console.log('✅ Email client envoyé avec succès');
      console.log('📧 Email ID:', clientEmailResult.email_id);
    } else {
      console.log('❌ Erreur email client:', clientEmailResult.error);
    }

    console.log('\n🎉 Tests terminés !');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

async function sendTestEmail(emailData) {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-invitation-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(emailData)
    });

    const result = await response.json();

    if (!response.ok) {
      return { 
        success: false, 
        error: result.error || `HTTP ${response.status}: ${response.statusText}` 
      };
    }

    return result;

  } catch (error) {
    return { 
      success: false, 
      error: error.message 
    };
  }
}

// Test direct de l'Edge Function (sans Supabase)
async function testDirectFunction() {
  console.log('🔧 Test direct de l\'Edge Function...\n');

  const testData = {
    client_email: 'direct-test@byw.app',
    client_name: 'Direct Test',
    invitation_url: 'https://byw.app/auth/accept-invitation?token=direct123',
    coach_name: 'BYW Team',
    type: 'coach_welcome'
  };

  try {
    // Simuler l'appel direct à l'Edge Function
    const response = await fetch('http://localhost:54321/functions/v1/send-invitation-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    console.log('📊 Réponse:', {
      status: response.status,
      success: result.success,
      message: result.message,
      email_id: result.email_id
    });

    if (result.email_content) {
      console.log('📧 Contenu email:');
      console.log(result.email_content);
    }

  } catch (error) {
    console.error('❌ Erreur test direct:', error.message);
    console.log('💡 Assurez-vous que Supabase est démarré localement:');
    console.log('   supabase start');
  }
}

// Fonction pour tester avec curl (alternative)
function generateCurlCommand() {
  const testData = {
    client_email: 'curl-test@byw.app',
    client_name: 'Curl Test',
    invitation_url: 'https://byw.app/auth/accept-invitation?token=curl123',
    coach_name: 'BYW Team',
    type: 'coach_welcome'
  };

  console.log('🔧 Commande curl pour tester:');
  console.log(`
curl -X POST '${SUPABASE_URL}/functions/v1/send-invitation-email' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer ${SUPABASE_ANON_KEY}' \\
  -d '${JSON.stringify(testData, null, 2)}'
  `);
}

// Exécution
if (require.main === module) {
  console.log('📧 Test du service d\'email BYW\n');
  
  // Vérifier la configuration
  if (SUPABASE_URL.includes('your-project') || SUPABASE_ANON_KEY.includes('your-anon-key')) {
    console.log('⚠️  Configuration requise:');
    console.log('   1. Ouvrez ce fichier');
    console.log('   2. Remplacez SUPABASE_URL et SUPABASE_ANON_KEY');
    console.log('   3. Relancez le test\n');
    
    generateCurlCommand();
    return;
  }

  // Lancer les tests
  testEmailService().then(() => {
    console.log('\n' + '='.repeat(50));
    testDirectFunction();
  });
}

module.exports = { testEmailService, sendTestEmail };
