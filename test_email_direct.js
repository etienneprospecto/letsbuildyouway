// ========================================
// TEST DIRECT DU SYSTÈME D'EMAIL
// ========================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://chrhxkcppvigxqlsxgqo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNocmh4a2NwcHZpZ3hxbHN4Z3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NDU1MTgsImV4cCI6MjA3MTMyMTUxOH0.bg0S85RYScZsfa0MGoyLyOtOdydu_YFDmDgMloWy3mg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testEmailSystem() {
  console.log('🧪 ===== TEST DIRECT SYSTÈME EMAIL =====');
  console.log('📧 URL Supabase:', SUPABASE_URL);
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
      console.log('');
      console.log('💡 SOLUTIONS:');
      console.log('1. Vérifiez que l\'Edge Function est déployée');
      console.log('2. Vérifiez les variables d\'environnement dans Supabase');
      console.log('3. Déployez manuellement via le dashboard Supabase');
    } else {
      console.log('✅ Edge Function répond:', JSON.stringify(emailResult, null, 2));
    }

    // 3. Test avec un vrai email (optionnel)
    console.log('');
    console.log('3️⃣ Test avec un vrai email (optionnel)...');
    console.log('💡 Pour tester avec un vrai email, modifiez testEmailData.client_email');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le test
testEmailSystem().catch(console.error);
