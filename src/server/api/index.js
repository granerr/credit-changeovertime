"use strict";

const router = require("express").Router();
const Card = require("../db/card.js");
const Charge = require("../db/charge.js");
const Payment = require("../db/payment.js");
const {
  calculateDays,
  balAfterCharge,
  balAfterPay
} = require("./calculations.js");

//ALLCARDS API ROUTE
router.get("/cards", async (req, res, next) => {
  try {
    const data = await Card.findAll({
      include: [{ all: true, nested: true }]
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

//SINGLECARD API ROUTE
router.get("/cards/:accountNumber", async (req, res, next) => {
  try {
    const accountNumber = req.params.accountNumber;
    const data = await Card.findOne({
      where: { accountNumber: accountNumber }
      // include: [{ model: Charge }, { model: Payment }]
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
});
//SINGLECARD API ROUTE
router.get("/cards/:cardId", async (req, res, next) => {
  try {
    const cardId = req.params.cardId;
    const data = await Card.findOne({
      where: { id: cardId },
      include: [{ model: Charge }, { model: Payment }]
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

//CREATE NEW CARD API ROUTE
router.post("/cards", async (req, res, next) => {
  try {
    const newCard = new Card(req.body);
    const savingCard = await newCard.save();
    res.json(savingCard);
  } catch (err) {
    next(err);
  }
});

//UPDATE CARD BALANCE API ROUTE
router.put("/cards/:accountNumber", async (req, res, next) => {
  try {
    const accountNumber = req.params.accountNumber;
    const foundCard = await Card.findOne({
      where: { accountNumber: accountNumber },
      include: [{ model: Charge }, { model: Payment }]
    });
    const updatedCard = await foundCard.update(req.body);
    res.json({
      message: "Updated successfully",
      card: updatedCard
    });
  } catch (err) {
    next(err);
  }
});

//CREATE NEW CHARGE API ROUTE
router.post("/charges", async (req, res, next) => {
  try {
    const newCharge = new Charge(req.body);
    const savingCharge = await newCharge.save();
    //use accountNumber to find card
    const data = await Card.findOne({
      where: { accountNumber: req.body.accountNumber },
      include: [{ model: Charge }, { model: Payment }]
    });
    //put together body obj for balaftercharge
    // console.log(data);
    let balAfterChargeObj = {
      beginDate: data.createdAt,
      todaysDate: new Date(),
      oldBalanceOwed: data.balance,
      chargeAmt: req.body.amount,
      accruedInterest: data.thisMonthsAccruedInterest
    };
    //calculate new balance after charge
    const newBal = balAfterCharge(balAfterChargeObj);
    //put new balance to card
    const updateBody = {
      balance: newBal,
      dayCount: 0
    };
    const updatedCard = await data.update(updateBody);
    res.json({
      message: "Updated successfully",
      card: updatedCard,
      newCharge: savingCharge
    });
  } catch (err) {
    next(err);
  }
});

//CREATE NEW PAYMENT API ROUTE
router.post("/payments", async (req, res, next) => {
  try {
    const newPayment = new Payment(req.body);
    const savingPayment = await newPayment.save();
    //use accountNumber to find card
    const data = await Card.findOne({
      where: { accountNumber: req.body.accountNumber },
      include: [{ model: Charge }, { model: Payment }]
    });
    //put together body obj for balaftercharge
    let balAfterPayObj = {
      beginDate: data.createdAt,
      todaysDate: new Date(),
      oldBalanceOwed: data.balance,
      payAmt: req.body.amount,
      accruedInterest: data.thisMonthsAccruedInterest
    };
    //calculate new balance after charge
    const newBal = balAfterPay(balAfterPayObj);
    //put new balance to card
    const updateBody = {
      balance: newBal,
      dayCount: 0
    };
    const updatedCard = await data.update(updateBody);
    res.json({
      message: "Updated successfully",
      card: updatedCard,
      newPayment: savingPayment
    });
  } catch (err) {
    next(err);
  }
});

router.use((req, res, next) => {
  const err = new Error("API route not found!");
  err.status = 404;
  next(err);
});

module.exports = router;
