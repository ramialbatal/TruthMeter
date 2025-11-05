export interface AnalysisResult {
  id: string;
  contentText: string;
  accuracyScore: number;
  agreementScore: number;
  disagreementScore: number;
  neutralScore: number;
  summary: string;
  summaryTranslations: {
    ar?: string;
    fr?: string;
    tr?: string;
    fa?: string;
    ur?: string;
    hi?: string;
    es?: string;
    de?: string;
    pt?: string;
    ja?: string;
    zh?: string;
    it?: string;
    sv?: string;
  };
  sources: Source[];
  totalSourcesRetrieved: number;
  analyzedAt: string;
  cached: boolean;
}

export interface Source {
  url: string;
  title: string;
  relevance: 'supporting' | 'contradicting' | 'neutral';
}

export interface AnalysisRequest {
  contentText: string;
}
