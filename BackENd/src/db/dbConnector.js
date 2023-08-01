const mongoose = require("mongoose");
const { environment } = require("../config/config");
const env = process.env.NODE_ENV || "development";
const { articleSchema } = require("./schema/articleSchema.js");
const { userSchema } = require("./schema/userSchema.js");

/**
 * Mongoose Connection
 **/

mongoose.connect(environment[env].dbString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let db = mongoose.connection;

db.on("open", () => {
  console.log("Connected to DB");
});
db.on("error", () => {
  console.error("Error while connecting to DB");
});

const Articles = mongoose.model("Articles", articleSchema);
const Users = mongoose.model("Users", userSchema);

export { Articles, Users };
