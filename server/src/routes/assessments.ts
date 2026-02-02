import { Router, Response } from 'express'
import { assessmentModel } from '../models/db.js'
import { authenticateToken, AuthRequest } from '../middleware/auth.js'

const router = Router()

router.use(authenticateToken)

router.post('/', (req: AuthRequest, res: Response) => {
  try {
    const { productCategory, answers, score, status } = req.body
    const userId = req.userId!

    if (!productCategory || !answers) {
      return res.status(400).json({ error: 'Product category and answers are required' })
    }

    const assessment = assessmentModel.create(
      userId,
      productCategory,
      answers,
      score || 0,
      status || 'pending'
    )

    res.status(201).json({
      id: assessment.id,
      userId: assessment.user_id,
      productCategory: assessment.product_category,
      answers: JSON.parse(assessment.answers),
      score: assessment.score,
      status: assessment.status,
      createdAt: assessment.created_at
    })
  } catch (error) {
    console.error('Create assessment error:', error)
    res.status(500).json({ error: 'Failed to create assessment' })
  }
})

router.get('/', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!
    const assessments = assessmentModel.findByUserId(userId)

    res.json(assessments.map(a => ({
      id: a.id,
      userId: a.user_id,
      productCategory: a.product_category,
      answers: JSON.parse(a.answers),
      score: a.score,
      status: a.status,
      createdAt: a.created_at
    })))
  } catch (error) {
    console.error('Get assessments error:', error)
    res.status(500).json({ error: 'Failed to fetch assessments' })
  }
})

router.get('/:id', (req: AuthRequest, res: Response) => {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const assessmentId = parseInt(idParam)
    const assessment = assessmentModel.findById(assessmentId)

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' })
    }

    if (assessment.user_id !== req.userId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    res.json({
      id: assessment.id,
      userId: assessment.user_id,
      productCategory: assessment.product_category,
      answers: JSON.parse(assessment.answers),
      score: assessment.score,
      status: assessment.status,
      createdAt: assessment.created_at
    })
  } catch (error) {
    console.error('Get assessment error:', error)
    res.status(500).json({ error: 'Failed to fetch assessment' })
  }
})

router.delete('/:id', (req: AuthRequest, res: Response) => {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const assessmentId = parseInt(idParam)
    const userId = req.userId!

    const deleted = assessmentModel.delete(assessmentId, userId)

    if (!deleted) {
      return res.status(404).json({ error: 'Assessment not found or access denied' })
    }

    res.json({ message: 'Assessment deleted successfully' })
  } catch (error) {
    console.error('Delete assessment error:', error)
    res.status(500).json({ error: 'Failed to delete assessment' })
  }
})

export default router
