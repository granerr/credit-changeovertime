const expect = require("chai").expect;
const request = require("supertest");
const app = require("../src/server");
const agent = request.agent(app);
const seed = require("../seed");
const async = require("async");
const Card = require("../src/server/db/card");
const Charge = require("../src/server/db/charge");
const Payment = require("../src/server/db/payment");
// const db = require("../src/server/db/database.js");
const { db } = require("../src/server/db/index.js");

describe("Cards Route:", () => {
  before(() => {
    return db.sync({ force: true });
  });

  const cardOptions = {
    accountNumber: 1234,
    APR: 0.35,
    creditLimit: 1000,
    balance: 0
  };
  const chargeOptions = {
    accountNumber: 1234,
    amount: 500,
    CardId: 1
  };
  const paymentOptions = {
    accountNumber: 5678,
    amount: 300,
    CardId: 2
  };

  let charge;
  let payment;
  let card;

  beforeEach(() => {
    card = Card.build(cardOptions);
    charge = Charge.build(chargeOptions);
    payment = Payment.build(paymentOptions);
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
      expect(res.body).to.be.an.instanceOf(Array);
      expect(res.body).to.have.length(0);
    });

    it("returns a card if there is one in the DB", async () => {
      await card.save();
      const res = await agent.get("/api/cards").expect(200);
      expect(res.body).to.be.an.instanceOf(Array);
      expect(res.body[0].APR).to.equal(0.35);
    });

    it("returns a card with charges there is one in the DB", function(done) {
      async.series(
        [
          function(cb) {
            card.save();
          },
          function(cb) {
            charge.save();
          },
          function(cb) {
            agent
              .get("/api/cards")
              .expect(200, cb)
              .expect(res.body[0].Charges)
              .to.be.an.instanceOf(Array)
              .expect(res.body[0].Charges.length)
              .to.equal(2);
          }
        ],
        done()
      );
    });

    it("returns another card if there is one in the DB", async () => {
      const secondCardBuild = Card.build({
        accountNumber: 5678,
        APR: 0.35,
        creditLimit: 1000,
        balance: 0
      });
      const firstCard = await card.save();
      const secondCard = await secondCardBuild.save();
      const res = await agent.get("/api/cards").expect(200);
      expect(res.body).to.be.an.instanceOf(Array);
      expect(res.body[0].creditLimit).to.equal(1000);
      expect(res.body[1].creditLimit).to.equal(1000);
    });
  });

  describe("GET /cards/:accountNumber", () => {
    it("returns the JSON of the card based on the account number (not id)", async () => {
      const newCard = await card.save();
      const res = await agent
        .get("/api/cards/" + newCard.accountNumber)
        .expect(200);
      if (typeof res.body === "string") {
        res.body = JSON.parse(res.body);
      }
      expect(res.body.creditLimit).to.equal(1000);
    });
    // it("returns a 404 error if the ID is not correct", () => {
    //   const fakeId = 8889;
    //   return agent.get(`/api/cards/${fakeId}`).expect(404);
    // });
  });

  describe("POST /cards", () => {
    it("creates a new card/account", async () => {
      const res = await agent
        .post("/api/cards")
        .send({
          accountNumber: 2579,
          APR: 0.35,
          creditLimit: 750,
          balance: 0
        })
        .expect(200);
      expect(res.body.id).to.not.be.an("undefined");
      expect(res.body.accountNumber).to.equal(2579);
    });
  });
});

describe("Charges and Payments Routes:", () => {
  before(() => {
    return db.sync({ force: true });
  });

  const cardOptions = {
    accountNumber: 1234,
    APR: 0.35,
    creditLimit: 1000,
    balance: 0
  };
  const chargeOptions = {
    accountNumber: 1234,
    amount: 500,
    CardId: 1
  };
  const paymentOptions = {
    accountNumber: 5678,
    amount: 300,
    CardId: 2
  };

  let charge;
  let payment;
  let card;

  beforeEach(() => {
    card = Card.build(cardOptions);
    charge = Charge.build(chargeOptions);
    payment = Payment.build(paymentOptions);
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

  describe("GET /charges", () => {
    it("responds with an array via JSON", async () => {
      const res = await agent
        .get("/api/charges")
        .send({
          accountNumber: 1234
        })
        .expect("Content-Type", /json/)
        .expect(200);
      expect(res.body).to.be.an.instanceOf(Array);
      expect(res.body).to.have.length(0);
    });

    it("returns a charge if there is one in the DB", function(done) {
      async.series(
        [
          function(cb) {
            card.save();
          },
          function(cb) {
            charge.save();
          },
          function(cb) {
            agent
              .get("/api/charges")
              .send({
                accountNumber: 1234
              })
              .expect(200, cb)
              .expect(res.body)
              .to.be.an.instanceOf(Array)
              .expect(res.body.length)
              .to.equal(1);
          }
        ],
        done()
      );
    });
  });

  describe("POST /charges", () => {
    it("posts new charge", function(done) {
      async.series(
        [
          function(cb) {
            card.save();
          },
          function(cb) {
            agent
              .post("/api/charges")
              .send({
                accountNumber: 1234,
                amount: 500,
                CardId: 1
              })
              .expect("Content-Type", /json/)
              .expect(200)
              .expect(res.body)
              .to.be.an.instanceOf(Array)
              .expect(res.body.message)
              .to.equal("Updated successfully");
          }
        ],
        done()
      );
    });
  });

  describe("GET /payments", () => {
    it("responds with an array via JSON", async () => {
      const res = await agent
        .get("/api/payments")
        .send({
          accountNumber: 1234
        })
        .expect("Content-Type", /json/)
        .expect(200);
      expect(res.body).to.be.an.instanceOf(Array);
      expect(res.body).to.have.length(0);
    });

    it("returns a payment if there is one in the DB", function(done) {
      async.series(
        [
          function(cb) {
            card.save();
          },
          function(cb) {
            payment.save();
          },
          function(cb) {
            agent
              .get("/api/payments")
              .send({
                accountNumber: 1234
              })
              .expect(200, cb)
              .expect(res.body)
              .to.be.an.instanceOf(Array)
              .expect(res.body.length)
              .to.equal(1);
          }
        ],
        done()
      );
    });
  });

  describe("POST /payments", () => {
    it("posts new payment", function(done) {
      async.series(
        [
          function(cb) {
            card.save();
          },
          function(cb) {
            agent
              .post("/api/payments")
              .send({
                accountNumber: 1234,
                amount: 500,
                CardId: 1
              })
              .expect("Content-Type", /json/)
              .expect(200)
              .expect(res.body)
              .to.be.an.instanceOf(Array)
              .expect(res.body.message)
              .to.equal("Updated successfully");
          }
        ],
        done()
      );
    });
  });
});
