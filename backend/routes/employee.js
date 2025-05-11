const express = require("express");
const router = express.Router();
const {
  addEmployee,
  getEmployees,
} = require("../controllers/employeeController");

const verifyToken = require("../middleware/verifyToken");
const isAdmin = require("../middleware/isAdmin");

router.post("/add", verifyToken, isAdmin, addEmployee);
router.get("/", verifyToken, getEmployees); // optional: restrict to logged-in users

module.exports = router;
