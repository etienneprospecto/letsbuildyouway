import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

const ClientSeances: React.FC = () => {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mes séances</h1>
        <p className="text-muted-foreground">Séances programmées par ton coach</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Séance à venir</CardTitle>
            <CardDescription>Exemple de séance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">Programme détaillé (lecture seule)</div>
            <Button onClick={() => setOpen(true)}>Ouvrir la séance</Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Full Body du 23/12</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Programme par le coach (lecture seule)</p>
              <div className="rounded-md border p-3 text-sm">—</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm">Intensité ressentie: 5/10</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm">Humeur: 🙂</p>
              </div>
            </div>
            <Textarea placeholder="Commentaire libre" />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
              <Button>Valider ma séance</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ClientSeances


