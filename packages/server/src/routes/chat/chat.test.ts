import { describe, it, expect, vi, beforeEach } from "vitest";
import app from "@/app.js";
import { cacheService } from "@/services/cache.js";

vi.mock("@/services/gemin.js", () => ({
    geminiService: {
        chatAboutArticle: vi.fn().mockResolvedValue("This is a mock response about the article."),
        summarizeArticle: vi.fn().mockResolvedValue({
            bullets: ["Bullet point 1", "Bullet point 2"],
            sentiment: "bullish" as const,
            sentimentReason: "Positive market sentiment",
            keyTickers: ["AAPL", "GOOGL"],
            oneLineSummary: "Market shows positive momentum"
        })
    }
}));

vi.mock("@/services/cache.js", () => ({
    cacheService: {
        generateKey: vi.fn((prefix: string, key: string) => `${prefix}:${key}`),
        get: vi.fn().mockReturnValue(null),
        set: vi.fn()
    }
}));

const validArticle = {
    id: "123",
    headline: "Tech Stocks Rally",
    summary: "Technology stocks showed strong gains today.",
    source: "Reuters",
    url: "https://example.com/article",
    image: "https://example.com/image.jpg",
    datetime: 1700000000,
    category: "general",
    related: "AAPL,GOOGL"
};

const validMessages = [{ role: "user" as const, content: "What is this article about?" }];

describe("Chat Routes", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("POST /api/v1/chat", () => {
        it("should return a chat reply with valid request", async () => {
            const res = await app.request("/api/v1/chat", {
                method: "POST",
                body: JSON.stringify({
                    article: validArticle,
                    message: validMessages
                }),
                headers: { "Content-Type": "application/json" }
            });

            expect(res.status).toBe(200);
            const data = await res.json();
            expect(data).toHaveProperty("reply");
            expect(typeof data.reply).toBe("string");
        });

        it("should return 400 with missing article", async () => {
            const res = await app.request("/api/v1/chat", {
                method: "POST",
                body: JSON.stringify({
                    message: validMessages
                }),
                headers: { "Content-Type": "application/json" }
            });

            expect(res.status).toBe(422);
        });

        it("should return 400 with missing message", async () => {
            const res = await app.request("/api/v1/chat", {
                method: "POST",
                body: JSON.stringify({
                    article: validArticle
                }),
                headers: { "Content-Type": "application/json" }
            });

            expect(res.status).toBe(422);
        });

        it("should return 400 with invalid article schema", async () => {
            const res = await app.request("/api/v1/chat", {
                method: "POST",
                body: JSON.stringify({
                    article: { id: 123 },
                    message: validMessages
                }),
                headers: { "Content-Type": "application/json" }
            });

            expect(res.status).toBe(422);
        });
    });

    describe("POST /api/v1/summarize", () => {
        it("should return summary with valid request", async () => {
            const res = await app.request("/api/v1/summarize", {
                method: "POST",
                body: JSON.stringify({
                    articleId: "123",
                    headline: "Tech Stocks Rally",
                    summary: "Technology stocks showed strong gains today.",
                    url: "https://example.com/article"
                }),
                headers: { "Content-Type": "application/json" }
            });

            expect(res.status).toBe(200);
            const data = await res.json();
            expect(data).toHaveProperty("bullets");
            expect(data).toHaveProperty("sentiment");
            expect(data).toHaveProperty("sentimentReason");
            expect(data).toHaveProperty("keyTickers");
            expect(data).toHaveProperty("oneLineSummary");
            expect(data.sentiment).toBe("bullish");
        });

        it("should return cached summary when available", async () => {
            const cachedSummary = {
                bullets: ["Cached bullet"],
                sentiment: "neutral" as const,
                sentimentReason: "Cached reason",
                keyTickers: ["TSLA"],
                oneLineSummary: "Cached summary"
            };

            const cacheGetMock = cacheService.get as ReturnType<typeof vi.fn>;
            cacheGetMock.mockReturnValue(cachedSummary);

            const res = await app.request("/api/v1/summarize", {
                method: "POST",
                body: JSON.stringify({
                    articleId: "123",
                    headline: "Tech Stocks Rally",
                    summary: "Technology stocks showed strong gains today.",
                    url: "https://example.com/article"
                }),
                headers: { "Content-Type": "application/json" }
            });

            expect(res.status).toBe(200);
            const data = await res.json();
            expect(data).toEqual(cachedSummary);
            expect(cacheService.get).toHaveBeenCalled();
        });

        it("should return 400 with missing articleId", async () => {
            const res = await app.request("/api/v1/summarize", {
                method: "POST",
                body: JSON.stringify({
                    headline: "Tech Stocks Rally",
                    summary: "Technology stocks showed strong gains today.",
                    url: "https://example.com/article"
                }),
                headers: { "Content-Type": "application/json" }
            });

            expect(res.status).toBe(422);
        });

        it("should return 400 with missing headline", async () => {
            const res = await app.request("/api/v1/summarize", {
                method: "POST",
                body: JSON.stringify({
                    articleId: "123",
                    summary: "Technology stocks showed strong gains today.",
                    url: "https://example.com/article"
                }),
                headers: { "Content-Type": "application/json" }
            });

            expect(res.status).toBe(422);
        });

        it("should return 400 with missing summary", async () => {
            const res = await app.request("/api/v1/summarize", {
                method: "POST",
                body: JSON.stringify({
                    articleId: "123",
                    headline: "Tech Stocks Rally",
                    url: "https://example.com/article"
                }),
                headers: { "Content-Type": "application/json" }
            });

            expect(res.status).toBe(422);
        });

        it("should return 400 with missing url", async () => {
            const res = await app.request("/api/v1/summarize", {
                method: "POST",
                body: JSON.stringify({
                    articleId: "123",
                    headline: "Tech Stocks Rally",
                    summary: "Technology stocks showed strong gains today."
                }),
                headers: { "Content-Type": "application/json" }
            });

            expect(res.status).toBe(422);
        });
    });
});
