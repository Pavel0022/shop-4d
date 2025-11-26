import React, { useState } from 'react'
import './AuthPages.css'

const locationOptions = {
  Коми: ['Усть-Ижма', 'Сыктывкар', 'Инта', 'Воркута'],
  Карелия: ['Петрозаводск', 'Сегежа', 'Кондопога', 'Сортавала'],
  ЯНАО: ['Салехард', 'Ноябрьск', 'Новый Уренгой', 'Муравленко'],
  ХМАО: ['Ханты-Мансийск', 'Сургут', 'Нижневартовск', 'Нягань'],
}
const regionList = Object.keys(locationOptions)
const defaultRegion = regionList[0]
const defaultCity = locationOptions[defaultRegion][0]

function formatPhone(value) {
  let digits = value.replace(/\D/g, '')
  if (!digits.startsWith('7')) {
    digits = `7${digits.replace(/^8/, '')}`
  }
  digits = digits.slice(0, 11)
  const tail = digits.slice(1)
  const parts = [
    tail.slice(0, 3),
    tail.slice(3, 6),
    tail.slice(6, 8),
    tail.slice(8, 10),
  ]
  let formatted = '+7'
  if (parts[0]) formatted += ` (${parts[0]}${parts[0].length === 3 ? ')' : ''}`
  if (parts[1]) formatted += ` ${parts[1]}`
  if (parts[2]) formatted += `-${parts[2]}`
  if (parts[3]) formatted += `-${parts[3]}`
  return formatted.trim()
}

const sanitizeName = (value) => value.replace(/[^A-Za-zА-Яа-яЁё]/g, '')
const hasLatin = (value) => /[A-Za-z]/.test(value)
const hasSymbol = (value) => /[^A-Za-z0-9]/.test(value)
const normalizePhone = (value) => value.replace(/\D/g, '')

export default function RegisterPage() {
  const [form, setForm] = useState({
    phone: '+7',
    birthday: '',
    lastName: '',
    firstName: '',
    region: defaultRegion,
    city: defaultCity,
    password: '',
    confirm: '',
    gender: 'male',
    card: '',
    email: '',
    noCard: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage('')
    if (form.password !== form.confirm) {
      setMessage('Пароли не совпадают')
      return
    }
    if (!hasLatin(form.password) || !hasSymbol(form.password)) {
      setMessage('Пароль должен содержать латинские буквы и спецсимволы')
      return
    }
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: normalizePhone(form.phone),
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Не удалось зарегистрироваться')
      }
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('authUser', JSON.stringify(data.user))
      setMessage('Регистрация прошла успешно')
      window.location.hash = '#/'
    } catch (error) {
      setMessage(error.message || 'Не удалось зарегистрироваться')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">
        <p className="auth-note">Регистрация</p>
        <h1 className="auth-title">Создайте аккаунт в «Северяночке»</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-section">
            <p className="auth-section__title">Обязательные поля</p>
            <div className="auth-grid">
              <label className="auth-field">
                <span className="auth-field__label">Телефон</span>
                <input
                  type='tel'
                  className="auth-input"
                  value={form.phone}
                  onChange={(e) => handleChange('phone', formatPhone(e.target.value))}
                  placeholder="+7 912 000-00-00"
                  required
                />
              </label>
              <label className="auth-field">
                <span className="auth-field__label">Дата рождения</span>
                <input
                  type="date"
                  className="auth-input"
                  value={form.birthday}
                  onChange={(e) => handleChange('birthday', e.target.value)}
                  required
                />
              </label>
              <label className="auth-field">
                <span className="auth-field__label">Фамилия</span>
                <input className="auth-input" value={form.lastName} onChange={(e) => handleChange('lastName', sanitizeName(e.target.value))} required />
              </label>
              <label className="auth-field">
                <span className="auth-field__label">Регион</span>
                <select
                  className="auth-input"
                  value={form.region}
                  onChange={(e) => {
                    const nextRegion = e.target.value
                    setForm((prev) => ({
                      ...prev,
                      region: nextRegion,
                      city: locationOptions[nextRegion][0],
                    }))
                  }}
                >
                  {regionList.map((region) => (
                    <option key={region}>{region}</option>
                  ))}
                </select>
              </label>
              <label className="auth-field">
                <span className="auth-field__label">Имя</span>
                <input className="auth-input" value={form.firstName} onChange={(e) => handleChange('firstName', sanitizeName(e.target.value))} required />
              </label>
              <label className="auth-field">
                <span className="auth-field__label">Населённый пункт</span>
                <select className="auth-input" value={form.city} onChange={(e) => handleChange('city', e.target.value)}>
                  {locationOptions[form.region]?.map((city) => (
                    <option key={city}>{city}</option>
                  ))}
                </select>
              </label>
              <label className="auth-field">
                <span className="auth-field__label">Пароль</span>
                <div className="auth-password">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input"
                    value={form.password}
                    onChange={(e) => handleChange('password', e.target.value)}
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
              <label className="auth-field">
                <span className="auth-field__label">Повторите пароль</span>
                <div className="auth-password">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    className="auth-input"
                    value={form.confirm}
                    onChange={(e) => handleChange('confirm', e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="auth-eye"
                    aria-label={showConfirm ? 'Скрыть пароль' : 'Показать пароль'}
                    onClick={() => setShowConfirm((prev) => !prev)}
                  >
                    <span className={showConfirm ? 'auth-eye__icon auth-eye__icon--open' : 'auth-eye__icon'} aria-hidden />
                  </button>
                </div>
              </label>
            </div>

            <div className="auth-gender">
              <span className="auth-field__label">Пол</span>
              <div className="auth-gender__controls">
                <button
                  type="button"
                  className={form.gender === 'male' ? 'auth-tag auth-tag--active' : 'auth-tag'}
                  onClick={() => handleChange('gender', 'male')}
                >
                  Мужской
                </button>
                <button
                  type="button"
                  className={form.gender === 'female' ? 'auth-tag auth-tag--active' : 'auth-tag'}
                  onClick={() => handleChange('gender', 'female')}
                >
                  Женский
                </button>
              </div>
            </div>
          </div>

          <div className="auth-section">
            <p className="auth-section__title">Необязательные поля</p>
            <div className="auth-grid auth-grid--half">
              <label className="auth-field">
                <span className="auth-field__label">Номер карты</span>
                <input className="auth-input" value={form.card} onChange={(e) => handleChange('card', e.target.value)} disabled={form.noCard} />
              </label>
              <label className="auth-field">
                <span className="auth-field__label">E-mail</span>
                <input type="email" className="auth-input" value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
              </label>
            </div>
            <label className="auth-checkbox">
              <input
                type="checkbox"
                checked={form.noCard}
                onChange={(e) => handleChange('noCard', e.target.checked)}
              />
              <span>У меня нет карты лояльности</span>
            </label>
          </div>

          {message && <div className="auth-info">{message}</div>}
          <button type="submit" className="auth-primary-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Отправляем...' : 'Продолжить'}
          </button>
        </form>

        <a href="#/login" className="auth-link auth-link--ghost">
          Вход
        </a>
      </div>
    </div>
  )
}

