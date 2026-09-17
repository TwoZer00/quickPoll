import { memo, useEffect, useState } from 'react'
import { alpha, Box, FormControlLabel, Radio, Stack, Typography } from '@mui/material'
import { CheckCircle } from '@mui/icons-material'
import { PropTypes } from 'prop-types'
import { animated, useSpring } from '@react-spring/web'

const Option = memo(({ poll, option, showResult, voteCount, total, cardMode, compact, selected }) => {
  const optionColor = option.color || '#888888'
  const pct = total > 0 ? Math.round((voteCount / total) * 100) : 0
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
      <animated.div style={{ scale: bounceSpring.scale, display: 'flex', flexDirection: 'column', containerType: 'inline-size' }}>
        <Box
          component='label'
          position='relative' overflow='hidden' borderRadius={3}
          border={1}
          borderColor='transparent'
          sx={{
            cursor: poll.closed ? 'default' : 'pointer',
            transition: 'box-shadow .2s ease, transform .2s ease',
            display: 'flex', flexDirection: 'column',
            userSelect: 'none',
            aspectRatio: { xs: '1/1', sm: '4/3' },
            boxShadow: isVoted
              ? `0 0 0 4px ${optionColor}, 0 2px 12px ${alpha(optionColor, 0.4)}`
              : isSelected
              ? `0 0 0 2px ${alpha(optionColor, 0.7)}, 0 4px 16px ${alpha(optionColor, 0.2)}`
              : '0 1px 3px rgba(0,0,0,0.08)',
            '&:hover': poll.closed ? {} : {
              boxShadow: `0 0 0 2px ${alpha(optionColor, 0.5)}, 0 4px 16px ${alpha(optionColor, 0.2)}`,
              transform: justVoted ? undefined : 'translateY(-2px)',
              '& .card-img': { transform: 'scale(1.07)' }
            }
          }}
          role='option' aria-selected={!!option.voted}
          aria-label={`${option.title}${total > 0 && showResult ? `, ${voteCount} votes, ${pct}%` : ''}`}
        >
          <Radio value={option.id} disabled={poll.closed} sx={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }} />

          {/* image or placeholder */}
          {option.image
            ? <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                <Box
                  className='card-img'
                  component='img'
                  src={option.image}
                  alt={option.title}
                  onError={(e) => { e.target.style.display = 'none' }}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .35s ease, filter .3s ease', pointerEvents: 'none', filter: isVoted ? 'grayscale(0.7) brightness(0.6)' : 'none' }}
                />
              </Box>
            : <Box display='flex' alignItems='center' justifyContent='center' sx={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${alpha(optionColor, 0.25)} 0%, ${alpha(optionColor, 0.08)} 100%)`, pointerEvents: 'none', filter: isVoted ? 'grayscale(0.7) brightness(0.6)' : 'none' }}>
                <Typography variant='h4' fontWeight={700} sx={{ color: optionColor, opacity: 0.5, userSelect: 'none' }}>{option.title?.charAt(0).toUpperCase()}</Typography>
              </Box>
          }

          {/* selected overlay — borde inset + tint de color */}
          {isSelected && !isVoted && (
            <Box sx={{ position: 'absolute', inset: 0, bgcolor: alpha(optionColor, 0.2), boxShadow: `inset 0 0 0 3px ${optionColor}`, pointerEvents: 'none', zIndex: 1 }} />
          )}
          {/* voted: solo el checkmark, el grayscale+brightness en la imagen hace el trabajo */}

          {/* voted checkmark badge */}
          {isVoted && (
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: optionColor, borderRadius: '50%', width: '18%', height: 0, paddingBottom: '18%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.4)', zIndex: 2 }}>
              <CheckCircle sx={{ fontSize: '60%', color: '#fff', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
            </Box>
          )}

          {/* footer */}
          <Box position='absolute' bottom={0} left={0} right={0} zIndex={2} sx={{ background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0) 100%)', pt: '25%' }}>
            {showResult && (
              <Box sx={{ height: '1.5%', bgcolor: alpha(optionColor, 0.35), mx: '4%', mb: '2%', borderRadius: 2, overflow: 'hidden' }}>
                <animated.div style={{ height: '100%', borderRadius: 8, backgroundColor: optionColor, width: widthSpring.width }} />
              </Box>
            )}
            {compact
              ? (
                <Stack direction='row' alignItems='center' justifyContent='center' pb='4%'>
                  {showResult && (
                    <Typography variant='caption' fontWeight={700} sx={{ color: optionColor, textShadow: '0 1px 3px rgba(0,0,0,0.5)', filter: 'brightness(1.4)', fontSize: 'clamp(9px, 2cqw, 12px)' }}>
                      <animated.span>{countSpring.number.to(x => Math.round(x))}</animated.span>
                      {total > 0 && ` · ${pct}%`}
                    </Typography>
                  )}
                </Stack>
              )
              : (
                <Stack direction='row' alignItems='flex-end' justifyContent='space-between' px='4%' pb='4%' pt={0}>
                  <Typography variant='body2' fontWeight={isVoted ? 700 : 600} sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.6)', letterSpacing: 0.1, fontSize: 'clamp(10px, 2.5cqw, 14px)' }}>
                    {option.title}
                  </Typography>
                  {showResult && (
                    <Typography variant='caption' fontWeight={700} sx={{ color: optionColor, flexShrink: 0, ml: 1, textShadow: '0 1px 3px rgba(0,0,0,0.5)', filter: 'brightness(1.4)', fontSize: 'clamp(9px, 2cqw, 12px)' }}>
                      <animated.span>{countSpring.number.to(x => Math.round(x))}</animated.span>
                      {total > 0 && ` · ${pct}%`}
                    </Typography>
                  )}
                </Stack>
              )
            }
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
  compact: PropTypes.bool,
  selected: PropTypes.string
}

export default Option
