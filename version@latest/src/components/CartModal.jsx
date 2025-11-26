import React from 'react'
import './CartModal.css'

export default function CartModal({ items = [], onClose, onInc, onDec, onRemove }) {
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0)

  return (
    <div className="cart-modal__backdrop" role="dialog" aria-modal="true" aria-label="Корзина">
      <div className="cart-modal">
        <div className="cart-modal__head">
          <h2>Корзина</h2>
          <button type="button" className="cart-modal__close" onClick={onClose} aria-label="Закрыть">
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <p className="cart-modal__empty">Добавьте товары из каталога, чтобы оформить заказ.</p>
        ) : (
          <>
            <ul className="cart-list">
              {items.map((item) => (
                <li key={item.id} className="cart-item">
                  <div>
                    <div className="cart-item__title">{item.title}</div>
                    <div className="cart-item__meta">{item.price.toFixed(2)} ₽/шт</div>
                  </div>
                  <div className="cart-item__controls">
                    <button type="button" onClick={() => onDec(item.id)} aria-label="Убавить">−</button>
                    <span>{item.qty}</span>
                    <button type="button" onClick={() => onInc(item.id)} aria-label="Добавить">+</button>
                  </div>
                  <div className="cart-item__total">{(item.price * item.qty).toFixed(2)} ₽</div>
                  <button type="button" className="cart-item__remove" onClick={() => onRemove(item.id)} aria-label="Удалить">
                    Удалить
                  </button>
                </li>
              ))}
            </ul>
            <div className="cart-modal__footer">
              <div className="cart-modal__total">
                Итого: <strong>{total.toFixed(2)} ₽</strong>
              </div>
              <button type="button" className="cart-modal__checkout">Оформить заказ</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

