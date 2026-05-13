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
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex justify-around items-center h-[72px] px-2">
        {tabs.map((tab) => {
          const isActive = active === tab.key
          const isPrimary = tab.key === 'meal'
          const activeColor = 'var(--mint)'
          const activeBg = 'var(--mint-soft)'
          return (
            <button
              key={tab.key}
              onClick={() => onNavigate(tab.key)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                minWidth: isPrimary ? '110px' : '64px',
                padding: isPrimary ? '6px 24px' : '6px 12px',
                borderRadius: isPrimary ? '20px' : '12px',
                background: isActive ? activeBg : 'transparent',
                border: isActive ? '1.5px solid var(--mint)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon name={tab.icon} size={isPrimary ? 28 : 22} color={isActive ? activeColor : 'var(--text-secondary)'} />
              <span
                style={{
                  fontSize: isPrimary ? 'var(--fs-small)' : '11px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? activeColor : 'var(--text-secondary)',
                  lineHeight: 1.2,
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
