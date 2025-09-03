import { useState } from 'react';
import { auth, signInWithEmailAndPassword } from '../firebase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function login(e: any) {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-red-50 via-yellow-50 to-orange-100 py-8 px-2">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white/80 rounded-3xl shadow-lg p-8 flex flex-col gap-4 items-center">
          <form onSubmit={login} className="w-full flex flex-col gap-4">
            <h2 className="text-3xl font-extrabold text-red-600 mb-4 text-center drop-shadow">Admin Login</h2>
            <input className="rounded-lg border border-red-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 bg-white shadow" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} type="email" required />
            <input className="rounded-lg border border-red-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 bg-white shadow" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            <button className="mt-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-400 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-transform duration-300" type="submit" disabled={loading}>{loading ? 'Loading...' : 'Login'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
