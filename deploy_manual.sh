#!/bin/bash

# ========================================
# SCRIPT DE DÉPLOIEMENT MANUEL
# ========================================

echo "🚀 Déploiement de l'Edge Function send-email-reliable..."

# 1. Se connecter à Supabase
echo "1️⃣ Connexion à Supabase..."
echo "Ouvrez ce lien dans votre navigateur pour vous connecter:"
echo "https://supabase.com/dashboard/project/chrhxkcppvigxqlsxgqo"
echo ""

# 2. Déployer via CLI (après connexion)
echo "2️⃣ Déploiement via CLI..."
echo "Exécutez cette commande après vous être connecté:"
echo "supabase functions deploy send-email-reliable --project-ref chrhxkcppvigxqlsxgqo"
echo ""

# 3. Alternative: Déploiement via Dashboard
echo "3️⃣ Alternative: Déploiement via Dashboard..."
echo "1. Allez sur: https://supabase.com/dashboard/project/chrhxkcppvigxqlsxgqo/functions"
echo "2. Cliquez sur 'Create a new function'"
echo "3. Nom: send-email-reliable"
echo "4. Copiez le contenu de supabase/functions/send-email-reliable/index.ts"
echo "5. Cliquez sur 'Deploy'"
echo ""

# 4. Configurer les variables d'environnement
echo "4️⃣ Configuration des variables d'environnement..."
echo "Dans le dashboard Supabase, ajoutez ces variables:"
echo "- RESEND_API_KEY = re_2Pmdc2Su_3DWka38YzMUNAtadMfq5farP"
echo "- FROM_EMAIL = letsbuildyourway@gmail.com"
echo "- BASE_URL = http://localhost:3000"
echo ""

# 5. Test de la fonction
echo "5️⃣ Test de la fonction..."
echo "Ouvrez test_email_manual.html dans votre navigateur"
echo "Ou testez avec:"
echo "curl -X POST https://chrhxkcppvigxqlsxgqo.supabase.co/functions/v1/send-email-reliable \"
echo "  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNocmh4a2NwcHZpZ3hxbHN4Z3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NDU1MTgsImV4cCI6MjA3MTMyMTUxOH0.bg0S85RYScZsfa0MGoyLyOtOdydu_YFDmDgMloWy3mg' \"
echo "  -H 'Content-Type: application/json' \"
echo "  -d '{"client_email":"test@example.com","client_name":"Test User","invitation_url":"https://byw.app/?token=test","coach_name":"Coach Test","type":"client_invitation"}'"
