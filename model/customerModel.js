const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  id: String,
  user_id: String, // id en postgress
  creation_date: Date,
  name: String,
  last_name: String,
  email: String,
  phone_number: String,
  status: String, // [active, delete]
  balance: Number,
  clabe: String,

  address: {
    line1: String,
    line2: String,
    line3: String,
    postal_code: String,
    state: String,
    city: String,
    country_code: String,
  },

  store: {
    reference: String,
    barcode_url: String,
  },
});

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
