import { useState, useEffect } from 'react'
import { getGreeting, getScoreStyle, MEAL_TYPE_LABELS } from '../utils/constants'
import { getTodayStats } from '../services/glucoseService'
import { getTodayMeals } from '../services/mealService'
import Icon from '../components/Icon'
import type { GlucoseRecord, MealRecord } from '../types'

interface Props { onNavigate: (page: string, params?: any) => void }

export default function HomePage({ onNavigate }: Props) {
  const greeting = getGreeting()
  const [stats, setStats] = useState<{ count: number; latest: GlucoseRecord | null }>({ count: 0, latest: null })
  const [meals, setMeals] = useState<MealRecord[]>([])
  const [showInstall, setShowInstall] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<any>(null)

  useEffect(() => {
    getTodayStats().then((s) => setStats({ count: s.count, latest: s.latest }))
    getTodayMeals().then(setMeals)
  }, [])

  useEffect(() => {
    const handler = (e: Event) => { e.preventDefault(); setInstallPrompt(e); setShowInstall(true) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const latestMeal = meals[meals.length - 1]
  const hasReviewed = latestMeal?.reviewStatus === 'reviewed'
  const suggestions: string[] = latestMeal?.suggestions ? JSON.parse(latestMeal.suggestions) : []
  const scoreColor = latestMeal?.reviewScore ? getScoreStyle(latestMeal.reviewScore).color : 'var(--text-secondary)'

  const cardClass = "bg-white shadow-card card-lift"
  const cardStyle = { borderRadius: 'var(--card-radius)' }

  return (
    <div className="page-fade-in px-4 pb-28 pt-6">

      {/* Greeting — warm journal header */}
      <div className="px-5 py-5 mb-6" style={{ background: 'var(--mint-soft)', borderRadius: 'var(--card-radius)' }}>
        <p style={{ fontSize: 'var(--fs-display)', lineHeight: 1.15, marginBottom: 6 }}>{greeting.emoji}</p>
        <p style={{ fontSize: 'var(--fs-title)', fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>{greeting.text}</p>
      </div>

      {/* Hero: latest meal suggestions */}
      {hasReviewed && latestMeal?.reviewScore !== undefined ? (
        <button
          onClick={() => onNavigate('meal-detail', { id: latestMeal.id })}
          className={`w-full p-5 mb-4 text-left active:opacity-80 transition-opacity ${cardClass}`}
          style={cardStyle}
        >
          <p style={{ fontSize: 'var(--fs-body-lg)', color: 'var(--text-secondary)', marginBottom: 14 }}>
            {MEAL_TYPE_LABELS[latestMeal.mealType]?.emoji} 最近一餐 · {MEAL_TYPE_LABELS[latestMeal.mealType]?.label}
          </p>
          <div className="flex flex-col gap-3">
            {latestMeal.stapleWarning && (
              <div className="flex items-start gap-2.5">
                <Icon name="salad" size={24} color="var(--mint)" />
                <span style={{ fontSize: 'var(--fs-body-lg)', color: 'var(--text)', lineHeight: 1.55 }}>{latestMeal.stapleWarning}</span>
              </div>
            )}
            {latestMeal.dangerFoods && latestMeal.dangerFoods !== '无' && (
              <div className="flex items-start gap-2.5">
                <Icon name="alert" size={24} color="var(--red)" />
                <span style={{ fontSize: 'var(--fs-body-lg)', color: 'var(--red)', lineHeight: 1.55 }}>{latestMeal.dangerFoods}</span>
              </div>
            )}
            {suggestions.length > 0 && (
              <div className="flex items-start gap-2.5">
                <Icon name="tip" size={24} color="var(--mint)" />
                <div className="flex flex-col gap-1">
                  {suggestions.map((s, i) => (
                    <span key={i} style={{ fontSize: 'var(--fs-body-lg)', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </button>
      ) : (
        <div className={`w-full p-8 mb-4 text-center ${cardClass}`} style={cardStyle}>
          <Icon name="camera" size={52} color="var(--ink)" />
          <p style={{ fontSize: 'var(--fs-heading)', fontWeight: 600, color: 'var(--text)', marginTop: 12, marginBottom: 4 }}>今天还没拍照记录</p>
          <p style={{ fontSize: 'var(--fs-body-lg)', color: 'var(--text-tertiary)' }}>拍下第一顿饭，AI 帮您看看</p>
        </div>
      )}

      {/* Bento cards — 2 columns */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className={`p-5 ${cardClass}`} style={cardStyle}>
          <div className="flex items-center gap-1.5 mb-3">
            <Icon name="blood" size={20} color="var(--mint)" />
            <span style={{ fontSize: 'var(--fs-label)', color: 'var(--text-secondary)', fontWeight: 500 }}>今日血糖</span>
          </div>
          {stats.latest ? (
            <div className="flex items-baseline gap-0.5">
              <span className="value-in" style={{ fontSize: 'var(--fs-score)', fontWeight: 700, color: 'var(--mint)', lineHeight: 1 }}>{stats.latest.value}</span>
              <span style={{ fontSize: 'var(--fs-body)', color: 'var(--text-tertiary)' }}>mmol/L</span>
            </div>
          ) : (
            <p style={{ fontSize: 'var(--fs-body)', color: 'var(--text-tertiary)' }}>暂无记录</p>
          )}
          {stats.count > 0 && (
            <p style={{ fontSize: 'var(--fs-label)', color: 'var(--text-tertiary)', marginTop: 6 }}>共 {stats.count} 次</p>
          )}
        </div>

        {hasReviewed && latestMeal?.reviewScore !== undefined ? (
          <div className={`p-5 text-center ${cardClass}`} style={cardStyle}>
            <p style={{ fontSize: 'var(--fs-label)', color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 500 }}>
              {MEAL_TYPE_LABELS[latestMeal.mealType]?.emoji} 最近评分
            </p>
            <div className="flex items-baseline justify-center gap-0.5">
              <span className="value-in" style={{ fontSize: 'var(--fs-score)', fontWeight: 700, color: scoreColor, lineHeight: 1 }}>{latestMeal.reviewScore}</span>
              <span style={{ fontSize: 'var(--fs-body)', color: 'var(--text-tertiary)' }}>分</span>
            </div>
          </div>
        ) : (
          <div className="p-5 flex items-center justify-center" style={{ ...cardStyle, background: 'var(--white)' }}>
            <p style={{ fontSize: 'var(--fs-body)', color: 'var(--text-tertiary)', textAlign: 'center' as const, lineHeight: 1.6 }}>
              拍照后会显示<br/>饮食评分
            </p>
          </div>
        )}
      </div>

      {/* Next meal — journal tip card */}
      {hasReviewed && latestMeal?.nextMeal ? (
        <div className="p-5 mb-5" style={{ background: 'var(--green-bg)', borderRadius: 'var(--card-radius)', border: '1px solid rgba(124,184,130,0.25)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Icon name="salad" size={22} color="var(--mint)" />
            <span style={{ fontSize: 'var(--fs-heading)', fontWeight: 600, color: 'var(--mint)' }}>下一顿这样吃</span>
          </div>
          <p style={{ fontSize: 'var(--fs-body-lg)', color: 'var(--mint)', lineHeight: 1.6 }}>{latestMeal.nextMeal}</p>
        </div>
      ) : null}

      {/* Meal list — horizontal scroll */}
      {meals.length > 0 && (
        <div className="mb-6">
          <p style={{ fontSize: 'var(--fs-label)', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 10, letterSpacing: '0.03em' }}>
            今日饮食记录
          </p>
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {meals.map((m) => (
              <div
                key={m.id}
                className={`flex-shrink-0 p-3 active:opacity-80 transition-opacity ${cardClass}`}
                style={{ width: '150px', borderRadius: 'var(--card-radius)' }}
                onClick={() => onNavigate('meal-detail', { id: m.id })}
              >
                <img src={m.thumbnailData} alt="" className="w-full h-[96px] rounded-[10px] object-cover mb-2.5" />
                <p style={{ fontSize: 'var(--fs-small)', fontWeight: 500, color: 'var(--text)', lineHeight: 1.3 }}>
                  {MEAL_TYPE_LABELS[m.mealType]?.emoji} {MEAL_TYPE_LABELS[m.mealType]?.label}
                </p>
                {m.reviewScore !== undefined && (
                  <p style={{ fontSize: 'var(--fs-small)', fontWeight: 700, color: getScoreStyle(m.reviewScore).color, marginTop: 2 }}>
                    {m.reviewScore}<span style={{ fontSize: 'var(--fs-small)', fontWeight: 400, color: 'var(--text-tertiary)' }}> 分</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col gap-2.5 stagger">
        <button
          onClick={() => onNavigate('meal')}
          className="w-full h-[66px] font-semibold btn-press flex items-center justify-center gap-2"
          style={{ fontSize: 'var(--fs-body-lg)', background: 'var(--mint)', color: '#FFFFFF', borderRadius: 'var(--btn-radius)' }}
        >
          <Icon name="camera" size={22} color="#FFFFFF" />
          拍饮食
        </button>
        <div className="flex gap-2.5">
          <button
            onClick={() => onNavigate('record')}
            className="flex-1 h-[52px] font-medium btn-press flex items-center justify-center gap-1.5"
            style={{ fontSize: 'var(--fs-label)', background: 'var(--white)', color: 'var(--text)', borderRadius: 'var(--btn-radius)', border: '1px solid var(--border)' }}
          >
            <Icon name="record" size={17} color="var(--text-secondary)" />
            记血糖
          </button>
          <button
            onClick={() => onNavigate('history')}
            className="flex-1 h-[52px] font-medium btn-press flex items-center justify-center gap-1.5"
            style={{ fontSize: 'var(--fs-label)', background: 'var(--white)', color: 'var(--text-secondary)', borderRadius: 'var(--btn-radius)', border: '1px solid var(--border)' }}
          >
            <Icon name="history" size={17} color="var(--text-secondary)" />
            历史
          </button>
          <button
            onClick={() => onNavigate('settings')}
            className="flex-1 h-[52px] font-medium btn-press flex items-center justify-center gap-1.5"
            style={{ fontSize: 'var(--fs-label)', background: 'var(--white)', color: 'var(--text-secondary)', borderRadius: 'var(--btn-radius)', border: '1px solid var(--border)' }}
          >
            <Icon name="settings" size={17} color="var(--text-secondary)" />
            设置
          </button>
        </div>
      </div>

      {showInstall && (
        <button
          onClick={async () => { if (installPrompt) { installPrompt.prompt(); const r = await installPrompt.userChoice; if (r.outcome === 'accepted') setShowInstall(false) } }}
          className="w-full mt-3 h-[52px] font-medium btn-press flex items-center justify-center"
          style={{ fontSize: 'var(--fs-label)', color: 'var(--mint)', background: 'var(--mint-soft)', borderRadius: 'var(--btn-radius)' }}
        >
          添加到手机桌面
        </button>
      )}
    </div>
  )
}
