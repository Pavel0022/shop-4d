import React, { useEffect, useRef, useState } from 'react'
import './Header.css'

/**
 * Desktop-only site header
 * Variant options: 'user' | 'manager' | 'guest'
 */
export default function Header({ variant = 'guest' }) {
  const [isCatalogOpen, setIsCatalogOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const catalogRef = useRef(null)
  const buttonRef = useRef(null)
  const profileRef = useRef(null)

  const categories = [
    'Хлебобулочные изделия',
    'Молоко, сыр, яйцо',
    'Фрукты и овощи',
    'Замороженные продукты',
    'Напитки',
    'Кондитерские изделия',
    'Чай, кофе',
    'Бакалея',
    'Здоровое питание',
    'Зоотовары',
    'Детское питание',
    'Мясо, птица, колбаса',
    'Непродовольственные товары',
  ]

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        setIsCatalogOpen(false)
        setIsProfileOpen(false)
      }
    }
    function onClickOutside(e) {
      const catMenu = catalogRef.current
      const catBtn = buttonRef.current
      if (isCatalogOpen && catMenu && !catMenu.contains(e.target) && catBtn && !catBtn.contains(e.target)) {
        setIsCatalogOpen(false)
      }
      const profMenu = profileRef.current
      if (isProfileOpen && profMenu && !profMenu.contains(e.target)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onClickOutside)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onClickOutside)
    }
  }, [isCatalogOpen, isProfileOpen])

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <div className="site-header__left">
          <div className="brand">
            <span className="brand__icon" aria-hidden>🙂</span>
            <span className="brand__name">СЕВЕРЯНОЧКА</span>
          </div>
          <button
            ref={buttonRef}
            className="catalog-btn"
            type="button"
            aria-expanded={isCatalogOpen}
            aria-haspopup="menu"
            onClick={() => setIsCatalogOpen((v) => !v)}
          >
            <span className="catalog-btn__icon" />
            Каталог
          </button>
          {isCatalogOpen && (
            <div ref={catalogRef} className="catalog-menu" role="menu">
              <ul className="catalog-list">
                {categories.map((title, index) => (
                  <li key={title} className={index === 0 ? 'catalog-list__item catalog-list__item--active' : 'catalog-list__item'}>
                    <a href="#" className="catalog-list__link">{title}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="search">
            <input className="search__input" placeholder="Найти товар" />
            <button className="search__btn" aria-label="Поиск" />
          </div>
        </div>

        <div className="site-header__right">
          <nav className="quick-actions" aria-label="Быстрые действия">
            <a className="quick-actions__item" href="#" title="Избранное" aria-label="Избранное">
              <span className="qa-icon qa-icon--fav" />
              <span className="qa-label">Избранное</span>
            </a>
            <a className="quick-actions__item" href="#" title="Заказы" aria-label="Заказы">
              <span className="qa-icon qa-icon--orders" />
              <span className="qa-label">Заказы</span>
            </a>
            <a className="quick-actions__item" href="#" title="Корзина" aria-label="Корзина">
              <span className="qa-icon qa-icon--cart" />
              <span className="qa-label">Корзина</span>
            </a>
          </nav>

          {variant === 'user' && (
            <div className="account account--user">
              <button type="button" className="account__btn" onClick={() => setIsProfileOpen((v) => !v)} aria-haspopup="menu" aria-expanded={isProfileOpen}>
                <div className="avatar" aria-hidden>👤</div>
                <div className="account__name">Алексей</div>
              </button>
              {isProfileOpen && (
                <div ref={profileRef} className="profile-menu" role="menu">
                  <div className="profile-menu__item profile-menu__item--head">
                    <div className="avatar" aria-hidden>👤</div>
                    <span>Алексей</span>
                    <span className="pm-arrow" />
                  </div>
                  <button className="profile-menu__item" type="button">
                    <span>Профиль</span>
                    <span className="pm-arrow" />
                  </button>
                  <button className="profile-menu__item" type="button">
                    <span>Выйти</span>
                    <span className="pm-arrow" />
                  </button>
                </div>
              )}
            </div>
          )}

          {variant === 'manager' && (
            <div className="account account--manager">
              <button type="button" className="account__btn" onClick={() => setIsProfileOpen((v) => !v)} aria-haspopup="menu" aria-expanded={isProfileOpen}>
                <div className="avatar" aria-hidden>🧑‍💼</div>
                <div className="account__name">Менеджер</div>
              </button>
              {isProfileOpen && (
                <div ref={profileRef} className="profile-menu" role="menu">
                  <div className="profile-menu__item profile-menu__item--head">
                    <div className="avatar" aria-hidden>🧑‍💼</div>
                    <span>Менеджер</span>
                    <span className="pm-arrow" />
                  </div>
                  <button className="profile-menu__item" type="button">
                    <span>Профиль</span>
                    <span className="pm-arrow" />
                  </button>
                  <button className="profile-menu__item" type="button">
                    <span>Выйти</span>
                    <span className="pm-arrow" />
                  </button>
                </div>
              )}
            </div>
          )}

          {variant === 'guest' && (
            <button type="button" className="login-btn">Войти</button>
          )}
        </div>
      </div>
    </header>
  )
}



