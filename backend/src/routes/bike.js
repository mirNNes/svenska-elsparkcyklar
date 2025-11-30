const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const bikeController = require("../controllers/bikeController");

const router = express.Router();

router.get("/", bikeController.getAllBikes);
router.get("/:id", bikeController.getBikeById);
router.post("/", requireAuth, bikeController.createBike);
router.delete("/:id", requireAuth, bikeController.deleteBike);

router.post("/rent/:bikeId/:userId", requireAuth, bikeController.startRent);
router.post("/rent-leave/:rentId", requireAuth, bikeController.endRent);

module.exports = router;
