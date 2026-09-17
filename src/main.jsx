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
import { Box } from '@mui/material'
import i18n from './i18n/index.js'
import { track } from './utils/analytics'
import QuickPollLogo from './components/QuickPollLogo'

const SUPPORTED_LANGS = ['en', 'es']

function detectLang () {
  const saved = localStorage.getItem('i18nextLng')
  if (saved && SUPPORTED_LANGS.includes(saved)) return saved
  const browser = navigator.language?.slice(0, 2)
  return SUPPORTED_LANGS.includes(browser) ? browser : 'en'
}

function PollLoader () {
  return (
    <Box sx={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <QuickPollLogo size='lg' loading />
    </Box>
  )
}

function PollWrapper () {
  const { id } = useParams()
  return <Poll key={id} />
}

const pollLoader = async ({ params }) => {
  try {
    const [pollData, optionsData] = await Promise.all([getPoll(params.id), getOptions(params.id)])
    const poll = { ...pollData, options: optionsData }
    poll.closed = isPollClosed(poll.createdAt.seconds * 1000)
    return poll
  } catch (error) {
    throw error instanceof CError ? error : CError.fromCode(17, error.message)
  }
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
        hydrateFallbackElement: <PollLoader />,
        loader: pollLoader
      }
    ]
  },
  {
    path: '/:lang',
    element: <InitAuth />,
    loader: ({ params }) => {
      if (SUPPORTED_LANGS.includes(params.lang)) i18n.changeLanguage(params.lang)
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
        hydrateFallbackElement: <PollLoader />,
        shouldRevalidate: ({ currentParams, nextParams }) => currentParams.id !== nextParams.id,
        loader: pollLoader
      }
    ],
    errorElement: <Error />
  }
])
router.subscribe(({ location }) => track({ url: location.pathname + location.search }))

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </React.StrictMode>
)
