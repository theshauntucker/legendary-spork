import { supabase } from './supabase';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'https://routinex.org';

// Types used by the mobile app
export interface VideoMetadata {
  routineTitle: string;
  dancerName: string;
  studioName: string;
  danceStyle: string;
  ageGroup: string;
  entryType: string;
  competitionType: string;
  level: string;
}

export interface AnalysisData {
  id: string;
  routine_title: string;
  dancer_name: string;
  dance_style: string;
  status: string;
  analysis_data?: {
    overallScore?: number;
    scores?: {
      technique?: number;
      performance?: number;
      choreography?: number;
      overall?: number;
    };
    timeline?: Array<{ time: string; note: string; type: string }>;
    improvements?: Array<{ area: string; note: string; impact: string }>;
  };
  created_at: string;
}

export async function getAuthToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Not authenticated');
  return session.access_token;
}

export async function uploadFrames(
  frames: { uri: string; timestamp: number }[],
  metadata: VideoMetadata,
): Promise<{ videoId: string }> {
  const token = await getAuthToken();

  // Upload each frame to Supabase Storage
  const framePaths: string[] = [];
  for (const frame of frames) {
    const fileName = `${Date.now()}-${frame.timestamp}.jpg`;
    const response = await fetch(frame.uri);
    const blob = await response.blob();

    const { data, error } = await supabase.storage
      .from('frames')
      .upload(fileName, blob, { contentType: 'image/jpeg' });

    if (error) throw error;
    framePaths.push(data.path);
  }

  // Call process API with frame paths and metadata
  const res = await fetch(`${API_BASE}/api/process`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ framePaths, metadata }),
  });

  if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
  return res.json();
}

export async function getAnalysis(videoId: string): Promise<AnalysisData> {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE}/api/videos/${videoId}/status`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch analysis: ${res.statusText}`);
  return res.json();
}

export async function deleteFrames(videoId: string): Promise<void> {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE}/api/delete-frames`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ videoId }),
  });
  if (!res.ok) throw new Error(`Failed to delete frames: ${res.statusText}`);
}

export async function getUserAnalyses(): Promise<AnalysisData[]> {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export interface CompetitionScoreData {
  id: string;
  competition_name: string;
  competition_date: string;
  actual_score: number | null;
  actual_award_level: string | null;
  placement: string | null;
  notes: string | null;
}

export async function getCompetitionScores(analysisId: string): Promise<CompetitionScoreData[]> {
  const token = await getAuthToken();
  const res = await fetch(
    `${API_BASE}/api/competition-scores?analysis_id=${analysisId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.scores || [];
}

export async function saveCompetitionScore(params: {
  analysisId: string;
  videoId: string;
  competitionName: string;
  competitionDate: string;
  actualScore?: number;
  actualAwardLevel?: string;
  placement?: string;
  notes?: string;
}): Promise<CompetitionScoreData> {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE}/api/competition-scores`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Failed to save competition score');
  const data = await res.json();
  return data.score;
}

export async function deleteCompetitionScore(id: string): Promise<void> {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE}/api/competition-scores?id=${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to delete competition score');
}

export interface ScoreHistoryPoint {
  videoId: string;
  analysisId: string;
  totalScore: number;
  awardLevel: string;
  date: string;
  routineName: string;
  dancerName: string;
  style: string;
}

export async function getScoreHistory(dancerName?: string): Promise<ScoreHistoryPoint[]> {
  const token = await getAuthToken();
  const params = new URLSearchParams();
  if (dancerName) params.set('dancer_name', dancerName);
  const res = await fetch(
    `${API_BASE}/api/history?${params.toString()}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.history || [];
}

export interface UserCredits {
  remaining: number;
  total: number;
  used: number;
}

export async function getUserCredits(): Promise<UserCredits> {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE}/api/credits`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return { remaining: 0, total: 0, used: 0 };
  const data = await res.json();
  return {
    remaining: data.remaining ?? 0,
    total: data.totalCredits ?? 0,
    used: data.usedCredits ?? 0,
  };
}

export async function createCheckoutSession(
  type: 'single' | 'pack',
): Promise<{ url?: string; error?: string; message?: string }> {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE}/api/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ type }),
  });
  return res.json();
}

export async function deleteAccount(): Promise<void> {
  const token = await getAuthToken();
  const res = await fetch(`${API_BASE}/api/account`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || 'Failed to delete account');
  }
}

export async function storeConsentRecord(
  consentType: string,
  userAgent: string,
): Promise<void> {
  const { error } = await supabase.from('consent_records').insert({
    consent_type: consentType,
    consent_version: 'v1.0',
    user_agent: userAgent,
  });
  if (error) throw error;
}
