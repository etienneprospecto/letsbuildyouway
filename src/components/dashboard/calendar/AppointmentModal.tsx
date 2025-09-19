import React, { useState } from 'react';
import { X, Calendar, Clock, User, MapPin, Video, Phone, Mail, MessageSquare, Check, Ban } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Textarea } from '../../ui/textarea';
import { AppointmentWithDetails } from '../../../services/appointmentService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AppointmentModalProps {
  appointment: AppointmentWithDetails;
  onClose: () => void;
  onUpdate: (appointmentId: string, status: 'confirmed' | 'cancelled') => void;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  appointment,
  onClose,
  onUpdate
}) => {
  const [coachNotes, setCoachNotes] = useState(appointment.coach_notes || '');
  const [loading, setLoading] = useState(false);

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
      case 'pending': return 'En attente';
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
      case 'individual': return 'Individuel';
      case 'group': return 'Groupe';
      case 'video': return 'Visioconférence';
      case 'in_person': return 'Présentiel';
      default: return type;
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onUpdate(appointment.id, 'confirmed');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      await onUpdate(appointment.id, 'cancelled');
    } finally {
      setLoading(false);
    }
  };

  const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.start_time}`);
  const endDateTime = new Date(`${appointment.appointment_date}T${appointment.end_time}`);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Détails du rendez-vous
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informations client */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Client</h3>
              
              <div className="flex items-center gap-3">
                {appointment.client.photo_url ? (
                  <img
                    src={appointment.client.photo_url}
                    alt={`${appointment.client.first_name} ${appointment.client.last_name}`}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                )}
                <div>
                  <p className="font-medium">
                    {appointment.client.first_name} {appointment.client.last_name}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{appointment.client.contact}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Informations rendez-vous */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Rendez-vous</h3>
              
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

                <div className="flex items-center gap-2">
                  <Badge className={`${getStatusColor(appointment.status)} border`}>
                    {getStatusText(appointment.status)}
                  </Badge>
                  {appointment.price && (
                    <span className="text-sm font-medium text-green-600">
                      {appointment.price}€
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Lieu/Lien de la séance */}
          {(appointment.location || appointment.meeting_link) && (
            <div>
              <h3 className="font-semibold text-lg mb-2">
                {appointment.session_type === 'video' ? 'Lien de visioconférence' : 'Lieu'}
              </h3>
              
              {appointment.session_type === 'video' && appointment.meeting_link ? (
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <Video className="w-4 h-4 text-blue-600" />
                  <a 
                    href={appointment.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Rejoindre la visioconférence
                  </a>
                </div>
              ) : appointment.location && (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="w-4 h-4 text-gray-600" />
                  <span>{appointment.location}</span>
                </div>
              )}
            </div>
          )}

          {/* Notes du client */}
          {appointment.client_notes && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Notes du client</h3>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-700">{appointment.client_notes}</p>
              </div>
            </div>
          )}

          {/* Notes du coach */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Notes du coach</h3>
            <Textarea
              value={coachNotes}
              onChange={(e) => setCoachNotes(e.target.value)}
              placeholder="Ajoutez vos notes sur ce rendez-vous..."
              className="min-h-[80px]"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex gap-2">
              {appointment.status === 'pending' && (
                <>
                  <Button
                    onClick={handleConfirm}
                    disabled={loading}
                    className="gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Confirmer
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={loading}
                    className="gap-2 text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Ban className="w-4 h-4" />
                    Refuser
                  </Button>
                </>
              )}

              {appointment.status === 'confirmed' && (
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                  className="gap-2 text-red-600 border-red-300 hover:bg-red-50"
                >
                  <Ban className="w-4 h-4" />
                  Annuler
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => window.open(`mailto:${appointment.client.contact}`)}
              >
                <Mail className="w-4 h-4" />
                Contacter
              </Button>

              <Button variant="outline" onClick={onClose}>
                Fermer
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
