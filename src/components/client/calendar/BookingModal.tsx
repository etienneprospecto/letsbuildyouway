import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Video, MapPin, MessageSquare, Euro, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Badge } from '../../ui/badge';
import { appointmentService } from '../../../services/appointmentService';
import { availabilityService, AvailableSlot } from '../../../services/availabilityService';
import { Database } from '../../../lib/database.types';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

type Client = Database['public']['Tables']['clients']['Row'];

interface BookingModalProps {
  client: Client;
  selectedSlot?: AvailableSlot | null;
  selectedDate?: Date;
  onClose: () => void;
  onComplete: () => void;
}

interface BookingStep {
  id: number;
  title: string;
  completed: boolean;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  client,
  selectedSlot,
  selectedDate,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // États du formulaire
  const [bookingData, setBookingData] = useState({
    date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    slotId: selectedSlot?.slot_id || '',
    sessionType: selectedSlot?.session_type || 'individual' as 'individual' | 'group' | 'video' | 'in_person',
    startTime: selectedSlot?.start_time || '',
    endTime: selectedSlot?.end_time || '',
    price: selectedSlot?.price || 0,
    clientNotes: '',
    location: '',
    meetingLink: ''
  });

  const steps: BookingStep[] = [
    { id: 1, title: 'Type de séance', completed: false },
    { id: 2, title: 'Date et créneau', completed: false },
    { id: 3, title: 'Informations', completed: false },
    { id: 4, title: 'Confirmation', completed: false }
  ];

  useEffect(() => {
    if (currentStep === 2 && bookingData.date) {
      loadAvailableSlots();
    }
  }, [currentStep, bookingData.date, bookingData.sessionType]);

