import { useEffect, useState } from 'react'
import { Box, CircularProgress } from '@mui/material'
import { SimpleMarkdown } from '../utils/markdown.jsx'
import PageWrapper from '../components/PageWrapper'
import useTitle from '../hook/useTitle'
import { useTranslation } from 'react-i18next'

export default function Terms () {
  const { t, i18n } = useTranslation()
  useTitle({ title: t('terms.pageTitle') })
  const [content, setContent] = useState('')
  const lang = i18n.language?.startsWith('es') ? 'es' : 'en'

  useEffect(() => {
    fetch(lang === 'es' ? '/tos.es.md' : '/tos.md').then(r => r.text()).then(setContent)
  }, [lang])

  return (
    <PageWrapper maxWidth='md' sx={{ justifyContent: 'flex-start', py: 4 }}>
      {content
        ? <SimpleMarkdown content={content} />
        : <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>}
    </PageWrapper>
  )
}
