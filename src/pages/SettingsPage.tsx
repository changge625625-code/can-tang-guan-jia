import { useState, useEffect } from 'react'
import { getSettings, updateSettings } from '../services/settingsService'
import { db } from '../db'
import Icon from '../components/Icon'
import type { FontMode } from '../types'


interface Props {
  onNavigate: (page: string) => void
  fontMode: FontMode
  setFontMode: (mode: FontMode) => Promise<void>
}

const cardClass = "bg-white shadow-card"
const cardStyle = { borderRadius: 'var(--card-radius)' }
const inputStyle = { fontSize: 'var(--fs-heading)' } as React.CSSProperties

export default function SettingsPage({ onNavigate, fontMode, setFontMode }: Props) {
  const [apiKey, setApiKey] = useState('')
  const [highBg, setHighBg] = useState('13.9')
  const [lowBg, setLowBg] = useState('3.9')
  const [alertScore, setAlertScore] = useState('4')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getSettings().then((s) => {
      setApiKey(s.qwenApiKey || '')
      setHighBg(String(s.highBgThreshold))
      setLowBg(String(s.lowBgThreshold))
      setAlertScore(String(s.alertScoreThreshold))
    })
  }, [])

  const handleSave = async () => {
    await updateSettings({
      qwenApiKey: apiKey,
      highBgThreshold: parseFloat(highBg) || 13.9,
      lowBgThreshold: parseFloat(lowBg) || 3.9,
      alertScoreThreshold: parseInt(alertScore) || 4,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleExport = async () => {
    const glucose = await db.glucoseRecords.toArray()
    const meals = await db.mealRecords.toArray()
    const alerts = await db.alertLogs.toArray()
    const data = JSON.stringify({ glucose, meals, alerts }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `灿灿糖管家_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const inputClass = "w-full h-14 px-4 rounded-[12px] border border-[#EBE7DE] bg-white text-primary text-center focus:border-mint transition-colors"

  return (
    <div className="page-fade-in px-5 pb-32 pt-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="h1">设置</h1>
        <button
          onClick={() => onNavigate('home')}
          className="h-11 px-5 rounded-full font-medium transition-transform active:scale-95 flex items-center gap-1.5"
          style={{ fontSize: 'var(--fs-label)', color: 'var(--mint)', background: 'var(--mint-soft)' }}
        >
          <Icon name="home" size={17} color="var(--mint)" />
          首页
        </button>
      </div>

      <div className="stagger flex flex-col gap-4">

        {/* Font size */}
        <div className={`p-5 ${cardClass}`} style={cardStyle}>
          <h2 style={{ fontSize: 'var(--fs-heading)', fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>字体大小</h2>
          <div className="flex gap-3">
            <button
              onClick={() => setFontMode('normal')}
              className="flex-1 h-12 rounded-full font-medium transition-all active:scale-95"
              style={{
                fontSize: 'var(--fs-body)',
                background: fontMode === 'normal' ? 'var(--mint-soft)' : 'var(--white)',
                color: fontMode === 'normal' ? 'var(--mint)' : 'var(--text-secondary)',
                border: fontMode === 'normal' ? '1.5px solid var(--mint)' : '1px solid var(--border)',
              }}
            >
              标准
            </button>
            <button
              onClick={() => setFontMode('large')}
              className="flex-1 h-12 rounded-full font-medium transition-all active:scale-95"
              style={{
                fontSize: 'var(--fs-body)',
                background: fontMode === 'large' ? 'var(--mint-soft)' : 'var(--white)',
                color: fontMode === 'large' ? 'var(--mint)' : 'var(--text-secondary)',
                border: fontMode === 'large' ? '1.5px solid var(--mint)' : '1px solid var(--border)',
              }}
            >
              大字
            </button>
          </div>
        </div>

        {/* API Key */}
        <div className={`p-5 ${cardClass}`} style={cardStyle}>
          <div className="flex items-center gap-2 mb-3">
            <Icon name="key" size={20} color="var(--text)" />
            <span style={{ fontSize: 'var(--fs-heading)', fontWeight: 600, color: 'var(--text)' }}>AI 服务</span>
          </div>
          <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-..." className={inputClass} style={inputStyle} />
          <p style={{ fontSize: 'var(--fs-small)', color: 'var(--text-tertiary)', marginTop: 8 }}>
            去 bailian.console.aliyun.com 获取
          </p>
        </div>

        {/* Blood sugar thresholds */}
        <div className={`p-5 ${cardClass}`} style={cardStyle}>
          <div className="flex items-center gap-2 mb-4">
            <Icon name="blood" size={20} color="var(--text)" />
            <span style={{ fontSize: 'var(--fs-heading)', fontWeight: 600, color: 'var(--text)' }}>血糖阈值 (mmol/L)</span>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label style={{ fontSize: 'var(--fs-small)', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>高血糖警告</label>
              <input type="number" value={highBg} onChange={(e) => setHighBg(e.target.value)} className={inputClass} style={inputStyle} />
            </div>
            <div className="flex-1">
              <label style={{ fontSize: 'var(--fs-small)', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>低血糖警告</label>
              <input type="number" value={lowBg} onChange={(e) => setLowBg(e.target.value)} className={inputClass} style={inputStyle} />
            </div>
          </div>
        </div>

        {/* Diet alert */}
        <div className={`p-5 ${cardClass}`} style={cardStyle}>
          <div className="flex items-center gap-2 mb-4">
            <Icon name="alert" size={20} color="var(--text)" />
            <span style={{ fontSize: 'var(--fs-heading)', fontWeight: 600, color: 'var(--text)' }}>饮食提醒</span>
          </div>
          <label style={{ fontSize: 'var(--fs-small)', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>评分 ≤ 此值时弹出提醒</label>
          <input type="number" min="1" max="10" value={alertScore} onChange={(e) => setAlertScore(e.target.value)} className={`${inputClass} w-24`} style={inputStyle} />
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className="w-full h-[62px] font-semibold btn-press flex items-center justify-center gap-2"
          style={{ fontSize: 'var(--fs-body-lg)', background: 'var(--mint)', color: '#FFFFFF', borderRadius: 'var(--btn-radius)' }}
        >
          <Icon name="save" size={22} color="#FFFFFF" />
          {saved ? '已保存' : '保存设置'}
        </button>

        {/* Export */}
        <button
          onClick={handleExport}
          className="w-full h-[56px] font-medium btn-press flex items-center justify-center gap-2"
          style={{ fontSize: 'var(--fs-heading)', background: 'var(--white)', color: 'var(--text-secondary)', borderRadius: 'var(--btn-radius)', border: '1px solid var(--border)' }}
        >
          <Icon name="download" size={20} color="var(--text-secondary)" />
          导出数据
        </button>

        <p className="text-center pt-2" style={{ fontSize: 'var(--fs-label)', color: 'var(--text-tertiary)' }}>
          灿灿糖管家 v1.0 · 温馨陪伴
        </p>
      </div>
    </div>
  )
}
