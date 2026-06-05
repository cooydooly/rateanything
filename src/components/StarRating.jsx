import { useState } from 'react'

export default function StarRating({ value = 0, onChange, size = 24, readonly = false }) {
  const [hover, setHover] = useState(0)
  const display = hover || value

  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(n => (
        <span
          key={n}
          onClick={() => !readonly && onChange?.(n)}
          onMouseEnter={() => !readonly && setHover(n)}
          onMouseLeave={() => !readonly && setHover(0)}
          style={{
            fontSize: size,
            color: n <= display ? 'var(--star)' : 'var(--border-strong)',
            cursor: readonly ? 'default' : 'pointer',
            transition: 'color 0.1s, transform 0.1s',
            transform: !readonly && hover === n ? 'scale(1.2)' : 'scale(1)',
            display: 'inline-block',
            userSelect: 'none',
          }}
        >★</span>
      ))}
    </div>
  )
}
