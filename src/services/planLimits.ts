export type PlanKey = 'warm_up' | 'transformationnel' | 'elite';

export type PlanLimits = {
  max_clients: number;
  timeline_weeks: number;
  max_workouts: number; // -1 means unlimited
  max_exercises: number; // -1 means unlimited
  features: string[];
};

export const PACK_LIMITS: Record<PlanKey, PlanLimits> = {
  warm_up: {
    max_clients: 15,
    timeline_weeks: 1,
    max_workouts: 15,
    max_exercises: 30,
    features: [
      'basic_dashboard',
      'basic_messaging',
      'simple_calendar',
      'basic_client_dashboard',
      'basic_settings_notifications',
    ],
  },
  transformationnel: {
    max_clients: 50,
    timeline_weeks: 4,
    max_workouts: 50,
    max_exercises: 100,
    features: [
      'advanced_dashboard',
      'voice_messaging',
      'nutrition_tracking',
      'advanced_feedbacks',
      'progress_photos_history',
      'trophies',
      'shared_resources',
      'payment_retries',
    ],
  },
  elite: {
    max_clients: 100,
    timeline_weeks: 52,
    max_workouts: -1,
    max_exercises: -1,
    features: [
      'ai_nutrition',
      'financial_dashboard',
      'advanced_automation',
      'full_calendar_integration',
      'premium_resources_exports',
      'priority_support',
      'advanced_gamification',
      'theme_customization',
    ],
  },
};

export const formatLimit = (value: number): string => (value < 0 ? 'Illimité' : String(value));


