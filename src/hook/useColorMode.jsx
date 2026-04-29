import { createContext, useContext, useMemo, useState } from 'react'

const ColorModeContext = createContext()

export function ColorModeProvider ({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem('colorMode') || 'light')

  const toggle = () => setMode(prev => {
    const next = prev === 'light' ? 'dark' : 'light'
    localStorage.setItem('colorMode', next)
    return next
  })

  const value = useMemo(() => ({ mode, toggle }), [mode])
  return <ColorModeContext.Provider value={value}>{children}</ColorModeContext.Provider>
}

export default function useColorMode () {
  return useContext(ColorModeContext)
}
