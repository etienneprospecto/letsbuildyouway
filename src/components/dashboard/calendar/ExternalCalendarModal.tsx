import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Switch } from '../../ui/switch';
import { Textarea } from '../../ui/textarea';
import { HelpTooltip } from '../../ui/help-tooltip';
import { useAuth } from '../../../providers/AuthProvider';
import { externalCalendarService } from '../../../services/externalCalendarService';
import { Calendar, Plus, Settings, Trash2, TestTube, RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Database } from '../../../lib/database.types';

type CalendarIntegration = Database['public']['Tables']['calendar_integrations']['Row'];
type CalendarProvider = Database['public']['Enums']['calendar_provider'];

interface ExternalCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface IntegrationForm {
  provider: CalendarProvider | '';
  calendar_id: string;
  api_key: string;
  access_token: string;
  calendar_name: string;
  sync_settings: {
    syncFrequency: number;
    autoImport: boolean;
    autoExport: boolean;
    conflictResolution: 'manual' | 'auto_reschedule' | 'auto_block';
  };
}

const PROVIDER_INFO = {
  google: {
    name: 'Google Calendar',
    description: 'Synchronisation avec Google Calendar via API',
    apiKeyLabel: 'Clé API Google',
    apiKeyHelp: 'Créez une clé API dans Google Cloud Console avec accès à Calendar API',
    calendarIdHelp: 'ID du calendrier (ex: primary ou votre-email@gmail.com)',
    docsUrl: 'https://developers.google.com/calendar/api/guides/auth'
  },
  outlook: {
    name: 'Outlook Calendar',
    description: 'Synchronisation avec Outlook via Microsoft Graph API',
    apiKeyLabel: 'Token d\'accès',
    apiKeyHelp: 'Token d\'accès Microsoft Graph avec permissions Calendar.Read',
    calendarIdHelp: 'ID du calendrier Outlook (ex: primary)',
    docsUrl: 'https://docs.microsoft.com/en-us/graph/auth/'
  },
  apple: {
    name: 'Apple Calendar',
    description: 'Synchronisation avec iCloud Calendar (CalDAV)',
    apiKeyLabel: 'Mot de passe d\'app',
    apiKeyHelp: 'Mot de passe spécifique à l\'application depuis iCloud',
    calendarIdHelp: 'URL CalDAV de votre calendrier',
    docsUrl: 'https://support.apple.com/en-us/HT204397'
  }
};

