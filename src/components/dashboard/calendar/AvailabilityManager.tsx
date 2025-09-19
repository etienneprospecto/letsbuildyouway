import React, { useState, useEffect } from 'react';
import { X, Plus, Clock, Euro, Users, Trash2, Edit, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Checkbox } from '../../ui/checkbox';
import { Badge } from '../../ui/badge';
import { availabilityService, WeeklySchedule } from '../../../services/availabilityService';
import { Database } from '../../../lib/database.types';

type AvailabilitySlot = Database['public']['Tables']['availability_slots']['Row'];

interface AvailabilityManagerProps {
  coachId: string;
  onClose: () => void;
  onUpdate: () => void;
}

interface SlotForm {
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  sessionType: 'individual' | 'group' | 'video' | 'in_person';
  durationMinutes: number;
  maxClients: number;
  price: string;
}

const DAYS_OF_WEEK = [
  { value: 1, label: 'Lundi' },
  { value: 2, label: 'Mardi' },
  { value: 3, label: 'Mercredi' },
  { value: 4, label: 'Jeudi' },
  { value: 5, label: 'Vendredi' },
  { value: 6, label: 'Samedi' },
  { value: 0, label: 'Dimanche' }
];

const SESSION_TYPES = [
  { value: 'individual', label: 'Individuel' },
  { value: 'group', label: 'Groupe' },
  { value: 'video', label: 'Visioconférence' },
  { value: 'in_person', label: 'Présentiel' }
];

const TEMPLATE_SCHEDULES = [
  {
    name: 'Matinée',
    slots: [
      { start: '08:00', end: '09:00' },
      { start: '09:00', end: '10:00' },
      { start: '10:00', end: '11:00' },
      { start: '11:00', end: '12:00' }
    ]
  },
  {
    name: 'Après-midi',
    slots: [
      { start: '14:00', end: '15:00' },
      { start: '15:00', end: '16:00' },
      { start: '16:00', end: '17:00' },
      { start: '17:00', end: '18:00' }
    ]
  },
  {
    name: 'Soirée',
    slots: [
      { start: '18:00', end: '19:00' },
      { start: '19:00', end: '20:00' },
      { start: '20:00', end: '21:00' }
    ]
  }
];

