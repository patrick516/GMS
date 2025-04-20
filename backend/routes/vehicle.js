const express = require("express");
const router = express.Router();

const vehicleController = require("../controllers/vehicleController");

router.post("/add", vehicleController.addVehicle);

router.get("/list", vehicleController.getVehicles);

router.get(
  "/customers-with-vehicles",
  vehicleController.getCustomersWithVehicles
);

module.exports = router;
