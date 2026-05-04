import { Link } from "react-router";
import { ShoppingCart, Clock, Star, MessageCircle, TrendingUp, Package } from "lucide-react";

export function DashboardUser() {
  const stats = [
    { icon: ShoppingCart, label: "Total Pesanan", value: "12", color: "from-blue-500 to-blue-600" },
    { icon: Clock, label: "Menunggu Review", value: "3", color: "from-yellow-500 to-yellow-600" },
    { icon: Package, label: "Sedang Dikerjakan", value: "2", color: "from-green-500 to-green-600" },
    { icon: MessageCircle, label: "Chat Baru", value: "5", color: "from-purple-500 to-purple-600" },
  ];

  const recentOrders = [
    {
      id: 1,
      orderId: "GRF-2026-04-001",
      service: "Desain Logo Profesional",
      seller: "Design Studio",
      status: "Selesai",
      statusColor: "bg-green-100 text-green-700",
      amount: "Rp 225.000",
      date: "18 Apr 2026",
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
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
            Dashboard User
          </h1>
          <p className="text-slate-600 mt-2">Selamat datang kembali! Berikut ringkasan aktivitas Anda</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition-shadow">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Pesanan Terbaru</h2>
            <Link to="/profile/user" className="text-blue-600 hover:text-blue-700 text-sm">
              Lihat Semua
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Order ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Jasa</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Seller</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Total</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Tanggal</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 px-4 text-sm font-medium text-slate-800">{order.orderId}</td>
                    <td className="py-4 px-4 text-sm text-slate-600">{order.service}</td>
                    <td className="py-4 px-4 text-sm text-slate-600">{order.seller}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.statusColor}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm font-semibold text-slate-800">{order.amount}</td>
                    <td className="py-4 px-4 text-sm text-slate-600">{order.date}</td>
                    <td className="py-4 px-4">
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link
            to="/search"
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white hover:shadow-xl transition-shadow"
          >
            <TrendingUp className="w-8 h-8 mb-3" />
            <h3 className="text-xl font-bold mb-2">Jelajahi Jasa</h3>
            <p className="text-blue-100">Temukan freelancer terbaik untuk proyek Anda</p>
          </Link>

          <Link
            to="/profile/user"
            className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all"
          >
            <Star className="w-8 h-8 mb-3 text-yellow-500" />
            <h3 className="text-xl font-bold mb-2 text-slate-800">Beri Review</h3>
            <p className="text-slate-600">Bantu freelancer dengan memberikan review</p>
          </Link>

          <Link
            to="/chat/1"
            className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all"
          >
            <MessageCircle className="w-8 h-8 mb-3 text-purple-500" />
            <h3 className="text-xl font-bold mb-2 text-slate-800">Pesan Chat</h3>
            <p className="text-slate-600">Komunikasi dengan freelancer Anda</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
