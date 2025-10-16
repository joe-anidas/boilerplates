import { NavLink, Link, useNavigate } from 'react-router-dom'

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-blue-600 text-white' : 'text-blue-700 hover:bg-blue-50'}`
      }
    >
      {children}
    </NavLink>
  )
}

export default function Navbar() {
  const navigate = useNavigate()
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const logout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }
  return (
    <header className="border-b bg-white">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-lg font-bold text-gray-900">JWT Demo</Link>
        <nav className="flex items-center gap-2">
          <NavItem to="/">Home</NavItem>
          {!token && (
            <>
              <NavItem to="/register">Register</NavItem>
              <NavItem to="/login">Login</NavItem>
            </>
          )}
          {token && (
            <>
              <NavItem to="/dashboard">Dashboard</NavItem>
              <button onClick={logout} className="px-3 py-2 rounded-md text-sm font-medium bg-gray-800 text-white">Logout</button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}


