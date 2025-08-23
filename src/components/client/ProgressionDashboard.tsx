import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const ProgressionDashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ma progression</h1>
        <p className="text-muted-foreground">Graphiques, pesées et photos</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Graphique de progression</CardTitle>
            <CardDescription>Lecture seule</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-40 rounded-md border flex items-center justify-center text-sm text-muted-foreground">Graph placeholder</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ajouter une pesée</CardTitle>
            <CardDescription>Saisie rapide du poids</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Input type="number" placeholder="Poids (kg)" className="w-40" />
            <Button>Enregistrer</Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Photos de progression</CardTitle>
            <CardDescription>Upload par toi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-32 rounded-md border flex items-center justify-center text-sm text-muted-foreground">Galerie placeholder</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ProgressionDashboard


