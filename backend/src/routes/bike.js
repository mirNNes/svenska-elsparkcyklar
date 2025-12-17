const express = require("express");
const bikeController = require("../controllers/bikeController");

const router = express.Router();

// GET /api/v1/bike
router.get("/", bikeController.getAllBikes);
router.get("/:id", bikeController.getBikeById);

// POST /api/v1/bike/rent/:bikeId/:userId
router.post("/rent/:bikeId/:userId", (req, res) => {
  res.json({ message: `Bike ${req.params.bikeId} rented by user ${req.params.userId}` });
});

// POST /api/v1/bike/rent-leave/:rentId
router.post("/rent-leave/:rentId", (req, res) => {
  res.json({ message: `Rent ${req.params.rentId} ended` });
});

module.exports = router;
