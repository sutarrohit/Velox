import { z } from "@hono/zod-openapi";

export const NewsArticleSchema = z.object({
    id: z.string(),
    headline: z.string(),
    summary: z.string(),
    source: z.string(),
    url: z.string(),
    image: z.string(),
    datetime: z.number(), // unix timestamp
    category: z.string(),
    related: z.string()
});

export const ArticleSummarySchema = z.object({
    bullets: z.array(z.string()),
    sentiment: z.enum(["bullish", "bearish", "neutral"]),
    sentimentReason: z.string(),
    keyTickers: z.array(z.string()),
    oneLineSummary: z.string()
});

export type NewsArticle = z.infer<typeof NewsArticleSchema>;
export type ArticleSummary = z.infer<typeof ArticleSummarySchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatMessageSchema = z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string()
});

export const CategoryTypeSchema = z.object({
    category: z.enum(["general", "forex", "crypto", "merger"]).default("general")
});

export const PaginationSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20)
});

export const PaginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
    z.object({
        data: z.array(itemSchema),
        meta: z.object({
            page: z.number(),
            limit: z.number(),
            total: z.number(),
            totalPages: z.number()
        })
    });

export const NewsTickerSchema = z.object({});