  const loadAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      const slots = await availabilityService.getAvailableSlotsForDate(
        client.coach_id,
        bookingData.date,
        bookingData.sessionType
      );
      setAvailableSlots(slots);
    } catch (error) {

    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSlotSelect = (slot: AvailableSlot) => {
    setBookingData(prev => ({
      ...prev,
      slotId: slot.slot_id,
      startTime: slot.start_time,
      endTime: slot.end_time,
      price: slot.price || 0,
      sessionType: slot.session_type
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const appointmentData = {
        coach_id: client.coach_id,
        client_id: client.id,
        appointment_date: bookingData.date,
        start_time: bookingData.startTime,
        end_time: bookingData.endTime,
        session_type: bookingData.sessionType,
        client_notes: bookingData.clientNotes || null,
        location: bookingData.location || null,
        meeting_link: bookingData.meetingLink || null,
        price: bookingData.price || null,
        status: 'pending' as const
      };

      await appointmentService.createAppointment(appointmentData);
      onComplete();
    } catch (error) {

      alert('Erreur lors de la réservation du rendez-vous');
    } finally {
      setLoading(false);
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return bookingData.sessionType !== '';
      case 2:
        return bookingData.date && bookingData.slotId && bookingData.startTime && bookingData.endTime;
      case 3:
        return true; // Les informations sont optionnelles
      default:
        return false;
    }
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-5 h-5" />;
      case 'in_person': return <MapPin className="w-5 h-5" />;
      case 'group': return <User className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const getSessionTypeLabel = (type: string) => {
    switch (type) {
      case 'individual': return 'Séance individuelle';
      case 'group': return 'Séance de groupe';
      case 'video': return 'Visioconférence';
      case 'in_person': return 'Séance en présentiel';
      default: return type;
    }
  };

  const getSessionTypeDescription = (type: string) => {
    switch (type) {
      case 'individual': return 'Séance personnalisée en tête-à-tête avec votre coach';
      case 'group': return 'Séance collective avec d\'autres participants';
      case 'video': return 'Séance à distance par visioconférence';
      case 'in_person': return 'Séance en face-à-face dans un lieu physique';
      default: return '';
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Choisissez le type de séance</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(['individual', 'group', 'video', 'in_person'] as const).map((type) => (
                <div
                  key={type}
                  className={`
                    p-4 border-2 rounded-lg cursor-pointer transition-colors
                    ${bookingData.sessionType === type 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  onClick={() => setBookingData(prev => ({ ...prev, sessionType: type }))}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {getSessionTypeIcon(type)}
                    <h4 className="font-medium">{getSessionTypeLabel(type)}</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    {getSessionTypeDescription(type)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Choisissez la date et l'heure</h3>
            
            {/* Sélection de date */}
            <div>
              <Label htmlFor="date">Date souhaitée</Label>
              <Input
                id="date"
                type="date"
                value={bookingData.date}
                min={format(new Date(), 'yyyy-MM-dd')}
                max={format(addDays(new Date(), 60), 'yyyy-MM-dd')} // 2 mois à l'avance
                onChange={(e) => setBookingData(prev => ({ 
                  ...prev, 
                  date: e.target.value,
                  slotId: '', // Reset du créneau sélectionné
                  startTime: '',
                  endTime: ''
                }))}
              />
            </div>

            {/* Créneaux disponibles */}
            {bookingData.date && (
              <div>
                <Label>Créneaux disponibles</Label>
                
                {loadingSlots ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Aucun créneau disponible pour cette date
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {availableSlots.map((slot) => (
                      <div
                        key={slot.slot_id}
                        className={`
                          p-3 border-2 rounded-lg cursor-pointer transition-colors
                          ${bookingData.slotId === slot.slot_id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                          }
                        `}
                        onClick={() => handleSlotSelect(slot)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">
                              {format(new Date(`2000-01-01T${slot.start_time}`), 'HH:mm')} - 
                              {format(new Date(`2000-01-01T${slot.end_time}`), 'HH:mm')}
                            </span>
                          </div>
                          
                          {slot.price && (
                            <Badge variant="outline" className="gap-1">
                              <Euro className="w-3 h-3" />
                              {slot.price}€
                            </Badge>
                          )}
                        </div>

                        <div className="text-sm text-gray-600">
                          {slot.duration_minutes} minutes • {getSessionTypeLabel(slot.session_type)}
                        </div>

                        {slot.session_type === 'group' && (
                          <div className="mt-1 text-xs text-blue-600">
                            {slot.available_spots} place{slot.available_spots > 1 ? 's' : ''} disponible{slot.available_spots > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informations complémentaires</h3>
            
            <div>
              <Label htmlFor="notes">Notes pour votre coach (optionnel)</Label>
              <Textarea
                id="notes"
                value={bookingData.clientNotes}
                onChange={(e) => setBookingData(prev => ({ ...prev, clientNotes: e.target.value }))}
                placeholder="Objectifs de la séance, besoins particuliers, questions..."
                className="min-h-[100px]"
              />
            </div>

            {bookingData.sessionType === 'in_person' && (
              <div>
                <Label htmlFor="location">Lieu de la séance (optionnel)</Label>
                <Input
                  id="location"
                  value={bookingData.location}
                  onChange={(e) => setBookingData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Adresse ou lieu de rendez-vous"
                />
              </div>
            )}

            {bookingData.sessionType === 'video' && (
              <div>
                <Label htmlFor="meetingLink">Lien de visioconférence (optionnel)</Label>
                <Input
                  id="meetingLink"
                  value={bookingData.meetingLink}
                  onChange={(e) => setBookingData(prev => ({ ...prev, meetingLink: e.target.value }))}
                  placeholder="Votre coach peut créer le lien automatiquement"
                />
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Confirmation de votre réservation</h3>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium">
                    {format(new Date(bookingData.date), 'EEEE d MMMM yyyy', { locale: fr })}
                  </p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(`2000-01-01T${bookingData.startTime}`), 'HH:mm')} - 
                    {format(new Date(`2000-01-01T${bookingData.endTime}`), 'HH:mm')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {getSessionTypeIcon(bookingData.sessionType)}
                <div>
                  <p className="font-medium">{getSessionTypeLabel(bookingData.sessionType)}</p>
                  {bookingData.price > 0 && (
                    <p className="text-sm text-green-600 font-medium">{bookingData.price}€</p>
                  )}
                </div>
              </div>

              {bookingData.clientNotes && (
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Notes</p>
                    <p className="text-sm text-gray-600">{bookingData.clientNotes}</p>
                  </div>
                </div>
              )}

              {bookingData.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium">Lieu</p>
                    <p className="text-sm text-gray-600">{bookingData.location}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Prochaines étapes</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Votre demande sera envoyée à votre coach</li>
                <li>• Vous recevrez une confirmation par email</li>
                <li>• Votre coach confirmera ou proposera un autre créneau</li>
                <li>• Un rappel vous sera envoyé 24h avant la séance</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Réserver un rendez-vous
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Indicateur de progression */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${currentStep === step.id 
                    ? 'bg-blue-600 text-white' 
                    : currentStep > step.id 
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                </div>
                
                {index < steps.length - 1 && (
                  <div className={`
                    w-16 h-1 mx-2
                    ${currentStep > step.id ? 'bg-green-600' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Étape {currentStep} sur {steps.length} : {steps[currentStep - 1]?.title}
            </p>
          </div>

          {/* Contenu de l'étape */}
          <div className="min-h-[300px]">
            {renderStepContent()}
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <div className="flex gap-2">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  disabled={loading}
                >
                  Précédent
                </Button>
              )}
              
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Annuler
              </Button>
            </div>

            <div>
              {currentStep < steps.length ? (
                <Button
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  disabled={!canProceedToNextStep() || loading}
                >
                  Suivant
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="gap-2"
                >
                  <Check className="w-4 h-4" />
                  {loading ? 'Réservation...' : 'Confirmer la réservation'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
