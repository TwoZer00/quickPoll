import { Divider, Link, Typography } from '@mui/material'

function parseInline (text) {
  const parts = text.split(/\*\*(.+?)\*\*/g)
  return parts.map((p, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ fontWeight: 600, color: 'inherit' }}>{p}</strong>
      : p.replace(/\\n/g, '\n')
  )
}

function parseLine (line, i) {
  if (line.startsWith('# ')) return <Typography key={i} variant='h4' fontWeight={700} gutterBottom>{parseInline(line.slice(2))}</Typography>
  if (line.startsWith('## ')) return <Typography key={i} variant='subtitle1' fontWeight={600} mt={3} gutterBottom>{parseInline(line.slice(3))}</Typography>
  if (line === '---') return <Divider key={i} sx={{ my: 2 }} />
  if (line.startsWith('- ')) return <Typography key={i} component='li' variant='body2' color='text.secondary' sx={{ ml: 2 }}>{parseInline(line.slice(2))}</Typography>
  if (line === '') return null
  const linkified = line.split(/\[(.+?)\]\((.+?)\)/g)
  const content = linkified.length > 1
    ? linkified.map((p, j) => j % 3 === 1 ? null : j % 3 === 2 ? <Link key={j} href={p} target='_blank' rel='noreferrer'>{linkified[j - 1]}</Link> : parseInline(p))
    : parseInline(line)
  return <Typography key={i} variant='body2' color='text.secondary' paragraph>{content}</Typography>
}

export function SimpleMarkdown ({ content }) {
  return <>{content.split('\n').map((line, i) => parseLine(line.trim(), i))}</>
}
