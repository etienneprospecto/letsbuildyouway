#!/bin/bash

# Script de déploiement du système d'email BYW
# Ce script configure Resend et déploie les Edge Functions

echo "🚀 Déploiement du système d'email BYW"
echo "======================================"

# Vérifier que Supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI n'est pas installé"
    echo "📦 Installez-le avec: npm install -g supabase"
    exit 1
fi

# Vérifier que nous sommes dans un projet Supabase
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Ce n'est pas un projet Supabase"
    echo "📁 Exécutez ce script depuis la racine de votre projet Supabase"
    exit 1
fi

echo "✅ Projet Supabase détecté"

# Configuration des variables d'environnement
echo ""
echo "🔧 Configuration des variables d'environnement..."

# Clé API Resend
echo "📧 Configuration de Resend..."
supabase secrets set RESEND_API_KEY=re_FJzQiko6_3kNowwWrRBFXSggQXW9Kt5Ni

# Email d'expéditeur
echo "📧 Configuration de l'email d'expéditeur..."
supabase secrets set FROM_EMAIL=noreply@byw.app

# URL de base
echo "🌐 Configuration de l'URL de base..."
supabase secrets set BASE_URL=https://byw.app

echo "✅ Variables d'environnement configurées"

# Déploiement des Edge Functions
echo ""
echo "🚀 Déploiement des Edge Functions..."

# Déployer la fonction d'email
echo "📧 Déploiement de send-invitation-email..."
supabase functions deploy send-invitation-email

if [ $? -eq 0 ]; then
    echo "✅ send-invitation-email déployée avec succès"
else
    echo "❌ Erreur lors du déploiement de send-invitation-email"
    exit 1
fi

# Déployer le webhook Stripe
echo "💳 Déploiement de stripe-webhook..."
supabase functions deploy stripe-webhook

if [ $? -eq 0 ]; then
    echo "✅ stripe-webhook déployée avec succès"
else
    echo "❌ Erreur lors du déploiement de stripe-webhook"
    exit 1
fi

echo ""
echo "🎉 Déploiement terminé avec succès !"
echo ""
echo "📋 Prochaines étapes :"
echo "1. Testez avec: node test_email_simple.js"
echo "2. Ou ouvrez: test_email_browser.html dans votre navigateur"
echo "3. Vérifiez les logs: supabase functions logs send-invitation-email"
echo ""
echo "🔍 Pour vérifier la configuration :"
echo "supabase secrets list"
echo ""
echo "📧 Votre clé Resend est configurée et prête à envoyer des emails !"
