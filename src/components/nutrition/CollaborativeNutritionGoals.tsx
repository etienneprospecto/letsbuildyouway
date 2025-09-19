import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Users, 
  MessageSquare, 
  Target, 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  Clock,
  Zap,
  Activity,
  Heart,
  BarChart3,
  Calendar,
  Star,
  Award,
  Sparkles,
  Cpu,
  Database,
  Settings,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  RotateCcw,
  Save,
  Eye,
  EyeOff,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Bell,
  User,
  UserCheck,
  UserX,
  MessageCircle,
  Send,
  Edit,
  Trash2,
  Lock,
  Unlock
} from 'lucide-react';

interface CollaborativeNutritionGoalsProps {
  clientId: string;
  coachId: string;
  currentGoals: any;
  onUpdateGoals: (goals: any) => void;
  isCoach?: boolean;
}

interface CollaborativeGoal {
  id: string;
  title: string;
  category: 'calories' | 'proteins' | 'carbs' | 'fats' | 'water';
  currentValue: number;
  targetValue: number;
  proposedValue: number;
  status: 'active' | 'pending' | 'rejected' | 'approved';
  proposer: 'client' | 'coach';
  proposerName: string;
  proposalDate: string;
  approvalDate?: string;
  rejectionReason?: string;
  comments: {
    id: string;
    author: string;
    authorRole: 'client' | 'coach';
    content: string;
    timestamp: string;
    likes: number;
    isLiked: boolean;
  }[];
  icon: any;
  color: string;
  isCollaborative: boolean;
}

interface CollaborationSession {
  id: string;
  title: string;
  participants: {
    id: string;
    name: string;
    role: 'client' | 'coach';
    status: 'online' | 'offline' | 'away';
    lastSeen: string;
  }[];
  startTime: string;
  endTime?: string;
  isActive: boolean;
  goals: string[];
  notes: string;
}

interface CollaborationInvite {
  id: string;
  from: string;
  fromRole: 'client' | 'coach';
  message: string;
  sessionId: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'declined';
}

