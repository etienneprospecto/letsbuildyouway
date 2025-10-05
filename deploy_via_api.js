// ========================================
// DÉPLOIEMENT EDGE FUNCTION VIA API SUPABASE
// ========================================

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://chrhxkcppvigxqlsxgqo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNocmh4a2NwcHZpZ3hxbHN4Z3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NDU1MTgsImV4cCI6MjA3MTMyMTUxOH0.bg0S85RYScZsfa0MGoyLyOtOdydu_YFDmDgMloWy3mg';

async function deployEdgeFunction() {
  console.log('🚀 ===== DÉPLOIEMENT EDGE FUNCTION VIA API =====');
  console.log('📧 Fonction: send-email-reliable');
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('');

  try {
    // 1. Lire le code de l'Edge Function
    const functionPath = path.join(process.cwd(), 'supabase/functions/send-email-reliable/index.ts');
    
    if (!fs.existsSync(functionPath)) {
      console.error('❌ Fichier Edge Function non trouvé:', functionPath);
      return;
    }

    const functionCode = fs.readFileSync(functionPath, 'utf8');
    console.log('✅ Code Edge Function lu:', functionCode.length, 'caractères');

    // 2. Créer un script de déploiement manuel
    const deployScript = `#!/bin/bash

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
echo "curl -X POST https://chrhxkcppvigxqlsxgqo.supabase.co/functions/v1/send-email-reliable \\"
echo "  -H 'Authorization: Bearer ${SUPABASE_ANON_KEY}' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"client_email\":\"test@example.com\",\"client_name\":\"Test User\",\"invitation_url\":\"https://byw.app/?token=test\",\"coach_name\":\"Coach Test\",\"type\":\"client_invitation\"}'"
`;

    fs.writeFileSync('deploy_manual.sh', deployScript);
    console.log('✅ Script de déploiement manuel créé: deploy_manual.sh');

    // 3. Créer un script de test direct
    const testScript = `#!/bin/bash

# ========================================
# TEST DIRECT DE L'EDGE FUNCTION
# ========================================

echo "🧪 Test de l'Edge Function send-email-reliable..."

curl -X POST https://chrhxkcppvigxqlsxgqo.supabase.co/functions/v1/send-email-reliable \\
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "client_email": "test@example.com",
    "client_name": "Test User",
    "invitation_url": "https://byw.app/?token=test-123",
    "coach_name": "Coach Test",
    "type": "client_invitation"
  }'

echo ""
echo "✅ Test terminé. Vérifiez la réponse ci-dessus."
`;

    fs.writeFileSync('test_function.sh', testScript);
    console.log('✅ Script de test créé: test_function.sh');

    // 4. Rendre les scripts exécutables
    fs.chmodSync('deploy_manual.sh', '755');
    fs.chmodSync('test_function.sh', '755');

    console.log('');
    console.log('📋 INSTRUCTIONS DE DÉPLOIEMENT:');
    console.log('');
    console.log('🔧 MÉTHODE 1: Via CLI (recommandé)');
    console.log('1. Ouvrez un terminal');
    console.log('2. Exécutez: supabase login');
    console.log('3. Exécutez: supabase functions deploy send-email-reliable --project-ref chrhxkcppvigxqlsxgqo');
    console.log('');
    console.log('🌐 MÉTHODE 2: Via Dashboard');
    console.log('1. Ouvrez: https://supabase.com/dashboard/project/chrhxkcppvigxqlsxgqo/functions');
    console.log('2. Créez une nouvelle fonction "send-email-reliable"');
    console.log('3. Copiez le contenu de supabase/functions/send-email-reliable/index.ts');
    console.log('4. Déployez la fonction');
    console.log('');
    console.log('🧪 TEST:');
    console.log('1. Exécutez: ./test_function.sh');
    console.log('2. Ou ouvrez: test_email_manual.html');
    console.log('');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

deployEdgeFunction();
