import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { User, Mail, Phone, MapPin, Edit, Save, ShoppingCart, Star, DollarSign, Package, FileText, ArrowLeft, Palette, Plus, X } from "lucide-react";

export function ProfileSeller() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'settings'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Design Studio',
    email: 'design.studio@email.com',
    phone: '+62 812-9876-5432',
    location: 'Bandung, Indonesia',
    skills: 'Logo Design, Brand Identity, UI/UX Design',
    portfolio: 'https://portfolio.design-studio.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
  });

  const [artStyles, setArtStyles] = useState([
    { id: 1, name: 'Minimalist', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
    { id: 2, name: 'Modern', image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400' },
    { id: 3, name: 'Vintage', image: 'https://images.unsplash.com/photo-1509395176047-4a66953fd231?w=400' },
  ]);

  const [showAddStyle, setShowAddStyle] = useState(false);
  const [newStyle, setNewStyle] = useState({ name: '', image: '' });

  const handleAddStyle = () => {
    if (newStyle.name && newStyle.image) {
      setArtStyles([...artStyles, { id: artStyles.length + 1, ...newStyle }]);
      setNewStyle({ name: '', image: '' });
      setShowAddStyle(false);
    }
  };

  const handleRemoveStyle = (id: number) => {
    setArtStyles(artStyles.filter(style => style.id !== id));
  };

  const orders = [
    {
      id: 1,
      orderId: "GRF-2026-04-005",
      service: "Desain Logo Premium",
      buyer: "PT Maju Jaya",
      status: "Dalam Proses",
      statusColor: "bg-blue-100 text-blue-700",
      deadline: "20 Apr 2026",
      amount: "Rp 400.000",
    },
    {
      id: 2,
      orderId: "GRF-2026-04-004",
      service: "Desain Logo Standard",
      buyer: "Rina Wijaya",
      status: "Selesai",
      statusColor: "bg-green-100 text-green-700",
      deadline: "18 Apr 2026",
      amount: "Rp 250.000",
    },
  ];

  const stats = [
    { label: "Total Order", value: "45", icon: ShoppingCart },
    { label: "Rating", value: "4.9", icon: Star },
    { label: "Pendapatan", value: "Rp 12jt", icon: DollarSign },
    { label: "Jasa Aktif", value: "3", icon: Package },
  ];

  const services = [
    {
      id: 1,
      title: "Desain Logo Profesional",
      orders: 45,
      rating: 4.9,
      price: "Mulai dari Rp 150.000",
      status: "Aktif",
    },
    {
      id: 2,
      title: "Brand Identity Package",
      orders: 12,
      rating: 5.0,
      price: "Mulai dari Rp 500.000",
      status: "Aktif",
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-4 gap-6">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-slate-50 rounded-xl p-6">
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
                    <p className="font-medium text-slate-800">{profile.phone}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-600">Lokasi</p>
                    <p className="font-medium text-slate-800">{profile.location}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Package className="w-5 h-5 text-slate-400 mt-1" />
                  <div>
                    <p className="text-sm text-slate-600">Keahlian</p>
                    <p className="font-medium text-slate-800">{profile.skills}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-600">Portofolio</p>
                    <a href={profile.portfolio} className="font-medium text-blue-600 hover:text-blue-700">
                      {profile.portfolio}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-6">
              <h3 className="font-bold text-slate-800 mb-4">Jasa yang Ditawarkan</h3>
              <div className="space-y-4">
                {services.map((service) => (
                  <div key={service.id} className="bg-white rounded-xl p-4 border border-slate-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-slate-800 mb-2">{service.title}</h4>
                        <div className="flex items-center space-x-4 text-sm text-slate-600 mb-2">
                          <span className="flex items-center">
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            {service.orders} order
                          </span>
                          <span className="flex items-center">
                            <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                            {service.rating}
                          </span>
                        </div>
                        <p className="text-blue-600 font-semibold">{service.price}</p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        {service.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Art Styles Portfolio */}
            <div className="bg-slate-50 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 flex items-center">
                  <Palette className="w-5 h-5 mr-2 text-blue-600" />
                  Portofolio Art Style
                </h3>
                {isEditing && (
                  <button
                    onClick={() => setShowAddStyle(true)}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah</span>
                  </button>
                )}
              </div>

              {showAddStyle && (
                <div className="bg-white rounded-xl p-4 mb-4 border-2 border-blue-200">
                  <h4 className="font-semibold text-slate-800 mb-3">Tambah Art Style Baru</h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newStyle.name}
                      onChange={(e) => setNewStyle({ ...newStyle, name: e.target.value })}
                      placeholder="Nama Style (e.g., Minimalist, Modern)"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <input
                      type="url"
                      value={newStyle.image}
                      onChange={(e) => setNewStyle({ ...newStyle, image: e.target.value })}
                      placeholder="URL Gambar Portfolio"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={handleAddStyle}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Simpan
                      </button>
                      <button
                        onClick={() => {
                          setShowAddStyle(false);
                          setNewStyle({ name: '', image: '' });
                        }}
                        className="px-4 py-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-3 gap-4">
                {artStyles.map((style) => (
                  <div key={style.id} className="relative group">
                    <div className="aspect-square rounded-xl overflow-hidden border-2 border-slate-200 hover:border-blue-500 transition-colors">
                      <img
                        src={style.image}
                        alt={style.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-xl flex items-end p-4">
                      <p className="text-white font-semibold">{style.name}</p>
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveStyle(style.id)}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'orders':
        return (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-slate-50 rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">{order.orderId}</p>
                    <h3 className="font-bold text-slate-800 mb-1">{order.service}</h3>
                    <p className="text-sm text-slate-600">Buyer: {order.buyer}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.statusColor}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-slate-600">Deadline: {order.deadline}</span>
                    <span className="font-bold text-blue-600">{order.amount}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/chat/${order.id}`}
                      className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                    >
                      Chat Buyer
                    </Link>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                      Upload Hasil
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'settings':
        return (
          <div className="bg-slate-50 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800">Edit Profil</h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                <span>{isEditing ? 'Simpan' : 'Edit'}</span>
              </button>
            </div>

            <div className="space-y-4">
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
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-slate-100"
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

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Lokasi</label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Keahlian</label>
                <textarea
                  value={profile.skills}
                  onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                  disabled={!isEditing}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Link Portofolio</label>
                <input
                  type="url"
                  value={profile.portfolio}
                  onChange={(e) => setProfile({ ...profile, portfolio: e.target.value })}
                  disabled={!isEditing}
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
        <button
          onClick={() => navigate('/dashboard/seller')}
          className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali ke Dashboard</span>
        </button>

        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <div className="flex items-center space-x-6">
            <img src={profile.avatar} alt={profile.name} className="w-24 h-24 rounded-full border-4 border-blue-100" />
            <div>
              <h1 className="text-3xl font-bold text-slate-800">{profile.name}</h1>
              <p className="text-slate-600 mt-1">{profile.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-slate-800">4.9</span>
                <span className="text-slate-500">(250 ulasan)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
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
                  className={`flex-1 py-4 px-6 text-center transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-600 text-blue-600 font-medium'
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
