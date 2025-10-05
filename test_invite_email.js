import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://chrhxkcppvigxqlsxgqo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNocmh4a2NwcHZpZ3hxbHN4Z3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NDU1MTgsImV4cCI6MjA3MTMyMTUxOH0.bg0S85RYScZsfa0MGoyLyOtOdydu_YFDmDgMloWy3mg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInviteEmail() {
  console.log('🚀 Test d\'envoi d\'email d\'invitation pour henriprospecto123@gmail.com');
  
  try {
    // Créer l'utilisateur s'il n'existe pas
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: 'henriprospecto123@gmail.com',
      email_confirm: true,
      user_metadata: {
        name: 'Henri Prospecto',
        role: 'coach'
      }
    });

    if (createError) {
      console.error('❌ Erreur création utilisateur:', createError);
      return;
    }

    console.log('✅ Utilisateur créé:', newUser.user.id);

    // Créer le profil
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: newUser.user.id,
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
      });

    if (profileError) {
      console.error('❌ Erreur création profil:', profileError);
      return;
    }

    console.log('✅ Profil créé');

    // Envoyer l'email d'invitation
    const { error: inviteError } = await supabase.auth.admin.generateLink({
      type: 'invite',
      email: 'henriprospecto123@gmail.com',
      options: {
        redirectTo: 'http://localhost:5173/auth/accept-invitation'
      }
    });

    if (inviteError) {
      console.error('❌ Erreur envoi invitation:', inviteError);
    } else {
      console.log('✅ Email d\'invitation envoyé avec succès !');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testInviteEmail();
