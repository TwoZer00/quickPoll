import { memo, useRef } from 'react'
import { alpha, Box, FormControlLabel, Radio, Stack, Typography } from '@mui/material'
import { PropTypes } from 'prop-types'
import { animated, useSpring } from '@react-spring/web'
import { generateColorBySeed } from '../../utils/color'

const Option = memo(({ poll, option, showResult, voteCount, total }) => {
  const optionColor = useRef(generateColorBySeed(option.id))
  const percentage = total > 0 && showResult ? (voteCount / total) * 100 : 0
  const sprig = useSpring(
    { number: voteCount, from: { number: 0 }, config: { duration: 500 } }
  )

  return (
    <Box position='relative' display='flex' gap={1} alignItems='center' borderRadius='5rem' overflow='hidden' height='3rem' role='option' aria-selected={!!option.voted} aria-label={`${option.title}${total > 0 && showResult ? `, ${voteCount} votes, ${Math.round((voteCount / total) * 100)}%` : ''}`}>
      <Stack direction='row' flex={1} zIndex={1} px={1}>
        <FormControlLabel
          disabled={poll.closed}
          sx={{ flex: 1 }} value={option.id} label={`${option.title} `}
          control={
            <Radio
              sx={{
                color: `${optionColor.current}`,
                '&.Mui-checked': {
                  color: `${optionColor.current}`
                }
              }}
            />
          }
        />
        <Typography variant='caption' sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }} fontSize={14}>
          {(showResult) && <animated.p>{sprig.number.to(x => x.toFixed(0))}</animated.p>}
          {(showResult && voteCount > 0) && (<><animated.p style={{ fontStyle: 'inherit' }}>{sprig.number.to(x => Math.round((x.toFixed(0) / total) * 100))}</animated.p>%</>)}
        </Typography>
      </Stack>
      <Box height='100%' position='absolute' flex={1} left={0} top={0} zIndex={0} borderRadius='5rem' width={`${percentage}%`} overflow='hidden' sx={{ transition: 'width .75s' }}>
        <Box height='100%' bgcolor={alpha(optionColor.current, 0.2)} />
      </Box>
    </Box>
  )
})

Option.displayName = 'Option'

Option.propTypes = {
  option: PropTypes.object.isRequired,
  poll: PropTypes.object.isRequired,
  showResult: PropTypes.bool.isRequired,
  voteCount: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired
}

export default Option
