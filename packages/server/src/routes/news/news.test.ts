import axios from "axios";
import { describe, it, expect, vi, beforeEach } from "vitest";
import app from "@/app.js";
import { cacheService } from "@/services/cache.js";

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock("@/services/cache.js", () => ({
  cacheService: {
    generateKey: vi.fn((prefix: string, key: string) => `${prefix}:${key}`),
    get: vi.fn().mockReturnValue(null),
    set: vi.fn(),
  },
}));

const mockNewsArticles = [
  {
    id: "1",
    headline: "Tech stocks rally",
    summary: "Technology stocks showed strong gains today.",
    source: "Reuters",
    url: "https://example.com/1",
    image: "https://example.com/img1.jpg",
    datetime: 1700000000,
    category: "general",
    related: "AAPL,GOOGL",
  },
  {
    id: "2",
    headline: "Crypto markets surge",
    summary: "Bitcoin and other cryptocurrencies jumped significantly.",
    source: "CoinDesk",
    url: "https://example.com/2",
    image: "https://example.com/img2.jpg",
    datetime: 1700000100,
    category: "crypto",
    related: "BTC,ETH",
  },
];

describe("News Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/v1/news", () => {
    it("should return paginated news with valid request", async () => {
      const cacheGetMock = cacheService.get as ReturnType<typeof vi.fn>;
      cacheGetMock.mockReturnValue(mockNewsArticles);

      const res = await app.request(
        "/api/v1/news?category=general&page=1&limit=10",
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty("data");
      expect(data).toHaveProperty("meta");
      expect(data.meta).toHaveProperty("page", 1);
      expect(data.meta).toHaveProperty("limit", 10);
      expect(data.meta).toHaveProperty("total", 2);
    });

    it("should return cached news when available", async () => {
      const cacheGetMock = cacheService.get as ReturnType<typeof vi.fn>;
      cacheGetMock.mockReturnValue(mockNewsArticles);

      const res = await app.request("/api/v1/news?category=general");

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data).toEqual(mockNewsArticles);
      expect(cacheService.get).toHaveBeenCalled();
    });

    it("should return validation error for invalid category", async () => {
      const res = await app.request("/api/v1/news?category=invalid");

      expect(res.status).toBe(422);
    });

    it("should return validation error for invalid page", async () => {
      const res = await app.request("/api/v1/news?page=-1");

      expect(res.status).toBe(422);
    });

    it("should return validation error for limit exceeding max", async () => {
      const res = await app.request("/api/v1/news?limit=200");

      expect(res.status).toBe(422);
    });

    it("should fetch from API when cache is empty", async () => {
      const cacheGetMock = cacheService.get as ReturnType<typeof vi.fn>;
      cacheGetMock.mockReturnValue(null);

      const axiosGetMock = axios.get as ReturnType<typeof vi.fn>;
      axiosGetMock.mockResolvedValue({
        data: [
          {
            id: 123,
            headline: "API News Headline",
            summary: "News from API",
            source: "API Source",
            url: "https://api.com/news",
            image: "https://api.com/image.jpg",
            datetime: 1700000000,
            category: "general",
            related: "AAPL",
          },
        ],
      });

      const res = await app.request("/api/v1/news?category=general");

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data).toHaveLength(1);
      expect(data.data[0].headline).toBe("API News Headline");
      expect(axios.get).toHaveBeenCalled();
    });
  });

  describe("GET /api/v1/news/{id}", () => {
    it("should return article when found in cache", async () => {
      const cacheGetMock = cacheService.get as ReturnType<typeof vi.fn>;
      cacheGetMock.mockReturnValue(mockNewsArticles);

      const res = await app.request("/api/v1/news/1");

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.id).toBe("1");
      expect(data.headline).toBe("Tech stocks rally");
    });

    it("should return 404 when article not found", async () => {
      const cacheGetMock = cacheService.get as ReturnType<typeof vi.fn>;
      cacheGetMock.mockReturnValue(mockNewsArticles);

      const res = await app.request("/api/v1/news/999");

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data).toBeNull();
    });

    it("should return 404 when cache is empty", async () => {
      const cacheGetMock = cacheService.get as ReturnType<typeof vi.fn>;
      cacheGetMock.mockReturnValue(null);

      const res = await app.request("/api/v1/news/1");

      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/v1/ticker/{symbol}", () => {
    it("should return company news for valid symbol", async () => {
      const cacheGetMock = cacheService.get as ReturnType<typeof vi.fn>;
      cacheGetMock.mockReturnValue(mockNewsArticles);

      const res = await app.request("/api/v1/ticker/AAPL?days=7");

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    });

    it("should use cache when available", async () => {
      const cacheGetMock = cacheService.get as ReturnType<typeof vi.fn>;
      cacheGetMock.mockReturnValue(mockNewsArticles);

      const res = await app.request("/api/v1/ticker/AAPL?days=7");

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual(mockNewsArticles);
      expect(cacheService.get).toHaveBeenCalled();
    });

    it("should return empty array when no news available", async () => {
      const cacheGetMock = cacheService.get as ReturnType<typeof vi.fn>;
      cacheGetMock.mockReturnValue([]);

      const res = await app.request("/api/v1/ticker/AAPL?days=7");

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual([]);
    });

    it("should use default days value when days param is missing", async () => {
      const cacheGetMock = cacheService.get as ReturnType<typeof vi.fn>;
      cacheGetMock.mockReturnValue(null);

      const axiosGetMock = axios.get as ReturnType<typeof vi.fn>;
      axiosGetMock.mockResolvedValue({ data: [] });

      const res = await app.request("/api/v1/ticker/AAPL");

      expect(res.status).toBe(200);
    });

    it("should handle non-array API response gracefully", async () => {
      const cacheGetMock = cacheService.get as ReturnType<typeof vi.fn>;
      cacheGetMock.mockReturnValue(null);

      const axiosGetMock = axios.get as ReturnType<typeof vi.fn>;
      axiosGetMock.mockResolvedValue({ data: null });

      const res = await app.request("/api/v1/news?category=general");

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data).toEqual([]);
    });

    it("should use fallback values for missing properties in API response", async () => {
      const cacheGetMock = cacheService.get as ReturnType<typeof vi.fn>;
      cacheGetMock.mockReturnValue(null);

      const axiosGetMock = axios.get as ReturnType<typeof vi.fn>;
      axiosGetMock.mockResolvedValue({
        data: [
          {
            id: 789,
            headline: "",
            summary: undefined,
            source: null,
            url: "",
            image: null,
            datetime: 0,
            category: "",
            related: "",
          },
        ],
      });

      const res = await app.request("/api/v1/news?category=general");

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data).toHaveLength(1);
      expect(data.data[0].headline).toBe("");
      expect(data.data[0].source).toBe("");
    });
  });
});
