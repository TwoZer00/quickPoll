import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { useSpring, animated } from '@react-spring/web'
import { PropTypes } from 'prop-types'
import { useTranslation } from 'react-i18next'
import { generateColorBySeed } from '../../utils/color'

const SIZE = 220
const STROKE = 32
const R = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * R
const CENTER = SIZE / 2

function DonutSegment ({ color, startAngle, fraction, entryDelay, animated: didAnimate }) {
  const dash = fraction * CIRCUMFERENCE
  const rotation = startAngle * 360 - 90

  const spring = useSpring({
    val: dash,
    from: { val: didAnimate ? dash : 0 },
    delay: didAnimate ? 0 : entryDelay,
    config: didAnimate
      ? { tension: 180, friction: 24 }
      : { tension: 60, friction: 18 }
  })

  return (
    <animated.circle
      cx={CENTER} cy={CENTER} r={R}
      fill='none'
      stroke={color}
      strokeWidth={STROKE}
      strokeDasharray={spring.val.to(v => `${Math.max(0, v)} ${Math.max(0, CIRCUMFERENCE - v)}`)}
      strokeDashoffset={CIRCUMFERENCE / 4}
      style={{ transformOrigin: `${CENTER}px ${CENTER}px`, transform: `rotate(${rotation}deg)` }}
    />
  )
}

const toData = (options, counts) => {
  const total = options.reduce((s, o) => s + (counts[o.id] || 0), 0)
  if (total === 0) return []
  let offset = 0
  return options
    .map(opt => ({ id: opt.id, title: opt.title, image: opt.image, value: counts[opt.id] || 0, color: generateColorBySeed(opt.id) }))
    .filter(d => d.value > 0)
    .map(d => {
      const fraction = d.value / total
      const seg = { ...d, fraction, offset }
      offset += fraction
      return seg
    })
}

const PieChartView = memo(({ options, voteCounts }) => {
  const { t } = useTranslation()
  const [hovered, setHovered] = useState(null)
  const [animated, setAnimated] = useState(false)
  const [data, setData] = useState(() => toData(options, voteCounts))

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 800)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (animated) setData(toData(options, voteCounts))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voteCounts, animated])

  const total = useMemo(() => data.reduce((s, d) => s + d.value, 0), [data])
  const h = hovered != null ? data[hovered] : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ position: 'relative', width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE}>
          {data.map((seg, i) => (
            <DonutSegment key={seg.id} color={seg.color} startAngle={seg.offset} fraction={seg.fraction} entryDelay={i * 80} animated={animated} />
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
