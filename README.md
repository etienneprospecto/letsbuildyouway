# FitCoach Pro - Plateforme de Coaching Sportif

## 🏋️‍♂️ Description

FitCoach Pro est une plateforme complète de coaching sportif qui permet aux coachs de gérer leurs clients et aux clients de suivre leur progression de manière interactive et motivante.

## 🚀 Fonctionnalités

### Pour les Coachs
- **Dashboard complet** : Vue d'ensemble des clients et métriques
- **Gestion des clients** : Profils détaillés, suivi personnalisé
- **Bibliothèque d'exercices** : Base de données complète avec instructions
- **Création de séances** : Programmes personnalisés
- **Système de messaging** : Communication directe avec les clients
- **Suivi des feedbacks** : Analyse des retours hebdomadaires

### Pour les Clients
- **Planning d'entraînement** : Séances programmées et suivi
- **Feedback hebdomadaire** : Questionnaire complet sur l'hygiène de vie
- **Suivi de progression** : Graphiques interactifs et photos d'évolution
- **Système de trophées** : Gamification pour maintenir la motivation
- **Ressources personnalisées** : Contenus adaptés aux besoins
- **Messagerie** : Communication avec le coach

## 🛠️ Technologies

- **Frontend** : React 18 + TypeScript + Vite
- **Styling** : Tailwind CSS avec design system personnalisé
- **Base de données** : Supabase (PostgreSQL)
- **Authentification** : Supabase Auth
- **Icons** : Lucide React
- **State Management** : React Context API

## 📁 Structure du Projet

```
src/
├── components/           # Composants React
│   ├── Coach/           # Interface coach
│   ├── Client/          # Interface client
│   └── Layout/          # Composants de mise en page
├── contexts/            # Contexts React
├── hooks/               # Hooks personnalisés
├── lib/                 # Configuration et utilitaires
├── services/            # Services API Supabase
├── types/               # Types TypeScript
└── utils/               # Fonctions utilitaires

supabase/
└── migrations/          # Migrations de base de données
```

## 🔧 Installation et Configuration

### 1. Installation des dépendances

```bash
npm install @supabase/supabase-js
```

### 2. Configuration Supabase

1. Créer un projet Supabase
2. Copier `.env.example` vers `.env`
3. Remplir les variables d'environnement :

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Migration de la base de données

Exécuter les migrations dans l'ordre :
1. `create_initial_schema.sql`
2. `seed_initial_data.sql`

### 4. Lancement du projet

```bash
npm run dev
```

## 🗃️ Base de Données

### Tables Principales

- **profiles** : Profils utilisateurs (coaches et clients)
- **clients** : Informations détaillées des clients
- **exercises** : Base de données d'exercices
- **workouts** : Séances d'entraînement
- **weekly_feedbacks** : Feedbacks hebdomadaires
- **progress_data** : Données de progression physique
- **sessions** : Sessions planifiées/réalisées
- **conversations** : Conversations coach/client
- **messages** : Messages
- **trophies** : Système de gamification

### Sécurité (RLS)

- Isolation complète des données par coach
- Accès sécurisé basé sur les rôles
- Politiques de sécurité granulaires

## 🎯 Prêt pour le Transfert

Le projet est maintenant structuré pour une intégration Supabase fluide :

### ✅ Structure Supabase Complète
- Types TypeScript générés
- Services API organisés
- Migrations SQL prêtes
- Hooks personnalisés

### ✅ Authentification Prête
- Context Supabase Auth
- Gestion des rôles
- Profils utilisateurs

### ✅ Services API
- CRUD complet pour toutes les entités
- Gestion des erreurs
- Types sécurisés

### ✅ Migration Facile
- Fichier `.env.example` avec toutes les variables
- Documentation complète
- Structure modulaire

## 🔄 Prochaines Étapes (Cursor)

1. **Connecter Supabase** : Ajouter les variables d'environnement
2. **Exécuter les migrations** : Créer le schéma de base
3. **Remplacer les contexts** : Passer de mock data à Supabase
4. **Tester l'authentification** : Vérifier le flow complet
5. **Déployer** : Mise en production

Le terrain est parfaitement préparé pour un transfert fluide ! 🚀