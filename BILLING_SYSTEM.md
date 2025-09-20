# Système de Facturation & Paiements BYW

## 🎯 Vue d'ensemble

Le système de facturation BYW est une solution complète permettant aux coaches de gérer leurs revenus, facturer leurs clients et automatiser les paiements via Stripe.

## 🏗️ Architecture

### Base de données (Supabase)

#### Tables principales
- **`pricing_plans`** - Plans tarifaires des coaches
- **`subscriptions`** - Abonnements clients avec suivi des séances
- **`invoices`** - Factures avec numérotation automatique
- **`payments`** - Paiements intégrés Stripe
- **`payment_reminders`** - Système de relances automatiques
- **`payment_settings`** - Configuration Stripe sécurisée
- **`stripe_webhooks`** - Log des événements Stripe
- **`reminder_templates`** - Templates de relances personnalisables

#### Fonctions SQL
- **`get_coach_financial_stats`** - Statistiques financières des coaches
- **`create_subscription`** - Création d'abonnements
- **`create_invoice`** - Génération de factures

### Services TypeScript

#### `BillingService`
Gestion complète de la facturation :
- Plans tarifaires (CRUD)
- Abonnements clients
- Factures et paiements
- Statistiques financières

#### `StripeService`
Intégration Stripe sécurisée :
- Clients et produits
- Abonnements récurrents
- Paiements en ligne
- Webhooks

#### `ReminderService`
Relances automatiques :
- Templates personnalisables
- Planning des relances
- Statistiques de relances

### Composants UI

#### Côté Coach
- **`CoachBillingPage`** - Dashboard principal de facturation
- **`PricingPlanModal`** - Gestion des plans tarifaires
- **`InvoiceModal`** - Création/modification de factures
- **`StripeSettingsModal`** - Configuration Stripe
- **`FinancialDashboard`** - Analyses financières
- **`ReminderManagement`** - Gestion des relances

#### Côté Client
- **`ClientBillingPage`** - Interface client pour les factures
- **`StripePaymentForm`** - Formulaire de paiement sécurisé
- **`InvoiceDetailsModal`** - Détails des factures

## 🚀 Fonctionnalités

### Facturation
- ✅ Génération automatique de factures
- ✅ Numérotation séquentielle (BYW-2025-001)
- ✅ Factures manuelles personnalisables
- ✅ Calcul automatique des totaux
- ✅ Support multi-devises

### Paiements Stripe
- ✅ Cartes bancaires (Visa, Mastercard, etc.)
- ✅ Prélèvements SEPA
- ✅ Apple Pay / Google Pay
- ✅ Paiements récurrents
- ✅ Gestion des échecs de paiement

### Abonnements
- ✅ Forfaits séances avec décompte
- ✅ Abonnements illimités
- ✅ Pause/reprise d'abonnements
- ✅ Changement de formules
- ✅ Résiliation avec préavis

### Relances automatiques
- ✅ 1ère relance (3 jours) - Amicale
- ✅ 2ème relance (7 jours) - Ferme
- ✅ Mise en demeure (15 jours) - Formelle
- ✅ Suspension service (30 jours)
- ✅ Templates personnalisables

### Dashboard financier
- ✅ Revenus mensuels/annuels
- ✅ Taux de paiement à temps
- ✅ Top clients par revenus
- ✅ Analyse des impayés
- ✅ Graphiques d'évolution

## 🔧 Configuration

### 1. Base de données
```bash
# Appliquer les migrations
npx supabase db push
```

### 2. Variables d'environnement
```env
# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 3. Configuration Stripe
1. Créer un compte Stripe
2. Récupérer les clés API (test/prod)
3. Configurer les webhooks
4. Configurer les moyens de paiement

### 4. Webhooks Stripe
Endpoint : `https://your-domain.com/supabase/functions/v1/stripe-webhook`

Événements à écouter :
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

## 📊 Utilisation

### Pour les Coaches

#### Configuration initiale
1. Aller dans "Facturation" → "Configuration Stripe"
2. Saisir les clés API Stripe
3. Configurer les informations de l'entreprise
4. Définir les délais de relance

#### Création de plans tarifaires
1. "Facturation" → "Plans tarifaires" → "Nouveau plan"
2. Définir nom, prix, type de facturation
3. Ajouter les fonctionnalités incluses
4. Activer le plan

#### Gestion des factures
1. Factures automatiques selon les abonnements
2. Factures manuelles via "Nouvelle facture"
3. Suivi des paiements en temps réel
4. Relances automatiques des impayés

#### Analyses financières
1. Dashboard avec métriques clés
2. Graphiques d'évolution des revenus
3. Top clients par revenus
4. Analyse des moyens de paiement

### Pour les Clients

#### Consultation des factures
1. "Mes factures" → Historique complet
2. Détails de chaque facture
3. Téléchargement des PDF
4. Statut des paiements

#### Paiement en ligne
1. Cliquer sur "Payer" pour une facture
2. Choisir le moyen de paiement
3. Saisir les informations de paiement
4. Confirmation automatique

#### Gestion des abonnements
1. "Mes abonnements" → Vue d'ensemble
2. Pause/reprise d'abonnement
3. Changement de formule
4. Résiliation

## 🔒 Sécurité

### Conformité PCI DSS
- Aucune donnée de carte stockée
- Chiffrement bout en bout via Stripe
- Tokénisation des moyens de paiement

### Protection des données
- RLS (Row Level Security) activé
- Chiffrement des clés sensibles
- Logs d'audit des transactions
- Conformité RGPD

### Webhooks sécurisés
- Vérification des signatures Stripe
- Validation des événements
- Gestion des erreurs et retry

## 📈 Statistiques et rapports

### Métriques disponibles
- Revenus totaux et récurrents
- Taux de paiement à temps
- Nombre de factures impayées
- Top clients par revenus
- Répartition par type de service
- Évolution mensuelle des paiements

### Exports
- CSV des transactions
- PDF des factures
- Rapports de relances
- Données comptables (FEC)

## 🛠️ Maintenance

### Monitoring
- Logs des webhooks Stripe
- Suivi des erreurs de paiement
- Alertes de factures en retard
- Statistiques de relances

### Sauvegarde
- Sauvegarde automatique des données
- Archivage des factures (10 ans)
- Rétention des logs d'audit

### Mises à jour
- Migrations de base de données
- Mise à jour des composants UI
- Synchronisation avec Stripe

## 🚨 Dépannage

### Problèmes courants

#### Paiements échoués
1. Vérifier la configuration Stripe
2. Contrôler les logs des webhooks
3. Valider les informations client

#### Relances non envoyées
1. Vérifier la configuration email
2. Contrôler les templates de relance
3. Valider les délais configurés

#### Erreurs de webhook
1. Vérifier la signature Stripe
2. Contrôler les logs Supabase
3. Valider la configuration des événements

### Support
- Logs détaillés dans Supabase
- Monitoring des erreurs
- Documentation Stripe
- Support technique BYW

## 🔮 Évolutions futures

### Fonctionnalités prévues
- Intégration PayPal
- Chèques vacances/sports
- Paiements en plusieurs fois
- Multi-devises avancé
- Intégration comptabilité (Sage, QuickBooks)
- Notifications push
- API publique pour intégrations

### Améliorations techniques
- Cache Redis pour les performances
- Queue de traitement des webhooks
- Monitoring avancé
- Tests automatisés
- CI/CD pour les déploiements

---

## 📞 Support

Pour toute question ou problème :
1. Consulter cette documentation
2. Vérifier les logs d'erreur
3. Contacter le support technique BYW

**Version :** 1.0.0  
**Dernière mise à jour :** Janvier 2025