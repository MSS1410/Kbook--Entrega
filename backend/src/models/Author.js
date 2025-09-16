import mongoose from 'mongoose'

// Esquema del autor
const authorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre del autor es obligatorio']
    },
    biography: {
      type: String,
      default: ''
    },
    photo: {
      type: String, // URL a la foto del autor (Cloudinary o similar)
      default: ''
    },
    featured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
)

// Modelo
const Author = mongoose.model('Author', authorSchema)
export default Author
