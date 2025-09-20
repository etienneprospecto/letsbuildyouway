import React, { useState, useEffect } from 'react'
import { useAuth } from '../../providers/AuthProvider'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/button'

export const BillingTest: React.FC = () => {
  const { user } = useAuth()
  const [testResults, setTestResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runTest = async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      console.log('=== BILLING TEST ===')
      console.log('User ID:', user.id)
      console.log('User email:', user.email)

      // Test 1: Vérifier le profil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      console.log('Profile:', profile)
      console.log('Profile error:', profileError)

      // Test 2: Vérifier les clients
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('coach_id', user.id)

      console.log('Clients:', clients)
      console.log('Clients error:', clientsError)

      // Test 3: Vérifier les plans tarifaires
      const { data: plans, error: plansError } = await supabase
        .from('pricing_plans')
        .select('*')
        .eq('coach_id', user.id)

      console.log('Pricing plans:', plans)
      console.log('Pricing plans error:', plansError)

      setTestResults({
        user: { id: user.id, email: user.email },
        profile,
        profileError,
        clients,
        clientsError,
        plans,
        plansError
      })

    } catch (error) {
      console.error('Test error:', error)
      setTestResults({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Test de Connexion Billing</h3>
      
      <Button onClick={runTest} disabled={loading}>
        {loading ? 'Test en cours...' : 'Lancer le test'}
      </Button>

      {testResults && (
        <div className="mt-4 space-y-4">
          <div className="bg-gray-100 p-3 rounded">
            <h4 className="font-semibold">Résultats du test :</h4>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
