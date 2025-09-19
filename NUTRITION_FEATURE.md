# Fonctionnalité Nutrition - BYW Coaching

## Vue d'ensemble

La fonctionnalité Nutrition permet aux clients de suivre leur alimentation et aux coachs de faire des recommandations personnalisées. Elle inclut un système de photos, des jauges interactives, et un suivi complet des macronutriments.

## Fonctionnalités principales

### Côté Client
- **Journal alimentaire** : Enregistrement des repas avec photos et descriptions
- **Jauges nutritionnelles** : Suivi en temps réel des objectifs caloriques et macronutriments
- **Upload de photos** : Système de stockage sécurisé pour les photos de repas
- **Suivi de l'hydratation** : Compteur de verres d'eau avec objectifs
- **Calendrier nutritionnel** : Vue d'ensemble des entrées par jour
- **Recommandations** : Conseils personnalisés basés sur les objectifs

### Côté Coach
- **Galerie des repas** : Visualisation de toutes les photos envoyées par les clients
- **Commentaires** : Ajout de recommandations sur chaque repas
- **Objectifs nutritionnels** : Définition des cibles pour chaque client
- **Statistiques avancées** : Graphiques d'évolution et tendances
- **Notifications** : Alertes quand un client ajoute un repas

## Architecture technique

### Tables de base de données

#### `nutrition_entries`
- Entrées nutritionnelles des clients
- Types de repas : petit-déjeuner, déjeuner, dîner, collation
- Macros : calories, protéines, glucides, lipides
- Photos et descriptions

#### `nutrition_comments`
- Commentaires des coachs sur les repas
- Système de feedback en temps réel

#### `nutrition_goals`
- Objectifs nutritionnels personnalisés par client
- Cibles quotidiennes pour tous les macronutriments

#### `hydration_tracking`
- Suivi quotidien de l'hydratation
- Compteur de verres d'eau

### Services

#### `NutritionService`
- CRUD complet pour toutes les entités nutritionnelles
- Upload et gestion des photos
- Calcul des statistiques et progressions
- Gestion des objectifs

### Composants

#### Composants principaux
- `ClientNutritionPage` : Page principale côté client
- `CoachNutritionPage` : Interface coach pour le suivi nutritionnel
- `NutritionGauges` : Jauges interactives pour les objectifs
- `AddNutritionEntryModal` : Modal d'ajout de repas avec upload photo

#### Composants utilitaires
- `NutritionEntryCard` : Carte d'affichage d'une entrée
- `NutritionCalendar` : Calendrier de navigation
- `NutritionStatsChart` : Graphiques d'évolution
- `NutritionRecommendations` : Système de recommandations
- `MacroBreakdown` : Détail des macronutriments

### Stockage des photos

- Bucket Supabase : `nutrition-photos`
- Politiques RLS pour la sécurité
- Compression automatique des images
- URLs publiques pour l'affichage

## Utilisation

### Pour les clients

1. **Ajouter un repas** :
   - Cliquer sur "Ajouter un repas"
   - Sélectionner le type de repas
   - Uploader une photo (optionnel)
   - Remplir les macros nutritionnels
   - Sauvegarder

2. **Suivre l'hydratation** :
   - Cliquer sur "Ajouter un verre d'eau"
   - Le compteur se met à jour automatiquement

3. **Consulter les recommandations** :
   - Les conseils apparaissent automatiquement
   - Basés sur les objectifs définis par le coach

### Pour les coachs

1. **Définir les objectifs** :
   - Aller dans la section Nutrition
   - Sélectionner un client
   - Cliquer sur "Objectifs"
   - Définir les cibles nutritionnelles

2. **Commenter les repas** :
   - Cliquer sur "Ajouter un commentaire"
   - Rédiger des recommandations
   - Le client verra les commentaires

3. **Analyser les tendances** :
   - Consulter les graphiques d'évolution
   - Identifier les patterns alimentaires
   - Ajuster les objectifs si nécessaire

## Personnalisation

### Couleurs et thèmes
- Jauges : Vert (objectif atteint), Orange (proche), Rouge (dépassé)
- Types de repas : Couleurs distinctes pour chaque repas
- Badges de statut : Codes couleur cohérents

### Objectifs par défaut
- Calories : 2000 kcal/jour
- Protéines : 150g/jour
- Glucides : 250g/jour
- Lipides : 65g/jour
- Eau : 8 verres/jour

## Sécurité

- RLS activé sur toutes les tables
- Politiques de sécurité strictes
- Upload de photos sécurisé
- Validation des données côté client et serveur

## Performance

- Index optimisés pour les requêtes fréquentes
- Pagination des entrées nutritionnelles
- Mise en cache des statistiques
- Compression des images

## Évolutions futures

- Reconnaissance automatique des aliments via IA
- Intégration avec des bases de données nutritionnelles
- Notifications push pour les rappels
- Export des données nutritionnelles
- Intégration avec des trackers de fitness
