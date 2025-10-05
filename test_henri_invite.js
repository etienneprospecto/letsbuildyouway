// Script pour envoyer un email d'invitation à Henri
const SUPABASE_URL = 'https://chrhxkcppvigxqlsxgqo.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNocmh4a2NwcHZpZ3hxbHN4Z3FvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTc0NTUxOCwiZXhwIjoyMDcxMzIxNTE4fQ.8QZqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq';

async function createUserAndSendInvite() {
  console.log('🚀 Création de l\'utilisateur Henri et envoi d\'invitation...');
  
  try {
    // 1. Créer l'utilisateur
    const createUserResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        email: 'henriprospecto123@gmail.com',
        email_confirm: true,
        user_metadata: {
          name: 'Henri Prospecto',
          role: 'coach'
        }
      })
    });

    const userData = await createUserResponse.json();
    
    if (!createUserResponse.ok) {
      console.error('❌ Erreur création utilisateur:', userData);
      return;
    }

    console.log('✅ Utilisateur créé:', userData.user.id);

    // 2. Créer le profil
    const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        id: userData.user.id,
        email: 'henriprospecto123@gmail.com',
        name: 'Henri Prospecto',
        role: 'coach',
        subscription_plan: 'transformationnel',
        stripe_customer_id: 'cus_test_henri',
        stripe_subscription_id: 'sub_test_henri',
        subscription_status: 'trialing',
        subscription_start_date: new Date().toISOString(),
        subscription_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        plan_limits: {
          max_clients: 50,
          timeline_weeks: 4,
          max_workouts: 50,
          max_exercises: 100,
          features: ['advanced_dashboard', 'voice_messaging', 'nutrition_tracking', 'advanced_feedbacks', 'progress_photos_history', 'trophies', 'shared_resources', 'payment_retries']
        }
      })
    });

    if (!profileResponse.ok) {
      const profileError = await profileResponse.text();
      console.error('❌ Erreur création profil:', profileError);
      return;
    }

    console.log('✅ Profil créé');

    // 3. Envoyer l'email d'invitation
    const inviteResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/generate_link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        type: 'invite',
        email: 'henriprospecto123@gmail.com',
        options: {
          redirectTo: 'http://localhost:5173/auth/accept-invitation'
        }
      })
    });

    const inviteData = await inviteResponse.json();
    
    if (!inviteResponse.ok) {
      console.error('❌ Erreur envoi invitation:', inviteData);
      return;
    }

    console.log('✅ Email d\'invitation envoyé avec succès !');
    console.log('📧 Vérifiez la boîte mail de henriprospecto123@gmail.com');
    console.log('🔗 Lien d\'invitation:', inviteData.properties?.action_link);

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

createUserAndSendInvite();