export const ExternalCalendarModal: React.FC<ExternalCalendarModalProps> = ({
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'integrations' | 'add' | 'settings'>('integrations');
  const [integrations, setIntegrations] = useState<CalendarIntegration[]>([]);
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);

  const [form, setForm] = useState<IntegrationForm>({
    provider: '',
    calendar_id: '',
    api_key: '',
    access_token: '',
    calendar_name: '',
    sync_settings: {
      syncFrequency: 15,
      autoImport: true,
      autoExport: true,
      conflictResolution: 'manual'
    }
  });

  useEffect(() => {
    if (isOpen && user) {
      loadIntegrations();
    }
  }, [isOpen, user]);

  const loadIntegrations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await externalCalendarService.getIntegrations(user.id);
      setIntegrations(data);
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.provider) return;

    setLoading(true);
    try {
      const integration = await externalCalendarService.createIntegration({
        coach_id: user.id,
        provider: form.provider,
        calendar_id: form.calendar_id,
        api_key: form.api_key || null,
        access_token: form.access_token || null,
        calendar_name: form.calendar_name || null,
        sync_settings: form.sync_settings,
        is_active: true
      });

      if (integration) {
        await loadIntegrations();
        resetForm();
        setActiveTab('integrations');
      }
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette intégration ?')) return;

    setLoading(true);
    try {
      await externalCalendarService.deleteIntegration(id);
      await loadIntegrations();
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async (integration: CalendarIntegration) => {
    setTestingConnection(integration.id);
    try {
      const success = await externalCalendarService.testConnection(integration);

    } catch (error) {

    } finally {
      setTestingConnection(null);
    }
  };

  const handleSync = async (integrationId: string) => {
    setSyncing(integrationId);
    try {
      const result = await externalCalendarService.syncCalendar(integrationId);

      await loadIntegrations();
    } catch (error) {

    } finally {
      setSyncing(null);
    }
  };

  const resetForm = () => {
    setForm({
      provider: '',
      calendar_id: '',
      api_key: '',
      access_token: '',
      calendar_name: '',
      sync_settings: {
        syncFrequency: 15,
        autoImport: true,
        autoExport: true,
        conflictResolution: 'manual'
      }
    });
  };

  const getStatusBadge = (integration: CalendarIntegration) => {
    if (!integration.is_active) {
      return <Badge variant="secondary">Inactif</Badge>;
    }
    
    if (integration.last_error) {
      return <Badge variant="destructive">Erreur</Badge>;
    }
    
    if (integration.last_sync) {
      const lastSync = new Date(integration.last_sync);
      const now = new Date();
      const diffHours = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);
      
      if (diffHours < 1) {
        return <Badge variant="default">Synchronisé</Badge>;
      } else if (diffHours < 24) {
        return <Badge variant="secondary">Sync il y a {Math.floor(diffHours)}h</Badge>;
      } else {
        return <Badge variant="outline">Sync ancienne</Badge>;
      }
    }
    
    return <Badge variant="outline">Non synchronisé</Badge>;
  };

  const selectedProviderInfo = form.provider ? PROVIDER_INFO[form.provider] : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Intégration Calendriers Externes
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="integrations">Mes Intégrations</TabsTrigger>
            <TabsTrigger value="add">Ajouter</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          {/* ONGLET INTÉGRATIONS */}
          <TabsContent value="integrations" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">Chargement...</div>
            ) : integrations.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    Aucune intégration calendrier configurée
                  </p>
                  <Button onClick={() => setActiveTab('add')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une intégration
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {integrations.map((integration) => (
                  <Card key={integration.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5" />
                          <div>
                            <CardTitle className="text-lg">
                              {PROVIDER_INFO[integration.provider]?.name || integration.provider}
                            </CardTitle>
                            <CardDescription>
                              {integration.calendar_name || integration.calendar_id}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(integration)}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      {integration.last_error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-red-800">Erreur de synchronisation</p>
                              <p className="text-sm text-red-600">{integration.last_error}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          {integration.last_sync ? (
                            `Dernière sync: ${new Date(integration.last_sync).toLocaleString('fr-FR')}`
                          ) : (
                            'Jamais synchronisé'
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTestConnection(integration)}
                            disabled={testingConnection === integration.id}
                          >
                            {testingConnection === integration.id ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            ) : (
                              <TestTube className="h-4 w-4" />
                            )}
                            Test
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSync(integration.id)}
                            disabled={syncing === integration.id}
                          >
                            {syncing === integration.id ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                            Sync
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(integration.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ONGLET AJOUTER */}
          <TabsContent value="add" className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Sélection du provider */}
              <Card>
                <CardHeader>
                  <CardTitle>1. Choisir le calendrier</CardTitle>
                  <CardDescription>
                    Sélectionnez le type de calendrier à synchroniser
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="provider">Type de calendrier</Label>
                      <Select
                        value={form.provider}
                        onValueChange={(value) => setForm({ ...form, provider: value as CalendarProvider })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir un type de calendrier" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="google">Google Calendar</SelectItem>
                          <SelectItem value="outlook">Outlook Calendar</SelectItem>
                          <SelectItem value="apple">Apple Calendar (iCloud)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedProviderInfo && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">{selectedProviderInfo.name}</h4>
                        <p className="text-sm text-blue-700 mb-3">{selectedProviderInfo.description}</p>
                        <a 
                          href={selectedProviderInfo.docsUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 underline"
                        >
                          Documentation →
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Configuration */}
              {form.provider && (
                <Card>
                  <CardHeader>
                    <CardTitle>2. Configuration</CardTitle>
                    <CardDescription>
                      Configurez les paramètres de connexion
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="api_key" className="flex items-center gap-2">
                          {selectedProviderInfo?.apiKeyLabel}
                          <HelpTooltip content={selectedProviderInfo?.apiKeyHelp} />
                        </Label>
                        <Input
                          id="api_key"
                          type="password"
                          value={form.api_key}
                          onChange={(e) => setForm({ ...form, api_key: e.target.value })}
                          placeholder="Votre clé API ou token d'accès"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="calendar_id" className="flex items-center gap-2">
                          ID du calendrier
                          <HelpTooltip content={selectedProviderInfo?.calendarIdHelp} />
                        </Label>
                        <Input
                          id="calendar_id"
                          value={form.calendar_id}
                          onChange={(e) => setForm({ ...form, calendar_id: e.target.value })}
                          placeholder="primary ou votre-email@gmail.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="calendar_name">Nom du calendrier (optionnel)</Label>
                      <Input
                        id="calendar_name"
                        value={form.calendar_name}
                        onChange={(e) => setForm({ ...form, calendar_name: e.target.value })}
                        placeholder="Mon calendrier professionnel"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Paramètres de synchronisation */}
              {form.provider && (
                <Card>
                  <CardHeader>
                    <CardTitle>3. Paramètres de synchronisation</CardTitle>
                    <CardDescription>
                      Configurez comment synchroniser les événements
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="sync_frequency">Fréquence de sync (minutes)</Label>
                        <Select
                          value={form.sync_settings.syncFrequency.toString()}
                          onValueChange={(value) => setForm({
                            ...form,
                            sync_settings: {
                              ...form.sync_settings,
                              syncFrequency: parseInt(value)
                            }
                          })}
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

                      <div className="space-y-2">
                        <Label htmlFor="conflict_resolution">Résolution des conflits</Label>
                        <Select
                          value={form.sync_settings.conflictResolution}
                          onValueChange={(value) => setForm({
                            ...form,
                            sync_settings: {
                              ...form.sync_settings,
                              conflictResolution: value as any
                            }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manual">Manuel</SelectItem>
                            <SelectItem value="auto_reschedule">Reporter automatiquement</SelectItem>
                            <SelectItem value="auto_block">Bloquer le créneau</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <Label htmlFor="auto_import">Import automatique</Label>
                        <p className="text-sm text-muted-foreground">
                          Importer les événements du calendrier externe
                        </p>
                      </div>
                      <Switch
                        id="auto_import"
                        checked={form.sync_settings.autoImport}
                        onCheckedChange={(checked) => setForm({
                          ...form,
                          sync_settings: {
                            ...form.sync_settings,
                            autoImport: checked
                          }
                        })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <Label htmlFor="auto_export">Export automatique</Label>
                        <p className="text-sm text-muted-foreground">
                          Exporter les RDV BYW vers le calendrier externe
                        </p>
                      </div>
                      <Switch
                        id="auto_export"
                        checked={form.sync_settings.autoExport}
                        onCheckedChange={(checked) => setForm({
                          ...form,
                          sync_settings: {
                            ...form.sync_settings,
                            autoExport: checked
                          }
                        })}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Boutons */}
              {form.provider && (
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        Création...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Créer l'intégration
                      </>
                    )}
                  </Button>
                </div>
              )}
            </form>
          </TabsContent>

          {/* ONGLET PARAMÈTRES */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres généraux</CardTitle>
                <CardDescription>
                  Configuration globale de la synchronisation calendrier
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label>Synchronisation automatique</Label>
                    <p className="text-sm text-muted-foreground">
                      Activer la synchronisation automatique en arrière-plan
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label>Notifications de conflit</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir des notifications en cas de conflit détecté
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label>Temps de trajet par défaut (minutes)</Label>
                  <Select defaultValue="15">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Aucun</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 heure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
