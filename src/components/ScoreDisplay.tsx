interface Props {
  score: number
  size?: 'sm' | 'md' | 'lg'
}

const scoreColor = (s: number) =>
  s >= 8 ? 'var(--green)' : s >= 5 ? 'var(--yellow)' : 'var(--red)'

const emoji = (s: number) =>
  s >= 8 ? '😊' : s >= 5 ? '🙂' : '🥺'

const sizes = {
  sm: { number: 52, unit: 22 },
  md: { number: 72, unit: 26 },
  lg: { number: 104, unit: 32 },
}

export default function ScoreDisplay({ score, size = 'lg' }: Props) {
  const s = sizes[size]
  return (
    <div className="flex items-center justify-center gap-2 pop-in">
      <span style={{ fontSize: s.number * 0.5 }}>{emoji(score)}</span>
      <span
        className="font-bold leading-none"
        style={{ fontSize: s.number, color: scoreColor(score), fontVariantNumeric: 'tabular-nums' }}
      >
        {score}
      </span>
      <span className="mt-2" style={{ fontSize: s.unit, color: 'var(--text-secondary)' }}>
        分
      </span>
    </div>
  )
}
