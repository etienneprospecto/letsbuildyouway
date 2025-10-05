import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card, CardContent } from '../components/ui/card';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';

interface StripeSession {
  id: string;
  customer_details: {
    email: string;
    name: string;
  };
  line_items: {
    data: Array<{
      price: {
        id: string;
      };
    }>;
  };
  customer: string;
  subscription: string;
}

export const SetupAccountPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [coachEmail, setCoachEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    console.log('🔍 Session ID:', sessionId);
    
    if (!sessionId) {
      setStatus('error');
      setMessage('Session ID manquant');
      return;
    }

    processPayment(sessionId);
  }, [searchParams]);

  const processPayment = async (sessionId: string) => {
    try {
      console.log('🔄 Processing payment for session:', sessionId);
      setMessage('Récupération des détails du paiement...');

      // 1. Récupérer les détails de la session Stripe
      const { data: sessionData, error: sessionError } = await supabase.functions.invoke('get-stripe-session', {
        body: { sessionId }
      });

      if (sessionError || !sessionData) {
        throw new Error('Impossible de récupérer les détails du paiement');
      }

      const session: StripeSession = sessionData.session;
      console.log('📋 Session details:', session);

      const customerEmail = session.customer_details?.email;
      const customerName = session.customer_details?.name || 'Coach';
      const planId = session.line_items?.data[0]?.price?.id;

      if (!customerEmail) {
        throw new Error('Email client manquant');
      }

      setCoachEmail(customerEmail);
      setMessage('Création du compte coach...');

      // 2. Vérifier si l'utilisateur existe déjà
      const { data: existingUser, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', customerEmail)
        .single();

      if (existingUser && !userError) {
        setMessage('Compte existant trouvé, mise à jour de l\'abonnement...');
        await updateExistingUser(existingUser.id, session);
      } else {
        setMessage('Création du nouveau compte...');
        await createNewCoach(customerEmail, customerName, planId, session);
      }

      setStatus('success');
      setMessage('Compte créé avec succès ! Vérifiez votre email pour vos identifiants.');

    } catch (error: any) {
      console.error('❌ Error processing payment:', error);
      setStatus('error');
      setMessage(`Erreur: ${error.message}`);
    }
  };

  const createNewCoach = async (email: string, name: string, planId: string, session: StripeSession) => {
    // SOLUTION RADICALE : Créer directement avec signUp
    console.log('🚀 Creating coach directly with signUp...');
    
    const tempPassword = generateSecurePassword();
    setTempPassword(tempPassword);
    
    // 1. Créer l'utilisateur avec signUp
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: tempPassword,
      options: {
        data: {
          name: name,
          role: 'coach'
        }
      }
    });

    if (authError) {
      throw new Error(`Erreur création utilisateur: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error('Erreur: Utilisateur non créé');
    }

    console.log('✅ User created:', authData.user.id);

    // 2. Créer le profil
    const plan = getPlanFromPriceId(planId);
    const limits = getPlanLimits(plan);

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: email,
        first_name: name.split(' ')[0] || name,
        last_name: name.split(' ').slice(1).join(' ') || '',
        role: 'coach',
        subscription_plan: plan,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        subscription_status: 'trialing',
        subscription_start_date: new Date().toISOString(),
        subscription_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        plan_limits: limits
      });

    if (profileError) {
      throw new Error(`Erreur création profil: ${profileError.message}`);
    }

    console.log('✅ Profile created for plan:', plan);

    // 3. Envoyer l'email de bienvenue
    try {
      const baseUrl = 'http://localhost:5175';
      const loginUrl = `${baseUrl}/auth/direct-login`;

      const emailPayload = {
        client_email: email,
        client_name: name,
        temp_password: tempPassword,
        login_url: loginUrl,
        plan_name: plan,
        coach_name: 'BYW Team',
        type: 'coach_welcome_with_password'
      };

      const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-email-reliable', {
        body: emailPayload
      });

      if (emailError) {
        console.error('❌ Error sending email:', emailError);
      } else {
        console.log('✅ Email sent successfully');
      }
    } catch (emailError: any) {
      console.error('❌ Error calling email service:', emailError);
    }
  };

  const updateExistingUser = async (userId: string, session: StripeSession) => {
    const plan = getPlanFromPriceId(session.line_items?.data[0]?.price?.id || '');
    const limits = getPlanLimits(plan);

    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_plan: plan,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        subscription_status: 'active',
        plan_limits: limits
      })
      .eq('id', userId);

    if (error) {
      throw new Error(`Erreur mise à jour: ${error.message}`);
    }
  };

  const sendWelcomeEmail = async (email: string, name: string, password: string, plan: string) => {
    try {
      const baseUrl = window.location.origin;
      const loginUrl = `${baseUrl}/login`;

      const { error } = await supabase.functions.invoke('send-email-reliable', {
        body: {
          client_email: email,
          client_name: name,
          temp_password: password,
          login_url: loginUrl,
          plan_name: plan,
          coach_name: 'BYW Team',
          type: 'coach_welcome_with_password'
        }
      });

      if (error) {
        console.error('Email error:', error);
      }
    } catch (error) {
      console.error('Email sending failed:', error);
    }
  };

  const generateSecurePassword = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const getPlanFromPriceId = (priceId: string): string => {
    console.log('🔍 Mapping priceId:', priceId);
    
    // Mapping basé sur les vrais Price IDs de tes Stripe Buy Buttons
    const planMapping: { [key: string]: string } = {
      // Warm-up
      'price_1SCJ9WPyYNBRhOhApONh7U6A': 'warm_up',
      // Transformationnel  
      'price_1SCJEXPyYNBRhOhAb64UZYVo': 'transformationnel',
      // Elite
      'price_1SCJEoPyYNBRhOhA0tN68xOU': 'elite'
    };
    
    const plan = planMapping[priceId] || 'warm_up';
    console.log('✅ Mapped plan:', plan);
    return plan;
  };

  const getPlanLimits = (plan: string): any => {
    const limits = {
      warm_up: {
        max_clients: 15,
        max_workouts: 15,
        max_exercises: 30,
        timeline_weeks: 1,
        features: ['basic_dashboard', 'client_management', 'messaging', 'calendar']
      },
      transformationnel: {
        max_clients: 50,
        max_workouts: 50,
        max_exercises: 100,
        timeline_weeks: 4,
        features: ['advanced_dashboard', 'client_management', 'messaging', 'calendar', 'nutrition_tracking']
      },
      elite: {
        max_clients: 100,
        max_workouts: -1, // illimité
        max_exercises: -1, // illimité
        timeline_weeks: 52,
        features: ['premium_dashboard', 'client_management', 'advanced_messaging', 'calendar', 'nutrition_ai', 'gamification']
      }
    };
    return limits[plan] || limits.warm_up;
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border-gray-700">
        <CardContent className="p-8 text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="w-12 h-12 text-[#fa7315] animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-bebas text-white mb-4">Configuration du compte</h2>
              <p className="text-gray-300 mb-6">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bebas text-white mb-4">Compte créé !</h2>
              <p className="text-gray-300 mb-6">
                Votre compte coach a été créé avec succès. 
                Vous devriez recevoir un email avec vos identifiants de connexion.
              </p>
              {tempPassword && (
                <div className="bg-gray-800 p-4 rounded-lg mb-6">
                  <p className="text-sm text-gray-400 mb-2">Mot de passe temporaire :</p>
                  <code className="text-[#fa7315] font-mono">{tempPassword}</code>
                </div>
              )}
              <button
                onClick={() => navigate('/auth/direct-login')}
                className="w-full bg-gradient-to-r from-[#fa7315] to-orange-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-orange-600 hover:to-[#fa7315] transition-all duration-300"
              >
                Se connecter maintenant
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bebas text-white mb-4">Erreur</h2>
              <p className="text-gray-300 mb-6">{message}</p>
              <button
                onClick={() => navigate('/pricing')}
                className="w-full bg-gray-800 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-all duration-300"
              >
                Retour aux tarifs
              </button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};