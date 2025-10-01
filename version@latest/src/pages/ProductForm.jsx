import React, { useState } from 'react'

export default function ProductFormPage() {
  const [form, setForm] = useState({
    id: Date.now(),
    title: '',
    price: 0,
    oldPrice: 0,
    discount: 0,
  })

  function saveToFavorites(product) {
    const fav = JSON.parse(localStorage.getItem('fav') || '[]')
    const exists = fav.find((p) => p.id === product.id)
    const next = exists ? fav : [...fav, product]
    localStorage.setItem('fav', JSON.stringify(next))
    window.location.hash = '#/favorites'
  }

  return (
    <main style={{ maxWidth: 640, margin: '24px auto', padding: '0 16px' }}>
      <h2>Создать карточку товара</h2>
      <div style={{ display: 'grid', gap: 12 }}>
        <input placeholder="Название" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input type="number" placeholder="Цена" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
        <input type="number" placeholder="Старая цена" value={form.oldPrice} onChange={(e) => setForm({ ...form, oldPrice: Number(e.target.value) })} />
        <input type="number" placeholder="Скидка %" value={form.discount} onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => saveToFavorites(form)}>Сохранить в избранное</button>
          <button onClick={() => { localStorage.setItem('draft', JSON.stringify(form)); alert('Сохранено как черновик'); }}>Сохранить черновик</button>
        </div>
      </div>
      <p style={{ marginTop: 12 }}>После сохранения откроется страница избранного с новой карточкой.</p>
    </main>
  )
}


