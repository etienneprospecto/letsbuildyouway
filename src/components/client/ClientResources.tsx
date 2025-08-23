import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const ClientResources: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mes ressources</h1>
        <p className="text-muted-foreground">Documents partagés par ton coach</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1,2,3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>Ressource {i}</CardTitle>
              <CardDescription>Catégorie — Alimentation</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between">
              <Button variant="secondary">Marquer comme lu</Button>
              <Button>Favori</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default ClientResources


