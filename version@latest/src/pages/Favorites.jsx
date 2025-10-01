import React from 'react'
import ProductCard from '../components/ProductCard'

export default function FavoritesPage() {
  const fav = JSON.parse(localStorage.getItem('fav') || '[]')
  return (
    <main>
      <div className="p-grid">
        {fav.length === 0 ? (
          <div>Список избранного пуст</div>
        ) : (
          fav.map((p) => (
            <ProductCard key={p.id} {...p} isFav onToggleFav={() => {}} />
          ))
        )}
      </div>
    </main>
  )
}


