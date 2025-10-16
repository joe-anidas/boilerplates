// components/AuthForm.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  auth,
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  linkWithCredential,
  fetchSignInMethodsForEmail,
  EmailAuthProvider,
} from '@/lib/firebase';
import { browserLocalPersistence, User, AuthCredential } from 'firebase/auth';

interface AuthFormProps {
  isLogin: boolean;
  onSuccess: () => void;
  initialEmail?: string;
}

export default function AuthForm({
  isLogin,
  onSuccess,
  initialEmail = '',
}: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await auth.setPersistence(browserLocalPersistence);

      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        await saveUserToDB(auth.currentUser!);
      }
      onSuccess();
    } catch (err: any) {
      handleError(err);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      await auth.setPersistence(browserLocalPersistence);
      const result = await signInWithPopup(auth, googleProvider);

      if (result.user) {
        await saveUserToDB(result.user, 'google');
        onSuccess();
      }
    } catch (err: any) {
      if (err.code === 'auth/account-exists-with-different-credential') {
        await handleAccountConflict(err);
      } else {
        handleError(err);
      }
    }
  };

  const handleAccountConflict = async (error: any) => {
    const email: string = error.customData?.email;
    const pendingCred: AuthCredential = error.credential;

    if (!email || !pendingCred) {
      handleError(new Error('Missing email or credential for account conflict.'));
      return;
    }

    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);

      if (methods.includes(EmailAuthProvider.PROVIDER_ID)) {
        const password = prompt(`Enter password for ${email} to link accounts:`);

        if (!password) throw new Error('Password is required to link accounts.');

        const result = await signInWithEmailAndPassword(auth, email, password);
        await linkWithCredential(result.user, pendingCred);
        await saveUserToDB(result.user, 'google');
        onSuccess();
      } else {
        throw new Error(
          'Account exists with a different authentication method. Please use the correct sign-in method.'
        );
      }
    } catch (err) {
      handleError(err);
      await auth.signOut();
    }
  };

  const saveUserToDB = async (user: User, newProvider?: string) => {
    const providers = [
      ...new Set([
        ...user.providerData.map((p) => p.providerId.replace('.com', '')),
        ...(newProvider ? [newProvider] : []),
      ]),
    ];

    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        providers,
        updatedAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) throw new Error('Failed to save user data');
  };

  const handleError = (error: any) => {
    if (!isMounted) return;
    setError(error?.message || 'Authentication failed');
  };

  return (
    <div className="auth-container">
      <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete={isLogin ? 'current-password' : 'new-password'}
        />
        <button type="submit">{isLogin ? 'Login' : 'Create Account'}</button>
        {error && <div className="error-message">{error}</div>}
      </form>

      <button className="google-btn" onClick={handleGoogleSignIn}>
        Continue with Google
      </button>

      <div className="auth-footer">
        {isLogin ? (
          <span>
            Don't have an account?{' '}
            <button type="button" onClick={() => router.push('/signup')}>
              Sign Up
            </button>
          </span>
        ) : (
          <span>
            Already have an account?{' '}
            <button type="button" onClick={() => router.push('/login')}>
              Login
            </button>
          </span>
        )}
      </div>
    </div>
  );
}
