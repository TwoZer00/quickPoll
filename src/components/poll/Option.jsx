import { memo, useRef } from 'react'
import { alpha, Box, CardMedia, FormControlLabel, Radio, Stack, Typography } from '@mui/material'
import { CheckCircle, Image as ImageIcon } from '@mui/icons-material'
import { PropTypes } from 'prop-types'
import { animated, useSpring } from '@react-spring/web'
import { generateColorBySeed } from '../../utils/color'

const Option = memo(({ poll, option, showResult, voteCount, total, cardMode, selected }) => {
  const optionColor = useRef(generateColorBySeed(option.id))
  const pct = total > 0 ? Math.round((voteCount / total) * 100) : 0
  const percentage = total > 0 && showResult ? (voteCount / total) * 100 : 0
  const isSelected = selected === option.id
  const isVoted = option.voted

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
      <Box
        component='label'
        position='relative' overflow='hidden' borderRadius={3}
        border={1}
        borderColor={isSelected ? optionColor.current : 'divider'}
        sx={{
          cursor: poll.closed ? 'default' : 'pointer',
          transition: 'all .2s ease',
          display: 'flex', flexDirection: 'column',
          bgcolor: isSelected ? alpha(optionColor.current, 0.06) : 'background.paper',
          outline: isSelected ? `2px solid ${optionColor.current}` : 'none',
          outlineOffset: -1,
          userSelect: 'none',
          aspectRatio: { xs: '3/2', sm: '4/3' },
          boxShadow: isSelected ? `0 2px 8px ${alpha(optionColor.current, 0.25)}` : '0 1px 3px rgba(0,0,0,0.08)',
          '&:hover': poll.closed ? {} : { borderColor: optionColor.current, boxShadow: `0 3px 12px ${alpha(optionColor.current, 0.18)}`, transform: 'translateY(-1px)' }
        }}
        role='option' aria-selected={!!option.voted}
        aria-label={`${option.title}${total > 0 && showResult ? `, ${voteCount} votes, ${pct}%` : ''}`}
      >
        <Radio value={option.id} disabled={poll.closed} sx={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }} />
        {option.image
          ? <CardMedia component='img' image={option.image} alt={option.title} onError={(e) => { e.target.style.display = 'none' }} sx={{ flex: 1, objectFit: 'cover', pointerEvents: 'none', minHeight: 0 }} />
          : <Box display='flex' alignItems='center' justifyContent='center' flex={1} bgcolor='action.hover' sx={{ pointerEvents: 'none', minHeight: 0 }}><ImageIcon sx={{ fontSize: 40, color: 'text.disabled' }} /></Box>
        }
        <Box position='relative' overflow='hidden' mt='auto'>
          <Stack direction='row' alignItems='center' justifyContent='space-between' zIndex={1} position='relative' px={1.5} py={1.2}>
            <Typography variant='body2' fontWeight={isSelected ? 600 : 400} sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{option.title}</Typography>
            {showResult && (
              <Typography variant='caption' fontWeight={500} color='text.secondary' sx={{ display: 'flex', gap: 0.3, alignItems: 'center', flexShrink: 0, ml: 1 }}>
                <animated.span>{countSpring.number.to(x => Math.round(x))}</animated.span>
                {voteCount > 0 && <span>·</span>}
                {voteCount > 0 && <><span>{pct}</span>%</>}
              </Typography>
            )}
          </Stack>
          <animated.div style={{ height: '100%', position: 'absolute', left: 0, top: 0, zIndex: 0, width: widthSpring.width, backgroundColor: alpha(optionColor.current, 0.18) }} />
        </Box>
      </Box>
    )
  }

  return (
    <Box
      position='relative' borderRadius={1.5} overflow='hidden'
      border={1}
      borderColor={isVoted ? optionColor.current : isSelected ? alpha(optionColor.current, 0.5) : 'divider'}
      sx={{
        transition: 'border-color .2s',
        bgcolor: isVoted ? alpha(optionColor.current, 0.06) : 'transparent'
      }}
      role='option' aria-selected={!!option.voted}
      aria-label={`${option.title}${total > 0 && showResult ? `, ${voteCount} votes, ${pct}%` : ''}`}
    >
      {/* progress bar */}
      {showResult && (
        <animated.div style={{
          position: 'absolute', left: 0, top: 0, height: '100%', zIndex: 0,
          width: widthSpring.width,
          backgroundColor: alpha(optionColor.current, isVoted ? 0.18 : 0.1),
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
              {isVoted && <CheckCircle sx={{ fontSize: 14, color: optionColor.current }} />}
            </Stack>
          }
          control={
            <Radio size='small' sx={{ color: optionColor.current, '&.Mui-checked': { color: optionColor.current } }} />
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
  selected: PropTypes.string
}

export default Option
