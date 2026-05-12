import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts'
import { getAllGlucose } from '../services/glucoseService'
import { getAllMeals } from '../services/mealService'
import { GLUCOSE_TYPE_LABELS, MEAL_TYPE_LABELS, getScoreStyle } from '../utils/constants'
import type { GlucoseRecord, MealRecord } from '../types'

interface Props { onNavigate: (page: string, params?: any) => void }
type Tab = 'glucose' | 'meal'

export default function HistoryPage({ onNavigate }: Props) {
  const [tab, setTab] = useState<Tab>('glucose')
  const [glucoseList, setGlucoseList] = useState<GlucoseRecord[]>([])
  const [mealList, setMealList] = useState<MealRecord[]>([])

  useEffect(() => { getAllGlucose().then(setGlucoseList); getAllMeals().then(setMealList) }, [])

  const chartData = glucoseList.slice(0, 50).reverse().map((r) => ({
    time: new Date(r.timestamp).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
    value: r.value,
  }))

  const tabBtn = (t: Tab, label: string, count: number) => (
    <button
      onClick={() => setTab(t)}
      className="flex-1 h-13 rounded-full text-[20px] font-medium transition-all active:scale-95"
      style={{
        background: tab === t ? 'var(--coral-soft)' : 'var(--white)',
        color: tab === t ? 'var(--coral)' : 'var(--text-secondary)',
        border: tab === t ? '1.5px solid var(--coral)' : '1px solid var(--border)',
      }}
    >
      {label} ({count})
    </button>
  )

  return (
    <div className="page-fade-in px-5 pb-32 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[40px] font-bold text-primary tracking-tight">历史</h1>
        <button onClick={() => onNavigate('home')} className="h-11 px-4 rounded-full text-[20px] font-medium text-coral bg-coral-soft active:scale-95 transition-transform">
          🏠 首页
        </button>
      </div>

      <div className="flex gap-3 mb-5">
        {tabBtn('glucose', '🩸 血糖', glucoseList.length)}
        {tabBtn('meal', '🍽️ 饮食', mealList.length)}
      </div>

      {tab === 'glucose' && (
        <>
          {chartData.length > 1 && (
            <div className="bg-white rounded-card p-4 mb-5 shadow-card">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EBEBE6" />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#B8B8B4' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#B8B8B4' }} domain={[0, 'auto']} />
                  <ReferenceLine y={13.9} stroke="#FF6B6B" strokeDasharray="4 4" strokeWidth={1} />
                  <ReferenceLine y={3.9} stroke="#FF9F43" strokeDasharray="4 4" strokeWidth={1} />
                  <Line type="monotone" dataKey="value" stroke="#FF7E67" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#FF7E67' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          {glucoseList.length === 0 && <p className="text-center text-secondary text-[21px] py-12">暂无血糖记录</p>}
          <div className="flex flex-col gap-2.5">
            {glucoseList.slice(0, 30).map((r) => (
              <div key={r.id} className="bg-white rounded-card px-4 py-3.5 flex justify-between items-center shadow-card">
                <div>
                  <span className="text-[19px] text-secondary">{GLUCOSE_TYPE_LABELS[r.type]?.emoji} {GLUCOSE_TYPE_LABELS[r.type]?.label}</span>
                  <p className="text-[17px] text-tertiary mt-0.5">{new Date(r.timestamp).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <span className="text-[38px] font-bold" style={{ color: r.value > 13.9 ? 'var(--red)' : r.value < 3.9 ? '#FF9F43' : 'var(--text)' }}>
                  {r.value}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'meal' && (
        <>
          {mealList.length === 0 && <p className="text-center text-secondary text-[21px] py-12">暂无饮食记录</p>}
          <div className="flex flex-col gap-2.5">
            {mealList.map((m) => (
              <div key={m.id} className="bg-white rounded-card p-3.5 flex gap-3 shadow-card active:opacity-80 transition-opacity" onClick={() => onNavigate('meal-detail', { id: m.id })}>
                <img src={m.thumbnailData} alt="" className="w-[88px] h-[88px] rounded-[12px] object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <span className="text-[20px] font-semibold text-primary">{MEAL_TYPE_LABELS[m.mealType]?.emoji} {MEAL_TYPE_LABELS[m.mealType]?.label}</span>
                    {m.reviewScore !== undefined && (
                      <span className="text-[28px] font-bold" style={{ color: getScoreStyle(m.reviewScore).color }}>{m.reviewScore}<span className="text-[18px] font-normal text-secondary">分</span></span>
                    )}
                  </div>
                  <p className="text-[19px] text-secondary truncate mt-0.5">{m.reviewSummary || '等待分析…'}</p>
                  <p className="text-[17px] text-tertiary mt-0.5">{new Date(m.timestamp).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
