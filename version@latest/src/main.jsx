import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import FavoritesPage from './pages/Favorites.jsx'
import ProductFormPage from './pages/ProductForm.jsx'
import LoginPage from './pages/Login.jsx'
import RegisterPage from './pages/Register.jsx'
import ProfilePage from './pages/Profile.jsx'
import OrdersPage from './pages/Orders.jsx'
import CartPage from './pages/CartPage.jsx'
import CategoryPage from './pages/CategoryPage.jsx'

function Router() {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const onHash = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  if (hash.startsWith('#/category/')) {
    const name = decodeURIComponent(hash.replace('#/category/', ''))
    return <CategoryPage categoryName={name || 'Все товары'} />
  }
  if (hash === '#/login') return <LoginPage />
  if (hash === '#/register') return <RegisterPage />
  if (hash === '#/favorites') return <FavoritesPage />
  if (hash === '#/profile') return <ProfilePage />
  if (hash === '#/orders') return <OrdersPage />
  if (hash === '#/cart') return <CartPage />
  if (hash === '#/new') return <ProductFormPage />
  return <App />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router />
  </StrictMode>,
)
