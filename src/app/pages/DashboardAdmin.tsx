import { Link, useNavigate } from "react-router";
import { useState } from "react";
import {
  Users,
  UserCheck,
  Package,
  DollarSign,
  FileText,
  CheckCircle,
  BarChart3,
  Home,
  LogOut,
  TrendingUp,
  ShoppingCart,
  Star,
} from "lucide-react";

export function DashboardAdmin() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');

  const sidebarMenus = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'users', icon: Users, label: 'Kelola User' },
    { id: 'sellers', icon: UserCheck, label: 'Kelola Freelancer' },
    { id: 'transactions', icon: DollarSign, label: 'Transaksi' },
    { id: 'verification', icon: CheckCircle, label: 'Verifikasi Pembayaran' },
  ];

  const usersData = [
    { id: 1, name: 'Rina Wijaya', email: 'rina.wijaya@email.com', joinDate: '15 Jan 2026', orders: 12, status: 'Active' },
    { id: 2, name: 'Budi Santoso', email: 'budi.santoso@email.com', joinDate: '20 Jan 2026', orders: 8, status: 'Active' },
    { id: 3, name: 'Ahmad Fauzi', email: 'ahmad.fauzi@email.com', joinDate: '10 Feb 2026', orders: 5, status: 'Active' },
    { id: 4, name: 'Siti Nurhaliza', email: 'siti.nur@email.com', joinDate: '25 Feb 2026', orders: 15, status: 'Suspended' },
    { id: 5, name: 'Dian Permata', email: 'dian.permata@email.com', joinDate: '01 Mar 2026', orders: 3, status: 'Active' },
  ];

  const sellersData = [
    { id: 1, name: 'Design Studio', email: 'design.studio@email.com', joinDate: '10 Jan 2026', services: 3, orders: 45, rating: 4.9, status: 'Verified' },
    { id: 2, name: 'Creative Media', email: 'creative.media@email.com', joinDate: '15 Jan 2026', services: 2, orders: 32, rating: 5.0, status: 'Verified' },
    { id: 3, name: 'WordCraft', email: 'wordcraft@email.com', joinDate: '20 Jan 2026', services: 4, orders: 28, rating: 4.8, status: 'Verified' },
    { id: 4, name: 'Video Pro', email: 'video.pro@email.com', joinDate: '25 Jan 2026', services: 2, orders: 18, rating: 4.7, status: 'Pending' },
    { id: 5, name: 'Art Works', email: 'artworks@email.com', joinDate: '01 Feb 2026', services: 5, orders: 50, rating: 4.9, status: 'Verified' },
  ];

  const transactionsData = [
    { id: 1, orderId: 'GRF-2026-04-010', buyer: 'Rina Wijaya', seller: 'Design Studio', service: 'Desain Logo', amount: 150000, fee: 15000, status: 'Completed', date: '18 Apr 2026' },
    { id: 2, orderId: 'GRF-2026-04-009', buyer: 'Budi Santoso', seller: 'Creative Media', service: 'Video Editing', amount: 200000, fee: 20000, status: 'Processing', date: '17 Apr 2026' },
    { id: 3, orderId: 'GRF-2026-04-008', buyer: 'Ahmad Fauzi', seller: 'WordCraft', service: 'Copywriting', amount: 100000, fee: 10000, status: 'Completed', date: '16 Apr 2026' },
  ];

  const stats = [
    { icon: Users, label: "Total User", value: "1,234", change: "+12%", color: "from-blue-500 to-blue-600" },
    { icon: UserCheck, label: "Total Freelancer", value: "456", change: "+8%", color: "from-green-500 to-green-600" },
    { icon: ShoppingCart, label: "Total Transaksi", value: "2,891", change: "+23%", color: "from-purple-500 to-purple-600" },
    { icon: DollarSign, label: "Pendapatan", value: "Rp 45jt", change: "+18%", color: "from-yellow-500 to-yellow-600" },
  ];

  const pendingVerifications = [
    {
      id: 1,
      orderId: "GRF-2026-04-006",
      buyer: "Rina Wijaya",
      seller: "Design Studio",
      amount: "Rp 225.000",
      paymentProof: "bukti_bayar_001.jpg",
      date: "18 Apr 2026, 14:30",
    },
    {
      id: 2,
      orderId: "GRF-2026-04-007",
      buyer: "Budi Santoso",
      seller: "Creative Media",
      amount: "Rp 200.000",
      paymentProof: "bukti_bayar_002.jpg",
      date: "18 Apr 2026, 15:15",
    },
  ];

  const recentTransactions = [
    {
      id: 1,
      orderId: "GRF-2026-04-005",
      buyer: "Ahmad Fauzi",
      seller: "WordCraft",
      service: "Copywriting",
      amount: "Rp 100.000",
      status: "Selesai",
      date: "17 Apr 2026",
    },
    {
      id: 2,
      orderId: "GRF-2026-04-004",
      buyer: "Siti Nurhaliza",
      seller: "Design Pro",
      service: "Desain Logo",
      amount: "Rp 150.000",
      status: "Dalam Proses",
      date: "16 Apr 2026",
    },
  ];

  const handleLogout = () => {
    navigate('/');
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return (
          <>
            {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-2xl p-6 cursor-default
                          border border-slate-100 shadow-sm
                          hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 
                          transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-lg shadow-inner`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                
                <p className="text-sm text-slate-500 mb-1 font-medium tracking-tight">{stat.label}</p>
                
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-bold text-slate-800 tracking-tight">{stat.value}</p>
                  <span className="text-green-600 text-[11px] font-bold bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">
                    {stat.change}
                  </span>
                </div>
              </div>
            ))}
          </div>

            {/* Pending Verifications */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Verifikasi Pembayaran Pending</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Order ID</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Buyer</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Seller</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Jumlah</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Tanggal</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingVerifications.map((item) => (
                      <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-4 px-4 text-sm font-medium text-slate-800">{item.orderId}</td>
                        <td className="py-4 px-4 text-sm text-slate-600">{item.buyer}</td>
                        <td className="py-4 px-4 text-sm text-slate-600">{item.seller}</td>
                        <td className="py-4 px-4 text-sm font-semibold text-slate-800">{item.amount}</td>
                        <td className="py-4 px-4 text-sm text-slate-600">{item.date}</td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            <button className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                              Verifikasi
                            </button>
                            <button className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
                              Tolak
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Transaksi Terbaru</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Order ID</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Buyer</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Seller</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Jasa</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Jumlah</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((txn) => (
                      <tr key={txn.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-4 px-4 text-sm font-medium text-slate-800">{txn.orderId}</td>
                        <td className="py-4 px-4 text-sm text-slate-600">{txn.buyer}</td>
                        <td className="py-4 px-4 text-sm text-slate-600">{txn.seller}</td>
                        <td className="py-4 px-4 text-sm text-slate-600">{txn.service}</td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            txn.status === 'Selesai' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {txn.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm font-semibold text-slate-800">{txn.amount}</td>
                        <td className="py-4 px-4 text-sm text-slate-600">{txn.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );

      case 'users':
        return (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Kelola User</h2>
              <p className="text-slate-600">{usersData.length} total users</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Nama</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Bergabung</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Total Order</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {usersData.map((user) => (
                    <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-4 px-4 text-sm font-medium text-slate-800">{user.name}</td>
                      <td className="py-4 px-4 text-sm text-slate-600">{user.email}</td>
                      <td className="py-4 px-4 text-sm text-slate-600">{user.joinDate}</td>
                      <td className="py-4 px-4 text-sm text-slate-600">{user.orders}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700">
                            Detail
                          </button>
                          {user.status === 'Active' ? (
                            <button className="px-3 py-1 bg-yellow-600 text-white rounded-lg text-xs hover:bg-yellow-700">
                              Suspend
                            </button>
                          ) : (
                            <button className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700">
                              Activate
                            </button>
                          )}
                          <button className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'sellers':
        return (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Kelola Freelancer</h2>
              <p className="text-slate-600">{sellersData.length} total freelancers</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Nama</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Bergabung</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Jasa</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Orders</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Rating</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {sellersData.map((seller) => (
                    <tr key={seller.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-4 px-4 text-sm font-medium text-slate-800">{seller.name}</td>
                      <td className="py-4 px-4 text-sm text-slate-600">{seller.email}</td>
                      <td className="py-4 px-4 text-sm text-slate-600">{seller.joinDate}</td>
                      <td className="py-4 px-4 text-sm text-slate-600">{seller.services}</td>
                      <td className="py-4 px-4 text-sm text-slate-600">{seller.orders}</td>
                      <td className="py-4 px-4 text-sm text-slate-600 flex items-center">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                        {seller.rating}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          seller.status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {seller.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700">
                            Detail
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'transactions':
      return (
        <div className="space-y-8">
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { label: "Total Transaksi", value: "2,891", change: "+15% bulan ini", trend: "up" },
              { label: "Volume Transaksi", value: "Rp 145jt", change: "+23% bulan ini", trend: "up" },
              { label: "Fee Platform", value: "Rp 14.5jt", change: "10% dari volume", trend: "neutral" },
              { label: "Rata-rata Transaksi", value: "Rp 175K", change: "Per order", trend: "neutral" },
            ].map((item, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-2xl p-6 cursor-default
                          border border-slate-100 shadow-sm
                          hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 
                          transition-all duration-300 transform hover:-translate-y-2"
              >
                <p className="text-sm text-slate-500 mb-2 font-medium">{item.label}</p>
                <p className="text-3xl font-bold text-slate-800 tracking-tight">{item.value}</p>
                <p className={`text-xs mt-3 font-bold px-2 py-1 rounded-full inline-block ${
                  item.trend === 'up' ? 'text-green-600 bg-green-50' : 'text-slate-500 bg-slate-50'
                }`}>
                  {item.change}
                </p>
              </div>
            ))}
          </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Riwayat Transaksi</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Order ID</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Buyer</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Seller</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Jasa</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Jumlah</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Fee</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactionsData.map((txn) => (
                      <tr key={txn.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-4 px-4 text-sm font-medium text-slate-800">{txn.orderId}</td>
                        <td className="py-4 px-4 text-sm text-slate-600">{txn.buyer}</td>
                        <td className="py-4 px-4 text-sm text-slate-600">{txn.seller}</td>
                        <td className="py-4 px-4 text-sm text-slate-600">{txn.service}</td>
                        <td className="py-4 px-4 text-sm font-semibold text-slate-800">Rp {txn.amount.toLocaleString('id-ID')}</td>
                        <td className="py-4 px-4 text-sm text-green-600">Rp {txn.fee.toLocaleString('id-ID')}</td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            txn.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {txn.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-600">{txn.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'verification':
        return (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Verifikasi Pembayaran</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Order ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Buyer</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Seller</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Jumlah</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Bukti Bayar</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Tanggal</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingVerifications.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-4 px-4 text-sm font-medium text-slate-800">{item.orderId}</td>
                      <td className="py-4 px-4 text-sm text-slate-600">{item.buyer}</td>
                      <td className="py-4 px-4 text-sm text-slate-600">{item.seller}</td>
                      <td className="py-4 px-4 text-sm font-semibold text-slate-800">{item.amount}</td>
                      <td className="py-4 px-4 text-sm text-blue-600 hover:underline cursor-pointer">{item.paymentProof}</td>
                      <td className="py-4 px-4 text-sm text-slate-600">{item.date}</td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <button className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                            Verifikasi
                          </button>
                          <button className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
                            Tolak
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 fixed h-full">
        <div className="p-6 border-b border-slate-200">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">G</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              Grafenda
            </span>
          </Link>
          <p className="text-sm text-slate-600 mt-2">Admin Panel</p>
        </div>

        <nav className="p-3 space-y-1">
        {sidebarMenus.map((menu) => (
          <button
            key={menu.id}
            onClick={() => setActiveMenu(menu.id)}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
              activeMenu === menu.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
            }`}
          >
            <menu.icon className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
              activeMenu === menu.id ? 'text-white' : 'group-hover:scale-110'
            }`} />
            <span className={`text-[13px] font-medium leading-tight whitespace-nowrap overflow-hidden ${
              menu.label.length > 18 ? 'tracking-tighter' : 'tracking-tight'
            }`}>
              {menu.label}
            </span>
          </button>
        ))}
      </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            {sidebarMenus.find(m => m.id === activeMenu)?.label}
          </h1>
          <p className="text-slate-600 mt-2">Kelola platform Grafenda dengan mudah</p>
        </div>

        {renderContent()}
      </div>
    </div>
  );
}
