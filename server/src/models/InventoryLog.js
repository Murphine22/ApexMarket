const mongoose = require('mongoose');

const inventoryLogSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    sku: { type: String, required: true },
    name: { type: String, required: true },
    movementType: {
      type: String,
      enum: ['restock', 'sale', 'wastage', 'adjustment'],
      required: true,
    },
    quantity: { type: Number, required: true }, // negative for outflows
    note: { type: String, default: '' },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('InventoryLog', inventoryLogSchema);
