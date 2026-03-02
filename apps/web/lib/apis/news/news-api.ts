import { client } from "../../honoClient";
import type { NewsArticle, PaginatedResponse, NewsCategory } from "@/types";

interface GetNewsParams {
  category?: NewsCategory;
  page?: number;
  limit?: number;
}

export const newsApi = {
  getNews: async ({
    category = "general",
    page = 1,
    limit = 20,
  }: GetNewsParams = {}) => {
    const response = await client.api.v1.news.$get({
      query: { category, page, limit },
    });

    if (!response.ok) throw new Error("Failed to fetch news");
    return response.json() as Promise<PaginatedResponse<NewsArticle>>;
  },

  getNewsDetail: async ({ id }: { id: string }) => {
    const response = await client.api.v1.news[":id"].$get({
      param: { id },
    });

    if (!response.ok) throw new Error("Failed to fetch news detail");
    return response.json() as Promise<NewsArticle | null>;
  },

  getCompanyNews: async ({
    symbol,
    days = 7,
  }: {
    symbol: string;
    days: number;
  }) => {
    const response = await client.api.v1.ticker[":symbol"].$get({
      param: { symbol },
      query: { days: String(days) },
    });

    if (!response.ok) throw new Error("Failed to fetch company news");
    return response.json() as Promise<NewsArticle[]>;
  },
};
