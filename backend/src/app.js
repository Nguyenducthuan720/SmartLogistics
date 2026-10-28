const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");

const routes = require("./routes");
const errorHandler = require("./middleware/error.middleware");
const notFoundHandler = require("./middleware/notFound.middleware");
const limiter = require("./middleware/rateLimiter.middleware");
const swaggerSpec = require("./config/swagger");

const app = express();

app.use(cors());
app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api", routes);

app.use(notFoundHandler);

app.use(errorHandler);

module.exports = app;
