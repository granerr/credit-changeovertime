const db = require("./database");
const Card = require("./card");
const Charge = require("./charge");
const Payment = require("./payment");

Charge.belongsTo(Card);
Payment.belongsTo(Card);
Card.hasMany(Charge);
Card.hasMany(Payment);

module.exports = {
  db,
  Card,
  Charge,
  Payment
};
