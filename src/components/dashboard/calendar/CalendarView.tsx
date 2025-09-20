import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../ui/button';
import { AppointmentWithDetails } from '../../../services/appointmentService';
import { WeeklySchedule } from '../../../services/availabilityService';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths
} from 'date-fns';
import { fr } from 'date-fns/locale';

interface CalendarViewProps {
  view: 'month' | 'week' | 'day';
  currentDate: Date;
  onDateChange: (date: Date) => void;
  appointments: AppointmentWithDetails[];
  availability: WeeklySchedule;
  onAppointmentClick: (appointment: AppointmentWithDetails) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  view,
  currentDate,
  onDateChange,
  appointments,
  availability,
  onAppointmentClick
}) => {
  const navigateDate = (direction: 'prev' | 'next') => {
    let newDate: Date;
    
    switch (view) {
      case 'month':
        newDate = direction === 'prev' 
          ? subMonths(currentDate, 1) 
          : addMonths(currentDate, 1);
        break;
      case 'week':
        newDate = direction === 'prev' 
          ? subWeeks(currentDate, 1) 
          : addWeeks(currentDate, 1);
        break;
      case 'day':
        newDate = direction === 'prev' 
          ? subDays(currentDate, 1) 
          : addDays(currentDate, 1);
        break;
    }
    
    onDateChange(newDate);
  };

  const getDateRange = () => {
    switch (view) {
      case 'month':
        return {
          start: startOfWeek(startOfMonth(currentDate), { locale: fr }),
          end: endOfWeek(endOfMonth(currentDate), { locale: fr })
        };
      case 'week':
        return {
          start: startOfWeek(currentDate, { locale: fr }),
          end: endOfWeek(currentDate, { locale: fr })
        };
      case 'day':
        return {
          start: currentDate,
          end: currentDate
        };
    }
  };

  const getDaysToRender = () => {
    const { start, end } = getDateRange();
    return eachDayOfInterval({ start, end });
  };

  const getAppointmentsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter(apt => apt.appointment_date === dateStr);
  };

  const getAvailabilityForDay = (date: Date) => {
    const dayOfWeek = date.getDay();
    return availability[dayOfWeek] || [];
  };

  const formatViewTitle = () => {
    switch (view) {
      case 'month':
        return format(currentDate, 'MMMM yyyy', { locale: fr });
      case 'week':
        const weekStart = startOfWeek(currentDate, { locale: fr });
        const weekEnd = endOfWeek(currentDate, { locale: fr });
        return `${format(weekStart, 'd MMM', { locale: fr })} - ${format(weekEnd, 'd MMM yyyy', { locale: fr })}`;
      case 'day':
        return format(currentDate, 'EEEE d MMMM yyyy', { locale: fr });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-200 border-yellow-400 text-yellow-800';
      case 'confirmed': return 'bg-green-200 border-green-400 text-green-800';
      case 'cancelled': return 'bg-red-200 border-red-400 text-red-800';
      case 'completed': return 'bg-blue-200 border-blue-400 text-blue-800';
      default: return 'bg-gray-200 border-gray-400 text-gray-800';
    }
  };

  if (view === 'month') {
    return (
      <div className="bg-white rounded-lg shadow">
        {/* Header de navigation */}
        <div className="flex items-center justify-between p-4 border-b">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateDate('prev')}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <h2 className="text-lg font-semibold capitalize">
            {formatViewTitle()}
          </h2>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateDate('next')}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Grille du calendrier mensuel */}
        <div className="p-4">
          {/* En-têtes des jours */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                {day}
              </div>
            ))}
          </div>

          {/* Grille des jours */}
          <div className="grid grid-cols-7 gap-1">
            {getDaysToRender().map((date) => {
              const dayAppointments = getAppointmentsForDay(date);
              const dayAvailability = getAvailabilityForDay(date);
              const isCurrentMonth = isSameMonth(date, currentDate);
              const isToday = isSameDay(date, new Date());

              return (
                <div
                  key={date.toISOString()}
                  className={`
                    min-h-[100px] p-2 border border-gray-200 rounded-lg
                    ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'}
                    ${isToday ? 'ring-2 ring-blue-500' : ''}
                    hover:bg-gray-50 cursor-pointer transition-colors
                  `}
                  onClick={() => onDateChange(date)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-sm ${isToday ? 'font-bold text-blue-600' : ''}`}>
                      {format(date, 'd')}
                    </span>
                    {dayAvailability.length > 0 && (
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    )}
                  </div>

                  <div className="space-y-1">
                    {dayAppointments.slice(0, 2).map((appointment) => (
                      <div
                        key={appointment.id}
                        className={`
                          text-xs p-1 rounded border cursor-pointer
                          ${getStatusColor(appointment.status)}
                        `}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAppointmentClick(appointment);
                        }}
                      >
                        <div className="font-medium truncate">
                          {appointment.client.first_name} {appointment.client.last_name}
                        </div>
                        <div className="truncate">
                          {format(new Date(`2000-01-01T${appointment.start_time}`), 'HH:mm')}
                        </div>
                      </div>
                    ))}
                    {dayAppointments.length > 2 && (
                      <div className="text-xs text-gray-600 text-center">
                        +{dayAppointments.length - 2} autres
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (view === 'week') {
    const weekDays = getDaysToRender().slice(0, 7); // Une semaine seulement
    const timeSlots = Array.from({ length: 24 }, (_, i) => i); // 0-23 heures

    return (
      <div className="bg-white rounded-lg shadow">
        {/* Header de navigation */}
        <div className="flex items-center justify-between p-4 border-b">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateDate('prev')}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <h2 className="text-lg font-semibold">
            {formatViewTitle()}
          </h2>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateDate('next')}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Vue hebdomadaire */}
        <div className="flex">
          {/* Colonne des heures */}
          <div className="w-16 border-r">
            <div className="h-12 border-b"></div> {/* Header spacer */}
            {timeSlots.map((hour) => (
              <div key={hour} className="h-16 border-b text-xs text-gray-600 p-2">
                {hour.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Colonnes des jours */}
          <div className="flex-1 grid grid-cols-7">
            {weekDays.map((date) => {
              const dayAppointments = getAppointmentsForDay(date);
              const isToday = isSameDay(date, new Date());

              return (
                <div key={date.toISOString()} className="border-r">
                  {/* Header du jour */}
                  <div className={`
                    h-12 border-b p-2 text-center text-sm font-medium
                    ${isToday ? 'bg-blue-50 text-blue-600' : ''}
                  `}>
                    <div className="capitalize">
                      {format(date, 'EEE', { locale: fr })}
                    </div>
                    <div className={isToday ? 'font-bold' : ''}>
                      {format(date, 'd')}
                    </div>
                  </div>

                  {/* Grille horaire */}
                  <div className="relative">
                    {timeSlots.map((hour) => (
                      <div key={hour} className="h-16 border-b"></div>
                    ))}

                    {/* Rendez-vous positionnés */}
                    {dayAppointments.map((appointment) => {
                      const startHour = parseInt(appointment.start_time.split(':')[0]);
                      const startMinutes = parseInt(appointment.start_time.split(':')[1]);
                      const endHour = parseInt(appointment.end_time.split(':')[0]);
                      const endMinutes = parseInt(appointment.end_time.split(':')[1]);
                      
                      const topOffset = startHour * 64 + (startMinutes / 60) * 64;
                      const height = ((endHour - startHour) * 60 + (endMinutes - startMinutes)) / 60 * 64;

                      return (
                        <div
                          key={appointment.id}
                          className={`
                            absolute left-1 right-1 rounded p-1 cursor-pointer
                            ${getStatusColor(appointment.status)}
                          `}
                          style={{
                            top: `${topOffset}px`,
                            height: `${height}px`,
                            zIndex: 10
                          }}
                          onClick={() => onAppointmentClick(appointment)}
                        >
                          <div className="text-xs font-medium truncate">
                            {appointment.client.first_name} {appointment.client.last_name}
                          </div>
                          <div className="text-xs truncate">
                            {format(new Date(`2000-01-01T${appointment.start_time}`), 'HH:mm')} - 
                            {format(new Date(`2000-01-01T${appointment.end_time}`), 'HH:mm')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (view === 'day') {
    const dayAppointments = getAppointmentsForDay(currentDate);
    const dayAvailability = getAvailabilityForDay(currentDate);
    const timeSlots = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="bg-white rounded-lg shadow">
        {/* Header de navigation */}
        <div className="flex items-center justify-between p-4 border-b">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateDate('prev')}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <h2 className="text-lg font-semibold capitalize">
            {formatViewTitle()}
          </h2>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateDate('next')}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Vue journalière */}
        <div className="flex">
          {/* Colonne des heures */}
          <div className="w-20 border-r">
            {timeSlots.map((hour) => (
              <div key={hour} className="h-20 border-b text-sm text-gray-600 p-2">
                {hour.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Colonne du jour */}
          <div className="flex-1 relative">
            {timeSlots.map((hour) => (
              <div key={hour} className="h-20 border-b"></div>
            ))}

            {/* Créneaux de disponibilité (seulement s'il n'y a pas de rendez-vous) */}
            {dayAvailability.map((slot) => {
              const startHour = parseInt(slot.start_time.split(':')[0]);
              const startMinutes = parseInt(slot.start_time.split(':')[1]);
              const endHour = parseInt(slot.end_time.split(':')[0]);
              const endMinutes = parseInt(slot.end_time.split(':')[1]);
              
              const topOffset = startHour * 80 + (startMinutes / 60) * 80;
              const height = ((endHour - startHour) * 60 + (endMinutes - startMinutes)) / 60 * 80;

              // Vérifier s'il y a un rendez-vous sur ce créneau
              const hasAppointment = dayAppointments.some(apt => 
                apt.start_time === slot.start_time && 
                apt.end_time === slot.end_time &&
                apt.session_type === slot.session_type
              );

              // Ne pas afficher le créneau de disponibilité s'il y a un rendez-vous
              if (hasAppointment) return null;

              return (
                <div
                  key={slot.id}
                  className="absolute left-2 right-2 bg-green-100 border border-green-300 rounded p-2 cursor-pointer hover:bg-green-200"
                  style={{
                    top: `${topOffset}px`,
                    height: `${height}px`,
                    zIndex: 1
                  }}
                  onClick={() => {
                    // Ici on pourrait ouvrir un modal pour créer un rendez-vous
                    console.log('Créneau disponible cliqué:', slot);
                  }}
                >
                  <div className="text-xs text-green-700">
                    Disponible ({slot.session_type})
                  </div>
                </div>
              );
            })}

            {/* Rendez-vous */}
            {dayAppointments.map((appointment) => {
              const startHour = parseInt(appointment.start_time.split(':')[0]);
              const startMinutes = parseInt(appointment.start_time.split(':')[1]);
              const endHour = parseInt(appointment.end_time.split(':')[0]);
              const endMinutes = parseInt(appointment.end_time.split(':')[1]);
              
              const topOffset = startHour * 80 + (startMinutes / 60) * 80;
              const height = ((endHour - startHour) * 60 + (endMinutes - startMinutes)) / 60 * 80;

              const getSessionTypeIcon = (type: string) => {
                switch (type) {
                  case 'video': return '📹';
                  case 'in_person': return '🏢';
                  case 'group': return '👥';
                  case 'individual': return '👤';
                  default: return '⏰';
                }
              };

              const getSessionTypeLabel = (type: string) => {
                switch (type) {
                  case 'video': return 'Visio';
                  case 'in_person': return 'Présentiel';
                  case 'group': return 'Groupe';
                  case 'individual': return 'Individuel';
                  default: return type;
                }
              };

              return (
                <div
                  key={appointment.id}
                  className={`
                    absolute left-2 right-2 rounded p-2 cursor-pointer border-2 shadow-sm hover:shadow-md transition-shadow
                    ${getStatusColor(appointment.status)}
                  `}
                  style={{
                    top: `${topOffset}px`,
                    height: `${height}px`,
                    zIndex: 10
                  }}
                  onClick={() => onAppointmentClick(appointment)}
                >
                  <div className="font-medium text-sm truncate">
                    {appointment.client.first_name} {appointment.client.last_name}
                  </div>
                  <div className="text-xs flex items-center gap-1">
                    <span>{getSessionTypeIcon(appointment.session_type)}</span>
                    <span>{getSessionTypeLabel(appointment.session_type)}</span>
                  </div>
                  <div className="text-xs opacity-75">
                    {format(new Date(`2000-01-01T${appointment.start_time}`), 'HH:mm')} - 
                    {format(new Date(`2000-01-01T${appointment.end_time}`), 'HH:mm')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
};
