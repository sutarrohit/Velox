import createApp from "./lib/create-app.js";
import { configureOpenAPI } from "./lib/configure-open-api.js";
import newsRouter from "./routes/news/news.index.js";
import chatRoutes from "./routes/chat/chat.index.js";

const app = createApp();
configureOpenAPI(app);

// Mount once with full paths preserved in types
const routes = app.route("/api/v1", newsRouter).route("/api/v1", chatRoutes);

export type AppType = typeof routes;
export default routes;
