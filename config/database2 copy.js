const { MongoClient } = require("mongodb");

exports.connection = async function connectToMongoDB() {
  // URL de conexión de MongoDB y nombre de la base de datos
  const url = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME;
  const client = new MongoClient(url);

  try {
    // Conectarse a MongoDB

    await client.connect();
    console.log("Conectado a MongoDB");

    // Selecciona la base de datos
    const db = client.db(dbName);
    //db.collection();
    return db; // Almacena la base de datos en `app.locals` para usarla en otras partes de la app
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error);
    process.exit(1); // Salir si no se puede conectar
  }
};
