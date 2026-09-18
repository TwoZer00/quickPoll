import { memo, useEffect, useState } from 'react'
import { alpha, Box, FormControlLabel, Radio, Stack, Typography } from '@mui/material'
import { CheckCircle } from '@mui/icons-material'
import { PropTypes } from 'prop-types'
import { animated, useSpring } from '@react-spring/web'

const Option = memo(({ poll, option, showResult, voteCount, total, cardMode, selected, pctValue }) => {
  const optionColor = option.color || '#888888'
  const pct = total > 0 ? pctValue ?? Math.round((voteCount / total) * 100) : 0
  const percentage = total > 0 && showResult ? (voteCount / total) * 100 : 0
  const isSelected = selected === option.id
  const isVoted = option.voted
  const [justVoted, setJustVoted] = useState(false)

  useEffect(() => {
    if (isVoted) {
      setJustVoted(true)
      const t = setTimeout(() => setJustVoted(false), 600)
      return () => clearTimeout(t)
    }
  }, [isVoted])

  const bounceSpring = useSpring({
    scale: justVoted ? 1.06 : 1,
    config: { tension: 400, friction: 15 }
  })

  const widthSpring = useSpring({
    width: `${percentage}%`,
    from: { width: '0%' },
    config: { tension: 60, friction: 18 }
  })

  const countSpring = useSpring({
    number: showResult ? voteCount : 0,
    from: { number: 0 },
    config: { duration: 500 }
  })

  if (cardMode) {
    return (
      <animated.div style={{ scale: bounceSpring.scale, scrollSnapAlign: 'start' }}>
        <Box
          component='label'
          borderRadius={2}
          border={1}
          overflow='hidden'
          sx={{
            cursor: poll.closed ? 'default' : 'pointer',
            display: 'flex', flexDirection: 'row', alignItems: 'stretch',
            userSelect: 'none',
            minHeight: 72,
            transition: 'box-shadow .2s ease, transform .2s ease',
            borderColor: isVoted
              ? optionColor
              : isSelected
              ? alpha(optionColor, 0.6)
              : 'divider',
            bgcolor: isVoted ? alpha(optionColor, 0.06) : 'background.paper',
            boxShadow: isVoted
              ? `0 0 0 1px ${optionColor}, 0 2px 10px ${alpha(optionColor, 0.25)}`
              : isSelected
              ? `0 2px 10px ${alpha(optionColor, 0.15)}`
              : 'none',
            '&:hover': poll.closed ? {} : {
              transform: justVoted ? undefined : 'translateY(-1px)',
              boxShadow: `0 2px 12px ${alpha(optionColor, 0.2)}`,
              '& .card-img': { transform: 'scale(1.05)' }
            }
          }}
          role='option' aria-selected={!!option.voted}
          aria-label={`${option.title}${total > 0 && showResult ? `, ${voteCount} votes, ${pct}%` : ''}`}
        >
          <Radio value={option.id} disabled={poll.closed} sx={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }} />

          {/* thumbnail */}
          <Box sx={{ width: 80, flexShrink: 0, position: 'relative', overflow: 'hidden', borderRadius: '8px 0 0 8px', m: 0.75, borderRadius: 1.5 }}>
            {option.image
              ? <Box
                  className='card-img'
                  component='img'
                  src={option.image}
                  alt={option.title}
                  onError={(e) => { e.target.style.display = 'none' }}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .35s ease, filter .3s ease', filter: isVoted ? 'grayscale(0.5) brightness(0.75)' : 'none' }}
                />
              : <Box display='flex' alignItems='center' justifyContent='center' sx={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${alpha(optionColor, 0.35)} 0%, ${alpha(optionColor, 0.12)} 100%)` }}>
                  <Typography fontWeight={800} sx={{ color: optionColor, opacity: 0.7, fontSize: '1.75rem', lineHeight: 1, userSelect: 'none' }}>{option.title?.charAt(0).toUpperCase()}</Typography>
                </Box>
            }
            {isVoted && (
              <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(optionColor, 0.35) }}>
                <CheckCircle sx={{ fontSize: 28, color: '#fff', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))' }} />
              </Box>
            )}
          </Box>

          {/* content */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', px: 1.5, py: 1, gap: 0.5, minWidth: 0 }}>
            <Stack direction='row' alignItems='center' justifyContent='space-between' gap={1}>
              <Typography variant='body2' fontWeight={isVoted ? 700 : 500} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                {option.title}
              </Typography>
              {showResult && (
                <Typography variant='caption' fontWeight={700} sx={{ color: optionColor, flexShrink: 0 }}>
                  <animated.span>{countSpring.number.to(x => Math.round(x))}</animated.span>
                  {total > 0 && ` · ${pct}%`}
                </Typography>
              )}
            </Stack>
            {showResult && (
              <Box sx={{ height: 4, bgcolor: alpha(optionColor, 0.2), borderRadius: 2, overflow: 'hidden' }}>
                <animated.div style={{ height: '100%', borderRadius: 8, backgroundColor: optionColor, width: widthSpring.width }} />
              </Box>
            )}
          </Box>
        </Box>
      </animated.div>
    )
  }

  return (
    <Box
      position='relative' borderRadius={1.5} overflow='hidden'
      border={1}
      borderColor={isVoted ? optionColor : isSelected ? alpha(optionColor, 0.5) : 'divider'}
      sx={{
        scrollSnapAlign: 'start',
        transition: 'border-color .2s',
        bgcolor: isVoted ? alpha(optionColor, 0.06) : 'transparent'
      }}
      role='option' aria-selected={!!option.voted}
      aria-label={`${option.title}${total > 0 && showResult ? `, ${voteCount} votes, ${pct}%` : ''}`}
    >
      {/* progress bar */}
      {showResult && (
        <animated.div style={{
          position: 'absolute', left: 0, top: 0, height: '100%', zIndex: 0,
          width: widthSpring.width,
          backgroundColor: alpha(optionColor, isVoted ? 0.18 : 0.1),
          borderRadius: 'inherit'
        }} />
      )}

      <Stack direction='row' alignItems='center' zIndex={1} position='relative' px={1} height='3rem'>
        <FormControlLabel
          disabled={poll.closed}
          sx={{ flex: 1, m: 0 }}
          value={option.id}
          label={
            <Stack direction='row' alignItems='center' gap={0.5}>
              <Typography variant='body2' fontWeight={isVoted ? 600 : 400}>
                {option.title}
              </Typography>
              {isVoted && <CheckCircle sx={{ fontSize: 14, color: optionColor }} />}
            </Stack>
          }
          control={
            <Radio size='small' sx={{ color: optionColor, '&.Mui-checked': { color: optionColor } }} />
          }
        />
        {showResult && (
          <Typography variant='caption' fontWeight={isVoted ? 700 : 400} color='text.secondary' sx={{ flexShrink: 0, minWidth: 48, textAlign: 'right' }}>
            <animated.span>{countSpring.number.to(x => Math.round(x))}</animated.span>
            {total > 0 && ` · ${pct}%`}
          </Typography>
        )}
      </Stack>
    </Box>
  )
})

Option.displayName = 'Option'

Option.propTypes = {
  option: PropTypes.object.isRequired,
  poll: PropTypes.object.isRequired,
  showResult: PropTypes.bool.isRequired,
  voteCount: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  cardMode: PropTypes.bool,
  selected: PropTypes.string,
  pctValue: PropTypes.number
}

export default Option
