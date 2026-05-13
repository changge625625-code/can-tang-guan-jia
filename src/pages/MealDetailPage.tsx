import { useState, useEffect } from 'react'
import { getMeal, deleteMeal } from '../services/mealService'
import { MEAL_TYPE_LABELS, getScoreStyle } from '../utils/constants'
import ScoreDisplay from '../components/ScoreDisplay'
import Icon from '../components/Icon'
import type { MealRecord } from '../types'

interface Props { params: { id: number }; onNavigate: (page: string) => void }

export default function MealDetailPage({ params, onNavigate }: Props) {
  const [meal, setMeal] = useState<MealRecord | null>(null)

  useEffect(() => { getMeal(params.id).then((m) => { if (m) setMeal(m) }) }, [params.id])

  if (!meal) return <div className="px-5 py-12 text-center" style={{ fontSize: 'var(--fs-body)', color: 'var(--text-secondary)' }}>加载中...</div>

  const suggestions: string[] = meal.suggestions ? JSON.parse(meal.suggestions) : []
  const foodItems: Array<{ name: string; gi: string; risk: string }> = meal.foodItems ? JSON.parse(meal.foodItems) : []

  const giBg = (gi: string) => gi === '高' ? 'var(--red-bg)' : gi === '中' ? 'var(--yellow-bg)' : 'var(--green-bg)'
  const giColor = (gi: string) => gi === '高' ? 'var(--red)' : gi === '中' ? 'var(--yellow)' : 'var(--mint)'
  const giBorder = (gi: string) => gi === '高' ? 'var(--red)' : gi === '中' ? 'var(--yellow)' : 'var(--mint)'
  const giLabel = (gi: string) => gi === '高' ? '高' : gi === '中' ? '中' : '低'

  const handleDelete = async () => {
    if (!meal.id) return
    const ok = window.confirm('确定要删除这条饮食记录吗？')
    if (!ok) return
    await deleteMeal(meal.id)
    onNavigate('history')
  }

  return (
    <div className="page-fade-in px-5 pb-32 pt-6">
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => onNavigate('history')} className="flex items-center gap-1 active:text-mint transition-colors" style={{ color: 'var(--text-secondary)' }}>
          <Icon name="arrowLeft" size={20} color="var(--text-secondary)" />
          <span style={{ fontSize: 'var(--fs-heading)' }}>返回</span>
        </button>
        <button onClick={() => onNavigate('home')} className="h-11 px-4 rounded-full font-medium transition-all active:scale-95" style={{ fontSize: 'var(--fs-label)', color: 'var(--mint)', background: 'var(--mint-soft)' }}>
          <Icon name="home" size={18} color="var(--mint)" />
          <span className="ml-1">首页</span>
        </button>
      </div>

      <div className="bg-white rounded-card overflow-hidden shadow-card mb-4">
        <img src={meal.photoData} alt="" className="w-full block" />
      </div>

      <div className="bg-white rounded-card px-5 py-4 shadow-card mb-4 flex justify-between items-center">
        <div>
          <span style={{ fontSize: 'var(--fs-body-lg)', fontWeight: 600, color: 'var(--text)' }}>{MEAL_TYPE_LABELS[meal.mealType]?.emoji} {MEAL_TYPE_LABELS[meal.mealType]?.label}</span>
          <p style={{ fontSize: 'var(--fs-small)', color: 'var(--text-tertiary)', marginTop: 2 }}>{new Date(meal.timestamp).toLocaleString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        {meal.reviewScore !== undefined && (
          <span style={{ fontSize: 'var(--fs-score)', fontWeight: 700, color: getScoreStyle(meal.reviewScore).color }}>{meal.reviewScore}<span style={{ fontSize: 'var(--fs-body)', fontWeight: 400, color: 'var(--text-secondary)' }}>分</span></span>
        )}
      </div>

      {meal.reviewStatus === 'reviewed' && meal.reviewScore !== undefined && (
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-card p-5 text-center shadow-card">
            <ScoreDisplay score={meal.reviewScore} size="md" />
            <p style={{ fontSize: 'var(--fs-heading)', fontWeight: 600, color: 'var(--text)', marginTop: 8 }}>{meal.reviewSummary}</p>
          </div>

          {foodItems.length > 0 && (
            <div className="bg-white rounded-card p-5 shadow-card">
              <div className="flex items-center gap-1.5 mb-3">
                <Icon name="microbe" size={20} color="var(--text)" />
                <span style={{ fontSize: 'var(--fs-body-lg)', fontWeight: 600, color: 'var(--text)' }}>食物升糖分析</span>
              </div>
              <div className="flex flex-col gap-2">
                {foodItems.map((f, i) => (
                  <div key={i} className="flex items-center justify-between py-2 px-3 rounded-[12px]" style={{ background: giBg(f.gi) }}>
                    <span style={{ fontSize: 'var(--fs-body-lg)', fontWeight: 500, color: 'var(--text)' }}>{f.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full font-semibold" style={{ fontSize: 'var(--fs-small)', background: giBg(f.gi), color: giColor(f.gi), border: `1.5px solid ${giBorder(f.gi)}` }}>{giLabel(f.gi)}</span>
                      <span style={{ fontSize: 'var(--fs-small)', color: 'var(--text-secondary)' }}>{f.risk}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-card p-5 shadow-card flex flex-col gap-3.5">
            <div className="flex items-start gap-2">
              <Icon name="salad" size={20} color="var(--text)" />
              <span style={{ fontSize: 'var(--fs-body-lg)', fontWeight: 600 }}>主食</span>
              <span style={{ fontSize: 'var(--fs-body-lg)', color: 'var(--text-secondary)' }}>{meal.stapleWarning}</span>
            </div>
            {meal.dangerFoods && meal.dangerFoods !== '无' && (
              <div className="flex items-start gap-2">
                <Icon name="alert" size={20} color="var(--red)" />
                <span style={{ fontSize: 'var(--fs-body-lg)', fontWeight: 600 }}>警惕</span>
                <span style={{ fontSize: 'var(--fs-body-lg)', color: 'var(--red)' }}>{meal.dangerFoods}</span>
              </div>
            )}
            {suggestions.length > 0 && (
              <div>
                <div className="flex items-start gap-2">
                  <Icon name="tip" size={20} color="var(--text)" />
                  <span style={{ fontSize: 'var(--fs-body-lg)', fontWeight: 600 }}>建议</span>
                </div>
                <ul className="mt-1.5 ml-9 space-y-1">
                  {suggestions.map((s, i) => <li key={i} style={{ fontSize: 'var(--fs-body-lg)', color: 'var(--text-secondary)' }}>{s}</li>)}
                </ul>
              </div>
            )}
            {meal.nextMeal && (
              <div className="rounded-card p-4" style={{ background: 'var(--green-bg)', border: '1px solid var(--mint)' }}>
                <div className="flex items-center gap-1.5">
                  <Icon name="salad" size={20} color="var(--mint)" />
                  <span style={{ fontSize: 'var(--fs-body-lg)', fontWeight: 600, color: 'var(--mint)' }}>下一顿这样吃</span>
                </div>
                <p style={{ fontSize: 'var(--fs-body-lg)', color: 'var(--mint)', marginTop: 6 }}>{meal.nextMeal}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {meal.reviewStatus === 'pending' && <div className="bg-white rounded-card p-8 text-center shadow-card" style={{ fontSize: 'var(--fs-body)', color: 'var(--text-secondary)' }}>还未分析</div>}
      {meal.reviewStatus === 'error' && <div className="rounded-card p-8 text-center shadow-card" style={{ fontSize: 'var(--fs-body)', color: 'var(--red)', background: 'var(--red-bg)' }}>分析失败，请重试</div>}

      <button onClick={() => onNavigate('meal')} className="w-full h-[64px] mt-5 rounded-btn font-semibold active:scale-[0.97] transition-all flex items-center justify-center" style={{ fontSize: 'var(--fs-body)', background: 'var(--mint)', color: '#FFFFFF' }}>
        <Icon name="camera" size={20} color="#FFFFFF" />
        <span className="ml-2">拍新的餐食</span>
      </button>

      {/* Delete button */}
      <button onClick={handleDelete} className="w-full h-[56px] mt-3 rounded-btn font-medium active:scale-[0.97] transition-all flex items-center justify-center" style={{ fontSize: 'var(--fs-body)', background: 'var(--white)', color: 'var(--red)', border: '1px solid var(--red)' }}>
        <Icon name="trash" size={20} color="var(--red)" />
        <span className="ml-2">删除记录</span>
      </button>
    </div>
  )
}
