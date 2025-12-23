import React, { useEffect, useMemo, useState } from 'react'
import Header from '../components/Header'
import ProductCard from '../components/ProductCard'
import '../App.css'

const STORAGE_KEYS = {
  favorites: 'sev-favorites',
  cart: 'sev-cart',
}

const categoryRules = [
  { name: 'Хлебобулочные изделия', keywords: ['хлеб', 'булк', 'батон', 'лаваш'] },
  { name: 'Молоко, сыр, яйцо', keywords: ['молоко', 'сыр', 'йогурт', 'кефир', 'яйц', 'масло'] },
  { name: 'Фрукты и овощи', keywords: ['яблок', 'банан', 'огур', 'помид', 'картоф', 'овощ', 'фрукт', 'зелень'] },
  { name: 'Замороженные продукты', keywords: ['заморож'] },
  { name: 'Напитки', keywords: ['напит', 'сок', 'вода', 'квас'] },
  { name: 'Кондитерские изделия', keywords: ['шоколад', 'конфет', 'печенье', 'зефир', 'ваф'] },
  { name: 'Чай, кофе', keywords: ['чай', 'кофе'] },
  { name: 'Бакалея', keywords: ['круп', 'рис', 'греч', 'макарон', 'мука'] },
  { name: 'Здоровое питание', keywords: ['фитнес', 'протеин', 'безглютен'] },
  { name: 'Мясо, птица, колбаса', keywords: ['мяс', 'колбас', 'кур', 'фарш', 'стейк'] },
  { name: 'Детское питание', keywords: ['детск', 'пюре', 'пелен'] },
]

function detectCategory(title = '') {
  const lower = title.toLowerCase()
  const found = categoryRules.find((rule) => rule.keywords.some((k) => lower.includes(k)))
  return found ? found.name : 'Все товары'
}

