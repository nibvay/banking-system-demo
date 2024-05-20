import { Op } from "sequelize";

import { db } from "../db/connection.js";
import { CustomError } from "../middleware/errorHandler.js";

async function createAccount({ name, balance }) {
  const { Account } = db.models;
  const newAccount = await Account.create({ name, balance });
  return newAccount.toJSON();
}

async function deposit({ name, amount }) {
  const {
    sequelize,
    models: { Account },
  } = db;

  await sequelize.transaction(async (t) => {
    const account = await Account.findByPk(name, { transaction: t });
    if (!account) throw new CustomError({ status: 400, message: "Invalid account name" });

    await Account.update(
      { balance: account.balance + amount },
      {
        where: { name: account.name },
        transaction: t,
      }
    );
  });

  return await Account.findByPk(name);
}

async function withdraw({ name, amount }) {
  const {
    sequelize,
    models: { Account },
  } = db;

  await sequelize.transaction(async (t) => {
    const account = await Account.findByPk(name, { transaction: t });
    if (!account) throw new CustomError({ status: 400, message: "Invalid account name" });
    if (account.balance < amount) throw new CustomError({ status: 400, message: "Insufficient balance" });

    await Account.update(
      { balance: account.balance - amount },
      {
        where: { name: account.name },
        transaction: t,
      }
    );
  });

  return await Account.findByPk(name);
}

async function transfer({ fromName, toName, amount }) {
  const {
    sequelize,
    models: { Account },
  } = db;

  await sequelize.transaction(async (t) => {
    const fromAccount = await Account.findByPk(fromName, { transaction: t });
    const toAccount = await Account.findByPk(toName, { transaction: t });
    if (!fromAccount || !toAccount) throw new CustomError({ status: 400, message: "Invalid account" });
    if (fromAccount.balance < amount) {
      throw new CustomError({ status: 400, code: 0, message: "Insufficient balance from source account" });
    }

    await Account.update(
      { balance: fromAccount.balance - amount },
      {
        where: { name: fromAccount.name },
        transaction: t,
      }
    );
    await Account.update(
      { balance: toAccount.balance + amount },
      {
        where: { name: toAccount.name },
        transaction: t,
      }
    );
  });

  const [fromAccount, toAccount] = await Account.findAll({
    where: {
      name: {
        [Op.or]: [fromName, toName],
      },
    },
  });
  return { from: fromAccount.toJSON(), to: toAccount.toJSON() };
}

async function createLog({ type, source, destination, amount, result }) {
  const { TransactionLog } = db.models;
  const newLog = await TransactionLog.create({ type, source, destination, amount, result });
  return newLog.toJSON();
}

export { createAccount, deposit, withdraw, transfer, createLog };
