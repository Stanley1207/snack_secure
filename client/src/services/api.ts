import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface User {
  id: number
  name: string
  email: string
  company?: string
}

export interface Assessment {
  id: number
  userId: number
  productCategory: string
  answers: Record<string, string>
  score: number
  status: 'passed' | 'failed' | 'partial'
  createdAt: string
}

export interface AuthResponse {
  token: string
  user: User
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  register: async (name: string, email: string, password: string, company?: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', { name, email, password, company })
    return response.data
  }
}

export const assessmentService = {
  create: async (data: { productCategory: string; answers: Record<string, string> }): Promise<Assessment> => {
    const response = await api.post('/assessments', data)
    return response.data
  },

  getAll: async (): Promise<Assessment[]> => {
    const response = await api.get('/assessments')
    return response.data
  },

  getById: async (id: number): Promise<Assessment> => {
    const response = await api.get(`/assessments/${id}`)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/assessments/${id}`)
  }
}

export interface AIAnalysisResponse {
  success: boolean
  analysis?: {
    answers: Record<string, string>
    confidence: Record<string, 'high' | 'medium' | 'low'>
    observations: Record<string, string>
    overallNotes: string
  }
  error?: string
}

export const aiService = {
  analyzePackaging: async (image: File, language: string = 'en'): Promise<AIAnalysisResponse> => {
    const formData = new FormData()
    formData.append('image', image)
    formData.append('language', language)

    const response = await api.post('/ai/analyze-packaging', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }
}

export default api
