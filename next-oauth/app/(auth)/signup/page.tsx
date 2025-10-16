// app/signup/page.tsx
'use client';
import AuthForm from '@/app/components/AuthForm';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  return (
    <div className="auth-page">
      <AuthForm 
        isLogin={false}
        onSuccess={() => router.push('/dashboard')}
        initialEmail={initialEmail}
      />
    </div>
  );
}