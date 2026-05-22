import { Link, useNavigate, useLocation } from "react-router";
import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Edit, Save, ShoppingCart, Star, Clock, ArrowLeft, X, AlertCircle, CheckCircle, Lock } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { authAPI, dashboardAPI, API_ASSET_URL } from "../../services/api";

interface ProfileState {
  full_name: string;
  email: string;
  phone: string;
  avatar: string;
}

const initialProfile: ProfileState = {
  full_name: '',
  email: '',
  phone: '',
  avatar: '',
};

export function ProfileUser() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateProfile, changePassword, isLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'settings'>(
    location.state?.activeTab || 'overview'
  );

  const [profile, setProfile] = useState<ProfileState>(initialProfile);
  const [draftProfile, setDraftProfile] = useState<ProfileState>(initialProfile);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState([
    { label: "Total Pesanan", value: "0", icon: ShoppingCart },
    { label: "Selesai", value: "0", icon: Star },
    { label: "Dalam Proses", value: "0", icon: Clock },
  ]);

const normalizeAvatarUrl = (avatar: string) => {
  if (!avatar) return '';
  if (avatar.startsWith('http') || avatar.startsWith('blob:')) return avatar;
  if (avatar.startsWith('/')) return `${API_ASSET_URL}${avatar}`;
  return avatar;
};

