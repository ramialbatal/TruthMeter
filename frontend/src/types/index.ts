export interface AnalysisResult {
  id: string;
  tweetText: string;
  accuracyScore: number;
  agreementScore: number;
  disagreementScore: number;
  summary: string;
  sources: Source[];
  analyzedAt: string;
  cached: boolean;
}

export interface Source {
  url: string;
  title: string;
  snippet: string;
  relevance: 'supporting' | 'contradicting' | 'neutral';
}

export interface AnalysisRequest {
  tweetText: string;
}
