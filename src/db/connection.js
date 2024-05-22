import mysql from "mysql2/promise";
import Sequelize from "sequelize";

import createModels from "../models/index.js";

const { EXEC_ENV = null } = process.env;

let dbConfig;
if (EXEC_ENV === "test" || EXEC_ENV === "local") {
  dbConfig = {
    host: "localhost",
    port: 3306,
    user: "root",
    password: "123",
    dbName: "test-banking-system-db",
  };
} else {
  const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME } = process.env;
  dbConfig = {
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USERNAME,
    password: DB_PASSWORD,
    dbName: DB_NAME,
  };
}

let init = false;
const db = {};

async function dbConnection() {
  try {
    init = true;
    console.log("Try to connect the database......");
    const conn = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
    });
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.dbName}\`;`);
    console.log(`Init database: ${dbConfig.dbName}`);

    const sequelize = new Sequelize(dbConfig.dbName, dbConfig.user, dbConfig.password, {
      host: dbConfig.host,
      port: dbConfig.port,
      dialect: "mysql",
      logging: EXEC_ENV === "test" || EXEC_ENV === "local",
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
  await db.sequelize.sync({ force: true }); // This creates the table, dropping it first if it already existed
  console.log("All models were synchronized successfully.");
}

export { db };
