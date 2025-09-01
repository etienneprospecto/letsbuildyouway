export interface FeedbackQuestion {
  id: string
  template_id: string
  question_text: string
  question_type: 'text' | 'scale_1_10' | 'multiple_choice' | 'yes_no'
  order_index: number
  required: boolean
  options?: string[] // Pour les questions à choix multiple
  created_at: string
}

export interface FeedbackTemplate {
  id: string
  coach_id: string
  name: string
  description?: string
  is_active: boolean
  questions: FeedbackQuestion[]
  created_at: string
  updated_at: string
}

export interface WeeklyFeedback {
  id: string
  client_id: string
  coach_id: string
  template_id: string
  week_start: string
  week_end: string
  status: 'draft' | 'sent' | 'in_progress' | 'completed'
  sent_at?: string
  completed_at?: string
  responses: FeedbackResponse[]
  score?: number
  created_at: string
  updated_at: string
}

export interface FeedbackResponse {
  question_id: string
  question_text: string
  question_type: string
  response: string | number | string[]
  created_at: string
}

export interface FeedbackStats {
  total_sent: number
  total_completed: number
  completion_rate: number
  average_score: number
  weekly_trend: {
    week: string
    sent: number
    completed: number
    score: number
  }[]
}

export interface ClientFeedbackSummary {
  client_id: string
  client_name: string
  client_email: string
  last_feedback_date?: string
  completion_rate: number
  average_score: number
  total_feedbacks: number
}

export interface CoachFeedbackDashboard {
  stats: FeedbackStats
  clients_summary: ClientFeedbackSummary[]
  recent_feedbacks: WeeklyFeedback[]
  upcoming_deadlines: WeeklyFeedback[]
}
