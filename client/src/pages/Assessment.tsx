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
  baseSections,
  foodCategories,
  answerOptions,
  calculateScore,
  getOverallStatus,
  formatCategoryForStorage,
  MainCategory,
  requiresUSDA,
  needsMeatInquiry,
  requiresColdChain,
  getAllSections,
  usdaSection,
  coldChainSection,
  shelfLifeSection,
  SectionId
} from '../data/questions'

type Step = 'mode' | 'category' | 'meatInquiry' | 'upload' | 'labeling' | 'facility' | 'safety' | 'usda' | 'coldChain' | 'shelfLife' | 'review'

interface AIAnalysis {
  answers: Record<string, string>
  confidence: Record<string, 'high' | 'medium' | 'low'>
  observations: Record<string, string>
  overallNotes: string
}

export default function Assessment() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('mode')
  const [assessmentMode, setAssessmentMode] = useState<AssessmentMode | null>(null)

  // New category state for two-level selection
  const [selectedMainCategory, setSelectedMainCategory] = useState<MainCategory | null>(null)
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('')
  const [customCategory, setCustomCategory] = useState<string>('')

  // Meat inquiry state
  const [containsMeat, setContainsMeat] = useState<boolean | null>(null)

  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null)

  const getSteps = (): Step[] => {
    const steps: Step[] = ['mode', 'category']

    // Add meat inquiry step if needed
    if (selectedSubCategory && needsMeatInquiry(selectedSubCategory)) {
      steps.push('meatInquiry')
    }

    // Add upload step if in upload mode
    if (assessmentMode === 'upload') {
      steps.push('upload')
    }

    // Base question sections
    steps.push('labeling', 'facility', 'safety')

    // Add USDA section if meat product
    if (selectedSubCategory && (requiresUSDA(selectedSubCategory) || containsMeat === true)) {
      steps.push('usda')
    }

    // Add cold chain section if refrigerated/frozen
    if (selectedMainCategory && selectedSubCategory && requiresColdChain(selectedMainCategory.id, selectedSubCategory)) {
      steps.push('coldChain')
    }

    // Always add shelf life section
    steps.push('shelfLife')

    steps.push('review')
    return steps
  }

  const steps = getSteps()
  const currentStepIndex = steps.indexOf(step)

  const getStepLabels = (): string[] => {
    const labels: string[] = [
      t('assessmentMode.title'),
      t('assessment.selectCategory')
    ]

    // Add meat inquiry label if needed
    if (selectedSubCategory && needsMeatInquiry(selectedSubCategory)) {
      labels.push(t('assessment.meatInquiry.title'))
    }

    // Add upload label if in upload mode
    if (assessmentMode === 'upload') {
      labels.push(t('assessment.uploadImage'))
    }

    // Base sections
    labels.push(
      t('assessment.sections.labeling'),
      t('assessment.sections.facility'),
      t('assessment.sections.safety')
    )

    // Add USDA label if meat product
    if (selectedSubCategory && (requiresUSDA(selectedSubCategory) || containsMeat === true)) {
      labels.push(t('assessment.sections.usda'))
    }

    // Add cold chain label if refrigerated/frozen
    if (selectedMainCategory && selectedSubCategory && requiresColdChain(selectedMainCategory.id, selectedSubCategory)) {
      labels.push(t('assessment.sections.coldChain'))
    }

    // Always add shelf life
    labels.push(t('assessment.sections.shelfLife'))

    labels.push(t('common.save'))
    return labels
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
      const response = await aiService.analyzePackaging(selectedImage)

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

  // Get the product category string for storage
  const getProductCategory = (): string => {
    if (selectedMainCategory?.id === 'other' && customCategory) {
      return formatCategoryForStorage('other', undefined, customCategory)
    }
    if (selectedMainCategory && selectedSubCategory) {
      return formatCategoryForStorage(selectedMainCategory.id, selectedSubCategory)
    }
    return ''
  }

  // Get the section for current step
  const getSectionForStep = (currentStep: Step) => {
    if (currentStep === 'usda') return usdaSection
    if (currentStep === 'coldChain') return coldChainSection
    if (currentStep === 'shelfLife') return shelfLifeSection
    return baseSections.find(s => s.id === currentStep)
  }

  const canProceed = () => {
    if (step === 'mode') return assessmentMode !== null
    if (step === 'category') {
      // For 'other' category, need custom input
      if (selectedMainCategory?.id === 'other') {
        return customCategory.trim() !== ''
      }
      // For other categories, need both main and sub selected
      return selectedMainCategory !== null && selectedSubCategory !== ''
    }
    if (step === 'meatInquiry') return containsMeat !== null
    if (step === 'upload') return selectedImage !== null
    if (step === 'review') return true

    const section = getSectionForStep(step)
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

    const productCategory = getProductCategory()
    const activeSections = getAllSections(
      selectedMainCategory?.id || '',
      selectedSubCategory,
      containsMeat
    )
    const score = calculateScore(answers, activeSections)
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
          containsMeat,
          mainCategory: selectedMainCategory?.id || '',
          createdAt: new Date().toISOString()
        }))
        navigate(`/results/${tempId}?temp=true`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save assessment')
      setIsSubmitting(false)
    }
  }

  const handleMainCategorySelect = (category: MainCategory) => {
    setSelectedMainCategory(category)
    setSelectedSubCategory('')
    setCustomCategory('')
    setContainsMeat(null) // Reset meat inquiry when changing category
  }

  const handleBackToMainCategory = () => {
    setSelectedMainCategory(null)
    setSelectedSubCategory('')
    setCustomCategory('')
    setContainsMeat(null) // Reset meat inquiry
  }

  const handleSubCategorySelect = (subCategoryId: string) => {
    setSelectedSubCategory(subCategoryId)
    setContainsMeat(null) // Reset meat inquiry when changing subcategory
  }

  const renderModeSelection = () => (
    <AssessmentModeSelector
      selectedMode={assessmentMode}
      onSelectMode={handleModeSelect}
    />
  )

  const renderCategorySelection = () => {
    // If no main category selected, show main categories
    if (!selectedMainCategory) {
      return (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {t('assessment.selectMainCategory')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {foodCategories.map(category => (
              <button
                key={category.id}
                onClick={() => handleMainCategorySelect(category)}
                className="p-4 rounded-lg border-2 text-center transition-colors border-gray-200 hover:border-primary-300 hover:bg-primary-50"
              >
                {t(category.labelKey)}
              </button>
            ))}
          </div>
        </div>
      )
    }

    // If "other" category selected, show custom input
    if (selectedMainCategory.allowCustom) {
      return (
        <div>
          <div className="flex items-center mb-6">
            <button
              onClick={handleBackToMainCategory}
              className="text-primary-600 hover:text-primary-700 flex items-center mr-4"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t('assessment.backToMainCategory')}
            </button>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t(selectedMainCategory.labelKey)}
          </h2>
          <p className="text-gray-600 mb-6">{t('assessment.customInput')}</p>
          <input
            type="text"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            placeholder={t('assessment.customInputPlaceholder')}
            className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-colors"
          />
        </div>
      )
    }

    // Show subcategories
    return (
      <div>
        <div className="flex items-center mb-6">
          <button
            onClick={handleBackToMainCategory}
            className="text-primary-600 hover:text-primary-700 flex items-center mr-4"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('assessment.backToMainCategory')}
          </button>
          <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
            {t(selectedMainCategory.labelKey)}
          </span>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {t('assessment.selectSubCategory')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {selectedMainCategory.subcategories.map(sub => (
            <button
              key={sub.id}
              onClick={() => handleSubCategorySelect(sub.id)}
              className={`p-4 rounded-lg border-2 text-center transition-colors ${
                selectedSubCategory === sub.id
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {t(sub.labelKey)}
            </button>
          ))}
        </div>
      </div>
    )
  }

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

  const renderMeatInquiry = () => (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        {t('assessment.meatInquiry.title')}
      </h2>
      <p className="text-gray-600 mb-6">
        {t('assessment.meatInquiry.description')}
      </p>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-yellow-800 text-sm">
          {t('assessment.meatInquiry.warning')}
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => setContainsMeat(true)}
          className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
            containsMeat === true
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <span className="font-medium">{t('assessment.meatInquiry.yes')}</span>
          <p className="text-sm text-gray-500 mt-1">{t('assessment.meatInquiry.yesDesc')}</p>
        </button>
        <button
          onClick={() => setContainsMeat(false)}
          className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
            containsMeat === false
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <span className="font-medium">{t('assessment.meatInquiry.no')}</span>
          <p className="text-sm text-gray-500 mt-1">{t('assessment.meatInquiry.noDesc')}</p>
        </button>
      </div>
    </div>
  )

  const renderQuestions = (sectionId: SectionId) => {
    const section = getSectionForStep(sectionId as Step)
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
    // Get dynamic sections based on product type
    const activeSections = getAllSections(
      selectedMainCategory?.id || '',
      selectedSubCategory,
      containsMeat
    )
    const score = calculateScore(answers, activeSections)
    const status = getOverallStatus(score)

    // Get display text for category
    const getCategoryDisplayText = () => {
      if (selectedMainCategory?.id === 'other' && customCategory) {
        return customCategory
      }
      if (selectedMainCategory && selectedSubCategory) {
        const sub = selectedMainCategory.subcategories.find(s => s.id === selectedSubCategory)
        return `${t(selectedMainCategory.labelKey)} > ${sub ? t(sub.labelKey) : selectedSubCategory}`
      }
      return ''
    }

    // Check if product requires special regulatory compliance
    const showUsdaWarning = requiresUSDA(selectedSubCategory) || containsMeat === true
    const showColdChainWarning = selectedMainCategory && requiresColdChain(selectedMainCategory.id, selectedSubCategory)

    return (
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {t('assessment.title')} - {t('common.save')}
        </h2>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="font-medium">{t('results.category')}:</span>
            <span className="text-gray-700">{getCategoryDisplayText()}</span>
          </div>
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
          {step === 'meatInquiry' && renderMeatInquiry()}
          {step === 'upload' && renderImageUpload()}
          {step === 'labeling' && renderQuestions('labeling')}
          {step === 'facility' && renderQuestions('facility')}
          {step === 'safety' && renderQuestions('safety')}
          {step === 'usda' && renderQuestions('usda')}
          {step === 'coldChain' && renderQuestions('coldChain')}
          {step === 'shelfLife' && renderQuestions('shelfLife')}
          {step === 'review' && renderReview()}
        </div>

        {renderNavButtons()}
      </div>
    </div>
  )
}