const CollaborativeNutritionGoals: React.FC<CollaborativeNutritionGoalsProps> = ({
  clientId,
  coachId,
  currentGoals,
  onUpdateGoals,
  isCoach = false
}) => {
  const [collaborativeGoals, setCollaborativeGoals] = useState<CollaborativeGoal[]>([]);
  const [activeSession, setActiveSession] = useState<CollaborationSession | null>(null);
  const [invites, setInvites] = useState<CollaborationInvite[]>([]);
  const [isInSession, setIsInSession] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [showInvites, setShowInvites] = useState(false);

  useEffect(() => {
    initializeCollaborativeGoals();
    initializeActiveSession();
    initializeInvites();
  }, []);

  const initializeCollaborativeGoals = () => {
    const goals: CollaborativeGoal[] = [
      {
        id: 'calories-collab',
        title: 'Calories',
        category: 'calories',
        currentValue: 0,
        targetValue: currentGoals?.daily_calories || 2000,
        proposedValue: 1850,
        status: 'pending',
        proposer: 'coach',
        proposerName: 'Coach Marie',
        proposalDate: '2024-01-20T10:30:00Z',
        comments: [
          {
            id: 'comment-1',
            author: 'Coach Marie',
            authorRole: 'coach',
            content: 'Je propose de réduire les calories à 1850 pour accélérer la perte de poids.',
            timestamp: '2024-01-20T10:30:00Z',
            likes: 2,
            isLiked: false
          },
          {
            id: 'comment-2',
            author: 'Client',
            authorRole: 'client',
            content: 'D\'accord, mais est-ce que je peux garder mes collations ?',
            timestamp: '2024-01-20T10:45:00Z',
            likes: 1,
            isLiked: true
          }
        ],
        icon: Zap,
        color: 'orange',
        isCollaborative: true
      },
      {
        id: 'proteins-collab',
        title: 'Protéines',
        category: 'proteins',
        currentValue: 0,
        targetValue: currentGoals?.daily_proteins || 150,
        proposedValue: 160,
        status: 'approved',
        proposer: 'client',
        proposerName: 'Client',
        proposalDate: '2024-01-19T14:20:00Z',
        approvalDate: '2024-01-19T15:30:00Z',
        comments: [
          {
            id: 'comment-3',
            author: 'Client',
            authorRole: 'client',
            content: 'Je pense qu\'on devrait augmenter les protéines pour la récupération.',
            timestamp: '2024-01-19T14:20:00Z',
            likes: 3,
            isLiked: true
          },
          {
            id: 'comment-4',
            author: 'Coach Marie',
            authorRole: 'coach',
            content: 'Excellente idée ! Approuvé.',
            timestamp: '2024-01-19T15:30:00Z',
            likes: 1,
            isLiked: false
          }
        ],
        icon: Target,
        color: 'blue',
        isCollaborative: true
      },
      {
        id: 'carbs-collab',
        title: 'Glucides',
        category: 'carbs',
        currentValue: 0,
        targetValue: currentGoals?.daily_carbs || 250,
        proposedValue: 220,
        status: 'rejected',
        proposer: 'coach',
        proposerName: 'Coach Marie',
        proposalDate: '2024-01-18T16:45:00Z',
        rejectionReason: 'Le client préfère garder ses glucides actuels',
        comments: [
          {
            id: 'comment-5',
            author: 'Coach Marie',
            authorRole: 'coach',
            content: 'Je propose de réduire les glucides pour améliorer la sensibilité à l\'insuline.',
            timestamp: '2024-01-18T16:45:00Z',
            likes: 1,
            isLiked: false
          },
          {
            id: 'comment-6',
            author: 'Client',
            authorRole: 'client',
            content: 'Je préfère garder mes glucides actuels, j\'ai besoin d\'énergie pour mes entraînements.',
            timestamp: '2024-01-18T17:00:00Z',
            likes: 2,
            isLiked: true
          }
        ],
        icon: Activity,
        color: 'green',
        isCollaborative: true
      }
    ];

    setCollaborativeGoals(goals);
  };

  const initializeActiveSession = () => {
    const session: CollaborationSession = {
      id: 'session-1',
      title: 'Révision des objectifs nutritionnels',
      participants: [
        {
          id: clientId,
          name: 'Client',
          role: 'client',
          status: 'online',
          lastSeen: new Date().toISOString()
        },
        {
          id: coachId,
          name: 'Coach Marie',
          role: 'coach',
          status: 'online',
          lastSeen: new Date().toISOString()
        }
      ],
      startTime: '2024-01-20T10:00:00Z',
      isActive: true,
      goals: ['calories-collab', 'proteins-collab'],
      notes: 'Session de révision des objectifs nutritionnels pour optimiser les résultats.'
    };

    setActiveSession(session);
    setIsInSession(true);
  };

  const initializeInvites = () => {
    const invites: CollaborationInvite[] = [
      {
        id: 'invite-1',
        from: 'Coach Marie',
        fromRole: 'coach',
        message: 'Voulez-vous collaborer sur vos objectifs nutritionnels ?',
        sessionId: 'session-1',
        expiresAt: '2024-01-21T10:00:00Z',
        status: 'pending'
      }
    ];

    setInvites(invites);
  };

  const proposeGoalChange = (goalId: string, newValue: number) => {
    setCollaborativeGoals(prev =>
      prev.map(goal =>
        goal.id === goalId
          ? {
              ...goal,
              proposedValue: newValue,
              status: 'pending',
              proposer: isCoach ? 'coach' : 'client',
              proposerName: isCoach ? 'Coach Marie' : 'Client',
              proposalDate: new Date().toISOString(),
              comments: [
                ...goal.comments,
                {
                  id: `comment-${Date.now()}`,
                  author: isCoach ? 'Coach Marie' : 'Client',
                  authorRole: isCoach ? 'coach' : 'client',
                  content: `Proposition de changement à ${newValue}`,
                  timestamp: new Date().toISOString(),
                  likes: 0,
                  isLiked: false
                }
              ]
            }
          : goal
      )
    );
  };

  const approveGoal = (goalId: string) => {
    setCollaborativeGoals(prev =>
      prev.map(goal =>
        goal.id === goalId
          ? {
              ...goal,
              status: 'approved',
              targetValue: goal.proposedValue,
              approvalDate: new Date().toISOString(),
              comments: [
                ...goal.comments,
                {
                  id: `comment-${Date.now()}`,
                  author: isCoach ? 'Coach Marie' : 'Client',
                  authorRole: isCoach ? 'coach' : 'client',
                  content: 'Objectif approuvé !',
                  timestamp: new Date().toISOString(),
                  likes: 0,
                  isLiked: false
                }
              ]
            }
          : goal
      )
    );
  };

  const rejectGoal = (goalId: string, reason: string) => {
    setCollaborativeGoals(prev =>
      prev.map(goal =>
        goal.id === goalId
          ? {
              ...goal,
              status: 'rejected',
              rejectionReason: reason,
              comments: [
                ...goal.comments,
                {
                  id: `comment-${Date.now()}`,
                  author: isCoach ? 'Coach Marie' : 'Client',
                  authorRole: isCoach ? 'coach' : 'client',
                  content: `Rejeté: ${reason}`,
                  timestamp: new Date().toISOString(),
                  likes: 0,
                  isLiked: false
                }
              ]
            }
          : goal
      )
    );
  };

  const addComment = (goalId: string) => {
    if (!newComment.trim()) return;

    setCollaborativeGoals(prev =>
      prev.map(goal =>
        goal.id === goalId
          ? {
              ...goal,
              comments: [
                ...goal.comments,
                {
                  id: `comment-${Date.now()}`,
                  author: isCoach ? 'Coach Marie' : 'Client',
                  authorRole: isCoach ? 'coach' : 'client',
                  content: newComment,
                  timestamp: new Date().toISOString(),
                  likes: 0,
                  isLiked: false
                }
              ]
            }
          : goal
      )
    );

    setNewComment('');
  };

  const likeComment = (goalId: string, commentId: string) => {
    setCollaborativeGoals(prev =>
      prev.map(goal =>
        goal.id === goalId
          ? {
              ...goal,
              comments: goal.comments.map(comment =>
                comment.id === commentId
                  ? {
                      ...comment,
                      likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
                      isLiked: !comment.isLiked
                    }
                  : comment
              )
            }
          : goal
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getParticipantStatus = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'À l\'instant';
    if (diffMinutes < 60) return `Il y a ${diffMinutes}min`;
    if (diffMinutes < 1440) return `Il y a ${Math.floor(diffMinutes / 60)}h`;
    return `Il y a ${Math.floor(diffMinutes / 1440)}j`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center space-x-2">
            <Users className="h-6 w-6 text-purple-600" />
            <span>Objectifs nutritionnels collaboratifs</span>
          </h2>
          <p className="text-gray-600">Collaboration en temps réel entre coach et client</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-purple-600" />
            <span className="text-sm text-gray-600">
              {activeSession?.participants.length || 0} participants
            </span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInvites(!showInvites)}
          >
            <Bell className="h-4 w-4 mr-2" />
            Invitations ({invites.filter(i => i.status === 'pending').length})
          </Button>
        </div>
      </div>

      {/* Active Session */}
      {activeSession && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">{activeSession.title}</h3>
              <p className="text-sm text-gray-600">
                Session active depuis {formatTime(activeSession.startTime)}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                {activeSession.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="relative"
                  >
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {participant.name.charAt(0)}
                    </div>
                    <div
                      className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getParticipantStatus(participant.status)}`}
                    ></div>
                  </div>
                ))}
              </div>
              
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                En cours
              </Badge>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>{activeSession.notes}</p>
          </div>
        </Card>
      )}

      {/* Collaborative Goals */}
      <div className="space-y-4">
        {collaborativeGoals.map((goal) => {
          const Icon = goal.icon;
          const progressPercentage = (goal.currentValue / goal.targetValue) * 100;
          
          return (
            <Card key={goal.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Icon className={`h-6 w-6 text-${goal.color}-600`} />
                  <div>
                    <h4 className="font-semibold">{goal.title}</h4>
                    <p className="text-sm text-gray-600">
                      Proposé par {goal.proposerName} le {new Date(goal.proposalDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(goal.status)}>
                    {getStatusIcon(goal.status)}
                    <span className="ml-1 capitalize">{goal.status}</span>
                  </Badge>
                  
                  {goal.isCollaborative && (
                    <Badge className="bg-purple-100 text-purple-800">
                      <Users className="h-3 w-3 mr-1" />
                      Collaboratif
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{goal.targetValue}</div>
                  <div className="text-sm text-gray-600">Valeur actuelle</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{goal.proposedValue}</div>
                  <div className="text-sm text-gray-600">Valeur proposée</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{goal.currentValue}</div>
                  <div className="text-sm text-gray-600">Valeur actuelle</div>
                </div>
              </div>
              
              <Progress value={Math.min(progressPercentage, 100)} className="h-2 mb-4" />
              
              {/* Actions */}
              {goal.status === 'pending' && (
                <div className="flex space-x-2 mb-4">
                  <Button
                    onClick={() => approveGoal(goal.id)}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approuver
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => rejectGoal(goal.id, 'Raison non spécifiée')}
                    className="flex-1"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Rejeter
                  </Button>
                </div>
              )}
              
              {/* Comments */}
              <div className="space-y-3">
                <h5 className="font-medium">Commentaires</h5>
                
                {goal.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {comment.author.charAt(0)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm">{comment.author}</span>
                        <Badge variant={comment.authorRole === 'coach' ? 'default' : 'secondary'}>
                          {comment.authorRole === 'coach' ? 'Coach' : 'Client'}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatTime(comment.timestamp)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-2">{comment.content}</p>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => likeComment(goal.id, comment.id)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <ThumbsUp className={`h-4 w-4 mr-1 ${comment.isLiked ? 'text-blue-600' : ''}`} />
                          {comment.likes}
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Répondre
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Add Comment */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Ajouter un commentaire..."
                    className="flex-1 p-2 border rounded-lg"
                  />
                  
                  <Button
                    onClick={() => addComment(goal.id)}
                    disabled={!newComment.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Invites */}
      {showInvites && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Invitations de collaboration</h3>
          
          <div className="space-y-3">
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                    {invite.from.charAt(0)}
                  </div>
                  
                  <div>
                    <h4 className="font-medium">{invite.from}</h4>
                    <p className="text-sm text-gray-600">{invite.message}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(invite.status)}>
                    {invite.status}
                  </Badge>
                  
                  {invite.status === 'pending' && (
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={() => {
                        setInvites(prev =>
                          prev.map(i =>
                            i.id === invite.id ? { ...i, status: 'accepted' } : i
                          )
                        );
                      }}>
                        Accepter
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setInvites(prev =>
                            prev.map(i =>
                              i.id === invite.id ? { ...i, status: 'declined' } : i
                            )
                          );
                        }}
                      >
                        Refuser
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default CollaborativeNutritionGoals;