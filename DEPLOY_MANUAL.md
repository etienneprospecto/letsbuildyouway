# 🚀 DÉPLOIEMENT MANUEL - Edge Function

## ⚡ **ÉTAPES SIMPLES**

### **1. Se connecter à Supabase**
```bash
supabase login
```
*Ouvrez le lien dans votre navigateur et connectez-vous*

### **2. Déployer la fonction**
```bash
supabase functions deploy send-email-reliable --project-ref chrhxkcppvigxqlsxgqo
```

### **3. Tester la fonction**
```bash
curl -L -X POST 'https://chrhxkcppvigxqlsxgqo.supabase.co/functions/v1/send-email-reliable' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNocmh4a2NwcHZpZ3hxbHN4Z3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NDU1MTgsImV4cCI6MjA3MTMyMTUxOH0.bg0S85RYScZsfa0MGoyLyOtOdydu_YFDmDgMloWy3mg' \
  -H 'Content-Type: application/json' \
  -d '{"client_email":"test@example.com","client_name":"Test User","invitation_url":"https://byw.app/?token=test","coach_name":"Coach Test","type":"client_invitation"}'
```

## 🌐 **ALTERNATIVE: VIA DASHBOARD**

Si le CLI ne fonctionne pas :

1. **Ouvrir**: https://supabase.com/dashboard/project/chrhxkcppvigxqlsxgqo/functions
2. **Créer** une nouvelle fonction `send-email-reliable`
3. **Copier** le contenu de `supabase/functions/send-email-reliable/index.ts`
4. **Déployer**

## ✅ **VÉRIFICATION**

La fonction est déployée si le test retourne `{"success": true}` au lieu de `{"code":"NOT_FOUND"}`

## 🧪 **TEST COMPLET**

Ouvrir `test_email_manual.html` dans votre navigateur et tester avec votre vraie adresse email.

**Une fois déployée, le système d'invitation des clients fonctionnera parfaitement !** 🎉
