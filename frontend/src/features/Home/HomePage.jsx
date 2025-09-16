import React, { useState, useEffect } from 'react'
import BannerSect from './BannerSect'
import BestsellerSection from './BestSeller'
import NewArrivalsSect from './NewArrivals'
import AuthorsCarousel from '../../components/AuthorsCarousel'
import CategoriesCarousel from '../../components/CategoriesCarrusel'
import ListCategories from './ListCategories'
import ReviewsCarrusel from '../../components/ReviewCarrusel'
import api from '../../api'

export default function HomePage() {
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    async function fetchReviews() {
      try {
        // Cargar las últimas 15 reseñas (para el carrusel)
        const res = await api.get('/api/reviews?limit=15&sort=-createdAt')
        const data = Array.isArray(res.data) ? res.data : res.data.reviews || []
        setReviews(data)
      } catch (err) {
        console.error('Error al cargar reseñas:', err)
      }
    }
    fetchReviews()
  }, [])

  return (
    <>
      <BannerSect />
      <BestsellerSection />
      <NewArrivalsSect />

      {/* Carrusel de autores: sólo foto + nombre */}
      <AuthorsCarousel />

      <CategoriesCarousel />

      {/* Secciones por categoría */}
      <ListCategories
        category='Ciencia Ficción'
        title='Ciencia Ficción'
        viewAllLink='/categories/Ciencia%20Ficción'
      />
      <ListCategories
        category='Ciencia'
        title='Ciencia'
        viewAllLink='/categories/Ciencia'
      />
      <ListCategories
        category='Aventuras'
        title='Aventuras'
        viewAllLink='/categories/Aventuras'
      />
      <ListCategories
        category='Historia'
        title='Historia'
        viewAllLink='/categories/Historia'
      />
      <ListCategories
        category='Psicologia'
        title='Psicología'
        viewAllLink='/categories/Psicologia'
      />
      <ListCategories
        category='Infantiles'
        title='Infantiles'
        viewAllLink='/categories/Infantiles'
      />
      <ListCategories
        category='Natura'
        title='Naturaleza'
        viewAllLink='/categories/Natura'
      />

      {/* Carrusel de reseñas */}
      <section style={{ margin: '2rem 0' }}>
        <h2>Reseñas Destacadas</h2>
        <ReviewsCarrusel reviews={reviews} />
      </section>
    </>
  )
}
