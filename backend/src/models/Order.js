import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true
    },
    format: { type: String, required: true },
    label: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true }
  },
  { _id: false }
)

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: String,
      address: String,
      city: String,
      postalCode: String,
      country: String
    },
    paymentMethod: { type: String, default: 'placeholder' },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'paid', 'shipped', 'completed', 'cancelled'],
      default: 'pending'
    }
  },
  { timestamps: true }
)

const Order = mongoose.model('Order', orderSchema)
export default Order
