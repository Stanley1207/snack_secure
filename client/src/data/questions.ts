export interface Question {
  id: string
  section: 'labeling' | 'facility' | 'safety'
  questionKey: string
  helpKey: string
  weight: number
}

export interface Section {
  id: 'labeling' | 'facility' | 'safety'
  titleKey: string
  questions: Question[]
}

export const productCategories = [
  'chips',
  'cookies',
  'candy',
  'nuts',
  'dried_fruits',
  'crackers',
  'popcorn',
  'other'
] as const

export type ProductCategory = typeof productCategories[number]

export const sections: Section[] = [
  {
    id: 'labeling',
    titleKey: 'assessment.sections.labeling',
    questions: [
      {
        id: 'nutritionFacts',
        section: 'labeling',
        questionKey: 'questions.labeling.nutritionFacts.question',
        helpKey: 'questions.labeling.nutritionFacts.help',
        weight: 15
      },
      {
        id: 'ingredientList',
        section: 'labeling',
        questionKey: 'questions.labeling.ingredientList.question',
        helpKey: 'questions.labeling.ingredientList.help',
        weight: 15
      },
      {
        id: 'allergenDeclaration',
        section: 'labeling',
        questionKey: 'questions.labeling.allergenDeclaration.question',
        helpKey: 'questions.labeling.allergenDeclaration.help',
        weight: 20
      },
      {
        id: 'netQuantity',
        section: 'labeling',
        questionKey: 'questions.labeling.netQuantity.question',
        helpKey: 'questions.labeling.netQuantity.help',
        weight: 10
      },
      {
        id: 'manufacturerInfo',
        section: 'labeling',
        questionKey: 'questions.labeling.manufacturerInfo.question',
        helpKey: 'questions.labeling.manufacturerInfo.help',
        weight: 10
      },
      {
        id: 'countryOfOrigin',
        section: 'labeling',
        questionKey: 'questions.labeling.countryOfOrigin.question',
        helpKey: 'questions.labeling.countryOfOrigin.help',
        weight: 10
      }
    ]
  },
  {
    id: 'facility',
    titleKey: 'assessment.sections.facility',
    questions: [
      {
        id: 'fdaRegistration',
        section: 'facility',
        questionKey: 'questions.facility.fdaRegistration.question',
        helpKey: 'questions.facility.fdaRegistration.help',
        weight: 25
      },
      {
        id: 'priorNotice',
        section: 'facility',
        questionKey: 'questions.facility.priorNotice.question',
        helpKey: 'questions.facility.priorNotice.help',
        weight: 20
      },
      {
        id: 'fsvp',
        section: 'facility',
        questionKey: 'questions.facility.fsvp.question',
        helpKey: 'questions.facility.fsvp.help',
        weight: 15
      }
    ]
  },
  {
    id: 'safety',
    titleKey: 'assessment.sections.safety',
    questions: [
      {
        id: 'haccp',
        section: 'safety',
        questionKey: 'questions.safety.haccp.question',
        helpKey: 'questions.safety.haccp.help',
        weight: 15
      },
      {
        id: 'fsma',
        section: 'safety',
        questionKey: 'questions.safety.fsma.question',
        helpKey: 'questions.safety.fsma.help',
        weight: 20
      },
      {
        id: 'gmp',
        section: 'safety',
        questionKey: 'questions.safety.gmp.question',
        helpKey: 'questions.safety.gmp.help',
        weight: 15
      },
      {
        id: 'hazardAnalysis',
        section: 'safety',
        questionKey: 'questions.safety.hazardAnalysis.question',
        helpKey: 'questions.safety.hazardAnalysis.help',
        weight: 10
      }
    ]
  }
]

export const answerOptions = ['yes', 'no', 'partial', 'notApplicable'] as const
export type AnswerOption = typeof answerOptions[number]

export function calculateScore(answers: Record<string, string>): number {
  let totalWeight = 0
  let earnedWeight = 0

  sections.forEach(section => {
    section.questions.forEach(question => {
      const answer = answers[question.id]
      if (answer === 'notApplicable') return

      totalWeight += question.weight

      if (answer === 'yes') {
        earnedWeight += question.weight
      } else if (answer === 'partial') {
        earnedWeight += question.weight * 0.5
      }
    })
  })

  return totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0
}

export function getOverallStatus(score: number): 'passed' | 'failed' | 'partial' {
  if (score >= 80) return 'passed'
  if (score >= 50) return 'partial'
  return 'failed'
}

export function getSectionStatus(
  sectionId: string,
  answers: Record<string, string>
): 'passed' | 'failed' | 'partial' {
  const section = sections.find(s => s.id === sectionId)
  if (!section) return 'failed'

  let totalWeight = 0
  let earnedWeight = 0

  section.questions.forEach(question => {
    const answer = answers[question.id]
    if (answer === 'notApplicable') return

    totalWeight += question.weight

    if (answer === 'yes') {
      earnedWeight += question.weight
    } else if (answer === 'partial') {
      earnedWeight += question.weight * 0.5
    }
  })

  const score = totalWeight > 0 ? (earnedWeight / totalWeight) * 100 : 0

  if (score >= 80) return 'passed'
  if (score >= 50) return 'partial'
  return 'failed'
}

export function getAllQuestions(): Question[] {
  return sections.flatMap(section => section.questions)
}

export function getTotalQuestionCount(): number {
  return getAllQuestions().length
}
