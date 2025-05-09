const express = require("express");
const router = express.Router();

const vehicleController = require("../controllers/vehicleController");

router.post("/add", vehicleController.addVehicle);
router.get("/list", vehicleController.getVehicles);
router.get("/completed", vehicleController.getCompletedVehicles);

router.get(
  "/customers-with-vehicles",
  vehicleController.getCustomersWithVehicles
);

router.patch("/mark-done/:id", vehicleController.markVehicleAsDone);
router.delete("/delete/:id", vehicleController.deleteVehicle);

module.exports = router;
