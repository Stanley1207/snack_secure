import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const dbPath = join(__dirname, '../../database.sqlite')
const db = new Database(dbPath)

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    company TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_category TEXT NOT NULL,
    answers TEXT NOT NULL,
    score INTEGER NOT NULL,
    status TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`)

export interface User {
  id: number
  name: string
  email: string
  password: string
  company?: string
  created_at: string
}

export interface Assessment {
  id: number
  user_id: number
  product_category: string
  answers: string
  score: number
  status: string
  created_at: string
}

export const userModel = {
  create: (name: string, email: string, password: string, company?: string): User => {
    const stmt = db.prepare(
      'INSERT INTO users (name, email, password, company) VALUES (?, ?, ?, ?)'
    )
    const result = stmt.run(name, email, password, company || null)
    return userModel.findById(result.lastInsertRowid as number)!
  },

  findByEmail: (email: string): User | undefined => {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?')
    return stmt.get(email) as User | undefined
  },

  findById: (id: number): User | undefined => {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?')
    return stmt.get(id) as User | undefined
  }
}

export const assessmentModel = {
  create: (
    userId: number,
    productCategory: string,
    answers: Record<string, string>,
    score: number,
    status: string
  ): Assessment => {
    const stmt = db.prepare(
      'INSERT INTO assessments (user_id, product_category, answers, score, status) VALUES (?, ?, ?, ?, ?)'
    )
    const result = stmt.run(userId, productCategory, JSON.stringify(answers), score, status)
    return assessmentModel.findById(result.lastInsertRowid as number)!
  },

  findById: (id: number): Assessment | undefined => {
    const stmt = db.prepare('SELECT * FROM assessments WHERE id = ?')
    return stmt.get(id) as Assessment | undefined
  },

  findByUserId: (userId: number): Assessment[] => {
    const stmt = db.prepare(
      'SELECT * FROM assessments WHERE user_id = ? ORDER BY created_at DESC'
    )
    return stmt.all(userId) as Assessment[]
  },

  delete: (id: number, userId: number): boolean => {
    const stmt = db.prepare('DELETE FROM assessments WHERE id = ? AND user_id = ?')
    const result = stmt.run(id, userId)
    return result.changes > 0
  }
}

export default db
