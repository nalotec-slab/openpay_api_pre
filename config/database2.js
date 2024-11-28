const { MongoClient } = require("mongodb");
//https://www.youtube.com/watch?v=-d96Q_NIl3Q

let _db = null;

exports.connection = async function connectToMongoDB() {
  // URL de conexión de MongoDB y nombre de la base de datos

  if (!_db) {
    const url = process.env.MONGODB_URI;
    const dbName = process.env.DB_NAME;
    const client = new MongoClient(url);

    try {
      // Conectarse a MongoDB

      await client.connect();
      console.log("Conectado a MongoDB con driver nativo");

      // Selecciona la base de datos
      _db = client.db(dbName);
    } catch (error) {
      console.error("Error al conectar a MongoDB:", error);
      process.exit(1); // Salir si no se puede conectar
    }
  }
  return _db;
};
