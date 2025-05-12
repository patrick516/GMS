const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const verifyToken = require("../middleware/verifyToken");

router.post("/", verifyToken, customerController.addCustomer);
router.put("/:id/pay", verifyToken, customerController.updateCustomerPayment);
router.get("/debtors", verifyToken, customerController.getDebtors);
router.get("/summary", verifyToken, customerController.getCustomerSummary);
router.get("/frequent", verifyToken, customerController.getFrequentCustomers);
router.get("/", verifyToken, customerController.getAllCustomers);

module.exports = router;
