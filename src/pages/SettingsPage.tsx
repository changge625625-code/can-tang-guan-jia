import { useState, useEffect } from 'react'
import { getSettings, updateSettings } from '../services/settingsService'
import { db } from '../db'


interface Props {
  onNavigate: (page: string) => void
}

const hasEnvKey = !!import.meta.env.VITE_QWEN_API_KEY

export default function SettingsPage({ onNavigate }: Props) {
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

  const inputClass = "w-full h-14 px-4 text-[22px] rounded-[12px] border border-[#EBEBE6] bg-cream text-primary text-center focus:border-coral transition-colors"

  return (
    <div className="page-fade-in px-5 pb-32 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[40px] font-bold text-primary tracking-tight">设置</h1>
        <button
          onClick={() => onNavigate('home')}
          className="h-11 px-4 rounded-full text-[20px] font-medium text-coral bg-coral-soft active:scale-95 transition-transform"
        >
          🏠 首页
        </button>
      </div>

      <div className="stagger flex flex-col gap-5">

        {/* API Key */}
        <div className="bg-white rounded-card p-5 shadow-card">
          <h2 className="text-[22px] font-semibold text-primary mb-3">🔑 AI 服务</h2>
          {hasEnvKey ? (
            <div className="flex items-center gap-3 h-14 px-4 rounded-[12px] bg-green-bg text-[22px] text-green font-medium">
              ✅ API Key 已配置（环境变量）
            </div>
          ) : (
            <>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className={inputClass}
              />
              <p className="text-[18px] text-tertiary mt-2">
                去 bailian.console.aliyun.com 获取
              </p>
            </>
          )}
        </div>

        {/* 血糖阈值 */}
        <div className="bg-white rounded-card p-5 shadow-card">
          <h2 className="text-[22px] font-semibold text-primary mb-4">🩸 血糖阈值 (mmol/L)</h2>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[18px] text-secondary block mb-1">高血糖警告</label>
              <input type="number" value={highBg} onChange={(e) => setHighBg(e.target.value)} className={inputClass} />
            </div>
            <div className="flex-1">
              <label className="text-[18px] text-secondary block mb-1">低血糖警告</label>
              <input type="number" value={lowBg} onChange={(e) => setLowBg(e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        {/* 饮食告警 */}
        <div className="bg-white rounded-card p-5 shadow-card">
          <h2 className="text-[22px] font-semibold text-primary mb-4">🍽️ 饮食提醒</h2>
          <label className="text-[18px] text-secondary block mb-1">评分 ≤ 此值时弹出提醒</label>
          <input type="number" min="1" max="10" value={alertScore} onChange={(e) => setAlertScore(e.target.value)} className={`${inputClass} w-24`} />
        </div>

        {/* 保存 */}
        <button
          onClick={handleSave}
          className="w-full h-[64px] rounded-btn font-semibold text-[23px] active:scale-[0.97] transition-all" style={{ background: 'var(--coral)', color: 'var(--text)', boxShadow: 'var(--shadow-md)' }}
        >
          {saved ? '✅ 已保存' : '保存设置'}
        </button>

        {/* 导出 */}
        <button
          onClick={handleExport}
          className="w-full h-[64px] rounded-btn bg-white border border-[#EBEBE6] text-secondary font-medium text-[22px] active:bg-cream transition-colors"
        >
          📦 导出数据
        </button>

        {/* 关于 */}
        <p className="text-center text-[19px] text-tertiary">🍀 灿灿糖管家 v1.0 · 温馨陪伴</p>
      </div>
    </div>
  )
}
