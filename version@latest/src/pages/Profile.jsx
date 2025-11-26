import React from 'react'
import Header from '../components/Header'

export default function ProfilePage() {
  let user = null
  try {
    const raw = localStorage.getItem('authUser')
    user = raw ? JSON.parse(raw) : null
  } catch {
    user = null
  }

  const name = user?.first_name || user?.last_name || 'Покупатель'

  function handleLogout() {
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    window.location.hash = '#/login'
  }

  return (
    <div className="app-shell">
      <Header variant={user ? 'user' : 'guest'} user={user} onLogout={handleLogout} />
      <main style={{ marginTop: 32 }}>
        <h1 style={{ fontSize: 28, marginBottom: 16 }}>Профиль</h1>
        {user ? (
          <div style={{ maxWidth: 480, background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 12px 30px rgba(15,23,42,0.06)' }}>
            <p><strong>Имя:</strong> {name}</p>
            {user.email && <p><strong>E-mail:</strong> {user.email}</p>}
            <p><strong>Телефон:</strong> {user.phone}</p>
          </div>
        ) : (
          <p>Вы не авторизованы.</p>
        )}
      </main>
    </div>
  )
}


