const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");

router.post("/", customerController.addCustomer);
router.put("/:id/pay", customerController.updateCustomerPayment);
router.get("/debtors", customerController.getDebtors);
router.get("/summary", customerController.getCustomerSummary);
router.get("/", customerController.getAllCustomers);

module.exports = router;
