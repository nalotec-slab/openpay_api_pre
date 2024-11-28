const express = require("express");
// Controller
const webhookController = require("../controllers/webhookController");

const router = express.Router();

router
  .route("/")
  .post(webhookController.basicAuth, webhookController.rcvOpenPayResponse); //webhookController.basicAuth,

module.exports = router;
