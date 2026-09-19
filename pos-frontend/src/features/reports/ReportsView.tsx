import React, { useState } from 'react';
import { 
  Receipt, 
  ShieldAlert, 
  Download, 
  Filter, 
  DollarSign, 
  CreditCard, 
  Coins,
  ArrowDownCircle,
  ArrowUpCircle,
  Percent
} from 'lucide-react';
import type { TransactionRecord, AuditLog, PettyCashEntry, PaymentMethod } from '../../types';

interface ReportsViewProps {
  transactions: TransactionRecord[];
  auditLogs: AuditLog[];
  pettyCashRecords: PettyCashEntry[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ 
  transactions, 
  auditLogs, 
  pettyCashRecords 
}) => {
  const [activeTab, setActiveTab] = useState<'sales' | 'petty' | 'audit'>('sales');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | PaymentMethod>('ALL');

  const filteredTransactions = transactions.filter(t => 
    paymentFilter === 'ALL' || t.paymentMethod === paymentFilter
  );

  // Kalkulasi Finansial dengan MDR
  const totalGross = filteredTransactions.reduce((acc, curr) => acc + curr.grossAmount, 0);
  const totalMdrFee = filteredTransactions.reduce((acc, curr) => acc + curr.mdrFee, 0);
  const totalNetSettlement = filteredTransactions.reduce((acc, curr) => acc + curr.netSettlement, 0);
  const totalItemsSold = filteredTransactions.reduce((acc, curr) => acc + curr.totalQty, 0);

  // Kalkulasi Petty Cash
  const totalCashIn = pettyCashRecords
    .filter(r => r.type === 'IN')
    .reduce((sum, r) => sum + r.amount, 0);
  const totalCashOut = pettyCashRecords
    .filter(r => r.type === 'OUT')
    .reduce((sum, r) => sum + r.amount, 0);
  const netPettyCash = totalCashIn - totalCashOut;

  return (
    <div className="p-8 h-full flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Laporan Keuangan & Rekonsiliasi Bank</h2>
          <p className="text-xs text-slate-500 mt-1">Audit settlement penjualan, biaya MDR perbankan, dan pengeluaran kas kecil</p>
        </div>
        <button 
          onClick={() => alert('Fitur Export CSV/Excel akan terhubung ke API backend')}
          className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors"
        >
          <Download className="w-4 h-4" /> Export Data
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('sales')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'sales' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Receipt className="w-4 h-4" /> Settlement Penjualan & MDR
        </button>

        <button
          onClick={() => setActiveTab('petty')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'petty' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Coins className="w-4 h-4" /> Kas Operasional Laci (Petty Cash)
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'audit' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> Log Otorisasi Supervisor
        </button>
      </div>

      {/* TAB 1: TRANSAKSI DENGAN MDR REKONSILIASI */}
      {activeTab === 'sales' && (
        <div className="space-y-4 flex-1 flex flex-col">
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase">Omzet Kotor (Gross)</span>
              <div className="flex items-center gap-2 mt-2">
                <DollarSign className="w-5 h-5 text-slate-700" />
                <h3 className="text-xl font-bold text-slate-800">Rp {totalGross.toLocaleString('id-ID')}</h3>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">{totalItemsSold} Pcs Terjual</p>
            </div>

            <div className="p-4 bg-white border border-rose-100 bg-rose-50/20 rounded-xl shadow-sm">
              <span className="text-xs font-semibold text-rose-500 uppercase">Biaya MDR Bank</span>
              <div className="flex items-center gap-2 mt-2">
                <Percent className="w-5 h-5 text-rose-600" />
                <h3 className="text-xl font-bold text-rose-600">-Rp {totalMdrFee.toLocaleString('id-ID')}</h3>
              </div>
              <p className="text-[11px] text-rose-400 mt-1">Potongan QRIS 0.7% & EDC 1.5%</p>
            </div>

            <div className="p-4 bg-white border border-emerald-200 bg-emerald-50/20 rounded-xl shadow-sm">
              <span className="text-xs font-semibold text-emerald-700 uppercase">Net Cair ke Bank</span>
              <div className="flex items-center gap-2 mt-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <h3 className="text-xl font-bold text-emerald-700">Rp {totalNetSettlement.toLocaleString('id-ID')}</h3>
              </div>
              <p className="text-[11px] text-emerald-600 mt-1">Uang Bersih Diterima</p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase">Total Struk Kasir</span>
              <div className="flex items-center gap-2 mt-2">
                <Receipt className="w-5 h-5 text-indigo-600" />
                <h3 className="text-xl font-bold text-slate-800">{filteredTransactions.length} Struk</h3>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Shift Aktif</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-500">Filter Metode:</span>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value as any)}
                  className="px-2.5 py-1 text-xs border border-slate-300 rounded-md bg-white focus:outline-none"
                >
                  <option value="ALL">Semua Metode</option>
                  <option value="CASH">Tunai (MDR 0%)</option>
                  <option value="QRIS">QRIS (MDR 0.7%)</option>
                  <option value="EDC">Debit / EDC (MDR 1.5%)</option>
                </select>
              </div>
              <span className="text-xs text-slate-400 font-medium">Rekonsiliasi otomatis per struk</span>
            </div>

            <div className="overflow-y-auto flex-1">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-white text-slate-400 sticky top-0 border-b border-slate-200 text-xs uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-6">Waktu & Resi</th>
                    <th className="py-3 px-6">Kasir</th>
                    <th className="py-3 px-6">Ringkasan Item</th>
                    <th className="py-3 px-6 text-center">Metode</th>
                    <th className="py-3 px-6 text-right">Total Kotor</th>
                    <th className="py-3 px-6 text-right">Biaya MDR</th>
                    <th className="py-3 px-6 text-right">Net Cair</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50">
                      <td className="py-3 px-6">
                        <span className="font-mono font-bold text-indigo-600 block">{tx.receiptNumber}</span>
                        <span className="text-xs text-slate-400 font-mono">{tx.timestamp}</span>
                      </td>
                      <td className="py-3 px-6 text-slate-800 font-medium">{tx.cashierName}</td>
                      <td className="py-3 px-6 text-xs text-slate-500 max-w-xs truncate">{tx.itemsSummary}</td>
                      <td className="py-3 px-6 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          tx.paymentMethod === 'CASH' 
                            ? 'bg-slate-100 text-slate-700' 
                            : tx.paymentMethod === 'QRIS' 
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {tx.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-right font-medium text-slate-700">
                        Rp {tx.grossAmount.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-6 text-right font-mono text-xs text-rose-600">
                        {tx.mdrFee > 0 ? `-Rp ${tx.mdrFee.toLocaleString('id-ID')}` : 'Rp 0'}
                      </td>
                      <td className="py-3 px-6 text-right font-bold text-slate-900 font-mono">
                        Rp {tx.netSettlement.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-slate-400">
                        Tidak ada transaksi pada filter ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PETTY CASH */}
      {activeTab === 'petty' && (
        <div className="space-y-4 flex-1 flex flex-col">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase">Total Kas Masuk (In)</span>
              <div className="flex items-center gap-2 mt-2">
                <ArrowDownCircle className="w-5 h-5 text-emerald-600" />
                <h3 className="text-xl font-bold text-emerald-600">+Rp {totalCashIn.toLocaleString('id-ID')}</h3>
              </div>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase">Total Pengeluaran Laci (Out)</span>
              <div className="flex items-center gap-2 mt-2">
                <ArrowUpCircle className="w-5 h-5 text-rose-600" />
                <h3 className="text-xl font-bold text-rose-600">-Rp {totalCashOut.toLocaleString('id-ID')}</h3>
              </div>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase">Net Perubahan Kas Fisik</span>
              <div className="flex items-center gap-2 mt-2">
                <Coins className="w-5 h-5 text-indigo-600" />
                <h3 className={`text-xl font-bold ${netPettyCash >= 0 ? 'text-slate-800' : 'text-rose-600'}`}>
                  {netPettyCash >= 0 ? '+' : ''}Rp {netPettyCash.toLocaleString('id-ID')}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Log Mutasi Kas Kasir
              </span>
              <span className="text-xs text-slate-400">{pettyCashRecords.length} Mutasi Tercatat</span>
            </div>

            <div className="overflow-y-auto flex-1">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-white text-slate-400 sticky top-0 border-b border-slate-200 text-xs uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-6">ID & Waktu</th>
                    <th className="py-3 px-6">Petugas Kasir</th>
                    <th className="py-3 px-6">Tipe Aliran</th>
                    <th className="py-3 px-6 text-right">Nominal</th>
                    <th className="py-3 px-6">Keperluan / Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pettyCashRecords.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-4 px-6">
                        <span className="font-mono text-xs text-indigo-600 font-semibold block">{p.id}</span>
                        <span className="text-xs text-slate-400 font-mono">{p.timestamp}</span>
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-800">{p.cashierName}</td>
                      <td className="py-4 px-6">
                        {p.type === 'IN' ? (
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-semibold inline-flex items-center gap-1">
                            <ArrowDownCircle className="w-3.5 h-3.5" /> Kas Masuk
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded text-xs font-semibold inline-flex items-center gap-1">
                            <ArrowUpCircle className="w-3.5 h-3.5" /> Kas Keluar
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-bold text-base">
                        <span className={p.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}>
                          {p.type === 'IN' ? '+' : '-'}Rp {p.amount.toLocaleString('id-ID')}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-700">{p.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Log Aktivitas Risiko Tinggi (Otorisasi PIN)
            </span>
          </div>
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-white text-slate-400 sticky top-0 border-b border-slate-200 text-xs uppercase font-semibold">
                <tr>
                  <th className="py-3 px-6">Waktu</th>
                  <th className="py-3 px-6">Pelaku / Otorisator</th>
                  <th className="py-3 px-6">Jenis Aksi</th>
                  <th className="py-3 px-6">Detail Alasan</th>
                  <th className="py-3 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-3 px-6 text-xs font-mono text-slate-400">{log.timestamp}</td>
                    <td className="py-3 px-6 font-semibold text-slate-800">{log.actor}</td>
                    <td className="py-3 px-6">
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-xs font-semibold font-mono">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-xs text-slate-600">{log.details}</td>
                    <td className="py-3 px-6 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};