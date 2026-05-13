import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts'
import { getAllGlucose } from '../services/glucoseService'
import { getAllMeals } from '../services/mealService'
import { GLUCOSE_TYPE_LABELS, MEAL_TYPE_LABELS, getScoreStyle } from '../utils/constants'
import Icon from '../components/Icon'
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

  const tabBtn = (t: Tab, icon: 'blood' | 'meal', label: string, count: number) => (
    <button
      onClick={() => setTab(t)}
      className="flex-1 h-12 rounded-full font-medium transition-all active:scale-95 flex items-center justify-center gap-1.5"
      style={{
        fontSize: 'var(--fs-label)',
        background: tab === t ? 'var(--mint-soft)' : 'var(--white)',
        color: tab === t ? 'var(--mint)' : 'var(--text-secondary)',
        border: tab === t ? '1.5px solid var(--mint)' : '1px solid var(--border)',
      }}
    >
      <Icon name={icon} size={17} color={tab === t ? 'var(--mint)' : 'var(--text-secondary)'} />
      {label} ({count})
    </button>
  )

  const cardClass = "bg-white shadow-card"
  const cardStyle = { borderRadius: 'var(--card-radius)' }

  return (
    <div className="page-fade-in px-5 pb-32 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="h1">历史</h1>
        <button
          onClick={() => onNavigate('home')}
          className="h-11 px-5 rounded-full font-medium transition-transform active:scale-95 flex items-center gap-1.5"
          style={{ fontSize: 'var(--fs-label)', color: 'var(--mint)', background: 'var(--mint-soft)' }}
        >
          <Icon name="home" size={17} color="var(--mint)" />
          首页
        </button>
      </div>

      <div className="flex gap-3 mb-6">
        {tabBtn('glucose', 'blood', '血糖', glucoseList.length)}
        {tabBtn('meal', 'meal', '饮食', mealList.length)}
      </div>

      {tab === 'glucose' && (
        <>
          {chartData.length > 1 && (
            <div className={`p-4 mb-5 ${cardClass}`} style={cardStyle}>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EBE7DE" strokeOpacity={0.6} />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#B0B0B0' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#B0B0B0' }} axisLine={false} tickLine={false} domain={[0, 'auto']} />
                  <ReferenceLine y={13.9} stroke="#F0A58A" strokeDasharray="4 4" strokeWidth={1} strokeOpacity={0.7} />
                  <ReferenceLine y={3.9} stroke="#E8B85A" strokeDasharray="4 4" strokeWidth={1} strokeOpacity={0.7} />
                  <Line type="monotone" dataKey="value" stroke="#7CB882" strokeWidth={2} dot={false} activeDot={{ r: 5, fill: '#7CB882', stroke: '#fff', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          {glucoseList.length === 0 && (
            <p className="text-center py-20" style={{ fontSize: 'var(--fs-body)', color: 'var(--text-tertiary)' }}>暂无血糖记录</p>
          )}
          <div className="flex flex-col gap-2.5">
            {glucoseList.slice(0, 30).map((r) => (
              <div key={r.id} className={`px-5 py-4 flex justify-between items-center card-lift ${cardClass}`} style={cardStyle}>
                <div>
                  <span style={{ fontSize: 'var(--fs-body)', color: 'var(--text)', fontWeight: 500 }}>
                    {GLUCOSE_TYPE_LABELS[r.type]?.emoji} {GLUCOSE_TYPE_LABELS[r.type]?.label}
                  </span>
                  <p style={{ fontSize: 'var(--fs-small)', color: 'var(--text-tertiary)', marginTop: 3 }}>
                    {new Date(r.timestamp).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <span style={{
                  fontSize: 'var(--fs-number)',
                  fontWeight: 700,
                  color: r.value > 13.9 ? 'var(--red)' : r.value < 3.9 ? 'var(--yellow)' : 'var(--mint)',
                }}>
                  {r.value}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'meal' && (
        <>
          {mealList.length === 0 && (
            <p className="text-center py-20" style={{ fontSize: 'var(--fs-body)', color: 'var(--text-tertiary)' }}>暂无饮食记录</p>
          )}
          <div className="flex flex-col gap-2.5">
            {mealList.map((m) => (
              <div
                key={m.id}
                className={`p-3.5 flex gap-3.5 card-lift active:opacity-80 transition-opacity ${cardClass}`}
                style={cardStyle}
                onClick={() => onNavigate('meal-detail', { id: m.id })}
              >
                <img src={m.thumbnailData} alt="" className="w-[80px] h-[80px] rounded-[10px] object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <span style={{ fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--text)' }}>
                      {MEAL_TYPE_LABELS[m.mealType]?.emoji} {MEAL_TYPE_LABELS[m.mealType]?.label}
                    </span>
                    {m.reviewScore !== undefined && (
                      <span style={{ fontSize: 'var(--fs-heading)', fontWeight: 700, color: getScoreStyle(m.reviewScore).color }}>
                        {m.reviewScore}<span style={{ fontSize: 'var(--fs-small)', fontWeight: 400, color: 'var(--text-tertiary)' }}> 分</span>
                      </span>
                    )}
                  </div>
                  <p className="truncate" style={{ fontSize: 'var(--fs-label)', color: 'var(--text-secondary)', marginTop: 3 }}>
                    {m.reviewSummary || '等待分析…'}
                  </p>
                  <p style={{ fontSize: 'var(--fs-small)', color: 'var(--text-tertiary)', marginTop: 3 }}>
                    {new Date(m.timestamp).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
