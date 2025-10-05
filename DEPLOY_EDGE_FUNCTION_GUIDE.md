# 🚀 Guide de Déploiement Edge Function

## 📋 **ÉTAPES DE DÉPLOIEMENT**

### 1. **Connexion à Supabase**
```bash
# Option 1: Via CLI (recommandé)
supabase login

# Option 2: Via token d'accès
export SUPABASE_ACCESS_TOKEN=votre_token_ici
```

### 2. **Déploiement de l'Edge Function**
```bash
# Déployer la fonction send-email-reliable
supabase functions deploy send-email-reliable --project-ref chrhxkcppvigxqlsxgqo

# Vérifier le déploiement
supabase functions list --project-ref chrhxkcppvigxqlsxgqo
```

### 3. **Configuration des Variables d'Environnement**

Dans le dashboard Supabase (https://supabase.com/dashboard/project/chrhxkcppvigxqlsxgqo/settings/functions) :

```bash
# Variables requises pour send-email-reliable
RESEND_API_KEY=re_2Pmdc2Su_3DWka38YzMUNAtadMfq5farP
FROM_EMAIL=letsbuildyourway@gmail.com
BASE_URL=http://localhost:3000
```

### 4. **Test de la Fonction**
```bash
# Test via CLI
supabase functions invoke send-email-reliable --project-ref chrhxkcppvigxqlsxgqo --data '{"client_email":"test@example.com","client_name":"Test User","invitation_url":"https://byw.app/?token=test","coach_name":"Coach Test","type":"client_invitation"}'

# Test via Node.js
node test_email_direct.js
```

## 🔧 **DÉPLOIEMENT ALTERNATIF VIA DASHBOARD**

Si le CLI ne fonctionne pas :

1. **Ouvrir le Dashboard Supabase**
   - URL: https://supabase.com/dashboard/project/chrhxkcppvigxqlsxgqo
   - Aller dans "Edge Functions"

2. **Créer une nouvelle fonction**
   - Nom: `send-email-reliable`
   - Copier le contenu de `supabase/functions/send-email-reliable/index.ts`

3. **Configurer les variables d'environnement**
   - Dans les paramètres de la fonction
   - Ajouter les variables listées ci-dessus

4. **Déployer**
   - Cliquer sur "Deploy"

## 🧪 **TEST DE FONCTIONNEMENT**

### Test 1: Vérification de la fonction
```bash
curl -X POST https://chrhxkcppvigxqlsxgqo.supabase.co/functions/v1/send-email-reliable \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNocmh4a2NwcHZpZ3hxbHN4Z3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NDU1MTgsImV4cCI6MjA3MTMyMTUxOH0.bg0S85RYScZsfa0MGoyLyOtOdydu_YFDmDgMloWy3mg" \
  -H "Content-Type: application/json" \
  -d '{"client_email":"test@example.com","client_name":"Test User","invitation_url":"https://byw.app/?token=test","coach_name":"Coach Test","type":"client_invitation"}'
```

### Test 2: Interface de test
Ouvrir `test_client_invitation_fix.html` dans le navigateur et tester avec un vrai email.

## ✅ **VÉRIFICATION DU SUCCÈS**

La fonction est correctement déployée si :
- ✅ Status 200 au lieu de 404
- ✅ Email reçu dans la boîte de réception
- ✅ Logs Supabase montrent l'envoi réussi

## 🆘 **DÉPANNAGE**

### Erreur 404 (Not Found)
- La fonction n'est pas déployée
- Vérifiez le nom de la fonction
- Redéployez la fonction

### Erreur 500 (Internal Server Error)
- Variables d'environnement manquantes
- Vérifiez RESEND_API_KEY et FROM_EMAIL
- Consultez les logs Supabase

### Email non reçu
- Vérifiez le dossier spam
- Vérifiez l'adresse email de destination
- Vérifiez les logs Resend
