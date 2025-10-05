#!/bin/bash

echo "🔧 Correction du système d'email BYW"
echo "=================================="

# Vérifier si Supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI non installé. Installation..."
    npm install -g supabase
fi

# Vérifier la connexion
echo "🔑 Vérification de la connexion Supabase..."
if ! supabase status &> /dev/null; then
    echo "⚠️  Connexion requise. Veuillez exécuter :"
    echo "   supabase login"
    echo "   Puis relancer ce script"
    exit 1
fi

echo "✅ Connexion Supabase OK"

# Configuration des secrets
echo ""
echo "📧 Configuration des secrets email..."

echo "   - RESEND_API_KEY"
supabase secrets set RESEND_API_KEY=re_FJzQiko6_3kNowwWrRBFXSggQXW9Kt5Ni

echo "   - FROM_EMAIL"  
supabase secrets set FROM_EMAIL=noreply@byw.app

echo "   - BASE_URL"
supabase secrets set BASE_URL=https://byw.app

echo ""
echo "✅ Secrets configurés"

# Vérification
echo ""
echo "🔍 Vérification de la configuration..."
supabase secrets list

# Redéploiement de l'Edge Function
echo ""
echo "🚀 Redéploiement de l'Edge Function..."
supabase functions deploy send-invitation-email

echo ""
echo "✅ Système d'email corrigé !"
echo ""
echo "🧪 Test recommandé :"
echo "   1. Ouvrez test_email_browser.html"
echo "   2. Configurez vos identifiants Supabase"
echo "   3. Testez l'envoi d'email"
