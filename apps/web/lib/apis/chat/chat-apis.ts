import { NewsArticle } from "@/types";
import { client } from "../../honoClient";

export class RateLimitError extends Error {
  constructor(message = "Rate limit exceeded. Please try again later.") {
    super(message);
    this.name = "RateLimitError";
  }
}

export const chatApis = {
  summarizeArticle: async (article: NewsArticle) => {
    const response = await client.api.v1.summarize.$post({
      json: {
        articleId: article.id,
        headline: article.headline,
        summary: article.summary,
        url: article.url,
      },
    });

    if ((response.status as number) === 429)
      throw new RateLimitError("Rate limit exceeded. Please try again later.");
    if (!response.ok) throw new Error("Failed to summarize article");
    return response.json();
  },

  newChat: async (
    article: NewsArticle,
    message: { role: "user" | "assistant"; content: string }[],
  ) => {
    const response = await client.api.v1.chat.$post({
      json: {
        article,
        message,
      },
    });

    if ((response.status as number) === 429)
      throw new RateLimitError(
        "Rate limit exceeded. You can only send 15 messages per hour.",
      );
    if (!response.ok) throw new Error("Failed to fetch create chat");
    return response.json() as Promise<string>;
  },
};
