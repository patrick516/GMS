const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");

router.post("/", customerController.addCustomer);
router.put("/:id/pay", customerController.updateCustomerPayment);
router.get("/debtors", customerController.getDebtors);

module.exports = router;
