import Icon from './Icon'
import type { TabKey } from '../types'

interface Props {
  active: TabKey | null
  onNavigate: (tab: TabKey) => void
}

const tabs: { key: TabKey; icon: 'home' | 'record' | 'camera'; label: string }[] = [
  { key: 'home', icon: 'home', label: '首页' },
  { key: 'record', icon: 'record', label: '记血糖' },
  { key: 'meal', icon: 'camera', label: '拍饮食' },
]

export default function BottomNav({ active, onNavigate }: Props) {
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-20"
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex justify-around items-center h-[68px] px-3">
        {tabs.map((tab) => {
          const isActive = active === tab.key
          const isPrimary = tab.key === 'meal'
          const activeColor = 'var(--mint)'
          const activeBg = 'var(--mint-soft)'
          const iconSize = isPrimary ? 26 : 21
          return (
            <button
              key={tab.key}
              onClick={() => onNavigate(tab.key)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                minWidth: isPrimary ? '100px' : '60px',
                padding: isPrimary ? '8px 20px' : '6px 10px',
                borderRadius: isPrimary ? '18px' : '10px',
                background: isActive ? activeBg : 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <Icon name={tab.icon} size={iconSize} color={isActive ? activeColor : 'var(--text-tertiary)'} />
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? activeColor : 'var(--text-tertiary)',
                  lineHeight: 1.2,
                  letterSpacing: '0.02em',
                }}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
