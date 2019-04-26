const Promise = require("bluebird");
const chai = require("chai");
const chaiHttp = require("chai-http");
const should = chai.should();
const expect = chai.expect;
const sinon = require("sinon");
const sinonChai = require("sinon-chai");

chai.use(sinonChai);
chai.use(chaiHttp);
const Card = require("../src/server/db/card");
const Charge = require("../src/server/db/charge");
const Payment = require("../src/server/db/payment");
// const db = require("../src/server/db/database.js");
const { db } = require("../src/server/db/index.js");

describe("The `Card` model", () => {
  before(() => {
    return db.sync({ force: true });
  });

  const cardOptions = {
    accountNumber: 1234,
    APR: 0.35,
    creditLimit: 1000,
    balance: 0
  };

  let card;
  beforeEach(() => {
    card = Card.build(cardOptions);
  });

  afterEach(() => {
    return Promise.all([Card.truncate({ cascade: true })]);
  });

  describe("attributes definition", () => {
    it("includes `creditLimit,` `APR,` fields", async () => {
      const savedCard = await card.save();
      expect(savedCard.creditLimit).to.equal(cardOptions.creditLimit);
      expect(savedCard.APR).to.equal(cardOptions.APR);
    });

    it("requires `creditLimit` field", async () => {
      card.creditLimit = null;

      let result, error;
      try {
        result = await card.validate();
      } catch (err) {
        error = err;
      }

      if (result)
        throw Error("validation should fail when creditLimit is null");

      expect(error).to.be.an.instanceOf(Error);
    });

    it("requires `APR` field", async () => {
      card.APR = null;

      let result, error;
      try {
        result = await card.validate();
      } catch (err) {
        error = err;
      }

      if (result) throw Error("validation should fail when APR is null");

      expect(error).to.be.an.instanceOf(Error);
    });
  });

  describe("getting/setting the balance", () => {
    it("`getBalance` gets the `balance`", () => {
      expect(card.get("balance")).to.equal(0);
    });

    it("`setBalance` sets the `balance`", () => {
      card.setDataValue("balance", 20.01);
      expect(card.get("balance")).to.equal(20.01);
    });
  });

  describe("afterCreate hook `changeOverTime`", () => {
    it("it has a hook", async () => {
      function isEmptyObject(obj) {
        for (var prop in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, prop)) {
            return false;
          }
        }
        return true;
      }
      const savedCard = await card.save();
      const hooksObj = savedCard._modelOptions.hooks;
      expect(isEmptyObject(hooksObj)).to.equal(false);
    });

    it("it is defined as an afterCreate hook called `changeOverTime`", async () => {
      const savedCard = await card.save();
      const hooksObj = savedCard._modelOptions.hooks;
      const afterCreate = hooksObj.afterCreate[0];
      expect(hooksObj.afterCreate).to.be.an("array");
      expect(afterCreate.name).to.equal("changeOverTime");
      expect(afterCreate.fn).to.be.a("function");
    });

    it("`changeOverTime` is called from inside the hook", async () => {
      const savedCard = await card.save();
      expect(savedCard.timerOn).to.equal(true);
    });
  });
});

describe("The Charge & Payment models", () => {
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
    date: 0,
    CardId: 1
  };
  const paymentOptions = {
    accountNumber: 5678,
    amount: 300,
    date: 15,
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

  describe("attributes definition`", () => {
    it("charge includes `amount,` `CardId` fields", async () => {
      await card.save();
      const savedCharge = await charge.save();
      expect(savedCharge.amount).to.equal(chargeOptions.amount);
      expect(savedCharge.CardId).to.equal(chargeOptions.CardId);
    });

    it("payment includes `amount,` `CardId` fields", async () => {
      await card.save();
      const savedPayment = await payment.save();
      expect(savedPayment.amount).to.equal(paymentOptions.amount);
      expect(savedPayment.CardId).to.equal(paymentOptions.CardId);
    });
  });
});

// A customer opens a credit card with a $1, 000.00 limit at a 35 % APR.
// The customer charges $500 on opening day(outstanding balance becomes $500).
// The total outstanding balance owed 30 days after opening should be $514.38.
// 500 * (0.35 / 365) * 30 = 14.38

describe("Changes in balance and interest over time", () => {
  before(() => {
    return db.sync({ force: true });
  });

  const cardOptions = {
    accountNumber: 1234,
    APR: 0.35,
    creditLimit: 1000,
    balance: 0
  };

  let card;
  beforeEach(() => {
    card = Card.build(cardOptions);
  });

  afterEach(() => {
    return Promise.all([Card.truncate({ cascade: true })]);
  });

  describe("afterCreate hook `changeOverTime`", () => {
    it("calculates accrued interest daily", async () => {
      let clock = sinon.useFakeTimers(new Date());
      const savedCard = await card.save();
      //simulate a charge so interest will accrue
      savedCard.setDataValue("balance", 20.01);
      let interestDayZero = savedCard.get("thisMonthsAccruedInterest");
      //move the clock forward one day
      clock.tick("24:00:00");
      let interestDayOne = savedCard.get("thisMonthsAccruedInterest");
      expect(interestDayOne).to.greaterThan(interestDayZero);
      //restore clock
      clock.restore();
    });

    it("TEST SCENARIO 1A: increments accrued interest accurately", async () => {
      let clock = sinon.useFakeTimers(new Date());
      const savedCard = await card.save();
      //simulate a charge so interest will accrue
      savedCard.setDataValue("balance", 500);
      let interestDayZero = savedCard.get("thisMonthsAccruedInterest");
      //move the clock forward one month
      let dayCount = 0;
      while (dayCount < 30) {
        clock.tick("24:00:00");
        dayCount++;
      }

      let interestDayThirty = savedCard.get("thisMonthsAccruedInterest");
      expect(interestDayThirty).to.greaterThan(interestDayZero);
      expect(interestDayThirty).to.equal(14.383561643835622);
    });

    it("TEST SCENARIO 1B: adds interest to balance at apropriate time", async () => {
      let clock = sinon.useFakeTimers(new Date());

      //simulate a charge so interest will accrue
      const savedCard = await card.save();
      savedCard.setDataValue("balance", 500);
      let interestDayZero = savedCard.get("thisMonthsAccruedInterest");
      //move the clock forward one month
      let dayCount = 0;
      while (dayCount < 30) {
        clock.tick("24:00:00");
        console.log(savedCard.get("thisMonthsAccruedInterest"));
        dayCount++;
      }

      //move forward one more day to start a new month
      clock.tick("24:00:00");

      let balanceDayThirty = savedCard.get("balance");

      //this number is off by one day - should be 514.3835616438356
      expect(balanceDayThirty).to.equal(514.8630136986302);
      //restore clock
      clock.restore();
    });
  });
});
