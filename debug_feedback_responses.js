// Script de debug pour vérifier les réponses de feedback
// À exécuter dans la console du navigateur

console.log('🔍 Debug des réponses de feedback');

// Test 1: Vérifier tous les feedbacks
async function debugAllFeedbacks() {
  try {
    const { data: feedbacks, error } = await supabase
      .from('feedbacks_hebdomadaires')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Erreur récupération feedbacks:', error);
      return;
    }
    
    console.log('📊 Tous les feedbacks:', feedbacks);
    
    feedbacks.forEach(feedback => {
      console.log(`\n📋 Feedback ${feedback.id}:`, {
        status: feedback.status,
        client_id: feedback.client_id,
        coach_id: feedback.coach_id,
        week_start: feedback.week_start,
        week_end: feedback.week_end,
        responses: feedback.responses,
        responsesType: typeof feedback.responses,
        responsesLength: feedback.responses?.length || 0,
        completed_at: feedback.completed_at
      });
    });
    
    return feedbacks;
  } catch (err) {
    console.error('❌ Erreur debug feedbacks:', err);
  }
}

// Test 2: Vérifier les feedbacks complétés
async function debugCompletedFeedbacks() {
  try {
    const { data: feedbacks, error } = await supabase
      .from('feedbacks_hebdomadaires')
      .select('*')
      .eq('status', 'completed')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Erreur récupération feedbacks complétés:', error);
      return;
    }
    
    console.log('✅ Feedbacks complétés:', feedbacks);
    
    feedbacks.forEach(feedback => {
      console.log(`\n🎯 Feedback complété ${feedback.id}:`, {
        status: feedback.status,
        responses: feedback.responses,
        responsesLength: feedback.responses?.length || 0,
        completed_at: feedback.completed_at
      });
    });
    
    return feedbacks;
  } catch (err) {
    console.error('❌ Erreur debug feedbacks complétés:', err);
  }
}

// Test 3: Vérifier les réponses dans la table feedback_responses
async function debugFeedbackResponsesTable() {
  try {
    const { data: responses, error } = await supabase
      .from('feedback_responses')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Erreur récupération table feedback_responses:', error);
      return;
    }
    
    console.log('📝 Réponses dans la table feedback_responses:', responses);
    
    return responses;
  } catch (err) {
    console.error('❌ Erreur debug table feedback_responses:', err);
  }
}

// Exécuter tous les tests de debug
async function runDebugTests() {
  console.log('🚀 Démarrage des tests de debug...');
  
  await debugAllFeedbacks();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await debugCompletedFeedbacks();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await debugFeedbackResponsesTable();
  
  console.log('\n🎉 Tests de debug terminés !');
}

// Lancer les tests
runDebugTests();
