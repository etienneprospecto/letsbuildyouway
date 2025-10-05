# 🔧 Configuration des Variables d'Environnement

## ✅ **DÉPLOIEMENT RÉUSSI**

La fonction `send-email-reliable` est déployée et accessible à :
**https://chrhxkcppvigxqlsxgqo.supabase.co/functions/v1/send-email-reliable**

## ⚠️ **PROBLÈME IDENTIFIÉ**

La fonction retourne : `{"error":"RESEND_API_KEY not set in environment"}`

Il faut configurer les variables d'environnement dans Supabase.

## 🔧 **CONFIGURATION REQUISE**

### **1. Aller dans le Dashboard Supabase**
- URL : https://supabase.com/dashboard/project/chrhxkcppvigxqlsxgqo
- Aller dans **Settings** → **Edge Functions**

### **2. Configurer les Variables d'Environnement**

Cliquer sur **"Add new secret"** et ajouter :

```
RESEND_API_KEY = re_2Pmdc2Su_3DWka38YzMUNAtadMfq5farP
FROM_EMAIL = letsbuildyourway@gmail.com
BASE_URL = http://localhost:3000
```

### **3. Redéployer la Fonction (si nécessaire)**
```bash
supabase functions deploy send-email-reliable --project-ref chrhxkcppvigxqlsxgqo
```

## 🧪 **TEST APRÈS CONFIGURATION**

Une fois les variables configurées, testez avec :

```bash
curl -L -X POST 'https://chrhxkcppvigxqlsxgqo.supabase.co/functions/v1/send-email-reliable' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNocmh4a2NwcHZpZ3hxbHN4Z3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NDU1MTgsImV4cCI6MjA3MTMyMTUxOH0.bg0S85RYScZsfa0MGoyLyOtOdydu_YFDmDgMloWy3mg' \
  -H 'Content-Type: application/json' \
  -d '{"client_email":"votre-email@example.com","client_name":"Test User","invitation_url":"https://byw.app/?token=test","coach_name":"Coach Test","type":"client_invitation"}'
```

## ✅ **RÉPONSE ATTENDUE**

```json
{
  "success": true,
  "result": {
    "id": "email-id-from-resend"
  }
}
```

## 🎯 **PROCHAINES ÉTAPES**

1. **Configurer les variables** dans le dashboard Supabase
2. **Tester la fonction** avec un vrai email
3. **Intégrer dans l'app** - la fonction est prête !

**Le système d'invitation des clients sera fonctionnel dès que les variables seront configurées !** 🎉
