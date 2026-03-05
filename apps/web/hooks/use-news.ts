import { useQuery } from "@tanstack/react-query";
import { newsApi } from "@/lib/apis/news/news-api";
import type { NewsCategory } from "@/types";

interface UseNewsParams {
  category?: NewsCategory;
  page?: number;
  limit?: number;
}

export function useNews({
  category = "general",
  page = 1,
  limit = 20,
}: UseNewsParams = {}) {
  return useQuery({
    queryKey: ["news", category, page, limit],
    queryFn: () => newsApi.getNews({ category, page, limit }),
    staleTime: 5 * 60 * 1000,
  });
}

export function useNewsDetail(id: string) {
  return useQuery({
    queryKey: ["news", "detail", id],
    queryFn: () => newsApi.getNewsDetail({ id }),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
}

export function useCompanyNews(symbol: string, days: number = 7) {
  return useQuery({
    queryKey: ["company-news", symbol, days],
    queryFn: () => newsApi.getCompanyNews({ symbol, days }),
    staleTime: 5 * 60 * 1000,
    enabled: !!symbol,
  });
}
