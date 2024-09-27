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
import { getOptions } from './firebase/utils'
import Error from './pages/Error'

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
        path: '/create',
        element: <CreatePoll />
      },
      {
        path: '/:id',
        element: <Poll />,
        loader: ({ params }) => {
          return getOptions(params.id)
        }
      }
    ],
    errorElement: <Error />
  }
])
if (!import.meta.env.VITE_ENV) getAnalytics(app)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
