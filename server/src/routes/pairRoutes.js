const express = require("express");
const pairController = require("../controllers/pairController");

const router = express.Router();

router.post("/new-pair", pairController.addPairs);
router.get("/get/:userId", pairController.getAllPairs);

module.exports = router;
