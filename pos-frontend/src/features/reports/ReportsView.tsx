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
  TrendingUp 
} from 'lucide-react';
import type { TransactionRecord, AuditLog, PettyCashEntry, PaymentMethod } from '../../types';
import { Pagination } from '../../components/ui/Pagination';
import { DateRangeFilter } from '../../components/ui/DateRangeFilter';
import { exportToCsv } from '../../utils/exportCsv';

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

  // Filter Tanggal
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination states
  const [salesPage, setSalesPage] = useState(1);
  const [salesPageSize, setSalesPageSize] = useState(10);

  const [pettyPage, setPettyPage] = useState(1);
  const [pettyPageSize, setPettyPageSize] = useState(10);

  const [auditPage, setAuditPage] = useState(1);
  const [auditPageSize, setAuditPageSize] = useState(10);

  // Helper parsing tanggal format "YYYY-MM-DD" atau "DD/MM/YYYY"
  const isDateInRange = (rawTimestamp: string) => {
    if (!startDate && !endDate) return true;

    // Ekstrak angka tanggal, bulan, tahun
    let itemDateStr = '';
    if (rawTimestamp.includes('-')) {
      itemDateStr = rawTimestamp.split(' ')[0].replace(/\//g, '-');
    } else if (rawTimestamp.includes('/')) {
      const parts = rawTimestamp.split(' ')[0].split('/');
      if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        itemDateStr = `${year}-${month}-${day}`;
      }
    }

    if (!itemDateStr) return true;

    if (startDate && itemDateStr < startDate) return false;
    if (endDate && itemDateStr > endDate) return false;
    return true;
  };

  const handleResetDate = () => {
    setStartDate('');
    setEndDate('');
    setSalesPage(1);
    setPettyPage(1);
    setAuditPage(1);
  };

  // 1. Filter Transaksi Penjualan
  const filteredTransactions = transactions.filter(t => {
    const matchPayment = paymentFilter === 'ALL' || t.paymentMethod === paymentFilter;
    const matchDate = isDateInRange(t.timestamp);
    return matchPayment && matchDate;
  });

  // 2. Filter Kas Laci
  const filteredPetty = pettyCashRecords.filter(p => isDateInRange(p.timestamp));

  // 3. Filter Audit Log
  const filteredAudit = auditLogs.filter(a => isDateInRange(a.timestamp));

  const totalGross = filteredTransactions.reduce((acc, curr) => acc + curr.grossAmount, 0);
  const totalCogs = filteredTransactions.reduce((acc, curr) => acc + (curr.totalCogs || 0), 0);
  const totalGrossProfit = filteredTransactions.reduce((acc, curr) => acc + (curr.grossProfit || 0), 0);
  const totalMdrFee = filteredTransactions.reduce((acc, curr) => acc + curr.mdrFee, 0);
  const totalNetSettlement = filteredTransactions.reduce((acc, curr) => acc + curr.netSettlement, 0);
  const totalItemsSold = filteredTransactions.reduce((acc, curr) => acc + curr.totalQty, 0);

  const profitMarginPercent = totalGross > 0 ? ((totalGrossProfit / totalGross) * 100).toFixed(1) : '0';

  const totalCashIn = filteredPetty
    .filter(r => r.type === 'IN')
    .reduce((sum, r) => sum + r.amount, 0);
  const totalCashOut = filteredPetty
    .filter(r => r.type === 'OUT')
    .reduce((sum, r) => sum + r.amount, 0);
  const netPettyCash = totalCashIn - totalCashOut;

  // Slices pagination
  const paginatedTransactions = filteredTransactions.slice((salesPage - 1) * salesPageSize, salesPage * salesPageSize);
  const paginatedPetty = filteredPetty.slice((pettyPage - 1) * pettyPageSize, pettyPage * pettyPageSize);
  const paginatedAudit = filteredAudit.slice((auditPage - 1) * auditPageSize, auditPage * auditPageSize);

  // Handler Export CSV
  const handleExportData = () => {
    const dateStr = new Date().toISOString().slice(0, 10);

    if (activeTab === 'sales') {
      const headers = [
        'No. Resi',
        'Waktu',
        'Kasir',
        'Ringkasan Item',
        'Metode Bayar',
        'Omzet Kotor (Rp)',
        'DPP (Rp)',
        'PPN 11% (Rp)',
        'HPP FIFO (Rp)',
        'Laba Kotor (Rp)',
        'Biaya MDR (Rp)',
        'Net Cair Bank (Rp)'
      ];

      const dataRows = filteredTransactions.map(t => [
        t.receiptNumber,
        t.timestamp,
        t.cashierName,
        t.itemsSummary,
        t.paymentMethod,
        t.grossAmount,
        t.totalDpp || 0,
        t.totalTax || 0,
        t.totalCogs || 0,
        t.grossProfit || 0,
        t.mdrFee,
        t.netSettlement
      ]);

      exportToCsv(`laporan-penjualan-${dateStr}.csv`, [headers, ...dataRows]);
    } else if (activeTab === 'petty') {
      const headers = ['ID Mutasi', 'Waktu', 'Kasir', 'Tipe', 'Nominal (Rp)', 'Keterangan'];
      const dataRows = filteredPetty.map(p => [
        p.id,
        p.timestamp,
        p.cashierName,
        p.type === 'IN' ? 'Kas Masuk (IN)' : 'Kas Keluar (OUT)',
        p.amount,
        p.reason
      ]);

      exportToCsv(`laporan-kas-laci-${dateStr}.csv`, [headers, ...dataRows]);
    } else {
      const headers = ['ID Audit', 'Waktu', 'Aktor', 'Aksi', 'Rincian', 'Status'];
      const dataRows = filteredAudit.map(a => [
        a.id,
        a.timestamp,
        a.actor,
        a.action,
        a.details,
        a.status
      ]);

      exportToCsv(`log-otorisasi-${dateStr}.csv`, [headers, ...dataRows]);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Laporan Keuangan & Margin Laba FIFO</h2>
          <p className="text-xs text-slate-500 mt-1">Audit settlement penjualan, HPP FIFO, margin laba kotor, dan MDR bank</p>
        </div>
        <button 
          onClick={handleExportData}
          className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors"
        >
          <Download className="w-4 h-4" /> Export CSV ({activeTab === 'sales' ? 'Penjualan' : activeTab === 'petty' ? 'Kas Laci' : 'Audit'})
        </button>
      </div>

      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('sales')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'sales' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Receipt className="w-4 h-4" /> Settlement & Laba Kotor FIFO
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

      {/* TAB 1: TRANSAKSI */}
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

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase">Total HPP (FIFO Cost)</span>
              <div className="flex items-center gap-2 mt-2">
                <CreditCard className="w-5 h-5 text-amber-600" />
                <h3 className="text-xl font-bold text-slate-800">Rp {totalCogs.toLocaleString('id-ID')}</h3>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Biaya Pokok Inventaris</p>
            </div>

            <div className="p-4 bg-white border border-emerald-200 bg-emerald-50/30 rounded-xl shadow-sm">
              <span className="text-xs font-semibold text-emerald-700 uppercase">Laba Kotor (Gross Profit)</span>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <h3 className="text-xl font-bold text-emerald-700">Rp {totalGrossProfit.toLocaleString('id-ID')}</h3>
              </div>
              <p className="text-[11px] text-emerald-600 mt-1">Margin: {profitMarginPercent}%</p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase">Net Cair ke Bank</span>
              <div className="flex items-center gap-2 mt-2">
                <Receipt className="w-5 h-5 text-indigo-600" />
                <h3 className="text-xl font-bold text-slate-800">Rp {totalNetSettlement.toLocaleString('id-ID')}</h3>
              </div>
              <p className="text-[11px] text-rose-500 mt-1">Potongan MDR: -Rp {totalMdrFee.toLocaleString('id-ID')}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-500">Metode:</span>
                  <select
                    value={paymentFilter}
                    onChange={(e) => {
                      setPaymentFilter(e.target.value as any);
                      setSalesPage(1);
                    }}
                    className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none"
                  >
                    <option value="ALL">Semua Metode</option>
                    <option value="CASH">Tunai</option>
                    <option value="QRIS">QRIS</option>
                    <option value="EDC">Debit / EDC</option>
                  </select>
                </div>

                {/* Filter Date Range */}
                <DateRangeFilter
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={(d) => {
                    setStartDate(d);
                    setSalesPage(1);
                  }}
                  onEndDateChange={(d) => {
                    setEndDate(d);
                    setSalesPage(1);
                  }}
                  onReset={handleResetDate}
                />
              </div>

              <span className="text-xs text-slate-400 font-medium">Kalkulasi Real-Time</span>
            </div>

            <div className="overflow-y-auto flex-1">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-white text-slate-400 sticky top-0 border-b border-slate-200 text-xs uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-6">No. Resi & Waktu</th>
                    <th className="py-3 px-6">Ringkasan Item</th>
                    <th className="py-3 px-6 text-center">Metode</th>
                    <th className="py-3 px-6 text-right">Penjualan Kotor</th>
                    <th className="py-3 px-6 text-right">HPP (FIFO)</th>
                    <th className="py-3 px-6 text-right">Laba Kotor</th>
                    <th className="py-3 px-6 text-right">Net Cair Bank</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50">
                      <td className="py-3 px-6">
                        <span className="font-mono font-bold text-indigo-600 block">{tx.receiptNumber}</span>
                        <span className="text-xs text-slate-400 font-mono">{tx.timestamp}</span>
                      </td>
                      <td className="py-3 px-6 text-xs text-slate-600 max-w-xs truncate">{tx.itemsSummary}</td>
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
                      <td className="py-3 px-6 text-right font-medium text-slate-800">
                        Rp {tx.grossAmount.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-6 text-right font-mono text-xs text-amber-700">
                        Rp {(tx.totalCogs || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-6 text-right font-mono font-bold text-emerald-600">
                        Rp {(tx.grossProfit || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-6 text-right font-bold text-slate-900 font-mono">
                        Rp {tx.netSettlement.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                  {paginatedTransactions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-slate-400">
                        Tidak ada catatan transaksi pada rentang tanggal ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={salesPage}
              pageSize={salesPageSize}
              totalItems={filteredTransactions.length}
              onPageChange={setSalesPage}
              onPageSizeChange={setSalesPageSize}
            />
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
            <div className="p-3 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Log Mutasi Kas ({filteredPetty.length} Mutasi)
              </span>

              <DateRangeFilter
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={(d) => {
                  setStartDate(d);
                  setPettyPage(1);
                }}
                onEndDateChange={(d) => {
                  setEndDate(d);
                  setPettyPage(1);
                }}
                onReset={handleResetDate}
              />
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
                  {paginatedPetty.map((p) => (
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
                  {paginatedPetty.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-slate-400">
                        Belum ada mutasi kas kecil pada rentang tanggal ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={pettyPage}
              pageSize={pettyPageSize}
              totalItems={filteredPetty.length}
              onPageChange={setPettyPage}
              onPageSizeChange={setPettyPageSize}
            />
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT TRAIL RINGKAS */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Log Aktivitas Risiko Tinggi (Otorisasi PIN)
            </span>

            <DateRangeFilter
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={(d) => {
                setStartDate(d);
                setAuditPage(1);
              }}
              onEndDateChange={(d) => {
                setEndDate(d);
                setAuditPage(1);
              }}
              onReset={handleResetDate}
            />
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
                {paginatedAudit.map((log) => (
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
                {paginatedAudit.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-400">
                      Tidak ada catatan audit pada rentang tanggal ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={auditPage}
            pageSize={auditPageSize}
            totalItems={filteredAudit.length}
            onPageChange={setAuditPage}
            onPageSizeChange={setAuditPageSize}
          />
        </div>
      )}
    </div>
  );
};