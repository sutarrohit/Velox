import { createRouter } from "../../lib/create-app.js";

import * as handlers from "./news.handlers.js";
import * as routes from "./news.route.js";

const newsRouter = createRouter()
    .openapi(routes.news, handlers.getMarketNews)
    .openapi(routes.companyNews, handlers.getCompanyNews)
    .openapi(routes.newsDetail, handlers.getNewsDetail);

export default newsRouter;
