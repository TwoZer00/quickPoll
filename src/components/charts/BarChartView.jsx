import { memo, useState } from 'react'
import { useSpring, animated, useTransition } from '@react-spring/web'
import { PropTypes } from 'prop-types'
import { alpha, IconButton, Tooltip } from '@mui/material'
import { SortByAlpha } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

function Bar ({ option, value, total, color, hasImages }) {
  const pct = total > 0 ? (value / total) * 100 : 0
  const barHeight = hasImages ? 14 : 8

  const spring = useSpring({
    width: `${pct}%`,
    config: { tension: 120, friction: 20 }
  })

  const countSpring = useSpring({
    val: value,
    config: { tension: 120, friction: 20 }
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {option.image
            ? <img src={option.image} alt={option.title} style={{ width: 64, height: 64, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
            : <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color, display: 'inline-block', flexShrink: 0 }} />}
          <span style={{ fontSize: 13, fontWeight: 500 }}>{option.title}</span>
        </div>
        <span style={{ fontSize: 13, color: '#888', flexShrink: 0, marginLeft: 8 }}>
          <animated.span>{countSpring.val.to(v => Math.round(v))}</animated.span>
          {total > 0 && ` · ${Math.round(pct)}%`}
        </span>
      </div>
      <div style={{ height: barHeight, borderRadius: 4, backgroundColor: alpha(color, 0.12), overflow: 'hidden' }}>
        <animated.div style={{ height: '100%', borderRadius: 4, backgroundColor: color, width: spring.width }} />
      </div>
    </div>
  )
}

const BarChartView = memo(({ options, voteCounts }) => {
  const { t } = useTranslation()
  const [asc, setAsc] = useState(false)
  const total = Object.values(voteCounts).reduce((a, b) => a + b, 0)
  const sorted = [...options].sort((a, b) => asc
    ? (voteCounts[a.id] || 0) - (voteCounts[b.id] || 0)
    : (voteCounts[b.id] || 0) - (voteCounts[a.id] || 0)
  )
  const hasImages = options.some(o => o.image)

  const gap = hasImages ? 20 : 14
  const itemHeight = hasImages ? 98 : 46
  const rowHeight = itemHeight + gap
  const containerHeight = sorted.length * rowHeight - gap

  const transitions = useTransition(sorted, {
    keys: opt => opt.id,
    from: { opacity: 0 },
    enter: (_, i) => ({ opacity: 1, y: i * rowHeight }),
    update: (_, i) => ({ y: i * rowHeight }),
    config: { tension: 200, friction: 26 }
  })

  return (
    <div style={{ padding: '4px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Tooltip title={t('chart.sortAsc')}>
          <IconButton size='small' onClick={() => setAsc(v => !v)} color={asc ? 'primary' : 'default'}>
            <SortByAlpha fontSize='small' />
          </IconButton>
        </Tooltip>
      </div>
      <div style={{ position: 'relative', height: containerHeight }}>
        {transitions((style, opt) => (
          <animated.div key={opt.id} style={{ position: 'absolute', width: '100%', ...style }}>
            <Bar option={opt} value={voteCounts[opt.id] || 0} total={total} color={opt.color} hasImages={hasImages} />
          </animated.div>
        ))}
      </div>
    </div>
  )
})

BarChartView.displayName = 'BarChartView'

BarChartView.propTypes = {
  options: PropTypes.array.isRequired,
  voteCounts: PropTypes.object.isRequired
}

export default BarChartView
