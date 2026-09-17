import { memo, useEffect, useMemo, useState } from 'react'
import { useSpring, animated } from '@react-spring/web'
import { PropTypes } from 'prop-types'
import { useTranslation } from 'react-i18next'

const DEFAULT_SIZE = 220

function LegendItem ({ seg, index, animated: didAnimate, t }) {
  const spring = useSpring({
    from: { opacity: 0, x: 16 },
    to: { opacity: 1, x: 0 },
    delay: didAnimate ? 0 : index * 80,
    config: { tension: 60, friction: 18 }
  })
  return (
    <animated.div style={{ ...spring, display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: seg.color, flexShrink: 0 }} />
      {seg.image && <img src={seg.image} alt={seg.title} style={{ width: 28, height: 28, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }} />}
      <span style={{ fontSize: 12, flex: 1 }}>{seg.title}</span>
      <span style={{ fontSize: 12, color: '#888', whiteSpace: 'nowrap' }}>{Math.round(seg.fraction * 100)}% · {seg.value} {t('chart.votes')}</span>
    </animated.div>
  )
}

function DonutSegment ({ color, startAngle, fraction, entryDelay, animated: didAnimate, circumference, r, center, stroke }) {
  const dash = fraction * circumference
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
      cx={center} cy={center} r={r}
      fill='none'
      stroke={color}
      strokeWidth={stroke}
      strokeDasharray={spring.val.to(v => `${Math.max(0, v)} ${Math.max(0, circumference - v)}`)}
      strokeDashoffset={circumference / 4}
      style={{ transformOrigin: `${center}px ${center}px`, transform: `rotate(${rotation}deg)` }}
    />
  )
}

const toData = (options, counts) => {
  const total = options.reduce((s, o) => s + (counts[o.id] || 0), 0)
  if (total === 0) return []
  let offset = 0
  return options
    .map(opt => ({ id: opt.id, title: opt.title, image: opt.image, value: counts[opt.id] || 0, color: opt.color }))
    .filter(d => d.value > 0)
    .map(d => {
      const fraction = d.value / total
      const seg = { ...d, fraction, offset }
      offset += fraction
      return seg
    })
}

const PieChartView = memo(({ options, voteCounts }) => {
  const STROKE = 32
  const R = (DEFAULT_SIZE - STROKE) / 2
  const CIRCUMFERENCE = 2 * Math.PI * R
  const CENTER = DEFAULT_SIZE / 2
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

  const sorted = useMemo(() => [...data].sort((a, b) => b.value - a.value), [data])

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: DEFAULT_SIZE, height: DEFAULT_SIZE }}>
        <svg width={DEFAULT_SIZE} height={DEFAULT_SIZE}>
          {data.map((seg, i) => (
            <DonutSegment key={seg.id} color={seg.color} startAngle={seg.offset} fraction={seg.fraction} entryDelay={i * 80} animated={animated} circumference={CIRCUMFERENCE} r={R} center={CENTER} stroke={STROKE} />
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
              {h.image
                ? <img src={h.image} alt={h.title} style={{ width: DEFAULT_SIZE * 0.35, height: DEFAULT_SIZE * 0.35, borderRadius: 8, objectFit: 'cover', marginBottom: 4 }} />
                : <span style={{ fontSize: 22, fontWeight: 700, color: h.color }}>{Math.round(h.fraction * 100)}%</span>
              }
              {h.image && <span style={{ fontSize: 13, fontWeight: 600, color: h.color }}>{Math.round(h.fraction * 100)}%</span>}
              <span style={{ fontSize: 12, color: '#888', maxWidth: DEFAULT_SIZE * 0.4, textAlign: 'center', lineHeight: 1.2 }}>{h.title}</span>
            </>
            : <>
              <span style={{ fontSize: 26, fontWeight: 700 }}>{total}</span>
              <span style={{ fontSize: 12, color: '#888' }}>{t('chart.votes')}</span>
            </>}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 140, maxWidth: 200 }}>
        {sorted.map((seg, i) => (
          <LegendItem key={seg.id} seg={seg} index={i} animated={animated} t={t} />
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
