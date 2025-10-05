// Script pour créer manuellement l'utilisateur team@propulseo-site.com
// Ce script utilise l'API publique de Supabase

const SUPABASE_URL = 'https://chrhxkcppvigxqlsxgqo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNocmh4a2NwcHZpZ3hxbHN4Z3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NDU1MTgsImV4cCI6MjA3MTMyMTUxOH0.bg0S85RYScZsfa0MGoyLyOtOdydu_YFDmDgMloWy3mg';

async function createUserManually() {
  try {
    console.log('🚀 Création manuelle de l\'utilisateur team@propulseo-site.com');
    
    // Étape 1: Créer l'utilisateur via l'API Auth
    console.log('📧 Création de l\'utilisateur...');
    const signUpResponse = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        email: 'team@propulseo-site.com',
        password: 'TempPassword123!',
        data: {
          name: 'Coach Test',
          role: 'coach'
        }
      })
    });
    
    const signUpData = await signUpResponse.json();
    console.log('Réponse signup:', signUpData);
    
    if (signUpData.user) {
      console.log('✅ Utilisateur créé avec succès:', signUpData.user.id);
      
      // Étape 2: Créer le profil avec l'abonnement
      console.log('👤 Création du profil avec abonnement Warm-Up...');
      const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${signUpData.access_token}`
        },
        body: JSON.stringify({
          id: signUpData.user.id,
          email: 'team@propulseo-site.com',
          name: 'Coach Test',
          role: 'coach',
          subscription_plan: 'warm_up',
          stripe_customer_id: 'cus_test_1234567890',
          stripe_subscription_id: 'sub_test_1234567890',
          subscription_status: 'trialing',
          subscription_start_date: new Date().toISOString(),
          subscription_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          plan_limits: {
            max_clients: 15,
            timeline_weeks: 1,
            max_workouts: 15,
            max_exercises: 30,
            features: ['basic_dashboard', 'basic_messaging', 'simple_calendar', 'basic_client_dashboard', 'basic_settings_notifications']
          }
        })
      });
      
      const profileData = await profileResponse.json();
      console.log('Réponse profil:', profileData);
      
      if (profileResponse.ok) {
        console.log('✅ Profil créé avec succès');
        console.log('🎉 Utilisateur team@propulseo-site.com créé avec l\'abonnement Warm-Up');
        console.log('📧 Email: team@propulseo-site.com');
        console.log('🔑 Mot de passe temporaire: TempPassword123!');
        console.log('📅 Essai gratuit de 14 jours activé');
      } else {
        console.error('❌ Erreur lors de la création du profil:', profileData);
      }
      
    } else {
      console.error('❌ Erreur lors de la création de l\'utilisateur:', signUpData);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

createUserManually();
