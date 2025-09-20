// Types locaux pour les composants dashboard
// Évite les dépendances circulaires avec les services

export interface ClientBasicInfo {
  id: string
  first_name: string
  last_name: string
  photo_url: string | null
  objective: string
  level: 'Débutant' | 'Intermédiaire' | 'Avancé'
  start_date: string
  age: number
  contact: string
  mentality: string
  sports_history: string
  coaching_type: string
  constraints: string | null
  allergies: string | null
  morphotype: string | null
  equipment: string | null
  lifestyle: string | null
  poids_depart: number | null
  poids_objectif: number | null
  poids_actuel: number | null
  coach_id: string
}

export interface SeanceBasicInfo {
  id: string
  nom_seance: string
  date_seance: string
  statut: 'programmée' | 'terminée' | 'manquée'
  intensite_ressentie: number | null
  humeur: string | null
  commentaire_client: string | null
  date_fin: string | null
  exercices_termines: number
  taux_reussite: number
  reponse_coach: string | null
}

export interface ExerciceSeanceBasicInfo {
  id: string
  nom_exercice: string
  series: number
  repetitions: string
  temps_repos: string | null
  ordre: number
  completed: boolean
}

export interface SeanceWithExercices extends SeanceBasicInfo {
  exercices?: ExerciceSeanceBasicInfo[]
}

export interface WeeklyFeedbackBasicInfo {
  id: string
  week_start: string
  week_end: string
  score: number
  submitted_at: string | null
}

export interface ResourceBasicInfo {
  id: string
  nom_ressource: string
  type_ressource: 'video' | 'pdf' | 'link' | 'image' | 'document'
  theme: 'Alimentation' | 'Style de vie' | 'Ressentis' | 'Entraînement'
  url_fichier: string | null
  taille_fichier: number | null
  description: string | null
  created_at: string
}

export interface ResourceWithUrl extends ResourceBasicInfo {
  downloadUrl?: string
  previewUrl?: string
}

export interface ProgressData {
  date: string
  weight: number | null
  waistCircumference: number | null
  body_fat: number | null
  muscle_mass: number | null
}

export interface ClientDetailPageProps {
  client: ClientBasicInfo
  onClose: () => void
  onEdit: () => void
}

export interface SeanceModalProps {
  seance: SeanceWithExercices | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (seanceId: string, updates: Partial<SeanceBasicInfo>) => Promise<void>
}

export interface AddSeanceModalProps {
  clientId: string
  isOpen: boolean
  onClose: () => void
  onSeanceAdded: () => void
}

export interface FeedbackCardProps {
  title: string
  score: number
  color: string
  onClick: () => void
  submitted?: boolean
}

export interface ResourceUploadZoneProps {
  clientId: string
  onResourceUploaded: () => void
  theme?: string
}

export interface ResourceFilterProps {
  selectedTheme: string
  onThemeChange: (theme: string) => void
}

export interface ExportPDFData {
  client: ClientBasicInfo
  seances: SeanceWithExercices[]
  feedbacks: WeeklyFeedbackBasicInfo[]
  resources: ResourceBasicInfo[]
  progressData: ProgressData[]
}
