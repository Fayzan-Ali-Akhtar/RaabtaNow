// src/App.tsx
import { useState, useEffect } from 'react'
import {VITE_BACKEND_URL} from './constant'
import './App.css'

function App() {
  const [backendMsg, setBackendMsg] = useState<string>('Loading…')
  const [backendUrl, setBackendUrl] = useState<string>('Finding backend URL...')

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || VITE_BACKEND_URL
    setBackendUrl(backendUrl);
    console.log('Fetching backend message...')
    console.log(`Backend URL: ${backendUrl}`)
    fetch("/api/")
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
      <p className="text-lg text-white mt-4">
        Backend URL: {backendUrl}
      </p>
    </div>
  )
}

export default App
