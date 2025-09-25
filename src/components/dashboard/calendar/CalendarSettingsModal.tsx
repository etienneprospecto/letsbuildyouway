import React, { useState, useEffect } from 'react';
import { X, Settings, Save, Clock, Zap, Bell, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Checkbox } from '../../ui/checkbox';
import { Textarea } from '../../ui/textarea';
import { calendarSyncService } from '../../../services/calendarSyncService';
import { Database } from '../../../lib/database.types';

type CalendarSettings = Database['public']['Tables']['calendar_settings']['Row'];

interface CalendarSettingsModalProps {
  coachId: string;
  onClose: () => void;
}

export const CalendarSettingsModal: React.FC<CalendarSettingsModalProps> = ({
  coachId,
  onClose
}) => {
  const [settings, setSettings] = useState<CalendarSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    auto_sync_enabled: true,
    travel_time_minutes: 15,
    event_prefix: 'BYW - ',
    include_client_details: true,
    sync_frequency_minutes: 15,
    conflict_resolution_mode: 'manual' as 'manual' | 'auto_reschedule' | 'auto_block',
    auto_create_meeting_links: true,
    default_meeting_provider: 'zoom',
    reminder_24h_enabled: true,
    reminder_2h_enabled: true
  });

  useEffect(() => {
    loadSettings();
  }, [coachId]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await calendarSyncService.getCalendarSettings(coachId);
      
      if (data) {
        setSettings(data);
        setFormData({
          auto_sync_enabled: data.auto_sync_enabled,
          travel_time_minutes: data.travel_time_minutes,
          event_prefix: data.event_prefix,
          include_client_details: data.include_client_details,
          sync_frequency_minutes: data.sync_frequency_minutes,
          conflict_resolution_mode: data.conflict_resolution_mode,
          auto_create_meeting_links: data.auto_create_meeting_links,
          default_meeting_provider: data.default_meeting_provider || 'zoom',
          reminder_24h_enabled: data.reminder_24h_enabled,
          reminder_2h_enabled: data.reminder_2h_enabled
        });
      }
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      await calendarSyncService.updateCalendarSettings(coachId, {
        auto_sync_enabled: formData.auto_sync_enabled,
        travel_time_minutes: formData.travel_time_minutes,
        event_prefix: formData.event_prefix,
        include_client_details: formData.include_client_details,
        sync_frequency_minutes: formData.sync_frequency_minutes,
        conflict_resolution_mode: formData.conflict_resolution_mode,
        auto_create_meeting_links: formData.auto_create_meeting_links,
        default_meeting_provider: formData.default_meeting_provider,
        reminder_24h_enabled: formData.reminder_24h_enabled,
        reminder_2h_enabled: formData.reminder_2h_enabled
      });

      onClose();
    } catch (error) {

      alert('Erreur lors de la sauvegarde des paramètres');
    } finally {
      setSaving(false);
    }
  };

  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Paramètres du calendrier
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Synchronisation */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Synchronisation
            </h3>

            <div className="space-y-4 pl-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="auto_sync"
                  checked={formData.auto_sync_enabled}
                  onCheckedChange={(checked) => 
                    updateFormData('auto_sync_enabled', checked)
                  }
                />
                <Label htmlFor="auto_sync">
                  Activer la synchronisation automatique
                </Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sync_frequency">
                    Fréquence de synchronisation (minutes)
                  </Label>
                  <Select
                    value={formData.sync_frequency_minutes.toString()}
                    onValueChange={(value) => 
                      updateFormData('sync_frequency_minutes', parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 heure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="travel_time">
                    Temps de trajet (minutes)
                  </Label>
                  <Input
                    id="travel_time"
                    type="number"
                    min="0"
                    max="120"
                    value={formData.travel_time_minutes}
                    onChange={(e) => 
                      updateFormData('travel_time_minutes', parseInt(e.target.value))
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="conflict_resolution">
                  Gestion des conflits
                </Label>
                <Select
                  value={formData.conflict_resolution_mode}
                  onValueChange={(value) => 
                    updateFormData('conflict_resolution_mode', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manuel</SelectItem>
                    <SelectItem value="auto_reschedule">Reprogrammer automatiquement</SelectItem>
                    <SelectItem value="auto_block">Bloquer automatiquement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Événements externes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Événements externes
            </h3>

            <div className="space-y-4 pl-6">
              <div>
                <Label htmlFor="event_prefix">
                  Préfixe des événements BYW
                </Label>
                <Input
                  id="event_prefix"
                  value={formData.event_prefix}
                  onChange={(e) => updateFormData('event_prefix', e.target.value)}
                  placeholder="BYW - "
                />
                <p className="text-sm text-gray-600 mt-1">
                  Ce préfixe sera ajouté aux événements créés dans vos calendriers externes
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include_client_details"
                  checked={formData.include_client_details}
                  onCheckedChange={(checked) => 
                    updateFormData('include_client_details', checked)
                  }
                />
                <Label htmlFor="include_client_details">
                  Inclure les détails du client dans les événements externes
                </Label>
              </div>
            </div>
          </div>

          {/* Visioconférences */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Visioconférences
            </h3>

            <div className="space-y-4 pl-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="auto_create_links"
                  checked={formData.auto_create_meeting_links}
                  onCheckedChange={(checked) => 
                    updateFormData('auto_create_meeting_links', checked)
                  }
                />
                <Label htmlFor="auto_create_links">
                  Créer automatiquement les liens de visioconférence
                </Label>
              </div>

              <div>
                <Label htmlFor="meeting_provider">
                  Fournisseur de visioconférence par défaut
                </Label>
                <Select
                  value={formData.default_meeting_provider}
                  onValueChange={(value) => 
                    updateFormData('default_meeting_provider', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zoom">Zoom</SelectItem>
                    <SelectItem value="meet">Google Meet</SelectItem>
                    <SelectItem value="teams">Microsoft Teams</SelectItem>
                    <SelectItem value="manual">Manuel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications et rappels
            </h3>

            <div className="space-y-4 pl-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reminder_24h"
                  checked={formData.reminder_24h_enabled}
                  onCheckedChange={(checked) => 
                    updateFormData('reminder_24h_enabled', checked)
                  }
                />
                <Label htmlFor="reminder_24h">
                  Rappel 24h avant le rendez-vous
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reminder_2h"
                  checked={formData.reminder_2h_enabled}
                  onCheckedChange={(checked) => 
                    updateFormData('reminder_2h_enabled', checked)
                  }
                />
                <Label htmlFor="reminder_2h">
                  Rappel 2h avant le rendez-vous
                </Label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-6 border-t">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Annuler
            </Button>
            
            <Button onClick={handleSave} disabled={saving} variant="default" className="gap-2">
              <Save className="w-4 h-4" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
