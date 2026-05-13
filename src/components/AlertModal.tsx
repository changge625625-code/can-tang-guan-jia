import { useEffect } from 'react'
import type { AlertType } from '../types'

interface Props {
  visible: boolean
  type: AlertType
  score?: number
  message: string
  suggestion?: string
  onClose: () => void
}

const scoreColor = (s: number) =>
  s >= 7 ? 'var(--green)' : s >= 4 ? 'var(--yellow)' : 'var(--red)'

export default function AlertModal({ visible, type, score, message, suggestion, onClose }: Props) {
  useEffect(() => {
    if (!visible) return
    if ('vibrate' in navigator) {
      navigator.vibrate(type === 'overeating' ? [500, 300, 500] : type === 'diet_warning' ? [300] : [500, 300, 500, 300, 500])
    }
    try {
      const ctx = new AudioContext()
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'
      o.frequency.value = 660
      g.gain.value = 0.2
      o.connect(g).connect(ctx.destination)
      o.start()
      setTimeout(() => o.stop(), 600)
    } catch { /* ok */ }
  }, [visible, type])

  if (!visible) return null

  const iconEl = type === 'overeating' ? '🥺' : type === 'diet_warning' ? '💛' : type === 'high_bg' ? '🩺' : '🍬'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-8"
      style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="slide-up bg-white rounded-modal px-8 py-10 text-center w-full max-w-[340px]"
        style={{ boxShadow: 'var(--card-shadow)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 'var(--fs-emoji-lg)', marginBottom: 16 }}>{iconEl}</div>

        {score !== undefined && (
          <div className="pop-in mb-2" style={{ animationDelay: '0.1s' }}>
            <span className="font-bold leading-none" style={{ fontSize: 'calc(var(--fs-score) * 1.3)', color: scoreColor(score) }}>
              {score}
            </span>
            <span style={{ fontSize: 'var(--fs-heading)', color: 'var(--text-secondary)', marginLeft: 4 }}>分</span>
          </div>
        )}

        <p style={{ fontSize: 'var(--fs-title)', fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>{message}</p>

        {suggestion && (
          <p style={{ fontSize: 'var(--fs-heading)', color: 'var(--text-secondary)', marginBottom: 24 }}>{suggestion}</p>
        )}

        <button
          onClick={onClose}
          className="w-full h-[64px] rounded-btn font-semibold transition-all active:scale-[0.97]"
          style={{ fontSize: 'var(--fs-body)', background: 'var(--mint)', color: '#FFFFFF' }}
        >
          {type === 'overeating' ? '好的，我记住了' : '我知道了'}
        </button>
      </div>
    </div>
  )
}
