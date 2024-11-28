const express = require("express");
const cors = require("cors");
const path = require("path");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("./lib/xss-clean");
const hpp = require("hpp");

const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./lib/appError");

const paymentRouter = require("./routes/paymentRoutes");
const customerRouter = require("./routes/customerRoutes");
const cardRouter = require("./routes/cardRoutes");
const webhookRouter = require("./routes/webhookRoutes");
const PORT = 3000;

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  //process.exit(1);
});

/**
 * -------------- GENERAL SETUP ----------------
 */
const app = express();
// Gives us access to variables set in the .env file via `process.env.VARIABLE_NAME` syntax
require("dotenv").config();
app.set("trust proxy", 1);

//Set security HTTP headers
app.use(helmet());

// Configures the database and opens a global connection that can be used in any module with `mongoose.connection`
require("./config/database");
const mongodb = require("./config/database2");
mongodb.connection();

//https://express-rate-limit.mintlify.app/reference/error-codes#err-erl-unexpected-x-forwarded-for
const limiter = rateLimit({
  max: 60,
  windowMs: 60 * 1000, //60min * 60sec * 1000miliSec,
  message: "Excediste el numero de intentos, por favor intentalo mas tarde", //'Too many request from this IP, please try again in one hour',
});
app.use("/api", limiter);

// Instead of using body-parser middleware, use the new Express implementation of the same thing req.body
app.use(
  express.json({
    limit: "10kb",
  })
);
app.use(express.urlencoded({ extended: true }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: ["duration"], /// aqui hay que poner los datos que vamos a usar para filtrar
  })
);

// Allows our Angular application to make HTTP requests to Express application
app.use(cors());

app.use(express.static(path.join(__dirname, "public")));

/**
 * -------------- ROUTES ---------------- //
 */

app.get("/", (req, res) => {
  res.json({});
});

//app.use("/api/v1/payments", paymentRouter); /// NOTE decirle a Ulices que le quite la s
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/customer", customerRouter);
app.use("/api/v1/card", cardRouter);
// Definir la ruta del webhook
app.use("/api/v1/webhook", webhookRouter);

/*  FINAL */
app.all("*", (req, res, next) => {
  next(new AppError(`¡No se encontro: '${req.originalUrl}'!`), 404);
});

// errorController.js
app.use(globalErrorHandler);

/**
 * -------------- SERVER ----------------
 */

// Server listens on http://localhost:3000
const server = app.listen(3000);

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log("Date:", new Date());
  console.log(err.name, err.message);
  /*server.close(() => {
    process.exit(1);
  });*/
});
