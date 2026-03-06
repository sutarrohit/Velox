import { NewsArticle } from "@/types";
import { client } from "../../honoClient";

export const chatApis = {
    summarizeArticle: async (article: NewsArticle) => {
        const response = await client.api.v1.summarize.$post({
            json: {
                articleId: article.id,
                headline: article.headline,
                summary: article.summary,
                url: article.url
            }
        });

        console.log("================================================== dkj", response);

        if (!response.ok) throw new Error("Failed to summarize article");
        return response.json();
    },
    newChat: async (article: NewsArticle, message: string[]) => {
        const response = await client.api.v1.chat.$post({
            json: {
                article,
                message
            }
        });

        if (!response.ok) throw new Error("Failed to fetch create chat");
        console.log(response.json());
        return response.json() as Promise<string>;
    }
};
