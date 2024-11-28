const Card = require("../model/cardModel");
const catchAsync = require("./../lib/catchAsync");
const AppError = require("./../lib/appError");
const utils = require("../lib/utils");
const openpayPromise = require("./../lib/openpayPromise");
const factory = require("./handlerFactory");
const mongodb = require("./../config/database2");

exports.test = (req, res, next) => {
  console.log("entre a test");

  res.status(200).json({
    status: "test",
  });
};

exports.filterBodyCard = (req, res, next) => {
  console.log("req.user", req.user);
  const address = req.body.address;
  req.body = utils.filterObj(
    req.body,
    "holder_name",
    "card_number",
    "cvv2",
    "expiration_month",
    "expiration_year",
    "device_session_id",
    "customerId" // tmp eliminarlo
  );

  req.body.address = address;
  next();
};

const createRequestCard = (req) => {
  const cardRequest = {
    card_number: req.body.cardNumber,
    holder_name: req.body.cardHolder,
    expiration_year: req.body.card_expiration_year,
    expiration_month: req.body.card_expiration_month,
    cvv2: req.body.cvv2,
    device_session_id: req.body.device_session_id,
  };

  //console.log("req.body", req.body);
  console.log("cardRequest", cardRequest);

  return cardRequest;
};

const avoidDuplicate = catchAsync(async (card, res) => {
  // Buscar tarjeta(cardX) en la base de Mongo
  console.log("Buscando tarjeta en Mongo ");

  try {
    const currentCard = await Card.findOne({
      card_number: card.toString(),
    });

    if (currentCard) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "failed",
      msg: error,
    });
  }
});

const convertCard = (card) => {
  const cardLeft = card.toString().substring(0, 6);
  const cardRight = card.toString().substring(12, 16);
  const cardX = `${cardLeft}XXXXXX${cardRight}`;
  console.log("cardX", cardX);
  return cardX;
};

exports.createCard = catchAsync(async (req, res, next) => {
  console.log("req.body createCard", req.body);

  if (req.body.saveCard === true) {
    console.log("req.body.saveCard === true");
    const cardX = convertCard(req.body.cardNumber);

    // Buscar tarjeta(cardX) en la base de Mongo
    console.log("Buscando tarjeta en Mongo ");
    const currentCard = await Card.findOne({
      //card_number: "411111XXXXXX1111",
      card_number: cardX.toString(),
    });

    let isDuplicate = true;
    if (currentCard) {
      isDuplicate = true;
    } else {
      isDuplicate = false;
    }

    //const isDuplicate = avoidDuplicate(cardX, res);
    console.log(isDuplicate);

    if (isDuplicate) {
      //regresar que ya existe la tarjeta
      return res.status(400).json({
        status: "failed",
        msg: "Esta tarjeta ya esta dada de alta",
      });
    }
    const customerId = req.body.customer_id;
    const newCardRequest = createRequestCard(req);

    // Insertar log en mongo/api_create_card
    const cardLog = { ...req.body };
    // quitar todos los datos sensibles de la tarjeta
    cardLog.createdAt = new Date();

    const db = await mongodb.connection();
    const cardCreate = db.collection("api_create_card");
    await cardCreate.insertOne(cardLog);

    //Crear card en openpay
    let card = null;
    try {
      card = await openpayPromise.createCardCustomer(
        customerId,
        newCardRequest
      );
      console.log("card externo", card);
    } catch (error) {
      console.error("Openpay Error:", error);
      return res.status(error.http_code).json({
        status: "failed",
        error,
      });
    }
    let newCard = {};
    if (card) {
      newCard = await Card.create(card);
      req.body.newCard = newCard;
      req.body.source_id = newCard.id;
    } else {
      return res.status().json({
        status: "failed",
        error: "No se genero la tarjeta",
      });
    }
  }

  /*
  return res.status(200).json({
    status: "success",
    card: newCard,
  });*/
  next();
});

exports.setVars = (req, res, next) => {
  req.query = { customer_id: req.params.id }; //necesito relacionar con el user_id
  next();
};
exports.getAllCards = factory.getAll(Card);
