import { useState, useEffect } from 'react'
import { getGreeting, getScoreStyle, MEAL_TYPE_LABELS } from '../utils/constants'
import { getTodayStats } from '../services/glucoseService'
import { getTodayMeals } from '../services/mealService'
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

      {/* Greeting — compact warm banner */}
      <div className="rounded-card px-5 py-4 mb-5" style={{ background: 'linear-gradient(160deg, #FDF0EC 0%, #FCE8E3 100%)' }}>
        <p className="text-[38px] leading-none mb-1">{greeting.emoji}</p>
        <p className="text-[30px] font-semibold text-primary leading-snug">{greeting.text}</p>
      </div>

      {/* Bento Grid — 便当布局 */}
      <div className="grid grid-cols-2 gap-3 mb-5">

        {/* 今日饮食 — hero card, full width above grid */}
      </div>

      {/* Hero: latest meal suggestions */}
      {hasReviewed && latestMeal?.reviewScore !== undefined ? (
        <button
          onClick={() => onNavigate('meal-detail', { id: latestMeal.id })}
          className="w-full bg-white rounded-card p-5 mb-3 text-left shadow-card active:opacity-80 transition-opacity"
        >
          <p className="text-[30px] text-secondary mb-3">
            {MEAL_TYPE_LABELS[latestMeal.mealType]?.emoji} 最近一餐 · {MEAL_TYPE_LABELS[latestMeal.mealType]?.label}
          </p>
          <div className="flex flex-col gap-2.5">
            {latestMeal.stapleWarning && (
              <div className="flex items-start gap-2">
                <span className="text-[26px]">🍚</span>
                <span className="text-[26px] text-primary leading-relaxed">{latestMeal.stapleWarning}</span>
              </div>
            )}
            {latestMeal.dangerFoods && latestMeal.dangerFoods !== '无' && (
              <div className="flex items-start gap-2">
                <span className="text-[26px]">⚠️</span>
                <span className="text-[26px] text-red leading-relaxed">{latestMeal.dangerFoods}</span>
              </div>
            )}
            {suggestions.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-[26px]">💡</span>
                <div className="flex flex-col gap-1">
                  {suggestions.map((s, i) => (
                    <span key={i} className="text-[30px] text-secondary leading-relaxed">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </button>
      ) : (
        <div className="w-full bg-white rounded-card p-6 mb-3 text-center shadow-card">
          <div className="text-[48px] mb-2">📷</div>
          <p className="text-[21px] font-semibold text-primary mb-0.5">今天还没拍照记录</p>
          <p className="text-[30px] text-secondary">拍下第一顿饭，AI 帮您看看</p>
        </div>
      )}

      {/* Bento cards — 2 columns */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* 血糖 */}
        <div className="bg-white rounded-card p-4 shadow-card">
          <p className="text-[30px] text-secondary mb-2">🩸 今日血糖</p>
          {stats.latest ? (
            <div className="flex items-baseline gap-0.5">
              <span className="text-[42px] font-bold text-primary">{stats.latest.value}</span>
              <span className="text-[23px] text-secondary">mmol/L</span>
            </div>
          ) : (
            <p className="text-[30px] text-tertiary">暂无记录</p>
          )}
          {stats.count > 0 && <p className="text-[22px] text-tertiary mt-1">共 {stats.count} 次</p>}
        </div>

        {/* 饮食评分速览 */}
        {hasReviewed && latestMeal?.reviewScore !== undefined ? (
          <div className="bg-white rounded-card p-4 shadow-card text-center">
            <p className="text-[30px] text-secondary mb-2">{MEAL_TYPE_LABELS[latestMeal.mealType]?.emoji} 最近评分</p>
            <div className="flex items-baseline justify-center gap-0.5">
              <span className="text-[56px] font-bold leading-none" style={{ color: scoreColor }}>{latestMeal.reviewScore}</span>
              <span className="text-[21px] text-secondary">分</span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-card p-4 shadow-card flex items-center justify-center">
            <p className="text-[30px] text-tertiary text-center">拍照后会显示<br/>饮食评分</p>
          </div>
        )}
      </div>

      {/* 下一顿建议 — 独占一行，充分展示 */}
      {hasReviewed && latestMeal?.nextMeal ? (
        <div className="bg-green-bg rounded-card p-4 mb-5 shadow-card" style={{ border: '1px solid #C8E6C9' }}>
          <p className="text-[30px] font-semibold text-green mb-1.5">🥗 下一顿这样吃</p>
          <p className="text-[30px] text-green leading-relaxed">{latestMeal.nextMeal}</p>
        </div>
      ) : null}

      {/* 已拍餐食列表 — compact */}
      {meals.length > 0 && (
        <div className="mb-5">
          <p className="text-[30px] font-medium text-secondary mb-2">今日饮食记录</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {meals.map((m) => (
              <div
                key={m.id}
                className="flex-shrink-0 bg-white rounded-card p-3 shadow-card active:opacity-80 transition-opacity"
                style={{ width: '160px' }}
                onClick={() => onNavigate('meal-detail', { id: m.id })}
              >
                <img src={m.thumbnailData} alt="" className="w-full h-[100px] rounded-[10px] object-cover mb-2" />
                <p className="text-[23px] font-medium text-primary">{MEAL_TYPE_LABELS[m.mealType]?.emoji} {MEAL_TYPE_LABELS[m.mealType]?.label}</p>
                {m.reviewScore !== undefined && (
                  <p className="text-[23px] font-bold" style={{ color: getScoreStyle(m.reviewScore).color }}>{m.reviewScore}<span className="text-[22px] font-normal text-secondary">分</span></p>
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
          className="w-full h-[64px] rounded-btn font-semibold text-[23px] active:scale-[0.97] transition-all"
          style={{ background: 'var(--coral)', color: 'var(--text)', boxShadow: 'var(--shadow-md)' }}
        >
          📷 拍饮食
        </button>
        <div className="flex gap-2.5">
          <button
            onClick={() => onNavigate('record')}
            className="flex-1 h-[56px] rounded-btn font-medium text-[26px] active:scale-[0.97] transition-all"
            style={{ background: 'var(--white)', color: 'var(--text)', border: '1px solid var(--border)' }}
          >
            📝 记血糖
          </button>
          <button
            onClick={() => onNavigate('history')}
            className="flex-1 h-[56px] rounded-btn font-medium text-[26px] active:scale-[0.97] transition-all"
            style={{ background: 'var(--white)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
          >
            📊 历史
          </button>
          <button
            onClick={() => onNavigate('settings')}
            className="flex-1 h-[56px] rounded-btn font-medium text-[26px] active:scale-[0.97] transition-all"
            style={{ background: 'var(--white)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
          >
            ⚙️ 设置
          </button>
        </div>
      </div>

      {showInstall && (
        <button
          onClick={async () => { if (installPrompt) { installPrompt.prompt(); const r = await installPrompt.userChoice; if (r.outcome === 'accepted') setShowInstall(false) } }}
          className="w-full mt-3 h-[56px] rounded-btn font-medium text-[26px] text-coral active:scale-[0.97] transition-all"
          style={{ background: 'var(--coral-soft)' }}
        >
          💡 添加到手机桌面
        </button>
      )}
    </div>
  )
}
