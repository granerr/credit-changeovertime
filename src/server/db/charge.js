const Sequelize = require("sequelize");
const db = require("./database");
// const db = require("./index.js");

const Charge = db.define("Charge", {
  accountNumber: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  amount: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  CardId: {
    type: Sequelize.INTEGER,
    allowNull: false
  }
});

module.exports = Charge;
