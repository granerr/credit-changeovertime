const expect = require("chai").expect;
const request = require("supertest");
const app = require("../src/server");
const agent = request.agent(app);

const Card = require("../src/server/db/card");
const Charge = require("../src/server/db/charge");
const Payment = require("../src/server/db/payment");
// const db = require("../src/server/db/database.js");
const { db } = require("../src/server/db/index.js");

describe("Cards Route:", () => {
  before(() => {
    return db.sync({
      force: true
    });
  });

  afterEach(() => {
    return Promise.all([
      Card.truncate({
        cascade: true
      }),
      Charge.truncate({
        cascade: true
      }),
      Payment.truncate({
        cascade: true
      })
    ]);
  });

  describe("GET /cards", () => {
    it("responds with an array via JSON", async () => {
      const res = await agent
        .get("/api/cards")
        .expect("Content-Type", /json/)
        .expect(200);
      // res.body is the JSON return object
      expect(res.body).to.be.an.instanceOf(Array);
      expect(res.body).to.have.length(0);
    });

    it("returns a card if there is one in the DB", async () => {
      await Card.create({
        accountNumber: 1234,
        APR: 0.35,
        creditLimit: 1000,
        balance: 0
      });

      const res = await agent.get("/api/cards").expect(200);

      expect(res.body).to.be.an.instanceOf(Array);
      expect(res.body[0].APR).to.equal(0.35);
    });

    it("returns a card with charges there is one in the DB", async () => {
      await Card.create({
        accountNumber: 1234,
        APR: 0.35,
        creditLimit: 1000,
        balance: 0
      });
      await Charge.create({
        accountNumber: 1234,
        amount: 500,
        date: 0,
        CardId: 1
      });

      const res = await agent.get("/api/cards").expect(200);

      expect(res.body).to.be.an.instanceOf(Array);
      expect(res.body[0].charges).to.be.an.instanceOf(Array);
    });

    it("returns another card if there is one in the DB", async () => {
      await Card.create({
        accountNumber: 1234,
        APR: 0.35,
        creditLimit: 1000,
        balance: 0
      });
      await Card.create({
        accountNumber: 5678,
        APR: 0.35,
        creditLimit: 1000,
        balance: 0
      });

      const res = await agent.get("/api/cards").expect(200);

      expect(res.body).to.be.an.instanceOf(Array);
      expect(res.body[0].creditLimit).to.equal(1000);
      expect(res.body[1].creditLimit).to.equal(1000);
    });
  });

  describe("GET /cards/:accountNumber", () => {
    let newCard;

    beforeEach(async () => {
      const creatingCards = [
        { accountNumber: 1234, APR: 0.35, creditLimit: 800, balance: 0 },
        { accountNumber: 5678, APR: 0.35, creditLimit: 1000, balance: 0 }
      ].map(data => Card.create(data));

      const createdCards = await Promise.all(creatingCards);
      newCard = createdCards[0];
    });

    it("returns the JSON of the card based on the account number (not id)", async () => {
      const res = await agent
        .get("/api/cards/" + newCard.accountNumber)
        .expect(200);

      if (typeof res.body === "string") {
        res.body = JSON.parse(res.body);
      }
      expect(res.body.creditLimit).to.equal(800);
    });

    /**
     * Here we pass in a bad ID to the URL, we should get a 404 error
     */
    it("returns a 404 error if the ID is not correct", () => {
      return agent.get("/articles/76142896").expect(404);
    });
  });
});
