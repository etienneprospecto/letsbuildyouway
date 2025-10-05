// ========================================
// SCRIPT DE DIAGNOSTIC EMAIL SYSTEM
// ========================================
// Ce script teste le système d'email complet

const { createClient } = require('@supabase/supabase-js');

// Configuration (à adapter selon votre environnement)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://votre-projet.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'votre_anon_key';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testEmailSystem() {
  console.log('🧪 ===== DIAGNOSTIC EMAIL SYSTEM =====');
  console.log('📧 URL Supabase:', SUPABASE_URL);
  console.log('🔑 Clé anonyme:', SUPABASE_ANON_KEY.substring(0, 20) + '...');
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('');

  try {
    // 1. Test de connexion Supabase
    console.log('1️⃣ Test de connexion Supabase...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, role')
      .limit(1);

    if (profilesError) {
      console.error('❌ Erreur connexion Supabase:', profilesError.message);
      return;
    }
    console.log('✅ Connexion Supabase OK');

    // 2. Test de l'Edge Function send-email-reliable
    console.log('');
    console.log('2️⃣ Test Edge Function send-email-reliable...');
    
    const testEmailData = {
      client_email: 'test@example.com',
      client_name: 'Test User',
      invitation_url: 'https://byw.app/?token=test-token-123',
      coach_name: 'Coach Test',
      type: 'client_invitation'
    };

    console.log('📦 Données de test:', JSON.stringify(testEmailData, null, 2));

    const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-email-reliable', {
      body: testEmailData
    });

    if (emailError) {
      console.error('❌ Erreur Edge Function:', emailError);
    } else {
      console.log('✅ Edge Function répond:', JSON.stringify(emailResult, null, 2));
    }

    // 3. Test de création d'invitation
    console.log('');
    console.log('3️⃣ Test création invitation...');
    
    const invitationData = {
      coach_id: 'test-coach-id',
      client_email: 'test@example.com',
      client_first_name: 'Test',
      client_last_name: 'User',
      client_phone: '+33123456789',
      client_primary_goal: 'general_fitness',
      client_fitness_level: 'beginner'
    };

    // Note: Ceci nécessitera une vraie table client_invitations
    console.log('📝 Données invitation:', JSON.stringify(invitationData, null, 2));
    console.log('⚠️ Note: La création d\'invitation nécessite une table client_invitations');

    // 4. Vérification des variables d'environnement
    console.log('');
    console.log('4️⃣ Vérification variables d\'environnement...');
    
    const requiredVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY',
      'RESEND_API_KEY',
      'FROM_EMAIL',
      'BASE_URL'
    ];

    requiredVars.forEach(varName => {
      const value = process.env[varName];
      if (value) {
        console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
      } else {
        console.log(`❌ ${varName}: NON DÉFINI`);
      }
    });

    console.log('');
    console.log('🎯 ===== RÉSUMÉ DU DIAGNOSTIC =====');
    console.log('✅ Connexion Supabase: OK');
    console.log(emailError ? '❌ Edge Function: ERREUR' : '✅ Edge Function: OK');
    console.log('⚠️ Variables d\'environnement: Vérifiez ci-dessus');
    console.log('');
    console.log('💡 PROCHAINES ÉTAPES:');
    console.log('1. Configurez les variables d\'environnement manquantes');
    console.log('2. Déployez l\'Edge Function send-email-reliable');
    console.log('3. Testez avec un vrai email');
    console.log('4. Vérifiez les logs Supabase');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le diagnostic
testEmailSystem().catch(console.error);
