import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { NewsArticleSchema, ChatMessageSchema } from "@/types/news-types.js";

export const chat = createRoute({
  tags: ["chat"],
  method: "post",
  path: "/chat",
  request: {
    body: jsonContentRequired(
      z.object({
        article: NewsArticleSchema,
        message: z.array(ChatMessageSchema),
      }),
      "chat api body params",
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: {
      description: "Streaming chat response",
      content: {
        "text/plain": {
          schema: z.string(),
        },
      },
    },
  },
});

export const summarize = createRoute({
  tags: ["chat"],
  method: "post",
  path: "/summarize",
  request: {
    body: jsonContentRequired(
      z.object({
        articleId: z.string(),
        headline: z.string(),
        summary: z.string(),
        url: z.string(),
      }),
      "summary chat request",
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        bullets: z.array(z.string()),
        sentiment: z.enum(["bullish", "bearish", "neutral"]),
        sentimentReason: z.string(),
        keyTickers: z.array(z.string()),
        oneLineSummary: z.string(),
      }),
      "News article",
    ),
  },
});

export type chat = typeof chat;
export type summarize = typeof summarize;
