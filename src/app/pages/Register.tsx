import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { User, Mail, Lock, Github, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export function Register() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Password dan konfirmasi password tidak cocok');
      return;
    }

    if (formData.password.length < 8) {
      setErrorMessage('Password minimal 8 karakter');
      return;
    }

    try {
      // Map 'name' to 'full_name' for API
      await register({
        full_name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'user' // Default role, bisa diubah untuk seller
      });

      setSuccessMessage('Registrasi berhasil! Mengalihkan ke dashboard...');

      // Redirect based on role (assuming user for now)
      setTimeout(() => {
        navigate('/dashboard/user');
      }, 1500);

    } catch (error: any) {
      // Handle different types of errors
      if (error.message.includes('Validation failed')) {
        // Express-validator errors
        const validationErrors = error.response?.data?.errors;
        if (validationErrors && validationErrors.length > 0) {
          setErrorMessage(validationErrors.map((err: any) => err.msg).join(', '));
        } else {
          setErrorMessage('Data yang dimasukkan tidak valid');
        }
      } else {
        setErrorMessage(error.message || 'Registrasi gagal. Silakan coba lagi.');
      }
    }
  };

  const handleSocialRegister = (provider: string) => {
    // Implement social login if needed
    navigate('/dashboard/user');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2 mb-4">
               <img
                src="/logo.png"
                alt="Logo Grafenda"
                className="w-10 h-10 object-contain"
              />
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent">
                Grafenda
              </span>
            </Link>
            <p className="text-slate-600 mt-2">Mari Bergabung Bersama Kami</p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 text-sm">{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-green-700 text-sm">{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Nama Lengkap"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="nama@email.com"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                required
                disabled={isLoading}
              />
              <span className="ml-2 text-sm text-slate-600">
                Saya menyetujui <a href="#" className="text-blue-600 hover:text-blue-700">Syarat & Ketentuan</a> dan{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700">Kebijakan Privasi</a>
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 text-white py-3 rounded-lg hover:opacity-90 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Mendaftarkan...
                </>
              ) : (
                'Daftar'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Ingin jadi freelancer?{' '}
              <Link to="/register-seller" className="text-blue-600 hover:text-blue-700 font-medium">
                Daftar sebagai Freelancer
              </Link>
            </p>
            <p className="text-sm text-slate-600 mt-2">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Masuk
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
