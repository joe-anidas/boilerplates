import Link from 'next/link';

export default function Home() {
  return (
    <main className="container">
      <h1>Welcome to My Auth App</h1>
      <div className="auth-options">
        <Link href="/login" className="auth-link">
          Login
        </Link>
        <Link href="/signup" className="auth-link">
          Sign Up
        </Link>
      </div>
    </main>
  );
}