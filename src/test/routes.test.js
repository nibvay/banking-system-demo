import request from "supertest";
import app from "../app";
import { createAccount, findAccountByName } from "../db/db";
import { db } from "../db/connection";

const BASE_URL = "/api";

describe("Basic test for API", () => {
  describe("POST /account", () => {
    it("should create an account", async () => {
      const res = await request(app).post(`${BASE_URL}/account`).send({ name: "Jason", balance: 500 });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty("name", "Jason");
      expect(res.body).toHaveProperty("balance", 500);
    });

    it("should not create an account with negative balance", async () => {
      const res = await request(app).post(`${BASE_URL}/account`).send({ name: "Joe", balance: -500 });
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe("Initial balance cannot be negative");
    });
  });

  describe("POST /deposit", () => {
    it("should deposit money to an account", async () => {
      await createAccount({ name: "George", balance: 1000 });
      const res = await request(app).post(`${BASE_URL}/deposit`).send({ name: "George", amount: 200 });
      expect(res.statusCode).toEqual(200);
      expect(res.body.balance).toBe(1000 + 200);
    });
    it("should not deposit to non-existent account", async () => {
      const res = await request(app).post(`${BASE_URL}/deposit`).send({ name: "yoyoman", amount: 200 });
      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toBe("Account not found");
    });
  });

  describe("POST /withdraw", () => {
    beforeAll(async () => {
      await createAccount({ name: "Mary", balance: 1000 });
    });

    it("should withdraw money from an account", async () => {
      const res = await request(app).post(`${BASE_URL}/withdraw`).send({ name: "Mary", amount: 50 });
      expect(res.statusCode).toEqual(200);
      expect(res.body.balance).toBe(1000 - 50);
    });
    it("should not withdraw from non-existent account", async () => {
      const res = await request(app).post(`${BASE_URL}/withdraw`).send({ name: "yoyoman", amount: 200 });
      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toBe("Account not found");
    });
    it("should not withdraw with insufficient balance", async () => {
      const res = await request(app).post(`${BASE_URL}/withdraw`).send({ name: "Mary", amount: 2000 });
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe("Insufficient balance");
    });
  });

  describe("POST /transfer", () => {
    beforeAll(async () => {
      await createAccount({ name: "James", balance: 1500 });
      await createAccount({ name: "Cindy", balance: 2000 });
    });

    it("should transfer money between two accounts", async () => {
      const res = await request(app)
        .post(`${BASE_URL}/transfer`)
        .send({ fromName: "James", toName: "Cindy", amount: 1000 });
      expect(res.statusCode).toEqual(200);
      expect(res.body.from.balance).toBe(500);
      expect(res.body.to.balance).toBe(3000);
    });
    it("should not transfer from or to non-existent account", async () => {
      const res = await request(app)
        .post(`${BASE_URL}/transfer`)
        .send({ fromName: "yoyoman", toName: "yoyoman2", amount: 2000 });
      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toBe("Account not found");
    });
    it("should not transfer with insufficient balance", async () => {
      const res = await request(app)
        .post(`${BASE_URL}/transfer`)
        .send({ fromName: "James", toName: "Cindy", amount: 6000 });
      expect(res.statusCode).toEqual(400);
      expect(res.body.code).toEqual(0);
      expect(res.body.message).toBe("Insufficient balance from source account");
    });
  });
});

describe("Banking System integration test", () => {
  const initBalance = 1000;
  beforeAll(async () => {
    await createAccount({ name: "Leo", balance: initBalance });
    await createAccount({ name: "May", balance: initBalance });
    await createAccount({ name: "Justin", balance: initBalance });
    await createAccount({ name: "Wendy", balance: initBalance });
  });

  it("should handle deposit and withdraw concurrent transactions correctly", async () => {
    const depositPromises = [];
    const withdrawPromises = [];
    let times = 5;

    for (let i = 0; i < times; i++) {
      depositPromises.push(request(app).post(`${BASE_URL}/deposit`).send({ name: "Leo", amount: 100 }));
      withdrawPromises.push(request(app).post(`${BASE_URL}/withdraw`).send({ name: "May", amount: 50 }));
    }
    await Promise.all([...depositPromises, ...withdrawPromises]);

    expect((await findAccountByName("Leo")).balance).toBe(initBalance + 100 * times);
    expect((await findAccountByName("May")).balance).toBe(initBalance - 50 * times);
  });

  it("should handle transfer concurrent transactions correctly", async () => {
    const transferPromise = [];
    let times = 5;

    for (let i = 0; i < times; i++) {
      transferPromise.push(
        request(app).post(`${BASE_URL}/transfer`).send({ fromName: "Justin", toName: "Wendy", amount: 10 })
      );
    }
    await Promise.all(transferPromise);

    expect((await findAccountByName("Justin")).balance).toBe(initBalance - 10 * times);
    expect((await findAccountByName("Wendy")).balance).toBe(initBalance + 10 * times);
  });
});

afterAll(async () => {
  await db.sequelize.drop();
  await db.sequelize.close();
});
