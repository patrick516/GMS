const express = require("express");
const router = express.Router();
const { getDebtors } = require("../controllers/debtorController");

router.get("/", getDebtors);

module.exports = router;
