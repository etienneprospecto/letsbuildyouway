import React from 'react';
import { Button, ButtonProps } from './button';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Cancel, 
  Download, 
  Upload,
  ChevronLeft,
  ChevronRight,
  Send,
  Eye,
  Settings,
  Check,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Boutons d'action primaires
export const PrimaryActionButton: React.FC<ButtonProps & { children: React.ReactNode }> = ({ 
  children, 
  className, 
  ...props 
}) => (
  <Button 
    variant="default" 
    className={cn("shadow-sm", className)} 
    {...props}
  >
    {children}
  </Button>
);

// Boutons d'action secondaires
export const SecondaryActionButton: React.FC<ButtonProps & { children: React.ReactNode }> = ({ 
  children, 
  className, 
  ...props 
}) => (
  <Button 
    variant="outline" 
    className={cn("shadow-sm", className)} 
    {...props}
  >
    {children}
  </Button>
);

// Boutons destructifs
export const DestructiveActionButton: React.FC<ButtonProps & { children: React.ReactNode }> = ({ 
  children, 
  className, 
  ...props 
}) => (
  <Button 
    variant="destructive" 
    className={cn("shadow-sm", className)} 
    {...props}
  >
    {children}
  </Button>
);

// Boutons avec icônes prédéfinies
export const AddButton: React.FC<ButtonProps & { label?: string }> = ({ 
  label = "Ajouter", 
  className, 
  ...props 
}) => (
  <PrimaryActionButton className={cn("gap-2", className)} {...props}>
    <Plus className="h-4 w-4" />
    {label}
  </PrimaryActionButton>
);

export const EditButton: React.FC<ButtonProps & { label?: string }> = ({ 
  label = "Modifier", 
  className, 
  ...props 
}) => (
  <SecondaryActionButton className={cn("gap-2", className)} {...props}>
    <Edit className="h-4 w-4" />
    {label}
  </SecondaryActionButton>
);

export const DeleteButton: React.FC<ButtonProps & { label?: string }> = ({ 
  label = "Supprimer", 
  className, 
  ...props 
}) => (
  <DestructiveActionButton className={cn("gap-2", className)} {...props}>
    <Trash2 className="h-4 w-4" />
    {label}
  </DestructiveActionButton>
);

export const SaveButton: React.FC<ButtonProps & { label?: string; saving?: boolean }> = ({ 
  label = "Sauvegarder", 
  saving = false,
  className, 
  ...props 
}) => (
  <PrimaryActionButton 
    className={cn("gap-2", className)} 
    disabled={saving}
    {...props}
  >
    <Save className="h-4 w-4" />
    {saving ? 'Sauvegarde...' : label}
  </PrimaryActionButton>
);

export const CancelButton: React.FC<ButtonProps & { label?: string }> = ({ 
  label = "Annuler", 
  className, 
  ...props 
}) => (
  <SecondaryActionButton className={cn("gap-2", className)} {...props}>
    <X className="h-4 w-4" />
    {label}
  </SecondaryActionButton>
);

export const DownloadButton: React.FC<ButtonProps & { label?: string }> = ({ 
  label = "Télécharger", 
  className, 
  ...props 
}) => (
  <SecondaryActionButton className={cn("gap-2", className)} {...props}>
    <Download className="h-4 w-4" />
    {label}
  </SecondaryActionButton>
);

export const UploadButton: React.FC<ButtonProps & { label?: string; uploading?: boolean }> = ({ 
  label = "Téléverser", 
  uploading = false,
  className, 
  ...props 
}) => (
  <SecondaryActionButton 
    className={cn("gap-2", className)} 
    disabled={uploading}
    {...props}
  >
    <Upload className="h-4 w-4" />
    {uploading ? 'Upload en cours...' : label}
  </SecondaryActionButton>
);

export const SendButton: React.FC<ButtonProps & { label?: string }> = ({ 
  label = "Envoyer", 
  className, 
  ...props 
}) => (
  <PrimaryActionButton className={cn("gap-2", className)} {...props}>
    <Send className="h-4 w-4" />
    {label}
  </PrimaryActionButton>
);

// Boutons de navigation
export const PreviousButton: React.FC<ButtonProps & { label?: string }> = ({ 
  label = "Précédent", 
  className, 
  ...props 
}) => (
  <SecondaryActionButton className={cn("gap-2", className)} {...props}>
    <ChevronLeft className="h-4 w-4" />
    {label}
  </SecondaryActionButton>
);

export const NextButton: React.FC<ButtonProps & { label?: string }> = ({ 
  label = "Suivant", 
  className, 
  ...props 
}) => (
  <SecondaryActionButton className={cn("gap-2", className)} {...props}>
    {label}
    <ChevronRight className="h-4 w-4" />
  </SecondaryActionButton>
);

// Boutons d'état
export const ViewButton: React.FC<ButtonProps & { label?: string }> = ({ 
  label = "Voir", 
  className, 
  ...props 
}) => (
  <Button variant="ghost" className={cn("gap-2", className)} {...props}>
    <Eye className="h-4 w-4" />
    {label}
  </Button>
);

export const SettingsButton: React.FC<ButtonProps & { label?: string }> = ({ 
  label = "Paramètres", 
  className, 
  ...props 
}) => (
  <Button variant="ghost" className={cn("gap-2", className)} {...props}>
    <Settings className="h-4 w-4" />
    {label}
  </Button>
);

// Boutons de confirmation
export const ConfirmButton: React.FC<ButtonProps & { label?: string }> = ({ 
  label = "Confirmer", 
  className, 
  ...props 
}) => (
  <Button variant="success" className={cn("gap-2", className)} {...props}>
    <Check className="h-4 w-4" />
    {label}
  </Button>
);

// Boutons flottants pour mobile
export const FloatingActionButton: React.FC<ButtonProps & { children: React.ReactNode }> = ({ 
  children, 
  className, 
  ...props 
}) => (
  <Button 
    variant="default" 
    size="icon"
    className={cn(
      "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow",
      className
    )} 
    {...props}
  >
    {children}
  </Button>
);

export const FloatingAddButton: React.FC<ButtonProps> = ({ className, ...props }) => (
  <FloatingActionButton className={className} {...props}>
    <Plus className="h-6 w-6" />
  </FloatingActionButton>
);
