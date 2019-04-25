const express = require("express");
const os = require("os");

const app = express();

// body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("dist"));
app.use("/api", require("./api"));
// app.get("/api/getUsername", (req, res) =>
//   res.send({ username: os.userInfo().username })
// );
// app.get("/api/card", (req, res) => res.send({ card: 1234 }));

app.listen(process.env.PORT || 8080, () =>
  console.log(`Listening on port ${process.env.PORT || 8080}!`)
);

module.exports = app;
