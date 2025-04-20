const express = require("express");
const router = express.Router();
const {
  addEmployee,
  getEmployees,
} = require("../controllers/employeeController");

router.post("/add", addEmployee);
router.get("/", getEmployees);

module.exports = router;
