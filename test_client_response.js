// Script de test pour simuler une réponse client
// À exécuter dans la console du navigateur

console.log('🧪 Test de soumission de réponse client');

// Test: Simuler la soumission d'une réponse client
async function testClientResponseSubmission() {
  try {
    // 1. Trouver un feedback envoyé (status = 'sent')
    const { data: sentFeedbacks, error: sentError } = await supabase
      .from('feedbacks_hebdomadaires')
      .select('*')
      .eq('status', 'sent')
      .limit(1);
    
    if (sentError || !sentFeedbacks || sentFeedbacks.length === 0) {
      console.error('❌ Aucun feedback envoyé trouvé pour le test');
      return;
    }
    
    const feedback = sentFeedbacks[0];
    console.log('📋 Feedback trouvé pour le test:', feedback);
    
    // 2. Créer des réponses de test
    const testResponses = [
      {
        question_id: 'test-question-1',
        question_text: 'Comment vous sentez-vous cette semaine ?',
        question_type: 'text',
        response: 'Je me sens très bien, j\'ai beaucoup d\'énergie !'
      },
      {
        question_id: 'test-question-2',
        question_text: 'Évaluez votre motivation sur 10',
        question_type: 'scale_1_10',
        response: 8
      },
      {
        question_id: 'test-question-3',
        question_text: 'Quels exercices avez-vous préférés ?',
        question_type: 'multiple_choice',
        response: ['Squats', 'Pompes', 'Course à pied']
      }
    ];
    
    console.log('📝 Réponses de test à soumettre:', testResponses);
    
    // 3. Soumettre les réponses (simuler le comportement du client)
    const { error: updateError } = await supabase
      .from('feedbacks_hebdomadaires')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        responses: testResponses
      })
      .eq('id', feedback.id);
    
    if (updateError) {
      console.error('❌ Erreur soumission réponses:', updateError);
      return;
    }
    
    console.log('✅ Réponses soumises avec succès !');
    
    // 4. Vérifier que les réponses ont été sauvegardées
    const { data: updatedFeedback, error: verifyError } = await supabase
      .from('feedbacks_hebdomadaires')
      .select('*')
      .eq('id', feedback.id)
      .single();
    
    if (verifyError) {
      console.error('❌ Erreur vérification:', verifyError);
      return;
    }
    
    console.log('🔍 Feedback mis à jour:', updatedFeedback);
    console.log('📊 Réponses sauvegardées:', updatedFeedback.responses);
    console.log('📊 Statut:', updatedFeedback.status);
    console.log('📊 Date de completion:', updatedFeedback.completed_at);
    
    return updatedFeedback;
    
  } catch (err) {
    console.error('❌ Erreur test soumission:', err);
  }
}

// Test: Vérifier la récupération côté coach
async function testCoachRetrieval() {
  try {
    // Récupérer tous les feedbacks complétés
    const { data: completedFeedbacks, error } = await supabase
      .from('feedbacks_hebdomadaires')
      .select('*')
      .eq('status', 'completed')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Erreur récupération feedbacks complétés:', error);
      return;
    }
    
    console.log('👨‍💼 Récupération côté coach:');
    console.log('📊 Nombre de feedbacks complétés:', completedFeedbacks.length);
    
    completedFeedbacks.forEach(feedback => {
      console.log(`\n📋 Feedback ${feedback.id}:`, {
        status: feedback.status,
        responses: feedback.responses,
        responsesLength: feedback.responses?.length || 0,
        completed_at: feedback.completed_at
      });
    });
    
    return completedFeedbacks;
    
  } catch (err) {
    console.error('❌ Erreur test récupération coach:', err);
  }
}

// Exécuter les tests
async function runClientResponseTests() {
  console.log('🚀 Démarrage des tests de réponse client...');
  
  await testClientResponseSubmission();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await testCoachRetrieval();
  
  console.log('\n🎉 Tests de réponse client terminés !');
}

// Lancer les tests
runClientResponseTests();
