const { green, red } = require("chalk");
const { db, Card, Charge, Payment } = require("./src/server/db");

const cardData = [
  { accountNumber: 1234, APR: 0.35, creditLimit: 1000, balance: 0 },
  { accountNumber: 5678, APR: 0.35, creditLimit: 1000, balance: 0 }
];

const chargeData = [
  { accountNumber: 1234, amount: 500, date: 0, CardId: 1 },
  { accountNumber: 5678, amount: 500, date: 0, CardId: 2 },
  { accountNumber: 5678, amount: 100, date: 25, CardId: 2 }
];

const paymentData = [{ accountNumber: 5678, amount: 300, date: 15, CardId: 2 }];

const seed = async () => {
  try {
    await db.sync({ force: true });
    const cards = await Promise.all(cardData.map(card => Card.create(card)));
    const payments = await Promise.all(
      paymentData.map(payment => Payment.create(payment))
    );
    const charges = await Promise.all(
      chargeData.map(charge => Charge.create(charge))
    );
  } catch (err) {
    console.log(red(err));
  }
};

module.exports = seed;
// If this module is being required from another module, then we just export the
// function, to be used as necessary. But it will run right away if the module
// is executed directly (e.g. `node seed.js` or `npm run seed`)
if (require.main === module) {
  seed()
    .then(() => {
      console.log(green("Seeding success!"));
      db.close();
    })
    .catch(err => {
      console.error(red("Oh noes! Something went wrong!"));
      console.error(err);
      db.close();
    });
}
