import { memo, useMemo } from 'react'
import { BarChart, Bar, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { PropTypes } from 'prop-types'
import { generateColorBySeed } from '../../utils/color'

const CustomXAxisTick = ({ x, y, payload, data }) => {
  const entry = data.find(d => d.name === payload.value)
  if (entry?.image) {
    return (
      <g transform={`translate(${x},${y + 4})`}>
        <clipPath id={`clip-${payload.index}`}><circle cx={0} cy={10} r={10} /></clipPath>
        <image href={entry.image} x={-10} y={0} width={20} height={20} clipPath={`url(#clip-${payload.index})`} />
      </g>
    )
  }
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={12} textAnchor='middle' fill='#666' fontSize={12}>
        {payload.value.length > 10 ? `${payload.value.slice(0, 10)}…` : payload.value}
      </text>
    </g>
  )
}

const BarChartView = memo(({ options, voteCounts }) => {
  const data = useMemo(() => options
    .map(opt => ({ name: opt.title, votes: voteCounts[opt.id] || 0, fill: generateColorBySeed(opt.id), image: opt.image, id: opt.id })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(voteCounts)]
  )

  return (
    <ResponsiveContainer width='100%' height={250}>
      <BarChart data={data} role='img' aria-label='Bar chart of poll results'>
        <defs>
          {data.map(entry => entry.image && (
            <pattern key={entry.id} id={`bar-img-${entry.id}`} patternUnits='objectBoundingBox' width='100%' height='100%'>
              <image href={entry.image} width='100%' height='100%' preserveAspectRatio='xMidYMid slice' />
            </pattern>
          ))}
        </defs>
        <XAxis dataKey='name' tick={<CustomXAxisTick data={data} />} />
        <YAxis allowDecimals={false} />
        <Tooltip formatter={(value) => [`${value} votes`, '']} />
        <Bar dataKey='votes' animationDuration={500}>
          {data.map((entry, i) => <Cell key={i} fill={entry.image ? `url(#bar-img-${entry.id})` : entry.fill} stroke={entry.fill} strokeWidth={1} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
})

BarChartView.displayName = 'BarChartView'

BarChartView.propTypes = {
  options: PropTypes.array.isRequired,
  voteCounts: PropTypes.object.isRequired
}

export default BarChartView
