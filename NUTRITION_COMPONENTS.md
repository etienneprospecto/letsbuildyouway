# Composants Nutritionnels BYW

## Vue d'ensemble

Ce document décrit tous les composants nutritionnels créés pour le système BYW, organisés par catégorie et fonctionnalité.

## Composants de base

### 1. NutritionGauges
- **Fichier**: `NutritionGauges.tsx`
- **Description**: Jauges visuelles pour afficher les progrès nutritionnels
- **Fonctionnalités**:
  - Barres de progression pour calories, protéines, glucides, lipides, hydratation
  - Couleurs dynamiques (vert/orange/rouge) selon l'atteinte des objectifs
  - Animations smooth
  - Affichage des pourcentages et valeurs absolues

### 2. AddNutritionEntryModal
- **Fichier**: `AddNutritionEntryModal.tsx`
- **Description**: Modal pour ajouter de nouvelles entrées nutritionnelles
- **Fonctionnalités**:
  - Upload de photos de repas
  - Saisie manuelle des macros
  - Sélection du type de repas
  - Compression automatique des images
  - Preview des photos

### 3. NutritionEntryCard
- **Fichier**: `NutritionEntryCard.tsx`
- **Description**: Carte d'affichage d'une entrée nutritionnelle
- **Fonctionnalités**:
  - Affichage de la photo, description, macros
  - Zone de commentaires pour les coachs
  - Actions d'édition/suppression
  - Timestamp et type de repas

## Composants avancés

### 4. SmartNutritionGoals
- **Fichier**: `SmartNutritionGoals.tsx`
- **Description**: Objectifs nutritionnels optimisés par IA
- **Fonctionnalités**:
  - Recommandations IA basées sur l'historique
  - Analyse de confiance des suggestions
  - Insights automatiques
  - Paramètres d'IA configurables

### 5. CollaborativeNutritionGoals
- **Fichier**: `CollaborativeNutritionGoals.tsx`
- **Description**: Collaboration en temps réel entre coach et client
- **Fonctionnalités**:
  - Propositions d'objectifs mutuelles
  - Système d'approbation/rejet
  - Commentaires en temps réel
  - Sessions de collaboration actives
  - Notifications d'invitation

### 6. GamifiedNutritionGoals
- **Fichier**: `GamifiedNutritionGoals.tsx`
- **Description**: Gamification des objectifs nutritionnels
- **Fonctionnalités**:
  - Système de points et niveaux
  - Succès et quêtes
  - Classement des utilisateurs
  - Récompenses et badges
  - Série de jours consécutifs

### 7. AdaptiveNutritionGoals
- **Fichier**: `AdaptiveNutritionGoals.tsx`
- **Description**: Ajustement automatique des objectifs
- **Fonctionnalités**:
  - Règles d'adaptation configurables
  - Ajustements automatiques basés sur les performances
  - Historique des modifications
  - Insights d'adaptation
  - Mode auto-adaptation

### 8. RealTimeNutritionGoals
- **Fichier**: `RealTimeNutritionGoals.tsx`
- **Description**: Mises à jour en temps réel
- **Fonctionnalités**:
  - Synchronisation instantanée
  - Notifications push
  - Statut de connexion
  - Utilisateurs actifs
  - Historique des mises à jour

### 9. AINutritionGoals
- **Fichier**: `AINutritionGoals.tsx`
- **Description**: IA avancée pour l'analyse nutritionnelle
- **Fonctionnalités**:
  - Modèles IA multiples (GPT-4, Claude, etc.)
  - Prédictions nutritionnelles
  - Insights avancés
  - Optimisations automatiques
  - Paramètres d'IA configurables

## Composants utilitaires

### 10. NutritionNotification
- **Fichier**: `NutritionNotification.tsx`
- **Description**: Système de notifications nutritionnelles
- **Fonctionnalités**:
  - Notifications push
  - Types de notifications variés
  - Gestion des préférences
  - Historique des notifications

### 11. NutritionStatsChart
- **Fichier**: `NutritionStatsChart.tsx`
- **Description**: Graphiques et statistiques nutritionnelles
- **Fonctionnalités**:
  - Graphiques d'évolution
  - Statistiques détaillées
  - Comparaisons temporelles
  - Export de données

### 12. NutritionGoalsCard
- **Fichier**: `NutritionGoalsCard.tsx`
- **Description**: Carte d'affichage des objectifs
- **Fonctionnalités**:
  - Affichage des objectifs quotidiens
  - Progression visuelle
  - Actions d'édition
  - Historique des modifications

### 13. NutritionCalendar
- **Fichier**: `NutritionCalendar.tsx`
- **Description**: Calendrier des entrées nutritionnelles
- **Fonctionnalités**:
  - Vue calendrier des repas
  - Navigation par mois/semaine
  - Indicateurs visuels
  - Filtres par type de repas

### 14. NutritionRecommendations
- **Fichier**: `NutritionRecommendations.tsx`
- **Description**: Recommandations nutritionnelles
- **Fonctionnalités**:
  - Suggestions personnalisées
  - Recommandations de coach
  - Base de données d'aliments
  - Calculs nutritionnels

