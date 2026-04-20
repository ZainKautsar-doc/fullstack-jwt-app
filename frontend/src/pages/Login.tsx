import React from 'react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // DEBUG: console.log(email, password)
    console.log('Attempting login with:', { email, password });

    try {
      // Gunakan URL lengkap: http://localhost:3000/login
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Simpan token ke localStorage
        localStorage.setItem('token', data.token);
        // Redirect ke /home
        navigate('/home');
      } else {
        // Jika response gagal → tampilkan message dari backend
        setError(data.message || 'Login gagal.');
      }
    } catch (err) {
      // Jika fetch gagal → tampilkan "Koneksi ke server gagal"
      setError('Koneksi ke server gagal.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_50%_50%,#0f172a_0,#020617_100%)]">
      <div className="w-full max-w-sm p-8 bg-slate-900 border border-slate-800 rounded-xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] flex flex-col">
        <h2 className="text-[18px] font-normal text-center text-slate-50 mb-6">Sign In</h2>
        
        {error && (
          <div className="mb-4 p-3 text-[13px] text-red-400 bg-red-950/50 border border-red-900/50 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[10px] uppercase tracking-[0.1em] text-slate-500 font-bold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="block w-full bg-slate-950 border border-slate-700 rounded-md p-2.5 text-[13px] text-white focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.1em] text-slate-500 font-bold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block w-full bg-slate-950 border border-slate-700 rounded-md p-2.5 text-[13px] text-white focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2.5 px-4 rounded-md text-[13px] font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 focus:outline-none transition-colors"
          >
            Login
          </button>
        </form>

        <div className="mt-6 flex items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="px-3 text-[11px] text-slate-500 uppercase tracking-widest">atau</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        <button
          onClick={() => window.location.href = 'http://localhost:3000/auth/google'}
          className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-[13px] font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-slate-700 focus:outline-none transition-all"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Login with Google
        </button>
        
        <p className="mt-6 text-[11px] text-center text-slate-500 leading-relaxed">
          Don't have an account? <Link to="/register" className="text-sky-400 hover:underline">Register here</Link>
          <br/><br/>
          Tambahan Test Seed Data:<br/>
          <b>admin@mail.com</b> (admin)<br/>
          <b>user@mail.com</b> (user)<br/>
          Password: <b>123456</b>
        </p>
      </div>
    </div>
  );
}
