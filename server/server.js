const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const authRoutes = require("./src/routes/authRoutes.js");
const pairRoutes = require("./src/routes/pairRoutes.js");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

mongoose
  .connect("mongodb://127.0.0.1:27017/test_coverage", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Connection Error: ", err));

app.use(bodyParser.json());
app.use(cors());
app.use("/auth", authRoutes);
app.use("/pair", pairRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
