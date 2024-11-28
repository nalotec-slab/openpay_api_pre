const express = require("express");
// Controller
//const authController = require("../controllers/authController");
const customerController = require("../controllers/customerController");

const router = express.Router();

router.route("/").post(
  // customerController.filterBodyCustomer,
  customerController.createCustomer
);

router.route("/delete").post(
  // customerController.filterBodyCustomer,
  customerController.deleteCustomer
);

module.exports = router;
