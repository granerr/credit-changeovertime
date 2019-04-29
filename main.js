"use strict";

const { db } = require("./src/server/db");
const app = require("./src/server/index.js");
const PORT = 1337;

db.sync().then(() => {
  console.log("db synced");
  app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
});
