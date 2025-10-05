#!/bin/bash

# ========================================
# TEST DU STATUT DE LA FONCTION
# ========================================

echo "🧪 ===== TEST FONCTION SEND-EMAIL-RELIABLE ====="
echo "⏰ Timestamp: $(date)"
echo ""

# Test 1: Vérifier que la fonction répond
echo "1️⃣ Test de connectivité..."
response=$(curl -s -w "%{http_code}" -X POST 'https://chrhxkcppvigxqlsxgqo.supabase.co/functions/v1/send-email-reliable' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNocmh4a2NwcHZpZ3hxbHN4Z3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NDU1MTgsImV4cCI6MjA3MTMyMTUxOH0.bg0S85RYScZsfa0MGoyLyOtOdydu_YFDmDgMloWy3mg' \
  -H 'Content-Type: application/json' \
  -d '{"client_email":"test@example.com","client_name":"Test User","invitation_url":"https://byw.app/?token=test","coach_name":"Coach Test","type":"client_invitation"}')

http_code="${response: -3}"
body="${response%???}"

echo "Status HTTP: $http_code"
echo "Réponse: $body"
echo ""

# Analyse de la réponse
if [ "$http_code" = "200" ]; then
    if echo "$body" | grep -q "success.*true"; then
        echo "✅ FONCTION OPÉRATIONNELLE !"
        echo "📧 Email envoyé avec succès"
    else
        echo "⚠️ Fonction répond mais erreur dans la réponse"
        echo "💡 Vérifiez les logs Supabase"
    fi
elif [ "$http_code" = "500" ]; then
    if echo "$body" | grep -q "RESEND_API_KEY not set"; then
        echo "❌ VARIABLE D'ENVIRONNEMENT MANQUANTE"
        echo "💡 Configurez RESEND_API_KEY dans le dashboard Supabase"
        echo "🔗 https://supabase.com/dashboard/project/chrhxkcppvigxqlsxgqo/settings/functions"
    else
        echo "❌ Erreur 500 - Vérifiez les logs"
    fi
elif [ "$http_code" = "404" ]; then
    echo "❌ FONCTION NON TROUVÉE"
    echo "💡 Vérifiez que la fonction est bien déployée"
elif [ "$http_code" = "502" ]; then
    echo "❌ ERREUR EXTERNE (Resend API)"
    echo "💡 Vérifiez votre clé API Resend"
else
    echo "⚠️ Status inattendu: $http_code"
fi

echo ""
echo "📋 INSTRUCTIONS:"
echo "1. Si RESEND_API_KEY manque: Configurez dans le dashboard Supabase"
echo "2. Si 404: Redéployez la fonction"
echo "3. Si 200: La fonction fonctionne parfaitement !"
echo ""
echo "🔗 Dashboard: https://supabase.com/dashboard/project/chrhxkcppvigxqlsxgqo/settings/functions"
