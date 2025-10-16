// app/profile/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider } from 'firebase/auth';
import { 
  auth,
  EmailAuthProvider,
  linkWithCredential,
  signInWithPopup,
  updatePassword,
  reauthenticateWithCredential
} from '@/lib/firebase';

export default function ProfilePage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasPassword, setHasPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkProviders = () => {
      const hasPass = auth.currentUser?.providerData.some(
        p => p.providerId === EmailAuthProvider.PROVIDER_ID
      );
      setHasPassword(!!hasPass);
    };
    checkProviders();
  }, []);

  const handleGoogleReauth = async () => {
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      return result.user;
    } catch (error) {
      setError('Reauthentication failed. Please try again.');
      return null;
    }
  };

  const handleSetPassword = async () => {
    try {
      const user = auth.currentUser;
      if (!user?.email) throw new Error('Not authenticated');
      
      if (newPassword !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      // For Google users without existing password
      if (!hasPassword) {
        const reauthedUser = await handleGoogleReauth();
        if (!reauthedUser) return;

        const credential = EmailAuthProvider.credential(user.email, newPassword);
        await linkWithCredential(user, credential);
      } else {
        // For existing password users
        const currentPassword = prompt('Please enter your current password:');
        if (!currentPassword) return;
        
        const cred = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, cred);
        await updatePassword(user, newPassword);
      }

      // Update database
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          providers: hasPassword ? undefined : ['password']
        })
      });

      setSuccess(hasPassword 
        ? 'Password updated successfully!' 
        : 'Password setup successful!');
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="profile-container">
      <h2>{hasPassword ? 'Change Password' : 'Set Password'}</h2>
      
      {!hasPassword && (
        <div className="reauth-notice">
          <p>You originally signed up with Google. To set a password:</p>
          <ol>
            <li>Reauthenticate with Google below</li>
            <li>Create a new password</li>
          </ol>
        </div>
      )}

      <form onSubmit={(e) => {
        e.preventDefault();
        handleSetPassword();
      }}>
        {!hasPassword && (
          <button 
            type="button" 
            onClick={handleGoogleReauth}
            className="google-btn"
          >
            Verify with Google First
          </button>
        )}

        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={8}
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={8}
        />
        <button type="submit">
          {hasPassword ? 'Update Password' : 'Set Password'}
        </button>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
      </form>
    </div>
  );
}