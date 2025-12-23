const invoiceRepository = require("../repositories/invoiceRepository");
const userRepository = require("../repositories/userRepository");

// GET /invoice - lista alla fakturor
async function getAllInvoices(req, res) {
  const invoices = await invoiceRepository.getAllInvoices();
  res.json(invoices);
}

// GET /invoice/:id - hämta faktura
async function getInvoiceById(req, res) {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "Ogiltigt invoiceId" });
  const invoice = await invoiceRepository.getInvoiceById(id);
  if (!invoice) return res.status(404).json({ error: "Invoice not found" });
  res.json(invoice);
}

// GET /invoice/user/:userId - lista fakturor för user
async function getInvoicesByUser(req, res) {
  const userId = Number.parseInt(req.params.userId, 10);
  if (!Number.isInteger(userId)) return res.status(400).json({ error: "Ogiltigt userId" });
  const user = await userRepository.getUserById(userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  const invoices = await invoiceRepository.getInvoicesByUserId(user._id);
  res.json(invoices);
}

// GET /invoice/me - lista fakturor för inloggad användare
async function getMyInvoices(req, res) {
  const userObjectId = req.user?.id;
  if (!userObjectId) return res.status(401).json({ error: "Unauthorized" });

  const user = await userRepository.getUserByObjectId(userObjectId);
  if (!user) return res.status(404).json({ error: "User not found" });

  const invoices = await invoiceRepository.getInvoicesByUserId(user._id);
  res.json(invoices);
}

// POST /invoice/:id/pay - markera som betald om saldo räcker
async function payInvoice(req, res) {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "Ogiltigt invoiceId" });

  const invoice = await invoiceRepository.getInvoiceById(id);
  if (!invoice) return res.status(404).json({ error: "Invoice not found" });
  if (invoice.status === "paid") return res.status(400).json({ error: "Invoice already paid" });

  const user = await userRepository.getUserByObjectId(invoice.userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  if (!Number.isFinite(user.balance) || user.balance < invoice.amount) {
    return res.status(400).json({ error: "Insufficient balance" });
  }

  const newBalance = Math.round((user.balance - invoice.amount) * 100) / 100;
  const updatedUser = await userRepository.updateBalanceByObjectId(user._id, newBalance);
  const paidInvoice = await invoiceRepository.markInvoicePaid(id);

  res.json({ invoice: paidInvoice, user: updatedUser });
}

module.exports = {
  getAllInvoices,
  getInvoiceById,
  getInvoicesByUser,
  getMyInvoices,
  payInvoice,
};
