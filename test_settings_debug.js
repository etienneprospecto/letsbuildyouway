// Script de debug pour tester la synchronisation Settings
// À exécuter dans la console du navigateur

console.log('🔍 Debug Settings - Test de synchronisation');

// Fonction pour tester la sauvegarde d'un profil coach
async function testCoachProfileSave() {
  console.log('🧪 Test sauvegarde profil coach...');
  
  try {
    // Simuler une mise à jour
    const { data, error } = await window.supabase
      .from('profiles')
      .update({
        first_name: 'Test Coach',
        last_name: 'Updated',
        phone: '0123456789',
        bio: 'Test bio',
        updated_at: new Date().toISOString()
      })
      .eq('role', 'coach')
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
async function testClientProfileSave() {
  console.log('🧪 Test sauvegarde profil client...');
  
  try {
    // Simuler une mise à jour
    const { data, error } = await window.supabase
      .from('clients')
      .update({
        first_name: 'Test Client',
        last_name: 'Updated',
        phone: '0987654321',
        age: 30,
        weight: 70.5,
        height: 175,
        primary_goal: 'Perte de poids',
        updated_at: new Date().toISOString()
      })
      .eq('id', (await window.supabase.from('clients').select('id').limit(1)).data?.[0]?.id)
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

// Fonction pour vérifier la structure des tables
async function checkTableStructure() {
  console.log('🔍 Vérification structure des tables...');
  
  try {
    // Vérifier profiles
    const { data: profiles, error: profilesError } = await window.supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ Erreur structure profiles:', profilesError);
    } else {
      console.log('✅ Structure profiles OK:', Object.keys(profiles[0] || {}));
    }

    // Vérifier clients
    const { data: clients, error: clientsError } = await window.supabase
      .from('clients')
      .select('*')
      .limit(1);
    
    if (clientsError) {
      console.log('❌ Erreur structure clients:', clientsError);
    } else {
      console.log('✅ Structure clients OK:', Object.keys(clients[0] || {}));
    }
  } catch (err) {
    console.log('❌ Erreur vérification structure:', err);
  }
}

// Fonction pour tester la récupération des données
async function testDataRetrieval() {
  console.log('🔍 Test récupération des données...');
  
  try {
    const { data: { user } } = await window.supabase.auth.getUser();
    
    if (user) {
      console.log('👤 Utilisateur connecté:', user.email);
      
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
    }
  } catch (err) {
    console.log('❌ Erreur récupération données:', err);
  }
}

// Exécuter tous les tests
async function runAllTests() {
  await checkTableStructure();
  await testDataRetrieval();
  await testCoachProfileSave();
  await testClientProfileSave();
  
  console.log('📋 Tests terminés. Vérifiez les résultats ci-dessus.');
}

// Lancer les tests
runAllTests();
