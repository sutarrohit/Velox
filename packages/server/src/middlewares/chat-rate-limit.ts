import { rateLimiter } from "hono-rate-limiter";
import { AppBinding } from "@/lib/types.js";

const chatRateLimiter = rateLimiter<AppBinding>({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 15, // Limit each IP to 2 requests per hour
    standardHeaders: "draft-7",
    keyGenerator: (c) => c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "anonymous"
});

export default chatRateLimiter;
