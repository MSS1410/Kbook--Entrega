import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    console.log(' OK to Mongo ✅ ')
  } catch (err) {
    console.error(' NOT OK to MongoDB ❌ :', err.message)
    process.exit(1)
  }
}

export default connectDB
