var Openpay = require("openpay");
const openpay = new Openpay(process.env.OPENPAY_ID, process.env.OPENPAY_PK);

exports.createCustomer = (customerRequest) => {
  return new Promise((resolve, reject) => {
    openpay.customers.create(customerRequest, function (error, customer) {
      if (error) {
        reject(error); // Reject the promise if there's an error
      } else {
        //console.log("customer interno", customer);
        resolve(customer); // Resolve the promise with the content
      }
    });
  });
};

exports.deleteCustomer = (customerId) => {
  return new Promise((resolve, reject) => {
    openpay.customers.delete(customerId, function (error) {
      if (error) {
        reject(error); // Reject the promise if there's an error
      } else {
        //console.log("customer interno", customer);
        resolve(); // Resolve the promise with the content
      }
    });
  });
};

exports.createCardCustomer = (customerId, cardRequest) => {
  return new Promise((resolve, reject) => {
    openpay.customers.cards.create(
      customerId,
      cardRequest,
      function (error, card) {
        if (error) {
          reject(error); // Reject the promise if there's an error
        } else {
          resolve(card); // Resolve the promise with the content
        }
      }
    );
  });
};

exports.chargesCreateSub = (customerId, chargeRequest) => {
  return new Promise((resolve, reject) => {
    console.log("Llamando a openpay");
    console.log(customerId);
    console.log(chargeRequest);

    openpay.customers.charges.create(
      customerId,
      chargeRequest,
      function (error, card) {
        if (error) {
          reject(error); // Reject the promise if there's an error
        } else {
          resolve(card); // Resolve the promise with the content
        }
      }
    );
  });
};

exports.chargesCreate = (chargeRequest) => {
  return new Promise((resolve, reject) => {
    openpay.charges.create(chargeRequest, function (error, card) {
      if (error) {
        reject(error); // Reject the promise if there's an error
      } else {
        resolve(card); // Resolve the promise with the content
      }
    });
  });
};
