import { useEffect, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { assessmentService, Assessment } from '../services/api'
import ResultCard from '../components/ResultCard'
import { Button } from '../components/FormElements'
import {
  sections,
  calculateScore,
  getOverallStatus,
  getSectionStatus
} from '../data/questions'

export default function Results() {
  const { t } = useTranslation()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const isTemp = searchParams.get('temp') === 'true'

  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAssessment = async () => {
      if (!id) return

      try {
        if (isTemp) {
          const stored = sessionStorage.getItem(`assessment_${id}`)
          if (stored) {
            const data = JSON.parse(stored)
            setAssessment({
              id: parseInt(id),
              userId: 0,
              productCategory: data.productCategory,
              answers: data.answers,
              score: data.score,
              status: data.status,
              createdAt: data.createdAt
            })
          }
        } else {
          const data = await assessmentService.getById(parseInt(id))
          setAssessment(data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load assessment')
      } finally {
        setLoading(false)
      }
    }

    fetchAssessment()
  }, [id, isTemp])

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (error || !assessment) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-700">{error || 'Assessment not found'}</p>
          <Link to="/assessment" className="text-primary-600 hover:underline mt-4 block">
            {t('results.newAssessment')}
          </Link>
        </div>
      </div>
    )
  }

  const score = calculateScore(assessment.answers)
  const status = getOverallStatus(score)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {t('results.title')}
        </h1>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-sm text-gray-500 mb-1">{t('results.category')}</p>
            <p className="text-lg font-medium">
              {t(`assessment.categories.${assessment.productCategory}`)}
            </p>
          </div>

          <div className={`rounded-lg p-6 ${
            status === 'passed' ? 'bg-green-50' :
            status === 'partial' ? 'bg-yellow-50' : 'bg-red-50'
          }`}>
            <p className="text-sm text-gray-500 mb-1">{t('results.score')}</p>
            <div className="flex items-center justify-between">
              <p className={`text-3xl font-bold ${
                status === 'passed' ? 'text-green-600' :
                status === 'partial' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {score}%
              </p>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                status === 'passed' ? 'bg-green-100 text-green-800' :
                status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {t(`results.${status}`)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <Button onClick={handlePrint} variant="outline">
            {t('results.printReport')}
          </Button>
          <Link to="/assessment">
            <Button>{t('results.newAssessment')}</Button>
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        {sections.map(section => {
          const sectionStatus = getSectionStatus(section.id, assessment.answers)

          const items = section.questions.map(question => {
            const answer = assessment.answers[question.id]
            let itemStatus: 'passed' | 'failed' | 'partial' | 'na' = 'failed'

            if (answer === 'yes') itemStatus = 'passed'
            else if (answer === 'partial') itemStatus = 'partial'
            else if (answer === 'notApplicable') itemStatus = 'na'

            return {
              label: t(question.questionKey),
              status: itemStatus,
              recommendation: itemStatus === 'failed' ? t(`recommendations.${question.id}`) : undefined
            }
          })

          return (
            <ResultCard
              key={section.id}
              title={t(section.titleKey)}
              status={sectionStatus}
              items={items}
            />
          )
        })}
      </div>

      {score < 100 && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            {t('results.recommendations')}
          </h3>
          <p className="text-blue-700">
            {sections.flatMap(s => s.questions)
              .filter(q => assessment.answers[q.id] === 'no')
              .length > 0
              ? `${sections.flatMap(s => s.questions).filter(q => assessment.answers[q.id] === 'no').length} items need attention. Review the recommendations above for each failed item.`
              : t('results.noRecommendations')
            }
          </p>
        </div>
      )}
    </div>
  )
}
