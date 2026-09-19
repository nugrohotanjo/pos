import React, { useState } from 'react';
import { UserPlus, Shield, KeyRound, CheckCircle, XCircle, X } from 'lucide-react';
import type { Employee, EmployeeRole } from '../../types';

interface UsersViewProps {
  employees: Employee[];
  onAddEmployee: (emp: Employee) => void;
  onToggleStatus: (id: string) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({ employees, onAddEmployee, onToggleStatus }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<EmployeeRole>('CASHIER');
  const [pin, setPin] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || pin.length < 4) return;

    const newEmp: Employee = {
      id: `EMP-${Date.now().toString().slice(-4)}`,
      name,
      username: username.toLowerCase().trim(),
      role,
      pin,
      isActive: true,
    };

    onAddEmployee(newEmp);
    setName('');
    setUsername('');
    setRole('CASHIER');
    setPin('');
    setIsModalOpen(false);
  };

  const getRoleBadge = (empRole: EmployeeRole) => {
    switch (empRole) {
      case 'OWNER':
        return <span className="px-2.5 py-1 rounded text-xs font-bold bg-indigo-100 text-indigo-700">Owner</span>;
      case 'SUPERVISOR':
        return <span className="px-2.5 py-1 rounded text-xs font-bold bg-amber-100 text-amber-700">Supervisor</span>;
      case 'CASHIER':
        return <span className="px-2.5 py-1 rounded text-xs font-bold bg-slate-100 text-slate-700">Kasir</span>;
    }
  };

  return (
    <div className="p-8 h-full flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Manajemen Karyawan & Hak Akses</h2>
          <p className="text-xs text-slate-500 mt-1">Kelola akun kasir, supervisor toko, dan verifikasi PIN otorisasi</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors"
        >
          <UserPlus className="w-4 h-4" /> Tambah Karyawan
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <span>Daftar Karyawan Aktif</span>
          <span>{employees.length} Pengguna Terdaftar</span>
        </div>

        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-white text-slate-400 sticky top-0 border-b border-slate-200 text-xs uppercase font-semibold">
              <tr>
                <th className="py-3 px-6">ID & Nama</th>
                <th className="py-3 px-6">Username</th>
                <th className="py-3 px-6">Role / Peran</th>
                <th className="py-3 px-6">PIN Transaksi</th>
                <th className="py-3 px-6 text-center">Status</th>
                <th className="py-3 px-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50">
                  <td className="py-4 px-6">
                    <span className="font-semibold text-slate-800 block">{emp.name}</span>
                    <span className="font-mono text-xs text-slate-400">{emp.id}</span>
                  </td>
                  <td className="py-4 px-6 font-mono text-slate-700">@{emp.username}</td>
                  <td className="py-4 px-6">{getRoleBadge(emp.role)}</td>
                  <td className="py-4 px-6 font-mono text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                      ••••
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    {emp.isActive ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                        <CheckCircle className="w-3.5 h-3.5" /> Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-400 text-xs font-semibold">
                        <XCircle className="w-3.5 h-3.5" /> Nonaktif
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-center">
                    {emp.role !== 'OWNER' && (
                      <button
                        onClick={() => onToggleStatus(emp.id)}
                        className={`text-xs font-semibold hover:underline ${
                          emp.isActive ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {emp.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TAMBAH KARYAWAN */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg text-slate-800">Tambah Akun Karyawan</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-md">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Siti Rahma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Username Login</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: sitir"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Role / Peran</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as EmployeeRole)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="CASHIER">Kasir</option>
                    <option value="SUPERVISOR">Supervisor</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">PIN Kasir / Void (4 Digit)</label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    placeholder="••••"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm font-mono text-center tracking-widest focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
                >
                  Simpan Karyawan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};