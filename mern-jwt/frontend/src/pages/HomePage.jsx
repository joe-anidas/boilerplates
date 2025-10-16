import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="max-w-md mx-auto p-8 text-center">
      <h1 className="text-3xl font-bold mb-6">Welcome</h1>
      <div className="flex flex-col gap-3">
        <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded">Register</Link>
        <Link to="/login" className="bg-gray-800 text-white px-4 py-2 rounded">Login</Link>
      </div>
    </div>
  )
}


