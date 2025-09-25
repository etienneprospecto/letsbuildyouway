#!/bin/bash

echo "🔍 Validation pré-déploiement BYW..."

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Fonction pour afficher les messages
check_pass() {
    echo -e "${GREEN}✅ $1${NC}"
}

check_fail() {
    echo -e "${RED}❌ $1${NC}"
    ((ERRORS++))
}

check_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNINGS++))
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# 1. Vérifier la structure des fichiers
info "Vérification de la structure des fichiers..."

if [ -f "package.json" ]; then
    check_pass "package.json trouvé"
else
    check_fail "package.json manquant"
fi

if [ -f "vite.config.ts" ]; then
    check_pass "Configuration Vite trouvée"
else
    check_fail "vite.config.ts manquant"
fi

if [ -f "tsconfig.json" ]; then
    check_pass "Configuration TypeScript trouvée"
else
    check_fail "tsconfig.json manquant"
fi

if [ -f "tailwind.config.js" ]; then
    check_pass "Configuration Tailwind trouvée"
else
    check_fail "tailwind.config.js manquant"
fi

# 2. Vérifier les variables d'environnement
info "Vérification des variables d'environnement..."

if [ -f ".env" ]; then
    check_pass "Fichier .env trouvé"
    
    # Vérifier les variables critiques
    if grep -q "VITE_SUPABASE_URL" .env; then
        check_pass "VITE_SUPABASE_URL configuré"
    else
        check_fail "VITE_SUPABASE_URL manquant"
    fi
    
    if grep -q "VITE_SUPABASE_ANON_KEY" .env; then
        check_pass "VITE_SUPABASE_ANON_KEY configuré"
    else
        check_fail "VITE_SUPABASE_ANON_KEY manquant"
    fi
    
    if grep -q "VITE_STRIPE_PUBLISHABLE_KEY" .env; then
        check_pass "VITE_STRIPE_PUBLISHABLE_KEY configuré"
    else
        check_warn "VITE_STRIPE_PUBLISHABLE_KEY manquant (optionnel)"
    fi
else
    check_fail "Fichier .env manquant"
fi

# 3. Vérifier les dépendances
info "Vérification des dépendances..."

if [ -d "node_modules" ]; then
    check_pass "node_modules trouvé"
    
    # Vérifier les packages critiques
    if [ -d "node_modules/react" ]; then
        check_pass "React installé"
    else
        check_fail "React manquant"
    fi
    
    if [ -d "node_modules/vite" ]; then
        check_pass "Vite installé"
    else
        check_fail "Vite manquant"
    fi
    
    if [ -d "node_modules/typescript" ]; then
        check_pass "TypeScript installé"
    else
        check_fail "TypeScript manquant"
    fi
else
    check_fail "node_modules manquant - Exécutez 'npm install'"
fi

# 4. Vérifier la structure du code source
info "Vérification de la structure du code source..."

if [ -d "src" ]; then
    check_pass "Dossier src trouvé"
    
    if [ -f "src/main.tsx" ]; then
        check_pass "Point d'entrée src/main.tsx trouvé"
    else
        check_fail "src/main.tsx manquant"
    fi
    
    if [ -f "src/App.tsx" ]; then
        check_pass "Composant principal src/App.tsx trouvé"
    else
        check_fail "src/App.tsx manquant"
    fi
    
    if [ -d "src/components" ]; then
        check_pass "Dossier components trouvé"
    else
        check_fail "Dossier src/components manquant"
    fi
    
    if [ -d "src/services" ]; then
        check_pass "Dossier services trouvé"
    else
        check_warn "Dossier src/services manquant"
    fi
else
    check_fail "Dossier src manquant"
fi

# 5. Vérifier le build
info "Vérification du build..."

if [ -d "dist" ]; then
    check_pass "Build existant trouvé"
    
    if [ -f "dist/index.html" ]; then
        check_pass "index.html généré"
    else
        check_fail "index.html manquant dans le build"
    fi
    
    # Vérifier la taille du build
    BUILD_SIZE=$(du -s dist 2>/dev/null | cut -f1)
    if [ "$BUILD_SIZE" -gt 0 ]; then
        check_pass "Build non vide (${BUILD_SIZE}KB)"
        
        if [ "$BUILD_SIZE" -gt 51200 ]; then  # 50MB
            check_warn "Build volumineux (${BUILD_SIZE}KB) - Considérer l'optimisation"
        fi
    else
        check_fail "Build vide"
    fi
else
    check_warn "Aucun build trouvé - Exécutez 'npm run build'"
fi

# 6. Vérifications de sécurité
info "Vérifications de sécurité..."

# Vérifier les secrets dans le code (exclure les placeholders)
if grep -r "sk_live_[a-zA-Z0-9]" src/ 2>/dev/null | grep -v "placeholder\|exemple\|example"; then
    check_fail "Clé secrète Stripe détectée dans le code source"
else
    check_pass "Aucune clé secrète détectée"
fi

# Vérifier les console.log en production
if grep -r "console.log" src/ 2>/dev/null | grep -v "// TODO\|// DEBUG" | head -1 >/dev/null; then
    check_warn "console.log détectés dans le code source"
else
    check_pass "Aucun console.log détecté"
fi

# Vérifier les TODO/FIXME
TODO_COUNT=$(grep -r "TODO\|FIXME" src/ 2>/dev/null | wc -l)
if [ "$TODO_COUNT" -gt 0 ]; then
    check_warn "$TODO_COUNT TODO/FIXME trouvés dans le code"
else
    check_pass "Aucun TODO/FIXME en attente"
fi

# 7. Vérifications de performance
info "Vérifications de performance..."

# Vérifier la taille des assets
if [ -d "dist/assets" ]; then
    LARGE_FILES=$(find dist/assets -size +1M 2>/dev/null | wc -l)
    if [ "$LARGE_FILES" -gt 0 ]; then
        check_warn "$LARGE_FILES fichiers > 1MB détectés"
    else
        check_pass "Taille des assets optimale"
    fi
fi

# 8. Vérifications de compatibilité
info "Vérifications de compatibilité..."

# Vérifier la version de Node.js
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
    check_pass "Version Node.js compatible ($NODE_VERSION)"
else
    check_warn "Version Node.js ancienne ($NODE_VERSION) - Recommandé: 18+"
fi

# Résumé
echo ""
echo "📊 Résumé de la validation:"
echo "=========================="

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 Parfait! Aucun problème détecté.${NC}"
    echo -e "${GREEN}✅ Prêt pour le déploiement!${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS avertissement(s) détecté(s).${NC}"
    echo -e "${YELLOW}📝 Vérifiez les avertissements avant le déploiement.${NC}"
    exit 0
else
    echo -e "${RED}❌ $ERRORS erreur(s) critique(s) détectée(s).${NC}"
    echo -e "${RED}🚫 Corrigez les erreurs avant le déploiement.${NC}"
    
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $WARNINGS avertissement(s) également détecté(s).${NC}"
    fi
    
    exit 1
fi
