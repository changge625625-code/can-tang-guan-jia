import { useState } from 'react'
import { GLUCOSE_TYPE_LABELS } from '../utils/constants'
import { addGlucose } from '../services/glucoseService'
import { addAlertLog } from '../services/alertService'
import { getSettings } from '../services/settingsService'
import AlertModal from '../components/AlertModal'
import type { GlucoseType } from '../types'

const TYPES: GlucoseType[] = ['fasting', 'before_meal', 'after_meal', 'before_sleep', 'random']

interface Props { onNavigate: (page: string) => void }

export default function RecordPage({ onNavigate }: Props) {
  const [value, setValue] = useState('')
  const [type, setType] = useState<GlucoseType>('after_meal')
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState<{ visible: boolean; type: 'high_bg' | 'low_bg'; message: string }>({ visible: false, type: 'high_bg', message: '' })

  const input = (n: string) => {
    if (n === '.' && value.includes('.')) return
    if (value.length >= 4) return
    const v = value + n
    if (v.includes('.') && v.split('.')[1]?.length > 1) return
    setValue(v)
  }

  const del = () => setValue((v) => v.slice(0, -1))

  const save = async () => {
    const num = parseFloat(value)
    if (!num || num < 0.5 || num > 35) return
    setSaving(true)
    try {
      await addGlucose({ value: num, type, mealRelation: 'none', timestamp: Date.now() })
      const s = await getSettings()
      if (num > s.highBgThreshold) {
        setAlert({ visible: true, type: 'high_bg', message: '血糖有点高了，多喝水、散散步' })
        await addAlertLog('high_bg', `血糖偏高 ${num}`, undefined, 'glucose')
      } else if (num < s.lowBgThreshold) {
        setAlert({ visible: true, type: 'low_bg', message: '血糖偏低，快吃点东西' })
        await addAlertLog('low_bg', `血糖偏低 ${num}`, undefined, 'glucose')
      } else {
        onNavigate('home')
      }
    } finally { setSaving(false) }
  }

  const keys = [['1','2','3'],['4','5','6'],['7','8','9'],['.','0','⌫']]
  const keyBg = (k: string) => k === '⌫' ? 'bg-coral-soft text-coral' : 'bg-cream text-primary'

  return (
    <div className="page-fade-in px-5 pb-32 pt-6">
      {/* Value display */}
      <div className="text-center mb-6">
        <p className="text-[20px] text-secondary mb-2">血糖值</p>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-[56px] font-bold text-primary leading-none min-h-[72px]" style={{ color: value ? 'var(--text)' : 'var(--text-tertiary)' }}>
            {value || '0.0'}
          </span>
          <span className="text-[22px] text-secondary">mmol/L</span>
        </div>
      </div>

      {/* Type picker */}
      <div className="flex flex-wrap gap-2 justify-center mb-5">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className="h-11 px-4 rounded-full text-[20px] font-medium transition-all active:scale-95"
            style={{
              background: type === t ? 'var(--coral-soft)' : 'var(--white)',
              color: type === t ? 'var(--coral)' : 'var(--text-secondary)',
              border: type === t ? '1.5px solid var(--coral)' : '1px solid var(--border)',
            }}
          >
            {GLUCOSE_TYPE_LABELS[t].emoji} {GLUCOSE_TYPE_LABELS[t].label}
          </button>
        ))}
      </div>

      {/* Number pad */}
      <div className="bg-white rounded-card p-3 shadow-card">
        {keys.map((row, i) => (
          <div key={i} className="flex gap-2 mb-2 last:mb-0">
            {row.map((k) => (
              <button
                key={k}
                onClick={() => k === '⌫' ? del() : input(k)}
                className={`flex-1 h-[64px] rounded-[14px] text-[30px] font-medium active:opacity-70 transition-opacity ${keyBg(k)}`}
              >
                {k}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Save */}
      <button
        onClick={save}
        disabled={!value || saving}
        className="w-full h-[68px] mt-5 rounded-btn font-semibold text-[24px] active:scale-[0.97] transition-all disabled:opacity-40"
        style={{ background: 'var(--coral)', color: 'var(--text)', boxShadow: 'var(--shadow-md)' }}
      >
        {saving ? '保存中...' : '💾 保存'}
      </button>

      <AlertModal visible={alert.visible} type={alert.type} message={alert.message} onClose={() => { setAlert({ ...alert, visible: false }); onNavigate('home') }} />
    </div>
  )
}
