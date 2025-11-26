import React from 'react'
import './ProductCard.css'
import lays from '../img/lays.png'

export default function ProductCard({
  title = 'Комбайн КЗС-1218 «ДЕСНА-ПОЛЕСЬЕ GS12»',
  price = 44.5,
  oldPrice = 50.5,
  discount = 50,
  qty = 0,
  isFav = false,
  onToggleFav,
  onAddToCart,
  onDecrease,
}) {
  return (
    <div className="p-card">
      {discount ? <div className="p-card__badge">-{discount}%</div> : null}
      <button className={isFav ? 'p-card__fav p-card__fav--on' : 'p-card__fav'} aria-label="В избранное" onClick={onToggleFav}>
        ❤
      </button>

      <div className="p-card__image">
        <img src={lays} alt="Товар" />
      </div>

      <div className="p-card__prices">
        <div className="p-card__price">{price.toFixed(2)} ₽</div>
        <div className="p-card__old">{oldPrice.toFixed(2)} ₽</div>
      </div>
      <div className="p-card__subtitle">С картой</div>

      <div className="p-card__title">{title}</div>

      <div className="p-card__rating" aria-label="Рейтинг 3 из 5">
        <span className="star star--on" />
        <span className="star star--on" />
        <span className="star star--on" />
        <span className="star" />
        <span className="star" />
      </div>

      {qty > 0 ? (
        <div className="p-card__qty">
          <button
            type="button"
            className="p-card__qty-btn p-card__qty-btn--minus"
            onClick={onDecrease}
            aria-label="Уменьшить количество"
          >
            −
          </button>
          <span className="p-card__qty-value">{qty}</span>
          <button
            type="button"
            className="p-card__qty-btn p-card__qty-btn--plus"
            onClick={onAddToCart}
            aria-label="Увеличить количество"
          >
            +
          </button>
        </div>
      ) : (
        <button className="p-card__btn" onClick={onAddToCart}>
          В корзину
        </button>
      )}
    </div>
  )
}


