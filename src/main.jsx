import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { getAnalytics } from 'firebase/analytics'
import { app } from './firebase/init'

const router = createBrowserRouter([
  {
    path: '/',
    element: <div>Hello World</div>
  }
])
if (!import.meta.env.VITE_ENV) getAnalytics(app)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
