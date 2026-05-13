interface Props {
  score: number
  size?: 'sm' | 'md' | 'lg'
}

const scoreColor = (s: number) =>
  s >= 7 ? 'var(--green)' : s >= 4 ? 'var(--yellow)' : 'var(--red)'

export default function ScoreDisplay({ score, size = 'lg' }: Props) {
  const numSize = size === 'lg' ? 'var(--fs-score)' : size === 'md' ? 'calc(var(--fs-score) * 0.7)' : 'var(--fs-number)'
  const unitSize = size === 'lg' ? 'var(--fs-emoji-md)' : size === 'md' ? 'var(--fs-emoji-sm)' : 'var(--fs-heading)'

  return (
    <div className="flex items-center justify-center gap-2 pop-in">
      <span
        className="font-bold leading-none"
        style={{ fontSize: numSize, color: scoreColor(score), fontVariantNumeric: 'tabular-nums' }}
      >
        {score}
      </span>
      <span className="mt-2" style={{ fontSize: unitSize, color: 'var(--text-secondary)' }}>
        分
      </span>
    </div>
  )
}
