#!/bin/bash

# ========================================
# TEST AVEC EMAIL RESEND PAR DÉFAUT
# ========================================

echo "🧪 ===== TEST AVEC EMAIL RESEND PAR DÉFAUT ====="
echo "📧 Fonction: resend-send-email"
echo "⏰ Timestamp: $(date)"
echo ""

# Test avec un email Resend par défaut
echo "1️⃣ Test avec email Resend par défaut..."
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
    if echo "$body" | grep -q "validation_error"; then
        echo "❌ ERREUR DE VALIDATION EMAIL"
        echo "💡 Le domaine FROM_EMAIL n'\''est pas vérifié dans Resend"
        echo "💡 Solutions:"
        echo "   1. Vérifiez letsbuildyourway@gmail.com dans Resend"
        echo "   2. Ou utilisez onboarding@resend.dev (par défaut)"
        echo "   3. Ou changez FROM_EMAIL dans les variables d'\''environnement"
    else
        echo "❌ Erreur 500 - Vérifiez les logs"
    fi
else
    echo "⚠️ Status inattendu: $http_code"
fi

echo ""
echo "🔧 SOLUTIONS:"
echo "1. Vérifiez letsbuildyourway@gmail.com dans Resend Dashboard"
echo "2. Ou changez FROM_EMAIL vers onboarding@resend.dev"
echo "3. Ou ajoutez votre domaine dans Resend"
