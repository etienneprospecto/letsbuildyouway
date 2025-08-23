import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

const ClientFeedbacks: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mes feedbacks</h1>
        <p className="text-muted-foreground">Questionnaires hebdomadaires</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Alimentation</CardTitle>
            <CardDescription>Note 1-10 et commentaire</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md border p-3 text-sm">Note: — / 10</div>
            <Textarea placeholder="Ressenti sur l'alimentation" />
            <div className="flex justify-end"><Button>Enregistrer</Button></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Style de vie</CardTitle>
            <CardDescription>Sommeil, stress, etc.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md border p-3 text-sm">Note: — / 10</div>
            <Textarea placeholder="Ressenti sur le style de vie" />
            <div className="flex justify-end"><Button>Enregistrer</Button></div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Ressentis généraux</CardTitle>
            <CardDescription>Motivation, énergie</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md border p-3 text-sm">Note: — / 10</div>
            <Textarea placeholder="Commentaire général" />
            <div className="flex justify-end"><Button>Enregistrer</Button></div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ClientFeedbacks


