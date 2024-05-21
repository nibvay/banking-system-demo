import mysql from "mysql2/promise";
import Sequelize from "sequelize";

import createModels from "../models/index.js";

const { DB_HOST: host, DB_PORT: port, DB_USERNAME: user, DB_PASSWORD: password, DB_NAME: dbName } = process.env;

let init = false;
const db = {}; // TODO: add db class

// const sequelize = new Sequelize("", "root", "123", {
//   host: "localhost",
//   port: "3306",
//   dialect: "mysql",
// });

// async function dbConnection() {
//   try {
//     init = true;
//     console.log("Try to connect the database......");
//     const conn = await mysql.createConnection({ host, port, user, password });
//     await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
//     console.log(`Init database: ${dbName}`);

//     const sequelize = new Sequelize(dbName, user, password, { host, port, dialect: "mysql", logging: false });
//     await sequelize.authenticate();
//     console.log("Connected to the database!!");

//     db.sequelize = sequelize;
//   } catch (error) {
//     console.error("Unable to connect to the database:", error.message);
//     process.exit(1);
//   }
// }

// for local development
async function dbConnection() {
  try {
    init = true;
    let initDb = "my-banking-test";
    console.log("Try to connect the database......");
    const conn = await mysql.createConnection({ host: "localhost", port, user: "root", password: "123" });
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${initDb}\`;`);
    console.log(`Init database: ${initDb}`);

    const sequelize = new Sequelize(initDb, "root", "123", {
      host: "localhost",
      port,
      dialect: "mysql",
      logging: false,
    });
    await sequelize.authenticate();
    console.log("Connected to the database!!");

    db.sequelize = sequelize;
  } catch (error) {
    console.error("Unable to connect to the database:", error.message);
    process.exit(1);
  }
}

if (!init) {
  await dbConnection();
  db.models = {};
  createModels(db);
  await db.sequelize.sync({ force: true });
  console.log("All models were synchronized successfully.");
}

export { db };
