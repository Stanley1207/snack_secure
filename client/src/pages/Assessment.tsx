import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { assessmentService, aiService } from '../services/api'
import { RadioGroup, Button } from '../components/FormElements'
import ProgressIndicator from '../components/ProgressIndicator'
import AssessmentModeSelector, { AssessmentMode } from '../components/AssessmentModeSelector'
import ImageUpload from '../components/ImageUpload'
import AIAnalysisResults from '../components/AIAnalysisResults'
import {
  sections,
  productCategories,
  answerOptions,
  calculateScore,
  getOverallStatus
} from '../data/questions'

type Step = 'mode' | 'category' | 'upload' | 'labeling' | 'facility' | 'safety' | 'review'

interface AIAnalysis {
  answers: Record<string, string>
  confidence: Record<string, 'high' | 'medium' | 'low'>
  observations: Record<string, string>
  overallNotes: string
}

export default function Assessment() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('mode')
  const [assessmentMode, setAssessmentMode] = useState<AssessmentMode | null>(null)
  const [productCategory, setProductCategory] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null)

  const getSteps = (): Step[] => {
    if (assessmentMode === 'upload') {
      return ['mode', 'category', 'upload', 'labeling', 'facility', 'safety', 'review']
    }
    return ['mode', 'category', 'labeling', 'facility', 'safety', 'review']
  }

  const steps = getSteps()
  const currentStepIndex = steps.indexOf(step)

  const getStepLabels = (): string[] => {
    const base = [
      t('assessmentMode.title'),
      t('assessment.selectCategory')
    ]
    if (assessmentMode === 'upload') {
      base.push(t('assessment.uploadImage'))
    }
    base.push(
      t('assessment.sections.labeling'),
      t('assessment.sections.facility'),
      t('assessment.sections.safety'),
      t('common.save')
    )
    return base
  }

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const handleModeSelect = (mode: AssessmentMode) => {
    setAssessmentMode(mode)
  }

  const handleImageSelect = (file: File | null) => {
    setSelectedImage(file)
    if (!file) {
      setAiAnalysis(null)
    }
  }

  const handleAnalyzeImage = async () => {
    if (!selectedImage) return

    setIsAnalyzing(true)
    setError('')

    try {
      const response = await aiService.analyzePackaging(selectedImage, i18n.language)

      if (response.success && response.analysis) {
        setAiAnalysis(response.analysis)
        setAnswers(prev => ({
          ...prev,
          ...response.analysis!.answers
        }))
        handleNext()
      } else {
        setError(response.error || t('aiAnalysis.analysisFailed'))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('aiAnalysis.analysisFailed'))
    } finally {
      setIsAnalyzing(false)
    }
  }

  const canProceed = () => {
    if (step === 'mode') return assessmentMode !== null
    if (step === 'category') return productCategory !== ''
    if (step === 'upload') return selectedImage !== null
    if (step === 'review') return true

    const section = sections.find(s => s.id === step)
    if (!section) return false

    return section.questions.every(q => answers[q.id])
  }

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < steps.length) {
      setStep(steps[nextIndex])
    }
  }

  const handlePrevious = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setStep(steps[prevIndex])
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError('')

    const score = calculateScore(answers)
    const status = getOverallStatus(score)

    try {
      if (user) {
        const assessment = await assessmentService.create({
          productCategory,
          answers
        })
        navigate(`/results/${assessment.id}`)
      } else {
        const tempId = Date.now()
        sessionStorage.setItem(`assessment_${tempId}`, JSON.stringify({
          productCategory,
          answers,
          score,
          status,
          createdAt: new Date().toISOString()
        }))
        navigate(`/results/${tempId}?temp=true`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save assessment')
      setIsSubmitting(false)
    }
  }

  const renderModeSelection = () => (
    <AssessmentModeSelector
      selectedMode={assessmentMode}
      onSelectMode={handleModeSelect}
    />
  )

  const renderCategorySelection = () => (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {t('assessment.selectCategory')}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {productCategories.map(category => (
          <button
            key={category}
            onClick={() => setProductCategory(category)}
            className={`p-4 rounded-lg border-2 text-center transition-colors ${
              productCategory === category
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {t(`assessment.categories.${category}`)}
          </button>
        ))}
      </div>
    </div>
  )

  const renderImageUpload = () => (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        {t('imageUpload.title')}
      </h2>
      <p className="text-gray-600 mb-6">
        {t('imageUpload.description')}
      </p>

      <ImageUpload
        onImageSelect={handleImageSelect}
        selectedImage={selectedImage}
        disabled={isAnalyzing}
      />

      {selectedImage && (
        <div className="mt-6 flex justify-center">
          <Button
            onClick={handleAnalyzeImage}
            isLoading={isAnalyzing}
            disabled={!selectedImage}
          >
            {isAnalyzing ? t('assessment.analyzing') : t('assessment.analyzeWithAI')}
          </Button>
        </div>
      )}
    </div>
  )

  const renderQuestions = (sectionId: 'labeling' | 'facility' | 'safety') => {
    const section = sections.find(s => s.id === sectionId)
    if (!section) return null

    if (sectionId === 'labeling' && aiAnalysis && assessmentMode === 'upload') {
      return (
        <AIAnalysisResults
          analysis={aiAnalysis}
          currentAnswers={answers}
          onAnswerChange={handleAnswerChange}
        />
      )
    }

    return (
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {t(section.titleKey)}
        </h2>
        <div className="space-y-8">
          {section.questions.map(question => (
            <div key={question.id} className="bg-gray-50 rounded-lg p-6">
              <p className="font-medium text-gray-900 mb-2">
                {t(question.questionKey)}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                {t(question.helpKey)}
              </p>
              <RadioGroup
                name={question.id}
                options={answerOptions.map(opt => ({
                  value: opt,
                  label: t(`answers.${opt}`)
                }))}
                value={answers[question.id] || ''}
                onChange={(value) => handleAnswerChange(question.id, value)}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderReview = () => {
    const score = calculateScore(answers)
    const status = getOverallStatus(score)

    return (
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {t('assessment.title')} - {t('common.save')}
        </h2>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="font-medium">{t('results.score')}:</span>
            <span className={`text-2xl font-bold ${
              status === 'passed' ? 'text-green-600' :
              status === 'partial' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {score}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">{t('results.overallStatus')}:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              status === 'passed' ? 'bg-green-100 text-green-800' :
              status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {t(`results.${status}`)}
            </span>
          </div>
        </div>

        {!user && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-700">
              {t('auth.noAccount')}{' '}
              <a href="/register" className="underline">{t('auth.register')}</a>
              {' '}{t('common.save').toLowerCase()}
            </p>
          </div>
        )}
      </div>
    )
  }

  const renderNavButtons = () => {
    if (step === 'upload') {
      return (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
          >
            {t('assessment.previous')}
          </Button>
          <div />
        </div>
      )
    }

    return (
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStepIndex === 0}
        >
          {t('assessment.previous')}
        </Button>

        {step === 'review' ? (
          <Button
            onClick={handleSubmit}
            disabled={!canProceed()}
            isLoading={isSubmitting}
          >
            {t('assessment.submit')}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
          >
            {t('assessment.next')}
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {t('assessment.title')}
        </h1>

        <div className="mb-8">
          <ProgressIndicator
            current={currentStepIndex + 1}
            total={steps.length}
            labels={getStepLabels()}
          />
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="mb-8">
          {step === 'mode' && renderModeSelection()}
          {step === 'category' && renderCategorySelection()}
          {step === 'upload' && renderImageUpload()}
          {step === 'labeling' && renderQuestions('labeling')}
          {step === 'facility' && renderQuestions('facility')}
          {step === 'safety' && renderQuestions('safety')}
          {step === 'review' && renderReview()}
        </div>

        {renderNavButtons()}
      </div>
    </div>
  )
}
