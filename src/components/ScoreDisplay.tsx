interface Props {
  score: number
  size?: 'sm' | 'md' | 'lg'
}

const scoreColor = (s: number) =>
  s >= 7 ? 'var(--green)' : s >= 4 ? 'var(--yellow)' : 'var(--red)'

const sizeMap = {
  sm: { num: 'var(--fs-number)', unit: 'var(--fs-label)' },
  md: { num: 'calc(var(--fs-score) * 0.75)', unit: 'var(--fs-body)' },
  lg: { num: 'var(--fs-score)', unit: 'var(--fs-heading)' },
}

export default function ScoreDisplay({ score, size = 'lg' }: Props) {
  const s = sizeMap[size]
  return (
    <div className="flex items-center justify-center gap-2 pop-in">
      <span
        className="font-bold leading-none tracking-tight"
        style={{ fontSize: s.num, color: scoreColor(score), fontVariantNumeric: 'tabular-nums' }}
      >
        {score}
      </span>
      <span style={{ fontSize: s.unit, color: 'var(--text-tertiary)', marginTop: '0.35em' }}>
        分
      </span>
    </div>
  )
}
