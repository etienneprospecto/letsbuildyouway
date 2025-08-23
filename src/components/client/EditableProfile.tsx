import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const EditableProfile: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mon profil</h1>
        <p className="text-muted-foreground">Gère tes informations personnelles et tes objectifs</p>
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
                <Input placeholder="Paul" />
              </div>
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input placeholder="F." />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input placeholder="paulfst.business@gmail.com" type="email" />
              </div>
              <div className="space-y-2">
                <Label>Âge</Label>
                <Input placeholder="32" type="number" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button>Enregistrer</Button>
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
              <Textarea placeholder="Perte de poids, prise de force, etc." />
            </div>
            <div className="space-y-2">
              <Label>Contraintes / blessures</Label>
              <Textarea placeholder="Genou droit sensible, dos, etc." />
            </div>
            <div className="space-y-2">
              <Label>Matériel disponible</Label>
              <Textarea placeholder="Haltères, élastiques, banc" />
            </div>
            <div className="flex justify-end">
              <Button>Enregistrer</Button>
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
              <p className="text-lg font-medium">—</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Programme</p>
              <p className="text-lg font-medium">—</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Évaluations coach</p>
              <p className="text-lg font-medium">—</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default EditableProfile


