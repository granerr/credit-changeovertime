const Sequelize = require("sequelize");
const db = require("./database");
// const db = require("./index.js");

const Card = db.define("Card", {
  accountNumber: {
    type: Sequelize.INTEGER
  }
});

module.exports = Card;
