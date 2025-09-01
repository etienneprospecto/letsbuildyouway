import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/providers/AuthProvider'
import { useClientCoachData } from '@/hooks/useClientCoachData'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'

interface ClientData {
  id: string
  first_name: string
  last_name: string
  age: number
  objective: string
  constraints: string
  equipment: string
  level: string
  mentality: string
  coaching_type: string
}

const EditableProfile: React.FC = () => {
  const { user } = useAuth()
  const { relation } = useClientCoachData()
  const [clientData, setClientData] = useState<ClientData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    age: '',
    objective: '',
    constraints: '',
    equipment: ''
  })

  // Récupérer les données du client
  useEffect(() => {
    const fetchClientData = async () => {
      if (!user?.email) return
      
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('email', user.email)
          .single()

        if (error) throw error

        setClientData(data)
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          age: data.age?.toString() || '',
          objective: data.objective || '',
          constraints: data.constraints || '',
          equipment: data.equipment || ''
        })
      } catch (error) {
        console.error('Erreur récupération données client:', error)
        toast({
          title: "Erreur",
          description: "Impossible de récupérer tes données",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchClientData()
  }, [user?.email])

  // Sauvegarder les modifications
  const handleSave = async () => {
    if (!clientData?.id) return
    
    setSaving(true)
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          age: parseInt(formData.age) || null,
          objective: formData.objective,
          constraints: formData.constraints,
          equipment: formData.equipment,
          updated_at: new Date().toISOString()
        })
        .eq('id', clientData.id)

      if (error) throw error

      toast({
        title: "Succès",
        description: "Profil mis à jour avec succès"
      })

      // Mettre à jour les données locales
      setClientData(prev => prev ? { ...prev, ...formData } : null)
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les modifications",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mon profil</h1>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mon profil</h1>
        <p className="text-muted-foreground">Gère tes informations personnelles et tes objectifs</p>
        {relation?.coach_email && (
          <p className="text-sm text-muted-foreground mt-2">
            Coaché par {relation.coach_email}
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
            <CardDescription>Ces informations sont visibles par ton coach</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prénom</Label>
                <Input 
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  placeholder="Paul" 
                />
              </div>
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input 
                  value={formData.last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  placeholder="F." 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  value={user?.email || ''} 
                  disabled 
                  placeholder="paulfst.business@gmail.com" 
                  type="email" 
                />
              </div>
              <div className="space-y-2">
                <Label>Âge</Label>
                <Input 
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  placeholder="32" 
                  type="number" 
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Objectifs et contraintes</CardTitle>
            <CardDescription>Modifiable par toi, visible par le coach</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Objectifs</Label>
              <Textarea 
                value={formData.objective}
                onChange={(e) => setFormData(prev => ({ ...prev, objective: e.target.value }))}
                placeholder="Perte de poids, prise de force, etc." 
              />
            </div>
            <div className="space-y-2">
              <Label>Contraintes / blessures</Label>
              <Textarea 
                value={formData.constraints}
                onChange={(e) => setFormData(prev => ({ ...prev, constraints: e.target.value }))}
                placeholder="Genou droit sensible, dos, etc." 
              />
            </div>
            <div className="space-y-2">
              <Label>Matériel disponible</Label>
              <Textarea 
                value={formData.equipment}
                onChange={(e) => setFormData(prev => ({ ...prev, equipment: e.target.value }))}
                placeholder="Haltères, élastiques, banc" 
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informations du coach</CardTitle>
            <CardDescription>Lecture seule — géré par ton coach</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Niveau assigné</p>
              <p className="text-lg font-medium">{clientData?.level || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Programme</p>
              <p className="text-lg font-medium">{clientData?.coaching_type || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mentalité</p>
              <p className="text-lg font-medium">{clientData?.mentality || '—'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default EditableProfile


