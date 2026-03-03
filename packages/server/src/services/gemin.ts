import { GoogleGenAI, Type } from "@google/genai";
import { ArticleSummary, ChatMessage, NewsArticle } from "@/types/news-types.js";

let aiClient: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
    if (!aiClient) {
        const key = "";
        if (!key) {
            throw new Error("GEMINI_API_KEY environment variable is required");
        }
        aiClient = new GoogleGenAI({ apiKey: key });
    }
    return aiClient;
}

class GeminiService {
    async summarizeArticle(article: { headline: string; summary: string; url: string }): Promise<ArticleSummary> {
        const ai = getAI();

        const prompt = `You are a financial analyst assistant. Analyze the provided news article and return a JSON object with this exact structure:
{
  "bullets": ["bullet 1", "bullet 2", "bullet 3"],
  "sentiment": "bullish" | "bearish" | "neutral",
  "sentimentReason": "one sentence explaining why",
  "keyTickers": ["AAPL", "MSFT"],
  "oneLineSummary": "max 10 words summarizing the story"
}

Rules:
- Each bullet point must be under 20 words
- Be factual, not speculative
- Only include tickers that are directly relevant
- sentiment must be from market perspective (how does this affect investors?)
- Return ONLY the JSON object, no markdown, no explanation

Article: ${article.headline}
${article.summary}
URL: ${article.url}`;

        try {
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            bullets: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            },
                            sentiment: {
                                type: Type.STRING,
                                description: "bullish, bearish, or neutral"
                            },
                            sentimentReason: {
                                type: Type.STRING
                            },
                            keyTickers: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            },
                            oneLineSummary: {
                                type: Type.STRING
                            }
                        },
                        required: ["bullets", "sentiment", "sentimentReason", "keyTickers", "oneLineSummary"]
                    }
                }
            });

            const text = response.text;
            if (!text) throw new Error("No text returned from Gemini");

            const parsed = JSON.parse(text);
            return {
                bullets: parsed.bullets || [],
                sentiment: parsed.sentiment || "neutral",
                sentimentReason: parsed.sentimentReason || "",
                keyTickers: parsed.keyTickers || [],
                oneLineSummary: parsed.oneLineSummary || ""
            };
        } catch (error) {
            console.error("Error summarizing article with Gemini:", error);
            return {
                bullets: ["Could not generate summary."],
                sentiment: "neutral",
                sentimentReason: "Error generating summary.",
                keyTickers: [],
                oneLineSummary: "Summary unavailable."
            };
        }
    }

    async chatAboutArticle(article: NewsArticle, messages: ChatMessage[]): Promise<string> {
        const ai = getAI();

        const systemInstruction = `You are a helpful financial analyst. The user is reading the following news article and has questions about it.

Article: ${article.headline}
${article.summary}

Answer questions clearly and concisely. Be factual. If asked for investment advice, remind the user this is not financial advice. Keep responses under 150 words unless the question requires more detail.`;

        try {
            let fullPrompt = "";
            for (const msg of messages) {
                fullPrompt += `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}\n`;
            }

            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: systemInstruction + "\n\nConversation:\n" + fullPrompt + "\nAssistant:"
            });

            return response.text || "I'm sorry, I couldn't generate a response.";
        } catch (error) {
            console.error("Error chatting with Gemini:", error);
            return "I'm sorry, I encountered an error while processing your request.";
        }
    }
}

export const geminiService = new GeminiService();
