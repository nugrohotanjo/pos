import React from 'react';
import { DollarSign, CreditCard, Package, AlertTriangle } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subtext: string;
  icon: React.ElementType;
  alert?: boolean;
  trend?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtext, icon: Icon, alert, trend }) => (
  <div className={`p-5 rounded-xl border bg-white shadow-sm flex flex-col justify-between ${
    alert ? 'border-amber-200 bg-amber-50/50' : 'border-slate-200'
  }`}>
    <div className="flex items-center justify-between text-slate-500 mb-4">
      <span className="text-xs font-semibold uppercase">{title}</span>
      <Icon className={`w-5 h-5 ${alert ? 'text-amber-600' : 'text-slate-500'}`} />
    </div>
    <h3 className={`text-2xl font-bold ${alert ? 'text-amber-700' : 'text-slate-800'}`}>{value}</h3>
    <p className={`text-xs mt-2 ${alert ? 'text-amber-600' : trend ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
      {subtext}
    </p>
  </div>
);

export const DashboardView: React.FC = () => {
  return (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-bold text-slate-800">Ringkasan Operasional (Toko Serba 35rb)</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <MetricCard 
          title="Pendapatan Hari Ini"
          value="Rp 4.550.000"
          subtext="+12.4% dari kemarin (130 Item)"
          trend="+12.4%"
          icon={DollarSign}
        />
        <MetricCard 
          title="Net Settlement Bank"
          value="Rp 4.518.150"
          subtext="Dipotong MDR QRIS (0.7%)"
          icon={CreditCard}
        />
        <MetricCard 
          title="Stok Menipis"
          value="3 Barang"
          subtext="Sisa stok di bawah 10 pcs"
          icon={Package}
        />
        <MetricCard 
          title="Selisih Laci Kasir"
          value="- Rp 35.000"
          subtext="Tercatat pada Shift Pagi"
          alert={true}
          icon={AlertTriangle}
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-bold text-slate-800 text-sm mb-4">Transaksi Terakhir (Real-time)</h3>
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-400 uppercase font-semibold border-b border-slate-100">
            <tr>
              <th className="py-3 px-4">Waktu</th>
              <th className="py-3 px-4">No. Resi</th>
              <th className="py-3 px-4">Kasir</th>
              <th className="py-3 px-4">Total Qty</th>
              <th className="py-3 px-4">Total Bayar</th>
              <th className="py-3 px-4">Metode</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr className="hover:bg-slate-50">
              <td className="py-3 px-4">10:42 WIB</td>
              <td className="py-3 px-4 font-mono text-indigo-600">TRX-001</td>
              <td className="py-3 px-4">Budi</td>
              <td className="py-3 px-4">2 Pcs</td>
              <td className="py-3 px-4 font-bold">Rp 70.000</td>
              <td className="py-3 px-4">Tunai</td>
            </tr>
            <tr className="hover:bg-slate-50">
              <td className="py-3 px-4">10:35 WIB</td>
              <td className="py-3 px-4 font-mono text-indigo-600">TRX-002</td>
              <td className="py-3 px-4">Budi</td>
              <td className="py-3 px-4">1 Pcs</td>
              <td className="py-3 px-4 font-bold">Rp 35.000</td>
              <td className="py-3 px-4">QRIS</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};