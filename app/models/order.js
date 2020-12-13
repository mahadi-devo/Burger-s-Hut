const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: {
      type: Object,
      required: true,
    },
    phone: {
      type: String,
      required: [true, 'Please add a phone number'],
      match: [/^([0-9]{1,10})$/, 'Please enter a valid phone number'],
    },
    address: {
      type: String,
      required: [true, 'Please add a phone number'],
    },
    paymentType: {
      type: String,
      default: 'COD',
    },
    status: {
      type: String,
      default: 'order_placed',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
