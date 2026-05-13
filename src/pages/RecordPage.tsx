import { useState } from 'react'
import { GLUCOSE_TYPE_LABELS } from '../utils/constants'
import { addGlucose } from '../services/glucoseService'
import { addAlertLog } from '../services/alertService'
import { getSettings } from '../services/settingsService'
import AlertModal from '../components/AlertModal'
import Icon from '../components/Icon'
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

  return (
    <div className="page-fade-in px-5 pb-32 pt-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Icon name="blood" size={22} color="var(--text-secondary)" />
          <span style={{ fontSize: 'var(--fs-body-lg)', color: 'var(--text-secondary)' }}>血糖值</span>
        </div>
        <div className="flex items-baseline justify-center gap-1">
          <span className="font-bold leading-none" style={{ fontSize: 'var(--fs-score)', minHeight: '72px', color: value ? 'var(--mint)' : 'var(--text-tertiary)' }}>
            {value || '0.0'}
          </span>
          <span style={{ fontSize: 'var(--fs-heading)', color: 'var(--text-secondary)' }}>mmol/L</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 justify-center mb-5">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className="h-11 px-4 rounded-full font-medium transition-all active:scale-95"
            style={{
              fontSize: 'var(--fs-label)',
              background: type === t ? 'var(--mint-soft)' : 'var(--white)',
              color: type === t ? 'var(--mint)' : 'var(--text-secondary)',
              border: type === t ? '1.5px solid var(--mint)' : '1px solid var(--border)',
            }}
          >
            {GLUCOSE_TYPE_LABELS[t].emoji} {GLUCOSE_TYPE_LABELS[t].label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-card p-3 shadow-card">
        {keys.map((row, i) => (
          <div key={i} className="flex gap-2 mb-2 last:mb-0">
            {row.map((k) => (
              <button
                key={k}
                onClick={() => k === '⌫' ? del() : input(k)}
                className="flex-1 h-[64px] rounded-[14px] font-medium active:opacity-70 transition-opacity"
                style={{
                  fontSize: 'var(--fs-title)',
                  background: k === '⌫' ? 'var(--mint-soft)' : '#FAFAFA',
                  color: k === '⌫' ? 'var(--mint)' : 'var(--text)',
                }}
              >
                {k}
              </button>
            ))}
          </div>
        ))}
      </div>

      <button
        onClick={save}
        disabled={!value || saving}
        className="w-full h-[68px] mt-5 rounded-btn font-semibold active:scale-[0.97] transition-all disabled:opacity-40"
        style={{ fontSize: 'var(--fs-heading)', background: 'var(--mint)', color: '#FFFFFF' }}
      >
        <Icon name="save" size={20} color="#FFFFFF" />
        <span className="ml-2">{saving ? '保存中...' : '保存'}</span>
      </button>

      <AlertModal visible={alert.visible} type={alert.type} message={alert.message} onClose={() => { setAlert({ ...alert, visible: false }); onNavigate('home') }} />
    </div>
  )
}
