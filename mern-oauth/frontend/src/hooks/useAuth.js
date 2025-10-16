import { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { saveUserToBackend } from '../lib/api';
import { onAuthStateChanged } from 'firebase/auth';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get the Firebase ID token
        const token = await firebaseUser.getIdToken();
        localStorage.setItem('firebaseToken', token);
        
        // Save user to backend
        try {
          await saveUserToBackend(firebaseUser);
        } catch (error) {
          console.error('Error saving user to backend:', error);
        }

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        localStorage.removeItem('firebaseToken');
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await auth.signOut();
    localStorage.removeItem('firebaseToken');
    setUser(null);
  };

  return { user, loading, logout };
};