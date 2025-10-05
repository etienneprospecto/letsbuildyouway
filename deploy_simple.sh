#!/bin/bash

# ========================================
# DÉPLOIEMENT SIMPLE - SUIVRE VOS COMMANDES
# ========================================

echo "🚀 Déploiement de l'Edge Function send-email-reliable"
echo ""

# Étape 1: Se connecter (si nécessaire)
echo "1️⃣ Connexion à Supabase..."
echo "Si vous n'êtes pas connecté, exécutez d'abord:"
echo "supabase login"
echo ""

# Étape 2: Déployer (votre commande exacte)
echo "2️⃣ Déploiement de la fonction..."
echo "Exécution de: supabase functions deploy send-email-reliable --project-ref chrhxkcppvigxqlsxgqo"
supabase functions deploy send-email-reliable --project-ref chrhxkcppvigxqlsxgqo

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Fonction déployée avec succès !"
    echo ""
    
    # Étape 3: Test (votre commande exacte adaptée)
    echo "3️⃣ Test de la fonction..."
    echo "Exécution du test..."
    curl -L -X POST 'https://chrhxkcppvigxqlsxgqo.supabase.co/functions/v1/send-email-reliable' \
      -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNocmh4a2NwcHZpZ3hxbHN4Z3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NDU1MTgsImV4cCI6MjA3MTMyMTUxOH0.bg0S85RYScZsfa0MGoyLyOtOdydu_YFDmDgMloWy3mg' \
      -H 'Content-Type: application/json' \
      -d '{"client_email":"test@example.com","client_name":"Test User","invitation_url":"https://byw.app/?token=test","coach_name":"Coach Test","type":"client_invitation"}'
    
    echo ""
    echo "🎯 Test terminé !"
    echo "📧 Ouvrez test_email_manual.html pour tester avec un vrai email"
else
    echo ""
    echo "❌ Erreur lors du déploiement"
    echo "💡 Vérifiez que vous êtes connecté: supabase login"
fi
