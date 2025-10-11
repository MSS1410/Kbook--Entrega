import fs from 'fs'
import { createObjectCsvWriter } from 'csv-writer'
import axios from 'axios'

const dataDir = './data'
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir)

const booksCsv = createObjectCsvWriter({
  path: `${dataDir}/books.csv`,
  header: [
    { id: 'title', title: 'title' },
    { id: 'authorName', title: 'authorName' },
    { id: 'synopsis', title: 'synopsis' },
    { id: 'category', title: 'category' },
    { id: 'price', title: 'price' },
    { id: 'stock', title: 'stock' },
    { id: 'coverImageUrl', title: 'coverImageUrl' }
  ]
})

const categories = [
  { name: 'Ciencia Ficción', slug: 'science_fiction' },
  { name: 'Ciencia', slug: 'science' },
  { name: 'Aventuras', slug: 'action_and_adventure' },
  { name: 'Historia', slug: 'history' },
  { name: 'Psicologia', slug: 'psychology' },
  { name: 'Infantiles', slug: 'children' },
  { name: 'Natura', slug: 'nature' }
]

async function fetchWorkDetails(workKey) {
  try {
    const url = `https://openlibrary.org${workKey}.json`
    const { data } = await axios.get(url)
    return data
  } catch (err) {
    return {}
  }
}

async function generate() {
  const records = []

  for (const cat of categories) {
    const url = `https://openlibrary.org/subjects/${cat.slug}.json?limit=20`
    const { data } = await axios.get(url)

    for (const work of data.works) {
      const title = work.title
      const authorName = work.authors?.[0]?.name || 'Desconocido'

      // sinopsis desde primera linea o desde descripcion
      let synopsis = work.first_sentence?.value || ''
      if (!synopsis && work.description) {
        synopsis =
          typeof work.description === 'string'
            ? work.description
            : work.description.value
      }

      // sin sinopsis, busco detalles del work.key
      if (!synopsis) {
        const details = await fetchWorkDetails(work.key)
        if (details.description) {
          synopsis =
            typeof details.description === 'string'
              ? details.description
              : details.description.value
        }
      }

      if (!synopsis) synopsis = 'Sin descripción disponible'

      const coverId = work.cover_id
      const coverImageUrl = coverId
        ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
        : ''

      const price = (Math.random() * 45 + 5).toFixed(2)
      const stock = Math.floor(Math.random() * 101)

      records.push({
        title,
        authorName,
        synopsis,
        category: cat.name,
        price,
        stock,
        coverImageUrl
      })
    }
  }

  await booksCsv.writeRecords(records)
  console.log(
    `✅ books.csv generado con ${records.length} libros reales y sinopsis`
  )
}

generate()
  .then(() => console.log('✅ CSV generado correctamente'))
  .catch((err) => {
    console.error('❌ Error generando CSV:', err)
    process.exit(1)
  })
