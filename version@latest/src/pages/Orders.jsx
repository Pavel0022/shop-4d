import React from 'react'
import Header from '../components/Header'

export default function OrdersPage() {
  let user = null
  try {
    const raw = localStorage.getItem('authUser')
    user = raw ? JSON.parse(raw) : null
  } catch {
    user = null
  }

  function handleLogout() {
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    window.location.hash = '#/login'
  }

  return (
    <div className="app-shell">
      <Header variant={user ? 'user' : 'guest'} user={user} onLogout={handleLogout} />
      <main style={{ marginTop: 32 }}>
        <h1 style={{ fontSize: 28, marginBottom: 16 }}>Заказы</h1>
        <p>Здесь в будущем будет список ваших заказов.</p>
      </main>
    </div>
  )
}


