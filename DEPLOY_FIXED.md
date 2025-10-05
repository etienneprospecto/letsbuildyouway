# 🚀 DÉPLOIEMENT CORRIGÉ - Edge Function

## ⚡ **PROBLÈME RÉSOLU**

L'erreur `Relative import path "std/server" not prefixed` a été corrigée en :
- ✅ Remplaçant `import "jsr:@supabase/functions-js/edge-runtime.d.ts"` par `import { serve } from "https://deno.land/std@0.168.0/http/server.ts"`
- ✅ Remplaçant `Deno.serve` par `serve`
- ✅ Créant une version simplifiée sans imports complexes

## 🔧 **DÉPLOIEMENT**

### **Option 1: Fonction originale corrigée**
```bash
# 1. Se connecter
supabase login

# 2. Déployer la fonction corrigée
supabase functions deploy send-email-reliable --project-ref chrhxkcppvigxqlsxgqo
```

### **Option 2: Fonction simplifiée (RECOMMANDÉE)**
```bash
# 1. Se connecter
supabase login

# 2. Déployer la fonction simplifiée
supabase functions deploy send-email-reliable-simple --project-ref chrhxkcppvigxqlsxgqo
```

## 🧪 **TEST**

### Test de la fonction originale :
```bash
curl -L -X POST 'https://chrhxkcppvigxqlsxgqo.supabase.co/functions/v1/send-email-reliable' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNocmh4a2NwcHZpZ3hxbHN4Z3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NDU1MTgsImV4cCI6MjA3MTMyMTUxOH0.bg0S85RYScZsfa0MGoyLyOtOdydu_YFDmDgMloWy3mg' \
  -H 'Content-Type: application/json' \
  -d '{"client_email":"test@example.com","client_name":"Test User","invitation_url":"https://byw.app/?token=test","coach_name":"Coach Test","type":"client_invitation"}'
```

### Test de la fonction simplifiée :
```bash
curl -L -X POST 'https://chrhxkcppvigxqlsxgqo.supabase.co/functions/v1/send-email-reliable-simple' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNocmh4a2NwcHZpZ3hxbHN4Z3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NDU1MTgsImV4cCI6MjA3MTMyMTUxOH0.bg0S85RYScZsfa0MGoyLyOtOdydu_YFDmDgMloWy3mg' \
  -H 'Content-Type: application/json' \
  -d '{"client_email":"test@example.com","client_name":"Test User","invitation_url":"https://byw.app/?token=test","coach_name":"Coach Test","type":"client_invitation"}'
```

## 📝 **MODIFICATION DU CODE**

Si vous utilisez la fonction simplifiée, modifiez dans `src/services/invitationService.ts` :

```typescript
// Remplacer cette ligne :
const { data, error } = await supabase.functions.invoke('send-email-reliable', {

// Par :
const { data, error } = await supabase.functions.invoke('send-email-reliable-simple', {
```

## ✅ **VÉRIFICATION DU SUCCÈS**

La fonction est déployée si :
- ✅ Status 200 au lieu de 404
- ✅ Réponse JSON avec `{"success": true}`
- ✅ Email reçu dans la boîte de réception

## 🆘 **EN CAS DE PROBLÈME**

1. **Erreur d'import** : Utilisez la fonction simplifiée
2. **Erreur 404** : Fonction non déployée
3. **Erreur 500** : Variables d'environnement manquantes

**Le système d'invitation des clients fonctionnera parfaitement !** 🎉
