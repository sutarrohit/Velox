import { AppRouteHandler } from "@/lib/types.js";
import type { chat, summarize } from "./chat.route.js";
import { geminiService } from "@/services/gemin.js";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { cacheService } from "@/services/cache.js";
import { ArticleSummary } from "@/types/news-types.js";

export const userChat: AppRouteHandler<chat> = async (c) => {
    const { article, message } = c.req.valid("json");
    const reply = await geminiService.chatAboutArticle(article, message);

    return c.json(
        {
            reply
        },
        HttpStatusCodes.OK
    );
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