### 15. MacroBreakdown
- **Fichier**: `MacroBreakdown.tsx`
- **Description**: Détail des macronutriments
- **Fonctionnalités**:
  - Répartition des macros
  - Graphiques en secteurs
  - Comparaisons avec les objectifs
  - Recommandations d'ajustement

## Composants de gestion

### 16. NutritionNotificationsCenter
- **Fichier**: `NutritionNotificationsCenter.tsx`
- **Description**: Centre de gestion des notifications
- **Fonctionnalités**:
  - Centralisation des notifications
  - Gestion des préférences
  - Historique complet
  - Actions en lot

### 17. NutritionAnalytics
- **Fichier**: `NutritionAnalytics.tsx`
- **Description**: Analytics nutritionnels avancés
- **Fonctionnalités**:
  - Métriques détaillées
  - Tendances et patterns
  - Rapports personnalisés
  - Export de données

### 18. AdvancedNutritionGoals
- **Fichier**: `AdvancedNutritionGoals.tsx`
- **Description**: Gestion avancée des objectifs
- **Fonctionnalités**:
  - Objectifs complexes
  - Règles conditionnelles
  - Ajustements automatiques
  - Historique détaillé

### 19. NutritionReport
- **Fichier**: `NutritionReport.tsx`
- **Description**: Génération de rapports nutritionnels
- **Fonctionnalités**:
  - Rapports personnalisés
  - Export PDF/Excel
  - Graphiques intégrés
  - Partage avec le coach

### 20. PersonalizedNutritionGoals
- **Fichier**: `PersonalizedNutritionGoals.tsx`
- **Description**: Objectifs personnalisés
- **Fonctionnalités**:
  - Adaptation aux préférences
  - Objectifs dynamiques
  - Ajustements automatiques
  - Suivi personnalisé

## Dashboard principal

### 21. AdvancedNutritionDashboard
- **Fichier**: `AdvancedNutritionDashboard.tsx`
- **Description**: Dashboard principal intégrant tous les composants
- **Fonctionnalités**:
  - Navigation par onglets
  - Vue d'ensemble des statistiques
  - Accès rapide aux fonctionnalités
  - Interface unifiée

## Configuration et services

### 22. Configuration
- **Fichier**: `config/nutrition.ts`
- **Description**: Configuration des types de repas et macros
- **Fonctionnalités**:
  - Définitions des types de repas
  - Configuration des macros
  - Constantes nutritionnelles
  - Paramètres par défaut

### 23. Service de nutrition
- **Fichier**: `services/nutritionService.ts`
- **Description**: Service pour les interactions avec la base de données
- **Fonctionnalités**:
  - CRUD des entrées nutritionnelles
  - Gestion des commentaires
  - Suivi des objectifs
  - Analytics nutritionnels

### 24. Hook personnalisé
- **Fichier**: `hooks/useNutrition.ts`
- **Description**: Hook React pour la gestion de l'état nutritionnel
- **Fonctionnalités**:
  - État global des données nutritionnelles
  - Actions CRUD
  - Gestion des erreurs
  - Optimisations de performance

## Utilisation

### Import des composants
```typescript
import { 
  NutritionGauges,
  AddNutritionEntryModal,
  SmartNutritionGoals,
  AdvancedNutritionDashboard
} from '@/components/nutrition';
```

### Exemple d'utilisation
```typescript
<AdvancedNutritionDashboard
  clientId={clientId}
  coachId={coachId}
  currentGoals={goals}
  onUpdateGoals={handleUpdateGoals}
  isCoach={userRole === 'coach'}
/>
```

## Architecture

### Structure des fichiers
```
src/components/nutrition/
├── index.ts                          # Exports principaux
├── NutritionGauges.tsx              # Jauges de progression
├── AddNutritionEntryModal.tsx       # Modal d'ajout
├── NutritionEntryCard.tsx           # Carte d'entrée
├── SmartNutritionGoals.tsx          # Objectifs IA
├── CollaborativeNutritionGoals.tsx  # Collaboration
├── GamifiedNutritionGoals.tsx       # Gamification
├── AdaptiveNutritionGoals.tsx       # Adaptation automatique
├── RealTimeNutritionGoals.tsx       # Temps réel
├── AINutritionGoals.tsx             # IA avancée
├── AdvancedNutritionDashboard.tsx   # Dashboard principal
└── ... (autres composants utilitaires)
```

### Base de données
- `nutrition_entries`: Entrées nutritionnelles
- `nutrition_comments`: Commentaires des coachs
- `nutrition_goals`: Objectifs nutritionnels
- `hydration_tracking`: Suivi de l'hydratation

### Stockage
- Bucket `nutrition-photos` pour les photos de repas
- Politiques RLS pour la sécurité
- Compression automatique des images

## Prochaines étapes

1. **Tests unitaires**: Créer des tests pour chaque composant
2. **Tests d'intégration**: Tester les interactions entre composants
3. **Optimisation**: Améliorer les performances et la réactivité
4. **Documentation**: Ajouter des exemples d'utilisation détaillés
5. **Accessibilité**: Améliorer l'accessibilité des composants
6. **Internationalisation**: Ajouter le support multilingue
7. **Mobile**: Optimiser pour les appareils mobiles
8. **PWA**: Ajouter les fonctionnalités PWA
