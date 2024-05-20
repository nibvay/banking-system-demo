import accountSchema from "./account.js";
import transactionLogSchema from "./transactionLog.js";

function createModels(db) {
  const { sequelize } = db;
  const Account = sequelize.define("Account", accountSchema);
  db.models.Account = Account;

  const TransactionLog = sequelize.define("TransactionLog", transactionLogSchema);
  db.models.TransactionLog = TransactionLog;

  Account.hasMany(TransactionLog, { foreignKey: "source" });
  Account.hasMany(TransactionLog, { foreignKey: "destination" });
  TransactionLog.belongsTo(Account, { as: "SourceAccount", foreignKey: "source" });
  TransactionLog.belongsTo(Account, { as: "DestinationAccount", foreignKey: "destination" });
}

export default createModels;
