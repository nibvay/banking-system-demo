import express from "express";
import "dotenv/config";
import morgan from "morgan";

import "./db/connection.js";
import routes from "./routes/index.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();
const { NODE_SERVER_PORT } = process.env;

app.use(express.json());
app.use(morgan("dev"));

app.use("/api", routes);

app.use(errorHandler);

app.listen(NODE_SERVER_PORT, () => {
  console.log(`Server running on port ${NODE_SERVER_PORT}`);
});

export default app;
