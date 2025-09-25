import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { useAuth } from '../../../providers/AuthProvider';
import { externalCalendarService } from '../../../services/externalCalendarService';
import { appointmentService } from '../../../services/appointmentService';
import { AlertTriangle, Clock, Calendar, Users, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ConflictsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConflictResolved?: () => void;
}

interface CalendarConflict {
  conflict_type: string;
  conflict_id: string;
  conflict_title: string;
  conflict_start: string;
  conflict_end: string;
  provider: string;
  severity: string;
}

export const ConflictsModal: React.FC<ConflictsModalProps> = ({
  isOpen,
  onClose,
  onConflictResolved
}) => {
  const { user } = useAuth();
  const [conflicts, setConflicts] = useState<CalendarConflict[]>([]);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      loadConflicts();
    }
  }, [isOpen, user]);

  const loadConflicts = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await externalCalendarService.detectConflicts(user.id);
      setConflicts(data);
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  const handleResolveConflict = async (conflict: CalendarConflict, action: 'reschedule' | 'cancel' | 'ignore') => {
    if (!user) return;

    setResolving(conflict.conflict_id);
    try {
      switch (action) {
        case 'reschedule':
          // Pour l'instant, on simule une reprogrammation

          break;
        
        case 'cancel':
          if (conflict.conflict_type === 'appointment') {
            await appointmentService.updateAppointment(conflict.conflict_id, { status: 'cancelled' });
          }
          break;
        
        case 'ignore':
          // Marquer le conflit comme ignoré (fonctionnalité future)

          break;
      }

      await loadConflicts();
      onConflictResolved?.();
    } catch (error) {

    } finally {
      setResolving(null);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <XCircle className="h-4 w-4" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4" />;
      case 'low':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getConflictTypeLabel = (type: string) => {
    switch (type) {
      case 'appointment':
        return 'Rendez-vous BYW';
      case 'external_event':
        return 'Événement externe';
      default:
        return 'Conflit';
    }
  };

  const getProviderLabel = (provider: string) => {
    switch (provider) {
      case 'google':
        return 'Google Calendar';
      case 'outlook':
        return 'Outlook';
      case 'apple':
        return 'Apple Calendar';
      case 'byw':
        return 'BYW';
      default:
        return provider;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Conflits de calendrier détectés
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Analyse des conflits en cours...</p>
            </div>
          ) : conflicts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-medium mb-2">Aucun conflit détecté</h3>
                <p className="text-muted-foreground">
                  Votre calendrier ne présente aucun conflit pour les prochains jours.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Résumé */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-full">
                        <XCircle className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-red-600">
                          {conflicts.filter(c => c.severity === 'high').length}
                        </p>
                        <p className="text-sm text-muted-foreground">Conflits critiques</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-100 rounded-full">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-yellow-600">
                          {conflicts.filter(c => c.severity === 'medium').length}
                        </p>
                        <p className="text-sm text-muted-foreground">Conflits modérés</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-600">
                          {conflicts.filter(c => c.severity === 'low').length}
                        </p>
                        <p className="text-sm text-muted-foreground">Conflits mineurs</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Liste des conflits */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Conflits à résoudre</h3>
                
                {conflicts.map((conflict, index) => (
                  <Card key={`${conflict.conflict_id}-${index}`} className="border-l-4 border-l-orange-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge className={`${getSeverityColor(conflict.severity)} flex items-center gap-1`}>
                            {getSeverityIcon(conflict.severity)}
                            {conflict.severity === 'high' ? 'Critique' : 
                             conflict.severity === 'medium' ? 'Modéré' : 'Mineur'}
                          </Badge>
                          
                          <Badge variant="outline">
                            {getConflictTypeLabel(conflict.conflict_type)}
                          </Badge>
                          
                          <Badge variant="secondary">
                            {getProviderLabel(conflict.provider)}
                          </Badge>
                        </div>
                      </div>
                      
                      <CardTitle className="text-lg">{conflict.conflict_title}</CardTitle>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {format(new Date(conflict.conflict_start), 'EEEE dd MMMM yyyy', { locale: fr })}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>
                            {format(new Date(conflict.conflict_start), 'HH:mm', { locale: fr })} - {' '}
                            {format(new Date(conflict.conflict_end), 'HH:mm', { locale: fr })}
                          </span>
                        </div>
                      </div>

                      {/* Description du conflit */}
                      <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-sm text-orange-800">
                          <strong>Conflit détecté :</strong> Ce créneau est occupé par un autre événement 
                          dans votre calendrier {getProviderLabel(conflict.provider)}.
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolveConflict(conflict, 'reschedule')}
                          disabled={resolving === conflict.conflict_id}
                          className="gap-2"
                        >
                          <Calendar className="h-4 w-4" />
                          Reprogrammer
                        </Button>

                        {conflict.conflict_type === 'appointment' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResolveConflict(conflict, 'cancel')}
                            disabled={resolving === conflict.conflict_id}
                            className="gap-2 text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4" />
                            Annuler le RDV
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleResolveConflict(conflict, 'ignore')}
                          disabled={resolving === conflict.conflict_id}
                          className="gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Ignorer
                        </Button>

                        {resolving === conflict.conflict_id && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            Résolution en cours...
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* Actions globales */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="outline"
              onClick={loadConflicts}
              disabled={loading}
              className="gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Actualiser les conflits
            </Button>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Fermer
              </Button>
              
              {conflicts.length > 0 && (
                <Button onClick={() => {
                  // Résoudre tous les conflits automatiquement (fonctionnalité future)

                }}>
                  Résoudre automatiquement
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
