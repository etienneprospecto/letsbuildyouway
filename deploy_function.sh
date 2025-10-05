
#!/bin/bash

# ========================================
# SCRIPT DE DÉPLOIEMENT AUTOMATIQUE
# ========================================

echo "🚀 Déploiement de l'Edge Function send-email-reliable..."

# Variables d'environnement
export SUPABASE_URL="https://chrhxkcppvigxqlsxgqo.supabase.co"
export SUPABASE_ACCESS_TOKEN="your_access_token_here"

# Déploiement via Supabase CLI
supabase functions deploy send-email-reliable \
  --project-ref chrhxkcppvigxqlsxgqo \
  --no-verify-jwt

if [ $? -eq 0 ]; then
  echo "✅ Edge Function déployée avec succès !"
  echo "🔗 URL: https://chrhxkcppvigxqlsxgqo.supabase.co/functions/v1/send-email-reliable"
else
  echo "❌ Erreur lors du déploiement"
  echo "💡 Essayez de vous connecter d'abord: supabase login"
fi
