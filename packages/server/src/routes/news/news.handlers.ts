import type { NewsArticleSchema } from "@/types/news-types.js";
import { cacheService } from "@/services/cache.js";
import { z } from "@hono/zod-openapi";
import env from "env.js";
import { AppRouteHandler } from "@/lib/types.js";
import type { companyNews, news, newsDetail } from "./news.route.js";
import * as HttpStatusCodes from "stoker/http-status-codes";
import axios from "axios";

const FINNHUB_API_URL = "https://finnhub.io/api/v1";
const FINNHUB_API_KEY = env.FINNHUB_API_KEY;

type NewsArticle = z.infer<typeof NewsArticleSchema>;

export const getMarketNews: AppRouteHandler<news> = async (c) => {
    const { category, page, limit } = c.req.valid("query");

    const cacheKey = cacheService.generateKey("news", category);
    const cached = cacheService.get<NewsArticle[]>(cacheKey);

    let articles: NewsArticle[];

    if (cached) {
        articles = cached;
    } else {
        const response = await axios.get(`${FINNHUB_API_URL}/news`, {
            params: { category, token: FINNHUB_API_KEY }
        });

        articles = _mapResponse(response.data);
        cacheService.set(cacheKey, articles, 600);
    }

    const total = articles.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedData = articles.slice(startIndex, startIndex + limit);

    return c.json(
        {
            data: paginatedData,
            meta: {
                page,
                limit,
                total,
                totalPages
            }
        },
        HttpStatusCodes.OK
    );
};

export const getNewsDetail: AppRouteHandler<newsDetail> = async (c) => {
    const { id } = c.req.valid("param");

    // Search across all cached categories to find the article
    const categories = ["general", "forex", "crypto", "merger"];
    let foundArticle: NewsArticle | undefined;

    for (const cat of categories) {
        const cacheKey = cacheService.generateKey("news", cat);
        const cached = cacheService.get<NewsArticle[]>(cacheKey);
        if (cached) {
            foundArticle = cached.find((a) => a.id === id);
            if (foundArticle) break;
        }
    }
    if (foundArticle) return c.json(foundArticle, HttpStatusCodes.OK);
    return c.json(null, HttpStatusCodes.NOT_FOUND);
};

export const getCompanyNews: AppRouteHandler<companyNews> = async (c) => {
    const { symbol } = c.req.valid("param");
    const { days } = c.req.valid("query");

    const parsedDays = Number(days ?? 7);
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - parsedDays);

    const toStr = to.toISOString().split("T")[0];
    const fromStr = from.toISOString().split("T")[0];

    // get Company data
    const cacheKey = cacheService.generateKey("news:company", symbol);
    const cached = cacheService.get<NewsArticle[]>(cacheKey);
    if (cached) return c.json(cached, HttpStatusCodes.OK);

    // fetch data from api
    const response = await axios.get(`${FINNHUB_API_URL}/company-news`, {
        params: {
            symbol: symbol,
            from: fromStr,
            to: toStr,
            token: FINNHUB_API_KEY
        }
    });

    const articles = _mapResponse(response.data);
    cacheService.set(cacheKey, articles, 600);

    return c.json(articles, HttpStatusCodes.OK);
};

const _mapResponse = (data: any[]): NewsArticle[] => {
    if (!Array.isArray(data)) return [];
    return data.map((item: any) => ({
        id: String(item.id),
        headline: item.headline || "",
        summary: item.summary || "",
        source: item.source || "",
        url: item.url || "",
        image: item.image || "",
        datetime: item.datetime || 0,
        category: item.category || "",
        related: item.related || ""
    }));
};
