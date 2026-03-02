import { queryOptions, infiniteQueryOptions } from "@tanstack/react-query";
import { newsApi } from "./news-api";
import type { NewsCategory } from "@/types";

interface GetNewsParams {
  category?: NewsCategory;
  page?: number;
  limit?: number;
}

export function getNewsOptions({
  category = "general",
  page = 1,
  limit = 20,
}: GetNewsParams = {}) {
  return infiniteQueryOptions({
    queryKey: ["news", category, page],
    queryFn: () => newsApi.getNews({ category, page, limit }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
  });
}

export function getNewsDetailOptions({ newsId }: { newsId: string }) {
  return queryOptions({
    queryKey: ["news-detail", newsId],
    queryFn: () => newsApi.getNewsDetail({ id: newsId }),
  });
}

export function getCompanyNewsOptions(symbol: string, days: number = 7) {
  return queryOptions({
    queryKey: ["company-news", symbol, days],
    queryFn: () => newsApi.getCompanyNews({ symbol, days }),
  });
}
