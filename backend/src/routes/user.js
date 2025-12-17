const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/requireAuth");
const userController = require("../controllers/userController");

const router = express.Router();

// CRUD-routes – kräver admin
router.get("/", requireAuth, requireRole("admin"), userController.getAllUsers);
router.get("/:id", requireAuth, requireRole("admin"), userController.getUserById);
router.post("/", requireAuth, requireRole("admin"), userController.createUser);
router.put("/:id", requireAuth, requireRole("admin"), userController.updateUser);
router.patch("/:id", requireAuth, requireRole("admin"), userController.patchUser);
router.delete("/:id", requireAuth, requireRole("admin"), userController.deleteUser);

module.exports = router;
