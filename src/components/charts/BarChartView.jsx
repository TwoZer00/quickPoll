import { memo, useMemo } from 'react'
import { BarChart, Bar, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { PropTypes } from 'prop-types'
import { generateColorBySeed } from '../../utils/color'

const BarChartView = memo(({ options, voteCounts }) => {
  const data = useMemo(() => options
    .map(opt => ({ name: opt.title, votes: voteCounts[opt.id] || 0, fill: generateColorBySeed(opt.id) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(voteCounts)]
  )

  return (
    <ResponsiveContainer width='100%' height={250}>
      <BarChart data={data} role='img' aria-label='Bar chart of poll results'>
        <XAxis dataKey='name' />
        <YAxis allowDecimals={false} />
        <Tooltip formatter={(value) => [`${value} votes`, '']} />
        <Bar dataKey='votes' animationDuration={500}>
          {data.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
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
