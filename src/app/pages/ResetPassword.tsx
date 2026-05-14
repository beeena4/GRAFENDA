import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Lock, AlertCircle } from "lucide-react";
import { authAPI } from "../../services/api";

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage('');
    setErrorMessage('');

    if (!token) {
      setErrorMessage('Token reset password tidak ditemukan. Buka tautan dari email Anda lagi.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Password baru dan konfirmasi password harus sama.');
      return;
    }

    try {
      setIsLoading(true);
      const response = await authAPI.resetPassword({ token, new_password: newPassword });
      setStatusMessage(response || 'Password berhasil diubah. Silakan masuk kembali.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Gagal mengubah password. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Reset Password</h2>
            <p className="text-slate-600 mt-2">Masukkan password baru Anda untuk menyelesaikan proses reset.</p>
          </div>

          {statusMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-green-700 text-sm">{statusMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 text-sm">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password Baru</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Konfirmasi Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 text-white py-3 rounded-lg hover:opacity-90 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Proses...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Kembali ke halaman login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
