// Script de test pour vérifier le système de feedback
// À exécuter dans la console du navigateur

console.log('🧪 Test du système de feedback');

// Test 1: Vérifier la connexion Supabase
async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('feedbacks_hebdomadaires')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Erreur connexion Supabase:', error);
      return false;
    }
    
    console.log('✅ Connexion Supabase OK');
    return true;
  } catch (err) {
    console.error('❌ Erreur test connexion:', err);
    return false;
  }
}

// Test 2: Vérifier si le champ responses existe
async function testResponsesField() {
  try {
    const { data, error } = await supabase
      .from('feedbacks_hebdomadaires')
      .select('id, responses')
      .limit(1);
    
    if (error) {
      console.error('❌ Champ responses non trouvé:', error);
      return false;
    }
    
    console.log('✅ Champ responses existe');
    return true;
  } catch (err) {
    console.error('❌ Erreur test champ responses:', err);
    return false;
  }
}

// Test 3: Tester l'insertion d'une réponse
async function testInsertResponse() {
  try {
    // Trouver un feedback existant
    const { data: feedbacks, error: feedbackError } = await supabase
      .from('feedbacks_hebdomadaires')
      .select('id')
      .limit(1);
    
    if (feedbackError || !feedbacks || feedbacks.length === 0) {
      console.error('❌ Aucun feedback trouvé pour le test');
      return false;
    }
    
    const feedbackId = feedbacks[0].id;
    const testResponses = [
      {
        question_id: 'test-question-1',
        question_text: 'Question de test',
        question_type: 'text',
        response: 'Réponse de test'
      }
    ];
    
    const { error: updateError } = await supabase
      .from('feedbacks_hebdomadaires')
      .update({
        responses: testResponses,
        status: 'completed'
      })
      .eq('id', feedbackId);
    
    if (updateError) {
      console.error('❌ Erreur insertion réponse:', updateError);
      return false;
    }
    
    console.log('✅ Insertion réponse réussie');
    return true;
  } catch (err) {
    console.error('❌ Erreur test insertion:', err);
    return false;
  }
}

// Exécuter tous les tests
async function runAllTests() {
  console.log('🚀 Démarrage des tests...');
  
  const test1 = await testSupabaseConnection();
  const test2 = await testResponsesField();
  const test3 = await testInsertResponse();
  
  console.log('📊 Résultats des tests:');
  console.log('- Connexion Supabase:', test1 ? '✅' : '❌');
  console.log('- Champ responses:', test2 ? '✅' : '❌');
  console.log('- Insertion réponse:', test3 ? '✅' : '❌');
  
  if (test1 && test2 && test3) {
    console.log('🎉 Tous les tests sont passés !');
  } else {
    console.log('⚠️ Certains tests ont échoué');
  }
}

// Lancer les tests
runAllTests();
