const express = require("express");
const os = require("os");
const morgan = require("morgan");
const routes = require("./api");
const path = require("path");

const app = express();

// body parsing
// app.use(
//   morgan(":method :url :status :res[content-length] - :response-time ms")
// );
app.use(
  morgan("      ↓ received :method :url · responded :status :res[Content-Type]")
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("dist"));
app.use("/api", require("./api"));
app.use(express.static(path.join(__dirname, "public")));

// app.use("/", routes);

// app.get("/api/getUsername", (req, res) =>
//   res.send({ username: os.userInfo().username })
// );
// app.get("/api/card", (req, res) => res.send({ card: 1234 }));

app.listen(process.env.PORT || 8080, () =>
  console.log(`Listening on port ${process.env.PORT || 8080}!`)
);

module.exports = app;
