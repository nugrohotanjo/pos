import React, { useState, useEffect } from 'react';
import type { Employee, CustomRole, AppPermission } from '../../types';
import { 
  getRolesFromApi, 
  getEmployeesFromApi, 
  createRoleToApi, 
  updateRoleToApi,
  updateRolePermissionsToApi, 
  createEmployeeToApi, 
  updateEmployeeToApi,
  toggleEmployeeStatusToApi 
} from '../../utils/api';
import { 
  Users, 
  ShieldCheck, 
  Plus, 
  UserPlus, 
  Check, 
  X, 
  RotateCw, 
  Lock, 
  Phone,
  Edit2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface UsersViewProps {
  currentUserRole?: CustomRole;
  currentUser?: Employee | null;
}

interface PermissionDefinition {
  key: AppPermission;
  label: string;
  category: string;
}

const ALL_PERMISSIONS: PermissionDefinition[] = [
  { key: 'access_dashboard', label: 'Buka Dashboard Pusat', category: 'Menu Navigasi' },
  { key: 'manage_products', label: 'Buka Master Barang & Soft Delete', category: 'Master Barang' },
  { key: 'edit_products', label: 'Edit Nama, Stok Manual & Harga Barang', category: 'Master Barang' },
  { key: 'manage_stock', label: 'Buka Kartu Stok & Catat Mutasi', category: 'Menu Navigasi' },
  { key: 'view_reports', label: 'Buka Laporan Penjualan & Keuangan', category: 'Menu Navigasi' },
  { key: 'view_audit_trail', label: 'Buka Audit Trail Global', category: 'Menu Navigasi' },
  { key: 'manage_employees', label: 'Kelola Staf & Matriks Role', category: 'Menu Navigasi' },
  { key: 'manage_settings', label: 'Pengaturan Toko & Payment Gateway', category: 'Menu Navigasi' },
  { key: 'pos_access', label: 'Akses Mesin Kasir Frontline (POS)', category: 'Terminal Kasir' },
  { key: 'void_transaction', label: 'Otorisasi Void / Pembatalan Struk', category: 'Terminal Kasir' },
];

export const UsersView: React.FC<UsersViewProps> = ({ currentUserRole, currentUser }) => {
  const isOwner = currentUserRole?.id === 'role-owner' || currentUser?.roleId === 'role-owner' || currentUser?.username === 'fadhil';

  const [activeTab, setActiveTab] = useState<'EMPLOYEES' | 'ROLES'>('ROLES');
  const [roles, setRoles] = useState<CustomRole[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal State
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<CustomRole | null>(null);
  const [isAddEmpModalOpen, setIsAddEmpModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);

  // Form Tambah Role
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [newRolePerms, setNewRolePerms] = useState<AppPermission[]>(['pos_access']);

  // Form Edit Role
  const [editRoleName, setEditRoleName] = useState('');
  const [editRoleDesc, setEditRoleDesc] = useState('');

  // Form Tambah Karyawan
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpUsername, setNewEmpUsername] = useState('');
  const [newEmpPin, setNewEmpPin] = useState('');
  const [newEmpRole, setNewEmpRole] = useState('');
  const [newEmpPhone, setNewEmpPhone] = useState('');

  // Form Edit Karyawan
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPin, setEditPin] = useState('');
  const [editConfirmPin, setEditConfirmPin] = useState('');
  const [editRoleId, setEditRoleId] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [dbRoles, dbEmployees] = await Promise.all([
        getRolesFromApi(),
        getEmployeesFromApi()
      ]);
      setRoles(dbRoles);
      setEmployees(dbEmployees);
      if (dbRoles.length > 0 && !newEmpRole) {
        setNewEmpRole(dbRoles[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTogglePermission = async (roleId: string, perm: AppPermission) => {
    if (!isOwner) {
      alert('Hanya Owner yang dapat mengubah konfigurasi izin role!');
      return;
    }

    const targetRole = roles.find((r) => r.id === roleId);
    if (!targetRole || targetRole.id === 'role-owner') return;

    const exists = targetRole.permissions.includes(perm);
    const updatedPermissions = exists
      ? targetRole.permissions.filter((p) => p !== perm)
      : [...targetRole.permissions, perm];

    setRoles((prev) =>
      prev.map((r) => (r.id === roleId ? { ...r, permissions: updatedPermissions } : r))
    );

    try {
      await updateRolePermissionsToApi(roleId, updatedPermissions, currentUser?.name || 'Owner');
      setSaveMessage(`Izin role "${targetRole.name}" berhasil disimpan.`);
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      alert(`Gagal menyimpan permissions: ${err.message}`);
      loadData();
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    try {
      await createRoleToApi({
        name: newRoleName.trim(),
        description: newRoleDesc.trim(),
        permissions: newRolePerms,
        actor: currentUser?.name || 'Owner',
      });
      setIsAddRoleModalOpen(false);
      setNewRoleName('');
      setNewRoleDesc('');
      setNewRolePerms(['pos_access']);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openEditRoleModal = (role: CustomRole) => {
    if (!isOwner) {
      alert('Hanya Owner yang dapat mengubah nama role!');
      return;
    }
    setEditingRole(role);
    setEditRoleName(role.name);
    setEditRoleDesc(role.description || '');
    setErrorMessage(null);
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole || !editRoleName.trim()) return;

    try {
      await updateRoleToApi(editingRole.id, {
        name: editRoleName.trim(),
        description: editRoleDesc.trim(),
        actor: currentUser?.name || 'Owner',
        actor_role: 'role-owner',
      });
      setSaveMessage(`Nama role berhasil diperbarui menjadi "${editRoleName.trim()}".`);
      setTimeout(() => setSaveMessage(null), 3000);
      setEditingRole(null);
      loadData();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim() || !newEmpUsername.trim() || !newEmpPin.trim()) return;

    try {
      await createEmployeeToApi({
        name: newEmpName.trim(),
        username: newEmpUsername.trim(),
        pin: newEmpPin.trim(),
        role_id: newEmpRole,
        phone: newEmpPhone.trim(),
        actor: currentUser?.name || 'Owner',
      });
      setIsAddEmpModalOpen(false);
      setNewEmpName('');
      setNewEmpUsername('');
      setNewEmpPin('');
      setNewEmpPhone('');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openEditEmpModal = (emp: Employee) => {
    if (!isOwner) {
      alert('Akses Ditolak: Hanya Pemilik Toko (Owner) yang berhak mengubah data staf.');
      return;
    }
    setEditingEmp(emp);
    setEditName(emp.name);
    setEditUsername(emp.username);
    setEditRoleId(emp.roleId);
    setEditPhone(emp.phone || '');
    setEditPin('');
    setEditConfirmPin('');
    setErrorMessage(null);
  };

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmp) return;
    setErrorMessage(null);

    if (editPin) {
      if (editPin.length < 4 || editPin.length > 6) {
        setErrorMessage('PIN baru harus terdiri dari 4 sampai 6 digit angka!');
        return;
      }
      if (editPin !== editConfirmPin) {
        setErrorMessage('PIN baru dan Konfirmasi PIN tidak sama! Mohon periksa kembali.');
        return;
      }
    }

    try {
      await updateEmployeeToApi(editingEmp.id, {
        name: editName.trim(),
        username: editUsername.trim(),
        pin: editPin ? editPin.trim() : undefined,
        role_id: editRoleId,
        phone: editPhone.trim(),
        actor: currentUser?.name || 'Owner',
        actor_role: 'role-owner',
      });

      setSaveMessage(`Data staf "${editName}" berhasil diperbarui ke database.`);
      setTimeout(() => setSaveMessage(null), 3000);
      setEditingEmp(null);
      loadData();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const handleToggleEmployeeStatus = async (empId: string) => {
    try {
      await toggleEmployeeStatusToApi(empId, currentUser?.name || 'Owner');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users size={22} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Manajemen Karyawan & Hak Akses</h2>
          </div>
          <p className="text-sm text-slate-500 mt-1 pl-10">
            Kustomisasi nama role, izin menu per jabatan, serta data profil dan PIN staf kasir.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl transition cursor-pointer"
            title="Segarkan Data"
          >
            <RotateCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>

          {activeTab === 'ROLES' ? (
            <button
              onClick={() => setIsAddRoleModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-xl text-xs transition cursor-pointer shadow-sm"
            >
              <Plus size={16} />
              <span>Buat Role Baru</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAddEmpModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-xl text-xs transition cursor-pointer shadow-sm"
            >
              <UserPlus size={16} />
              <span>Tambah Staf Karyawan</span>
            </button>
          )}
        </div>
      </div>

      {saveMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200 text-sm font-semibold text-slate-500">
        <button
          onClick={() => setActiveTab('ROLES')}
          className={`pb-3 px-1 flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'ROLES'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent hover:text-slate-800'
          }`}
        >
          <ShieldCheck size={18} />
          <span>Kustomisasi Role & Permissions ({roles.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('EMPLOYEES')}
          className={`pb-3 px-1 flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'EMPLOYEES'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent hover:text-slate-800'
          }`}
        >
          <Users size={18} />
          <span>Daftar Akun Karyawan ({employees.length})</span>
        </button>
      </div>

      {/* TAB 1: Matriks Hak Akses & Edit Nama Role */}
      {activeTab === 'ROLES' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold uppercase tracking-wider text-slate-700">
              MATRIKS IZIN PER JABATAN (KLIK IKON PENSIL UNTUK UBAH NAMA ROLE)
            </span>
            <span className="italic text-[11px]">Hanya Owner yang dapat mengubah konfigurasi role</span>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm text-slate-600 min-w-[850px]">
              <thead className="bg-white border-b border-slate-200 text-xs font-bold text-slate-700">
                <tr>
                  <th className="py-4 px-6 min-w-[280px]">Fitur & Menu Navigasi</th>
                  {roles.map((r) => (
                    <th key={r.id} className="py-4 px-6 text-center w-60">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="font-bold text-slate-900 text-sm">{r.name}</span>
                        {isOwner && (
                          <button
                            type="button"
                            onClick={() => openEditRoleModal(r)}
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition cursor-pointer"
                            title={`Ubah Nama Role ${r.name}`}
                          >
                            <Edit2 size={13} />
                          </button>
                        )}
                      </div>
                      <div className="text-[11px] font-normal text-slate-400 mt-0.5 line-clamp-1">{r.description || '-'}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ALL_PERMISSIONS.map((perm) => (
                  <tr key={perm.key} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-slate-800 text-xs">{perm.label}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">[{perm.category}]</div>
                    </td>

                    {roles.map((r) => {
                      const isOwnerRole = r.id === 'role-owner';
                      const isChecked = isOwnerRole || r.permissions.includes(perm.key);

                      return (
                        <td key={r.id} className="py-3.5 px-6 text-center">
                          <button
                            type="button"
                            disabled={!isOwner || isOwnerRole}
                            onClick={() => handleTogglePermission(r.id, perm.key)}
                            className={`w-6 h-6 rounded-md inline-flex items-center justify-center transition border ${
                              isChecked
                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                : 'bg-white border-slate-300 hover:border-indigo-400 text-transparent'
                            } ${!isOwner || isOwnerRole ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <Check size={14} className={isChecked ? 'stroke-[3]' : ''} />
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

      {/* TAB 2: Daftar Akun Karyawan */}
      {activeTab === 'EMPLOYEES' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm text-slate-600 min-w-[800px]">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-xs tracking-wider uppercase">
                <tr>
                  <th className="py-4 px-6">Nama Staf</th>
                  <th className="py-4 px-6">Username</th>
                  <th className="py-4 px-6">PIN Kasir</th>
                  <th className="py-4 px-6">Peran / Role</th>
                  <th className="py-4 px-6">Kontak</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((emp) => {
                  const roleObj = roles.find((r) => r.id === emp.roleId);
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{emp.name}</span>
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-600">@{emp.username}</td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-400 font-bold tracking-widest">
                        ••••
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs">
                          {roleObj?.name || 'Staf'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500">{emp.phone || '-'}</td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            emp.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'
                          }`}
                        >
                          {emp.isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditEmpModal(emp)}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-2xs border border-indigo-200/60"
                            title="Edit Data & Ubah PIN"
                          >
                            <Edit2 size={13} />
                            <span>Edit Profil / PIN</span>
                          </button>
                          
                          {emp.roleId !== 'role-owner' && (
                            <button
                              onClick={() => handleToggleEmployeeStatus(emp.id)}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                emp.isActive
                                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-600'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {emp.isActive ? 'Nonaktif' : 'Aktif'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Edit Nama Role */}
      {editingRole && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Edit2 size={18} className="text-indigo-600" />
                Ubah Nama & Keterangan Role
              </h3>
              <button onClick={() => setEditingRole(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {errorMessage && (
              <div className="m-6 mb-0 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleUpdateRole} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nama Jabatan / Role *</label>
                <input
                  type="text"
                  required
                  value={editRoleName}
                  onChange={(e) => setEditRoleName(e.target.value)}
                  placeholder="Contoh: Kepala Toko / Leader Kasir"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Deskripsi Tanggung Jawab</label>
                <textarea
                  rows={3}
                  value={editRoleDesc}
                  onChange={(e) => setEditRoleDesc(e.target.value)}
                  placeholder="Tuliskan wewenang atau tugas role ini..."
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingRole(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Karyawan & Ganti PIN */}
      {editingEmp && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Edit2 size={18} className="text-indigo-600" />
                Edit Data Staf: {editingEmp.name}
              </h3>
              <button onClick={() => setEditingEmp(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {errorMessage && (
              <div className="m-6 mb-0 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleUpdateEmployee} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Username Login *</label>
                  <input
                    type="text"
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Peran / Role *</label>
                  <select
                    value={editRoleId}
                    onChange={(e) => setEditRoleId(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">No. Kontak / WhatsApp</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="0812-xxxx-xxxx"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full pl-8 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Area Ubah PIN Baru */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Lock size={14} className="text-indigo-600" />
                  <span>Ubah PIN Baru (Kosongkan jika tidak ingin ganti PIN)</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">PIN Baru (4-6 Angka)</label>
                    <input
                      type="password"
                      maxLength={6}
                      placeholder="••••"
                      value={editPin}
                      onChange={(e) => setEditPin(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono tracking-widest focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Konfirmasi PIN Baru</label>
                    <input
                      type="password"
                      maxLength={6}
                      placeholder="••••"
                      value={editConfirmPin}
                      onChange={(e) => setEditConfirmPin(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono tracking-widest focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingEmp(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Role */}
      {isAddRoleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <ShieldCheck size={18} className="text-indigo-600" />
                Buat Role Baru
              </h3>
              <button onClick={() => setIsAddRoleModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nama Role *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Admin Gudang / Kasir Shift Pagi"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Deskripsi</label>
                <input
                  type="text"
                  placeholder="Rincian tanggung jawab peran operasional..."
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddRoleModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  Simpan Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Karyawan */}
      {isAddEmpModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <UserPlus size={18} className="text-indigo-600" />
                Daftarkan Staf Karyawan Baru
              </h3>
              <button onClick={() => setIsAddEmpModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rian Pratama"
                    value={newEmpName}
                    onChange={(e) => setNewEmpName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Username Login *</label>
                  <input
                    type="text"
                    required
                    placeholder="rian"
                    value={newEmpUsername}
                    onChange={(e) => setNewEmpUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">PIN Kasir (4-6 Digit) *</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="1234"
                      maxLength={6}
                      value={newEmpPin}
                      onChange={(e) => setNewEmpPin(e.target.value)}
                      className="w-full pl-8 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Peran / Role *</label>
                  <select
                    value={newEmpRole}
                    onChange={(e) => setNewEmpRole(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nomor Kontak / WhatsApp</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="0812-xxxx-xxxx"
                    value={newEmpPhone}
                    onChange={(e) => setNewEmpPhone(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddEmpModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  Daftarkan Staf
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
