import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Navbar from './components/hrDashboard/hrNavbar'
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
