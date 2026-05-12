import { useState, useEffect } from 'react'
import { getMeal } from '../services/mealService'
import { MEAL_TYPE_LABELS, getScoreStyle } from '../utils/constants'
import ScoreDisplay from '../components/ScoreDisplay'
import type { MealRecord } from '../types'

interface Props { params: { id: number }; onNavigate: (page: string) => void }

export default function MealDetailPage({ params, onNavigate }: Props) {
  const [meal, setMeal] = useState<MealRecord | null>(null)

  useEffect(() => { getMeal(params.id).then((m) => { if (m) setMeal(m) }) }, [params.id])

  if (!meal) return <div className="px-5 py-12 text-center text-secondary">加载中...</div>

  const suggestions: string[] = meal.suggestions ? JSON.parse(meal.suggestions) : []
  const foodItems: Array<{ name: string; gi: string; risk: string }> = meal.foodItems ? JSON.parse(meal.foodItems) : []

  const giBg = (gi: string) => gi === '高' ? '#FFF0EC' : gi === '中' ? '#FFF8E1' : '#F2FAF0'
  const giColor = (gi: string) => gi === '高' ? '#E57373' : gi === '中' ? '#C79520' : '#5B9E4F'
  const giBorder = (gi: string) => gi === '高' ? '#E57373' : gi === '中' ? '#E8C560' : '#7EBF73'
  const giLabel = (gi: string) => gi === '高' ? '高升糖' : gi === '中' ? '中升糖' : '低升糖'

  return (
    <div className="page-fade-in px-5 pb-32 pt-6">
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => onNavigate('history')} className="text-[22px] text-secondary active:text-coral transition-colors">← 返回</button>
        <button onClick={() => onNavigate('home')} className="h-11 px-4 rounded-full text-[20px] font-medium text-coral bg-coral-soft active:scale-95 transition-transform">🏠 首页</button>
      </div>

      <div className="bg-white rounded-card overflow-hidden shadow-card mb-4">
        <img src={meal.photoData} alt="" className="w-full block" />
      </div>

      <div className="bg-white rounded-card px-5 py-4 shadow-card mb-4 flex justify-between items-center">
        <div>
          <span className="text-[21px] font-semibold text-primary">{MEAL_TYPE_LABELS[meal.mealType]?.emoji} {MEAL_TYPE_LABELS[meal.mealType]?.label}</span>
          <p className="text-[18px] text-tertiary mt-0.5">{new Date(meal.timestamp).toLocaleString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        {meal.reviewScore !== undefined && (
          <span className="text-[42px] font-bold" style={{ color: getScoreStyle(meal.reviewScore).color }}>{meal.reviewScore}<span className="text-[21px] text-secondary font-normal">分</span></span>
        )}
      </div>

      {meal.reviewStatus === 'reviewed' && meal.reviewScore !== undefined && (
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-card p-5 text-center shadow-card">
            <ScoreDisplay score={meal.reviewScore} size="md" />
            <p className="text-[22px] font-semibold text-primary mt-2">{meal.reviewSummary}</p>
          </div>

          {foodItems.length > 0 && (
            <div className="bg-white rounded-card p-5 shadow-card">
              <p className="text-[20px] font-semibold text-primary mb-3">🔬 食物升糖分析</p>
              <div className="flex flex-col gap-2">
                {foodItems.map((f, i) => (
                  <div key={i} className="flex items-center justify-between py-2 px-3 rounded-[12px]" style={{ background: giBg(f.gi) }}>
                    <span className="text-[20px] font-medium text-primary">{f.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[17px] px-2 py-0.5 rounded-full font-semibold" style={{ background: giBg(f.gi), color: giColor(f.gi), border: `1.5px solid ${giBorder(f.gi)}` }}>{giLabel(f.gi)}</span>
                      <span className="text-[18px] text-secondary">{f.risk}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-card p-5 shadow-card flex flex-col gap-3.5">
            <div><span className="text-[20px] font-semibold">🍚 主食</span><span className="text-[20px] text-secondary ml-2">{meal.stapleWarning}</span></div>
            {meal.dangerFoods && meal.dangerFoods !== '无' && <div><span className="text-[20px] font-semibold">⚠️ 警惕</span><span className="text-[20px] text-red ml-2">{meal.dangerFoods}</span></div>}
            {suggestions.length > 0 && (
              <div>
                <span className="text-[20px] font-semibold">💡 建议</span>
                <ul className="mt-1.5 ml-4 space-y-1">
                  {suggestions.map((s, i) => <li key={i} className="text-[20px] text-secondary">{s}</li>)}
                </ul>
              </div>
            )}
            {meal.nextMeal && (
              <div className="bg-green-bg rounded-card p-4" style={{ border: '1px solid #C8E6C9' }}>
                <span className="text-[20px] font-semibold text-green">🥗 下一顿这样吃</span>
                <p className="text-[20px] text-green mt-1.5 leading-relaxed">{meal.nextMeal}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {meal.reviewStatus === 'pending' && <div className="bg-white rounded-card p-8 text-center text-secondary shadow-card">还未分析</div>}
      {meal.reviewStatus === 'error' && <div className="bg-red-bg rounded-card p-8 text-center text-red shadow-card">分析失败，请重试</div>}

      <button onClick={() => onNavigate('meal')} className="w-full h-[64px] mt-5 rounded-btn font-semibold text-[23px] active:scale-[0.97] transition-all" style={{ background: 'var(--coral)', color: 'var(--text)', boxShadow: 'var(--shadow-md)' }}>
        📷 拍新的餐食
      </button>
    </div>
  )
}
