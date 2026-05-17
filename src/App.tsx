// App.tsx
import React, { useEffect, useState } from 'react'
import Chat from './components/Chat'

export default function App() {
  const [clientId, setClientId] = useState<string | null>(null)

  useEffect(() => {
    let id = localStorage.getItem('genai_client_id')

    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem('genai_client_id', id)
    }

    

    setClientId(id)
  }, [])

  if (!clientId) return null

  return (
    <div className="h-screen bg-[#0B0F19] text-white overflow-hidden">
      <Chat clientId={clientId} />
    </div>
  )
}