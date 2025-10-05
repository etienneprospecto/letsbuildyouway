import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://chrhxkcppvigxqlsxgqo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNocmh4a2NwcHZpZ3hxbHN4Z3FvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTc0NTUxOCwiZXhwIjoyMDcxMzIxNTE4fQ.bg0S85RYScZsfa0MGoyLyOtOdydu_YFDmDgMloWy3mg';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    // Créer l'utilisateur
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: 'team@propulseo-site.com',
      email_confirm: true,
      user_metadata: {
        name: 'Test Coach',
        role: 'coach'
      }
    });
    
    if (createError) {
      console.error('Error creating user:', createError);
      return;
    }
    
    console.log('User created successfully:', newUser.user.id);
    
    // Créer le profil
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: newUser.user.id,
        email: 'team@propulseo-site.com',
        name: 'Test Coach',
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
      });
    
    if (profileError) {
      console.error('Error creating profile:', profileError);
      return;
    }
    
    console.log('Profile created successfully');
    
    // Envoyer l'email d'invitation
    const { error: inviteError } = await supabase.auth.admin.generateLink({
      type: 'invite',
      email: 'team@propulseo-site.com',
      options: {
        redirectTo: 'http://localhost:5173/auth/accept-invitation'
      }
    });
    
    if (inviteError) {
      console.error('Error sending invitation email:', inviteError);
    } else {
      console.log('Invitation email sent successfully');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createTestUser();
