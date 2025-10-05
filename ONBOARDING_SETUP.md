# 🚀 Configuration du Système d'Onboarding Post-Abonnement

## 📋 Vue d'ensemble

Ce guide explique comment configurer le système d'onboarding automatique après un abonnement Stripe réussi.

## 🔧 Configuration requise

### 1. Variables d'environnement

Ajoutez ces variables à votre configuration Supabase Edge Functions :

```bash
# Email Service (Resend)
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=noreply@byw.app

# Application
BASE_URL=https://byw.app

# Stripe (déjà configuré)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase (déjà configuré)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 2. Configuration Resend

1. Créez un compte sur [Resend.com](https://resend.com)
2. Vérifiez votre domaine `byw.app`
3. Récupérez votre clé API
4. Ajoutez-la aux variables d'environnement

### 3. Configuration Stripe Webhooks

Assurez-vous que ces événements sont configurés dans Stripe :
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

## 🚀 Déploiement

### 1. Déployer les Edge Functions

```bash
# Déployer la fonction d'email
supabase functions deploy send-invitation-email

# Déployer le webhook Stripe
supabase functions deploy stripe-webhook
```

### 2. Configurer les variables d'environnement

```bash
# Configurer Resend
supabase secrets set RESEND_API_KEY=re_your_key_here
supabase secrets set FROM_EMAIL=noreply@byw.app

# Configurer l'URL de base
supabase secrets set BASE_URL=https://byw.app
```

### 3. Tester le système

```bash
# Exécuter le script de test
node test_onboarding_flow.js
```

## 📧 Templates d'email

### Email de bienvenue coach

- **Sujet** : "Bienvenue sur BYW, [Nom] ! Configurez votre compte coach"
- **Contenu** : Template HTML professionnel avec CTA
- **Expiration** : 24 heures

### Email d'invitation client

- **Sujet** : "Invitation de [Coach] - Rejoignez BYW"
- **Contenu** : Template HTML avec instructions
- **Expiration** : 7 jours

## 🔍 Monitoring et logs

### Logs importants à surveiller

```bash
# Vérifier les logs des Edge Functions
supabase functions logs stripe-webhook
supabase functions logs send-invitation-email
```

### Métriques à suivre

- Taux de livraison des emails
- Taux de conversion des invitations
- Erreurs de webhook Stripe
- Temps de réponse des APIs

## 🛠️ Dépannage

### Problèmes courants

#### 1. Emails non envoyés
```bash
# Vérifier la configuration Resend
supabase secrets list | grep RESEND

# Vérifier les logs
supabase functions logs send-invitation-email --follow
```

#### 2. Liens d'invitation invalides
```bash
# Vérifier la configuration BASE_URL
supabase secrets list | grep BASE_URL

# Vérifier les logs du webhook
supabase functions logs stripe-webhook --follow
```

#### 3. Erreurs de webhook Stripe
```bash
# Vérifier la signature Stripe
# Vérifier les variables d'environnement
supabase secrets list | grep STRIPE
```

### Codes d'erreur

| Code | Description | Solution |
|------|-------------|----------|
| `EMAIL_SEND_FAILED` | Échec envoi email | Vérifier Resend API |
| `INVALID_INVITATION` | Lien invalide | Vérifier BASE_URL |
| `USER_CREATION_FAILED` | Création utilisateur | Vérifier Supabase |
| `STRIPE_WEBHOOK_INVALID` | Webhook invalide | Vérifier signature |

## 🔒 Sécurité

### Bonnes pratiques

1. **Tokens d'invitation** : Expiration 24h max
2. **Validation Stripe** : Vérification signature obligatoire
3. **Rate limiting** : Limiter les tentatives d'envoi
4. **Logs sécurisés** : Ne pas logger les tokens sensibles

### Audit de sécurité

```bash
# Vérifier les permissions des Edge Functions
supabase functions list

# Vérifier les variables sensibles
supabase secrets list
```

## 📊 Analytics et métriques

### Dashboard de monitoring

Créez un dashboard pour suivre :
- Nombre d'abonnements par jour
- Taux de conversion email → connexion
- Temps moyen de configuration
- Erreurs par type

### Alertes recommandées

- Échec d'envoi email > 5%
- Erreur webhook Stripe
- Temps de réponse > 5s
- Quota Resend atteint

## 🔄 Maintenance

### Tâches régulières

1. **Hebdomadaire** : Vérifier les logs d'erreur
2. **Mensuel** : Analyser les métriques de conversion
3. **Trimestriel** : Mettre à jour les templates email

### Sauvegarde

- Sauvegarder les configurations
- Exporter les templates email
- Documenter les changements

## 📞 Support

### En cas de problème

1. Vérifier les logs Supabase
2. Tester avec le script `test_onboarding_flow.js`
3. Vérifier la configuration Resend
4. Contacter le support technique

### Ressources utiles

- [Documentation Resend](https://resend.com/docs)
- [Documentation Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Documentation Supabase Edge Functions](https://supabase.com/docs/guides/functions)

---

**Version** : 1.0.0  
**Dernière mise à jour** : Janvier 2025  
**Auteur** : Équipe BYW
