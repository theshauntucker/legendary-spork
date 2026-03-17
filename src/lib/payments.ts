// In-memory payment tracking — replace with a database for production persistence
// This works across requests in the same serverless instance, and Stripe webhook
// re-verification provides a fallback when instances recycle.

interface PaidSessionData {
  email: string | null;
  amount: number | null;
  paidAt: string;
  analysesRemaining: number;
}

const paidSessions = new Map<string, PaidSessionData>();

export function addPaidSession(sessionId: string, data: PaidSessionData) {
  paidSessions.set(sessionId, data);
}

export function getPaidSession(sessionId: string): PaidSessionData | undefined {
  return paidSessions.get(sessionId);
}

export function useAnalysis(sessionId: string): boolean {
  const session = paidSessions.get(sessionId);
  if (!session || session.analysesRemaining <= 0) return false;
  session.analysesRemaining--;
  return true;
}
