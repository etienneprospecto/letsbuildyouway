import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Settings, Users, Video, MapPin, AlertCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { appointmentService, AppointmentWithDetails } from '../../services/appointmentService';
import { availabilityService, WeeklySchedule } from '../../services/availabilityService';
import { calendarSyncService } from '../../services/calendarSyncService';
import { useAuth } from '../../providers/AuthProvider';
import { CalendarView } from './calendar/CalendarView';
import { AvailabilityManager } from './calendar/AvailabilityManager';
import { AppointmentModal } from './calendar/AppointmentModal';
import { CalendarSettingsModal } from './calendar/CalendarSettingsModal';
import { CalendarIntegrationModal } from './calendar/CalendarIntegrationModal';
import { ConflictsModal } from './calendar/ConflictsModal';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CalendarStats {
  todayAppointments: number;
  weekAppointments: number;
  monthAppointments: number;
  pendingAppointments: number;
  occupancyRate: number;
}

export const CoachCalendarPage: React.FC = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [availability, setAvailability] = useState<WeeklySchedule>({});
  const [stats, setStats] = useState<CalendarStats>({
    todayAppointments: 0,
    weekAppointments: 0,
    monthAppointments: 0,
    pendingAppointments: 0,
    occupancyRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [showConflictsModal, setShowConflictsModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadCalendarData();
    }
  }, [user, currentDate, currentView]);

  const loadCalendarData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Définir la plage de dates selon la vue
      let dateFrom: string, dateTo: string;
      
      switch (currentView) {
        case 'month':
          dateFrom = format(startOfMonth(currentDate), 'yyyy-MM-dd');
          dateTo = format(endOfMonth(currentDate), 'yyyy-MM-dd');
          break;
        case 'week':
          dateFrom = format(startOfWeek(currentDate, { locale: fr }), 'yyyy-MM-dd');
          dateTo = format(endOfWeek(currentDate, { locale: fr }), 'yyyy-MM-dd');
          break;
        case 'day':
          dateFrom = dateTo = format(currentDate, 'yyyy-MM-dd');
          break;
      }

      // Charger les données en parallèle
      const [appointmentsData, availabilityData, statsData] = await Promise.all([
        appointmentService.getAppointments({
          coachId: user.id,
          dateFrom,
          dateTo
        }),
        availabilityService.getCoachAvailability(user.id),
        loadStats()
      ]);

      setAppointments(appointmentsData);
      setAvailability(availabilityData);
      setStats(statsData);
    } catch (error) {
      console.error('Erreur lors du chargement du calendrier:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async (): Promise<CalendarStats> => {
    if (!user) return {
      todayAppointments: 0,
      weekAppointments: 0,
      monthAppointments: 0,
      pendingAppointments: 0,
      occupancyRate: 0
    };

    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const weekStart = format(startOfWeek(new Date(), { locale: fr }), 'yyyy-MM-dd');
      const weekEnd = format(endOfWeek(new Date(), { locale: fr }), 'yyyy-MM-dd');
      const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd');

      const [todayAppts, weekAppts, monthAppts, pendingAppts, occupancy] = await Promise.all([
        appointmentService.getAppointments({
          coachId: user.id,
          dateFrom: today,
          dateTo: today,
          status: 'confirmed'
        }),
        appointmentService.getAppointments({
          coachId: user.id,
          dateFrom: weekStart,
          dateTo: weekEnd,
          status: 'confirmed'
        }),
        appointmentService.getAppointments({
          coachId: user.id,
          dateFrom: monthStart,
          dateTo: monthEnd,
          status: 'confirmed'
        }),
        appointmentService.getAppointments({
          coachId: user.id,
          status: 'pending'
        }),
        availabilityService.getOccupancyRate(user.id, weekStart, weekEnd)
      ]);

      return {
        todayAppointments: todayAppts.length,
        weekAppointments: weekAppts.length,
        monthAppointments: monthAppts.length,
        pendingAppointments: pendingAppts.length,
        occupancyRate: occupancy.occupancyRate
      };
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      return {
        todayAppointments: 0,
        weekAppointments: 0,
        monthAppointments: 0,
        pendingAppointments: 0,
        occupancyRate: 0
      };
    }
  };

  const handleAppointmentClick = (appointment: AppointmentWithDetails) => {
    setSelectedAppointment(appointment);
    setShowAppointmentModal(true);
  };

  const handleAppointmentUpdate = async (appointmentId: string, status: 'confirmed' | 'cancelled') => {
    try {
      await appointmentService.updateAppointment(appointmentId, { status });
      await loadCalendarData();
      setShowAppointmentModal(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rendez-vous:', error);
    }
  };

  const handleSyncCalendars = async () => {
    if (!user) return;

    try {
      const integrations = await calendarSyncService.getCoachIntegrations(user.id);
      
      for (const integration of integrations) {
        if (integration.is_active) {
          await calendarSyncService.syncFromExternalCalendar(integration.id);
        }
      }

      await loadCalendarData();
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'in_person': return <MapPin className="w-4 h-4" />;
      case 'group': return <Users className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec actions rapides */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendrier</h1>
          <p className="text-gray-600">
            Gérez vos rendez-vous et créneaux de disponibilité
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncCalendars}
            className="gap-2"
          >
            <Calendar className="w-4 h-4" />
            Synchroniser
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowIntegrationModal(true)}
            className="gap-2"
          >
            <Settings className="w-4 h-4" />
            Intégrations
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConflictsModal(true)}
            className="gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            Conflits
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAvailabilityModal(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Créneaux
          </Button>
          
          <Button
            size="sm"
            onClick={() => setShowSettingsModal(true)}
            className="gap-2"
          >
            <Settings className="w-4 h-4" />
            Paramètres
          </Button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aujourd'hui</p>
                <p className="text-2xl font-bold">{stats.todayAppointments}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cette semaine</p>
                <p className="text-2xl font-bold">{stats.weekAppointments}</p>
              </div>
              <Clock className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ce mois</p>
                <p className="text-2xl font-bold">{stats.monthAppointments}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-2xl font-bold">{stats.pendingAppointments}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taux d'occupation</p>
                <p className="text-2xl font-bold">{stats.occupancyRate.toFixed(1)}%</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-blue-600"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendrier principal */}
      <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as any)}>
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="month">Mois</TabsTrigger>
          <TabsTrigger value="week">Semaine</TabsTrigger>
          <TabsTrigger value="day">Jour</TabsTrigger>
        </TabsList>

        <TabsContent value="month" className="space-y-4">
          <CalendarView
            view="month"
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            appointments={appointments}
            availability={availability}
            onAppointmentClick={handleAppointmentClick}
          />
        </TabsContent>

        <TabsContent value="week" className="space-y-4">
          <CalendarView
            view="week"
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            appointments={appointments}
            availability={availability}
            onAppointmentClick={handleAppointmentClick}
          />
        </TabsContent>

        <TabsContent value="day" className="space-y-4">
          <CalendarView
            view="day"
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            appointments={appointments}
            availability={availability}
            onAppointmentClick={handleAppointmentClick}
          />
        </TabsContent>
      </Tabs>

      {/* Liste des prochains rendez-vous */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Prochains rendez-vous
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {appointments
              .filter(apt => apt.status === 'confirmed' || apt.status === 'pending')
              .slice(0, 5)
              .map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleAppointmentClick(appointment)}
                >
                  <div className="flex items-center gap-3">
                    {getSessionTypeIcon(appointment.session_type)}
                    <div>
                      <p className="font-medium">
                        {appointment.client.first_name} {appointment.client.last_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(`${appointment.appointment_date}T${appointment.start_time}`), 'EEEE dd MMMM à HH:mm', { locale: fr })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status === 'pending' ? 'En attente' :
                       appointment.status === 'confirmed' ? 'Confirmé' :
                       appointment.status === 'cancelled' ? 'Annulé' : 'Terminé'}
                    </Badge>
                    {appointment.price && (
                      <span className="text-sm font-medium text-green-600">
                        {appointment.price}€
                      </span>
                    )}
                  </div>
                </div>
              ))}
            
            {appointments.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                Aucun rendez-vous prévu
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {showAppointmentModal && selectedAppointment && (
        <AppointmentModal
          appointment={selectedAppointment}
          onClose={() => setShowAppointmentModal(false)}
          onUpdate={handleAppointmentUpdate}
        />
      )}

      {showAvailabilityModal && (
        <AvailabilityManager
          coachId={user?.id || ''}
          onClose={() => setShowAvailabilityModal(false)}
          onUpdate={loadCalendarData}
        />
      )}

      {showSettingsModal && (
        <CalendarSettingsModal
          coachId={user?.id || ''}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      <CalendarIntegrationModal
        isOpen={showIntegrationModal}
        onClose={() => setShowIntegrationModal(false)}
      />

      <ConflictsModal
        isOpen={showConflictsModal}
        onClose={() => setShowConflictsModal(false)}
        onConflictResolved={loadCalendarData}
      />
    </div>
  );
};
