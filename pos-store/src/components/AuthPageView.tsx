import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  Lock, 
  User, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  Store,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface AuthPageViewProps {
  initialMode?: 'login' | 'signup';
  onLoginSuccess?: (user: { name: string; phone: string; email?: string }) => void;
}

export const AuthPageView: React.FC<AuthPageViewProps> = ({ 
  initialMode = 'login',
  onLoginSuccess 
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Mode tab: login atau signup (bisa ditentukan dari URL /login atau /signup)
  const isSignupRoute = location.pathname === '/signup' || initialMode === 'signup';
  const [isSignup, setIsSignup] = useState<boolean>(isSignupRoute);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Switch tab login / signup
  const handleSwitchTab = (signupMode: boolean) => {
    setIsSignup(signupMode);
    setErrorMsg(null);
    navigate(signupMode ? '/signup' : '/login', { replace: true });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validasi Nomor HP (Mandatory)
    const cleanPhone = phoneNumber.replace(/[-\s]/g, '');
    if (!cleanPhone) {
      setErrorMsg('Nomor WhatsApp / HP wajib diisi!');
      return;
    }

    if (!cleanPhone.match(/^(08|628|\+628)[0-9]{8,12}$/)) {
      setErrorMsg('Format nomor HP tidak valid! Gunakan awalan 08 atau 62 (contoh: 081234567890).');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Kata sandi minimal 6 karakter.');
      return;
    }

    if (isSignup && !fullName.trim()) {
      setErrorMsg('Nama lengkap wajib diisi untuk pendaftaran akun.');
      return;
    }

    // Simulasi Login / Register Sukses
    const userData = {
      name: isSignup ? fullName.trim() : 'Pelanggan Setia',
      phone: cleanPhone,
      email: email.trim() || undefined
    };

    localStorage.setItem('serba35k_user', JSON.stringify(userData));

    if (onLoginSuccess) {
      onLoginSuccess(userData);
    }

    // Arahkan kembali ke halaman utama atau keranjang
    navigate('/');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 w-full animate-fadeIn">
      {/* Tombol Kembali */}
      <div className="mb-6">
        <button 
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-orange-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-xs transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </button>
      </div>

      {/* Auth Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md mx-auto mb-3">
            35K
          </div>
          <h1 className="text-xl font-black text-slate-900">
            {isSignup ? 'Daftar Akun Baru' : 'Masuk ke Akun Toko'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isSignup 
              ? 'Belanja lebih cepat & lacak pesanan toko fisik Anda.' 
              : 'Gunakan nomor WhatsApp Anda untuk masuk.'}
          </p>
        </div>

        {/* Tab Toggle: Masuk vs Daftar */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => handleSwitchTab(false)}
            className={`py-2 text-xs font-extrabold rounded-xl transition ${
              !isSignup 
                ? 'bg-white text-slate-900 shadow-xs' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => handleSwitchTab(true)}
            className={`py-2 text-xs font-extrabold rounded-xl transition ${
              isSignup 
                ? 'bg-white text-slate-900 shadow-xs' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Daftar Baru
          </button>
        </div>

        {/* Error Notification Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Input Nama (Hanya saat Signup) */}
          {isSignup && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full text-xs px-3.5 py-3 pl-10 bg-slate-50 rounded-xl border border-slate-200 focus:border-orange-500 focus:bg-white outline-none transition"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>
          )}

          {/* Input Nomor HP / WhatsApp (MANDATORY) */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Nomor WhatsApp / HP <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-orange-600 font-semibold bg-orange-50 px-2 py-0.5 rounded-full">
                Wajib (Mandatory)
              </span>
            </div>
            <div className="relative">
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full text-xs px-3.5 py-3 pl-10 bg-slate-50 rounded-xl border border-slate-200 focus:border-orange-500 focus:bg-white outline-none transition font-medium"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Digunakan untuk verifikasi pesanan & konfirmasi kasir toko.
            </p>
          </div>

          {/* Input Email (OPTIONAL) */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Alamat Email
              </label>
              <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                Opsional
              </span>
            </div>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com (bisa dikosongkan)"
                className="w-full text-xs px-3.5 py-3 pl-10 bg-slate-50 rounded-xl border border-slate-200 focus:border-orange-500 focus:bg-white outline-none transition"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Input Password */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Kata Sandi <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full text-xs px-3.5 py-3 pl-10 pr-10 bg-slate-50 rounded-xl border border-slate-200 focus:border-orange-500 focus:bg-white outline-none transition"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 px-4 rounded-xl text-xs sm:text-sm shadow-md shadow-orange-600/20 active:scale-98 transition mt-2"
          >
            {isSignup ? 'Daftar Sekarang' : 'Masuk Sekarang'}
          </button>
        </form>

        {/* Benefit Footer Info */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-around text-center text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Data Aman</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5 text-orange-600" />
            <span>Toko Resmi 35K</span>
          </div>
        </div>

      </div>
    </div>
  );
};