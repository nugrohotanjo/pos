import React, { useState } from 'react';
import { 
  UserPlus, 
  Shield, 
  KeyRound, 
  CheckCircle, 
  XCircle, 
  X, 
  Users, 
  Lock, 
  Plus, 
  CheckSquare, 
  Square 
} from 'lucide-react';
import type { Employee, CustomRole, AppPermission } from '../../types';
import { Pagination } from '../../components/ui/Pagination';

interface UsersViewProps {
  employees: Employee[];
  roles: CustomRole[];
  onAddEmployee: (emp: Employee) => void;
  onToggleStatus: (id: string) => void;
  onAddRole: (newRole: CustomRole) => void;
  onUpdateRolePermissions: (roleId: string, permissions: AppPermission[]) => void;
}

const ALL_PERMISSIONS: { key: AppPermission; label: string; group: string }[] = [
  { key: 'access_dashboard', label: 'Buka Dashboard Pusat', group: 'Menu Navigasi' },
  { key: 'manage_products', label: 'Buka Master Barang & Soft Delete', group: 'Master Barang' },
  { key: 'edit_products', label: 'Edit Nama, Stok Manual & Harga Barang', group: 'Master Barang' },
  { key: 'manage_stock', label: 'Buka Kartu Stok & Catat Mutasi', group: 'Menu Navigasi' },
  { key: 'view_reports', label: 'Buka Laporan Penjualan & Keuangan', group: 'Menu Navigasi' },
  { key: 'view_audit_trail', label: 'Buka Audit Trail Global', group: 'Menu Navigasi' },
  { key: 'manage_employees', label: 'Kelola Staf & Matriks Role', group: 'Menu Navigasi' },
  { key: 'manage_settings', label: 'Ubah Konfigurasi Jalur Pembayaran', group: 'Menu Navigasi' },
  { key: 'access_pos', label: 'Buka Layar Kasir POS', group: 'Kasir & Frontline' },
  { key: 'void_transaction', label: 'Otorisasi PIN Void Pembatalan (F8)', group: 'Kasir & Frontline' },
  { key: 'exchange_items', label: 'Mode Tukar / Retur Barang (F7)', group: 'Kasir & Frontline' },
  { key: 'manage_petty_cash', label: 'Input Pengeluaran Kas Laci (F6)', group: 'Kasir & Frontline' },
];

