import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { User, Mail, Phone, MapPin, Edit, Save, ShoppingCart, Star, Clock, ArrowLeft } from "lucide-react";

export function ProfileUser() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'settings'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Rina Wijaya',
    email: 'rina.wijaya@email.com',
    phone: '+62 812-3456-7890',
    location: 'Jakarta, Indonesia',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
  });

  const orders = [
    {
      id: 1,
      orderId: "GRF-2026-04-001",
      service: "Desain Logo Profesional",
      seller: "Design Studio",
      status: "Selesai",
      statusColor: "bg-green-100 text-green-700",
      amount: "Rp 225.000",
      date: "18 Apr 2026",
      canReview: true,
    },
    {
      id: 2,
      orderId: "GRF-2026-04-002",
      service: "Video Editing YouTube",
      seller: "Creative Media",
      status: "Dalam Proses",
      statusColor: "bg-blue-100 text-blue-700",
      amount: "Rp 200.000",
      date: "17 Apr 2026",
      canReview: false,
    },
    {
      id: 3,
      orderId: "GRF-2026-04-003",
      service: "Copywriting Landing Page",
      seller: "WordCraft",
      status: "Menunggu Review",
      statusColor: "bg-yellow-100 text-yellow-700",
      amount: "Rp 100.000",
      date: "15 Apr 2026",
      canReview: true,
    },
  ];

  const stats = [
    { label: "Total Pesanan", value: "12", icon: ShoppingCart },
    { label: "Selesai", value: "8", icon: Star },
    { label: "Dalam Proses", value: "4", icon: Clock },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
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
                    <p className="text-sm text-slate-600">Nama Lengkap</p>
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
                    <p className="text-sm text-slate-600">Seller: {order.seller}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.statusColor}`}>
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
                      to={`/service/${order.id}`}
                      className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                    >
                      Detail
                    </Link>
                    {order.canReview && (
                      <Link
                        to={`/order/${order.id}/review`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
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
                <label className="block text-sm font-medium text-slate-700 mb-2">Nama Lengkap</label>
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

              {isEditing && (
                <div className="pt-4 border-t border-slate-200">
                  <h4 className="font-semibold text-slate-800 mb-3">Ubah Password</h4>
                  <div className="space-y-3">
                    <input
                      type="password"
                      placeholder="Password Lama"
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    <input
                      type="password"
                      placeholder="Password Baru"
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    <input
                      type="password"
                      placeholder="Konfirmasi Password Baru"
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              )}
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
          <span>Kembali ke Dashboard</span>
        </button>

        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <div className="flex items-center space-x-6">
            <img src={profile.avatar} alt={profile.name} className="w-24 h-24 rounded-full border-4 border-blue-100" />
            <div>
              <h1 className="text-3xl font-bold text-slate-800">{profile.name}</h1>
              <p className="text-slate-600 mt-1">{profile.email}</p>
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
