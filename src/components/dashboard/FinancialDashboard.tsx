import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  AlertTriangle,
  Users,
  Calendar,
  BarChart3
} from 'lucide-react'
import { BillingService } from '../../services/billingService'

interface FinancialDashboardProps {
  coachId: string
}

export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ coachId }) => {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('12months')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    if (coachId) {
      loadFinancialStats()
    }
  }, [coachId, period, selectedYear])

  const loadFinancialStats = async () => {
    if (!coachId) return

    try {
      setLoading(true)
      const startDate = getStartDate()
      const endDate = getEndDate()
      
      const data = await BillingService.getCoachFinancialStats(coachId, startDate, endDate)
      setStats(data)
    } catch (error) {
      console.error('Error loading financial stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStartDate = () => {
    const now = new Date()
    switch (period) {
      case '1month':
        return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString()
      case '3months':
        return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()).toISOString()
      case '6months':
        return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()).toISOString()
      case '12months':
        return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).toISOString()
      case 'year':
        return new Date(selectedYear, 0, 1).toISOString()
      default:
        return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).toISOString()
    }
  }

  const getEndDate = () => {
    const now = new Date()
    switch (period) {
      case 'year':
        return new Date(selectedYear, 11, 31).toISOString()
      default:
        return now.toISOString()
    }
  }

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Aucune donnée financière disponible</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tableau de bord financier</h2>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">1 mois</SelectItem>
              <SelectItem value="3months">3 mois</SelectItem>
              <SelectItem value="6months">6 mois</SelectItem>
              <SelectItem value="12months">12 mois</SelectItem>
              <SelectItem value="year">Année</SelectItem>
            </SelectContent>
          </Select>
          {period === 'year' && (
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus totaux</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.total_revenue || 0)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {stats.revenue_growth >= 0 ? (
                <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
              )}
              <span className={stats.revenue_growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                {formatPercentage(stats.revenue_growth || 0)} vs période précédente
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus récurrents</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.recurring_revenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {((stats.recurring_revenue / stats.total_revenue) * 100 || 0).toFixed(1)}% du total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de paiement</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.payment_rate || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Paiements à temps
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Factures impayées</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.overdue_invoices || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.overdue_amount || 0)} en attente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution des revenus</CardTitle>
          <CardDescription>
            Revenus mensuels sur la période sélectionnée
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Graphique des revenus</p>
              <p className="text-sm text-gray-400">
                Intégration avec une bibliothèque de graphiques (Chart.js, Recharts, etc.)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Clients */}
      <Card>
        <CardHeader>
          <CardTitle>Top clients par revenus</CardTitle>
          <CardDescription>
            Vos clients les plus rentables
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.top_clients?.slice(0, 5).map((client: any, index: number) => (
              <div key={client.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">
                      {client.first_name} {client.last_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {client.invoice_count} facture(s)
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {formatCurrency(client.total_revenue)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {client.payment_rate?.toFixed(1)}% payé
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Service Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition par type de service</CardTitle>
          <CardDescription>
            Analyse des revenus par catégorie
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.service_breakdown?.map((service: any, index: number) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{service.name}</span>
                  <span className="font-semibold">
                    {formatCurrency(service.revenue)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(service.revenue / stats.total_revenue) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{service.invoice_count} facture(s)</span>
                  <span>{((service.revenue / stats.total_revenue) * 100).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Paiements par mois</CardTitle>
            <CardDescription>
              Évolution des paiements reçus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.monthly_payments?.slice(-6).map((month: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{month.month}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${(month.count / Math.max(...stats.monthly_payments.map((m: any) => m.count))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold w-12 text-right">
                      {month.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Moyens de paiement</CardTitle>
            <CardDescription>
              Répartition des paiements par méthode
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.payment_methods?.map((method: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm font-medium capitalize">
                    {method.method.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(method.count / Math.max(...stats.payment_methods.map((m: any) => m.count))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold w-12 text-right">
                      {method.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}