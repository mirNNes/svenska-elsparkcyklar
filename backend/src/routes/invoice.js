const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/requireAuth");
const invoiceController = require("../controllers/invoiceController");

const router = express.Router();

// Lista fakturor (admin)
router.get("/", requireAuth, requireRole("admin"), invoiceController.getAllInvoices);
router.get("/user/:userId", requireAuth, requireRole("admin"), invoiceController.getInvoicesByUser);
router.get("/:id", requireAuth, requireRole("admin"), invoiceController.getInvoiceById);

// Betala faktura (admin)
router.post("/:id/pay", requireAuth, requireRole("admin"), invoiceController.payInvoice);

module.exports = router;
