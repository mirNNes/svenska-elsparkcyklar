const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const cityController = require("../controllers/cityController");

const router = express.Router();

router.get("/", cityController.getAllCities);
router.get("/:id", cityController.getCityById);
router.post("/", requireAuth, cityController.createCity);
router.put("/:id", requireAuth, cityController.replaceCity);
router.patch("/:id", requireAuth, cityController.updateCity);
router.delete("/:id", requireAuth, cityController.deleteCity);

module.exports = router;
