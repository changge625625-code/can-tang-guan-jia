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

  return (
    <div className="page-fade-in px-4 pb-28 pt-6">

      {/* Greeting */}
      <div className="rounded-card px-5 py-4 mb-5" style={{ background: 'var(--mint-soft)' }}>
        <p style={{ fontSize: 'var(--fs-display)', lineHeight: 1, marginBottom: 4 }}>{greeting.emoji}</p>
        <p style={{ fontSize: 'var(--fs-title)', fontWeight: 600, color: 'var(--text)' }}>{greeting.text}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
      </div>

      {/* Hero: latest meal suggestions */}
      {hasReviewed && latestMeal?.reviewScore !== undefined ? (
        <button
          onClick={() => onNavigate('meal-detail', { id: latestMeal.id })}
          className="w-full bg-white rounded-card p-5 mb-3 text-left shadow-card active:opacity-80 transition-opacity"
        >
          <p style={{ fontSize: 'var(--fs-title)', color: 'var(--text-secondary)', marginBottom: 12 }}>
            {MEAL_TYPE_LABELS[latestMeal.mealType]?.emoji} 最近一餐 · {MEAL_TYPE_LABELS[latestMeal.mealType]?.label}
          </p>
          <div className="flex flex-col gap-2.5">
            {latestMeal.stapleWarning && (
              <div className="flex items-start gap-2">
                <Icon name="salad" size={28} color="var(--text-secondary)" />
                <span style={{ fontSize: 'var(--fs-body-lg)', color: 'var(--text)' }}>{latestMeal.stapleWarning}</span>
              </div>
            )}
            {latestMeal.dangerFoods && latestMeal.dangerFoods !== '无' && (
              <div className="flex items-start gap-2">
                <Icon name="alert" size={28} color="var(--red)" />
                <span style={{ fontSize: 'var(--fs-body-lg)', color: 'var(--red)' }}>{latestMeal.dangerFoods}</span>
              </div>
            )}
            {suggestions.length > 0 && (
              <div className="flex items-start gap-2">
                <Icon name="tip" size={28} color="var(--text-secondary)" />
                <div className="flex flex-col gap-1">
                  {suggestions.map((s, i) => (
                    <span key={i} style={{ fontSize: 'var(--fs-title)', color: 'var(--text-secondary)' }}>{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </button>
      ) : (
        <div className="w-full bg-white rounded-card p-6 mb-3 text-center shadow-card">
          <div style={{ fontSize: 'var(--fs-emoji-lg)', marginBottom: 8 }}>📷</div>
          <p style={{ fontSize: 'var(--fs-body-lg)', fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>今天还没拍照记录</p>
          <p style={{ fontSize: 'var(--fs-title)', color: 'var(--text-secondary)' }}>拍下第一顿饭，AI 帮您看看</p>
        </div>
      )}

      {/* Bento cards */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-white rounded-card p-4 shadow-card">
          <div className="flex items-center gap-1.5 mb-2">
            <Icon name="blood" size={22} color="var(--text-secondary)" />
            <span style={{ fontSize: 'var(--fs-title)', color: 'var(--text-secondary)' }}>今日血糖</span>
          </div>
          {stats.latest ? (
            <div className="flex items-baseline gap-0.5">
              <span style={{ fontSize: 'var(--fs-score)', fontWeight: 700, color: 'var(--mint)' }}>{stats.latest.value}</span>
              <span style={{ fontSize: 'var(--fs-body)', color: 'var(--text-secondary)' }}>mmol/L</span>
            </div>
          ) : (
            <p style={{ fontSize: 'var(--fs-title)', color: 'var(--text-tertiary)' }}>暂无记录</p>
          )}
          {stats.count > 0 && <p style={{ fontSize: 'var(--fs-heading)', color: 'var(--text-tertiary)', marginTop: 4 }}>共 {stats.count} 次</p>}
        </div>

        {hasReviewed && latestMeal?.reviewScore !== undefined ? (
          <div className="bg-white rounded-card p-4 shadow-card text-center">
            <p style={{ fontSize: 'var(--fs-title)', color: 'var(--text-secondary)', marginBottom: 8 }}>{MEAL_TYPE_LABELS[latestMeal.mealType]?.emoji} 最近评分</p>
            <div className="flex items-baseline justify-center gap-0.5">
              <span style={{ fontSize: 'var(--fs-score)', fontWeight: 700, color: scoreColor }}>{latestMeal.reviewScore}</span>
              <span style={{ fontSize: 'var(--fs-body-lg)', color: 'var(--text-secondary)' }}>分</span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-card p-4 shadow-card flex items-center justify-center">
            <p style={{ fontSize: 'var(--fs-title)', color: 'var(--text-tertiary)', textAlign: 'center' as const }}>拍照后会显示<br/>饮食评分</p>
          </div>
        )}
      </div>

      {/* Next meal suggestion */}
      {hasReviewed && latestMeal?.nextMeal ? (
        <div className="rounded-card p-4 mb-5 shadow-card" style={{ background: 'var(--green-bg)', border: '1px solid var(--mint)' }}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Icon name="salad" size={22} color="var(--mint)" />
            <span style={{ fontSize: 'var(--fs-title)', fontWeight: 600, color: 'var(--mint)' }}>下一顿这样吃</span>
          </div>
          <p style={{ fontSize: 'var(--fs-title)', color: 'var(--mint)' }}>{latestMeal.nextMeal}</p>
        </div>
      ) : null}

      {/* Meal list */}
      {meals.length > 0 && (
        <div className="mb-5">
          <p style={{ fontSize: 'var(--fs-title)', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>今日饮食记录</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {meals.map((m) => (
              <div
                key={m.id}
                className="flex-shrink-0 bg-white rounded-card p-3 shadow-card active:opacity-80 transition-opacity"
                style={{ width: '160px' }}
                onClick={() => onNavigate('meal-detail', { id: m.id })}
              >
                <img src={m.thumbnailData} alt="" className="w-full h-[100px] rounded-[10px] object-cover mb-2" />
                <p style={{ fontSize: 'var(--fs-body)', fontWeight: 500, color: 'var(--text)' }}>{MEAL_TYPE_LABELS[m.mealType]?.emoji} {MEAL_TYPE_LABELS[m.mealType]?.label}</p>
                {m.reviewScore !== undefined && (
                  <p style={{ fontSize: 'var(--fs-body)', fontWeight: 700, color: getScoreStyle(m.reviewScore).color }}>{m.reviewScore}<span style={{ fontSize: 'var(--fs-label)', fontWeight: 400, color: 'var(--text-secondary)' }}>分</span></p>
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
          className="w-full h-[64px] rounded-btn font-semibold active:scale-[0.97] transition-all"
          style={{ fontSize: 'var(--fs-body)', background: 'var(--mint)', color: '#FFFFFF' }}
        >
          <Icon name="camera" size={22} color="#FFFFFF" />
          <span className="ml-2">拍饮食</span>
        </button>
        <div className="flex gap-2.5">
          <button
            onClick={() => onNavigate('record')}
            className="flex-1 h-[56px] rounded-btn font-medium active:scale-[0.97] transition-all"
            style={{ fontSize: 'var(--fs-label)', background: 'var(--white)', color: 'var(--text)', border: '1px solid var(--border)' }}
          >
            <Icon name="record" size={18} color="var(--text)" />
            <span className="ml-1">记血糖</span>
          </button>
          <button
            onClick={() => onNavigate('history')}
            className="flex-1 h-[56px] rounded-btn font-medium active:scale-[0.97] transition-all"
            style={{ fontSize: 'var(--fs-label)', background: 'var(--white)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
          >
            <Icon name="history" size={18} color="var(--text-secondary)" />
            <span className="ml-1">历史</span>
          </button>
          <button
            onClick={() => onNavigate('settings')}
            className="flex-1 h-[56px] rounded-btn font-medium active:scale-[0.97] transition-all"
            style={{ fontSize: 'var(--fs-label)', background: 'var(--white)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
          >
            <Icon name="settings" size={18} color="var(--text-secondary)" />
            <span className="ml-1">设置</span>
          </button>
        </div>
      </div>

      {showInstall && (
        <button
          onClick={async () => { if (installPrompt) { installPrompt.prompt(); const r = await installPrompt.userChoice; if (r.outcome === 'accepted') setShowInstall(false) } }}
          className="w-full mt-3 h-[56px] rounded-btn font-medium active:scale-[0.97] transition-all"
          style={{ fontSize: 'var(--fs-label)', color: 'var(--mint)', background: 'var(--mint-soft)' }}
        >
          添加到手机桌面
        </button>
      )}
    </div>
  )
}
