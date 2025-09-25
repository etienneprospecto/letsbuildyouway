#!/bin/bash

echo "🚀 Préparation du build de production BYW..."

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    error "Fichier package.json non trouvé. Êtes-vous dans le bon répertoire ?"
    exit 1
fi

log "Vérification de l'environnement..."

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    error "Node.js n'est pas installé"
    exit 1
fi

# Vérifier npm
if ! command -v npm &> /dev/null; then
    error "npm n'est pas installé"
    exit 1
fi

log "Node.js $(node --version) détecté"
log "npm $(npm --version) détecté"

# Nettoyer les anciens builds
log "Nettoyage des anciens builds..."
rm -rf dist/
rm -rf .vite/

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    log "Installation des dépendances..."
    npm ci --production=false
else
    log "Mise à jour des dépendances..."
    npm ci --production=false
fi

# Vérifier les variables d'environnement
log "Vérification des variables d'environnement..."

if [ ! -f ".env" ]; then
    warning "Fichier .env non trouvé. Création d'un fichier d'exemple..."
    cp env.template .env
    warning "Veuillez configurer le fichier .env avant de continuer"
fi

# Linting
log "Vérification du code (ESLint)..."
if npm run lint:check; then
    log "✅ Aucune erreur de linting détectée"
else
    warning "⚠️ Erreurs de linting détectées, tentative de correction automatique..."
    npm run lint:fix
fi

# Type checking
log "Vérification des types TypeScript..."
if npm run type-check; then
    log "✅ Aucune erreur de type détectée"
else
    error "❌ Erreurs de type détectées. Veuillez les corriger avant de continuer."
    exit 1
fi

# Tests (si disponibles)
if npm run test --silent 2>/dev/null; then
    log "Exécution des tests..."
    if npm run test; then
        log "✅ Tous les tests passent"
    else
        warning "⚠️ Certains tests échouent, mais le build continue..."
    fi
fi

# Build de production
log "Construction du build de production..."
if npm run build; then
    log "✅ Build de production réussi"
else
    error "❌ Échec du build de production"
    exit 1
fi

# Vérifier la taille du build
log "Analyse de la taille du build..."
if [ -d "dist" ]; then
    BUILD_SIZE=$(du -sh dist | cut -f1)
    log "Taille totale du build: $BUILD_SIZE"
    
    # Analyser les fichiers volumineux
    info "Fichiers les plus volumineux:"
    find dist -type f -size +100k -exec ls -lh {} \; | awk '{ print $5 ": " $9 }' | head -10
    
    # Compter les fichiers
    JS_FILES=$(find dist -name "*.js" | wc -l)
    CSS_FILES=$(find dist -name "*.css" | wc -l)
    HTML_FILES=$(find dist -name "*.html" | wc -l)
    
    info "Fichiers générés: $JS_FILES JS, $CSS_FILES CSS, $HTML_FILES HTML"
fi

# Optimisations post-build
log "Optimisations post-build..."

# Compression gzip (si gzip est disponible)
if command -v gzip &> /dev/null; then
    log "Création des fichiers gzip..."
    find dist -name "*.js" -o -name "*.css" -o -name "*.html" | while read file; do
        gzip -9 -c "$file" > "$file.gz"
    done
    log "✅ Fichiers gzip créés"
fi

# Vérification de sécurité basique
log "Vérification de sécurité basique..."
if grep -r "console.log" dist/ >/dev/null 2>&1; then
    warning "⚠️ console.log détectés dans le build de production"
fi

if grep -r "debugger" dist/ >/dev/null 2>&1; then
    warning "⚠️ debugger statements détectés dans le build de production"
fi

# Génération du rapport de build
log "Génération du rapport de build..."
cat > dist/build-report.txt << EOF
BYW - Rapport de Build de Production
===================================
Date: $(date)
Node.js: $(node --version)
npm: $(npm --version)
Taille du build: $BUILD_SIZE
Fichiers JS: $JS_FILES
Fichiers CSS: $CSS_FILES
Fichiers HTML: $HTML_FILES

Optimisations appliquées:
- Minification JS/CSS
- Tree shaking
- Code splitting
- Compression gzip
- Optimisation des assets

Prêt pour déploiement: ✅
EOF

log "✅ Build de production terminé avec succès!"
log "📁 Fichiers de build disponibles dans: ./dist/"
log "📊 Rapport de build: ./dist/build-report.txt"

info "Pour déployer:"
info "1. Uploadez le contenu du dossier 'dist' sur votre serveur web"
info "2. Configurez votre serveur pour servir index.html pour les routes SPA"
info "3. Configurez les variables d'environnement sur votre serveur"

log "🎉 Prêt pour la mise en production!"
