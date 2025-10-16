import { useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  const [users, setUsers] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  })
  const [loading, setLoading] = useState(false)

  // Fetch users from the backend
  const fetchUsers = async () => {
    try {
  const response = await fetch(`${API_BASE}/users`)
      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      setUsers([])
    }
  }

  // Add new user
  const addUser = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email) {
      alert('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
  const response = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        // Reset form and fetch updated users
        setFormData({ name: '', email: '' })
        fetchUsers()
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error adding user:', error)
      alert('Error adding user. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Load users on component mount
  useEffect(() => {
    fetchUsers()
  }, [])

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="max-w-3xl mx-auto p-5 md:p-6">
      <h1 className="text-center text-gray-800 mb-8 text-4xl font-bold">User Management System</h1>

      {/* Add User Form */}
      <div className="bg-slate-50 p-6 rounded-xl mb-8 shadow">
        <h2 className="text-slate-700 mb-5 text-xl font-semibold">Add New User</h2>
        <form onSubmit={addUser} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="font-semibold text-slate-700 text-base">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter user name"
              required
              className="p-3 border-2 border-slate-300 rounded-md text-base focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="font-semibold text-slate-700 text-base">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter user email"
              required
              className="p-3 border-2 border-slate-300 rounded-md text-base focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-md text-base font-semibold mt-2 transition-colors hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : 'Add User'}
          </button>
        </form>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl p-6 shadow">
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center mb-5">
          <h2 className="text-slate-700 m-0 text-xl font-semibold">Users List</h2>
          <button
            onClick={fetchUsers}
            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm transition-colors hover:bg-green-700"
          >
            Refresh
          </button>
        </div>

        {users.length === 0 ? (
          <p className="text-center text-gray-500 italic p-10 bg-slate-50 rounded-md">
            No users found. Add some users to get started!
          </p>
        ) : (
          <div className="grid gap-4">
            {users.map((user) => (
              <div
                key={user._id}
                className="bg-slate-50 p-5 rounded-lg border-l-4 border-blue-600 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <h3 className="m-0 mb-2 text-slate-700 text-lg font-medium">{user.name}</h3>
                <p className="m-0 text-gray-500 text-base">{user.email}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
