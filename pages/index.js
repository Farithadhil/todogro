// pages/index.js
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to Grocery List Generator</h1>
      {user ? (
        <Link href="/dashboard" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
        Go to Dashboard
      </Link>
      ) : (
        <p>Please sign in to create and manage your grocery lists.</p>
      )}
    </div>
  );
}