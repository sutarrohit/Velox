import { createRouter } from "../../lib/create-app.js";

import * as handlers from "./chat.handlers.js";
import * as routes from "./chat.route.js";

const chatRoutes = createRouter()
  .openapi(routes.chat, handlers.userChat)
  .openapi(routes.summarize, handlers.chatSummary);

export default chatRoutes;
