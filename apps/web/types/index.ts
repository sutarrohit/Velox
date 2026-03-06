export interface NewsArticle {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  image: string;
  datetime: number;
  category: string;
  related: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export type NewsCategory = "general" | "forex" | "crypto" | "merger";

export interface ArticleSummary {
  bullets: string[];
  sentiment: "bullish" | "bearish" | "neutral";
  sentimentReason: string;
  keyTickers: string[];
  oneLineSummary: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
