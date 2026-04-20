import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface JwtPayload {
  id: number;
  email: string;
  role: string;
  exp: number;
}

export default function Home() {
  const [jwtData, setJwtData] = useState<JwtPayload | null>(null);
  const [adminMsg, setAdminMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as JwtPayload;
      if (payload.exp * 1000 < Date.now()) {
        throw new Error('Token expired');
      }
      setJwtData(payload);
      
      if (payload.role === 'admin') {
        fetch('/admin', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
          if (data.adminData) {
            setAdminMsg(JSON.stringify(data.adminData, null, 2));
          }
        });
      }
    } catch (e) {
      localStorage.removeItem('token');
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!jwtData) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_50%,#0f172a_0,#020617_100%)] p-4">
      <div className="max-w-md w-full p-8 bg-slate-900 border border-slate-800 rounded-xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] text-center">
        
        <div className="inline-block px-3 py-1 bg-sky-950 border border-sky-800 text-sky-400 text-[10px] uppercase rounded-full tracking-wider mb-4">
          Authenticated Session
        </div>

        <h1 className="text-[24px] font-light text-slate-50 mb-2">Welcome Home</h1>
        <p className="text-[13px] text-slate-400 mb-8">Successfully verified via JWT</p>

        <div className="mt-8 p-5 bg-slate-950 border border-slate-800 rounded-lg text-left mb-6 font-mono text-[11px] text-slate-300">
          <div className="text-[10px] uppercase tracking-[0.1em] text-slate-500 font-bold mb-3 font-sans">
            Decoded JWT Payload:
          </div>
          <p className="mb-1 text-sky-400">
            <span className="text-slate-500">Email:</span> {jwtData.email}
          </p>
          <p className="mb-1 text-sky-400">
            <span className="text-slate-500">Role:</span> {jwtData.role}
          </p>
        </div>

        {adminMsg && (
          <div className="mt-4 p-5 bg-emerald-950 border border-emerald-900 rounded-lg text-left mb-6 font-mono text-[11px] text-emerald-400">
             <div className="text-[10px] uppercase tracking-[0.1em] text-emerald-700 font-bold mb-3 font-sans">
              /Admin Endpoint Response
            </div>
            <pre>{adminMsg}</pre>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex justify-center py-2.5 px-4 rounded-md text-[13px] font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 focus:outline-none transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
