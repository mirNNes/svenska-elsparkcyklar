// Repository for fakturor: CRUD och enkla statusuppdateringar
const Invoice = require("../models/Invoice");

async function getAllInvoices() {
  return await Invoice.find();
}

async function getInvoiceById(id) {
  return await Invoice.findOne({ id });
}

async function getInvoicesByUserId(userObjectId) {
  return await Invoice.find({ userId: userObjectId });
}

async function createInvoice({ userId, rideId, amount }) {
  const lastInvoice = await Invoice.findOne().sort({ id: -1 });
  const nextId = lastInvoice ? lastInvoice.id + 1 : 1;

  const invoice = new Invoice({
    id: nextId,
    userId,
    rideId,
    amount,
    status: "unpaid",
  });

  await invoice.save();
  return invoice;
}

async function markInvoicePaid(id) {
  return await Invoice.findOneAndUpdate(
    { id },
    { status: "paid", paidAt: new Date() },
    { new: true }
  );
}

module.exports = {
  getAllInvoices,
  getInvoiceById,
  getInvoicesByUserId,
  createInvoice,
  markInvoicePaid,
};
