"use strict";

const router = require("express").Router();
const Card = require("../db/card.js");

//ALLCARDS API ROUTE
router.get("/cards", async (req, res, next) => {
  try {
    const data = await Card.findAll();
    res.json(data);
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
