import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { apiService } from '../../services/api';
import { authService } from '../../services/auth';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Harap isi username dan password');
      return;
    }

    setLoading(true);
    try {
      const res = await apiService.login(username.trim(), password);
      authService.setAuth(res.access_token, res.username);
      navigate('/admin/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Terjadi kesalahan saat masuk');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header without logos */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-block mb-4 group">
          <span className="font-extrabold text-3xl tracking-tight text-charcoal-900">
            Geo<span className="text-orange-600">Residence</span>
          </span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-charcoal-900">
          Masuk Administrator
        </h2>
        <p className="mt-1 text-xs text-charcoal-500 font-medium">
          Portal manajemen data spasial mahasiswa Teknik Geomatika ITERA
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-cream-50 py-8 px-6 shadow-card border border-cream-300 rounded-3xl sm:px-10">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 text-xs leading-relaxed animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-2">
                Username Administrator
              </label>
              <div className="relative rounded-2xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="block w-full pl-10 pr-4 py-3 rounded-2xl bg-cream-100 border border-cream-200 focus:border-orange-500 focus:bg-white text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-2">
                Kata Sandi
              </label>
              <div className="relative rounded-2xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-4 py-3 rounded-2xl bg-cream-100 border border-cream-200 focus:border-orange-500 focus:bg-white text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-full text-sm font-bold bg-orange-600 text-white hover:bg-orange-700 focus:outline-none shadow-soft transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Masuk ke Dashboard</span>
                    <ArrowRight className="w-4 h-4 text-orange-200" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-cream-200 text-center">
            <Link
              to="/"
              className="text-xs text-charcoal-500 hover:text-orange-600 font-semibold transition-colors"
            >
              ← Kembali ke Beranda Publik
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
