import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

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
  const { user, logout } = useAuth()
  
  return (
    <header className="border-b bg-white">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-lg font-bold text-gray-900">OAuth Demo</Link>
        <nav className="flex items-center gap-2">
          <NavItem to="/">Home</NavItem>
          {!user && (
            <>
              <NavItem to="/register">Register</NavItem>
              <NavItem to="/login">Login</NavItem>
            </>
          )}
          {user && (
            <>
              <NavItem to="/dashboard">Dashboard</NavItem>
              <button onClick={logout} className="px-3 py-2 rounded-md text-sm font-medium bg-gray-800 text-white hover:bg-gray-700">
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}


