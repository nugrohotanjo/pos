import React, { useState, useEffect, useCallback } from 'react';
import type { Employee, CustomRole } from '../../types';
import { 
  getCategoriesServerSide, 
  createCategoryToApi, 
  updateCategoryToApi, 
  deleteCategoryToApi,
  type CategoryItem 
} from '../../utils/api';
import { DataTable, type Column } from '../../components/DataTable';
import { 
  Boxes, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  Layers,
  ChevronRight,
  Globe
} from 'lucide-react';

interface CategoriesViewProps {
  currentUser: Employee | null;
  currentUserRole?: CustomRole;
  canEdit?: boolean;
  onAuditLog?: (module: any, action: any, details: string) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  currentUser,
  canEdit = true,
  onAuditLog,
}) => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [allCategoriesList, setAllCategoriesList] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filter & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<CategoryItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formParentId, setFormParentId] = useState<number | ''>('');
  const [formDesc, setFormDesc] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getCategoriesServerSide({
        page,
        limit,
        search,
        status: statusFilter === 'ALL' ? undefined : statusFilter === 'ACTIVE' ? 'true' : 'false',
      });
      
      if (res && res.success) {
        const rawList = Array.isArray(res.data) ? res.data : [];
        setCategories(rawList);
        if (res.pagination) {
          setTotalItems(res.pagination.total_items ?? rawList.length);
          setTotalPages(res.pagination.total_pages ?? 1);
        }
      }
    } catch (err) {
      console.error('Gagal mengambil kategori:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, statusFilter]);

  // Load semua kategori untuk pilihan Dropdown Parent
  const fetchAllForDropdown = async () => {
    try {
      const res = await getCategoriesServerSide({ all: true });
      if (res && res.success && Array.isArray(res.data)) {
        setAllCategoriesList(res.data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchCategories();
    fetchAllForDropdown();
  }, [fetchCategories]);

  // Auto-generate slug dari nama
  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!editingCat) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormSlug(generated);
    }
  };

  const handleOpenAdd = () => {
    setEditingCat(null);
    setFormName('');
    setFormSlug('');
    setFormParentId('');
    setFormDesc('');
    setFormActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: CategoryItem) => {
    setEditingCat(item);
    setFormName(item.name || '');
    setFormSlug(item.slug || '');
    setFormParentId(item.parent_id || '');
    setFormDesc(item.description || '');
    setFormActive(item.is_active ?? true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Nama kategori wajib diisi!');
      return;
    }

    const actor = currentUser?.name || 'Sistem';
    setIsSubmitting(true);
    try {
      const payload = {
        name: formName.trim(),
        slug: formSlug.trim(),
        description: formDesc.trim(),
        parent_id: formParentId ? Number(formParentId) : null,
        actor,
      };

      if (editingCat) {
        await updateCategoryToApi(editingCat.id, {
          ...payload,
          is_active: formActive,
        });
        if (onAuditLog) onAuditLog('CATEGORIES', 'UPDATE', `Pembaruan kategori: ${formName}`);
      } else {
        await createCategoryToApi(payload);
        if (onAuditLog) onAuditLog('CATEGORIES', 'CREATE', `Menambahkan kategori: ${formName}`);
      }

      setIsModalOpen(false);
      fetchCategories();
      fetchAllForDropdown();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: CategoryItem) => {
    if (!confirm(`Hapus kategori "${item.name}"?`)) return;

    try {
      const actor = currentUser?.name || 'Sistem';
      await deleteCategoryToApi(item.id, actor);
      if (onAuditLog) onAuditLog('CATEGORIES', 'DELETE', `Menghapus kategori: ${item.name}`);
      fetchCategories();
      fetchAllForDropdown();
    } catch (err: any) {
      alert(`Gagal: ${err.message}`);
    }
  };

  const columns: Column<CategoryItem>[] = [
    {
      header: 'KATEGORI & HIERARKI',
      headerClassName: 'py-4 px-6 min-w-[240px] text-xs font-bold uppercase tracking-wider text-slate-700',
      className: 'py-4 px-6 whitespace-nowrap',
      render: (cat) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${cat.parent_id ? 'bg-amber-500' : 'bg-indigo-600'}`} />
            <span className="font-bold text-slate-900 text-sm">{cat.name}</span>
          </div>
          {cat.parent && (
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1 pl-4.5">
              <span>{cat.parent.name}</span>
              <ChevronRight size={10} />
              <span className="text-indigo-600 font-semibold">{cat.name}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'STORE URL / SLUG',
      headerClassName: 'py-4 px-6 min-w-[200px] text-xs font-bold uppercase tracking-wider text-slate-700',
      className: 'py-4 px-6 whitespace-nowrap',
      render: (cat) => (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono text-xs border border-slate-200">
          <Globe size={12} className="text-slate-400" />
          <span>/{cat.slug || '-'}</span>
        </div>
      ),
    },
    {
      header: 'LEVEL TINGKAT',
      headerClassName: 'py-4 px-6 text-center text-xs font-bold uppercase tracking-wider text-slate-700',
      className: 'py-4 px-6 text-center whitespace-nowrap',
      render: (cat) => (
        cat.parent_id ? (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            Sub-Kategori
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Kategori Utama (Root)
          </span>
        )
      ),
    },
    {
      header: 'STATUS',
      headerClassName: 'py-4 px-6 text-center text-xs font-bold uppercase tracking-wider text-slate-700',
      className: 'py-4 px-6 text-center whitespace-nowrap',
      render: (cat) =>
        cat.is_active ? (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Aktif
          </span>
        ) : (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            Nonaktif
          </span>
        ),
    },
    {
      header: 'AKSI',
      headerClassName: 'py-4 px-6 text-right w-24 text-xs font-bold uppercase tracking-wider text-slate-700',
      className: 'py-4 px-6 text-right whitespace-nowrap',
      render: (cat) => (
        <div className="flex items-center justify-end gap-1.5">
          {canEdit && (
            <>
              <button
                type="button"
                onClick={() => handleOpenEdit(cat)}
                title="Edit Kategori"
                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition cursor-pointer border border-slate-200 bg-white"
              >
                <Edit3 size={15} />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(cat)}
                title="Hapus Kategori"
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer border border-slate-200 bg-white"
              >
                <Trash2 size={15} />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Boxes size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Master Kategori Bertingkat</h2>
          </div>
          <p className="text-sm text-slate-500 mt-1 pl-11">
            Atur hierarki kategori dan sub-kategori serta URL Slug untuk etalase Web Store.
          </p>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition cursor-pointer shadow-xs shrink-0"
          >
            <Plus size={16} />
            <span>Tambah Kategori</span>
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={categories || []}
        isLoading={isLoading}
        keyExtractor={(c) => String(c.id)}
        emptyMessage="Belum ada kategori yang terdaftar."
        searchQuery={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Cari nama, slug, atau deskripsi kategori..."
        onRefresh={() => {
          fetchCategories();
          fetchAllForDropdown();
        }}
        showResetFilter={Boolean(search || statusFilter !== 'ALL')}
        onResetFilter={() => {
          setSearch('');
          setStatusFilter('ALL');
          setPage(1);
        }}
        page={page}
        limit={limit}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Layers size={18} className="text-indigo-600" />
                <span>{editingCat ? 'Edit Kategori Bertingkat' : 'Tambah Kategori Baru'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Nama Kategori <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pakaian Pria, Kaos Polos, Minuman Dingin"
                  value={formName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  URL Slug (Untuk Link Web Store) <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2.5 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-xs text-slate-500 font-mono">
                    /category/
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="pakaian-pria"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-r-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Kategori Induk (Parent Category)
                </label>
                <select
                  value={formParentId}
                  onChange={(e) => setFormParentId(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 bg-white"
                >
                  <option value="">-- Root Category (No Parent) --</option>
                  {allCategoriesList
                    .filter((c) => !editingCat || c.id !== editingCat.id)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.slug})
                      </option>
                    ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Kosongkan jika ini adalah kategori induk level 1 (misal: "Pakaian"). Pilih induk jika ini sub-kategori (misal: "Kaos").
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Keterangan / Deskripsi
                </label>
                <textarea
                  rows={2}
                  placeholder="Deskripsi singkat untuk SEO / etalase toko..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 resize-none"
                />
              </div>

              {editingCat && (
                <div>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formActive}
                      onChange={(e) => setFormActive(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-800">Status Aktif</span>
                  </label>
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
