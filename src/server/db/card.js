const Sequelize = require("sequelize");
const db = require("./database");

const Card = db.define("Card", {
  accountNumber: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  APR: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  creditLimit: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  balance: {
    type: Sequelize.FLOAT,
    defaultValue: 0.0,
    allowNull: false
  },
  thisMonthsAccruedInterest: {
    type: Sequelize.DOUBLE,
    defaultValue: 0.0,
    allowNull: false
  },
  dayCount: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  savedDate: {
    type: Sequelize.DATE,
    defaultValue: new Date()
  },
  timerOn: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
});

Card.addHook("afterCreate", "changeOverTime", (card, options) => {
  // Interest is calculated daily, starting the day after the account is opened, at the close of each day.
  // Calculated interest becomes due at the close every 30 days after the account has been opened.

  // checks if one day has passed.
  function hasOneDayPassed() {
    // get today's date
    const date = new Date();
    // inferring a day has yet to pass since both dates are equal.
    if (card.savedDate === date) return false;
    // this portion of logic occurs when a day has passed
    return true;
  }

  function haveThirtyDaysPassed() {
    if (card.dayCount < 30) {
      return false;
    }
    return true;
  }

  // some function which should run once a day
  function runOncePerDay() {
    if (!hasOneDayPassed()) {
      return false;
    }

    //save today's date
    card.savedDate = new Date();
    //update accrued interest
    //balance * (APR / 365)
    const newInterest = card.balance * (card.APR / 365);
    card.thisMonthsAccruedInterest += newInterest;

    //if 30 days haven't passed increment daycount
    if (!haveThirtyDaysPassed()) {
      card.dayCount++;
      return "30 days have not passed";
    }
    //if 30 days have passed:
    //add accr interest to total balance
    card.balance += card.thisMonthsAccruedInterest;
    //reset daycount and accr interest
    card.dayCount = 0;
    card.thisMonthsAccruedInterest = 0.0;
    return "it is a new month";
  }

  var dayInMilliseconds = 1000 * 60 * 60 * 24;
  setInterval(function() {
    runOncePerDay();
  }, dayInMilliseconds);
  card.timerOn = true;
});

module.exports = Card;
