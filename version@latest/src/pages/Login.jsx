import React, { useState } from 'react'
import './AuthPages.css'

function formatPhone(value) {
  let digits = value.replace(/\D/g, '')
  if (!digits.startsWith('7')) {
    digits = `7${digits.replace(/^8/, '')}`
  }
  digits = digits.slice(0, 11)
  const tail = digits.slice(1)
  const parts = [tail.slice(0, 3), tail.slice(3, 6), tail.slice(6, 8), tail.slice(8, 10)]
  let formatted = '+7'
  if (parts[0]) formatted += ` (${parts[0]}${parts[0].length === 3 ? ')' : ''}`
  if (parts[1]) formatted += ` ${parts[1]}`
  if (parts[2]) formatted += `-${parts[2]}`
  if (parts[3]) formatted += `-${parts[3]}`
  return formatted.trim()
}

const hasLatin = (value) => /[A-Za-z]/.test(value)
const hasSymbol = (value) => /[^A-Za-z0-9]/.test(value)
const normalizePhone = (value) => value.replace(/\D/g, '')

export default function LoginPage() {
  const [phone, setPhone] = useState('+7')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!hasLatin(password) || !hasSymbol(password)) {
      setError('Пароль должен содержать латиницу и спецсимвол')
      return
    }
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizePhone(phone), password }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Ошибка авторизации')
      }
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('authUser', JSON.stringify(data.user))
      setSuccess('Авторизация прошла успешно')
      window.location.hash = '#/'
    } catch (err) {
      setError(err.message || 'Ошибка авторизации')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="auth-note">Вход</p>
        <h1 className="auth-title">Возвращайтесь за покупками</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span className="auth-field__label">Телефон</span>
            <input
              type="tel"
              inputMode="tel"
              className="auth-input"
              placeholder="+7 (000) 000-00-00"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              required
            />
          </label>
          <label className="auth-field">
            <span className="auth-field__label">Пароль</span>
            <div className="auth-password">
              <input
                type={showPassword ? 'text' : 'password'}
                className="auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                required
              />
              <button
                type="button"
                className="auth-eye"
                aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                <span className={showPassword ? 'auth-eye__icon auth-eye__icon--open' : 'auth-eye__icon'} aria-hidden />
              </button>
            </div>
          </label>
          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-info">{success}</div>}
          <button type="submit" className="auth-primary-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Отправляем...' : 'Вход'}
          </button>
        </form>
        <div className="auth-links">
          <a href="#/register" className="auth-link auth-link--outline">
            Регистрация
          </a>
          <a href="#" className="auth-link">
            Забыли пароль?
          </a>
        </div>
      </div>
    </div>
  )
}

