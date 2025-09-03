// Script de test pour vérifier la connexion Supabase avec les Settings
// À exécuter dans la console du navigateur sur la page Settings

console.log('🧪 Test de connexion Supabase pour les Settings');

// Test 1: Vérifier que Supabase est accessible
if (typeof window.supabase !== 'undefined') {
  console.log('✅ Supabase est accessible');
} else {
  console.log('❌ Supabase n\'est pas accessible');
}

// Test 2: Vérifier les tables profiles et clients
async function testTables() {
  try {
    // Test table profiles
    const { data: profiles, error: profilesError } = await window.supabase
      .from('profiles')
      .select('id, first_name, last_name, phone, bio, updated_at')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ Erreur table profiles:', profilesError);
    } else {
      console.log('✅ Table profiles accessible:', profiles);
    }

    // Test table clients
    const { data: clients, error: clientsError } = await window.supabase
      .from('clients')
      .select('id, first_name, last_name, contact, phone, age, weight, height, primary_goal, updated_at')
      .limit(1);
    
    if (clientsError) {
      console.log('❌ Erreur table clients:', clientsError);
    } else {
      console.log('✅ Table clients accessible:', clients);
    }

  } catch (error) {
    console.log('❌ Erreur générale:', error);
  }
}

// Test 3: Vérifier l'authentification
async function testAuth() {
  try {
    const { data: { user }, error } = await window.supabase.auth.getUser();
    
    if (error) {
      console.log('❌ Erreur auth:', error);
    } else {
      console.log('✅ Utilisateur connecté:', user);
    }
  } catch (error) {
    console.log('❌ Erreur auth générale:', error);
  }
}

// Exécuter les tests
testTables();
testAuth();

console.log('📋 Instructions pour tester manuellement:');
console.log('1. Allez sur la page Settings (coach ou client)');
console.log('2. Modifiez une information (nom, téléphone, etc.)');
console.log('3. Cliquez sur "Sauvegarder"');
console.log('4. Vérifiez que le toast de succès s\'affiche');
console.log('5. Rafraîchissez la page et vérifiez que les modifications persistent');
