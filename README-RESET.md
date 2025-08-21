# 🔄 Guide de Reset Complet - Base Supabase

## ⚠️ ATTENTION
Ce processus supprime **TOUTES** les données et structures de la base Supabase.

## 📋 Étapes de Reset

### 1. Exécuter le script de nettoyage des migrations
```bash
./scripts/clean-migrations.sh
```

### 2. Exécuter le script SQL de reset dans Supabase
- Aller dans l'interface Supabase
- Section SQL Editor
- Copier-coller le contenu de `scripts/reset-database.sql`
- Exécuter le script

### 3. Vérifier le nettoyage
- Toutes les tables doivent être supprimées
- Tous les types personnalisés supprimés
- Extensions supprimées

## 🚀 Après le Reset

### 1. Créer un nouveau fichier .env
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Créer de nouvelles migrations
- Commencer par la table `profiles`
- Ajouter les tables une par une
- Tester chaque migration

### 3. Implémenter l'authentification
- Composants de connexion/inscription
- Gestion des sessions
- Protection des routes

## 📁 Fichiers créés
- `scripts/reset-database.sql` - Script SQL de reset
- `scripts/clean-migrations.sh` - Script bash de nettoyage
- `README-RESET.md` - Ce guide

## 🔒 Sécurité
- Sauvegarder avant reset si nécessaire
- Vérifier les permissions Supabase
- Tester en environnement de développement
