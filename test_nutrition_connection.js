const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase (remplacez par vos vraies clés)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testNutritionConnection() {
  console.log('🧪 Test de connexion à la base de données Nutrition...\n');

  try {
    // Test 1: Vérifier les tables de nutrition
    console.log('1. Vérification des tables de nutrition...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['nutrition_entries', 'nutrition_comments', 'nutrition_goals', 'hydration_tracking']);

    if (tablesError) {
      console.error('❌ Erreur lors de la vérification des tables:', tablesError.message);
      return;
    }

    const tableNames = tables.map(t => t.table_name);
    console.log('✅ Tables trouvées:', tableNames);

    // Test 2: Vérifier le bucket de stockage
    console.log('\n2. Vérification du bucket de stockage...');
    
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Erreur lors de la vérification des buckets:', bucketsError.message);
    } else {
      const nutritionBucket = buckets.find(b => b.name === 'nutrition-photos');
      if (nutritionBucket) {
        console.log('✅ Bucket nutrition-photos trouvé');
      } else {
        console.log('⚠️  Bucket nutrition-photos non trouvé');
      }
    }

    // Test 3: Vérifier les politiques RLS
    console.log('\n3. Vérification des politiques RLS...');
    
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('tablename, policyname')
      .in('tablename', ['nutrition_entries', 'nutrition_comments', 'nutrition_goals', 'hydration_tracking']);

    if (policiesError) {
      console.log('⚠️  Impossible de vérifier les politiques RLS:', policiesError.message);
    } else {
      console.log('✅ Politiques RLS trouvées:', policies.length);
    }

    // Test 4: Test d'insertion (si possible)
    console.log('\n4. Test d\'insertion...');
    
    // Note: Ce test nécessite une authentification
    console.log('ℹ️  Test d\'insertion nécessite une authentification utilisateur');

    console.log('\n🎉 Test de connexion terminé avec succès!');
    console.log('\n📋 Prochaines étapes:');
    console.log('1. Vérifiez que les clés Supabase sont correctes');
    console.log('2. Testez l\'authentification utilisateur');
    console.log('3. Testez l\'upload de photos');
    console.log('4. Testez les opérations CRUD sur les tables nutrition');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Exécuter le test
testNutritionConnection();
