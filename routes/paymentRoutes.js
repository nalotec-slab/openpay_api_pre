const express = require("express");
// Controller
//const authController = require("../controllers/authController");
const paymentController = require("../controllers/paymentController");
const customerController = require("../controllers/customerController");
const cardController = require("../controllers/cardController");

const router = express.Router();

//router.use(authController.protect);

// Pago Tarjeta
router.route("/card").post(
  paymentController.setIsSubscriber,
  paymentController.setMethod,
  //  paymentController.mandatoryData,
  paymentController.internalData,
  customerController.createCustomer,
  paymentController.cardPayment
); //
router
  .route("/cardSubscriber")
  .post(
    paymentController.setIsSubscriber,
    paymentController.setMethod,
    paymentController.internalData,
    customerController.createCustomer,
    cardController.createCard,
    paymentController.cardPayment
  );

// Pago tienda
router
  .route("/store")
  .post(
    paymentController.setIsSubscriber,
    paymentController.setMethod,
    paymentController.internalData,
    customerController.createCustomer,
    paymentController.storePayment
  );
router
  .route("/storeSubscriber")
  .post(
    paymentController.setIsSubscriber,
    paymentController.setMethod,
    paymentController.internalData,
    customerController.createCustomer,
    paymentController.storePayment
  );

// Pago spei
router
  .route("/spei")
  .post(
    paymentController.setIsSubscriber,
    paymentController.setMethod,
    paymentController.internalData,
    customerController.createCustomer,
    paymentController.speiPayment
  );
router
  .route("/speiSubscriber")
  .post(
    paymentController.setIsSubscriber,
    paymentController.setMethod,
    paymentController.internalData,
    customerController.createCustomer,
    paymentController.speiPayment
  );

//router.route("/test").get(paymentController.test);

//eliminar
router
  .route("/crearCargoTarjeta")
  .post(paymentController.setIsSubscriber, paymentController.internalData);

module.exports = router;
