import mongoose from 'mongoose'

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'El título es obligatorio']
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Author',
      required: [true, 'El autor es obligatorio']
    },
    synopsis: {
      type: String,
      required: [true, 'La sinopsis es obligatoria']
    },
    coverImage: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Ciencia Ficción',
        'Aventuras',
        'Historia',
        'Psicologia',
        'Infantiles',
        'Ciencia',
        'Natura'
      ]
    },
    // Formatos sin isPreOrder
    formats: [
      {
        type: {
          type: String,
          enum: ['TapaBlanda', 'TapaDura', 'Ebook'],
          required: true
        },
        label: {
          type: String,
          default: function () {
            return this.type === 'TapaBlanda'
              ? 'Tapa Blanda'
              : this.type === 'TapaDura'
              ? 'Tapa Dura'
              : 'Ebook'
          }
        },
        price: {
          type: Number,
          required: [true, 'El precio es obligatorio'],
          min: [0, 'El precio no puede ser negativo']
        }
      }
    ],
    featured: {
      type: Boolean, // URL a la foto del autor (Cloudinary o similar)
      default: false
    },
    soldCount: {
      type: Number, // URL a la foto del autor (Cloudinary o similar)
      default: 0
    }
  },
  {
    timestamps: true
  }
)

const Book = mongoose.model('Book', bookSchema)
export default Book
