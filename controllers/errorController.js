const AppError = require("./../lib/appError");

const handleCastErrorDB = (err) => {
  let message;
  //console.log(err.message.toString());
  if (
    err.message.toString().includes("Cast to ObjectId failed") &&
    err.message.toString().includes("Children")
  ) {
    message = `El QR no es valido`;
  } else if (err.path.toString().includes("birthdate")) {
    message = `Fecha de nacimiento invalida: ${err.value}.`;
  } else {
    message = `Valor invalido para ${err.path}: ${err.value}.`;
  }

  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  //console.log('const handleDuplicateFieldsDB = (err) => {');
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  //console.log(value);
  let message = `¡Valor duplicado: ${value}. Por favor usa otro valor!`;
  if (value.toString().includes("@")) {
    message = `¡Ya exite un usuario con este correo: ${value}. Por favor usa otro correo!`;
  }
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Información invalida. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError("Token invalido", 401);

const handleJWTExpiredError = () => new AppError("Tu sesión ha expirado", 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  //console.log('sendErrorProd');
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    // *** aqui se puede poner un log handler ***
    console.error("ERROR 💥", err);

    // 2) Send generic message
    res.status(500).json({
      status: "error",
      message: "Ocurrio un error por favor vuelve a intentarlo",
    });
  }
};

module.exports = (err, req, res, next) => {
  // console.log(err);
  // console.log(err.stack);
  /*console.log('<error>');
  console.log(err);
  console.log('</error>');*/
  if (err.message.toString().includes("heic")) {
    err.statusCode = 415;
    err.isOperational = true;
  }
  console.log("err.message.toString()", err.message);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    //console.log('err');
    //console.log(err.message);

    if (err.name === "CastError") err = handleCastErrorDB(err);
    if (err.code === 11000) err = handleDuplicateFieldsDB(err);
    if (err.name === "ValidationError") err = handleValidationErrorDB(err);
    if (err.name === "JsonWebTokenError") err = handleJWTError();
    if (err.name === "TokenExpiredError") err = handleJWTExpiredError();

    sendErrorProd(err, res);
    //sendErrorDev(err, res);
    /*
    let error = { ...err };
    console.log('error');
    console.log(error.message); //pierdo el mensaje por alguna extrana razon

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);*/
  }
};
