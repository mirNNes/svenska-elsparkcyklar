const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const userController = require("../controllers/userController");

const router = express.Router();

// CRUD-routes
router.get("/", requireAuth, userController.getAllUsers);
router.get("/:id", requireAuth, userController.getUserById);
router.post("/", requireAuth, userController.createUser);
router.put("/:id", requireAuth, userController.updateUser);
router.patch("/:id", requireAuth, userController.patchUser);
router.delete("/:id", requireAuth, userController.deleteUser);

module.exports = router;
