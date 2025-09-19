export const MEAL_TYPES = [
  { value: 'petit-dejeuner', label: 'Petit-déjeuner', icon: '🌅', color: 'orange' },
  { value: 'dejeuner', label: 'Déjeuner', icon: '☀️', color: 'blue' },
  { value: 'diner', label: 'Dîner', icon: '🌙', color: 'purple' },
  { value: 'collation', label: 'Collation', icon: '🍎', color: 'green' }
] as const;

export const MACRO_NUTRIENTS = [
  {
    key: 'calories',
    label: 'Calories',
    unit: '',
    icon: '⚡',
    color: 'orange',
    description: 'Énergie totale'
  },
  {
    key: 'proteins',
    label: 'Protéines',
    unit: 'g',
    icon: '🥩',
    color: 'blue',
    description: 'Construction musculaire'
  },
  {
    key: 'carbs',
    label: 'Glucides',
    unit: 'g',
    icon: '🌾',
    color: 'green',
    description: 'Énergie rapide'
  },
  {
    key: 'fats',
    label: 'Lipides',
    unit: 'g',
    icon: '🥑',
    color: 'purple',
    description: 'Énergie longue durée'
  }
] as const;

export const NUTRITION_GOALS_DEFAULTS = {
  daily_calories: 2000,
  daily_proteins: 150,
  daily_carbs: 250,
  daily_fats: 70,
  daily_water_glasses: 8
} as const;

export const NUTRITION_RECOMMENDATIONS = {
  CALORIE_RANGES: {
    LOW: { min: 0, max: 70, message: 'Apport calorique insuffisant' },
    OPTIMAL: { min: 80, max: 110, message: 'Excellent équilibre calorique' },
    HIGH: { min: 111, max: 130, message: 'Apport calorique élevé' },
    EXCESSIVE: { min: 131, max: 200, message: 'Apport calorique excessif' }
  },
  PROTEIN_RANGES: {
    LOW: { min: 0, max: 80, message: 'Apport protéique insuffisant' },
    OPTIMAL: { min: 90, max: 110, message: 'Apport protéique optimal' },
    HIGH: { min: 111, max: 150, message: 'Apport protéique élevé' }
  },
  WATER_RANGES: {
    LOW: { min: 0, max: 70, message: 'Hydratation insuffisante' },
    OPTIMAL: { min: 80, max: 110, message: 'Hydratation parfaite' },
    HIGH: { min: 111, max: 200, message: 'Hydratation excessive' }
  }
} as const;

export const NUTRITION_TIPS = [
  {
    category: 'general',
    tips: [
      'Prenez le temps de manger et mastiquez bien',
      'Buvez un verre d\'eau avant chaque repas',
      'Variez les couleurs dans votre assiette',
      'Évitez les distractions pendant les repas'
    ]
  },
  {
    category: 'proteins',
    tips: [
      'Incluez des protéines à chaque repas',
      'Privilégiez les protéines maigres',
      'Variez les sources : viande, poisson, œufs, légumineuses',
      'Consommez des protéines dans les 30 minutes après l\'entraînement'
    ]
  },
  {
    category: 'hydration',
    tips: [
      'Buvez régulièrement tout au long de la journée',
      'Commencez la journée avec un verre d\'eau',
      'Écoutez votre soif',
      'Les fruits et légumes contribuent à l\'hydratation'
    ]
  },
  {
    category: 'timing',
    tips: [
      'Prenez un petit-déjeuner dans l\'heure qui suit le réveil',
      'Mangez toutes les 3-4 heures',
      'Évitez de manger 2 heures avant le coucher',
      'Planifiez vos repas à l\'avance'
    ]
  }
] as const;

export const NUTRITION_ICONS = {
  CALORIES: '⚡',
  PROTEINS: '🥩',
  CARBS: '🌾',
  FATS: '🥑',
  WATER: '💧',
  MEAL: '🍽️',
  SNACK: '🍎',
  BREAKFAST: '🌅',
  LUNCH: '☀️',
  DINNER: '🌙',
  TARGET: '🎯',
  TREND_UP: '📈',
  TREND_DOWN: '📉',
  CHECK: '✅',
  WARNING: '⚠️',
  INFO: 'ℹ️'
} as const;

export const NUTRITION_COLORS = {
  CALORIES: 'orange',
  PROTEINS: 'blue',
  CARBS: 'green',
  FATS: 'purple',
  WATER: 'cyan',
  SUCCESS: 'green',
  WARNING: 'yellow',
  ERROR: 'red',
  INFO: 'blue'
} as const;
