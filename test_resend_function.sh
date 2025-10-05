#!/bin/bash

# ========================================
# TEST DE LA FONCTION RESEND-SEND-EMAIL
# ========================================

echo "🧪 ===== TEST FONCTION RESEND-SEND-EMAIL ====="
echo "⏰ Timestamp: $(date)"
echo ""

# Test 1: Vérifier que la fonction répond
echo "1️⃣ Test de connectivité..."
response=$(curl -s -w "%{http_code}" -X POST 'https://chrhxkcppvigxqlsxgqo.supabase.co/functions/v1/resend-send-email' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNocmh4a2NwcHZpZ3hxbHN4Z3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NDU1MTgsImV4cCI6MjA3MTMyMTUxOH0.bg0S85RYScZsfa0MGoyLyOtOdydu_YFDmDgMloWy3mg' \
  -H 'Content-Type: application/json' \
  -d '{
    "to": "test@example.com",
    "subject": "Test BYW - Invitation",
    "html": "<h1>Bonjour !</h1><p>Test d'\''invitation BYW</p><p><a href=\"https://byw.app/?token=test\">Accepter l'\''invitation</a></p>",
    "text": "Bonjour ! Test d'\''invitation BYW. Lien: https://byw.app/?token=test"
  }')

http_code="${response: -3}"
body="${response%???}"

echo "Status HTTP: $http_code"
echo "Réponse: $body"
echo ""

# Analyse de la réponse
if [ "$http_code" = "200" ]; then
    if echo "$body" | grep -q "success.*true"; then
        echo "✅ FONCTION OPÉRATIONNELLE !"
        echo "📧 Email envoyé avec succès via Resend"
        echo "🎉 Le système d'invitation est prêt !"
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
elif [ "$http_code" = "400" ]; then
    echo "❌ PARAMÈTRES MANQUANTS"
    echo "💡 Vérifiez que 'to' est fourni dans la requête"
elif [ "$http_code" = "404" ]; then
    echo "❌ FONCTION NON TROUVÉE"
    echo "💡 Vérifiez que la fonction est bien déployée"
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
echo "📧 Fonction: resend-send-email"
