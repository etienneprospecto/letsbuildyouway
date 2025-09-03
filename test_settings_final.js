// Script de test final pour vérifier la synchronisation Settings
// À exécuter dans la console du navigateur sur la page Settings

console.log('🧪 Test final de synchronisation Settings');

// Fonction pour tester la sauvegarde d'un profil coach
async function testCoachSettings() {
  console.log('🧪 Test sauvegarde profil coach...');
  
  try {
    const { data: { user } } = await window.supabase.auth.getUser();
    
    if (!user) {
      console.log('❌ Aucun utilisateur connecté');
      return;
    }
    
    console.log('👤 Utilisateur connecté:', user.email);
    
    // Test de mise à jour du profil coach
    const { data, error } = await window.supabase
      .from('profiles')
      .update({
        first_name: 'Etienne',
        last_name: 'Guimbard',
        phone: '0695321389',
        bio: 'Coach professionnel BYW - Test depuis l\'application',
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select();

    if (error) {
      console.log('❌ Erreur sauvegarde coach:', error);
    } else {
      console.log('✅ Sauvegarde coach réussie:', data);
    }
  } catch (err) {
    console.log('❌ Erreur générale coach:', err);
  }
}

// Fonction pour tester la sauvegarde d'un profil client
async function testClientSettings() {
  console.log('🧪 Test sauvegarde profil client...');
  
  try {
    const { data: { user } } = await window.supabase.auth.getUser();
    
    if (!user) {
      console.log('❌ Aucun utilisateur connecté');
      return;
    }
    
    console.log('👤 Utilisateur connecté:', user.email);
    
    // Test de mise à jour du profil client
    const { data, error } = await window.supabase
      .from('clients')
      .update({
        first_name: 'Test Client',
        last_name: 'Settings',
        phone: '0987654321',
        age: 30,
        weight: 70.5,
        height: 175,
        primary_goal: 'Test de synchronisation depuis l\'application',
        updated_at: new Date().toISOString()
      })
      .eq('contact', user.email)
      .select();

    if (error) {
      console.log('❌ Erreur sauvegarde client:', error);
    } else {
      console.log('✅ Sauvegarde client réussie:', data);
    }
  } catch (err) {
    console.log('❌ Erreur générale client:', err);
  }
}

// Fonction pour vérifier la récupération des données
async function testDataRetrieval() {
  console.log('🔍 Test récupération des données...');
  
  try {
    const { data: { user } } = await window.supabase.auth.getUser();
    
    if (!user) {
      console.log('❌ Aucun utilisateur connecté');
      return;
    }
    
    // Test récupération profil
    const { data: profile, error: profileError } = await window.supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.log('❌ Erreur récupération profil:', profileError);
    } else {
      console.log('✅ Profil récupéré:', profile);
    }
    
    // Test récupération client
    const { data: client, error: clientError } = await window.supabase
      .from('clients')
      .select('*')
      .eq('contact', user.email)
      .single();
    
    if (clientError) {
      console.log('❌ Erreur récupération client:', clientError);
    } else {
      console.log('✅ Client récupéré:', client);
    }
  } catch (err) {
    console.log('❌ Erreur récupération données:', err);
  }
}

// Fonction pour tester le changement de mot de passe
async function testPasswordChange() {
  console.log('🔒 Test changement de mot de passe...');
  
  try {
    const { data, error } = await window.supabase.auth.updateUser({
      password: 'newpassword123'
    });

    if (error) {
      console.log('❌ Erreur changement mot de passe:', error);
    } else {
      console.log('✅ Changement mot de passe réussi:', data);
    }
  } catch (err) {
    console.log('❌ Erreur générale mot de passe:', err);
  }
}

// Exécuter tous les tests
async function runAllTests() {
  console.log('🚀 Lancement des tests de synchronisation...');
  
  await testDataRetrieval();
  await testCoachSettings();
  await testClientSettings();
  // await testPasswordChange(); // Décommenter si vous voulez tester le changement de mot de passe
  
  console.log('📋 Tests terminés. Vérifiez les résultats ci-dessus.');
  console.log('💡 Si tous les tests sont ✅, la synchronisation Settings fonctionne !');
}

// Lancer les tests
runAllTests();
