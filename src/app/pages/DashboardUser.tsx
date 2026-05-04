import { Link } from "react-router";
import { ShoppingCart, Clock, Star, MessageCircle, TrendingUp, Package } from "lucide-react";
import { ordersData } from "./mockData"; 

export function DashboardUser() {
  const stats = [
    { icon: ShoppingCart, label: "Total Pesanan", value: "12", color: "from-blue-500 to-blue-600" },
    { icon: Clock, label: "Menunggu Review", value: "3", color: "from-yellow-500 to-yellow-600" },
    { icon: Package, label: "Sedang Dikerjakan", value: "2", color: "from-green-500 to-green-600" },
    { icon: MessageCircle, label: "Chat Baru", value: "5", color: "from-purple-500 to-purple-600" },
  ];

  const recentOrders = ordersData.slice(0, 3);

  const getBadgeColor = (status: string) => {
    if (status === "Selesai") return "bg-green-100 text-green-700";
    if (status === "Menunggu Review") return "bg-yellow-100 text-yellow-700";
    return "bg-blue-100 text-blue-700";
  };

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
            <div 
              key={idx} 
              className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 hover:border-blue-400 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-slate-100 hover:border-blue-400 hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Pesanan Terbaru</h2>
            <Link 
               to="/profile/user" 
               state={{ activeTab: 'orders' }} 
               className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
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
                  <tr 
                    key={order.id} 
                    className="border-b border-slate-100 hover:bg-blue-50 transition-colors duration-200"
                  >
                    <td className="py-4 px-4 text-sm font-medium text-slate-800">{order.orderId}</td>
                    <td className="py-4 px-4 text-sm text-slate-600">{order.service}</td>
                    <td className="py-4 px-4 text-sm text-slate-600">{order.seller}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getBadgeColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm font-semibold text-slate-800">{order.amount}</td>
                    <td className="py-4 px-4 text-sm text-slate-600">{order.date}</td>
                    <td className="py-4 px-4">
                      <Link 
                        to={`/order-detail/${order.id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-bold"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="w-full">
          <Link
            to="/profile/user"
            state={{ activeTab: 'orders' }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-blue-100 rounded-2xl p-6 hover:bg-blue-200 hover:shadow-xl transition-all border border-blue-200"
          >
            <div className="flex items-center gap-7">
              <div className="bg-white/60 p-3 rounded-xl shadow-sm">
                <MessageCircle className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-900 mb-1">Beri Review</h3>
                <p className="text-blue-800 text-sm sm:text-base">Bantu freelancer dengan memberikan review</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}