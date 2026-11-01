import React, { useState } from 'react';
import type { Employee } from '../../types';
import { loginWithApi } from '../../utils/api';
import { Store, Lock, User, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface LoginViewProps {
  appName: string;
  onLoginSuccess: (employee: Employee, role: any) => void;
  employees?: Employee[];
  roles?: any[];
}

export const LoginView: React.FC<LoginViewProps> = ({ appName, onLoginSuccess }) => {
  const [username, setUsername] = useState('fadhil');
  const [pin, setPin] = useState('1234');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !pin.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await loginWithApi(username.trim(), pin.trim());
      const empData: Employee = {
        id: res.employee.id,
        name: res.employee.name,
        username: res.employee.username,
        pin: res.employee.pin,
        roleId: res.employee.role_id,
        phone: res.employee.phone,
        isActive: res.employee.is_active,
      };
      onLoginSuccess(empData, res.role);
    } catch (err: any) {
      setErrorMsg(err.message || 'Username atau PIN salah!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Store size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{appName}</h2>
          <p className="text-xs text-slate-500">Masuk menggunakan Akun & PIN yang terdaftar di database</p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Username Petugas</label>
            <div className="relative">
              <User size={18} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="fadhil / budi / siti"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">PIN Keamanan (4-6 Angka)</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="password"
                required
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm font-mono font-bold tracking-widest focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <span>{isLoading ? 'Memverifikasi...' : 'Masuk ke Terminal'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-slate-400 text-xs">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>Keamanan Terenkripsi Database PostgreSQL</span>
        </div>
      </div>
    </div>
  );
};
