const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
  user_id: String, // id en postgress
  id: String,
  creation_date: Date,
  holder_name: String,
  card_number: String,
  cvv2: String,
  expiration_month: Number,
  expiration_year: Number,
  allows_charges: Boolean,
  allows_payouts: Boolean,
  brand: String,
  type: String,
  bank_name: String,
  bank_code: String,
  customer_id: String, //Identificador del cliente al que pertenece la tarjeta. Si la tarjeta es a nivel comercio este valor será null.
  points_card: Boolean,

  address: {
    line1: String,
    line2: String,
    line3: String,
    postal_code: String,
    state: String,
    city: String,
    country_code: String,
  },
});

const Card = mongoose.model("Card", cardSchema);

module.exports = Card;
