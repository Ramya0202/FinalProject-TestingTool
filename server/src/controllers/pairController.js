const pairsModel = require("../models/pairsModel");
const userModel = require("../models/userModel");

exports.addPairs = async (req, res) => {
  try {
    const { username, pairs, name } = req.body;

    const user = await userModel.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const pair = new pairsModel({
      userId: user._id,
      pairs: pairs,
      name: name,
    });

    await pair.save();

    res
      .status(201)
      .json({ message: "Pairs and name added successfully", pair: pair });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllPairs = async (req, res) => {
  try {
    const userId = req.params.userId;

    const pairs = await pairsModel.find({ userId: userId });

    res.status(200).json(pairs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
