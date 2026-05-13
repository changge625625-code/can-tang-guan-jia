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

  if (!meal) return (
    <div className="px-5 py-20 text-center" style={{ fontSize: 'var(--fs-body)', color: 'var(--text-tertiary)' }}>加载中...</div>
  )

  const suggestions: string[] = meal.suggestions ? JSON.parse(meal.suggestions) : []
  const foodItems: Array<{ name: string; gi: string; risk: string }> = meal.foodItems ? JSON.parse(meal.foodItems) : []

  const giBg = (gi: string) => gi === '高' ? 'var(--red-bg)' : gi === '中' ? 'var(--yellow-bg)' : 'var(--green-bg)'
  const giColor = (gi: string) => gi === '高' ? 'var(--red)' : gi === '中' ? 'var(--yellow)' : 'var(--mint)'
  const giBorder = (gi: string) => gi === '高' ? 'var(--red)' : gi === '中' ? 'var(--yellow)' : 'var(--mint)'
  const giLabel = (gi: string) => gi === '高' ? '高升糖' : gi === '中' ? '中升糖' : '低升糖'

  const handleDelete = async () => {
    if (!meal.id) return
    const ok = window.confirm('确定要删除这条饮食记录吗？')
    if (!ok) return
    await deleteMeal(meal.id)
    onNavigate('history')
  }

  const cardClass = "bg-white shadow-card"
  const cardStyle = { borderRadius: 'var(--card-radius)' }

  return (
    <div className="page-fade-in px-5 pb-32 pt-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => onNavigate('history')} className="flex items-center gap-1.5 active:opacity-70 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
          <Icon name="arrowLeft" size={22} color="var(--text-secondary)" />
          <span style={{ fontSize: 'var(--fs-body)' }}>返回</span>
        </button>
        <button
          onClick={() => onNavigate('home')}
          className="h-10 px-4 rounded-full font-medium transition-transform active:scale-95 flex items-center gap-1.5"
          style={{ fontSize: 'var(--fs-label)', color: 'var(--mint)', background: 'var(--mint-soft)' }}
        >
          <Icon name="home" size={16} color="var(--mint)" />
          首页
        </button>
      </div>

      {/* Photo */}
      <div className="overflow-hidden mb-4" style={{ borderRadius: 'var(--card-radius)', boxShadow: 'var(--card-shadow)' }}>
        <img src={meal.photoData} alt="" className="w-full block" />
      </div>

      {/* Meta info */}
      <div className={`px-5 py-4 mb-4 flex justify-between items-center ${cardClass}`} style={cardStyle}>
        <div>
          <span style={{ fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--text)' }}>
            {MEAL_TYPE_LABELS[meal.mealType]?.emoji} {MEAL_TYPE_LABELS[meal.mealType]?.label}
          </span>
          <p style={{ fontSize: 'var(--fs-small)', color: 'var(--text-tertiary)', marginTop: 4 }}>
            {new Date(meal.timestamp).toLocaleString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        {meal.reviewScore !== undefined && (
          <span style={{ fontSize: 'var(--fs-score)', fontWeight: 700, color: getScoreStyle(meal.reviewScore).color, lineHeight: 1 }}>
            {meal.reviewScore}<span style={{ fontSize: 'var(--fs-body)', fontWeight: 400, color: 'var(--text-tertiary)' }}> 分</span>
          </span>
        )}
      </div>

      {meal.reviewStatus === 'reviewed' && meal.reviewScore !== undefined && (
        <div className="flex flex-col gap-4">
          <div className={`p-6 text-center ${cardClass}`} style={cardStyle}>
            <ScoreDisplay score={meal.reviewScore} size="md" />
            <p style={{ fontSize: 'var(--fs-heading)', fontWeight: 600, color: 'var(--text)', marginTop: 10 }}>{meal.reviewSummary}</p>
          </div>

          {foodItems.length > 0 && (
            <div className={`p-5 ${cardClass}`} style={cardStyle}>
              <div className="flex items-center gap-2 mb-4">
                <Icon name="microbe" size={20} color="var(--text)" />
                <span style={{ fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--text)' }}>食物升糖分析</span>
              </div>
              <div className="flex flex-col gap-2">
                {foodItems.map((f, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 px-3.5 rounded-[10px]" style={{ background: giBg(f.gi) }}>
                    <span style={{ fontSize: 'var(--fs-body)', fontWeight: 500, color: 'var(--text)' }}>{f.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full font-medium" style={{
                        fontSize: 'var(--fs-small)',
                        color: giColor(f.gi),
                        border: `1.5px solid ${giBorder(f.gi)}`,
                        background: 'transparent',
                      }}>{giLabel(f.gi)}</span>
                      <span style={{ fontSize: 'var(--fs-small)', color: 'var(--text-secondary)' }}>{f.risk}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={`p-5 flex flex-col gap-4 ${cardClass}`} style={cardStyle}>
            <div className="flex items-start gap-2.5">
              <Icon name="salad" size={20} color="var(--text)" className="mt-0.5" />
              <div>
                <span style={{ fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--text)' }}>主食</span>
                <p style={{ fontSize: 'var(--fs-body)', color: 'var(--text-secondary)', marginTop: 2 }}>{meal.stapleWarning}</p>
              </div>
            </div>
            {meal.dangerFoods && meal.dangerFoods !== '无' && (
              <div className="flex items-start gap-2.5">
                <Icon name="alert" size={20} color="var(--red)" className="mt-0.5" />
                <div>
                  <span style={{ fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--text)' }}>警惕</span>
                  <p style={{ fontSize: 'var(--fs-body)', color: 'var(--red)', marginTop: 2 }}>{meal.dangerFoods}</p>
                </div>
              </div>
            )}
            {suggestions.length > 0 && (
              <div className="flex items-start gap-2.5">
                <Icon name="tip" size={20} color="var(--text)" className="mt-0.5" />
                <div className="flex-1">
                  <span style={{ fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--text)' }}>建议</span>
                  <ul className="mt-1.5 space-y-1.5">
                    {suggestions.map((s, i) => (
                      <li key={i} style={{ fontSize: 'var(--fs-body)', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {meal.nextMeal && (
              <div className="p-4" style={{ background: 'var(--green-bg)', borderRadius: 'var(--card-radius)', border: '1px solid rgba(124,184,130,0.2)' }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon name="salad" size={20} color="var(--mint)" />
                  <span style={{ fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--mint)' }}>下一顿这样吃</span>
                </div>
                <p style={{ fontSize: 'var(--fs-body)', color: 'var(--mint)', lineHeight: 1.6 }}>{meal.nextMeal}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {meal.reviewStatus === 'pending' && (
        <div className={`p-10 text-center ${cardClass}`} style={{ ...cardStyle, fontSize: 'var(--fs-body)', color: 'var(--text-tertiary)' }}>还未分析</div>
      )}
      {meal.reviewStatus === 'error' && (
        <div className="p-10 text-center" style={{ fontSize: 'var(--fs-body)', color: 'var(--red)', background: 'var(--red-bg)', borderRadius: 'var(--card-radius)' }}>分析失败，请重试</div>
      )}

      {/* Action buttons */}
      <button
        onClick={() => onNavigate('meal')}
        className="w-full h-[60px] mt-5 font-semibold btn-press flex items-center justify-center gap-2"
        style={{ fontSize: 'var(--fs-body)', background: 'var(--mint)', color: '#FFFFFF', borderRadius: 'var(--btn-radius)' }}
      >
        <Icon name="camera" size={20} color="#FFFFFF" />
        拍新的餐食
      </button>

      <button
        onClick={handleDelete}
        className="w-full h-[52px] mt-3 font-medium btn-press flex items-center justify-center gap-2"
        style={{ fontSize: 'var(--fs-body)', background: 'var(--white)', color: 'var(--red)', borderRadius: 'var(--btn-radius)', border: '1px solid rgba(240,165,138,0.4)' }}
      >
        <Icon name="trash" size={18} color="var(--red)" />
        删除记录
      </button>
    </div>
  )
}
