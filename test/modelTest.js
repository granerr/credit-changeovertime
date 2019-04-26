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

  const paymentOptions = {
    accountNumber: 5678,
    amount: 300,
    date: 15,
    CardId: 2
  };

  let card;
  beforeEach(() => {
    card = Card.build(cardOptions);
    charge = Charge.build(chargeOptions);
  });

  afterEach(() => {
    Promise.all([Card.truncate({ cascade: true })]);
    Promise.all([Charge.truncate({ cascade: true })]);
  });
  const chargeOptions = {
    accountNumber: 1234,
    amount: 500,
    date: 0,
    CardId: 1
  };

  let charge;
  describe("attributes definition`", () => {
    it("charge includes `amount,` `CardId` fields", async () => {
      const savedCharge = await Charge.build(chargeOptions).save();
      expect(savedCharge.amount).to.equal(chargeOptions.amount);
      expect(savedCharge.CardId).to.equal(chargeOptions.CardId);
    });

    it("includes `amount,` `CardId` fields", async () => {
      const savedPayment = await Payment.build(paymentOptions).save();
      expect(savedPayment.amount).to.equal(paymentOptions.amount);
      expect(savedPayment.CardId).to.equal(paymentOptions.CardId);
    });

    // it("increases `balance` on associated card", async () => {
    //   let savedCard = await card.save();
    //   let savedVal = savedCard.dataValues;
    //   console.log(savedVal);
    //   let savedCharge = await charge.save();
    //   console.log(savedCharge.dataValues);
    //   console.log(await Card.findByPk(1));

    //   // let origBalance;
    //   // let savedCharge;
    //   // let newBalance;
    //   // let savedCard;
    //   // let obj = {};
    //   // Card.build(cardOptions)
    //   //   .save()
    //   //   .then(function(result) {
    //   //     obj.origBalance = result.get("balance");
    //   //     obj.savedCard = result;
    //   //     return obj;
    //   //   })
    //   //   .then(function(result) {
    //   //     result.savedCharge = Charge.build(chargeOptions).save();
    //   //     return result;
    //   //   })
    //   //   .then(function(result) {
    //   //     result.newBalance = Card.findByPk(1);
    //   //     return result;
    //   //   })
    //   //   .then(function(result) {
    //   //     console.log(result);
    //   //   });
    // });

    // it("increments accrued interest accurately", async () => {
    //   let clock = sinon.useFakeTimers(new Date());
    //   const savedCard = await card.save();
    //   //simulate a charge so interest will accrue
    //   savedCard.setDataValue("balance", 20.01);
    //   let interestDayZero = savedCard.get("thisMonthsAccruedInterest");
    //   //move the clock forward one day
    //   clock.tick("24:00:00");
    //   let interestDayOne = savedCard.get("thisMonthsAccruedInterest");
    //   expect(interestDayOne).to.greaterThan(interestDayZero);
    //   //restore clock
    //   clock.restore();
    // });
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

    it("increments accrued interest accurately", async () => {
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
  });
});
