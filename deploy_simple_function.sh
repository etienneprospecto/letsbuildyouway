#!/bin/bash

# ========================================
# DÉPLOIEMENT FONCTION SIMPLIFIÉE
# ========================================

echo "🚀 ===== DÉPLOIEMENT FONCTION SIMPLIFIÉE ====="
echo "📧 Fonction: send-email-reliable-simple"
echo "🔧 Version simplifiée sans imports complexes"
echo "⏰ Timestamp: $(date)"
echo ""

# 1. Vérifier l'authentification
echo "1️⃣ Vérification de l'authentification..."
if ! supabase projects list > /dev/null 2>&1; then
    echo "❌ Authentification requise"
    echo "🔐 Veuillez vous connecter d'abord:"
    echo "   supabase login"
    echo ""
    echo "Puis relancez ce script"
    exit 1
fi
echo "✅ Authentification OK"

# 2. Déployer la fonction simplifiée
echo ""
echo "2️⃣ Déploiement de la fonction simplifiée..."
echo "Exécution: supabase functions deploy send-email-reliable-simple --project-ref chrhxkcppvigxqlsxgqo"

supabase functions deploy send-email-reliable-simple --project-ref chrhxkcppvigxqlsxgqo

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Fonction simplifiée déployée avec succès !"
    echo ""
    
    # 3. Test de la fonction
    echo "3️⃣ Test de la fonction..."
    echo "Test en cours..."
    
    response=$(curl -s -X POST 'https://chrhxkcppvigxqlsxgqo.supabase.co/functions/v1/send-email-reliable-simple' \
      -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNocmh4a2NwcHZpZ3hxbHN4Z3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NDU1MTgsImV4cCI6MjA3MTMyMTUxOH0.bg0S85RYScZsfa0MGoyLyOtOdydu_YFDmDgMloWy3mg' \
      -H 'Content-Type: application/json' \
      -d '{"client_email":"test@example.com","client_name":"Test User","invitation_url":"https://byw.app/?token=test","coach_name":"Coach Test","type":"client_invitation"}')
    
    echo "Réponse: $response"
    
    if echo "$response" | grep -q "success"; then
        echo "✅ Test réussi ! La fonction simplifiée fonctionne correctement"
    elif echo "$response" | grep -q "NOT_FOUND"; then
        echo "❌ Fonction non trouvée - problème de déploiement"
    else
        echo "⚠️ Réponse inattendue - vérifiez les logs"
    fi
    
    echo ""
    echo "🎯 DÉPLOIEMENT TERMINÉ !"
    echo "📧 Fonction déployée: send-email-reliable-simple"
    echo "🔗 URL: https://chrhxkcppvigxqlsxgqo.supabase.co/functions/v1/send-email-reliable-simple"
    echo ""
    echo "💡 Pour utiliser cette fonction dans votre app:"
    echo "   Remplacez 'send-email-reliable' par 'send-email-reliable-simple'"
    echo "   dans votre code d'invitation"
    
else
    echo ""
    echo "❌ Erreur lors du déploiement"
    echo "💡 Vérifiez les logs ci-dessus pour plus de détails"
    echo "💡 Assurez-vous d'être connecté: supabase login"
fi
