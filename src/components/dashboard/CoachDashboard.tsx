import React from 'react'
import { motion } from 'framer-motion'
import { Users, TrendingUp, AlertTriangle, Calendar, Plus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { useClientStore } from '@/store/clientStore'
import { getInitials, formatDate } from '@/lib/utils'

const CoachDashboard: React.FC = () => {
  const { clients, getClientsNeedingAttention } = useClientStore()
  
  const clientsNeedingAttention = getClientsNeedingAttention()
  const averageProgress = clients.length > 0 
    ? Math.round(clients.reduce((sum, client) => sum + client.progressPercentage, 0) / clients.length)
    : 0

  const metrics = [
    {
      title: 'Active Clients',
      value: clients.length,
      change: clients.length > 0 ? `${clients.length} active` : 'No clients yet',
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Clients at Risk',
      value: clientsNeedingAttention.length,
      change: clientsNeedingAttention.length > 0 ? 'Need attention' : 'All on track',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Average Progress',
      value: `${averageProgress}%`,
      change: clients.length > 0 ? 'Based on active clients' : 'No data yet',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coach Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your clients and track their progress
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Client
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {metric.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                    <Icon className={`h-4 w-4 ${metric.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {metric.change}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Clients Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Client Overview</CardTitle>
              <CardDescription>
                Manage your active clients and their progress
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {clients.length > 0 ? (
            <div className="space-y-4">
              {clients.slice(0, 5).map((client, index) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={client.photoUrl} alt={client.firstName} />
                      <AvatarFallback>
                        {getInitials(`${client.firstName} ${client.lastName}`)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {client.firstName} {client.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {client.objective}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <Progress value={client.progressPercentage} className="w-20" />
                        <span className="text-sm font-medium">
                          {client.progressPercentage}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Started {formatDate(client.startDate)}
                      </p>
                    </div>
                    
                    <Badge 
                      variant={client.needsAttention ? "destructive" : "secondary"}
                    >
                      {client.needsAttention ? 'Needs Attention' : 'On Track'}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No clients yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Add your first client to get started
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Sessions
            </CardTitle>
            <CardDescription>
              Upcoming and completed sessions for today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No sessions scheduled for today</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates from your clients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No recent activity</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CoachDashboard