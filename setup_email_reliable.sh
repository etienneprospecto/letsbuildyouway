#!/bin/bash

echo "🚀 Configuration Email Fiable BYW"
echo "================================="

# Vérifier Supabase CLI
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI non installé. Installation..."
    npm install -g supabase
fi

echo "✅ Supabase CLI OK"

# Configuration des secrets
echo ""
echo "🔧 Configuration des secrets email..."

# Resend (principal)
echo "📧 Configuration Resend..."
supabase secrets set RESEND_API_KEY=re_FJzQiko6_3kNowwWrRBFXSggQXW9Kt5Ni
supabase secrets set FROM_EMAIL=noreply@byw.app

# SendGrid (backup)
echo "📧 Configuration SendGrid (optionnel)..."
echo "   Pour activer SendGrid, ajoutez:"
echo "   supabase secrets set SENDGRID_API_KEY=your_sendgrid_key"
echo "   supabase secrets set SENDGRID_FROM_EMAIL=noreply@byw.app"

# Mailgun (backup)
echo "📧 Configuration Mailgun (optionnel)..."
echo "   Pour activer Mailgun, ajoutez:"
echo "   supabase secrets set MAILGUN_API_KEY=your_mailgun_key"
echo "   supabase secrets set MAILGUN_DOMAIN=mg.byw.app"

# URL de base
echo "🌐 Configuration URL de base..."
supabase secrets set BASE_URL=https://byw.app

echo "✅ Secrets configurés"

# Déploiement des fonctions
echo ""
echo "🚀 Déploiement des Edge Functions..."

echo "📧 Déploiement send-email-reliable..."
supabase functions deploy send-email-reliable

echo "📧 Déploiement send-stripe-email..."
supabase functions deploy send-stripe-email

echo "📧 Déploiement send-invitation-email..."
supabase functions deploy send-invitation-email

echo "💳 Déploiement stripe-webhook..."
supabase functions deploy stripe-webhook

echo ""
echo "✅ Déploiement terminé"

# Vérification
echo ""
echo "🔍 Vérification de la configuration..."
supabase secrets list

echo ""
echo "🎉 Configuration terminée !"
echo ""
echo "📋 Prochaines étapes :"
echo "1. Testez avec: test_email_diagnostic.html"
echo "2. Vérifiez les logs: supabase functions logs send-email-reliable --follow"
echo "3. Configurez SendGrid/Mailgun pour plus de fiabilité"
echo ""
echo "💡 Le système essaiera automatiquement :"
echo "   Resend → SendGrid → Mailgun → Fallback"
