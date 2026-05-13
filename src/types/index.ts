// ===== 血糖记录 =====
export type GlucoseType = 'fasting' | 'before_meal' | 'after_meal' | 'before_sleep' | 'random'

export interface GlucoseRecord {
  id?: number
  value: number // mmol/L
  type: GlucoseType
  mealRelation: 'before' | 'after' | 'none'
  timestamp: number
  note?: string
  createdAt: number
}

// ===== 餐食记录 =====
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'
export type ReviewStatus = 'pending' | 'reviewing' | 'reviewed' | 'error'

export interface MealRecord {
  id?: number
  photoData: string // base64 压缩图
  thumbnailData: string // 缩略图
  mealType: MealType
  timestamp: number
  reviewStatus: ReviewStatus
  reviewScore?: number
  reviewSummary?: string
  stapleWarning?: string
  dangerFoods?: string
  suggestions?: string
  nextMeal?: string
  foodItems?: string // JSON string of FoodItem[]
  overeating?: boolean
  alertTriggered?: boolean
  createdAt: number
}

export interface FoodItem {
  name: string
  gi: string  // 升糖指数: 高/中/低
  risk: string // 简短风险说明
}

export interface AIReviewResult {
  score: number
  overeating: boolean
  summary: string
  stapleWarning: string
  dangerFoods: string
  suggestions: string[]
  nextMeal: string
  foodItems: FoodItem[]
}

// ===== 设置 =====
export type FontMode = 'normal' | 'large'

export interface AppSettings {
  qwenApiKey: string
  highBgThreshold: number // 默认 13.9
  lowBgThreshold: number // 默认 3.9
  alertScoreThreshold: number // 默认 4（评分 ≤ 此值触发告警）
  fontMode: FontMode
  updatedAt: number
}

// ===== 告警 =====
export type AlertType = 'overeating' | 'diet_warning' | 'high_bg' | 'low_bg'

export interface AlertLog {
  id?: number
  type: AlertType
  message: string
  relatedRecordId?: number
  relatedRecordType: 'meal' | 'glucose'
  timestamp: number
  dismissed: boolean
}

// ===== 导航 =====
export type TabKey = 'home' | 'record' | 'meal'
