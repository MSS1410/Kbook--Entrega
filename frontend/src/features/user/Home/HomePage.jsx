import React, { useState, useEffect } from 'react'
import BannerSect from './sections/BannerSect'
import BestsellerSection from './sections/BestSeller'
import NewArrivalsSect from './sections/NewArrivals'
import AuthorsCarousel from '../../../components/authors/AuthorsCarousel'
import CategoriesCarousel from '../../../components/carrouseles/CategoriesCarrusel'
import ListCategories from './sections/ListCategories'
import ReviewsCarrusel from '../../../components/review/ReviewCarrusel'

import api from '../../../api'
//api para reseñas

export default function HomePage() {
  // estados local para reseñas del home
  const [homeReviews, setHomeReviews] = useState([]) // lista de reseñas a mostrar
  const [loadingReviews, setLoadingReviews] = useState(false) // flag de carga para controlar render

  //Carga de reseñas
  useEffect(() => {
    ;(async () => {
      try {
        setLoadingReviews(true)
        const { data } = await api.get('/api/reviews', {
          params: { limit: 20, sort: '-createdAt' }
          // get a api reviews pidiendo max 20
        })
        //  como puede venir como array items o reviews, desfiguro: si devvuelve array lo uso, si devuelve {} uso el campo llegado

        const list = Array.isArray(data)
          ? data
          : data?.items || data?.reviews || []
        setHomeReviews(Array.isArray(list) ? list : []) //[] nada coincide array empty
      } catch (e) {
        console.error('Error cargando reseñas del Home:', e)
        setHomeReviews([])
      } finally {
        setLoadingReviews(false)
      }
    })()
  }, [])

  // render de secciones
  return (
    <>
      <BannerSect />
      <BestsellerSection />
      {/* carro de autores:  foto + nombre */}
      <AuthorsCarousel />
      <NewArrivalsSect />

      <CategoriesCarousel itemDiameter={150} />
      {/* sect por cat */}
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

      {/* carro de reseñas */}
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
