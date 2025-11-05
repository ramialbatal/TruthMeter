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

export interface TavilySearchResult {
  url: string;
  title: string;
  content: string;
  score: number;
}

export interface TavilyResponse {
  results: TavilySearchResult[];
}

export interface ClaudeAnalysis {
  accuracyScore: number;
  agreementScore: number;
  disagreementScore: number;
  summary: string;
  sources: Source[];
}
