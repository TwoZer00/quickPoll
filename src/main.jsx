import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
const Home = React.lazy(() => import('./pages/Home'))
const CreatePoll = React.lazy(() => import('./pages/CreatePoll'))
const Poll = React.lazy(() => import('./pages/Poll'))
import InitAuth from './pages/InitAuth'
import { getOptions, getPoll } from './supabase/utils'
import Error from './pages/Error'
import ErrorBoundary from './components/ErrorBoundary'
import { useParams } from 'react-router-dom'
import { isPollClosed } from './utils/utils'
import CError from './error/Error'

function PollWrapper () {
  const { id } = useParams()
  return <Poll key={id} />
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <InitAuth />,
    loader: () => null,
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
        element: <PollWrapper />,
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
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
    </ErrorBoundary>
  </React.StrictMode>
)
