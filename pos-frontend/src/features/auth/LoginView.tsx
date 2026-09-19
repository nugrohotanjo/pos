import React, { useState } from 'react';
import { Lock, UserCheck, ShieldCheck, Delete, ArrowRight } from 'lucide-react';
import type { Employee, CustomRole } from '../../types';

interface LoginViewProps {
  employees: Employee[];
  roles: CustomRole[];
  onLoginSuccess: (employee: Employee) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  employees,
  roles,
  onLoginSuccess,
}) => {
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || '');
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const activeEmployees = employees.filter(e => e.isActive);
  const selectedEmployee = activeEmployees.find(e => e.id === selectedEmpId);
  const selectedRole = roles.find(r => r.id === selectedEmployee?.roleId);

  const handleNumpad = (digit: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + digit);
      setErrorMsg('');
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleClear = () => {
    setPin('');
    setErrorMsg('');
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedEmployee) return;

    if (pin === selectedEmployee.pin) {
      onLoginSuccess(selectedEmployee);
    } else {
      setErrorMsg('PIN yang dimasukkan salah! Coba periksa kembali.');
      setPin('');
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-950 flex items-center justify-center p-4 font-sans select-none">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-800">
        
        {/* Header Login */}
        <div className="bg-slate-900 p-6 text-center text-white relative">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-600/30 mb-3">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-black tracking-wider uppercase">TOKO SERBA 35.000</h2>
          <p className="text-xs text-indigo-300 font-mono mt-1">Otorisasi Shift & Masuk Sistem</p>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Pilih Akun Staf */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1.5 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-indigo-600" /> Pilih Petugas / Karyawan
            </label>
            <select
              value={selectedEmpId}
              onChange={(e) => {
                setSelectedEmpId(e.target.value);
                setPin('');
                setErrorMsg('');
              }}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {activeEmployees.map((emp) => {
                const r = roles.find(role => role.id === emp.roleId);
                return (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} — ({r?.name || 'Tanpa Role'})
                  </option>
                );
              })}
            </select>

            <div className="mt-2 text-xs text-slate-500 flex items-center justify-between px-1">
              <span>Peran: <b className="text-indigo-600">{selectedRole?.name}</b></span>
              <span className="text-[11px] text-slate-400">ID: {selectedEmployee?.id}</span>
            </div>
          </div>

          {/* Display PIN Dots */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 block text-center">
              Masukkan 4 Digit PIN Otorisasi
            </label>
            
            <div className="flex justify-center items-center gap-3 py-2">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center text-xl font-mono font-bold transition-all ${
                    pin.length > idx
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-sm scale-105'
                      : 'border-slate-200 bg-slate-50 text-transparent'
                  }`}
                >
                  {pin.length > idx ? '●' : ''}
                </div>
              ))}
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-600 font-semibold text-center mt-1 animate-shake">
                {errorMsg}
              </p>
            )}
          </div>

          {/* Layar Numpad Fisik / Virtual */}
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleNumpad(num)}
                className="py-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold text-lg rounded-xl transition-all shadow-sm"
              >
                {num}
              </button>
            ))}
            
            <button
              type="button"
              onClick={handleClear}
              className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-xs rounded-xl transition-colors"
            >
              C
            </button>

            <button
              type="button"
              onClick={() => handleNumpad('0')}
              className="py-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold text-lg rounded-xl transition-all shadow-sm"
            >
              0
            </button>

            <button
              type="button"
              onClick={handleBackspace}
              className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center rounded-xl transition-colors"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          {/* Tombol Masuk */}
          <button
            type="submit"
            disabled={pin.length < 4}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
          >
            <span>Masuk ke Sistem</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Demo Info */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400">
          PIN Demo: <b>9999</b> (Owner), <b>1234</b> (Supervisor), <b>1111</b> (Kasir)
        </div>

      </div>
    </div>
  );
};