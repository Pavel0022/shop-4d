import { useEffect, useMemo, useState } from 'react'
import './App.css'
import Header from './components/Header'
import ProductCard from './components/ProductCard'
import CartModal from './components/CartModal'
import YandexMap from './components/YandexMap'
import './components/ProductCard.css'

const STORAGE_KEYS = {
  favorites: 'sev-favorites',
  cart: 'sev-cart',
}

const loadStore = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch (error) {
    console.warn('Storage parse error', error)
    return fallback
  }
}

function App() {
  const [catalog, setCatalog] = useState([])
  const [favorites, setFavorites] = useState(() => loadStore(STORAGE_KEYS.favorites, []))
  const [cart, setCart] = useState(() => loadStore(STORAGE_KEYS.cart, []))
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [authUser, setAuthUser] = useState(() => {
    try {
      const raw = localStorage.getItem('authUser')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoading(true)
        setError('')
        const res = await fetch('/api/products')
        let data = null
        try {
          data = await res.json()
        } catch {
          // тело пустое или не JSON
        }
        if (!res.ok) {
          throw new Error((data && data.message) || 'Не удалось загрузить товары')
        }
        setCatalog((data && data.items) || [])
      } catch (e) {
        console.error(e)
        setError(e.message || 'Не удалось загрузить товары')
      } finally {
        setIsLoading(false)
      }
    }
    loadProducts()
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart))
  }, [cart])

  const favoritesSet = useMemo(() => new Set(favorites), [favorites])
  const cartMap = useMemo(() => new Map(cart.map((item) => [item.id, item.qty])), [cart])
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart])

  const detailedCart = useMemo(() => {
    return cart
      .map((item) => {
        const product = catalog.find((p) => p.id === item.id)
        if (!product) return null
        return { ...product, qty: item.qty }
      })
      .filter(Boolean)
  }, [cart, catalog])

  function toggleFavorite(id) {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]))
  }

  function addToCart(id) {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === id)
      if (exists) {
        return prev.map((item) => (item.id === id ? { ...item, qty: item.qty + 1 } : item))
      }
      return [...prev, { id, qty: 1 }]
    })
  }

  function decreaseCart(id) {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, qty: item.qty - 1 } : item))
        .filter((item) => item.qty > 0),
    )
  }

  function increaseCart(id) {
    setCart((prev) => prev.map((item) => (item.id === id ? { ...item, qty: item.qty + 1 } : item)))
  }

  function removeFromCart(id) {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  function handleLogout() {
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    setAuthUser(null)
    window.location.hash = '#/login'
  }

  return (
    <div className="app-shell">
      <Header
        variant={authUser ? 'user' : 'guest'}
        cartCount={cartCount}
        onCartClick={() => setIsCartOpen(true)}
        user={authUser}
        onLogout={handleLogout}
      />

      <main>
        <section className="hero-banner">
          <div className="hero-banner__content">
            <p className="hero-banner__label">Онлайн‑гипермаркет «Северяночка»</p>
            <h1 className="hero-banner__title">Доставка бесплатно от 1000 ₽</h1>
            <p className="hero-banner__text">
              Свежие продукты, любимые бренды и выгодные предложения каждый день. Соберём заказ и привезём в удобное
              для вас время.
            </p>
            <button
              type="button"
              className="hero-banner__btn"
              onClick={() => window.scrollTo({ top: 380, behavior: 'smooth' })}
            >
              Перейти к покупкам
            </button>
          </div>
        </section>

        <section className="section-block">
          <div className="section-block__head">
            <h2 className="section-block__title">Акции</h2>
            <button type="button" className="section-block__link">
              Все акции
            </button>
          </div>
          {error && <div className="section-error">{error}</div>}
          {isLoading && !error && <div className="section-loading">Загружаем товары…</div>}
          {!isLoading && !error && (
            <div className="p-grid">
              {catalog.slice(0, 4).map((product) => (
                <ProductCard
                  key={product.id}
                  title={product.title}
                  price={Number(product.price) || 0}
                  oldPrice={product.oldPrice != null ? Number(product.oldPrice) : Number(product.price) || 0}
                  discount={product.discount != null ? Number(product.discount) : 0}
                  qty={cartMap.get(product.id) || 0}
                  isFav={favoritesSet.has(product.id)}
                  onToggleFav={() => toggleFavorite(product.id)}
                  onAddToCart={() => addToCart(product.id)}
                  onDecrease={() => decreaseCart(product.id)}
                />
              ))}
            </div>
          )}
        </section>

        <section className="section-block">
          <div className="section-block__head">
            <h2 className="section-block__title">Новинки</h2>
            <button type="button" className="section-block__link">
              Все новинки
            </button>
          </div>
          {!isLoading && !error && (
            <div className="p-grid">
              {catalog
                .filter((p) => p.isNew)
                .slice(0, 4)
                .map((product) => (
                  <ProductCard
                    key={product.id}
                    title={product.title}
                    price={Number(product.price) || 0}
                    oldPrice={product.oldPrice != null ? Number(product.oldPrice) : Number(product.price) || 0}
                    discount={product.discount != null ? Number(product.discount) : 0}
                    qty={cartMap.get(product.id) || 0}
                    isFav={favoritesSet.has(product.id)}
                    onToggleFav={() => toggleFavorite(product.id)}
                    onAddToCart={() => addToCart(product.id)}
                    onDecrease={() => decreaseCart(product.id)}
                  />
                ))}
            </div>
          )}
        </section>

        <section className="section-block">
          <div className="section-block__head">
            <h2 className="section-block__title">Покупали раньше</h2>
            <button type="button" className="section-block__link">
              История покупок
            </button>
          </div>
          {!isLoading && !error && (
            <div className="p-grid">
              {catalog
                .filter((p) => p.wasBought)
                .slice(0, 4)
                .map((product) => (
                  <ProductCard
                    key={product.id}
                    title={product.title}
                    price={Number(product.price) || 0}
                    oldPrice={product.oldPrice != null ? Number(product.oldPrice) : Number(product.price) || 0}
                    discount={product.discount != null ? Number(product.discount) : 0}
                    qty={cartMap.get(product.id) || 0}
                    isFav={favoritesSet.has(product.id)}
                    onToggleFav={() => toggleFavorite(product.id)}
                    onAddToCart={() => addToCart(product.id)}
                    onDecrease={() => decreaseCart(product.id)}
                  />
                ))}
            </div>
          )}
        </section>

        <section className="section-block section-block--promo">
          <h2 className="section-block__title">Специальные предложения</h2>
          <div className="promo-grid">
            <article className="promo-card promo-card--orange">
              <h3>Оформите карту «Северяночка»</h3>
              <p>Копите бонусы за каждую покупку и оплачивайте ими до 100% следующего заказа.</p>
            </article>
            <article className="promo-card promo-card--green">
              <h3>Получайте персональные предложения</h3>
              <p>Суперцены на любимые товары — мы подберём то, что вы покупаете чаще всего.</p>
            </article>
          </div>
        </section>

        <section className="section-block">
          <div className="section-block__head">
            <h2 className="section-block__title">Наши магазины</h2>
          </div>
          <YandexMap />
        </section>

        <section className="section-block">
          <div className="section-block__head">
            <h2 className="section-block__title">Статьи</h2>
            <button type="button" className="section-block__link">
              Все статьи
            </button>
          </div>
          <div className="articles-grid">
            <article className="article-card">
              <h3>Как собрать полезную корзину на неделю</h3>
              <p>Рассказываем, как планировать покупки и не забывать про витамины круглый год.</p>
              <button type="button" className="article-card__btn">
                Читать
              </button>
            </article>
            <article className="article-card">
              <h3>Свежие продукты северных фермеров</h3>
              <p>Поддерживаем локальных производителей и привозим только проверенные продукты.</p>
              <button type="button" className="article-card__btn">
                Читать
              </button>
            </article>
            <article className="article-card">
              <h3>5 способов экономить на покупках</h3>
              <p>Используйте акции, персональные цены и карту «Северяночка», чтобы платить меньше.</p>
              <button type="button" className="article-card__btn">
                Читать
              </button>
            </article>
          </div>
        </section>
      </main>

      {isCartOpen && (
        <CartModal
          items={detailedCart}
          onClose={() => setIsCartOpen(false)}
          onInc={increaseCart}
          onDec={decreaseCart}
          onRemove={removeFromCart}
        />
      )}
    </div>
  )
}

export default App
