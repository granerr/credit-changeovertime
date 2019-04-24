// The purpose of this module is to bring your Sequelize instance (`db`) together
// with your models, for which you'll find some blank files in this directory:

const db = require("./database");
const Card = require("./card");

// This is a great place to establish associations between your models
// (https://sequelize-guides.netlify.com/association-types/).
// Example:
//
// Puppy.belongsTo(Owner)

// Robots may be associated with many projects.Likewise, projects may be associated with many robots.

module.exports = {
  // Include your models in this exports object as well!
  db,
  Card
};
