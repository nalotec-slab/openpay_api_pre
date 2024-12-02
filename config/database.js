const mongoose = require("mongoose");
//prueba
require("dotenv").config();

/**
 * -------------- DATABASE ----------------
 */

/**
 * Connect to MongoDB Server
 */
const devConnection = process.env.DB_STRING;
const prodConnection = process.env.MONGODB_URI;

let uri;
let autoIndex;

// Connect to the correct environment database
if (process.env.NODE_ENV === "production") {
  console.log("Estoy en produccion DB");
  uri = prodConnection;
  autoIndex = false;
} else {
  console.log("Estoy en dev DB");
  uri = prodConnection;
  autoIndex = true;
}
/*
uri = prodConnection;
autoIndex = false;
*/
const options = {
  bufferCommands: true,
  autoIndex,
  minPoolSize: 10,
};

try {
  console.log("uri:", uri);
  mongoose.connect(uri, options);
} catch (error) {
  handleError(error);
}

mongoose.connection.on(
  "error",
  console.error.bind(console, "connection error:")
);

mongoose.connection.on("connected", () => {
  console.log("Database connected with mongoose");
});

if (process.env.NODE_ENV != "production") {
  mongoose.set("debug", true);
}
