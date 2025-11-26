import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import ProductCard from '../components/ProductCard'

export default function FavoritesPage() {
  const [catalog, setCatalog] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  let user = null
  try {
    const raw = localStorage.getItem('authUser')
    user = raw ? JSON.parse(raw) : null
  } catch {
    user = null
  }

  const favoritesIds = (() => {
    try {
      const raw = localStorage.getItem('sev-favorites')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })()

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true)
        setError('')
        const res = await fetch('/api/products')
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Не удалось загрузить товары')
        setCatalog(data.items || [])
      } catch (e) {
        setError(e.message || 'Не удалось загрузить товары')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  function handleLogout() {
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    window.location.hash = '#/login'
  }

  const favSet = new Set(favoritesIds)
  const favProducts = catalog.filter((p) => favSet.has(p.id))

  return (
    <div className="app-shell">
      <Header variant={user ? 'user' : 'guest'} user={user} onLogout={handleLogout} />
      <main style={{ marginTop: 32 }}>
        <h1 style={{ fontSize: 28, marginBottom: 16 }}>Избранное</h1>
        {error && <div className="section-error">{error}</div>}
        {isLoading && <div className="section-loading">Загружаем товары…</div>}
        {!isLoading && !error && (
          <div className="p-grid">
            {favProducts.length === 0 ? (
              <div>Список избранного пуст.</div>
            ) : (
              favProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  title={product.title}
                  price={Number(product.price) || 0}
                  oldPrice={product.oldPrice != null ? Number(product.oldPrice) : Number(product.price) || 0}
                  discount={product.discount != null ? Number(product.discount) : 0}
                  qty={0}
                  isFav
                />
              ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}

