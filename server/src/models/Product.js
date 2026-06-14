const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: { type: String, required: [true, 'Name is required'], trim: true },
    category: { type: String, required: [true, 'Category is required'], trim: true, index: true },
    price: { type: Number, required: [true, 'Price is required'], min: [0, 'Price cannot be negative'] },
    cost: { type: Number, default: 0, min: [0, 'Cost cannot be negative'] },
    stock: { type: Number, required: true, default: 0, min: [0, 'Stock cannot be negative'] },
    lowStockThreshold: { type: Number, default: 10, min: 0 },
    image: { type: String, default: '' },
  },
  { timestamps: true }
);

// Virtual flag so clients don't recompute low-stock logic.
productSchema.virtual('isLowStock').get(function isLowStock() {
  return this.stock <= this.lowStockThreshold;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
