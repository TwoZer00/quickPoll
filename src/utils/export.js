export function exportCSV (title, options, voteCounts) {
  const total = Object.values(voteCounts).reduce((a, b) => a + b, 0)
  const rows = [
    ['Option', 'Votes', 'Percentage'],
    ...options.map(o => {
      const count = voteCounts[o.id] || 0
      const pct = total > 0 ? Math.round((count / total) * 100) : 0
      return [o.title, count, `${pct}%`]
    }),
    ['Total', total, '100%']
  ]
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${title.replace(/[^a-z0-9]/gi, '_')}_results.csv`
  a.click()
  URL.revokeObjectURL(url)
}
