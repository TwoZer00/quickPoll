import { memo, useMemo, useRef, useState } from 'react'
import { useSpring, animated } from '@react-spring/web'
import { PropTypes } from 'prop-types'
import { useTranslation } from 'react-i18next'
import { generateColorBySeed } from '../../utils/color'

const SIZE = 220
const STROKE = 32
const R = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * R
const CENTER = SIZE / 2

function DonutSegment ({ color, startAngle, fraction, delay }) {
  const dash = fraction * CIRCUMFERENCE
  const rotation = startAngle * 360 - 90

  const spring = useSpring({
    from: { val: 0 },
    to: { val: dash },
    delay,
    config: { tension: 60, friction: 18 }
  })

  return (
    <animated.circle
      cx={CENTER} cy={CENTER} r={R}
      fill='none'
      stroke={color}
      strokeWidth={STROKE}
      strokeDasharray={spring.val.to(v => `${v} ${CIRCUMFERENCE - v}`)}
      strokeDashoffset={CIRCUMFERENCE / 4}
      style={{ transformOrigin: `${CENTER}px ${CENTER}px`, transform: `rotate(${rotation}deg)` }}
    />
  )
}

const PieChartView = memo(({ options, voteCounts }) => {
  const { t } = useTranslation()
  const initialCounts = useRef(voteCounts)
  const [hovered, setHovered] = useState(null)

  const data = useMemo(() => {
    const total = options.reduce((s, o) => s + (initialCounts.current[o.id] || 0), 0)
    if (total === 0) return []
    let offset = 0
    return options
      .map(opt => ({ id: opt.id, title: opt.title, image: opt.image, value: initialCounts.current[opt.id] || 0, color: generateColorBySeed(opt.id) }))
      .filter(d => d.value > 0)
      .map((d, i) => {
        const fraction = d.value / total
        const seg = { ...d, fraction, offset, index: i }
        offset += fraction
        return seg
      })
  }, [options])

  const total = data.reduce((s, d) => s + d.value, 0)
  const h = hovered != null ? data[hovered] : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ position: 'relative', width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE}>
          {data.map((seg, i) => (
            <DonutSegment key={seg.id} color={seg.color} startAngle={seg.offset} fraction={seg.fraction} delay={i * 80} />
          ))}
          {data.map((seg, i) => {
            const dash = seg.fraction * CIRCUMFERENCE
            const rotation = seg.offset * 360 - 90
            return (
              <circle
                key={`hit-${seg.id}`}
                cx={CENTER} cy={CENTER} r={R}
                fill='none'
                strokeWidth={STROKE + 8}
                stroke='transparent'
                strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
                strokeDashoffset={CIRCUMFERENCE / 4}
                style={{ cursor: 'pointer', transformOrigin: `${CENTER}px ${CENTER}px`, transform: `rotate(${rotation}deg)` }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
            )
          })}
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          {h
            ? <>
              <span style={{ fontSize: 22, fontWeight: 700, color: h.color }}>{Math.round(h.fraction * 100)}%</span>
              <span style={{ fontSize: 12, color: '#888', maxWidth: 80, textAlign: 'center', lineHeight: 1.2 }}>{h.title}</span>
            </>
            : <>
              <span style={{ fontSize: 26, fontWeight: 700 }}>{total}</span>
              <span style={{ fontSize: 12, color: '#888' }}>{t('chart.votes')}</span>
            </>}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
        {data.map(seg => (
          <div key={seg.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {seg.image
              ? <img src={seg.image} alt={seg.title} style={{ width: 10, height: 10, borderRadius: '50%', objectFit: 'cover' }} />
              : <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: seg.color, display: 'inline-block', flexShrink: 0 }} />}
            <span style={{ fontSize: 12 }}>{seg.title}</span>
          </div>
        ))}
      </div>
    </div>
  )
})

PieChartView.displayName = 'PieChartView'

PieChartView.propTypes = {
  options: PropTypes.array.isRequired,
  voteCounts: PropTypes.object.isRequired
}

export default PieChartView
