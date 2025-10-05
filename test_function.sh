#!/bin/bash

# ========================================
# TEST DIRECT DE L'EDGE FUNCTION
# ========================================

echo "🧪 Test de l'Edge Function send-email-reliable..."

curl -X POST https://chrhxkcppvigxqlsxgqo.supabase.co/functions/v1/send-email-reliable \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNocmh4a2NwcHZpZ3hxbHN4Z3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NDU1MTgsImV4cCI6MjA3MTMyMTUxOH0.bg0S85RYScZsfa0MGoyLyOtOdydu_YFDmDgMloWy3mg" \
  -H "Content-Type: application/json" \
  -d '{
    "client_email": "test@example.com",
    "client_name": "Test User",
    "invitation_url": "https://byw.app/?token=test-123",
    "coach_name": "Coach Test",
    "type": "client_invitation"
  }'

echo ""
echo "✅ Test terminé. Vérifiez la réponse ci-dessus."
