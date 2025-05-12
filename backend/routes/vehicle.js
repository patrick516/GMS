const express = require("express");
const router = express.Router();

const vehicleController = require("../controllers/vehicleController");
const verifyToken = require("../middleware/verifyToken");

router.post("/add", verifyToken, vehicleController.addVehicle);
router.get("/list", verifyToken, vehicleController.getVehicles);
router.get("/completed", verifyToken, vehicleController.getCompletedVehicles);

router.get(
  "/customers-with-vehicles",
  verifyToken,
  vehicleController.getCustomersWithVehicles
);

router.patch(
  "/mark-done/:id",
  verifyToken,
  vehicleController.markVehicleAsDone
);
router.delete("/delete/:id", verifyToken, vehicleController.deleteVehicle);

module.exports = router;
