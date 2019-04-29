//DIFFERENCE BETWEEN DAYS
const calculateDays = (beginDate, todaysDate) => {
  const diffTime = Math.abs(beginDate.getTime() - todaysDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const balAfterCharge = obj => {
  let {
    beginDate,
    todaysDate,
    oldBalanceOwed,
    chargeAmt,
    accruedInterest
  } = obj;
  // const diffDays = calculateDays(beginDate, todaysDate);
  const newBalOwed = (oldBalanceOwed += chargeAmt);
  return newBalOwed;
};

const balAfterPay = obj => {
  let { beginDate, todaysDate, oldBalanceOwed, payAmt, accruedInterest } = obj;
  // const diffDays = calculateDays(beginDate, todaysDate);
  const newBalOwed = (oldBalanceOwed -= payAmt);
  return newBalOwed;
};

const addToDate = (num, dateArg) => {
  dateArg.setDate(date.getDate() + num);
  const newDate = date.addDays(5);
  alert(newDate);
  return newDate;
};

module.exports = {
  calculateDays,
  balAfterCharge,
  balAfterPay
};
