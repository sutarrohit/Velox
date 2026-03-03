import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import {
  CategoryTypeSchema,
  NewsArticleSchema,
  PaginationSchema,
  PaginatedResponseSchema,
} from "@/types/news-types.js";

const NewsListResponseSchema = PaginatedResponseSchema(NewsArticleSchema);

export const news = createRoute({
  tags: ["news"],
  method: "get",
  path: "/news",
  request: {
    query: CategoryTypeSchema.extend(PaginationSchema.shape),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      NewsListResponseSchema,
      "Paginated news articles",
    ),
  },
});

export const newsDetail = createRoute({
  tags: ["news"],
  method: "get",
  path: "/news/{id}",
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(NewsArticleSchema, "News article"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      NewsArticleSchema.nullable(),
      "Not found",
    ),
  },
});

export const companyNews = createRoute({
  tags: ["news"],
  method: "get",
  path: "/ticker/{symbol}",
  request: {
    params: z.object({
      symbol: z.string(),
    }),
    query: z.object({
      days: z.string().optional(),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      NewsArticleSchema.array(),
      "Company news",
    ),
  },
});

export type news = typeof news;
export type companyNews = typeof companyNews;
export type newsDetail = typeof newsDetail;
