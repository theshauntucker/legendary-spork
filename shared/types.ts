// Shared types used by both web and mobile apps

export interface AnalysisData {
  id: string;
  videoId: string;
  dancerName: string;
  studioName: string;
  routineTitle: string;
  danceStyle: string;
  competitionType: string;
  overallScore: number;
  judgeScores: JudgeScore[];
  timelineNotes: TimelineNote[];
  improvementPriorities: ImprovementPriority[];
  frames: string[];
  framesDeleted?: boolean;
  createdAt: string;
}

export interface JudgeScore {
  category: string;
  score: number;
  maxScore: number;
  feedback: string;
  styleNotes?: string;
}

export interface TimelineNote {
  timestamp: number;
  note: string;
  type: 'strength' | 'improvement' | 'technique' | 'performance';
}

export interface ImprovementPriority {
  rank: number;
  item: string;
  trainingTip: string;
  impact: 'high' | 'medium' | 'low';
}

export interface VideoMetadata {
  dancerName: string;
  studioName: string;
  routineTitle: string;
  danceStyle: string;
  competitionType: string;
  ageGroup: string;
  level: string;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: 'coppa_parent' | 'coppa_data_processing';
  consentVersion: string;
  consentedAt: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  createdAt: string;
  consentGiven: boolean;
}
