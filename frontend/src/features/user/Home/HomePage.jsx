import React, { useState, useEffect } from 'react'
import BannerSect from './sections/BannerSect'
import BestsellerSection from './sections/BestSeller'
import NewArrivalsSect from './sections/NewArrivals'
import AuthorsCarousel from '../../../components/authors/AuthorsCarousel'
import CategoriesCarousel from '../../../components/carrouseles/CategoriesCarrusel'
import ListCategories from './sections/ListCategories'
import ReviewsCarrusel from '../../../components/review/ReviewCarrusel'
import api from '../../../api'

export default function HomePage() {
  const [homeReviews, setHomeReviews] = useState([])
  const [loadingReviews, setLoadingReviews] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        setLoadingReviews(true)
        const { data } = await api.get('/api/reviews', {
          params: { limit: 20, sort: '-createdAt' }
        })
        // 👇 desenvuelve: puede venir como array, o {items}, o {reviews}
        const list = Array.isArray(data)
          ? data
          : data?.items || data?.reviews || []
        setHomeReviews(Array.isArray(list) ? list : [])
      } catch (e) {
        console.error('Error cargando reseñas del Home:', e)
        setHomeReviews([])
      } finally {
        setLoadingReviews(false)
      }
    })()
  }, [])

  return (
    <>
      <BannerSect />
      <BestsellerSection />
      {/* Carrusel de autores: sólo foto + nombre */}
      <AuthorsCarousel />
      <NewArrivalsSect />

      <CategoriesCarousel itemDiameter={150} />
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
      {!loadingReviews && (
        <ReviewsCarrusel
          reviews={homeReviews}
          title='Reseñas destacadas'
          viewAllLink='/reviews'
        />
      )}
    </>
  )
}
