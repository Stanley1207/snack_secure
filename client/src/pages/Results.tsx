import { useEffect, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { assessmentService, Assessment, aiService, AISummaryResponse } from '../services/api'
import ResultCard from '../components/ResultCard'
import { Button } from '../components/FormElements'
import {
  calculateScore,
  getOverallStatus,
  getSectionStatus,
  parseStoredCategory,
  foodCategories,
  getAllSections,
  requiresUSDA,
  requiresColdChain,
  Question
} from '../data/questions'

export default function Results() {
  const { t, i18n } = useTranslation()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const isTemp = searchParams.get('temp') === 'true'

  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [containsMeat, setContainsMeat] = useState<boolean | null>(null)
  const [mainCategory, setMainCategory] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [aiSummary, setAiSummary] = useState<AISummaryResponse['summary'] | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState('')

  // Helper function to display category
  const getCategoryDisplay = (storedCategory: string): string => {
    // Try to parse as new format first
    const parsed = parseStoredCategory(storedCategory)

    // If it's a custom category
    if (parsed.customCategory) {
      return parsed.customCategory
    }

    // If it's a main:sub format
    if (parsed.subCategory) {
      const mainCat = foodCategories.find(c => c.id === parsed.mainCategory)
      if (mainCat) {
        const subCat = mainCat.subcategories.find(s => s.id === parsed.subCategory)
        if (subCat) {
          return `${t(mainCat.labelKey)} > ${t(subCat.labelKey)}`
        }
      }
    }

    // Fall back to old format (legacy support)
    const legacyKey = `assessment.categories.${storedCategory}`
    const translated = t(legacyKey)
    // If translation exists and is different from the key, use it
    if (translated !== legacyKey) {
      return translated
    }

    // Last resort: return the raw value
    return storedCategory
  }

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
            // Store additional metadata from session
            setContainsMeat(data.containsMeat ?? null)
            setMainCategory(data.mainCategory ?? '')
          }
        } else {
          const data = await assessmentService.getById(parseInt(id))
          setAssessment(data)
          // For saved assessments, infer from category
          const parsed = parseStoredCategory(data.productCategory)
          setMainCategory(parsed.mainCategory)
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

  // Parse category to determine special requirements
  const parsed = parseStoredCategory(assessment.productCategory)
  const subCategory = parsed.subCategory || ''

  // Determine special regulatory requirements
  const showUsdaWarning = requiresUSDA(subCategory) || containsMeat === true
  const showColdChainWarning = requiresColdChain(mainCategory || parsed.mainCategory, subCategory)

  // Get all applicable sections based on product type
  const activeSections = getAllSections(
    mainCategory || parsed.mainCategory,
    subCategory,
    containsMeat
  )

  const score = calculateScore(assessment.answers, activeSections)
  const status = getOverallStatus(score)

  // Get all failed items for the missing compliance items list
  const getFailedItems = (): { question: Question; sectionTitle: string }[] => {
    const failed: { question: Question; sectionTitle: string }[] = []
    activeSections.forEach(section => {
      section.questions.forEach(question => {
        const answer = assessment.answers[question.id]
        if (answer === 'no' || (!answer && answer !== 'notApplicable')) {
          failed.push({ question, sectionTitle: t(section.titleKey) })
        }
      })
    })
    return failed
  }

  const failedItems = getFailedItems()

  const fetchAISummary = async () => {
    if (!assessment || failedItems.length === 0) return

    setSummaryLoading(true)
    setSummaryError('')
    try {
      const response = await aiService.summarizeResults({
        productCategory: getCategoryDisplay(assessment.productCategory),
        failedItems: failedItems.map(f => t(f.question.questionKey)),
        answers: assessment.answers,
        language: i18n.language,
        score
      })
      if (response.success && response.summary) {
        setAiSummary(response.summary)
      } else {
        setSummaryError(response.error || t('results.aiSummary.error'))
      }
    } catch (err) {
      setSummaryError(err instanceof Error ? err.message : t('results.aiSummary.error'))
    } finally {
      setSummaryLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {t('results.title')}
        </h1>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-sm text-gray-500 mb-1">{t('results.category')}</p>
            <p className="text-lg font-medium">
              {getCategoryDisplay(assessment.productCategory)}
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

        {/* Special regulatory warnings */}
        {showUsdaWarning && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 font-medium flex items-center">
              <span className="mr-2">⚠️</span>
              {t('results.usdaWarning')}
            </p>
          </div>
        )}
        {showColdChainWarning && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-blue-800 font-medium flex items-center">
              <span className="mr-2">❄️</span>
              {t('results.coldChainWarning')}
            </p>
          </div>
        )}

        {/* CTA Buttons based on status */}
        <div className="mt-6 p-6 rounded-lg border-2 border-dashed border-gray-200">
          {status !== 'passed' ? (
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('results.cta.failedTitle')}
              </h3>
              <p className="text-gray-600 mb-4">
                {t('results.cta.failedDescription')}
              </p>
              <a
                href="https://gotomarket.com/contact"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button className="bg-primary-600 hover:bg-primary-700">
                  {t('results.cta.failedButton')}
                </Button>
              </a>
            </div>
          ) : (
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                {t('results.cta.passedTitle')}
              </h3>
              <p className="text-gray-600 mb-4">
                {t('results.cta.passedDescription')}
              </p>
              <a
                href="https://gotomarket.com/upload"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button className="bg-green-600 hover:bg-green-700">
                  {t('results.cta.passedButton')}
                </Button>
              </a>
            </div>
          )}
        </div>

        <div className="flex space-x-4 mt-6">
          <Button onClick={handlePrint} variant="outline">
            {t('results.printReport')}
          </Button>
          <Link to="/assessment">
            <Button>{t('results.newAssessment')}</Button>
          </Link>
        </div>
      </div>

      {/* Missing Compliance Items List */}
      {failedItems.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {t('results.missingItems.title')}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('results.missingItems.description', { count: failedItems.length })}
          </p>
          <ul className="space-y-4">
            {failedItems.map(({ question, sectionTitle }) => (
              <li key={question.id} className="border-l-4 border-red-400 pl-4 py-2">
                <div className="flex items-start">
                  <span className="text-red-500 mr-2">✗</span>
                  <div>
                    <p className="font-medium text-gray-900">
                      {t(question.questionKey)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {sectionTitle}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      {t(`recommendations.${question.id}`)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* AI Summary Section */}
      {failedItems.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-sm border border-purple-200 p-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <span className="mr-2">🤖</span>
              {t('results.aiSummary.title')}
            </h2>
            {!aiSummary && (
              <Button
                onClick={fetchAISummary}
                disabled={summaryLoading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {summaryLoading ? t('results.aiSummary.loading') : t('results.aiSummary.generate')}
              </Button>
            )}
          </div>

          {summaryLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mr-3" />
              <span className="text-purple-700">{t('results.aiSummary.analyzing')}</span>
            </div>
          )}

          {summaryError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{summaryError}</p>
              <Button
                onClick={fetchAISummary}
                variant="outline"
                className="mt-2"
              >
                {t('common.retry')}
              </Button>
            </div>
          )}

          {aiSummary && (
            <div className="space-y-6">
              {/* Overview */}
              <div className="bg-white/60 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">{aiSummary.overview}</p>
              </div>

              {/* Priority Actions */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">🎯</span>
                  {t('results.aiSummary.priorityActions')}
                </h3>
                <ul className="space-y-3">
                  {aiSummary.priorityActions.map((action, i) => (
                    <li key={i} className="flex items-start bg-white/60 rounded-lg p-3">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-3 flex-shrink-0 ${
                        action.priority === 'high' ? 'bg-red-100 text-red-700' :
                        action.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {action.priority === 'high' ? '!' : action.priority === 'medium' ? '◐' : '○'}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">{action.item}</p>
                        <p className="text-sm text-gray-600 mt-1">{action.action}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Detailed Steps */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">📋</span>
                  {t('results.aiSummary.detailedSteps')}
                </h3>
                <ol className="space-y-2 list-decimal list-inside bg-white/60 rounded-lg p-4">
                  {aiSummary.detailedSteps.map((step, i) => (
                    <li key={i} className="text-gray-700 leading-relaxed">{step}</li>
                  ))}
                </ol>
              </div>

              {/* Estimated Effort */}
              <div className="bg-white/60 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <span className="mr-2">⏱️</span>
                  {t('results.aiSummary.estimatedEffort')}
                </h3>
                <p className="text-gray-700">{aiSummary.estimatedEffort}</p>
              </div>

              {/* Regenerate button */}
              <div className="text-center pt-4">
                <Button
                  onClick={fetchAISummary}
                  variant="outline"
                  disabled={summaryLoading}
                  className="text-purple-600 border-purple-300 hover:bg-purple-50"
                >
                  {t('results.aiSummary.regenerate')}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-6">
        {activeSections.map(section => {
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
            {activeSections.flatMap(s => s.questions)
              .filter(q => assessment.answers[q.id] === 'no')
              .length > 0
              ? t('results.itemsNeedAttention', { count: activeSections.flatMap(s => s.questions).filter(q => assessment.answers[q.id] === 'no').length })
              : t('results.noRecommendations')
            }
          </p>
        </div>
      )}
    </div>
  )
}
