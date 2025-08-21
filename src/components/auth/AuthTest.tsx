import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export const AuthTest: React.FC = () => {
  const [status, setStatus] = useState<string>('Testing...');
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setStatus('Testing Supabase connection...');
      
      // Test 1: Vérifier la session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        setStatus(`Session error: ${sessionError.message}`);
        return;
      }
      
      setStatus(`Session: ${session ? 'Found' : 'None'}`);
      setUser(session?.user || null);
      
      if (session?.user) {
        // Test 2: Vérifier le profil
        setStatus('Fetching profile...');
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileError) {
          setStatus(`Profile error: ${profileError.message}`);
          return;
        }
        
        setProfile(profileData);
        setStatus('Profile found!');
      }
      
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    }
  };

  const testSignUp = async () => {
    try {
      setStatus('Testing signup...');
      
      const { data, error } = await supabase.auth.signUp({
        email: `test${Date.now()}@gmail.com`,
        password: 'testpassword123',
        options: {
          data: {
            first_name: 'Test',
            last_name: 'User',
            role: 'coach'
          }
        }
      });
      
      if (error) {
        setStatus(`Signup error: ${error.message}`);
        return;
      }
      
      setStatus(`Signup success: ${data.user?.id}`);
      setUser(data.user);
      
      // Attendre et vérifier le profil
      setTimeout(async () => {
        if (data.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
          
          setProfile(profileData);
          setStatus(`Profile created: ${profileData ? 'Yes' : 'No'}`);
        }
      }, 2000);
      
    } catch (error: any) {
      setStatus(`Signup error: ${error.message}`);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Auth Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <strong>Status:</strong> {status}
        </div>
        
        <button 
          onClick={testConnection}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Connection
        </button>
        
        <button 
          onClick={testSignUp}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ml-2"
        >
          Test Signup
        </button>
        
        {user && (
          <div className="p-4 bg-blue-50 rounded">
            <h3 className="font-bold">User:</h3>
            <pre className="text-sm">{JSON.stringify(user, null, 2)}</pre>
          </div>
        )}
        
        {profile && (
          <div className="p-4 bg-green-50 rounded">
            <h3 className="font-bold">Profile:</h3>
            <pre className="text-sm">{JSON.stringify(profile, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};
