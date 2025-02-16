import { useState } from 'react'
import './index.css'
import Register from './pages/registration/Registration'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Register/>
    </>
  )
}

export default App
