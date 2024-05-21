import { DataTypes } from "sequelize";

const TransactionLog = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  destination: {
    type: DataTypes.STRING,
    allowNull: false,
    reference: {
      model: "accounts",
      key: "name",
    },
  },
  source: {
    type: DataTypes.STRING,
    allowNull: false,
    reference: {
      model: "accounts",
      key: "name",
    },
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  result: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  info: {
    type: DataTypes.STRING,
    allowNull: true,
  },
};

export default TransactionLog;
