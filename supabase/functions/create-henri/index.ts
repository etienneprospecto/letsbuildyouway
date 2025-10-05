import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('PROJECT_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const email = 'henriprospecto123@gmail.com';
    const password = 'password123';

    console.log('Creating user with admin API...');

    // 1. Create user with admin API
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Skip email confirmation
      user_metadata: {
        name: 'Henri Prospecto',
        role: 'coach'
      }
    });

    if (createError || !newUser.user) {
      console.error('Error creating user:', createError);
      return new Response(JSON.stringify({
        error: 'Failed to create user',
        details: createError?.message
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    console.log('User created:', newUser.user.id);

    // 2. Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: newUser.user.id,
        email: email,
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
          features: [
            'advanced_dashboard',
            'voice_messaging',
            'nutrition_tracking',
            'advanced_feedbacks',
            'progress_photos_history',
            'trophies',
            'shared_resources',
            'payment_retries'
          ]
        }
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      return new Response(JSON.stringify({
        error: 'Failed to create profile',
        details: profileError.message
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    console.log('Profile created successfully');

    // 3. Generate login link
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: 'https://byw.app/app/dashboard'
      }
    });

    if (linkError) {
      console.error('Error generating login link:', linkError);
      return new Response(JSON.stringify({
        error: 'Failed to generate login link',
        details: linkError.message
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'User created successfully',
      user: {
        id: newUser.user.id,
        email: newUser.user.email
      },
      loginLink: linkData.properties.action_link
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
