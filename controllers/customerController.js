// https://documents.openpay.mx/docs/api/?javascript#objeto-cliente

const Customer = require("../model/customerModel");
const catchAsync = require("./../lib/catchAsync");
const AppError = require("./../lib/appError");
const utils = require("../lib/utils");
const openpayPromise = require("./../lib/openpayPromise");
const mongodb = require("./../config/database2");

exports.test = (req, res, next) => {
  console.log("entre a test");

  res.status(200).json({
    status: "test",
  });
};

exports.filterBodyCustomer = (req, res, next) => {
  req.body = utils.filterObj(
    req.body,
    "name",
    "last_name",
    "second_last_name",
    "email",
    "phone_number",
    "clabe"
  );

  next();
};

const customerReq = (req) => {
  // Datos internos
  //const external_id = req.user.id

  const customerRequest = {
    //external_id,
    name: req.body.name,
    last_name: `${req.body.lastName} ${req.body.secondLastName}`,
    email: req.body.email,
    phone_number: req.body.phoneContact,
    /*
    name: req.body.customer.name,
    last_name: `${req.body.customer.last_name} ${req.body.customer.second_last_name}`,
    email: req.body.customer.email,
    phone_number: req.body.customer.phone_number,
    address: req.body.customer.address,*/
  };

  console.log("customerRequest", customerRequest);

  return customerRequest;
};

exports.deleteCustomer = catchAsync(async (req, res, next) => {
  console.log("req.body antes", req.body);
  try {
    await openpayPromise.deleteCustomer(req.body.customerID);
    console.log("customer externo", customer);
  } catch (error) {
    console.error("Openpay Error:", error);
    return res.status(error.http_code).json({
      status: "failed",
      error,
    });
  }
});

exports.createCustomer = catchAsync(async (req, res, next) => {
  console.log("req.body antes", req.body);

  // *** NOTE *** de donde lo saco? Segun yo cuando hagamos el login lo traemos de postgress
  //console.log("req.user", req.user);

  //validar si viene el customer_id
  if (req.body.customer_id && req.body.customer_id !== "") {
    console.log("Si viene el customer_id");
    return next();
  }

  const customerRequest = customerReq(req);

  // Validar si ya existe ese customer con el email
  const existCustomer = await Customer.findOne({
    email: customerRequest.email,
  });

  console.log("existCustomer", existCustomer);

  if (existCustomer) {
    req.body.customer_id = existCustomer._doc.id;
    // Actualizar datos
    return next();
  }

  // Insertar log en mongo/api_create_customer
  const customerLog = { ...customerRequest };
  customerLog.createdAt = new Date();

  const db = await mongodb.connection();
  const customerDB = db.collection("api_create_customer");
  await customerDB.insertOne(customerLog);

  //Crear customer en openpay
  let customer = null;
  try {
    customer = await openpayPromise.createCustomer(customerRequest);
    console.log("customer externo", customer);
  } catch (error) {
    console.error("Openpay Error:", error);
    return res.status(error.http_code).json({
      status: "failed",
      error,
    });
  }

  //Crear customer en MongoDB
  let newCustomer = {};
  if (customer) {
    console.log("Insertando customer en db");
    newCustomer = await Customer.create(customer);
    req.body.customer_id = customer.id;
  }

  next();
});
