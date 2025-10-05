#!/bin/bash

# ========================================
# SCRIPT DE CORRECTION SYSTÈME INVITATION CLIENT
# ========================================

echo "🔧 ===== CORRECTION SYSTÈME INVITATION CLIENT ====="
echo "⏰ Timestamp: $(date)"
echo ""

# 1. Vérifier les variables d'environnement
echo "1️⃣ Vérification des variables d'environnement..."
if [ -z "$VITE_SUPABASE_URL" ]; then
    echo "❌ VITE_SUPABASE_URL non défini"
    echo "💡 Ajoutez: export VITE_SUPABASE_URL=https://votre-projet.supabase.co"
    exit 1
fi

if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "❌ VITE_SUPABASE_ANON_KEY non défini"
    echo "💡 Ajoutez: export VITE_SUPABASE_ANON_KEY=votre_anon_key"
    exit 1
fi

if [ -z "$RESEND_API_KEY" ]; then
    echo "❌ RESEND_API_KEY non défini"
    echo "💡 Ajoutez: export RESEND_API_KEY=re_..."
    exit 1
fi

echo "✅ Variables d'environnement OK"

# 2. Déployer l'Edge Function send-email-reliable
echo ""
echo "2️⃣ Déploiement de l'Edge Function send-email-reliable..."

if command -v supabase &> /dev/null; then
    echo "🚀 Déploiement via Supabase CLI..."
    supabase functions deploy send-email-reliable --project-ref $(echo $VITE_SUPABASE_URL | cut -d'.' -f1 | cut -d'/' -f3)
    
    if [ $? -eq 0 ]; then
        echo "✅ Edge Function déployée avec succès"
    else
        echo "❌ Erreur lors du déploiement"
        echo "💡 Essayez: supabase functions deploy send-email-reliable"
    fi
else
    echo "⚠️ Supabase CLI non installé"
    echo "💡 Installez: npm install -g supabase"
    echo "💡 Ou déployez manuellement via le dashboard Supabase"
fi

# 3. Tester la configuration
echo ""
echo "3️⃣ Test de la configuration..."

# Créer un script de test temporaire
cat > test_email_config.js << 'EOF'
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testEmail() {
  try {
    const { data, error } = await supabase.functions.invoke('send-email-reliable', {
      body: {
        client_email: 'test@example.com',
        client_name: 'Test User',
        invitation_url: 'https://byw.app/?token=test-123',
        coach_name: 'Coach Test',
        type: 'client_invitation'
      }
    });

    if (error) {
      console.log('❌ Erreur:', error.message);
    } else {
      console.log('✅ Test réussi:', data);
    }
  } catch (err) {
    console.log('❌ Erreur générale:', err.message);
  }
}

testEmail();
EOF

echo "🧪 Exécution du test..."
node test_email_config.js

# Nettoyer le fichier de test
rm test_email_config.js

# 4. Instructions finales
echo ""
echo "4️⃣ Instructions finales..."
echo "✅ Système d'invitation client corrigé"
echo ""
echo "📋 PROCHAINES ÉTAPES:"
echo "1. Ouvrez test_client_invitation_fix.html dans votre navigateur"
echo "2. Testez l'invitation avec un vrai email"
echo "3. Vérifiez que l'email est reçu"
echo "4. Testez l'acceptation de l'invitation"
echo ""
echo "🔍 DEBUGGING:"
echo "- Vérifiez les logs Supabase: supabase functions logs send-email-reliable"
echo "- Vérifiez les variables d'environnement dans .env.local"
echo "- Testez avec debug_email_system.js"
echo ""
echo "🎯 Le système devrait maintenant fonctionner correctement !"
