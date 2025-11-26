import React from 'react'
import Header from '../components/Header'

export default function CartPage() {
  let user = null
  try {
    const raw = localStorage.getItem('authUser')
    user = raw ? JSON.parse(raw) : null
  } catch {
    user = null
  }

  const cart = (() => {
    try {
      const raw = localStorage.getItem('sev-cart')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })()

  function handleLogout() {
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    window.location.hash = '#/login'
  }

  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0)

  return (
    <div className="app-shell">
      <Header variant={user ? 'user' : 'guest'} user={user} cartCount={totalCount} onLogout={handleLogout} />
      <main style={{ marginTop: 32 }}>
        <h1 style={{ fontSize: 28, marginBottom: 16 }}>Корзина</h1>
        {cart.length === 0 ? <p>В корзине пока нет товаров.</p> : <p>В корзине товаров: {totalCount}.</p>}
      </main>
    </div>
  )
}


