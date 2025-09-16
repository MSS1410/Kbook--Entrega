import mongoose from 'mongoose'

const cartItemSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true
    },
    format: {
      type: String,
      required: true
    },
    label: {
      type: String // por ejemplo "Tapa Blanda"
    },
    price: {
      type: Number,
      required: true // snapshot del precio del formato en el momento
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    }
  },
  { _id: false }
)

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    items: [cartItemSchema]
  },
  { timestamps: true }
)

const Cart = mongoose.model('Cart', cartSchema)
export default Cart
