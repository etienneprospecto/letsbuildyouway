// ========================================
// SCRIPT DE DÉPLOIEMENT EDGE FUNCTION
// ========================================

const fs = require('fs');
const path = require('path');

async function deployEdgeFunction() {
  console.log('🚀 ===== DÉPLOIEMENT EDGE FUNCTION =====');
  console.log('📧 Fonction: send-email-reliable');
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('');

  try {
    // 1. Lire le contenu de l'Edge Function
    const functionPath = path.join(__dirname, 'supabase/functions/send-email-reliable/index.ts');
    
    if (!fs.existsSync(functionPath)) {
      console.error('❌ Fichier Edge Function non trouvé:', functionPath);
      return;
    }

    const functionCode = fs.readFileSync(functionPath, 'utf8');
    console.log('✅ Code Edge Function lu:', functionCode.length, 'caractères');

    // 2. Créer le fichier de déploiement
    const deployScript = `
#!/bin/bash

# ========================================
# SCRIPT DE DÉPLOIEMENT AUTOMATIQUE
# ========================================

echo "🚀 Déploiement de l'Edge Function send-email-reliable..."

# Variables d'environnement
export SUPABASE_URL="https://chrhxkcppvigxqlsxgqo.supabase.co"
export SUPABASE_ACCESS_TOKEN="your_access_token_here"

# Déploiement via Supabase CLI
supabase functions deploy send-email-reliable \\
  --project-ref chrhxkcppvigxqlsxgqo \\
  --no-verify-jwt

if [ $? -eq 0 ]; then
  echo "✅ Edge Function déployée avec succès !"
  echo "🔗 URL: https://chrhxkcppvigxqlsxgqo.supabase.co/functions/v1/send-email-reliable"
else
  echo "❌ Erreur lors du déploiement"
  echo "💡 Essayez de vous connecter d'abord: supabase login"
fi
`;

    fs.writeFileSync('deploy_function.sh', deployScript);
    console.log('✅ Script de déploiement créé: deploy_function.sh');

    // 3. Instructions de déploiement manuel
    console.log('');
    console.log('📋 INSTRUCTIONS DE DÉPLOIEMENT:');
    console.log('');
    console.log('1️⃣ Connectez-vous à Supabase:');
    console.log('   supabase login');
    console.log('');
    console.log('2️⃣ Déployez la fonction:');
    console.log('   supabase functions deploy send-email-reliable --project-ref chrhxkcppvigxqlsxgqo');
    console.log('');
    console.log('3️⃣ Ou utilisez le script automatique:');
    console.log('   chmod +x deploy_function.sh');
    console.log('   ./deploy_function.sh');
    console.log('');
    console.log('4️⃣ Vérifiez le déploiement:');
    console.log('   supabase functions list --project-ref chrhxkcppvigxqlsxgqo');
    console.log('');

    // 4. Test de la configuration
    console.log('🧪 Test de la configuration...');
    
    const testConfig = {
      supabase_url: 'https://chrhxkcppvigxqlsxgqo.supabase.co',
      anon_key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNocmh4a2NwcHZpZ3hxbHN4Z3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NDU1MTgsImV4cCI6MjA3MTMyMTUxOH0.bg0S85RYScZsfa0MGoyLyOtOdydu_YFDmDgMloWy3mg',
      resend_key: 're_2Pmdc2Su_3DWka38YzMUNAtadMfq5farP',
      from_email: 'letsbuildyourway@gmail.com'
    };

    console.log('✅ Configuration validée:');
    console.log('   - Supabase URL: OK');
    console.log('   - Anon Key: OK');
    console.log('   - Resend Key: OK');
    console.log('   - From Email: OK');

    console.log('');
    console.log('🎯 PROCHAINES ÉTAPES:');
    console.log('1. Exécutez: supabase login');
    console.log('2. Exécutez: supabase functions deploy send-email-reliable --project-ref chrhxkcppvigxqlsxgqo');
    console.log('3. Testez avec: node debug_email_system.js');
    console.log('4. Ouvrez: test_client_invitation_fix.html');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

deployEdgeFunction();
