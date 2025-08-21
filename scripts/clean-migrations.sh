#!/bin/bash

# Script de nettoyage des migrations Supabase
# ATTENTION: Ce script supprime toutes les migrations existantes

echo "🧹 Nettoyage des migrations Supabase..."

# Suppression des fichiers de migration
rm -f supabase/migrations/*.sql

# Suppression des dossiers de migration vides (si nécessaire)
rmdir supabase/migrations 2>/dev/null || true

# Création d'un nouveau dossier migrations
mkdir -p supabase/migrations

echo "✅ Migrations nettoyées. Dossier migrations recréé."
echo "📁 Prêt pour de nouvelles migrations."
