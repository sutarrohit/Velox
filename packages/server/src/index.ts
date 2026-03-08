import app from "./app.js";
import env from "./env.js";

export type AppType = typeof app;
export default {
  port: env.PORT,
  fetch: app.fetch,
};
