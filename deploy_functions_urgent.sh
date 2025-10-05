#!/bin/bash

echo "🚨 DÉPLOIEMENT URGENT DES EDGE FUNCTIONS"
echo "======================================="

# Vérifier si Supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI non installé. Installation..."
    npm install -g supabase
fi

echo "✅ Supabase CLI OK"

# Déploiement des fonctions
echo ""
echo "🚀 Déploiement des Edge Functions..."

echo "📧 Déploiement send-email-reliable..."
supabase functions deploy send-email-reliable

echo "📧 Déploiement send-invitation-email..."
supabase functions deploy send-invitation-email

echo "📧 Déploiement send-stripe-email..."
supabase functions deploy send-stripe-email

echo "💳 Déploiement stripe-webhook..."
supabase functions deploy stripe-webhook

echo ""
echo "✅ Déploiement terminé"

# Configuration des secrets
echo ""
echo "🔧 Configuration des secrets..."

echo "📧 Configuration Resend..."
supabase secrets set RESEND_API_KEY=re_FJzQiko6_3kNowwWrRBFXSggQXW9Kt5Ni
supabase secrets set FROM_EMAIL=noreply@byw.app

echo "🌐 Configuration URL de base..."
supabase secrets set BASE_URL=https://byw.app

echo ""
echo "✅ Configuration terminée"

echo ""
echo "🎉 DÉPLOIEMENT URGENT TERMINÉ !"
echo ""
echo "📋 Prochaines étapes :"
echo "1. Testez avec: test_invitation_debug.html"
echo "2. Vérifiez les logs: supabase functions logs send-email-reliable --follow"
echo "3. Testez l'envoi d'invitations dans l'interface coach"
