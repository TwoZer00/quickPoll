import { memo, useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { PropTypes } from 'prop-types'
import { generateColorBySeed } from '../../utils/color'

const RADIAN = Math.PI / 180
const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill='#fff' textAnchor='middle' dominantBaseline='central' fontSize={13} fontWeight={600} style={{ textShadow: '0 0 4px rgba(0,0,0,0.7)' }}>
      {`${Math.round(percent * 100)}%`}
    </text>
  )
}

const PieChartView = memo(({ options, voteCounts }) => {
  const data = useMemo(() => options
    .map(opt => ({ name: opt.title, value: voteCounts[opt.id] || 0, color: generateColorBySeed(opt.id), image: opt.image, id: opt.id }))
    .filter(d => d.value > 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(voteCounts)]
  )

  const renderLegend = ({ payload }) => (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {data[i]?.image
            ? <img src={data[i].image} alt={entry.value} style={{ width: 16, height: 16, borderRadius: '50%', objectFit: 'cover' }} />
            : <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: entry.color, display: 'inline-block' }} />}
          <span style={{ fontSize: 12 }}>{entry.value}</span>
        </div>
      ))}
    </div>
  )

  return (
    <ResponsiveContainer width='100%' aspect={1.6} minHeight={180} maxHeight={280}>
      <PieChart role='img' aria-label='Pie chart of poll results'>
        <defs>
          {data.map(entry => entry.image && (
            <pattern key={entry.id} id={`pie-img-${entry.id}`} patternUnits='objectBoundingBox' width={1} height={1}>
              <image href={entry.image} width={180} height={180} preserveAspectRatio='xMidYMid slice' />
            </pattern>
          ))}
        </defs>
        <Pie data={data} dataKey='value' nameKey='name' cx='50%' cy='50%' outerRadius={90} animationDuration={500} label={renderLabel} labelLine={false}>
          {data.map((entry, i) => <Cell key={i} fill={entry.image ? `url(#pie-img-${entry.id})` : entry.color} stroke='#fff' strokeWidth={2} />)}
        </Pie>
        <Tooltip formatter={(value, name) => [`${value} votes`, name]} />
        <Legend content={renderLegend} />
      </PieChart>
    </ResponsiveContainer>
  )
})

PieChartView.displayName = 'PieChartView'

PieChartView.propTypes = {
  options: PropTypes.array.isRequired,
  voteCounts: PropTypes.object.isRequired
}

export default PieChartView
