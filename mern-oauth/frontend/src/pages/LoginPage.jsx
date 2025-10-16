import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  auth, 
  googleProvider, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  linkWithCredential,
  fetchSignInMethodsForEmail,
  EmailAuthProvider
} from '../lib/firebase'
import { saveUserToBackend } from '../lib/api'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  
  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')
    
    try {
      const result = await signInWithPopup(auth, googleProvider)
      if (result.user) {
        await saveUserToBackend(result.user, 'google')
        navigate('/dashboard')
      }
    } catch (err) {
      if (err.code === 'auth/account-exists-with-different-credential') {
        await handleAccountConflict(err)
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAccountConflict = async (error) => {
    const email = error.customData?.email
    const pendingCred = error.credential

    if (!email || !pendingCred) {
      setError('Missing email or credential for account conflict.')
      return
    }

    try {
      const methods = await fetchSignInMethodsForEmail(auth, email)

      if (methods.includes(EmailAuthProvider.PROVIDER_ID)) {
        const password = prompt(`Enter password for ${email} to link accounts:`)

        if (!password) {
          setError('Password is required to link accounts.')
          return
        }

        const result = await signInWithEmailAndPassword(auth, email, password)
        await linkWithCredential(result.user, pendingCred)
        await saveUserToBackend(result.user, 'google')
        navigate('/dashboard')
      } else {
        setError('Account exists with a different authentication method. Please use the correct sign-in method.')
      }
    } catch (err) {
      setError(err.message)
      await auth.signOut()
    }
  }

  return (
    <div className="max-w-md mx-auto p-5">
      <h2 className="text-2xl font-semibold mb-4">Login</h2>
      
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input 
          className="p-3 border-2 rounded" 
          name="email" 
          type="email" 
          placeholder="Email" 
          value={form.email} 
          onChange={onChange} 
          required 
        />
        <input 
          className="p-3 border-2 rounded" 
          name="password" 
          type="password" 
          placeholder="Password" 
          value={form.password} 
          onChange={onChange} 
          required 
        />
        <button 
          disabled={loading} 
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>

      <div className="my-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>
      </div>

      <button 
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>

      {error && (
        <div className="mt-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <p className="mt-3 text-sm">No account? <Link className="text-blue-600 underline" to="/register">Register</Link></p>
    </div>
  )
}


