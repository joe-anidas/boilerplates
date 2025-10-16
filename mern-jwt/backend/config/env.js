import 'dotenv/config'

export const PORT = process.env.PORT || 3000
export const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce'
export const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'
export const CORS_ORIGIN = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)


