import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Pool } from 'pg'

dotenv.config()

const app = express()
const PORT = process.env.API_PORT || process.env.PORT || 4000
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

const pool =
  process.env.DATABASE_URL
    ? new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : undefined,
      })
    : new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 5432),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'postgres',
      })

app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

const normalizePhone = (phone) => phone.replace(/\D/g, '')

async function findUserByPhone(phoneDigits) {
  const { rows } = await pool.query('SELECT * FROM users WHERE phone = $1 LIMIT 1', [phoneDigits])
  return rows[0]
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ message: 'Токен не передан' })
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload
    next()
  } catch {
    return res.status(401).json({ message: 'Неверный или истёкший токен' })
  }
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() })
})

// ---------- AUTH ----------

app.post('/api/auth/register', async (req, res) => {
  try {
    const { phone, password, firstName, lastName, email } = req.body
    if (!phone || !password) {
      return res.status(400).json({ message: 'Телефон и пароль обязательны' })
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Минимальная длина пароля — 6 символов' })
    }

    const normalizedPhone = normalizePhone(phone)
    const existing = await findUserByPhone(normalizedPhone)
    if (existing) {
      return res.status(409).json({ message: 'Пользователь с таким телефоном уже зарегистрирован' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const insertQuery = `
      INSERT INTO users (phone, email, first_name, last_name, password_hash)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, phone, email, first_name, last_name, created_at
    `
    const { rows } = await pool.query(insertQuery, [
      normalizedPhone,
      email ?? null,
      firstName ?? null,
      lastName ?? null,
      passwordHash,
    ])
    const user = rows[0]
    const token = jwt.sign({ sub: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: '7d' })
    res.status(201).json({ user, token })
  } catch (error) {
    console.error('register error', error)
    res.status(500).json({ message: 'Не удалось создать пользователя' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { phone, password } = req.body
    if (!phone || !password) {
      return res.status(400).json({ message: 'Укажите телефон и пароль' })
    }
    const normalizedPhone = normalizePhone(phone)
    const user = await findUserByPhone(normalizedPhone)
    if (!user) {
      return res.status(401).json({ message: 'Неверный телефон или пароль' })
    }
    const isMatch = await bcrypt.compare(password, user.password_hash)
    if (!isMatch) {
      return res.status(401).json({ message: 'Неверный телефон или пароль' })
    }
    const token = jwt.sign({ sub: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: '7d' })
    res.json({
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
      token,
    })
  } catch (error) {
    console.error('login error', error)
    res.status(500).json({ message: 'Ошибка авторизации' })
  }
})

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, phone, email, first_name, last_name FROM users WHERE id = $1 LIMIT 1',
      [req.user.sub],
    )
    const user = rows[0]
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' })
    res.json({ user })
  } catch (error) {
    console.error('me error', error)
    res.status(500).json({ message: 'Не удалось получить профиль' })
  }
})

// ---------- PRODUCTS ----------

app.get('/api/products', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id,
              title,
              price,
              old_price AS "oldPrice",
              discount,
              is_new     AS "isNew",
              was_bought AS "wasBought"
       FROM products
       ORDER BY id ASC`,
    )
    res.json({ items: rows })
  } catch (error) {
    console.error('products error', error)
    res.status(500).json({ message: 'Не удалось получить товары' })
  }
})

app.listen(PORT, () => {
  console.log(`API server ready on http://localhost:${PORT}`)
})
