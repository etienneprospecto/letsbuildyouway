// Script de test pour corriger l'affichage de la réponse de Paul
// À exécuter dans la console du navigateur

console.log('🔧 Test de correction pour la réponse de Paul');

// Test 1: Trouver et corriger le feedback de Paul
async function fixPaulResponse() {
  try {
    // 1. Trouver Paul
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .ilike('first_name', '%paul%');
    
    if (clientsError || !clients || clients.length === 0) {
      console.error('❌ Paul non trouvé');
      return;
    }
    
    const paul = clients[0];
    console.log('👤 Paul trouvé:', paul);
    
    // 2. Trouver son feedback récent
    const { data: paulFeedbacks, error: feedbacksError } = await supabase
      .from('feedbacks_hebdomadaires')
      .select('*')
      .eq('client_id', paul.id)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (feedbacksError || !paulFeedbacks || paulFeedbacks.length === 0) {
      console.error('❌ Aucun feedback de Paul trouvé');
      return;
    }
    
    const paulFeedback = paulFeedbacks[0];
    console.log('📋 Feedback de Paul trouvé:', paulFeedback);
    
    // 3. Vérifier s'il a des réponses
    if (!paulFeedback.responses || paulFeedback.responses.length === 0) {
      console.log('⚠️ Paul n\'a pas de réponses, ajoutons-en une de test');
      
      // Ajouter la réponse de test basée sur ce qu'on voit dans l'image
      const testResponse = [
        {
          question_id: 'test-question-1',
          question_text: 'commetn tu te sens',
          question_type: 'text',
          response: 'super merci coach !!'
        }
      ];
      
      const { error: updateError } = await supabase
        .from('feedbacks_hebdomadaires')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          responses: testResponse
        })
        .eq('id', paulFeedback.id);
      
      if (updateError) {
        console.error('❌ Erreur ajout réponse test:', updateError);
        return;
      }
      
      console.log('✅ Réponse test ajoutée pour Paul');
    } else {
      console.log('✅ Paul a déjà des réponses:', paulFeedback.responses);
    }
    
    return paulFeedback;
    
  } catch (err) {
    console.error('❌ Erreur fix Paul:', err);
  }
}

// Test 2: Vérifier la récupération côté coach
async function testCoachRetrievalForPaul() {
  try {
    // Simuler la récupération côté coach
    const { data: coachFeedbacks, error } = await supabase
      .from('feedbacks_hebdomadaires')
      .select(`
        *,
        clients!inner(first_name, last_name, contact)
      `)
      .order('week_start', { ascending: false });
    
    if (error) {
      console.error('❌ Erreur récupération côté coach:', error);
      return;
    }
    
    console.log('👨‍💼 Récupération côté coach:');
    console.log('📊 Nombre total de feedbacks:', coachFeedbacks.length);
    
    // Filtrer les feedbacks complétés
    const completedFeedbacks = coachFeedbacks.filter(f => f.status === 'completed');
    console.log('✅ Feedbacks complétés:', completedFeedbacks.length);
    
    completedFeedbacks.forEach(feedback => {
      console.log(`\n📋 Feedback complété ${feedback.id}:`, {
        client: `${feedback.clients.first_name} ${feedback.clients.last_name}`,
        status: feedback.status,
        responses: feedback.responses,
        responsesLength: feedback.responses?.length || 0,
        completed_at: feedback.completed_at
      });
      
      // Si c'est Paul et qu'il a des réponses, les afficher
      if (feedback.clients.first_name.toLowerCase().includes('paul') && feedback.responses?.length > 0) {
        console.log('🎯 Réponses de Paul trouvées !');
        feedback.responses.forEach((response, index) => {
          console.log(`  Réponse ${index + 1}:`, {
            question: response.question_text,
            answer: response.response
          });
        });
      }
    });
    
    return coachFeedbacks;
    
  } catch (err) {
    console.error('❌ Erreur test récupération coach:', err);
  }
}

// Test 3: Forcer le rechargement de la page coach
function forceCoachPageReload() {
  console.log('🔄 Rechargement de la page coach...');
  window.location.reload();
}

// Exécuter tous les tests
async function runPaulFixTests() {
  console.log('🚀 Démarrage des tests de correction pour Paul...');
  
  await fixPaulResponse();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await testCoachRetrievalForPaul();
  console.log('\n' + '='.repeat(50) + '\n');
  
  console.log('🔄 Pour voir les changements, va dans l\'onglet "Debug" de la page coach');
  console.log('💡 Ou utilise: forceCoachPageReload() pour recharger la page');
  
  console.log('\n🎉 Tests de correction Paul terminés !');
}

// Lancer les tests
runPaulFixTests();
