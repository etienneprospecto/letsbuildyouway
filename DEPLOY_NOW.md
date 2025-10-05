# 🚀 DÉPLOIEMENT IMMÉDIAT - Edge Function

## ⚡ **DÉPLOIEMENT RAPIDE**

### **MÉTHODE 1: Via Dashboard Supabase (RECOMMANDÉE)**

1. **Ouvrir le Dashboard Supabase**
   - URL: https://supabase.com/dashboard/project/chrhxkcppvigxqlsxgqo/functions
   - Se connecter avec votre compte Supabase

2. **Créer une nouvelle fonction**
   - Cliquer sur "Create a new function"
   - Nom: `send-email-reliable`
   - Template: TypeScript

3. **Copier le code**
   - Ouvrir le fichier: `supabase/functions/send-email-reliable/index.ts`
   - Copier tout le contenu
   - Coller dans l'éditeur Supabase

4. **Configurer les variables d'environnement**
   - Dans les paramètres de la fonction
   - Ajouter ces variables:
     ```
     RESEND_API_KEY = re_2Pmdc2Su_3DWka38YzMUNAtadMfq5farP
     FROM_EMAIL = letsbuildyourway@gmail.com
     BASE_URL = http://localhost:3000
     ```

5. **Déployer**
   - Cliquer sur "Deploy"
   - Attendre le déploiement (30-60 secondes)

### **MÉTHODE 2: Via CLI (si vous avez un token d'accès)**

```bash
# 1. Se connecter
supabase login

# 2. Déployer
supabase functions deploy send-email-reliable --project-ref chrhxkcppvigxqlsxgqo

# 3. Vérifier
supabase functions list --project-ref chrhxkcppvigxqlsxgqo
```

## 🧪 **TEST IMMÉDIAT**

Une fois déployée, testez avec:

```bash
# Test via curl
curl -X POST https://chrhxkcppvigxqlsxgqo.supabase.co/functions/v1/send-email-reliable \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNocmh4a2NwcHZpZ3hxbHN4Z3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NDU1MTgsImV4cCI6MjA3MTMyMTUxOH0.bg0S85RYScZsfa0MGoyLyOtOdydu_YFDmDgMloWy3mg" \
  -H "Content-Type: application/json" \
  -d '{"client_email":"votre-email@example.com","client_name":"Test User","invitation_url":"https://byw.app/?token=test","coach_name":"Coach Test","type":"client_invitation"}'
```

Ou ouvrir `test_email_manual.html` dans votre navigateur.

## ✅ **VÉRIFICATION DU SUCCÈS**

La fonction est déployée si:
- ✅ Status 200 au lieu de 404
- ✅ Réponse JSON avec `success: true`
- ✅ Email reçu dans la boîte de réception

## 🆘 **EN CAS DE PROBLÈME**

1. **Erreur 404**: Fonction non déployée
2. **Erreur 500**: Variables d'environnement manquantes
3. **Email non reçu**: Vérifier le dossier spam

**Le système d'invitation des clients sera fonctionnel dès que l'Edge Function sera déployée !** 🎉
