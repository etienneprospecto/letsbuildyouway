#!/bin/bash

# ========================================
# DÉPLOIEMENT AVEC AUTHENTIFICATION
# ========================================

echo "🚀 ===== DÉPLOIEMENT EDGE FUNCTION ====="
echo "📧 Fonction: send-email-reliable"
echo "⏰ Timestamp: $(date)"
echo ""

# 1. Vérifier si on est connecté
echo "1️⃣ Vérification de l'authentification..."
if supabase projects list > /dev/null 2>&1; then
    echo "✅ Authentification OK"
else
    echo "❌ Authentification requise"
    echo "🔐 Connexion à Supabase..."
    echo "Ouvrez ce lien dans votre navigateur:"
    echo "https://supabase.com/dashboard/project/chrhxkcppvigxqlsxgqo"
    echo ""
    echo "Puis exécutez: supabase login"
    echo "Et relancez ce script"
    exit 1
fi

# 2. Déployer la fonction
echo ""
echo "2️⃣ Déploiement de la fonction..."
supabase functions deploy send-email-reliable --project-ref chrhxkcppvigxqlsxgqo

if [ $? -eq 0 ]; then
    echo "✅ Fonction déployée avec succès !"
else
    echo "❌ Erreur lors du déploiement"
    exit 1
fi

# 3. Vérifier le déploiement
echo ""
echo "3️⃣ Vérification du déploiement..."
supabase functions list --project-ref chrhxkcppvigxqlsxgqo

# 4. Test de la fonction
echo ""
echo "4️⃣ Test de la fonction..."
curl -L -X POST 'https://chrhxkcppvigxqlsxgqo.supabase.co/functions/v1/send-email-reliable' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNocmh4a2NwcHZpZ3hxbHN4Z3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NDU1MTgsImV4cCI6MjA3MTMyMTUxOH0.bg0S85RYScZsfa0MGoyLyOtOdydu_YFDmDgMloWy3mg' \
  -H 'Content-Type: application/json' \
  -d '{"client_email":"test@example.com","client_name":"Test User","invitation_url":"https://byw.app/?token=test","coach_name":"Coach Test","type":"client_invitation"}'

echo ""
echo "🎯 Déploiement terminé !"
echo "📧 Testez avec: test_email_manual.html"
