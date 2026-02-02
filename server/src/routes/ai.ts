import express from 'express'
import multer from 'multer'
import { GoogleGenerativeAI } from '@google/generative-ai'

const router = express.Router()

const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'))
    }
  }
})

const buildPrompt = (language: string) => {
  const languageNote = language === 'zh'
    ? 'Provide observations in Chinese (Simplified).'
    : 'Provide observations in English.'

  return `You are an FDA compliance expert analyzing snack packaging images. Analyze this image for the following 6 FDA labeling requirements and provide your assessment.

For each requirement, respond with:
- answer: "yes" (fully compliant), "no" (not present/non-compliant), "partial" (present but incomplete), or "notVisible" (cannot determine from image)
- confidence: "high", "medium", or "low"
- observation: Brief explanation of what you observed

Requirements to analyze:
1. nutritionFacts - Is there a Nutrition Facts panel in FDA format? Look for serving size, calories, nutrients.
2. ingredientList - Is there an ingredient list? Check if ingredients appear to be in descending order by weight.
3. allergenDeclaration - Are allergens declared? Look for "Contains:" statement or bold allergens (milk, eggs, fish, shellfish, tree nuts, peanuts, wheat, soybeans, sesame).
4. netQuantity - Is net quantity shown in both metric (g, ml) and US customary (oz) units?
5. manufacturerInfo - Is there manufacturer/distributor name and address?
6. countryOfOrigin - Is country of origin marked (e.g., "Product of...", "Made in...")?

${languageNote}

Respond ONLY with valid JSON in this exact format:
{
  "answers": {
    "nutritionFacts": "yes|no|partial|notVisible",
    "ingredientList": "yes|no|partial|notVisible",
    "allergenDeclaration": "yes|no|partial|notVisible",
    "netQuantity": "yes|no|partial|notVisible",
    "manufacturerInfo": "yes|no|partial|notVisible",
    "countryOfOrigin": "yes|no|partial|notVisible"
  },
  "confidence": {
    "nutritionFacts": "high|medium|low",
    "ingredientList": "high|medium|low",
    "allergenDeclaration": "high|medium|low",
    "netQuantity": "high|medium|low",
    "manufacturerInfo": "high|medium|low",
    "countryOfOrigin": "high|medium|low"
  },
  "observations": {
    "nutritionFacts": "observation text",
    "ingredientList": "observation text",
    "allergenDeclaration": "observation text",
    "netQuantity": "observation text",
    "manufacturerInfo": "observation text",
    "countryOfOrigin": "observation text"
  },
  "overallNotes": "Brief overall assessment of the packaging compliance"
}`
}

type AnswerValue = 'yes' | 'no' | 'partial' | 'notVisible' | 'notApplicable'
type ConfidenceValue = 'high' | 'medium' | 'low'

interface AnalysisResponse {
  answers: Record<string, AnswerValue>
  confidence: Record<string, ConfidenceValue>
  observations: Record<string, string>
  overallNotes: string
}

router.post('/analyze-packaging', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image uploaded' })
    }

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY
    if (!apiKey) {
      return res.status(500).json({ success: false, error: 'AI service not configured' })
    }

    const language = (req.body.language as string) || 'en'
    const imageBase64 = req.file.buffer.toString('base64')

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })

    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: req.file.mimetype
      }
    }

    const result = await model.generateContent([
      buildPrompt(language),
      imagePart
    ])

    const response = result.response
    const textContent = response.text()

    if (!textContent) {
      return res.status(500).json({ success: false, error: 'Invalid AI response' })
    }

    let analysis: AnalysisResponse
    try {
      const jsonMatch = textContent.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }
      analysis = JSON.parse(jsonMatch[0])
    } catch {
      return res.status(500).json({ success: false, error: 'Failed to parse AI response' })
    }

    const normalizedAnswers: Record<string, AnswerValue> = {}
    for (const [key, value] of Object.entries(analysis.answers)) {
      if (value === 'notVisible') {
        normalizedAnswers[key] = 'notApplicable'
      } else {
        normalizedAnswers[key] = value as AnswerValue
      }
    }

    res.json({
      success: true,
      analysis: {
        answers: normalizedAnswers,
        confidence: analysis.confidence,
        observations: analysis.observations,
        overallNotes: analysis.overallNotes
      }
    })
  } catch (error) {
    console.error('AI analysis error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Analysis failed'
    })
  }
})

export default router
