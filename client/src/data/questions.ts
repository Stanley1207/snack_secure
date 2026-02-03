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

// Legacy product categories for backward compatibility
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

// New food category system with subcategories
export interface SubCategory {
  id: string
  labelKey: string
}

export interface MainCategory {
  id: string
  labelKey: string
  subcategories: SubCategory[]
  allowCustom?: boolean
}

export const foodCategories: MainCategory[] = [
  {
    id: 'snacks',
    labelKey: 'categories.main.snacks',
    subcategories: [
      { id: 'chips', labelKey: 'categories.sub.chips' },
      { id: 'cookies', labelKey: 'categories.sub.cookies' },
      { id: 'candy', labelKey: 'categories.sub.candy' },
      { id: 'nuts', labelKey: 'categories.sub.nuts' },
      { id: 'dried_fruits', labelKey: 'categories.sub.dried_fruits' },
      { id: 'crackers', labelKey: 'categories.sub.crackers' },
      { id: 'popcorn', labelKey: 'categories.sub.popcorn' },
      { id: 'puffed_snacks', labelKey: 'categories.sub.puffed_snacks' },
      { id: 'jerky', labelKey: 'categories.sub.jerky' }
    ]
  },
  {
    id: 'beverages',
    labelKey: 'categories.main.beverages',
    subcategories: [
      { id: 'carbonated', labelKey: 'categories.sub.carbonated' },
      { id: 'juice', labelKey: 'categories.sub.juice' },
      { id: 'tea_drinks', labelKey: 'categories.sub.tea_drinks' },
      { id: 'coffee_drinks', labelKey: 'categories.sub.coffee_drinks' },
      { id: 'energy_drinks', labelKey: 'categories.sub.energy_drinks' },
      { id: 'water', labelKey: 'categories.sub.water' },
      { id: 'plant_protein_drinks', labelKey: 'categories.sub.plant_protein_drinks' }
    ]
  },
  {
    id: 'condiments',
    labelKey: 'categories.main.condiments',
    subcategories: [
      { id: 'soy_sauce', labelKey: 'categories.sub.soy_sauce' },
      { id: 'vinegar', labelKey: 'categories.sub.vinegar' },
      { id: 'chili_sauce', labelKey: 'categories.sub.chili_sauce' },
      { id: 'ketchup', labelKey: 'categories.sub.ketchup' },
      { id: 'oyster_sauce', labelKey: 'categories.sub.oyster_sauce' },
      { id: 'salad_dressing', labelKey: 'categories.sub.salad_dressing' },
      { id: 'spice_powder', labelKey: 'categories.sub.spice_powder' },
      { id: 'cooking_oil', labelKey: 'categories.sub.cooking_oil' }
    ]
  },
  {
    id: 'convenience',
    labelKey: 'categories.main.convenience',
    subcategories: [
      { id: 'instant_noodles', labelKey: 'categories.sub.instant_noodles' },
      { id: 'noodles_pasta', labelKey: 'categories.sub.noodles_pasta' },
      { id: 'rice', labelKey: 'categories.sub.rice' },
      { id: 'instant_porridge', labelKey: 'categories.sub.instant_porridge' },
      { id: 'self_heating', labelKey: 'categories.sub.self_heating' },
      { id: 'canned_food', labelKey: 'categories.sub.canned_food' },
      { id: 'ready_meals', labelKey: 'categories.sub.ready_meals' }
    ]
  },
  {
    id: 'bakery',
    labelKey: 'categories.main.bakery',
    subcategories: [
      { id: 'bread', labelKey: 'categories.sub.bread' },
      { id: 'cake', labelKey: 'categories.sub.cake' },
      { id: 'pastry', labelKey: 'categories.sub.pastry' },
      { id: 'mooncake', labelKey: 'categories.sub.mooncake' },
      { id: 'pie_tart', labelKey: 'categories.sub.pie_tart' },
      { id: 'chocolate', labelKey: 'categories.sub.chocolate' },
      { id: 'jelly_pudding', labelKey: 'categories.sub.jelly_pudding' }
    ]
  },
  {
    id: 'dairy',
    labelKey: 'categories.main.dairy',
    subcategories: [
      { id: 'milk', labelKey: 'categories.sub.milk' },
      { id: 'yogurt', labelKey: 'categories.sub.yogurt' },
      { id: 'cheese', labelKey: 'categories.sub.cheese' },
      { id: 'butter', labelKey: 'categories.sub.butter' },
      { id: 'cream', labelKey: 'categories.sub.cream' },
      { id: 'tofu_soy', labelKey: 'categories.sub.tofu_soy' }
    ]
  },
  {
    id: 'frozen',
    labelKey: 'categories.main.frozen',
    subcategories: [
      { id: 'frozen_meat', labelKey: 'categories.sub.frozen_meat' },
      { id: 'frozen_seafood', labelKey: 'categories.sub.frozen_seafood' },
      { id: 'frozen_vegetables', labelKey: 'categories.sub.frozen_vegetables' },
      { id: 'frozen_dumplings', labelKey: 'categories.sub.frozen_dumplings' },
      { id: 'frozen_pizza', labelKey: 'categories.sub.frozen_pizza' },
      { id: 'ice_cream', labelKey: 'categories.sub.ice_cream' }
    ]
  },
  {
    id: 'health',
    labelKey: 'categories.main.health',
    subcategories: [
      { id: 'supplements', labelKey: 'categories.sub.supplements' },
      { id: 'protein_powder', labelKey: 'categories.sub.protein_powder' },
      { id: 'nutrition_bars', labelKey: 'categories.sub.nutrition_bars' },
      { id: 'meal_replacement', labelKey: 'categories.sub.meal_replacement' },
      { id: 'organic_food', labelKey: 'categories.sub.organic_food' },
      { id: 'sugar_free', labelKey: 'categories.sub.sugar_free' }
    ]
  },
  {
    id: 'ingredients',
    labelKey: 'categories.main.ingredients',
    subcategories: [
      { id: 'rice_grains', labelKey: 'categories.sub.rice_grains' },
      { id: 'flour', labelKey: 'categories.sub.flour' },
      { id: 'dried_goods', labelKey: 'categories.sub.dried_goods' },
      { id: 'beans', labelKey: 'categories.sub.beans' },
      { id: 'sugar', labelKey: 'categories.sub.sugar' },
      { id: 'salt', labelKey: 'categories.sub.salt' },
      { id: 'tea_leaves', labelKey: 'categories.sub.tea_leaves' },
      { id: 'spices', labelKey: 'categories.sub.spices' }
    ]
  },
  {
    id: 'other',
    labelKey: 'categories.main.other',
    subcategories: [],
    allowCustom: true
  }
]

// Helper function to get category display text
export function getCategoryDisplayKey(mainCategoryId: string, subCategoryId?: string): string {
  if (subCategoryId) {
    return `categories.sub.${subCategoryId}`
  }
  return `categories.main.${mainCategoryId}`
}

// Helper function to parse stored category format (mainCategory:subCategory or custom:customName)
export function parseStoredCategory(storedCategory: string): {
  mainCategory: string
  subCategory?: string
  customCategory?: string
} {
  if (storedCategory.startsWith('custom:')) {
    return {
      mainCategory: 'other',
      customCategory: storedCategory.substring(7)
    }
  }
  const parts = storedCategory.split(':')
  return {
    mainCategory: parts[0],
    subCategory: parts[1]
  }
}

// Helper function to format category for storage
export function formatCategoryForStorage(
  mainCategory: string,
  subCategory?: string,
  customCategory?: string
): string {
  if (mainCategory === 'other' && customCategory) {
    return `custom:${customCategory}`
  }
  if (subCategory) {
    return `${mainCategory}:${subCategory}`
  }
  return mainCategory
}

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
