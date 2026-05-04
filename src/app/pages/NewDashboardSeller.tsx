import { Link, useNavigate } from "react-router";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  DollarSign,
  MessageCircle,
  User,
  Settings,
  LogOut,
  TrendingUp,
  Clock,
  Repeat,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Upload,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";

export function NewDashboardSeller() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'orders' | 'services' | 'earnings'>('orders');
  const [activeMenu, setActiveMenu] = useState('dashboard');

  const stats = [
    {
      label: 'Total Pendapatan',
      value: 'Rp 5.430K',
      subtext: '+Rp 850K pending',
      icon: DollarSign,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Order Aktif',
      value: '5',
      subtext: '47 selesai',
      icon: ShoppingCart,
      color: 'from-orange-500 to-orange-600',
    },
    {
      label: 'Waktu Respon',
      value: '< 2 jam',
      subtext: 'Rata-rata',
      icon: Clock,
      color: 'from-green-500 to-green-600',
    },
    {
      label: 'Repeat Order',
      value: '23',
      subtext: 'Customer',
      icon: Repeat,
      color: 'from-purple-500 to-purple-600',
    },
  ];

  const activeOrders = [
    {
      id: 1,
      title: 'Desain Logo Profesional',
      buyer: 'Rina Marlina',
      date: '2026-04-18',
      deadline: '2026-04-20',
      amount: 'Rp 150.000',
      status: 'Menunggu Konfirmasi',
      statusColor: 'bg-yellow-100 text-yellow-700',
      actions: ['accept', 'reject'],
    },
    {
      id: 2,
      title: 'Video Editing Youtube',
      buyer: 'Andi Wijaya',
      date: '2026-04-17',
      deadline: '2026-04-22',
      amount: 'Rp 200.000',
      status: 'Dalam Pengerjaan',
      statusColor: 'bg-blue-100 text-blue-700',
      actions: ['upload'],
    },
    {
      id: 3,
      title: 'Ilustrasi Digital Custom',
      buyer: 'Siti Nurhaliza',
      date: '2026-04-16',
      deadline: '2026-04-21',
      amount: 'Rp 250.000',
      status: 'Revisi',
      statusColor: 'bg-orange-100 text-orange-700',
      actions: ['revision'],
    },
  ];

  const myServices = [
    {
      id: 1,
      title: 'Desain Logo Profesional untuk Brand Anda',
      image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400',
      price: 'Rp 150K',
      orders: 45,
      rating: 4.9,
    },
    {
      id: 2,
      title: 'Desain Digital Custom Tema Apapun',
      image: 'https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=400',
      price: 'Rp 200K',
      orders: 32,
      rating: 5.0,
    },
    {
      id: 3,
      title: 'Desain & Ilustrasi Social Media Feeds (any)',
      image: 'https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=400',
      price: 'Rp 175K',
      orders: 28,
      rating: 4.8,
    },
  ];

  const earnings = [
    { date: '18 Apr 2026', description: 'Logo Design - Rina M.', amount: 150000, status: 'Completed' },
    { date: '17 Apr 2026', description: 'Video Editing - Andi W.', amount: 200000, status: 'Pending' },
    { date: '16 Apr 2026', description: 'Illustration - Siti N.', amount: 250000, status: 'Pending' },
    { date: '15 Apr 2026', description: 'Logo Design - Budi S.', amount: 150000, status: 'Completed' },
    { date: '14 Apr 2026', description: 'Social Media - Dian P.', amount: 175000, status: 'Completed' },
  ];

  const totalEarnings = earnings.reduce((sum, item) => sum + item.amount, 0);
  const completedEarnings = earnings.filter(e => e.status === 'Completed').reduce((sum, item) => sum + item.amount, 0);
  const pendingEarnings = totalEarnings - completedEarnings;

  const sidebarMenus = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'orders', icon: ShoppingCart, label: 'Manajemen Order' },
    { id: 'services', icon: Package, label: 'Pekerjaan Saya' },
    { id: 'earnings', icon: DollarSign, label: 'Pendapatan' },
    { id: 'chat', icon: MessageCircle, label: 'Chat' },
    { id: 'profile', icon: User, label: 'Profil' },
  ];

  const handleMenuClick = (menuId: string) => {
    setActiveMenu(menuId);
    if (menuId === 'orders') setActiveTab('orders');
    if (menuId === 'services') setActiveTab('services');
    if (menuId === 'earnings') setActiveTab('earnings');
    if (menuId === 'chat') navigate('/inbox');
    if (menuId === 'profile') navigate('/profile/seller');
  };

  const handleLogout = () => {
    navigate('/');
  };

  const renderContent = () => {
    if (activeMenu === 'dashboard' || activeTab === 'orders') {
      return (
        <div className="space-y-6">
          {activeOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">{order.title}</h3>
                  <p className="text-sm text-slate-600">dari {order.buyer} • {order.date}</p>
                  <p className="text-sm text-slate-500 mt-1">Deadline: {order.deadline}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.statusColor}`}>
                  {order.status}
                </span>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <span className="font-bold text-slate-800">{order.amount}</span>
                <div className="flex space-x-2">
                  {order.actions.includes('accept') && (
                    <button className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>Terima</span>
                    </button>
                  )}
                  {order.actions.includes('reject') && (
                    <button className="flex items-center space-x-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
                      <XCircle className="w-4 h-4" />
                      <span>Tolak</span>
                    </button>
                  )}
                  {order.actions.includes('upload') && (
                    <button className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                      <Upload className="w-4 h-4" />
                      <span>Upload Hasil</span>
                    </button>
                  )}
                  {order.actions.includes('revision') && (
                    <button className="flex items-center space-x-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm">
                      <Upload className="w-4 h-4" />
                      <span>Kirim Revisi</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === 'services') {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-800">Jasa Saya</h3>
            <Link to="/seller/service/add" className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              <span>Tambah Jasa</span>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {myServices.map((service) => (
              <div key={service.id} className="bg-white rounded-xl overflow-hidden border border-slate-200 hover:shadow-lg transition-shadow">
                <div className="aspect-video overflow-hidden">
                  <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-slate-800 mb-2 line-clamp-2">{service.title}</h4>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-blue-600">{service.price}</span>
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                      <span>{service.orders} orders</span>
                      <span>⭐ {service.rating}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/seller/service/${service.id}/edit`}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </Link>
                    <button className="flex items-center justify-center px-3 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === 'earnings') {
      return (
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <p className="text-blue-100 mb-2">Total Penghasilan</p>
              <p className="text-3xl font-bold">Rp {totalEarnings.toLocaleString('id-ID')}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
              <p className="text-green-100 mb-2">Saldo Tersedia</p>
              <p className="text-3xl font-bold">Rp {completedEarnings.toLocaleString('id-ID')}</p>
              <Link to="/withdraw" className="inline-block mt-3 text-sm text-green-100 hover:text-white">
                Tarik Saldo →
              </Link>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
              <p className="text-yellow-100 mb-2">Saldo Pending</p>
              <p className="text-3xl font-bold">Rp {pendingEarnings.toLocaleString('id-ID')}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Riwayat Transaksi</h3>
            <div className="space-y-3">
              {earnings.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="font-medium text-slate-800">{item.description}</p>
                    <p className="text-sm text-slate-500">{item.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800">Rp {item.amount.toLocaleString('id-ID')}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-slate-800 to-slate-900 fixed h-full">
        <div className="p-6 border-b border-slate-700">
          <Link to="/" className="flex items-center space-x-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">G</span>
            </div>
            <div>
              <span className="text-white text-xl font-bold">Grafenda</span>
              <p className="text-slate-400 text-xs">Seller Panel</p>
            </div>
          </Link>

          <div className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100"
              alt="Amanda Putri"
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">Amanda Putri</p>
              <p className="text-slate-400 text-xs">@amandaputri</p>
            </div>
            <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-slate-900">
              5
            </div>
          </div>
        </div>

        <nav className="p-4">
          {sidebarMenus.map((menu) => (
            <button
              key={menu.id}
              onClick={() => handleMenuClick(menu.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                activeMenu === menu.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <menu.icon className="w-5 h-5" />
              <span>{menu.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t border-slate-700">
          <button className="w-full flex items-center space-x-3 px-4 py-3 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors mb-2">
            <Settings className="w-5 h-5" />
            <span>Pengaturan</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard Freelancer</h1>
          <p className="text-slate-600">Kelola jasa dan order Anda dengan mudah</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl p-6 border border-slate-200">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800 mb-1">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.subtext}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        {activeMenu === 'dashboard' && (
          <div className="bg-white rounded-xl p-1 mb-6 inline-flex border border-slate-200">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-2 rounded-lg transition-colors ${
                activeTab === 'orders'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Manajemen Order
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`px-6 py-2 rounded-lg transition-colors ${
                activeTab === 'services'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Pekerjaan Saya
            </button>
            <button
              onClick={() => setActiveTab('earnings')}
              className={`px-6 py-2 rounded-lg transition-colors ${
                activeTab === 'earnings'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Pendapatan
            </button>
          </div>
        )}

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
}
