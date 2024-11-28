const catchAsync = require("./../lib/catchAsync");
const openpayPromise = require("./../lib/openpayPromise");
const moment = require("moment");
const mongodb = require("./../config/database2");

exports.setMethod = (req, res, next) => {
  const path = req.route.path;

  if (path.toString() === "/cardSubscriber" || path.toString() === "/card") {
    req.body.method = "card";
  } else if (
    path.toString() === "/storeSubscriber" ||
    path.toString() === "/store"
  ) {
    req.body.method = "store";
  } else if (
    path.toString() === "/speiSubscriber" ||
    path.toString() === "/spei"
  ) {
    req.body.method = "bank_account";
  }

  next();
};

exports.mandatoryData = (req, res, next) => {
  next();
};

exports.setIsSubscriber = (req, res, next) => {
  console.log(req.route.path);
  const path = req.route.path;

  if (
    path.toString() === "/cardSubscriber" ||
    path.toString() === "/storeSubscriber" ||
    path.toString() === "/speiSubscriber"
  ) {
    req.body.isSubscriber = true;
    //req.body.customer = "1234567890"; // *** NOTE *** traerlo de la base
    //req.body.customer_id = "alywl6osq8hxanq6rfbt";
    //req.body.source_id = req.body.card_id;
    //req.body.phone_number = "1234567890"; // *** NOTE *** traerlo de la base
  } else {
    req.body.isSubscriber = false;
    //req.body.source_id = req.body.token_id;
  }
  console.log("req.body.isSubscriber", req.body.isSubscriber);

  next();
};

exports.internalData = (req, res, next) => {
  req.body.currency = "MXN";
  req.body.order_id = orderID();
  req.body.createdAt = new Date();

  next();
};

const orderID = () => Math.floor(Math.random() * Date.now()) + "";

const chargeRequestStoreSpei = (req) => {
  console.log("req.body chargeRequestStoreSpei:", req.body);
  // Datos internos
  //const orderId = orderID();
  const dueDate = moment().add(3, "days");

  const chargeRequest = {
    method: req.body.method,
    amount: req.body.amount,
    description: req.body.description,
    order_id: req.body.order_id,
    due_date: dueDate,
  };

  console.log("chargeRequest", chargeRequest);

  return chargeRequest;
};

// Pago en tienda
exports.storePayment = catchAsync(async (req, res, next) => {
  console.log("req.body:", req.body);

  const chargeRequest = chargeRequestStoreSpei(req);

  // Insertar chargeRequest en mongo
  const db = await mongodb.connection();

  const chargeCreate = db.collection("api_charges_create");
  console.log("Insertando data en Mongo ");
  await chargeCreate.insertOne(req.body);

  // Llamar a openpay
  let chargeOpen = null;
  try {
    chargeOpen = await openpayPromise.chargesCreateSub(
      req.body.customer_id,
      chargeRequest
    );
  } catch (error) {
    console.error(error);
    return res.status(error.http_code).json({
      status: "failed",
      error,
    });
  }

  if (chargeOpen) {
    // Crear objeto para log
    const responseOpenPay = { ...chargeOpen };
    if (req.body.isSubscriber) {
      responseOpenPay.msisdn = req.body.phoneContact; //cuando es suscriber si ponerlo
    }
    responseOpenPay.offeringId = req.body.offeringId;
    responseOpenPay.statusPayment = "created";
    responseOpenPay.isSubscriber = req.body.isSubscriber;
    responseOpenPay.offer_type = req.body.offer_type;
    responseOpenPay.supplementary_offering_id =
      req.body.supplementary_offering_id;
    responseOpenPay.product_definition_id = req.body.product_definition_id;
    responseOpenPay.operationType = req.body.operationType;

    // Insertar objeto en mongodb
    console.log("responseOpenPay", responseOpenPay);
    const chargeCreate = db.collection("openpay_charges_store");
    await chargeCreate.insertOne(responseOpenPay); // *** NOTE *** creo que se puede quitar ese away para que sea mas rapido
  }

  res.status(200).json({
    status: "success",
    data: chargeOpen,
  });
});

