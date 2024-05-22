import express from "express";
import "dotenv/config";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";

import swaggerDoc from "./swagger.json" with { type: 'json' };
import "./db/connection.js";
import routes from "./routes/index.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();
const { NODE_SERVER_PORT } = process.env;

app.use(express.json());
app.use(morgan("dev"));

app.use("/api", routes);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.use(errorHandler);

app.listen(NODE_SERVER_PORT, () => {
  console.log(`Server running on port ${NODE_SERVER_PORT}`);
});

export default app;
