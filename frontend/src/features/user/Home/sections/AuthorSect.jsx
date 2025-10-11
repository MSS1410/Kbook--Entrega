import React, { useEffect, useState } from 'react'
import HomeCarrusel from '../../components/HomeCarrusels'
import AuthorSingCard from '../../components/authorSingCard'
import api from '../../../../api'

// seccion autores del homepage user
export default function AuthorSect() {
  const [authors, setAuthors] = useState([])
  // guardamos authors mediante useStt
  useEffect(() => {
    //montaje: llamo a
    api
      .get('/api/authors?featured=true&limit=12')
      .then((res) =>
        setAuthors((Array.isArray(res.data) ? res.data : []).slice(0, 12))
      )
      //normalizo respuesta a array con limite a 12
      .catch(console.error)
  }, [])
  //mapeo de autores a array items, expone el id del author y en componente,
  const items = authors.map((a) => ({
    id: a._id,
    component: <AuthorSingCard author={a} /> // en cada card de author mostrare el a correspondiente.
    // card encargado de renderizar el author en solitario
  }))
  // render HomeCarrusel
  return (
    <HomeCarrusel
      title='Autores Destacados'
      items={items}
      viewAllLink='/authors'
      itemWidth={180} // ancho de cada uno
      itemGap={16} // separacion entre el carrusel
    />
    // HomeCarrusel solo con [items] funciona, al normalizar en linea 16 y tenerlo en array, evito romper si backend cambia de {authors[]} a [author]
  )
}
