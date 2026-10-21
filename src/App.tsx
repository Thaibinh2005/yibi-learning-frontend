import React from 'react'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import { store } from '@/app/store'
import { router } from '@/router'

export const App: React.FC = () => {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  )
}

export default App
