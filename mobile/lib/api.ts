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
