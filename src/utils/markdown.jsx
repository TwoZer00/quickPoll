import { Divider, Link, Typography } from '@mui/material'

function parseInline (text, keyPrefix = '') {
  const parts = []
  const re = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g
  let last = 0
  let match
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index))
    if (match[1] !== undefined) {
      parts.push(<strong key={keyPrefix + match.index} style={{ fontWeight: 600, color: 'inherit' }}>{match[1]}</strong>)
    } else {
      parts.push(<Link key={keyPrefix + match.index} href={match[3]} target='_blank' rel='noreferrer'>{match[2]}</Link>)
    }
    last = re.lastIndex
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : parts
}

function parseLine (line, i) {
  if (line.startsWith('# ')) return <Typography key={i} variant='h4' fontWeight={700} gutterBottom>{parseInline(line.slice(2), i)}</Typography>
  if (line.startsWith('## ')) return <Typography key={i} variant='subtitle1' fontWeight={600} mt={3} gutterBottom>{parseInline(line.slice(3), i)}</Typography>
  if (line === '---') return <Divider key={i} sx={{ my: 2 }} />
  if (line.startsWith('- ')) return <Typography key={i} component='li' variant='body2' color='text.secondary' sx={{ ml: 2 }}>{parseInline(line.slice(2), i)}</Typography>
  if (line === '') return null
  return <Typography key={i} variant='body2' color='text.secondary' paragraph>{parseInline(line, i)}</Typography>
}

export function SimpleMarkdown ({ content }) {
  return <>{content.split('\n').map((line, i) => parseLine(line.trim(), i))}</>
}
