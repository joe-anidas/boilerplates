import { useState } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE } from '../lib/api'

export default function LoginPage() {
  const [form, setForm] = useState({ email: 'admin@example.com', password: 'admin' })
  const [loading, setLoading] = useState(false)
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')
      localStorage.setItem('token', data.token)
      window.location.href = '/dashboard'
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="max-w-md mx-auto p-5">
      <h2 className="text-2xl font-semibold mb-4">Login</h2>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input className="p-3 border-2 rounded" name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} required />
        <input className="p-3 border-2 rounded" name="password" type="password" placeholder="Password" value={form.password} onChange={onChange} required />
        <button disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">{loading ? 'Signing in...' : 'Login'}</button>
      </form>
      <p className="mt-3 text-sm">No account? <Link className="text-blue-600 underline" to="/register">Register</Link></p>
    </div>
  )
}


