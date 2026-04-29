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
    <text x={x} y={y} fill='#fff' textAnchor='middle' dominantBaseline='central' fontSize={13} fontWeight={600}>
      {`${Math.round(percent * 100)}%`}
    </text>
  )
}

const PieChartView = memo(({ options, voteCounts }) => {
  const data = useMemo(() => options
    .map(opt => ({ name: opt.title, value: voteCounts[opt.id] || 0, color: generateColorBySeed(opt.id) }))
    .filter(d => d.value > 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(voteCounts)]
  )

  return (
    <ResponsiveContainer width='100%' height={250}>
      <PieChart role='img' aria-label='Pie chart of poll results'>
        <Pie data={data} dataKey='value' nameKey='name' cx='50%' cy='50%' outerRadius={90} animationDuration={500} label={renderLabel} labelLine={false}>
          {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
        </Pie>
        <Tooltip formatter={(value, name) => [`${value} votes`, name]} />
        <Legend />
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
