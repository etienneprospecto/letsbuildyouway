# 🚀 GUIDE DE DÉPLOIEMENT - FLUX PAIEMENT BYW

## 📋 RÉSUMÉ DU FLUX

Le système complet permet maintenant :

1. **Coach visite le site** → Page pricing avec 3 packs
2. **Clique sur un pack** → Redirection vers Stripe Checkout
3. **Paye avec sa carte** → Webhook Stripe déclenché
4. **Compte créé automatiquement** → Mot de passe provisoire généré
5. **Email envoyé** → Identifiants de connexion
6. **Coach se connecte** → Changement de mot de passe obligatoire
7. **Accès au dashboard** → Limites selon le pack acheté

---

## 🛠️ CONFIGURATION REQUISE

### 1. Variables d'Environnement

```bash
# Supabase
VITE_SUPABASE_URL=https://chrhxkcppvigxqlsxgqo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51SC8H4PyYNBRhOhAHSOJLOvxNcNyhLZzsbZor6oC2GQTlbiiLKifmD2fy06WDFHhKNfd1u2f07ERoZNgNub4pxmT00VOVfscba
STRIPE_SECRET_KEY=sk_test_51SC8H4PyYNBRhOhA...
STRIPE_WEBHOOK_SECRET=whsec_...

# Application
VITE_APP_URL=http://localhost:5173

# Email (optionnel)
RESEND_API_KEY=re_...
SENDGRID_API_KEY=SG...
MAILGUN_API_KEY=key-...
FROM_EMAIL=onboarding@byw.app
```

### 2. Configuration Stripe

#### Produits et Prix (Déjà créés)
- **Warm-Up Pack** : `price_1SCJ9WPyYNBRhOhApONh7U6A` (19,99€)
- **Transformationnel Pack** : `price_1SCJEXPyYNBRhOhAb64UZYVo` (39,99€)
- **Elite Pack** : `price_1SCJEoPyYNBRhOhA0tN68xOU` (69,99€)

#### Webhook Stripe
1. Aller dans Stripe Dashboard > Webhooks
2. Créer un nouveau webhook
3. URL : `https://chrhxkcppvigxqlsxgqo.supabase.co/functions/v1/stripe-webhook`
4. Événements : `checkout.session.completed`
5. Copier le secret webhook dans `STRIPE_WEBHOOK_SECRET`

### 3. Configuration Supabase

#### Tables (Déjà créées)
- `profiles` : Profils utilisateurs avec limites de pack
- `stripe_webhooks` : Logs des webhooks
- Toutes les autres tables du système

#### Edge Functions (Déjà déployées)
- `stripe-webhook` : Traitement des paiements
- `send-email-reliable` : Envoi d'emails

---

## 🚀 DÉPLOIEMENT

### 1. Déployer les Edge Functions

```bash
# Déployer le webhook Stripe
supabase functions deploy stripe-webhook

# Déployer le service email
supabase functions deploy send-email-reliable
```

### 2. Configurer les Variables d'Environnement Supabase

```bash
# Dans Supabase Dashboard > Settings > Edge Functions
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
BASE_URL=https://byw.app
RESEND_API_KEY=re_...
```

### 3. Tester le Flux

```bash
# 1. Ouvrir le script de test
open test_payment_flow.html

# 2. Tester chaque étape :
# - Création session Stripe
# - Paiement avec carte test
# - Vérification email
# - Connexion avec mot de passe provisoire
# - Changement de mot de passe
# - Dashboard coach
```

---

## 🧪 TESTS DE VALIDATION

### Test 1 : Paiement Warm-Up
1. Aller sur `/pricing`
2. Cliquer sur "Warm-Up" (19,99€)
3. Utiliser carte test : `4242 4242 4242 4242`
4. Vérifier que le compte est créé
5. Vérifier l'email reçu
6. Se connecter avec le mot de passe provisoire
7. Changer le mot de passe
8. Vérifier le dashboard (15 clients max)

### Test 2 : Paiement Transformationnel
1. Même processus avec pack Transformationnel (39,99€)
2. Vérifier les limites (50 clients, 50 workouts, 100 exercices)
3. Vérifier les fonctionnalités avancées

### Test 3 : Paiement Elite
1. Même processus avec pack Elite (69,99€)
2. Vérifier les limites (100 clients, workouts illimités, exercices illimités)
3. Vérifier toutes les fonctionnalités premium

---

## 📊 MONITORING

### 1. Logs Supabase
```bash
# Vérifier les logs des Edge Functions
supabase functions logs stripe-webhook
supabase functions logs send-email-reliable
```

### 2. Logs Stripe
- Aller dans Stripe Dashboard > Webhooks
- Vérifier les tentatives de webhook
- Vérifier les événements traités

### 3. Base de Données
```sql
-- Vérifier les nouveaux coachs
SELECT * FROM profiles WHERE role = 'coach' ORDER BY created_at DESC;

-- Vérifier les webhooks
SELECT * FROM stripe_webhooks ORDER BY created_at DESC;
```

---

## 🔧 DÉPANNAGE

### Problème : Webhook non reçu
1. Vérifier l'URL du webhook dans Stripe
2. Vérifier que la fonction est déployée
3. Vérifier les logs Supabase
4. Tester avec Stripe CLI : `stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook`

### Problème : Email non envoyé
1. Vérifier les clés API email (Resend/SendGrid)
2. Vérifier les logs de la fonction `send-email-reliable`
3. Vérifier le domaine d'envoi

### Problème : Compte non créé
1. Vérifier les logs du webhook
2. Vérifier les permissions Supabase
3. Vérifier la structure de la table `profiles`

### Problème : Connexion impossible
1. Vérifier que le compte a été créé dans Supabase Auth
2. Vérifier le mot de passe provisoire
3. Vérifier les redirections

---

## 🎯 PRODUCTION

### 1. Passer en Mode Live Stripe
1. Remplacer les clés test par les clés live
2. Mettre à jour les Price IDs si nécessaire
3. Configurer le webhook en production

### 2. Configuration Email Production
1. Vérifier le domaine d'envoi
2. Configurer SPF, DKIM, DMARC
3. Tester l'envoi d'emails

### 3. Monitoring Production
1. Configurer des alertes sur les erreurs
2. Surveiller les logs
3. Surveiller les métriques Stripe

---

## 📈 MÉTRIQUES À SUIVRE

### Conversion
- Taux de conversion pricing → paiement
- Taux de conversion paiement → première connexion
- Taux de conversion première connexion → dashboard

### Technique
- Temps de traitement des webhooks
- Taux d'erreur des emails
- Performance du dashboard

### Business
- Nombre de nouveaux coachs par pack
- Churn rate par pack
- Revenue par pack

---

## 🎉 RÉSULTAT FINAL

Le système est maintenant **commercialisable** avec :

✅ **Paiement Stripe** intégré et fonctionnel
✅ **Création automatique** de comptes coach
✅ **Emails professionnels** avec mot de passe provisoire
✅ **Connexion sécurisée** avec changement de mot de passe obligatoire
✅ **Dashboard coach** avec limites selon le pack
✅ **Système multi-coach** complet
✅ **Monitoring** et logs intégrés

**Le flux est prêt pour la commercialisation ! 🚀**
