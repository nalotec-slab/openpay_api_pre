const express = require("express");
// Controller
//const authController = require("../controllers/authController");
const cardController = require("../controllers/cardController");

const router = express.Router();

router
  .route("/getAllbyCustomer/:id")
  .get(cardController.setVars, cardController.getAllCards);

router.route("/").post(cardController.createCard);

module.exports = router;
