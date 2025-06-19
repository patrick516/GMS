const express = require("express");
const router = express.Router();
const { getDebtors } = require("../controllers/debtorController");
const verifyToken = require("../middleware/verifyToken");


router.get("/", verifyToken, getDebtors);


module.exports = router;
