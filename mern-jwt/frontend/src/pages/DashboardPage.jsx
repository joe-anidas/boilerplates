import { useEffect, useState } from 'react'
import { API_BASE } from '../lib/api'

export default function DashboardPage() {
  const [message, setMessage] = useState('Loading...')
  useEffect(() => {
    const token = localStorage.getItem('token')
    fetch(`${API_BASE}/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setMessage(d.message || 'Welcome'))
      .catch(() => setMessage('Unauthorized'))
  }, [])
  return (
    <div className="max-w-3xl mx-auto p-5">
      <h2 className="text-3xl font-bold mb-4">{message}</h2>
    </div>
  )
}


