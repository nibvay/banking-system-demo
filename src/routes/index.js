import { Router } from "express";
import { CustomError } from "../middleware/errorHandler.js";
import { createAccount, deposit, withdraw, transfer, createLog, findAccountByName } from "../db/db.js";

const router = Router();

router.post("/account", async (req, res, next) => {
  try {
    const { name, balance = 0 } = req.body;
    if (balance < 0) throw new CustomError({ status: 400, message: "Initial balance cannot be negative" });
    const newAccount = await createAccount({ name, balance });
    res.status(201).json(newAccount);
  } catch (e) {
    next(e);
  }
});

router.post("/deposit", async (req, res, next) => {
  try {
    const { name, amount } = req.body;
    if (amount <= 0) throw new CustomError({ status: 400, message: "Amount cannot be negative or zero" });
    const updatedResult = await deposit({ name, amount });
    res.status(200).json(updatedResult);
  } catch (e) {
    next(e);
  }
});

router.post("/withdraw", async (req, res, next) => {
  try {
    const { name, amount } = req.body;
    if (amount <= 0) throw new CustomError({ status: 400, message: "Amount cannot be negative or zero" });
    const updatedResult = await withdraw({ name, amount });
    res.status(200).json(updatedResult);
  } catch (e) {
    next(e);
  }
});

router.post("/transfer", async (req, res, next) => {
  const { fromName, toName, amount } = req.body;

  try {
    if (fromName === toName) throw new CustomError({ status: 400, message: "You cannot transfer to yourself" });
    if (amount <= 0) throw new CustomError({ status: 400, message: "Amount cannot be negative or zero" });
    await transfer({ fromName, toName, amount });
    const from = await findAccountByName(fromName);
    const to = await findAccountByName(toName);
    res.status(200).json({ from, to });
  } catch (e) {
    if (e.code === 0) {
      await createLog({
        type: "transfer",
        source: fromName,
        destination: toName,
        amount,
        info: e.message,
        result: "failed",
      });
    }
    next(e);
  }
});

export default router;
