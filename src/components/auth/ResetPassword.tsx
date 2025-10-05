import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const accessToken = searchParams.get('access_token')
  const refreshToken = searchParams.get('refresh_token')

  useEffect(() => {
    // Si on a les tokens, on peut directement connecter l'utilisateur
    if (accessToken && refreshToken) {
      handleAuthWithTokens()
    }
  }, [accessToken, refreshToken])

  const handleAuthWithTokens = async () => {
    try {
      // Utiliser les tokens pour s'authentifier
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      })

      if (error) {
        console.error('Error setting session:', error)
        setError('Session invalide. Veuillez demander un nouveau lien de réinitialisation.')
        return
      }

      if (data.user) {
        setMessage('Session restaurée ! Vous pouvez maintenant définir votre mot de passe.')
      }
    } catch (error: any) {
      console.error('Error authenticating:', error)
      setError('Erreur d\'authentification. Veuillez réessayer.')
    }
  }

  const handlePasswordReset = async () => {
    if (!password || !confirmPassword) {
      setError('Veuillez remplir tous les champs')
      return
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Si on a des tokens dans l'URL, les utiliser pour s'authentifier d'abord
      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        })

        if (sessionError) {
          throw new Error('Session invalide. Veuillez demander un nouveau lien.')
        }
      }

      // Mettre à jour le mot de passe
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) {
        throw updateError
      }

      setMessage('Mot de passe mis à jour avec succès ! Redirection...')
      
      // Rediriger vers le dashboard après 2 secondes
      setTimeout(() => {
        navigate('/app/dashboard')
      }, 2000)

    } catch (error: any) {
      console.error('Error updating password:', error)
      setError(error.message || 'Erreur lors de la mise à jour du mot de passe')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handlePasswordReset()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">
              Définir votre mot de passe
            </CardTitle>
            <p className="text-gray-400 mt-2">
              Bienvenue ! Définissez votre mot de passe pour accéder à votre compte coach.
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Nouveau mot de passe
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

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirmer le mot de passe
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmez votre mot de passe"
                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#fa7315] to-orange-600 hover:from-orange-600 hover:to-[#fa7315] text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  'Définir le mot de passe'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Vous avez déjà un compte ?{' '}
                <button
                  onClick={() => navigate('/app')}
                  className="text-[#fa7315] hover:text-orange-400 transition-colors"
                >
                  Se connecter
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
