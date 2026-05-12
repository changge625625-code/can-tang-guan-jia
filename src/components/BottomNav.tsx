import type { TabKey } from '../types'

interface Props {
  active: TabKey | null
  onNavigate: (tab: TabKey) => void
}

const tabs: { key: TabKey; emoji: string; label: string }[] = [
  { key: 'home', emoji: '🏠', label: '首页' },
  { key: 'record', emoji: '📝', label: '记血糖' },
  { key: 'meal', emoji: '📷', label: '拍饮食' },
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
          return (
            <button
              key={tab.key}
              onClick={() => onNavigate(tab.key)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1px',
                minWidth: isPrimary ? '110px' : '64px',
                padding: isPrimary ? '6px 24px' : '6px 12px',
                borderRadius: isPrimary ? '24px' : '12px',
                background: isActive ? 'var(--coral-soft)' : 'transparent',
                border: isActive ? '1.5px solid var(--coral)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: isPrimary ? '32px' : '26px' }}>{tab.emoji}</span>
              <span
                style={{
                  fontSize: isPrimary ? '16px' : '13px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--coral)' : 'var(--text-secondary)',
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
