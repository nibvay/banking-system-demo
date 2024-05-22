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
    const account = await Account.findByPk(name, { lock: true, transaction: t });
    if (!account) throw new CustomError({ status: 404, message: "Account not found" });

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
    const account = await Account.findByPk(name, { lock: true, transaction: t });
    if (!account) throw new CustomError({ status: 404, message: "Account not found" });
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

  try {
    await sequelize.transaction(async (t) => {
      const fromAccount = await Account.findByPk(fromName, { lock: true, transaction: t });
      const toAccount = await Account.findByPk(toName, { lock: true, transaction: t });

      if (!fromAccount || !toAccount) throw new CustomError({ status: 404, message: "Account not found" });
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
      await createLog(
        { type: "transfer", source: fromName, destination: toName, amount, result: "success" },
        { transaction: t }
      );
    });
  } catch (e) {
    throw e;
  }

  return true;
}

async function createLog({ type, source, destination, amount, result, info }, options) {
  const { TransactionLog } = db.models;
  let newLog;
  if (options) {
    newLog = await TransactionLog.create({ type, source, destination, amount, result, info }, options);
  } else {
    newLog = await TransactionLog.create({ type, source, destination, amount, result, info });
  }
  return newLog.toJSON();
}

async function findAccountByName(name) {
  const { Account } = db.models;
  return (await Account.findByPk(name)).toJSON();
}

async function findTransferLogByName(name) {
  const { TransactionLog } = db.models;
  const result = await TransactionLog.findAll({
    where: {
      type: "transfer",
      [Op.or]: [
        {
          source: name,
        },
        {
          destination: name,
        },
      ],
    },
  });
  return result;
}

export { createAccount, deposit, withdraw, transfer, createLog, findAccountByName, findTransferLogByName };
