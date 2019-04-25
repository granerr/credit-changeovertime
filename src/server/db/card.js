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
  }
});

Card.prototype.changeOverTime = function() {
  // Interest is calculated daily, starting the day after the account is opened, at the close of each day.
  // Calculated interest becomes due at the close every 30 days after the account has been opened.

  // checks if one day has passed.
  function hasOneDayPassed() {
    console.log("run hasonedaypassed");
    // get today's date
    const date = new Date();
    // inferring a day has yet to pass since both dates are equal.
    if (this.savedDate == date) return false;
    // this portion of logic occurs when a day has passed
    return true;
  }

  function haveThirtyDaysPassed() {
    console.log("run havethirtydayspassed");
    if (this.dayCount != 30) {
      return false;
    }
    return true;
  }

  // some function which should run once a day
  function runOncePerDay() {
    console.log("run runonceperday");

    if (!hasOneDayPassed()) {
      console.log("less than a day has passed");
      return false;
    }
    alert("Good evening! A day has passed so we're updating accrued interest.");
    //save today's date
    this.savedDate = new Date();

    //update accrued interest
    //balance * (APR / 365)
    const newInterest = this.balance * (this.APR / 365);
    this.thisMonthsAccruedInterest += newInterest;

    //if 30 days haven't passed increment daycount
    if (!haveThirtyDaysPassed()) {
      this.dayCount++;
      return false;
    }
    //if 30 days have passed:
    //add accr interest to total balance
    this.balance += this.thisMonthsAccruedInterest;
    //reset daycount and accr interest
    this.dayCount = 0;
    this.thisMonthsAccruedInterest = 0.0;
  }

  var dayInMilliseconds = 1000 * 60 * 60 * 24;
  setInterval(function() {
    runOncePerDay();
  }, dayInMilliseconds);
  console.log("run setinterval");
};

module.exports = Card;
