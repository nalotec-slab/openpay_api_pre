const path = require("path");
const { log } = require("console");

// Filtra los campos que vienen del FRONT para que unicamente se inserten en la base los deseados
exports.filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

/**
 * conectar a la coleccion de mongo que se usara
 */
/*
exports.prepareConn = async(colName) => {
  const db = await mongodb.connection();
  // try {
  const charge = { ...chargeRequest };
  charge.date = new Date();

  const chargeCreate = db.collection("api_charges_create");
  //  console.log("Insertando data en Mongo ");

}*/
