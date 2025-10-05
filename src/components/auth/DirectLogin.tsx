import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export const DirectLogin: React.FC = () => {
  const [email, setEmail] = useState('team@propulseo-site.com')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('Veuillez remplir tous les champs')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (loginError) {
        throw loginError
      }

      if (data.user) {
        setMessage('Connexion réussie ! Bienvenue coach ! Redirection vers le dashboard...')
        console.log('🚀 DirectLogin: Connexion réussie, redirection dans 1.5s')
        setTimeout(() => {
          console.log('🚀 DirectLogin: Redirection vers /app/dashboard')
          // Forcer un reload doux pour s'assurer que le contexte auth est à jour
          navigate('/app/dashboard')
        }, 800)
      }

    } catch (error: any) {
      console.error('Login error:', error)
      setError(error.message || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const handleSetPassword = async () => {
    if (!password) {
      setError('Veuillez entrer un mot de passe')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Utiliser l'API admin pour mettre à jour le mot de passe
      const response = await fetch('https://chrhxkcppvigxqlsxgqo.supabase.co/auth/v1/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNocmh4a2NwcHZpZ3hxbHN4Z3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NDU1MTgsImV4cCI6MjA3MTMyMTUxOH0.bg0S85RYScZsfa0MGoyLyOtOdydu_YFDmDgMloWy3mg',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNocmh4a2NwcHZpZ3hxbHN4Z3FvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTc0NTUxOCwiZXhwIjoyMDcxMzIxNTE4fQ.bg0S85RYScZsfa0MGoyLyOtOdydu_YFDmDgMloWy3mg'
        },
        body: JSON.stringify({
          email: 'team@propulseo-site.com',
          password: password
        })
      })

      if (response.ok) {
        setMessage('Mot de passe défini avec succès ! Vous pouvez maintenant vous connecter.')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.msg || 'Erreur lors de la définition du mot de passe')
      }

    } catch (error: any) {
      console.error('Error setting password:', error)
      setError(error.message || 'Erreur lors de la définition du mot de passe')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">
              Connexion Directe
            </CardTitle>
            <p className="text-gray-400 mt-2">
              Connectez-vous avec team@propulseo-site.com
            </p>
          </CardHeader>
          
          <CardContent>
            {message && (
              <Alert className="mb-4 border-green-500 bg-green-500/10">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-500">
                  {message}
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="mb-4 border-red-500 bg-red-500/10">
                <XCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-500">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                  disabled
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Mot de passe
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Entrez votre mot de passe"
                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#fa7315] to-orange-600 hover:from-orange-600 hover:to-[#fa7315] text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    'Se connecter'
                  )}
                </Button>

                <Button
                  type="button"
                  onClick={handleSetPassword}
                  disabled={loading}
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Définir le mot de passe
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
