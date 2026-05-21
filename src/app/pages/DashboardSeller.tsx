import { Link } from "react-router";
import { useState, useEffect } from "react";
import { ShoppingCart, DollarSign, Clock, Star, TrendingUp, Package, AlertCircle, Wallet } from "lucide-react";
import { dashboardAPI } from "../../services/api";

export function DashboardSeller() {
  const [stats, setStats] = useState({
    total_orders: 0,
    balance: 0,
    active_orders: 0,
    rating: 0,
    pending_earnings: 0,
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const data = await dashboardAPI.getSellerDashboard();
      setStats(data.stats || {});
      setOrders((data.active_orders || []).filter((o: any) => o.status !== 'pending'));
      setServices(data.services || []);
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-gray-100 text-gray-700',
      paid: 'bg-blue-100 text-blue-700',
      process: 'bg-yellow-100 text-yellow-700',
      revision: 'bg-orange-100 text-orange-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      pending: 'Menunggu Verifikasi',
      paid: 'Sudah Dibayar',
      process: 'Dalam Proses',
      revision: 'Revisi',
      completed: 'Selesai',
      cancelled: 'Dibatalkan',
    };
    return map[status] || status;
  };

  const statCards = [
    { icon: ShoppingCart, label: "Total Order", value: stats.total_orders, color: "from-blue-500 to-blue-600" },
    { icon: DollarSign, label: "Saldo", value: formatRupiah(stats.balance), color: "from-green-500 to-green-600" },
    { icon: Clock, label: "Dalam Proses", value: stats.active_orders, color: "from-yellow-500 to-yellow-600" },
    { icon: Star, label: "Rating", value: stats.rating ? Number(stats.rating).toFixed(1) : '0.0', color: "from-purple-500 to-purple-600" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Memuat dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
            Dashboard Seller
          </h1>
          <p className="text-slate-600 mt-2">Kelola jasa dan order Anda dengan mudah</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition-shadow">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Saldo & Withdraw */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 mb-8 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-green-100 mb-2">Saldo Tersedia</p>
              <p className="text-4xl font-bold">{formatRupiah(stats.balance)}</p>
              <p className="text-green-100 mt-2">Saldo dalam proses: {formatRupiah(stats.pending_earnings)}</p>
            </div>
            <Link to="/withdraw" className="bg-white text-green-600 px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-shadow flex items-center space-x-2">
              <Wallet className="w-5 h-5" />
              <span>Tarik Saldo</span>
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Active Orders */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Order Aktif</h2>
              <span className="text-sm text-slate-600">{orders.length} order</span>
            </div>

            {orders.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">Belum ada order aktif</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">GRF-{String(order.id).padStart(6, '0')}</p>
                        <h3 className="font-semibold text-slate-800">{order.title}</h3>
                        <p className="text-sm text-slate-600 mt-1">Buyer: {order.buyer_name}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                      <div className="flex items-center text-sm text-slate-600">
                        <Clock className="w-4 h-4 mr-1" />
                        {order.delivery_days} hari
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-blue-600">{formatRupiah(order.price)}</span>
                        <Link to={`/order-detail/${order.id}`} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Detail
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Services */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Jasa Saya</h2>
              <Link to="/profile/seller" className="text-blue-600 hover:text-blue-700 text-sm">
                Kelola Jasa
              </Link>
            </div>

            {services.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">Belum ada jasa. <Link to="/profile/seller" className="text-blue-600">Tambah jasa</Link></p>
            ) : (
              <div className="space-y-4">
                {services.map((service) => (
                  <div key={service.id} className="border border-slate-200 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-800 mb-1">{service.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-slate-600">
                          <span className="flex items-center">
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            {service.total_orders || 0} order
                          </span>
                          <span className="flex items-center">
                            <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                            {service.rating ? Number(service.rating).toFixed(1) : '0.0'}
                          </span>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        Aktif
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all">
            <TrendingUp className="w-8 h-8 mb-3 text-blue-500" />
            <h3 className="text-xl font-bold mb-2 text-slate-800">Tingkatkan Performa</h3>
            <p className="text-slate-600">Lihat analitik dan insight jasa Anda</p>
          </div>
          <Link to="/profile/seller" className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all">
            <Package className="w-8 h-8 mb-3 text-purple-500" />
            <h3 className="text-xl font-bold mb-2 text-slate-800">Tambah Jasa Baru</h3>
            <p className="text-slate-600">Perluas portofolio jasa Anda</p>
          </Link>
          <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all">
            <Star className="w-8 h-8 mb-3 text-yellow-500" />
            <h3 className="text-xl font-bold mb-2 text-slate-800">Review & Rating</h3>
            <p className="text-slate-600">Balas review dari pembeli</p>
          </div>
        </div>
      </div>
    </div>
  );
}