export const UsersView: React.FC<UsersViewProps> = ({
  employees,
  roles,
  onAddEmployee,
  onToggleStatus,
  onAddRole,
  onUpdateRolePermissions
}) => {
  const [activeTab, setActiveTab] = useState<'employees' | 'roles'>('employees');

  // Pagination state untuk akun karyawan
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const paginatedEmployees = employees.slice((page - 1) * pageSize, page * pageSize);

  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState(roles[0]?.id || '');
  const [pin, setPin] = useState('');

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [newRolePermissions, setNewRolePermissions] = useState<AppPermission[]>(['access_pos']);

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || pin.length < 4) return;

    onAddEmployee({
      id: `EMP-${Date.now().toString().slice(-4)}`,
      name,
      username: username.toLowerCase().trim(),
      roleId: selectedRoleId,
      pin,
      isActive: true,
    });

    setName('');
    setUsername('');
    setPin('');
    setIsEmpModalOpen(false);
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName) return;

    const newRole: CustomRole = {
      id: `ROLE-${Date.now().toString().slice(-4)}`,
      name: newRoleName,
      description: newRoleDesc,
      permissions: newRolePermissions,
    };

    onAddRole(newRole);
    setNewRoleName('');
    setNewRoleDesc('');
    setNewRolePermissions(['access_pos']);
    setIsRoleModalOpen(false);
  };

  const togglePermissionForRole = (role: CustomRole, permKey: AppPermission) => {
    if (role.id === 'role-owner') return;
    const exists = role.permissions.includes(permKey);
    const updated = exists
      ? role.permissions.filter(p => p !== permKey)
      : [...role.permissions, permKey];
    onUpdateRolePermissions(role.id, updated);
  };

  return (
    <div className="p-8 h-full flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Manajemen Karyawan & Hak Akses</h2>
          <p className="text-xs text-slate-500 mt-1">Konfigurasi akun staf, peran operasional, dan izin menu sidebar</p>
        </div>

        {activeTab === 'employees' ? (
          <button
            onClick={() => setIsEmpModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors"
          >
            <UserPlus className="w-4 h-4" /> Tambah Staf Baru
          </button>
        ) : (
          <button
            onClick={() => setIsRoleModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Buat Role Baru
          </button>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('employees')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'employees'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Users className="w-4 h-4" /> Daftar Akun Karyawan
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'roles'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Shield className="w-4 h-4" /> Kustomisasi Role & Permissions
        </button>
      </div>

      {/* TAB 1: DAFTAR KARYAWAN */}
      {activeTab === 'employees' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Staf Toko Terdaftar</span>
            <span>{employees.length} Pengguna</span>
          </div>

          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-white text-slate-400 sticky top-0 border-b border-slate-200 text-xs uppercase font-semibold">
                <tr>
                  <th className="py-3 px-6">ID & Nama</th>
                  <th className="py-3 px-6">Username</th>
                  <th className="py-3 px-6">Role Terpasang</th>
                  <th className="py-3 px-6">PIN Transaksi</th>
                  <th className="py-3 px-6 text-center">Status</th>
                  <th className="py-3 px-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedEmployees.map((emp) => {
                  const role = roles.find(r => r.id === emp.roleId);
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50">
                      <td className="py-4 px-6">
                        <span className="font-semibold text-slate-800 block">{emp.name}</span>
                        <span className="font-mono text-xs text-slate-400">{emp.id}</span>
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-700">@{emp.username}</td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {role?.name || 'Tanpa Role'}
                        </span>
                      </td>
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
                        {emp.roleId !== 'role-owner' && (
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
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={page}
            pageSize={pageSize}
            totalItems={employees.length}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}

      {/* TAB 2: MATRIKS PERMISSION */}
      {activeTab === 'roles' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Matrix Izin Menu & Fitur (Centang = Akses Dibuka)
            </span>
            <span className="text-xs text-slate-400">Menu otomatis tersembunyi di sidebar jika tidak dicentang</span>
          </div>

          <div className="overflow-auto flex-1">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50 text-slate-700 sticky top-0 border-b z-10">
                <tr>
                  <th className="py-3 px-6 w-1/3">Fitur & Menu Navigasi</th>
                  {roles.map(role => (
                    <th key={role.id} className="py-3 px-4 text-center">
                      <span className="font-bold text-slate-800 block">{role.name}</span>
                      <span className="text-[11px] text-slate-400 font-normal">{role.description}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ALL_PERMISSIONS.map(perm => (
                  <tr key={perm.key} className="hover:bg-slate-50">
                    <td className="py-3 px-6">
                      <span className="font-medium text-slate-800 block">{perm.label}</span>
                      <span className="text-[11px] text-slate-400 font-mono">[{perm.group}]</span>
                    </td>
                    {roles.map(role => {
                      const hasPerm = role.permissions.includes(perm.key);
                      const isOwner = role.id === 'role-owner';

                      return (
                        <td key={`${role.id}-${perm.key}`} className="py-3 px-4 text-center">
                          <button
                            type="button"
                            disabled={isOwner}
                            onClick={() => togglePermissionForRole(role, perm.key)}
                            className={`p-1 rounded transition-colors ${
                              isOwner ? 'cursor-not-allowed opacity-60' : 'hover:bg-slate-100'
                            }`}
                          >
                            {hasPerm ? (
                              <CheckSquare className="w-5 h-5 text-indigo-600 mx-auto" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-300 mx-auto" />
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH KARYAWAN */}
      {isEmpModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg text-slate-800">Tambah Akun Karyawan</h3>
              <button onClick={() => setIsEmpModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-md">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rian Pratama"
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
                  placeholder="Contoh: rian"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Pilih Role</label>
                  <select
                    value={selectedRoleId}
                    onChange={(e) => setSelectedRoleId(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">PIN Kasir (4 Digit)</label>
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
                  onClick={() => setIsEmpModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
                >
                  Simpan Staf
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH ROLE BARU */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-lg text-slate-800">Buat Peran / Role Baru</h3>
              </div>
              <button onClick={() => setIsRoleModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-md">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Nama Peran / Role</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kasir Senior / Leader Toko"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Deskripsi</label>
                <input
                  type="text"
                  placeholder="Deskripsi wewenang role..."
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-2">Izin Akses Awal</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-lg border">
                  {ALL_PERMISSIONS.map(p => {
                    const isChecked = newRolePermissions.includes(p.key);
                    return (
                      <label key={p.key} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewRolePermissions([...newRolePermissions, p.key]);
                            } else {
                              setNewRolePermissions(newRolePermissions.filter(k => k !== p.key));
                            }
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>{p.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
                >
                  Simpan Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};