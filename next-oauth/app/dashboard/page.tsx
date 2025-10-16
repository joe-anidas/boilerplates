// app/dashboard/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import Link from 'next/link';

export default function DashboardPage() {
  const [userData, setUserData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/login');
      } else {
        try {
          const response = await fetch(`/api/users/${user.uid}`);
          if (response.ok) setUserData(await response.json());
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  return (
    <div className="dashboard">
      <h1>Welcome, {userData?.email}</h1>
      <div className="security-section">
        {userData?.providers?.includes('password') ? (
          <p>Account security: Password set ✔️</p>
        ) : (
          <Link href="/profile">Set up password for email login</Link>
        )}
        <button onClick={() => auth.signOut()}>Logout</button>
      </div>
    </div>
  );
}