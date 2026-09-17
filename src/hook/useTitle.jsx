import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

const BASE_URL = 'https://quickpoll.twozer00.dev'
const SUPPORTED_LANGS = ['en', 'es']

function setMeta (name, content) {
  const el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`)
  if (el) el.setAttribute('content', content)
}

function setHreflang (lang, href) {
  const id = `hreflang-${lang}`
  let el = document.getElementById(id)
  if (!el) {
    el = document.createElement('link')
    el.id = id
    el.rel = 'alternate'
    el.hreflang = lang
    document.head.appendChild(el)
  }
  el.href = href
}

export default function useTitle ({ title, description }) {
  const { lang } = useParams()
  const currentLang = SUPPORTED_LANGS.includes(lang) ? lang : 'en'

  useEffect(() => {
    const temp = title.split(' - ')[1] || title.split(' - ')[0]
    const fullTitle = `QuickPoll - ${temp}`
    document.title = fullTitle
    document.documentElement.lang = currentLang
    setMeta('og:title', fullTitle)
    setMeta('twitter:title', fullTitle)
    setMeta('og:url', window.location.href)
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', window.location.href)
    if (description) {
      setMeta('description', description)
      setMeta('og:description', description)
      setMeta('twitter:description', description)
    }
    // hreflang alternate links
    const pathWithoutLang = window.location.pathname.replace(/^\/[a-z]{2}(\/)/, '$1') || '/'
    SUPPORTED_LANGS.forEach(l => setHreflang(l, `${BASE_URL}/${l}${pathWithoutLang}`))
    setHreflang('x-default', `${BASE_URL}/en${pathWithoutLang}`)
  }, [title, description, currentLang])
}
