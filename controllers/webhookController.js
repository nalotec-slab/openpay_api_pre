const catchAsync = require("./../lib/catchAsync");
const mongodb = require("./../config/database2");
const axios = require("axios");

// Middleware de autenticación básica
exports.basicAuth = (req, res, next) => {
  //console.log(process.env.OPENPAY_USER);
  //console.log(process.env.OPENPAY_PWD);
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(200).send("auth");
  }

  // El encabezado Authorization tiene el formato "Basic base64(username:password)"
  const base64Credentials = authHeader.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString(
    "utf-8"
  );
  const [username, password] = credentials.split(":");
  //console.log("credentials:", credentials);

  // Verificar nombre de usuario y contraseña
  if (
    username === process.env.OPENPAY_USER &&
    password === process.env.OPENPAY_PWD
  ) {
    // console.log("Estoy en next");

    return next();
  } else {
    console.log("Estoy en fallo auth");
    return res.status(200).send("auth");
  }
};

exports.rcvOpenPayResponse = catchAsync(async (req, res, next) => {
  console.log("Webhook recibido!");
  console.log("Datos recibidos:", req.body);
  const data = req.body;

  if (data.type === "verification") {
    try {
      // Insertar data en MongoDB/openpay_verification
      console.log("Insertando data en Mongo ");
      const db = await mongodb.connection();
      const verifications = db.collection("openpay_verification");

      await verifications.insertOne(data);

      return res.status(200).send({
        data: {
          status: true,
          message: "Operación exitosa",
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send("Error al insertar el codigo verificador");
    }
  }

  if (data.type === "charge.succeeded") {
    //console.log("data (body)", data);

    try {
      //Buscar si ya se envio esta respuesta

      // Insertar data en Mongo DB/openpay_charge_succeeded
      const db = await mongodb.connection();
      const chargeSucceeded = db.collection("openpay_charge_succeeded");
      console.log("Insertando data en Mongo ");
      await chargeSucceeded.insertOne(data);
    } catch (error) {
      console.error(error);
      return res.status(500).send("Error al insertar charge.succeeded");
    }
    if (data.transaction) {
      const table = "api_charges_create";
      const orderId = data.transaction.order_id;
      console.log("orderId", orderId);

      const db = await mongodb.connection();
      const chargeRef = db.collection(table);
      const query = { order_id: orderId };
      const dataCharge = await chargeRef.findOne(query);

      if (dataCharge) {
        // Agregar campos a api_charges_create para API postgress
        const updateDoc = {
          $set: {
            operation_date: data.transaction.operation_date,
            //amount: data.transaction.amount,
            transactionId: data.transaction.id,
          },
        };
        // Update the first document that matches the filter
        const result = await chargeRef.updateOne(query, updateDoc);
        console.log("Update result", result);

        // const msisdn = dataCharge.msisdn;
        // let offering_id = dataCharge.offeringId + "";
        console.log("Llamando v1/subscribers/createOrder");

        if (
          dataCharge.operationType.toString() === "compra" ||
          dataCharge.operationType.toString() === "pago"
        ) {
          console.log("id:", dataCharge._id);

          const payload = {
            customerId: dataCharge._id,
          };
          try {
            const response = await axios.post(
              process.env.CREATE_ORDER,
              payload
            );

            console.log("response", response.data);
          } catch (error) {
            console.error("error", error);
          }
        } else if (dataCharge.operationType.toString() === "recarga") {
          try {
            const payload = {
              msisdn: dataCharge.msisdn,
              offerIds: [dataCharge.offeringId],
            };

            const response = await axios.post(process.env.PURCHASE, payload);

            console.log("response", response.data);
          } catch (error) {
            console.error("error", error);
          }
        }
      }
    }
  }
  return res.status(200).send({
    data: {
      status: true,
      message: "Operación exitosa",
    },
  });
});