const profileAvatar = avatarPreview
  ? normalizeAvatarUrl(avatarPreview)
  : profile.avatar
  ? normalizeAvatarUrl(profile.avatar)
  : 'https://via.placeholder.com/150?text=Avatar';
  const profileName = profile.full_name || 'Pengguna';
  const profileEmail = profile.email || 'Email tidak tersedia';

  // Password change state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Load profile data on component mount
  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(profile.avatar || '');
    }
  }, [profile.avatar, avatarFile]);

  useEffect(() => {
    return () => {
      if (avatarPreview && avatarFile) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview, avatarFile]);

  const formatOrderStatus = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Selesai';
      case 'pending':
        return 'Menunggu Review';
      case 'paid':
      case 'process':
      case 'revision':
        return 'Dalam Proses';
      default:
        return status;
    }
  };

  const loadProfile = async () => {
    try {
      setIsLoadingProfile(true);

      const [profileData, dashboardData] = await Promise.all([
        authAPI.getProfile(),
        dashboardAPI.getBuyerDashboard(),
      ]);

      const normalizedProfile = {
        full_name: profileData?.full_name || '',
        email: profileData?.email || '',
        phone: profileData?.phone || '',
        avatar: profileData?.avatar || '',
      };

      setProfile(normalizedProfile);
      setDraftProfile(normalizedProfile);

      const dashboardStats = dashboardData?.stats || {};
      setStats([
        { label: 'Total Pesanan', value: String(dashboardStats.total_orders || 0), icon: ShoppingCart },
        { label: 'Menunggu Review', value: String(dashboardStats.pending_review || 0), icon: Star },
        { label: 'Order Aktif', value: String(dashboardStats.active_orders || 0), icon: Clock },
      ]);

      const mappedOrders = (dashboardData?.recent_orders || []).map((order: any) => ({
        id: order.id,
        orderId: `GRF-${String(order.id).padStart(6, '0')}`,
        service: order.service_title || 'Pesanan',
        seller: order.seller_name || '',
        status: formatOrderStatus(order.status),
        date: order.created_at ? new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
        amount: order.price ? `Rp ${Number(order.price).toLocaleString('id-ID')}` : '-',
      }));

      setOrders(mappedOrders);
    } catch (error: any) {
      setErrorMessage('Gagal memuat profil: ' + error.message);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setDraftProfile({ ...draftProfile, avatar: file.name });
    }
  };

  const handleSaveProfile = async () => {
    try {
      setErrorMessage('');
      setSuccessMessage('');

      let updatedProfile: any;
      if (avatarFile) {
        const formData = new FormData();
        formData.append('full_name', draftProfile.full_name || '');
        formData.append('phone', draftProfile.phone || '');
        formData.append('avatar', avatarFile);

        updatedProfile = await updateProfile(formData);
      } else {
        updatedProfile = await updateProfile(draftProfile);
      }

      if (updatedProfile) {
        setProfile({
          ...profile,
          ...updatedProfile,
          avatar: updatedProfile.avatar || avatarPreview || profile.avatar,
        });
        setDraftProfile({
          ...draftProfile,
          ...updatedProfile,
          avatar: updatedProfile.avatar || avatarPreview || profile.avatar,
        });
      } else {
        setProfile({ ...draftProfile, avatar: avatarPreview || profile.avatar });
      }

      setAvatarFile(null);
      setIsEditing(false);
      setSuccessMessage('Profil berhasil diperbarui');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setErrorMessage(error.message || 'Gagal memperbarui profil');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('Password baru dan konfirmasi tidak cocok');
      return;
    }

    if (passwordData.new_password.length < 8) {
      setPasswordError('Password baru minimal 8 karakter');
      return;
    }

    try {
      await changePassword(passwordData.current_password, passwordData.new_password);
      setPasswordSuccess('Password berhasil diubah');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (error: any) {
      setPasswordError(error.message || 'Gagal mengubah password');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setDraftProfile(profile);
    setErrorMessage('');
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      handleSaveProfile();
    } else {
      setDraftProfile(profile);
      setIsEditing(true);
    }
  };


  const getBadgeColor = (status: string) => {
    if (status === "Selesai") return "bg-green-100 text-green-700";
    if (status === "Menunggu Review") return "bg-yellow-100 text-yellow-700";
    return "bg-blue-100 text-blue-700";
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {stats.map((stat, idx) => (
                <div 
                  key={idx} 
                  className="bg-slate-50 rounded-xl p-6 border border-slate-200 shadow-sm hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <stat.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-slate-800 mb-1">{stat.value}</p>
                  <p className="text-sm text-slate-600">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Kotak Informasi Profil */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800">Informasi Profil</h3>
              </div>

              {/* Error/Success Messages */}
              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className="text-red-700 text-sm">{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-green-700 text-sm">{successMessage}</span>
                </div>
              )}

              {isLoadingProfile ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-slate-600">Memuat profil...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-slate-400" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-600">Nama Lengkap</p>
                      {isEditing ? (
                        <input
                          type="text"
                          value={draftProfile.full_name}
                          onChange={(e) => setDraftProfile({ ...draftProfile, full_name: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          disabled={isLoading}
                        />
                      ) : (
                        <p className="font-medium text-slate-800">{profile.full_name || 'Belum diisi'}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-slate-400" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-600">Email</p>
                      <p className="font-medium text-slate-800">{profile.email}</p>
                      <p className="text-xs text-slate-500">Email tidak dapat diubah</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-slate-400" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-600">Nomor Telepon</p>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={draftProfile.phone || ''}
                          onChange={(e) => setDraftProfile({ ...draftProfile, phone: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          placeholder="+62 xxx-xxxx-xxxx"
                          disabled={isLoading}
                        />
                      ) : (
                        <p className="font-medium text-slate-800">{profile.phone || 'Belum diisi'}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {isEditing && (
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                    disabled={isLoading}
                  >
                    Batal
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'orders':
        return (
          <div className="space-y-4">
            {orders.map((order) => (
              <div 
                key={order.id} 
                className="bg-slate-50 rounded-xl p-6 border border-slate-100 hover:border-blue-300 hover:shadow-md hover:bg-white transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">{order.orderId}</p>
                    <h3 className="font-bold text-slate-800 mb-1">{order.service}</h3>
                    <p className="text-sm text-slate-600">Seller: {order.seller}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getBadgeColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-slate-600">{order.date}</span>
                    <span className="font-bold text-blue-600">{order.amount}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/order-detail/${order.id}`}
                      className="px-4 py-2 bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 rounded-lg transition-colors text-sm"
                    >
                      Detail
                    </Link>
                    
                    {(order.status === "Selesai" || order.status === "Menunggu Review") && (
                      <Link
                        to={`/order/${order.id}/review`}
                        state={{ from: 'profile-orders' }}   
                        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm shadow-sm"
                      >
                        Beri Review
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            {/* Profile Edit Section */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800">Edit Profil</h3>
                <button
                  onClick={handleToggleEdit}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
                >
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Simpan</span>
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </>
                  )}
                </button>
              </div>

              {/* Error/Success Messages */}
              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className="text-red-700 text-sm">{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-green-700 text-sm">{successMessage}</span>
                </div>
              )}

              {isLoadingProfile ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-slate-600">Memuat profil...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row items-center gap-4 rounded-xl border border-slate-200 p-4 bg-white">
                    <div className="flex-shrink-0">
                      <div className="relative w-24 h-24 rounded-full overflow-hidden border border-slate-200 bg-slate-100">
                        <img
                          src={profileAvatar}
                          alt="Foto Profil"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Avatar';
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-sm text-slate-600">Foto Profil</p>
                      {isEditing ? (
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="w-full text-sm text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                          disabled={isLoading}
                        />
                      ) : (
                        <p className="text-sm text-slate-500">Klik Edit untuk mengubah foto profil</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-slate-400" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-600">Nama Lengkap</p>
                      {isEditing ? (
                        <input
                          type="text"
                          value={draftProfile.full_name}
                          onChange={(e) => setDraftProfile({ ...draftProfile, full_name: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          disabled={isLoading}
                        />
                      ) : (
                        <p className="font-medium text-slate-800">{profile.full_name || 'Belum diisi'}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-slate-400" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-600">Email</p>
                      <p className="font-medium text-slate-800">{profile.email}</p>
                      <p className="text-xs text-slate-500">Email tidak dapat diubah</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-slate-400" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-600">Nomor Telepon</p>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={draftProfile.phone || ''}
                          onChange={(e) => setDraftProfile({ ...draftProfile, phone: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          placeholder="+62 xxx-xxxx-xxxx"
                          disabled={isLoading}
                        />
                      ) : (
                        <p className="font-medium text-slate-800">{profile.phone || 'Belum diisi'}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {isEditing && (
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                    disabled={isLoading}
                  >
                    Batal
                  </button>
                </div>
              )}
            </div>

            {/* Change Password Section */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4">Ubah Password</h3>

              {/* Password Error/Success Messages */}
              {passwordError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className="text-red-700 text-sm">{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-green-700 text-sm">{passwordSuccess}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Password Lama</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Masukkan password lama"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Password Baru</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Minimal 8 karakter"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Konfirmasi Password Baru</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Ulangi password baru"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 text-white py-3 rounded-lg hover:opacity-90 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Mengubah Password...
                    </>
                  ) : (
                    'Ubah Password'
                  )}
                </button>
              </form>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/dashboard/user')}
          className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali</span>
        </button>

        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <div className="flex items-center space-x-6">
            <img 
              src={profileAvatar} 
              alt={profileName} 
              className="w-24 h-24 rounded-full border-4 border-blue-100 object-cover" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Avatar';
              }}
            />
            <div>
              <h1 className="text-3xl font-bold text-slate-800">{profileName}</h1>
              <p className="text-slate-600 mt-1">{profileEmail}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm mb-6">
          <div className="border-b border-slate-200">
            <div className="flex relative"> 
              
              {/* INDIKATOR GESER */}
              <div 
                className="absolute bottom-0 h-0.5 bg-blue-600 transition-all duration-300 ease-in-out"
                style={{ 
                  width: user?.role === 'admin' ? '100%' : '33.33%',
                  left:
                    user?.role === 'admin'
                      ? '0%'
                      : activeTab === 'overview'
                        ? '0%'
                        : activeTab === 'orders'
                          ? '33.33%'
                          : '66.66%'
                }}
              />
              
              {[

                ...(user?.role === 'admin'
                  ? [{ id: 'settings', label: 'Settings' }]
                  : [
                      { id: 'overview', label: 'Overview' },
                      { id: 'orders', label: 'My Orders' },
                      { id: 'settings', label: 'Settings' },
                    ]),
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-4 px-6 text-center transition-colors relative z-10 ${
                    activeTab === tab.id
                      ? 'text-blue-600 font-medium'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
}