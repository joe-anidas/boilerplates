import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { makeAuthenticatedRequest } from '../lib/api'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await makeAuthenticatedRequest('/dashboard')
        if (response.ok) {
          const data = await response.json()
          setDashboardData(data)
        } else {
          console.error('Failed to fetch dashboard data')
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user])

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto p-5">
        <h2 className="text-3xl font-bold mb-4">Please log in to access the dashboard</h2>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-5">
        <h2 className="text-3xl font-bold mb-4">Loading...</h2>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-5">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">
          {dashboardData?.message || `Welcome, ${user.displayName || user.email}!`}
        </h2>
        <button 
          onClick={logout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {user.photoURL && (
        <div className="mb-6">
          <img 
            src={user.photoURL} 
            alt="Profile" 
            className="w-20 h-20 rounded-full"
          />
        </div>
      )}

      <div className="bg-gray-100 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">User Information</h3>
        <div className="space-y-2">
          <p><strong>Email:</strong> {user.email}</p>
          {user.displayName && <p><strong>Name:</strong> {user.displayName}</p>}
          <p><strong>UID:</strong> {user.uid}</p>
        </div>
      </div>
    </div>
  )
}


