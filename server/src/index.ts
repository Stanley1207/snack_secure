import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import assessmentRoutes from './routes/assessments.js'
import aiRoutes from './routes/ai.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// CORS configuration - flexible for development and production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? true  // Allow same origin in production
    : 'http://localhost:5173',  // Dev client URL
  credentials: true
}

app.use(cors(corsOptions))
app.use(express.json())

// Serve static files from client/dist in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')))
}

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/assessments', assessmentRoutes)
app.use('/api/ai', aiRoutes)

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok' })
})

// SPA fallback - serve index.html for all non-API routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})
