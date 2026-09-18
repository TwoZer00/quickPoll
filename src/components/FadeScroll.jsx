import { useRef, useState, useCallback } from 'react'
import { Box, useTheme } from '@mui/material'
import { PropTypes } from 'prop-types'

export default function FadeScroll ({ children, sx, snap = false, ...props }) {
  const theme = useTheme()
  const fadeColor = theme.palette.background.paper
  const scrollRef = useRef(null)
  const [fadeTop, setFadeTop] = useState(false)
  const [fadeBottom, setFadeBottom] = useState(false)

  const update = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setFadeTop(el.scrollTop > 8)
    setFadeBottom(el.scrollTop + el.clientHeight < el.scrollHeight - 8)
  }, [])

  const refCallback = useCallback((el) => {
    scrollRef.current = el
    if (!el) return
    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
  }, [update])

  return (
    <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 40, zIndex: 2, pointerEvents: 'none', background: `linear-gradient(to bottom, ${fadeColor}, transparent)`, opacity: fadeTop ? 1 : 0, transition: 'opacity .25s ease' }} />
      <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, zIndex: 2, pointerEvents: 'none', background: `linear-gradient(to top, ${fadeColor}, transparent)`, opacity: fadeBottom ? 1 : 0, transition: 'opacity .25s ease' }} />
      <Box
        ref={refCallback}
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          scrollSnapType: snap ? 'y mandatory' : 'none',
          scrollPaddingTop: '12px',
          scrollPaddingBottom: '12px',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(128,128,128,0.25) transparent',
          '&::-webkit-scrollbar': { width: 3 },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            borderRadius: 4,
            background: 'rgba(128,128,128,0.25)',
            '&:hover': { background: 'rgba(128,128,128,0.45)' },
          },
          ...sx,
        }}
        {...props}
      >
        {children}
      </Box>
    </Box>
  )
}

FadeScroll.propTypes = {
  children: PropTypes.node.isRequired,
  sx: PropTypes.object,
  snap: PropTypes.bool,
}
