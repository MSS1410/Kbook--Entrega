import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
  {
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Puede venir de admin o de user (exactamente uno)
    fromAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    read: { type: Boolean, default: false },

    subject: { type: String, required: true },
    body: { type: String, required: true },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
)

messageSchema.pre('save', function (next) {
  const hasAdmin = !!this.fromAdmin
  const hasUser = !!this.fromUser
  if ((hasAdmin && hasUser) || (!hasAdmin && !hasUser)) {
    return next(
      new Error('El mensaje debe tener fromAdmin o fromUser (uno solo)')
    )
  }
  next()
})

const Message = mongoose.model('Message', messageSchema)
export default Message
