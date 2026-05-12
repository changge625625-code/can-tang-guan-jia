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
  s >= 8 ? 'var(--green)' : s >= 5 ? 'var(--yellow)' : 'var(--red)'

const emojiMap: Record<string, string> = {
  overeating: '🥺',
  diet_warning: '💛',
  high_bg: '🩺',
  low_bg: '🍬',
}

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-8"
      style={{ background: 'rgba(60,60,58,0.35)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="slide-up bg-white rounded-modal px-8 py-10 text-center w-full max-w-[340px]"
        style={{ boxShadow: 'var(--shadow-lg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-[64px] mb-4">{emojiMap[type] || '💛'}</div>

        {score !== undefined && (
          <div className="pop-in mb-2" style={{ animationDelay: '0.1s' }}>
            <span className="text-[88px] font-bold leading-none" style={{ color: scoreColor(score) }}>
              {score}
            </span>
            <span className="text-2xl text-secondary ml-1">分</span>
          </div>
        )}

        <p className="text-[28px] font-semibold text-primary leading-snug mb-2">{message}</p>

        {suggestion && (
          <p className="text-[22px] text-secondary leading-relaxed mb-6">{suggestion}</p>
        )}

        <button
          onClick={onClose}
          className="w-full h-[64px] rounded-btn font-semibold text-[23px] transition-all active:scale-[0.97]" style={{ background: 'var(--coral)', color: 'var(--text)', boxShadow: 'var(--shadow-md)' }}
        >
          {type === 'overeating' ? '好的，我记住了 🌸' : '我知道了'}
        </button>
      </div>
    </div>
  )
}
