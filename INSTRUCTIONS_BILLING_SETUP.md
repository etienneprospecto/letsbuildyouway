# 🚀 Instructions de Configuration du Système de Facturation

## 📋 Étapes à suivre

### 1. Accéder à votre interface Supabase
1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous à votre compte
3. Sélectionnez votre projet BYW
4. Allez dans l'onglet **"SQL Editor"**

### 2. Exécuter le script de création des tables
1. Dans l'éditeur SQL, cliquez sur **"New query"**
2. Copiez tout le contenu du fichier `setup_billing_tables.sql`
3. Collez-le dans l'éditeur
4. Cliquez sur **"Run"** pour exécuter le script

### 3. Vérifier que tout fonctionne
1. Créez une nouvelle requête
2. Copiez tout le contenu du fichier `test_billing_system.sql`
3. Collez-le dans l'éditeur
4. Cliquez sur **"Run"** pour exécuter les tests
5. Vérifiez que toutes les colonnes "status" affichent ✅

### 4. Tester le système dans l'application
1. Redémarrez votre serveur de développement :
   ```bash
   npm run dev
   ```
2. Connectez-vous en tant que coach
3. Allez dans **"Facturation"** dans la sidebar
4. Testez la création d'un plan tarifaire
5. Testez la création d'une facture

## 🔧 Ce que le script crée

### Tables principales
- ✅ `pricing_plans` - Plans tarifaires des coaches
- ✅ `subscriptions` - Abonnements clients
- ✅ `invoices` - Factures avec numérotation automatique
- ✅ `payments` - Paiements Stripe
- ✅ `payment_reminders` - Système de relances
- ✅ `payment_settings` - Configuration Stripe
- ✅ `stripe_webhooks` - Log des événements Stripe
- ✅ `reminder_templates` - Templates de relances

### Types ENUM
- ✅ `billing_interval` - Types de facturation
- ✅ `subscription_status` - Statuts d'abonnement
- ✅ `invoice_status` - Statuts de facture
- ✅ `payment_status` - Statuts de paiement
- ✅ `payment_method` - Moyens de paiement
- ✅ `reminder_type` - Types de relance
- ✅ `reminder_status` - Statuts de relance

### Sécurité
- ✅ RLS (Row Level Security) activé
- ✅ Politiques de sécurité configurées
- ✅ Index pour les performances
- ✅ Triggers pour les timestamps

### Fonctions
- ✅ `get_coach_financial_stats()` - Statistiques financières
- ✅ `update_updated_at_column()` - Mise à jour automatique des timestamps

## 🎯 Résultat attendu

Après l'exécution du script, vous devriez pouvoir :
- ✅ Créer des plans tarifaires
- ✅ Générer des factures
- ✅ Gérer les abonnements clients
- ✅ Configurer Stripe
- ✅ Utiliser toutes les fonctionnalités de facturation

## 🚨 En cas de problème

### Erreur "table already exists"
- C'est normal, le script utilise `CREATE TABLE IF NOT EXISTS`
- Continuez l'exécution

### Erreur "type already exists"
- C'est normal, le script utilise `DO $$ BEGIN ... EXCEPTION ... END $$`
- Continuez l'exécution

### Erreur de permissions
- Vérifiez que vous êtes connecté avec un compte administrateur
- Vérifiez que votre projet Supabase est actif

### Tables manquantes après l'exécution
- Relancez le script `setup_billing_tables.sql`
- Vérifiez les logs d'erreur dans Supabase

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs dans l'interface Supabase
2. Exécutez le script de test pour identifier les problèmes
3. Contactez le support technique

---

**Une fois le script exécuté avec succès, votre système de facturation BYW sera 100% fonctionnel !** 🎉