export default function CategoryPage({ categoryName = 'Все товары' }) {
  const [catalog, setCatalog] = useState([])
  const [favorites, setFavorites] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.favorites)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.cart)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ priceMin: '', priceMax: '', inStock: false })
  const [appliedFilters, setAppliedFilters] = useState(filters)
  const [visibleCount, setVisibleCount] = useState(6)

  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoading(true)
        setError('')
        const res = await fetch('/api/products')
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Не удалось загрузить товары')
        setCatalog((data && data.items) || [])
      } catch (e) {
        setError(e.message || 'Не удалось загрузить товары')
      } finally {
        setIsLoading(false)
      }
    }
    loadProducts()
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites))
    } catch {
      /* ignore */
    }
  }, [favorites])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart))
    } catch {
      /* ignore */
    }
  }, [cart])

  const favoritesSet = useMemo(() => new Set(favorites.map((id) => Number(id))), [favorites])
  const cartMap = useMemo(() => new Map(cart.map((item) => [Number(item.id), Number(item.qty)])), [cart])
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + Number(item.qty || 0), 0), [cart])

  const categorized = useMemo(
    () => catalog.map((p) => ({ ...p, category: detectCategory(p.title) })),
    [catalog],
  )

  const productsByCategory = useMemo(() => {
    if (categoryName === 'Все товары') return categorized
    return categorized.filter((p) => p.category === categoryName)
  }, [categorized, categoryName])

  const priceLimits = useMemo(() => {
    if (!productsByCategory.length) return { min: 0, max: 0 }
    const prices = productsByCategory.map((p) => Number(p.price) || 0)
    return { min: Math.min(...prices), max: Math.max(...prices) }
  }, [productsByCategory])

  const filteredProducts = useMemo(() => {
    return productsByCategory.filter((p) => {
      const price = Number(p.price) || 0
      if (appliedFilters.priceMin !== '' && price < Number(appliedFilters.priceMin)) return false
      if (appliedFilters.priceMax !== '' && price > Number(appliedFilters.priceMax)) return false
      return true
    })
  }, [productsByCategory, appliedFilters])

  function toggleFavorite(id) {
    const numId = Number(id)
    setFavorites((prev) => (prev.includes(numId) ? prev.filter((itemId) => itemId !== numId) : [...prev, numId]))
  }

  function addToCart(id) {
    const numId = Number(id)
    setCart((prev) => {
      const exists = prev.find((item) => item.id === numId)
      if (exists) {
        return prev.map((item) => (item.id === numId ? { ...item, qty: item.qty + 1 } : item))
      }
      return [...prev, { id: numId, qty: 1 }]
    })
  }

  function decreaseCart(id) {
    const numId = Number(id)
    setCart((prev) =>
      prev
        .map((item) => (item.id === numId ? { ...item, qty: item.qty - 1 } : item))
        .filter((item) => item.qty > 0),
    )
  }

  function handleApplyFilters() {
    setAppliedFilters(filters)
    setVisibleCount(6)
  }

  function handleResetFilters() {
    setFilters({ priceMin: '', priceMax: '', inStock: false })
    setAppliedFilters({ priceMin: '', priceMax: '', inStock: false })
    setVisibleCount(6)
  }

  return (
    <div className="app-shell">
      <Header
        variant={'guest'}
        cartCount={cartCount}
        onCartClick={() => {
          window.location.hash = '#/cart'
        }}
        onSelectCategory={(name) => {
          if (name === 'Все товары') window.location.hash = ''
          else window.location.hash = `#/category/${encodeURIComponent(name)}`
        }}
      />

      <main className="category-page">
        <div className="crumbs">
          <a className="crumbs__link" href="#">
            Главная
          </a>
          <span className="crumbs__sep">/</span>
          <span className="crumbs__current">{categoryName}</span>
        </div>

        <h1 className="category-title">{categoryName}</h1>

        <div className="category-chip-bar">
          <button className="chip">Товары нашего производства</button>
          <button className="chip">Полезное питание</button>
          <button className="chip">Без ГМО</button>
          {appliedFilters.priceMin || appliedFilters.priceMax ? (
            <span className="chip chip--outline">
              Цена {appliedFilters.priceMin || priceLimits.min}–{appliedFilters.priceMax || priceLimits.max} ₽
            </span>
          ) : null}
          <button className="chip chip--ghost" onClick={handleResetFilters}>
            Очистить фильтры
          </button>
        </div>

        <div className="category-layout">
          <aside className="category-filters">
            <div className="filter-panel">
              <div className="filter-panel__title">Фильтр</div>
              <div className="filter-group">
                <label className="filter-label">Цена</label>
                <div className="price-inputs">
                  <input
                    type="number"
                    placeholder={priceLimits.min || 0}
                    value={filters.priceMin}
                    onChange={(e) => setFilters((f) => ({ ...f, priceMin: e.target.value }))}
                  />
                  <input
                    type="number"
                    placeholder={priceLimits.max || 0}
                    value={filters.priceMax}
                    onChange={(e) => setFilters((f) => ({ ...f, priceMax: e.target.value }))}
                  />
                </div>
              </div>

              <div className="filter-group">
                <div className="filter-check">
                  <input
                    id="instock"
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => setFilters((f) => ({ ...f, inStock: e.target.checked }))}
                  />
                  <label htmlFor="instock">В наличии</label>
                </div>
              </div>

              <button className="filter-apply" onClick={handleApplyFilters}>
                Применить
              </button>
            </div>
          </aside>

          <section className="category-grid">
            {error && <div className="section-error">{error}</div>}
            {isLoading && !error && <div className="section-loading">Загружаем товары…</div>}
            {!isLoading && !error && filteredProducts.length === 0 && (
              <div className="section-error">По фильтрам ничего не нашли</div>
            )}
            {!isLoading && !error && (
              <>
                <div className="p-grid">
                  {filteredProducts.slice(0, visibleCount).map((product) => {
                    const pid = Number(product.id)
                    return (
                      <ProductCard
                        key={product.id}
                        title={product.title}
                        price={Number(product.price) || 0}
                        oldPrice={product.oldPrice != null ? Number(product.oldPrice) : Number(product.price) || 0}
                        discount={product.discount != null ? Number(product.discount) : 0}
                        qty={cartMap.get(pid) || 0}
                        isFav={favoritesSet.has(pid)}
                        onToggleFav={() => toggleFavorite(pid)}
                        onAddToCart={() => addToCart(pid)}
                        onDecrease={() => decreaseCart(pid)}
                      />
                    )
                  })}
                </div>

                {filteredProducts.length > visibleCount && (
                  <div className="category-pagination">
                    <button
                      type="button"
                      className="category-pagination__more"
                      onClick={() => setVisibleCount((n) => n + 6)}
                    >
                      Показать ещё
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