export const AvailabilityManager: React.FC<AvailabilityManagerProps> = ({
  coachId,
  onClose,
  onUpdate
}) => {
  const [availability, setAvailability] = useState<WeeklySchedule>({});
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSlot, setEditingSlot] = useState<AvailabilitySlot | null>(null);
  
  const [slotForm, setSlotForm] = useState<SlotForm>({
    daysOfWeek: [],
    startTime: '09:00',
    endTime: '10:00',
    sessionType: 'individual',
    durationMinutes: 60,
    maxClients: 1,
    price: '80'
  });

  useEffect(() => {
    loadAvailability();
  }, [coachId]);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      const data = await availabilityService.getCoachAvailability(coachId);
      setAvailability(data);
    } catch (error) {
      console.error('Erreur lors du chargement des disponibilités:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (slotForm.daysOfWeek.length === 0) {
      alert('Veuillez sélectionner au moins un jour');
      return;
    }

    if (slotForm.startTime >= slotForm.endTime) {
      alert('L\'heure de fin doit être après l\'heure de début');
      return;
    }

    try {
      setLoading(true);

      if (editingSlot) {
        // Mise à jour d'un créneau existant
        await availabilityService.updateAvailabilitySlot(editingSlot.id, {
          start_time: slotForm.startTime,
          end_time: slotForm.endTime,
          session_type: slotForm.sessionType,
          duration_minutes: slotForm.durationMinutes,
          max_clients: slotForm.maxClients,
          price: parseFloat(slotForm.price) || null
        });
      } else {
        // Création de nouveaux créneaux
        await availabilityService.createRecurringSlots(
          coachId,
          slotForm.daysOfWeek,
          slotForm.startTime,
          slotForm.endTime,
          slotForm.sessionType,
          slotForm.durationMinutes,
          slotForm.maxClients,
          parseFloat(slotForm.price) || undefined
        );
      }

      await loadAvailability();
      onUpdate();
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du créneau');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slotId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce créneau ?')) {
      return;
    }

    try {
      setLoading(true);
      await availabilityService.deleteAvailabilitySlot(slotId);
      await loadAvailability();
      onUpdate();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du créneau');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (slotId: string, isActive: boolean) => {
    try {
      await availabilityService.toggleAvailabilitySlot(slotId, !isActive);
      await loadAvailability();
      onUpdate();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const handleEdit = (slot: AvailabilitySlot) => {
    setEditingSlot(slot);
    setSlotForm({
      daysOfWeek: [slot.day_of_week],
      startTime: slot.start_time,
      endTime: slot.end_time,
      sessionType: slot.session_type,
      durationMinutes: slot.duration_minutes,
      maxClients: slot.max_clients,
      price: slot.price?.toString() || '0'
    });
    setShowAddForm(true);
  };

  const handleApplyTemplate = async (templateName: string) => {
    const template = TEMPLATE_SCHEDULES.find(t => t.name === templateName);
    if (!template) return;

    if (!confirm(`Appliquer le modèle "${templateName}" du lundi au vendredi ?`)) {
      return;
    }

    try {
      setLoading(true);
      const weekdays = [1, 2, 3, 4, 5]; // Lundi à vendredi

      for (const slot of template.slots) {
        await availabilityService.createRecurringSlots(
          coachId,
          weekdays,
          slot.start,
          slot.end,
          'individual',
          60,
          1,
          80
        );
      }

      await loadAvailability();
      onUpdate();
    } catch (error) {
      console.error('Erreur lors de l\'application du modèle:', error);
      alert('Erreur lors de l\'application du modèle');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSlotForm({
      daysOfWeek: [],
      startTime: '09:00',
      endTime: '10:00',
      sessionType: 'individual',
      durationMinutes: 60,
      maxClients: 1,
      price: '80'
    });
    setEditingSlot(null);
    setShowAddForm(false);
  };

  const handleDayToggle = (day: number, checked: boolean) => {
    setSlotForm(prev => ({
      ...prev,
      daysOfWeek: checked
        ? [...prev.daysOfWeek, day]
        : prev.daysOfWeek.filter(d => d !== day)
    }));
  };

  const getSessionTypeLabel = (type: string) => {
    return SESSION_TYPES.find(st => st.value === type)?.label || type;
  };

  const getDayLabel = (dayOfWeek: number) => {
    return DAYS_OF_WEEK.find(d => d.value === dayOfWeek)?.label || '';
  };

  const getAllSlots = () => {
    const allSlots: (AvailabilitySlot & { dayLabel: string })[] = [];
    
    Object.entries(availability).forEach(([dayOfWeek, slots]) => {
      slots.forEach(slot => {
        allSlots.push({
          ...slot,
          dayLabel: getDayLabel(parseInt(dayOfWeek))
        });
      });
    });

    return allSlots.sort((a, b) => {
      if (a.day_of_week !== b.day_of_week) {
        return a.day_of_week - b.day_of_week;
      }
      return a.start_time.localeCompare(b.start_time);
    });
  };

  if (loading && !showAddForm) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Gestion des créneaux de disponibilité
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Actions rapides */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              {showAddForm ? 'Annuler' : 'Ajouter un créneau'}
            </Button>

            {TEMPLATE_SCHEDULES.map(template => (
              <Button
                key={template.name}
                variant="outline"
                size="sm"
                onClick={() => handleApplyTemplate(template.name)}
                disabled={loading}
              >
                Modèle {template.name}
              </Button>
            ))}
          </div>

          {/* Formulaire d'ajout/édition */}
          {showAddForm && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold mb-4">
                {editingSlot ? 'Modifier le créneau' : 'Nouveau créneau'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Jours de la semaine */}
                  <div className="md:col-span-2 lg:col-span-3">
                    <Label>Jours de la semaine</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {DAYS_OF_WEEK.map(day => (
                        <div key={day.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`day-${day.value}`}
                            checked={slotForm.daysOfWeek.includes(day.value)}
                            onCheckedChange={(checked) => 
                              handleDayToggle(day.value, checked as boolean)
                            }
                            disabled={editingSlot !== null} // Pas de modification des jours en édition
                          />
                          <Label 
                            htmlFor={`day-${day.value}`}
                            className="text-sm font-normal"
                          >
                            {day.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Horaires */}
                  <div>
                    <Label htmlFor="startTime">Heure de début</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={slotForm.startTime}
                      onChange={(e) => setSlotForm(prev => ({
                        ...prev,
                        startTime: e.target.value
                      }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="endTime">Heure de fin</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={slotForm.endTime}
                      onChange={(e) => setSlotForm(prev => ({
                        ...prev,
                        endTime: e.target.value
                      }))}
                      required
                    />
                  </div>

                  {/* Type de séance */}
                  <div>
                    <Label htmlFor="sessionType">Type de séance</Label>
                    <Select
                      value={slotForm.sessionType}
                      onValueChange={(value: any) => setSlotForm(prev => ({
                        ...prev,
                        sessionType: value
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SESSION_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Durée */}
                  <div>
                    <Label htmlFor="duration">Durée (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="15"
                      max="240"
                      step="15"
                      value={slotForm.durationMinutes}
                      onChange={(e) => setSlotForm(prev => ({
                        ...prev,
                        durationMinutes: parseInt(e.target.value)
                      }))}
                      required
                    />
                  </div>

                  {/* Nombre max de clients */}
                  <div>
                    <Label htmlFor="maxClients">Clients max</Label>
                    <Input
                      id="maxClients"
                      type="number"
                      min="1"
                      max="20"
                      value={slotForm.maxClients}
                      onChange={(e) => setSlotForm(prev => ({
                        ...prev,
                        maxClients: parseInt(e.target.value)
                      }))}
                      required
                    />
                  </div>

                  {/* Prix */}
                  <div>
                    <Label htmlFor="price">Prix (€)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={slotForm.price}
                      onChange={(e) => setSlotForm(prev => ({
                        ...prev,
                        price: e.target.value
                      }))}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={loading}>
                    {editingSlot ? 'Modifier' : 'Créer'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Annuler
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Liste des créneaux existants */}
          <div>
            <h3 className="font-semibold mb-4">Créneaux configurés</h3>
            
            {getAllSlots().length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Aucun créneau configuré. Cliquez sur "Ajouter un créneau" pour commencer.
              </p>
            ) : (
              <div className="space-y-2">
                {getAllSlots().map((slot) => (
                  <div
                    key={slot.id}
                    className={`
                      flex items-center justify-between p-3 rounded-lg border
                      ${slot.is_active ? 'bg-white' : 'bg-gray-100 opacity-75'}
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-600" />
                        <span className="font-medium">
                          {slot.dayLabel} {slot.start_time} - {slot.end_time}
                        </span>
                      </div>

                      <Badge variant="outline">
                        {getSessionTypeLabel(slot.session_type)}
                      </Badge>

                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{slot.max_clients}</span>
                      </div>

                      {slot.price && (
                        <div className="flex items-center gap-1 text-sm text-green-600">
                          <Euro className="w-4 h-4" />
                          <span>{slot.price}€</span>
                        </div>
                      )}

                      {!slot.is_active && (
                        <Badge variant="secondary">Désactivé</Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(slot)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleActive(slot.id, slot.is_active)}
                      >
                        {slot.is_active ? 'Désactiver' : 'Activer'}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(slot.id)}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
