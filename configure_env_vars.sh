#!/bin/bash

# ========================================
# CONFIGURATION DES VARIABLES D'ENVIRONNEMENT
# ========================================

echo "🔧 ===== CONFIGURATION DES VARIABLES D'ENVIRONNEMENT ====="
echo "📧 Fonction: resend-send-email"
echo "⏰ Timestamp: $(date)"
echo ""

# Vérifier si on est connecté
if ! supabase projects list > /dev/null 2>&1; then
    echo "❌ Authentification requise"
    echo "🔐 Veuillez vous connecter d'abord:"
    echo "   supabase login"
    echo ""
    echo "Puis relancez ce script"
    exit 1
fi

echo "✅ Authentification OK"
echo ""

# Configuration des variables d'environnement
echo "🔧 Configuration des variables d'environnement..."

# Note: Les variables d'environnement doivent être configurées via le dashboard
# car le CLI ne permet pas de les définir directement

echo "📋 VARIABLES À CONFIGURER DANS LE DASHBOARD:"
echo ""
echo "1. RESEND_API_KEY = re_2Pmdc2Su_3DWka38YzMUNAtadMfq5farP"
echo "2. FROM_EMAIL = letsbuildyourway@gmail.com"
echo "3. BASE_URL = http://localhost:3000"
echo ""
echo "🔗 URL du dashboard:"
echo "https://supabase.com/dashboard/project/chrhxkcppvigxqlsxgqo/settings/functions"
echo ""

# Test de la fonction après configuration
echo "🧪 Test de la fonction après configuration..."
echo "Exécutez: ./test_resend_function.sh"
echo ""

echo "✅ Configuration terminée !"
echo "🎯 Testez maintenant avec: ./test_resend_function.sh"
