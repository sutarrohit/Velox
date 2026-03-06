import { queryOptions, infiniteQueryOptions } from "@tanstack/react-query";
import { newsApi } from "./news-api";
import type { NewsCategory } from "@/types";

interface GetNewsParams {
    category?: NewsCategory;
    page?: number;
    limit?: number;
}

export function getNewsOptions({ category = "general", limit = 20 }: GetNewsParams = {}) {
    return infiniteQueryOptions({
        queryKey: ["news", category],
        queryFn: ({ pageParam = 1 }) => newsApi.getNews({ category, page: pageParam, limit }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const { page, totalPages } = lastPage.meta;

            if (page >= totalPages) return undefined;
            return page + 1;
        },
        retry: 2,
        retryOnMount: false,
        retryDelay: 5 * 60 * 1000
    });
}

export function getNewsDetailOptions({ newsId }: { newsId: string }) {
    return queryOptions({
        queryKey: ["news-detail", newsId],
        queryFn: () => newsApi.getNewsDetail({ id: newsId })
    });
}

export function getCompanyNewsOptions(symbol: string, days: number = 7) {
    return queryOptions({
        queryKey: ["company-news", symbol, days],
        queryFn: () => newsApi.getCompanyNews({ symbol, days })
    });
}
