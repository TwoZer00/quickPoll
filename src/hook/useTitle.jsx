import { useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'

function setMeta (name, content) {
  const el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`)
  if (el) el.setAttribute('content', content)
}

export default function useTitle ({ title, description }) {
  const { setTitle } = useOutletContext()
  useEffect(() => {
    const temp = title.split(' - ')[1] || title.split(' - ')[0]
    const fullTitle = `QuickPoll - ${temp}`
    document.title = fullTitle
    setTitle(title)
    setMeta('og:title', fullTitle)
    setMeta('twitter:title', fullTitle)
    if (description) {
      setMeta('description', description)
      setMeta('og:description', description)
      setMeta('twitter:description', description)
    }
  }, [title, description])
}
