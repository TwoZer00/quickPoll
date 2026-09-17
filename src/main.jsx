import './i18n/index.js'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom'
const Home = React.lazy(() => import('./pages/Home'))
const CreatePoll = React.lazy(() => import('./pages/CreatePoll'))
const Poll = React.lazy(() => import('./pages/Poll'))
const Terms = React.lazy(() => import('./pages/Terms'))
const Privacy = React.lazy(() => import('./pages/Privacy'))
const EmbedPoll = React.lazy(() => import('./pages/EmbedPoll'))
import InitAuth from './pages/InitAuth'
import EmbedLayout from './pages/EmbedLayout'
import { getOptions, getPoll } from './supabase/utils'
import Error from './pages/Error'
import ErrorBoundary from './components/ErrorBoundary'
import { useParams } from 'react-router-dom'
import { isPollClosed } from './utils/utils'
import CError from './error/Error'
import { Box, Paper, Skeleton, Stack } from '@mui/material'
import i18n from './i18n/index.js'

const SUPPORTED_LANGS = ['en', 'es']

function detectLang () {
  const saved = localStorage.getItem('i18nextLng')
  if (saved && SUPPORTED_LANGS.includes(saved)) return saved
  const browser = navigator.language?.slice(0, 2)
  return SUPPORTED_LANGS.includes(browser) ? browser : 'en'
}

function LangRedirect () {
  const { lang } = useParams()
  if (SUPPORTED_LANGS.includes(lang)) return null
  return <Navigate to={`/${detectLang()}`} replace />
}

function PollSkeleton () {
  return (
    <Box sx={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center', p: 2 }}>
      <Box sx={{ width: '100%', maxWidth: 672 }}>
        <Paper elevation={0} sx={{ overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
          <Box p={2.5}>
            <Stack gap={1.5}>
              <Skeleton variant='text' height={40} width='60%' />
              <Skeleton variant='text' height={20} width='30%' />
              {[1, 2, 3].map(i => <Skeleton key={i} variant='rounded' height={48} />)}
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Box>
  )
}

function PollWrapper () {
  const { id } = useParams()
  return <Poll key={id} />
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to={`/${detectLang()}`} replace />,
    errorElement: <Error />
  },
  {
    path: '/embed/:id',
    element: <EmbedLayout />,
    errorElement: <Error />,
    children: [
      {
        path: '',
        element: <EmbedPoll />,
        hydrateFallbackElement: <PollSkeleton />,
        loader: async ({ params }) => {
          try {
            const [pollData, optionsData] = await Promise.all([getPoll(params.id), getOptions(params.id)])
            const poll = { ...pollData, options: optionsData }
            poll.closed = isPollClosed(poll.createdAt.seconds * 1000)
            return poll
          } catch (error) {
            throw error instanceof CError ? error : CError.fromCode(17, error.message)
          }
        }
      }
    ]
  },
  {
    path: '/:lang',
    element: <InitAuth />,
    loader: ({ params }) => {
      if (SUPPORTED_LANGS.includes(params.lang)) {
        i18n.changeLanguage(params.lang)
      }
      return null
    },
    children: [
      { path: '', element: <Home /> },
      { path: 'create', element: <CreatePoll /> },
      { path: 'terms', element: <Terms /> },
      { path: 'privacy', element: <Privacy /> },
      {
        path: 'poll/:id',
        element: <PollWrapper />,
        hydrateFallbackElement: <PollSkeleton />,
        shouldRevalidate: ({ currentParams, nextParams }) => currentParams.id !== nextParams.id,
        loader: async ({ params }) => {
          try {
            const [pollData, optionsData] = await Promise.all([getPoll(params.id), getOptions(params.id)])
            const poll = { ...pollData, options: optionsData }
            poll.closed = isPollClosed(poll.createdAt.seconds * 1000)
            return poll
          } catch (error) {
            throw error instanceof CError ? error : CError.fromCode(17, error.message)
          }
        }
      }
    ],
    errorElement: <Error />
  }
])
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </React.StrictMode>
)
