import { Link } from "react-router";
import { useState, useEffect } from "react";
import { ShoppingCart, Clock, Package, MessageCircle } from "lucide-react";
import { dashboardAPI } from "../../services/api";

export function DashboardUser() {
  const [stats, setStats] = useState({
    total_orders: 0,
    pending_review: 0,
    active_orders: 0,
    unread_chats: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const data = await dashboardAPI.getBuyerDashboard();
      setStats(data.stats || {});
      setRecentOrders(data.recent_orders || []);
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      if (!isMounted) return;
      try {
        await fetchDashboard();
      } catch {
        // fetchDashboard sudah handle error internal
      }
    };

    run();
    const interval = setInterval(run, 30000); // polling setiap 30 detik untuk dashboard

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);






  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);


  const getBadgeColor = (status: string) => {
    const map: Record<string, string> = {
      completed: 'bg-green-100 text-green-700',
      revision: 'bg-yellow-100 text-yellow-700',
      process: 'bg-blue-100 text-blue-700',
      paid: 'bg-blue-100 text-blue-700',
      pending: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      pending: 'Menunggu',
      paid: 'Dibayar',
      process: 'Dalam Proses',
      revision: 'Revisi',
      completed: 'Selesai',
      cancelled: 'Dibatalkan',
    };
    return map[status] || status;
  };

  const statCards = [
    { icon: ShoppingCart, label: "Total Pesanan", value: stats.total_orders, color: "from-blue-500 to-blue-600" },
    { icon: Clock, label: "Menunggu Review", value: stats.pending_review, color: "from-yellow-500 to-yellow-600" },
    { icon: Package, label: "Sedang Dikerjakan", value: stats.active_orders, color: "from-green-500 to-green-600" },
    { icon: MessageCircle, label: "Chat Baru", value: stats.unread_chats, color: "from-purple-500 to-purple-600" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Memuat dashboard...</p>
      </div>
    );
  }

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
          {statCards.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 hover:border-blue-400 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Pesanan Terbaru</h2>
            <Link to="/profile/user" state={{ activeTab: 'orders' }} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Lihat Semua
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">Belum ada pesanan</p>
          ) : (
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
                    <tr key={order.id} className="border-b border-slate-100 hover:bg-blue-50 transition-colors duration-200">
                      <td className="py-4 px-4 text-sm font-medium text-slate-800">GRF-{String(order.id).padStart(6, '0')}</td>
                      <td className="py-4 px-4 text-sm text-slate-600">{order.title}</td>
                      <td className="py-4 px-4 text-sm text-slate-600">{order.seller_name}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getBadgeColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm font-semibold text-slate-800">{formatRupiah(order.price)}</td>
                      <td className="py-4 px-4 text-sm text-slate-600">
                        {new Date(order.created_at).toLocaleDateString('id-ID')}
                      </td>
                      <td className="py-4 px-4">
                        <Link to={`/order-detail/${order.id}`} className="text-blue-600 hover:text-blue-700 text-sm font-bold">
                          Detail
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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