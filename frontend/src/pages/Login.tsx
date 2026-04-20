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

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        navigate('/home');
      } else {
        setError(data.error || 'Login gagal.');
      }
    } catch (err) {
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
            className="w-full flex justify-center py-2.5 px-4 rounded-md text-[13px] font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 focus:outline-none"
          >
            Login
          </button>
        </form>
        
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
