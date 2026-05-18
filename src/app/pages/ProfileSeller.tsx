import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import {
  User, Mail, Phone, MapPin, Edit, Save, ShoppingCart,
  Star, DollarSign, Package, FileText, ArrowLeft, Palette, Plus, X
} from "lucide-react";
import { authAPI, dashboardAPI, profileAPI } from "../../services/api";

const API_BASE_URL = (import.meta.env.VITE_API_URL as string)?.replace(/\/api$/, '') || 'http://localhost:3000';

export function ProfileSeller() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'settings'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',   // disimpan di seller_profiles
    skills: '',     // disimpan di seller_profiles
    portfolio: '',  // disimpan di seller_profiles
    bio: '',        // disimpan di seller_profiles
    avatar: '',
  });

  const [stats, setStats] = useState([
    { label: "Total Order", value: "0", icon: ShoppingCart },
    { label: "Rating", value: "0.0", icon: Star },
    { label: "Pendapatan", value: "Rp 0", icon: DollarSign },
    { label: "Jasa Aktif", value: "0", icon: Package },
  ]);

  const [orders, setOrders] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  const [artStyles, setArtStyles] = useState<any[]>([]);
  const [showAddStyle, setShowAddStyle] = useState(false);
  const [newStyle, setNewStyle] = useState({ title: '', description: '', project_url: '', file: null as File | null });
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await authAPI.getProfile();

        // user.seller_profile berisi data dari tabel seller_profiles
        const sp = user.seller_profile || {};

        setProfile({
          name: user.full_name || '',
          email: user.email || '',
          phone: user.phone || '',
          location: sp.location || '',       // dari seller_profiles
          skills: sp.skills || '',           // dari seller_profiles
          portfolio: sp.portfolio_url || '', // dari seller_profiles
          bio: sp.bio || '',                 // dari seller_profiles
          avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'S')}`,
        });
        setAvatarPreview(user.avatar ? (user.avatar.startsWith('/') ? `${API_BASE_URL}${user.avatar}` : user.avatar) : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'S')}`);

        if (user.id) {
          const portfolioResponse = await profileAPI.getSellerPortfolio(user.id);
          const portfolioItems = (portfolioResponse.portfolios || []).map((item: any) => ({
            id: item.id,
            name: item.title,
            image: item.image_url?.startsWith('/') ? `${API_BASE_URL}${item.image_url}` : item.image_url,
            description: item.description,
            project_url: item.project_url
          }));
          setArtStyles(portfolioItems);
        }

        const dashboard = await dashboardAPI.getSellerDashboard();
        const s = dashboard.stats || {};

        setStats([
          { label: "Total Order", value: String(s.total_orders || 0), icon: ShoppingCart },
          { label: "Rating", value: s.rating ? Number(s.rating).toFixed(1) : '0.0', icon: Star },
          { label: "Pendapatan", value: `Rp ${Number(s.total_earnings || 0).toLocaleString('id-ID')}`, icon: DollarSign },
          { label: "Jasa Aktif", value: String((dashboard.services || []).length), icon: Package },
        ]);

        setOrders(dashboard.active_orders || []);
        setServices(dashboard.services || []);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setErrorMsg('');

      let updatedUser: any;
      if (avatarFile) {
        const formData = new FormData();
        formData.append('full_name', profile.name);
        formData.append('phone', profile.phone || '');
        formData.append('avatar', avatarFile);
        updatedUser = await authAPI.updateProfile(formData);
      } else {
        updatedUser = await authAPI.updateProfile({
          full_name: profile.name,
          phone: profile.phone || null,
        });
      }

      await authAPI.updateSellerProfile({
        location: profile.location || null,
        skills: profile.skills || null,
        portfolio_url: profile.portfolio || null,
        bio: profile.bio || null,
      });

      if (updatedUser?.avatar) {
        setProfile((prev) => ({ ...prev, avatar: updatedUser.avatar }));
      }

      setIsEditing(false);
      setAvatarFile(null);
      setSuccessMsg('Profil berhasil disimpan!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      const msg = err.response?.data?.message || 'Gagal menyimpan profil';
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setSaving(false);
    }
  };

  const handleAddStyle = async () => {
    try {
      setUploadError('');
      setUploadSuccess('');

      if (!newStyle.title || !newStyle.file) {
        setUploadError('Judul dan foto portofolio wajib diisi.');
        return;
      }

      const formData = new FormData();
      formData.append('title', newStyle.title);
      formData.append('description', newStyle.description || '');
      if (newStyle.project_url) {
        formData.append('project_url', newStyle.project_url);
      }
      formData.append('portfolio', newStyle.file);

      const response = await profileAPI.addSellerPortfolio(formData);
      const createdPortfolios = (response.portfolios || []).map((item: any) => ({
        id: item.id,
        name: item.title,
        image: item.image_url?.startsWith('/') ? `${API_BASE_URL}${item.image_url}` : item.image_url,
        description: item.description,
        project_url: item.project_url
      }));

      setArtStyles([createdPortfolios[0], ...artStyles]);
      setNewStyle({ title: '', description: '', project_url: '', file: null });
      setPreviewUrl('');
      setShowAddStyle(false);
      setUploadSuccess('Foto portofolio berhasil diunggah.');
      setTimeout(() => setUploadSuccess(''), 3000);
    } catch (err: any) {
      console.error('Upload portofolio gagal:', err);
      const msg = err.response?.data?.message || 'Gagal mengunggah portofolio';
      setUploadError(msg);
      setTimeout(() => setUploadError(''), 4000);
    }
  };

  const handleRemoveStyle = async (id: number) => {
    try {
      await profileAPI.deleteSellerPortfolio(id);
      setArtStyles(artStyles.filter(style => style.id !== id));
    } catch (err: any) {
      console.error('Hapus portofolio gagal:', err);
    }
  };

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(profile.avatar ? (profile.avatar.startsWith('/') ? `${API_BASE_URL}${profile.avatar}` : profile.avatar) : '');
    }
  }, [profile.avatar, avatarFile]);

  useEffect(() => {
    return () => {
      if (avatarPreview && avatarFile) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview, avatarFile]);

  const profileAvatar = avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'S')}`;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAvatarFile(file);
    if (file) {
      const preview = URL.createObjectURL(file);
      setAvatarPreview(preview);
    } else {
      setAvatarPreview(profile.avatar ? (profile.avatar.startsWith('/') ? `${API_BASE_URL}${profile.avatar}` : profile.avatar) : '');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-500">Memuat profil...</p>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-4 gap-6">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:border-blue-500 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <stat.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-slate-800 mb-1">{stat.value}</p>
                  <p className="text-sm text-slate-600">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 rounded-xl p-6">
              <h3 className="font-bold text-slate-800 mb-4">Informasi Profil</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-600">Nama</p>
                    <p className="font-medium text-slate-800">{profile.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-600">Email</p>
                    <p className="font-medium text-slate-800">{profile.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-600">Nomor Telepon</p>
                    <p className="font-medium text-slate-800">{profile.phone || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-600">Lokasi</p>
                    <p className="font-medium text-slate-800">{profile.location || '-'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Package className="w-5 h-5 text-slate-400 mt-1" />
                  <div>
                    <p className="text-sm text-slate-600">Keahlian</p>
                    <p className="font-medium text-slate-800">{profile.skills || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-600">Portofolio</p>
                    {profile.portfolio ? (
                      <a href={profile.portfolio} className="font-medium text-blue-600 hover:text-blue-700">{profile.portfolio}</a>
                    ) : (
                      <p className="font-medium text-slate-800">-</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-6">
              <h3 className="font-bold text-slate-800 mb-4">Jasa yang Ditawarkan</h3>
              <div className="space-y-4">
                {services.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-4">Belum ada jasa</p>
                ) : (
                  services.map((service) => (
                    <div key={service.id} className="bg-white rounded-xl p-4 border border-slate-200 hover:shadow-md hover:border-blue-500 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-slate-800 mb-2">{service.title}</h4>
                          <div className="flex items-center space-x-4 text-sm text-slate-600 mb-2">
                            <span className="flex items-center">
                              <ShoppingCart className="w-4 h-4 mr-1" />
                              {service.total_orders || 0} order
                            </span>
                            <span className="flex items-center">
                              <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                              {service.rating ? Number(service.rating).toFixed(1) : '0.0'}
                            </span>
                          </div>
                          <p className="text-blue-600 font-semibold">Rp {Number(service.price).toLocaleString('id-ID')}</p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Aktif</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 flex items-center">
                  <Palette className="w-5 h-5 mr-2 text-blue-600" />
                  Portofolio Art Style
                </h3>
                <button onClick={() => setShowAddStyle(true)} className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                  <Plus className="w-4 h-4" />
                  <span>Tambah</span>
                </button>
              </div>

              {showAddStyle && (
                <div className="bg-white rounded-xl p-4 mb-4 border-2 border-blue-200">
                  <h4 className="font-semibold text-slate-800 mb-3">Tambah Portofolio Art Style</h4>
                  <div className="space-y-3">
                    <input type="text" value={newStyle.title} onChange={(e) => setNewStyle({ ...newStyle, title: e.target.value })} placeholder="Judul portofolio" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    <textarea value={newStyle.description} onChange={(e) => setNewStyle({ ...newStyle, description: e.target.value })} placeholder="Deskripsi singkat (opsional)" rows={3} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
                    <input type="url" value={newStyle.project_url} onChange={(e) => setNewStyle({ ...newStyle, project_url: e.target.value })} placeholder="Link proyek atau portofolio (opsional)" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Pilih foto</label>
                      <input type="file" accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setNewStyle({ ...newStyle, file });
                        setPreviewUrl(file ? URL.createObjectURL(file) : '');
                      }} className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-600 file:text-white file:font-semibold hover:file:bg-blue-700" />
                      <p className="text-xs text-slate-500 mt-2">Hanya file gambar (jpg, png, gif). Maks 5MB.</p>
                    </div>
                    {previewUrl && (
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <img src={previewUrl} alt="Preview portofolio" className="w-full h-48 object-cover" />
                      </div>
                    )}
                    {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
                    {uploadSuccess && <p className="text-sm text-green-600">{uploadSuccess}</p>}
                    <div className="flex space-x-2">
                      <button onClick={handleAddStyle} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Simpan</button>
                      <button onClick={() => { setShowAddStyle(false); setNewStyle({ title: '', description: '', project_url: '', file: null }); setPreviewUrl(''); setUploadError(''); }} className="px-4 py-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300">Batal</button>
                    </div>
                  </div>
                </div>
              )}

              {artStyles.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                  <p className="font-medium text-slate-700 mb-2">Belum ada portofolio art style</p>
                  <p className="text-sm">Tambahkan foto portofolio untuk menampilkan gaya karya Anda.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-4">
                  {artStyles.map((style) => (
                    <div key={style.id} className="relative group transition-all duration-300 hover:-translate-y-1">
                      <div className="aspect-square rounded-xl overflow-hidden border-2 border-slate-200 hover:border-blue-500 transition-colors">
                        <img src={style.image} alt={style.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-xl flex items-end p-4">
                        <div>
                          <p className="text-white font-semibold">{style.name}</p>
                          {style.description && <p className="text-xs text-slate-100/90 mt-1">{style.description}</p>}
                        </div>
                      </div>
                      <button onClick={() => handleRemoveStyle(style.id)} className="absolute top-3 right-3 w-9 h-9 bg-red-600 text-white rounded-full flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity shadow-lg">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'orders':
        return (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <p className="text-slate-400 text-center py-12">Belum ada order</p>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-slate-50 rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 border border-slate-200 hover:border-blue-500 hover:shadow-md">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">GRF-{String(order.id).padStart(6, '0')}</p>
                      <h3 className="font-bold text-slate-800 mb-1">{order.title}</h3>
                      <p className="text-sm text-slate-600">Buyer: {order.buyer_name}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">{order.status}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-slate-600">Deadline: {order.delivery_days} hari</span>
                      <span className="font-bold text-blue-600">Rp {Number(order.price).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Link to={`/chat/${order.id}`} className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm">Chat Buyer</Link>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">Upload Hasil</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case 'settings':
        return (
          <div className="bg-slate-50 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800">Edit Profil</h3>
              <button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                <span>{saving ? 'Menyimpan...' : isEditing ? 'Simpan' : 'Edit'}</span>
              </button>
            </div>

            {successMsg && (
              <div className="mb-4 px-4 py-3 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                ✅ {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                ❌ {errorMsg}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Foto Profil</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={!isEditing}
                  className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-600 file:text-white file:font-semibold hover:file:bg-blue-700"
                />
                <p className="text-xs text-slate-500 mt-2">Unggah foto profil baru untuk mengganti gambar saat ini.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nama</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-slate-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg outline-none bg-slate-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nomor Telepon</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-slate-100"
                />
              </div>
              {/* Lokasi — disimpan ke seller_profiles */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Lokasi</label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Contoh: Jakarta, Indonesia"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-slate-100"
                />
              </div>
              {/* Bio — disimpan ke seller_profiles */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  disabled={!isEditing}
                  rows={3}
                  placeholder="Ceritakan tentang diri Anda..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-slate-100 resize-none"
                />
              </div>
              {/* Keahlian — disimpan ke seller_profiles */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Keahlian</label>
                <textarea
                  value={profile.skills}
                  onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                  disabled={!isEditing}
                  rows={3}
                  placeholder="Contoh: Logo Design, UI/UX, Ilustrasi"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-slate-100 resize-none"
                />
              </div>
              {/* Portofolio — disimpan ke seller_profiles */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Link Portofolio</label>
                <input
                  type="url"
                  value={profile.portfolio}
                  onChange={(e) => setProfile({ ...profile, portfolio: e.target.value })}
                  disabled={!isEditing}
                  placeholder="https://portfolio.anda.com"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-slate-100"
                />
              </div>
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
        <button onClick={() => navigate('/dashboard/seller')} className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali ke Dashboard</span>
        </button>

        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6 transition-all duration-300 hover:shadow-md">
          <div className="flex items-center space-x-6">
            <img src={profileAvatar} alt={profile.name} className="w-24 h-24 rounded-full border-4 border-blue-100 object-cover" />
            <div>
              <h1 className="text-3xl font-bold text-slate-800">{profile.name}</h1>
              <p className="text-slate-600 mt-1">{profile.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-slate-800">{stats[1].value}</span>
                <span className="text-slate-500">rating</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm mb-6">
          <div className="border-b border-slate-200">
            <div className="flex">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'orders', label: 'My Orders' },
                { id: 'settings', label: 'Settings' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-4 px-6 text-center transition-colors ${activeTab === tab.id ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-slate-600 hover:text-slate-800'}`}
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