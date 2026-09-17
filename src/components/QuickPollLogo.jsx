import { Box, useTheme } from '@mui/material'
import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { useSpring, useSpringValue, animated } from '@react-spring/web'

export default function QuickPollLogo ({ size = 'md', loading = false, spinner = false }) {
  const theme = useTheme()
  const primary = theme.palette.primary.main
  const textColor = theme.palette.text.primary

  const fontSize = size === 'sm' ? 15 : size === 'lg' ? 40 : size === 'xl' ? 56 : size === 'xxl' ? 72 : 17
  const fontFamily = theme.typography.fontFamily
  const capH = fontSize * 0.72
  const barW = fontSize * 0.25
  const barGap = fontSize * 0.08
  const barRadius = size === 'sm' ? 0.5 : size === 'md' ? 1 : size === 'lg' ? 2 : 3
  const borderW = size === 'sm' ? 2 : size === 'md' ? 2.5 : 3
  const barsW = barW * 3 + barGap * 2
  const squareSize = Math.max(capH, barsW) * 1.6
  const padding = (squareSize - barsW) / 2

  const textMeasureRef = useRef(null)
  const [textPx, setTextPx] = useState(0)

  useLayoutEffect(() => {
    const measure = () => {
      if (textMeasureRef.current) setTextPx(textMeasureRef.current.getBoundingClientRect().width)
    }
    measure()
    document.fonts.ready.then(measure)
  }, [fontSize, fontFamily])

  const totalW = textPx + fontSize * 0.08 + barsW
  const barsInitialLeft = textPx + fontSize * 0.08
  const barsCenterLeft = (totalW - barsW) / 2

  const [phase, setPhase] = useState('full')

  const bar1H = useSpringValue(capH, { config: { tension: 140, friction: 18 } })
  const bar2H = useSpringValue(capH * 0.65, { config: { tension: 140, friction: 18 } })
  const bar3H = useSpringValue(0, { config: { tension: 140, friction: 18 } })
  const bar3Opacity = useSpringValue(0, { config: { tension: 120, friction: 20 } })

  useEffect(() => {
    if (!loading && !spinner) {
      bar3Opacity.start(0)
      bar3H.start(0)
      const t = setTimeout(() => {
        setPhase('full')
        bar1H.set(capH)
        bar2H.set(capH * 0.65)
      }, 400)
      return () => clearTimeout(t)
    }
    if (spinner) {
      setPhase('loading')
      return
    }
    setPhase('loading')
    const t1 = setTimeout(() => setPhase('loader'), 1500)
    const t2 = setTimeout(() => {
      setPhase('hiding')
      sessionStorage.setItem('app_loaded', '1')
    }, 2100)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [loading, spinner])

  useEffect(() => {
    if (phase !== 'loading' && phase !== 'loader' && phase !== 'hiding') return
    let cancelled = false
    const minH = capH * 0.15
    async function loop () {
      while (!cancelled) {
        await Promise.all([bar1H.start(minH), new Promise(r => setTimeout(r, 250)).then(() => !cancelled && bar2H.start(minH))])
        if (cancelled) break
        await Promise.all([bar1H.start(capH), new Promise(r => setTimeout(r, 250)).then(() => !cancelled && bar2H.start(capH * 0.65))])
      }
    }
    loop()
    if (phase === 'hiding') {
      bar3Opacity.start(1)
      bar3H.start(capH * 0.85)
    }
    return () => { cancelled = true }
  }, [phase, capH])

  const isLoader = phase === 'loader' && textPx > 0
  const isHiding = phase === 'hiding' && textPx > 0

  const { barsLeft, borderOpacity } = useSpring({
    barsLeft: isLoader || isHiding ? barsCenterLeft : barsInitialLeft,
    borderOpacity: isHiding ? 1 : 0,
    config: { tension: 120, friction: 20 },
    immediate: (key) => key === 'barsLeft' ? (!isLoader && !isHiding) : (!isLoader && !isHiding && phase === 'full')
  })

  const { clipW } = useSpring({
    clipW: isHiding ? 0 : isLoader ? barsCenterLeft - fontSize * 0.5 : textPx,
    config: { tension: 100, friction: 22 },
    immediate: !isLoader && !isHiding
  })

  const textStyle = { fontFamily, fontSize, fontWeight: 700, lineHeight: 1, letterSpacing: -0.3, whiteSpace: 'nowrap', color: textColor }
  const barsBottom = fontSize * 0.15
  const frameBottom = barsBottom + capH / 2 - squareSize / 2

  if (spinner) {
    return <BarsSpinner size={size} />
  }

  return (
    <Box sx={{ display: 'inline-flex', userSelect: 'none', position: 'relative', height: fontSize, alignItems: 'flex-end' }}>
      <span ref={textMeasureRef} style={{ ...textStyle, position: 'absolute', visibility: 'hidden', pointerEvents: 'none' }}>QuickPo</span>

      {textPx > 0 && (
        <Box sx={{ position: 'relative', width: totalW, height: fontSize }}>
          <animated.div style={{ overflow: 'hidden', width: clipW, position: 'absolute', left: 0, bottom: 0 }}>
            <animated.span style={{ ...textStyle, display: 'block', transform: clipW.to(w => `translateX(${textPx - w}px)`) }}>QuickPo</animated.span>
          </animated.div>

          {/* marco cuadrado */}
          <animated.div style={{
            position: 'absolute',
            bottom: frameBottom,
            left: barsLeft.to(l => l - padding),
            width: squareSize,
            height: squareSize,
            borderRadius: barRadius * 6,
            opacity: borderOpacity,
            background: `${primary}25`,
            boxSizing: 'border-box',
            pointerEvents: 'none'
          }} />

          {/* barras */}
          <animated.div style={{
            position: 'absolute',
            bottom: barsBottom,
            left: barsLeft,
            display: 'flex',
            alignItems: 'flex-end',
            gap: barGap
          }}>
            <animated.div style={{ width: barW, borderRadius: barRadius, background: primary, height: bar1H }} />
            <animated.div style={{ width: barW, borderRadius: barRadius, background: primary, height: bar2H }} />
            <animated.div style={{ width: barW, borderRadius: barRadius, background: primary, height: bar3H, opacity: bar3Opacity }} />
          </animated.div>
        </Box>
      )}
    </Box>
  )
}

function BarsSpinner ({ size }) {
  const theme = useTheme()
  const primary = theme.palette.primary.main

  const fontSize = size === 'sm' ? 15 : size === 'lg' ? 40 : size === 'xl' ? 56 : size === 'xxl' ? 72 : 17
  const capH = fontSize * 0.72
  const barW = fontSize * 0.25
  const barGap = fontSize * 0.08
  const barRadius = size === 'sm' ? 0.5 : size === 'md' ? 1 : size === 'lg' ? 2 : 3
  const barsW = barW * 3 + barGap * 2
  const squareSize = Math.max(capH, barsW) * 1.6
  const padding = (squareSize - barsW) / 2

  const bar1H = useSpringValue(capH, { config: { tension: 140, friction: 18 } })
  const bar2H = useSpringValue(capH * 0.65, { config: { tension: 140, friction: 18 } })
  const bar3H = useSpringValue(capH * 0.85, { config: { tension: 140, friction: 18 } })

  useEffect(() => {
    let cancelled = false
    const minH = capH * 0.15
    async function loop () {
      while (!cancelled) {
        await Promise.all([bar1H.start(minH), new Promise(r => setTimeout(r, 250)).then(() => !cancelled && bar2H.start(minH))])
        if (cancelled) break
        await Promise.all([bar1H.start(capH), new Promise(r => setTimeout(r, 250)).then(() => !cancelled && bar2H.start(capH * 0.65))])
        if (cancelled) break
        await bar3H.start(minH)
        if (cancelled) break
        await bar3H.start(capH * 0.85)
      }
    }
    loop()
    return () => { cancelled = true }
  }, [capH])

  const barsBottom = fontSize * 0.15
  const frameBottom = barsBottom + capH / 2 - squareSize / 2

  return (
    <Box sx={{ position: 'relative', width: squareSize, height: squareSize, display: 'inline-flex' }}>
      <Box sx={{
        position: 'absolute', inset: 0,
        borderRadius: barRadius * 6,
        background: `${primary}25`
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: barsBottom - frameBottom,
        left: padding,
        display: 'flex',
        alignItems: 'flex-end',
        gap: `${barGap}px`
      }}>
        <animated.div style={{ width: barW, borderRadius: barRadius, background: primary, height: bar1H }} />
        <animated.div style={{ width: barW, borderRadius: barRadius, background: primary, height: bar2H }} />
        <animated.div style={{ width: barW, borderRadius: barRadius, background: primary, height: bar3H }} />
      </Box>
    </Box>
  )
}
