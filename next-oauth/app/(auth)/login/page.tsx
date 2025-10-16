// app/login/page.tsx
'use client';
import AuthForm from '@/app/components/AuthForm';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  return (
    <div className="auth-page">
      <AuthForm 
        isLogin={true} 
        onSuccess={() => router.push('/dashboard')}
      />
    </div>
  );
}