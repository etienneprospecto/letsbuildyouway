import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Video, MapPin, Plus, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { appointmentService, AppointmentWithDetails } from '../../services/appointmentService';
import { availabilityService, AvailableSlot } from '../../services/availabilityService';
import { useAuth } from '@/providers/OptimizedAuthProvider';
import { useClientDetail } from '../../hooks/useClientDetail';
import { useWeek } from '../../providers/WeekProvider';
import { BookingModal } from './calendar/BookingModal';
import { AppointmentDetailsModal } from './calendar/AppointmentDetailsModal';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, isPast, isFuture } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CalendarStats {
  upcoming: number;
  thisWeek: number;
  thisMonth: number;
  completed: number;
}

export const ClientCalendarPage: React.FC = () => {
  const { user, profile } = useAuth();
  const { client, loading: clientLoading } = useClientDetail();
  const { 
    currentWeekStart, 
    currentTime, 
    goToPreviousWeek, 
    goToNextWeek, 
    goToCurrentWeek, 
    formatWeekRange 
  } = useWeek();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [stats, setStats] = useState<CalendarStats>({
    upcoming: 0,
    thisWeek: 0,
    thisMonth: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  useEffect(() => {
    if (client && !clientLoading) {
      loadCalendarData();
    } else if (!clientLoading && !client && profile?.role === 'client') {

    }
  }, [client, clientLoading, currentWeekStart, profile]);

  const loadCalendarData = async () => {
    if (!client) return;

    try {
      setLoading(true);

      // Charger les rendez-vous du client
      const appointmentsData = await appointmentService.getAppointments({
        clientId: client.id
      });

      // Charger les créneaux disponibles pour la date sélectionnée
      const slotsData = await availabilityService.getAvailableSlotsForDate(
        client.coach_id,
        format(selectedDate, 'yyyy-MM-dd')
      );

      // Calculer les statistiques
      const now = new Date();
      const weekStart = startOfWeek(currentWeekStart, { locale: fr });
      const weekEnd = endOfWeek(currentWeekStart, { locale: fr });
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const statsData: CalendarStats = {
        upcoming: appointmentsData.filter(apt => 
          isFuture(new Date(`${apt.appointment_date}T${apt.start_time}`)) &&
          ['confirmed', 'pending'].includes(apt.status)
        ).length,
        thisWeek: appointmentsData.filter(apt => {
          const aptDate = new Date(apt.appointment_date);
          return aptDate >= weekStart && aptDate <= weekEnd && apt.status === 'confirmed';
        }).length,
        thisMonth: appointmentsData.filter(apt => {
          const aptDate = new Date(apt.appointment_date);
          return aptDate >= monthStart && aptDate <= monthEnd && apt.status === 'confirmed';
        }).length,
        completed: appointmentsData.filter(apt => apt.status === 'completed').length
      };

      setAppointments(appointmentsData);
      setAvailableSlots(slotsData);
      setStats(statsData);
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelect = (slot: AvailableSlot) => {
    setSelectedSlot(slot);
    setShowBookingModal(true);
  };

  const handleAppointmentClick = (appointment: AppointmentWithDetails) => {
    setSelectedAppointment(appointment);
    setShowAppointmentModal(true);
  };

  const handleBookingComplete = () => {
    setShowBookingModal(false);
    setSelectedSlot(null);
    loadCalendarData();
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'in_person': return <MapPin className="w-4 h-4" />;
      case 'group': return <User className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getSessionTypeLabel = (type: string) => {
    switch (type) {
      case 'individual': return 'Individuel';
      case 'group': return 'Groupe';
      case 'video': return 'Visio';
      case 'in_person': return 'Présentiel';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmé';
      case 'cancelled': return 'Annulé';
      case 'completed': return 'Terminé';
      default: return status;
    }
  };

  const getWeekDays = () => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter(apt => apt.appointment_date === dateStr);
  };

  // Affichage de chargement si l'authentification ou les données client sont en cours de chargement
  if (loading || clientLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Chargement des rendez-vous...</span>
      </div>
    );
  }

  // Si pas de profil client ou pas de client_id
  if (!profile?.client_id) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Profil client non configuré</p>
        <p className="text-sm text-gray-500 mt-2">
          Veuillez contacter votre coach pour configurer votre accès.
        </p>
      </div>
    );
  }

  // Si pas de données client chargées
  if (!client) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Impossible de charger les informations du client</p>
        <p className="text-sm text-gray-500 mt-2">
          Client ID: {profile?.client_id}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec navigation par semaine */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mes rendez-vous</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Réservez vos séances et gérez vos rendez-vous
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setShowBookingModal(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Prendre rendez-vous
          </Button>
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-2">
              Semaine du {formatWeekRange(currentWeekStart)}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={goToPreviousWeek}
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Précédente
              </Button>
              <Button
                onClick={goToCurrentWeek}
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Semaine actuelle
              </Button>
              <Button
                onClick={goToNextWeek}
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                Suivante
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">À venir</p>
                <p className="text-2xl font-bold">{stats.upcoming}</p>
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
                <p className="text-2xl font-bold">{stats.thisWeek}</p>
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
                <p className="text-2xl font-bold">{stats.thisMonth}</p>
              </div>
              <User className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Terminées</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sélecteur de semaine */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Semaine du {format(currentWeekStart, 'd MMMM yyyy', { locale: fr })}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {getWeekDays().map((date) => {
              const dayAppointments = getAppointmentsForDate(date);
              const isToday = isSameDay(date, currentTime);
              const isSelected = isSameDay(date, selectedDate);
              const isPastDate = isPast(date) && !isToday;

              return (
                <div
                  key={date.toISOString()}
                  className={`
                    p-3 rounded-lg border cursor-pointer transition-colors min-h-[120px]
                    ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                    ${isToday ? 'bg-blue-100 border-blue-300 ring-2 ring-blue-400 dark:bg-blue-900/20 dark:border-blue-600' : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'}
                    ${isPastDate ? 'opacity-60' : ''}
                  `}
                  onClick={() => setSelectedDate(date)}
                >
                  <div className="text-center mb-2">
                    <div className="text-xs text-gray-600 dark:text-gray-400 uppercase">
                      {format(date, 'EEE', { locale: fr })}
                    </div>
                    <div className={`text-lg font-semibold ${isToday ? 'text-blue-600' : ''}`}>
                      {format(date, 'd')}
                    </div>
                  </div>

                  <div className="space-y-1">
                    {dayAppointments.slice(0, 2).map((appointment) => (
                      <div
                        key={appointment.id}
                        className={`
                          text-xs p-1 rounded cursor-pointer
                          ${getStatusColor(appointment.status)}
                        `}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAppointmentClick(appointment);
                        }}
                      >
                        <div className="font-medium truncate">
                          {format(new Date(`2000-01-01T${appointment.start_time}`), 'HH:mm')}
                        </div>
                        <div className="truncate">
                          {getSessionTypeLabel(appointment.session_type)}
                        </div>
                      </div>
                    ))}
                    
                    {dayAppointments.length > 2 && (
                      <div className="text-xs text-gray-600 text-center">
                        +{dayAppointments.length - 2}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Créneaux disponibles pour la date sélectionnée */}
      {isFuture(selectedDate) || isSameDay(selectedDate, new Date()) ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Créneaux disponibles - {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {availableSlots.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Aucun créneau disponible pour cette date
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableSlots.map((slot) => (
                  <div
                    key={slot.slot_id}
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleSlotSelect(slot)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getSessionTypeIcon(slot.session_type)}
                        <span className="font-medium">
                          {format(new Date(`2000-01-01T${slot.start_time}`), 'HH:mm')} - 
                          {format(new Date(`2000-01-01T${slot.end_time}`), 'HH:mm')}
                        </span>
                      </div>
                      
                      {slot.price && (
                        <span className="text-sm font-medium text-green-600">
                          {slot.price}€
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{getSessionTypeLabel(slot.session_type)}</span>
                      <span>{slot.duration_minutes}min</span>
                    </div>

                    {slot.session_type === 'group' && (
                      <div className="mt-2 text-xs text-blue-600">
                        {slot.available_spots} place{slot.available_spots > 1 ? 's' : ''} disponible{slot.available_spots > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* Prochains rendez-vous */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Mes prochains rendez-vous
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {appointments
              .filter(apt => 
                isFuture(new Date(`${apt.appointment_date}T${apt.start_time}`)) &&
                ['confirmed', 'pending'].includes(apt.status)
              )
              .slice(0, 5)
              .map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => handleAppointmentClick(appointment)}
                >
                  <div className="flex items-center gap-3">
                    {getSessionTypeIcon(appointment.session_type)}
                    <div>
                      <p className="font-medium">
                        {format(new Date(`${appointment.appointment_date}T${appointment.start_time}`), 'EEEE dd MMMM à HH:mm', { locale: fr })}
                      </p>
                      <p className="text-sm text-gray-600">
                        {getSessionTypeLabel(appointment.session_type)} • {appointment.coach.first_name} {appointment.coach.last_name}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(appointment.status)}>
                      {getStatusText(appointment.status)}
                    </Badge>
                    {appointment.price && (
                      <span className="text-sm font-medium text-green-600">
                        {appointment.price}€
                      </span>
                    )}
                  </div>
                </div>
              ))}
            
            {appointments.filter(apt => 
              isFuture(new Date(`${apt.appointment_date}T${apt.start_time}`)) &&
              ['confirmed', 'pending'].includes(apt.status)
            ).length === 0 && (
              <p className="text-gray-500 text-center py-4">
                Aucun rendez-vous prévu
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {showBookingModal && (
        <BookingModal
          client={client}
          selectedSlot={selectedSlot}
          selectedDate={selectedSlot ? selectedDate : undefined}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedSlot(null);
          }}
          onComplete={handleBookingComplete}
        />
      )}

      {showAppointmentModal && selectedAppointment && (
        <AppointmentDetailsModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowAppointmentModal(false);
            setSelectedAppointment(null);
          }}
          onUpdate={loadCalendarData}
        />
      )}
    </div>
  );
};
