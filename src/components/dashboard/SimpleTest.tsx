import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertTriangle, Info } from 'lucide-react'

const SimpleTest: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Test Simple</h1>
        <p className="text-muted-foreground">
          Page de test pour vérifier que l'application se charge correctement
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Test de Chargement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <span className="text-sm">Application chargée</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Composants UI</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button size="sm">Bouton Test</Button>
            <Badge variant="default">Badge Test</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Mode Sombre</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-info" />
              <span className="text-sm">Toggle dans la sidebar</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SimpleTest
