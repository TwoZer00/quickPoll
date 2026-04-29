import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { getAnalytics } from 'firebase/analytics'
import { app } from './firebase/init'
import Home from './pages/Home'
import CreatePoll from './pages/CreatePoll'
import Poll from './pages/Poll'
import { getAuth } from 'firebase/auth'
import InitAuth from './pages/InitAuth'
import { getOptions, getPoll } from './firebase/utils'
import Error from './pages/Error'
import ErrorBoundary from './components/ErrorBoundary'
import { isPollClosed } from './utils/utils'
import CError from './error/Error'

const router = createBrowserRouter([
  {
    path: '/',
    element: <InitAuth />,
    loader: () => {
      const auth = getAuth()
      return auth
    },
    children: [
      {
        path: '',
        element: <Home />
      },
      {
        path: 'create',
        element: <CreatePoll />
      },
      {
        path: 'poll/:id',
        element: <Poll />,
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
try { if (!import.meta.env.VITE_ENV) getAnalytics(app) } catch (_) {}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </React.StrictMode>
)
