import { createRouter } from "@/lib/create-app.js";

import * as handlers from "./chat.handlers.js";
import * as routes from "./chat.route.js";
import chatRateLimiter from "@/middlewares/chat-rate-limit.js";

const chatRoutes = createRouter();

chatRoutes.use("/chat", chatRateLimiter);

chatRoutes.openapi(routes.chat, handlers.userChat);
chatRoutes.openapi(routes.summarize, handlers.chatSummary);

export default chatRoutes;
