import React, { useState } from 'react';
import { X, Calendar, Clock, User, Video, MapPin, MessageSquare, Phone, Mail, XCircle, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Textarea } from '../../ui/textarea';
import { AppointmentWithDetails, appointmentService } from '../../../services/appointmentService';
import { format, isPast, isFuture, differenceInHours } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AppointmentDetailsModalProps {
  appointment: AppointmentWithDetails;
  onClose: () => void;
  onUpdate: () => void;
}

export const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  appointment,
  onClose,
  onUpdate
}) => {
  const [loading, setLoading] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.start_time}`);
  const endDateTime = new Date(`${appointment.appointment_date}T${appointment.end_time}`);
  const hoursUntilAppointment = differenceInHours(appointmentDateTime, new Date());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente de confirmation';
      case 'confirmed': return 'Confirmé';
      case 'cancelled': return 'Annulé';
      case 'completed': return 'Terminé';
      default: return status;
    }
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'in_person': return <MapPin className="w-4 h-4" />;
      case 'group': return <User className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getSessionTypeText = (type: string) => {
    switch (type) {
      case 'individual': return 'Séance individuelle';
      case 'group': return 'Séance de groupe';
      case 'video': return 'Visioconférence';
      case 'in_person': return 'Séance en présentiel';
      default: return type;
    }
  };

  const canCancel = () => {
    // On peut annuler si :
    // - Le rendez-vous n'est pas déjà annulé ou terminé
    // - Il reste plus de 24h avant le rendez-vous
    return ['pending', 'confirmed'].includes(appointment.status) && 
           hoursUntilAppointment > 24;
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      alert('Veuillez indiquer la raison de l\'annulation');
      return;
    }

    try {
      setLoading(true);
      await appointmentService.updateAppointment(appointment.id, {
        status: 'cancelled',
        client_notes: appointment.client_notes 
          ? `${appointment.client_notes}\n\nAnnulation: ${cancelReason}`
          : `Annulation: ${cancelReason}`
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      alert('Erreur lors de l\'annulation du rendez-vous');
    } finally {
      setLoading(false);
    }
  };

  const getCancellationPolicy = () => {
    if (hoursUntilAppointment > 48) {
      return {
        type: 'success',
        message: 'Annulation gratuite (plus de 48h à l\'avance)'
      };
    } else if (hoursUntilAppointment > 24) {
      return {
        type: 'warning',
        message: 'Annulation possible (entre 24h et 48h à l\'avance)'
      };
    } else {
      return {
        type: 'error',
        message: 'Annulation non autorisée (moins de 24h à l\'avance)'
      };
    }
  };

  const cancellationPolicy = getCancellationPolicy();

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Détails du rendez-vous
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Statut et informations principales */}
          <div className="flex items-center justify-between">
            <Badge className={`${getStatusColor(appointment.status)} border text-sm px-3 py-1`}>
              {getStatusText(appointment.status)}
            </Badge>
            
            {appointment.price && (
              <span className="text-lg font-semibold text-green-600">
                {appointment.price}€
              </span>
            )}
          </div>

          {/* Informations du rendez-vous */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date et heure */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Date et heure</h3>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <span className="capitalize">
                    {format(appointmentDateTime, 'EEEE d MMMM yyyy', { locale: fr })}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span>
                    {format(appointmentDateTime, 'HH:mm')} - {format(endDateTime, 'HH:mm')}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  {getSessionTypeIcon(appointment.session_type)}
                  <span>{getSessionTypeText(appointment.session_type)}</span>
                </div>
              </div>

              {/* Countdown */}
              {isFuture(appointmentDateTime) && ['confirmed', 'pending'].includes(appointment.status) && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    {hoursUntilAppointment > 24 
                      ? `Dans ${Math.floor(hoursUntilAppointment / 24)} jour${Math.floor(hoursUntilAppointment / 24) > 1 ? 's' : ''}`
                      : hoursUntilAppointment > 1
                        ? `Dans ${hoursUntilAppointment} heure${hoursUntilAppointment > 1 ? 's' : ''}`
                        : 'Très bientôt'
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Informations du coach */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Votre coach</h3>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium">
                    {appointment.coach.first_name} {appointment.coach.last_name}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      <span>Contact</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      <span>Email</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lieu ou lien de la séance */}
          {(appointment.location || appointment.meeting_link) && (
            <div>
              <h3 className="font-semibold text-lg mb-3">
                {appointment.session_type === 'video' ? 'Lien de visioconférence' : 'Lieu de la séance'}
              </h3>
              
              {appointment.session_type === 'video' && appointment.meeting_link ? (
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Video className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <a 
                      href={appointment.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Rejoindre la visioconférence
                    </a>
                    <p className="text-sm text-blue-600 mt-1">
                      Le lien sera actif 15 minutes avant le début de la séance
                    </p>
                  </div>
                </div>
              ) : appointment.location && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  <span>{appointment.location}</span>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {(appointment.client_notes || appointment.coach_notes) && (
            <div className="space-y-4">
              {appointment.client_notes && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Vos notes</h3>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-700">{appointment.client_notes}</p>
                  </div>
                </div>
              )}

              {appointment.coach_notes && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Notes du coach</h3>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-blue-800">{appointment.coach_notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Formulaire d'annulation */}
          {showCancelForm && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-lg mb-3 text-red-600">
                Annulation du rendez-vous
              </h3>
              
              <div className="space-y-4">
                <div className={`
                  p-3 rounded-lg flex items-center gap-2
                  ${cancellationPolicy.type === 'success' ? 'bg-green-50 text-green-800' :
                    cancellationPolicy.type === 'warning' ? 'bg-yellow-50 text-yellow-800' :
                    'bg-red-50 text-red-800'}
                `}>
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">{cancellationPolicy.message}</span>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Raison de l'annulation *
                  </label>
                  <Textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Veuillez expliquer pourquoi vous souhaitez annuler ce rendez-vous..."
                    className="min-h-[80px]"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCancelForm(false);
                      setCancelReason('');
                    }}
                    disabled={loading}
                  >
                    Retour
                  </Button>
                  
                  <Button
                    onClick={handleCancel}
                    disabled={loading || !cancelReason.trim()}
                    className="bg-red-600 hover:bg-red-700 gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    {loading ? 'Annulation...' : 'Confirmer l\'annulation'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex gap-2">
              {canCancel() && !showCancelForm && (
                <Button
                  variant="outline"
                  onClick={() => setShowCancelForm(true)}
                  className="text-red-600 border-red-300 hover:bg-red-50 gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Annuler le RDV
                </Button>
              )}

              {appointment.session_type === 'video' && appointment.meeting_link && 
               isFuture(appointmentDateTime) && hoursUntilAppointment <= 1 && (
                <Button
                  onClick={() => window.open(appointment.meeting_link!, '_blank')}
                  className="gap-2"
                >
                  <Video className="w-4 h-4" />
                  Rejoindre la séance
                </Button>
              )}
            </div>

            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
          </div>

          {/* Informations supplémentaires */}
          {appointment.status === 'pending' && (
            <div className="bg-yellow-50 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>En attente de confirmation :</strong> Votre coach va confirmer ce rendez-vous prochainement. 
                Vous recevrez une notification par email.
              </p>
            </div>
          )}

          {appointment.status === 'cancelled' && (
            <div className="bg-red-50 rounded-lg p-3">
              <p className="text-sm text-red-800">
                <strong>Rendez-vous annulé :</strong> Ce rendez-vous a été annulé. 
                Vous pouvez prendre un nouveau rendez-vous quand vous le souhaitez.
              </p>
            </div>
          )}

          {isPast(appointmentDateTime) && appointment.status === 'confirmed' && (
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Séance passée :</strong> Cette séance est terminée. 
                N'hésitez pas à laisser un feedback à votre coach !
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
