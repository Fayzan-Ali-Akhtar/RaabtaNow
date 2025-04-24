// src/App.tsx
import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [backendMsg, setBackendMsg] = useState<string>('Loading…')

  useEffect(() => {
    console.log('Fetching backend message...')
    console.log(`Backend URL: ${import.meta.env.VITE_BACKEND_URL}`)
    fetch(import.meta.env.VITE_BACKEND_URL)
      .then(res => res.text())
      .then(text => setBackendMsg(text))
      .catch(err => {
        console.error(err)
        setBackendMsg('❌ Failed to reach backend')
      })
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <h1 className="text-4xl font-bold text-white mb-4">
        🎉 RaabtaNow!
      </h1>
      <p className="text-xl text-white">
        {backendMsg}
      </p>
    </div>
  )
}

export default App