// Pago spei
exports.speiPayment = catchAsync(async (req, res, next) => {
  console.log("req.body:", req.body);

  const chargeRequest = chargeRequestStoreSpei(req);

  // Insertar chargeRequest en mongo
  const db = await mongodb.connection();

  const chargeCreate = db.collection("api_charges_create");
  console.log("Insertando data en Mongo ");
  await chargeCreate.insertOne(req.body);

  // Llamar a openpay
  let chargeOpen = null;
  try {
    chargeOpen = await openpayPromise.chargesCreateSub(
      req.body.customer_id,
      chargeRequest
    );
  } catch (error) {
    console.error(error);
    return res.status(error.http_code).json({
      status: "failed",
      error,
    });
  }

  if (chargeOpen) {
    // Crear objeto para log
    const responseOpenPay = { ...chargeOpen };
    if (req.body.isSubscriber) {
      responseOpenPay.msisdn = req.body.phoneContact; //cuando es suscriber si ponerlo
    }
    responseOpenPay.offeringId = req.body.offeringId;
    responseOpenPay.statusPayment = "created";
    responseOpenPay.isSubscriber = req.body.isSubscriber;
    responseOpenPay.offer_type = req.body.offer_type;
    responseOpenPay.supplementary_offering_id =
      req.body.supplementary_offering_id;
    responseOpenPay.product_definition_id = req.body.product_definition_id;
    responseOpenPay.operationType = req.body.operationType;

    // Insertar objeto en mongodb
    console.log("responseOpenPay", responseOpenPay);
    const chargeCreate = db.collection("openpay_charges_spei");
    await chargeCreate.insertOne(responseOpenPay); // *** NOTE *** creo que se puede quitar ese away para que sea mas rapido
  }

  res.status(200).json({
    status: "success",
    data: chargeOpen,
  });
});

/*
//Eliminar
exports.tiendasPayment = catchAsync(async (req, res, next) => {
  console.log("req.body antes", req.body);
  const chargeData = {
    method: "store",
    amount: 100,
    description: "Cargo con tienda",
    order_id: "oid-00053",
    due_date: "2024-11-05T13:45:00",
  };

  //$charge = $openpay->charges->create($chargeData);
  openpay.charges.create(chargeData, function (error, charge) {
    console.log("charge", charge);
    res.status(200).json({
      status: "en desarrollo",
      data: charge,
    });
    console.log("error", error);
  });

});*/

const chargeRequestCard = (req) => {
  // Datos internos
  //req.body.method = "card";

  const chargeRequest = {
    source_id: req.body.source_id,
    method: req.body.method,
    amount: req.body.amount,
    currency: "MXN",
    description: req.body.description,
    order_id: req.body.order_id,
    device_session_id: req.body.device_session_id,
  };

  //console.log("req.body", req.body);
  console.log("chargeRequest", chargeRequest);

  return chargeRequest;
};

// Pago con tarjeta
exports.cardPayment = catchAsync(async (req, res, next) => {
  console.log("req.body cardPayment:", req.body);

  const chargeRequest = chargeRequestCard(req);

  // Insertar chargeRequest en mongo
  const db = await mongodb.connection();

  const chargeCreate = db.collection("api_charges_create");
  console.log("Insertando data en Mongo ");
  if (req.body.newCard) {
    delete req.body.newCard.__v;
  }

  await chargeCreate.insertOne(req.body);

  // Llamar a openpay
  let chargeOpen = null;
  try {
    chargeOpen = await openpayPromise.chargesCreateSub(
      // *** NOTE
      req.body.customer_id,
      chargeRequest
    );
    // nO ESTA LLEGANDO AQUI
    console.log(chargeOpen);
  } catch (error) {
    console.error("error", error);
    return res.status(error.http_code).json({
      status: "failed",
      error,
    });
  }

  if (chargeOpen) {
    // Crear objeto para log
    const responseOpenPay = { ...chargeOpen };
    if (req.body.isSubscriber) {
      responseOpenPay.msisdn = req.body.phoneContact; //cuando es suscriber si ponerlo
    }
    responseOpenPay.offeringId = req.body.offeringId; //plan
    responseOpenPay.statusPayment = "created";
    responseOpenPay.isSubscriber = req.body.isSubscriber;
    responseOpenPay.offer_type = req.body.offer_type;
    responseOpenPay.supplementary_offering_id =
      req.body.supplementary_offering_id;
    responseOpenPay.product_definition_id = req.body.product_definition_id;
    responseOpenPay.operationType = req.body.operationType;

    // Insertar objeto en mongodb
    console.log("responseOpenPay", responseOpenPay);
    const chargeCreate = db.collection("openpay_charges_card");
    await chargeCreate.insertOne(responseOpenPay); // *** NOTE *** creo que se puede quitar ese away para que sea mas rapido
  }

  return res.status(200).json({
    status: "success",
    data: chargeOpen,
  });
  /*
  res.status(200).json({
    status: "test",
  });*/
});
