const mongoose = require("mongoose");

const pairSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  pairs: [[Number]],
  name: String,
});
module.exports = mongoose.model("Pair", pairSchema);
