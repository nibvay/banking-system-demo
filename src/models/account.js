import { DataTypes } from "sequelize";

const Account = {
  name: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  balance: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.0,
    validate: {
      min: {
        args: [0],
        msg: "Balance cannot be negative.",
      },
    },
  },
};

export default Account;
