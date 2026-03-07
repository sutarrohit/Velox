import { AppRouteHandler } from "../../lib/types.js";
import type { chat, summarize } from "./chat.route.js";
import { geminiService } from "../../services/gemini.js";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { cacheService } from "../../services/cache.js";
import { ArticleSummary } from "../../types/news-types.js";

export const userChat: AppRouteHandler<chat> = async (c) => {
    const { article, message } = c.req.valid("json");

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            try {
                for await (const chunk of geminiService.chatStreamAboutArticle(article, message)) {
                    controller.enqueue(encoder.encode(chunk));
                }
            } catch (error) {
                controller.enqueue(encoder.encode("I'm sorry, I encountered an error while processing your request."));
            } finally {
                controller.close();
            }
        }
    });

    return c.body(stream, {
        status: HttpStatusCodes.OK,
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Transfer-Encoding": "chunked",
            "X-Content-Type-Options": "nosniff"
        }
    }) as unknown as ReturnType<AppRouteHandler<chat>>;
};

export const chatSummary: AppRouteHandler<summarize> = async (c) => {
    const { articleId, summary, headline, url } = c.req.valid("json");

    let result;

    const cacheKey = cacheService.generateKey("ai:summary", articleId);
    const cached = cacheService.get<ArticleSummary>(cacheKey);

    if (cached) {
        result = cached;
    } else {
        result = await geminiService.summarizeArticle({ headline, summary, url });
    }

    return c.json(result, HttpStatusCodes.OK);
};
