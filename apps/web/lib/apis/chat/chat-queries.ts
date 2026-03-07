import { queryOptions } from "@tanstack/react-query";
import { chatApis } from "./chat-apis";
import type { NewsArticle } from "@/types";

export function summarizeArticleOptions(article: NewsArticle) {
  return queryOptions({
    queryKey: ["article-summary", article.id],
    queryFn: () => chatApis.summarizeArticle(article),
    staleTime: Infinity,
  });
}

export function chatOptions(
  article: NewsArticle,
  message: { role: "user" | "assistant"; content: string }[],
) {
  return queryOptions({
    queryKey: ["chat", article.id, message],
    queryFn: () => chatApis.newChat(article, message),
    staleTime: Infinity,
  });
}
