import { Link } from "react-router";
import { ShoppingCart, DollarSign, Clock, Star, TrendingUp, Package, AlertCircle, Wallet } from "lucide-react";

export function DashboardSeller() {
  const stats = [
    { icon: ShoppingCart, label: "Total Order", value: "45", color: "from-blue-500 to-blue-600" },
    { icon: DollarSign, label: "Saldo", value: "Rp 2.5jt", color: "from-green-500 to-green-600" },
    { icon: Clock, label: "Dalam Proses", value: "8", color: "from-yellow-500 to-yellow-600" },
    { icon: Star, label: "Rating", value: "4.9", color: "from-purple-500 to-purple-600" },
  ];

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
      status: "Menunggu Review",
      statusColor: "bg-yellow-100 text-yellow-700",
      deadline: "19 Apr 2026",
      amount: "Rp 250.000",
    },
  ];

  const services = [
    {
      id: 1,
      title: "Desain Logo Profesional",
      orders: 45,
      rating: 4.9,
      status: "Aktif",
      slots: "2/5 Tersedia",
    },
    {
      id: 2,
      title: "Brand Identity Package",
      orders: 12,
      rating: 5.0,
      status: "Aktif",
      slots: "0/3 Tersedia",
    },
  ];

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

        {/* Saldo & Withdraw */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 mb-8 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-green-100 mb-2">Saldo Tersedia</p>
              <p className="text-4xl font-bold">Rp 2.500.000</p>
              <p className="text-green-100 mt-2">Saldo dalam proses: Rp 1.200.000</p>
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

            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">{order.orderId}</p>
                      <h3 className="font-semibold text-slate-800">{order.service}</h3>
                      <p className="text-sm text-slate-600 mt-1">Buyer: {order.buyer}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.statusColor}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                    <div className="flex items-center text-sm text-slate-600">
                      <Clock className="w-4 h-4 mr-1" />
                      {order.deadline}
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-blue-600">{order.amount}</span>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Detail
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* My Services */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Jasa Saya</h2>
              <Link to="/profile/seller" className="text-blue-600 hover:text-blue-700 text-sm">
                Kelola Jasa
              </Link>
            </div>

            <div className="space-y-4">
              {services.map((service) => (
                <div key={service.id} className="border border-slate-200 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">{service.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-slate-600">
                        <span className="flex items-center">
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          {service.orders} order
                        </span>
                        <span className="flex items-center">
                          <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                          {service.rating}
                        </span>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      {service.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                    <div className="flex items-center text-sm">
                      {service.slots.includes('0/') ? (
                        <span className="flex items-center text-red-600">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Slot Penuh
                        </span>
                      ) : (
                        <span className="text-slate-600">
                          <Package className="w-4 h-4 mr-1 inline" />
                          {service.slots}
                        </span>
                      )}
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all">
            <TrendingUp className="w-8 h-8 mb-3 text-blue-500" />
            <h3 className="text-xl font-bold mb-2 text-slate-800">Tingkatkan Performa</h3>
            <p className="text-slate-600">Lihat analitik dan insight jasa Anda</p>
          </div>

          <Link
            to="/profile/seller"
            className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all"
          >
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
