// multipart formats.js
// conecto a mongo, borra Author Y Book. Lee Data/books.csv y  crea authors con libros y formatos.
import fs from 'fs'
import path from 'path'
import csv from 'csv-parser'
import dotenv from 'dotenv'
import axios from 'axios'

import connectDB from '../config/db.js'
import Author from '../models/Author.js'
import Book from '../models/Book.js'
import User from '../models/User.js'

dotenv.config()

//  para no repetir llamadas de un mismo autor
const authorMetaCache = new Map()

/**
 en OpenLibrary por nombre de autor y devuelve bio photo:
  - photo: URL de la foto o string vacio.
  -bio: bio completa o string vacío
 */
async function getAuthorMetaByName(name) {
  const key = name.trim().toLowerCase()
  if (authorMetaCache.has(key)) return authorMetaCache.get(key)

  const empty = { bio: '', photo: '' }

  try {
    // Buscar autor por nombre
    const s = await axios.get('https://openlibrary.org/search/authors.json', {
      params: { q: name }
    })
    const doc = s.data?.docs?.[0]
    if (!doc || !doc.key) {
      authorMetaCache.set(key, empty)
      return empty
    }

    // doc.key viene como "OL23919A"
    const olid = doc.key
    // detalle del autor
    const d = await axios.get(`https://openlibrary.org/authors/${olid}.json`)

    let bioRaw = d.data?.bio
    const bio =
      typeof bioRaw === 'string' ? bioRaw : bioRaw?.value ? bioRaw.value : ''

    // foto de autor por OLID , si la hay
    const photo = olid
      ? `https://covers.openlibrary.org/a/olid/${olid}-M.jpg`
      : ''

    const result = { bio, photo }
    authorMetaCache.set(key, result)
    return result
  } catch (err) {
    console.warn('OpenLibrary meta falló para', name, err?.message)
    authorMetaCache.set(key, empty)
    return empty
  }
}

async function seed() {
  await connectDB()
  console.log('✅ Conectado a MongoDB para seeding')

  // limpiamos todo
  await Author.deleteMany()
  await Book.deleteMany()
  console.log('🗑️  Colecciones limpiadas')

  // Leer CSV
  const filePath = path.join(process.cwd(), 'data', 'books.csv')
  if (!fs.existsSync(filePath)) {
    throw new Error(`No se encontró el CSV en ${filePath}`)
  }

  const rows = []
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => rows.push(row))
    .on('end', async () => {
      console.log(`✅ ${rows.length} registros leídos de books.csv`)

      const authorsMap = new Map() // name a authorId
      let count = 0

      for (const {
        title,
        authorName,
        synopsis,
        category,
        price,
        stock,
        coverImageUrl
      } of rows) {
        const name = (authorName || 'Desconocido').trim()
        let authorId

        if (authorsMap.has(name)) {
          authorId = authorsMap.get(name)
        } else {
          // alimentamos a author por nombre
          const meta = await getAuthorMetaByName(name)

          const a = await Author.create({
            name,
            biography: meta.bio || '',
            photo: meta.photo || '' // si viene empty, NO mostraremos ese autor en el front
          })
          authorId = a._id
          authorsMap.set(name, authorId)
        }

        const basePrice = parseFloat(price)
        const baseStock = parseInt(stock, 10)

        const formats = [
          { type: 'TapaBlanda', price: basePrice, stock: baseStock },
          {
            type: 'TapaDura',
            price: +(basePrice * 1.2).toFixed(2),
            stock: Math.max(0, baseStock - 5)
          },
          { type: 'Ebook', price: +(basePrice * 0.6).toFixed(2), stock: 9999 }
        ]

        await Book.create({
          title,
          author: authorId,
          synopsis,
          category,
          coverImage: coverImageUrl,
          formats
        })
        count++
      }

      console.log(
        `✅ ${count} libros insertados y ${authorsMap.size} autores creados`
      )

      // Admin
      const adminEmail = 'kbookhelp@kbook.com'
      if (!(await User.findOne({ email: adminEmail }))) {
        await User.create({
          name: 'KBOOK HELP',
          email: adminEmail,
          password: 'HelpKbook123',
          role: 'admin'
        })
        console.log('✅ Usuario admin creado')
      }

      console.log('🎉 Seed finalizado')
      process.exit()
    })
}

seed().catch((err) => {
  console.error('❌ Error en seed:', err)
  process.exit(1)
})
