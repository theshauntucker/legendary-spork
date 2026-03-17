export interface JudgeScore {
  category: string;
  max: number;
  judges: number[];
  avg: number;
  feedback: string;
}

export interface TimelineNote {
  time: string;
  note: string;
  type: "positive" | "improvement";
}

export interface ImprovementPriority {
  priority: number;
  item: string;
  impact: string;
  timeToFix: string;
}

export interface CompetitionComparison {
  yourScore: number;
  avgRegional: number;
  top10Threshold: number;
  top5Threshold: number;
}

export interface AnalysisResult {
  id: string;
  routineName: string;
  dancerName: string;
  ageGroup: string;
  style: string;
  entryType: string;
  duration: string;
  totalScore: number;
  awardLevel: "Gold" | "High Gold" | "Platinum" | "Platinum Star" | "Titanium";
  judgeScores: JudgeScore[];
  strengthsSummary: string[];
  competitiveEdge: string;
  timelineNotes: TimelineNote[];
  improvementPriorities: ImprovementPriority[];
  competitionComparison: CompetitionComparison;
}

export interface ExtractedFrame {
  timestamp: number;
  dataUrl: string;
}

export interface UploadMetadata {
  analysisId: string;
  filename: string;
  routineName: string;
  ageGroup: string;
  style: string;
  entryType: string;
  dancerName: string;
  studioName: string;
  fileSize: number;
  uploadedAt: string;
  status: "processing" | "analyzed" | "failed";
  duration?: string;
}
