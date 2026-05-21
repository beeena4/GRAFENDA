import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, Package, DollarSign, MessageCircle, User,
  LogOut, Clock, Repeat, ShoppingCart, CheckCircle, XCircle,
  Upload, Edit, Trash2, Plus,
} from "lucide-react";
import { dashboardAPI, serviceAPI } from "../../services/api";

const API_BASE_URL = (import.meta.env.VITE_API_URL as string)?.replace(/\/api$/, '') || 'http://localhost:3000';

export function NewDashboardSeller() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"orders" | "services" | "earnings">("orders");
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const [stats, setStats] = useState({
    total_earnings: 0,
    active_orders: 0,
    balance: 0,
    pending_earnings: 0,
    rating: 0,
  });
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [myServices, setMyServices] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));

    const fetchDashboard = async () => {
      try {
        const data = await dashboardAPI.getSellerDashboard();
        setStats(data.stats || {});
        setActiveOrders(data.active_orders || []);
        setMyServices(data.services || []);
        setEarnings(data.earnings || []);
      } catch (err) {
        console.error('Failed to fetch dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  const statCards = [
    { label: "Total Pendapatan", value: formatRupiah(stats.total_earnings), subtext: `+${formatRupiah(stats.pending_earnings)} pending`, icon: DollarSign, bg: "bg-blue-600" },
    { label: "Order Aktif", value: stats.active_orders, subtext: "order berjalan", icon: ShoppingCart, bg: "bg-orange-500" },
    { label: "Saldo", value: formatRupiah(stats.balance), subtext: "tersedia", icon: Clock, bg: "bg-green-500" },
    { label: "Rating", value: stats.rating ? Number(stats.rating).toFixed(1) : '0.0', subtext: "rata-rata", icon: Repeat, bg: "bg-purple-500" },
  ];

  const sidebarMenus = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "orders", icon: ShoppingCart, label: "Manajemen Order" },
    { id: "services", icon: Package, label: "Pekerjaan Saya" },
    { id: "earnings", icon: DollarSign, label: "Pendapatan" },
    { id: "chat", icon: MessageCircle, label: "Chat" },
    { id: "profile", icon: User, label: "Profil" },
  ];

  const handleMenuClick = (menuId: string) => {
    setActiveMenu(menuId);
    if (menuId === "orders") setActiveTab("orders");
    if (menuId === "services") setActiveTab("services");
    if (menuId === "earnings") setActiveTab("earnings");
    if (menuId === "chat") navigate("/inbox");
    if (menuId === "profile") navigate("/profile/seller");
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate("/");
  };

  const handleDeleteService = async (serviceId: number) => {
  if (deleteConfirm !== serviceId) {
    setDeleteConfirm(serviceId);
    return;
  }
  try {
    await serviceAPI.deleteService(serviceId);
    // Refresh data dari API
    const data = await dashboardAPI.getSellerDashboard();
    setMyServices(data.services || []);
    setDeleteConfirm(null);
  } catch (err) {
    console.error('Gagal menghapus jasa:', err);
    setDeleteConfirm(null);
  }
};

  const renderOrders = () => (
    <div className="space-y-5">
      {activeOrders.length === 0 ? (
        <p className="text-slate-400 text-center py-12">Belum ada order aktif</p>
      ) : (
        activeOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="font-bold text-[18px] text-slate-800">{order.title}</h3>
                <p className="text-sm text-slate-500 mt-1">dari {order.buyer_name}</p>
                <p className="text-sm text-slate-400 mt-1">Deadline: {order.delivery_days} hari</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                {order.status}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <h4 className="font-bold text-slate-800">{formatRupiah(order.price)}</h4>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-xl transition">
                  <CheckCircle className="w-4 h-4" /><span>Terima</span>
                </button>
                <button className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-xl transition">
                  <XCircle className="w-4 h-4" /><span>Tolak</span>
                </button>
                <button className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-xl transition">
                  <Upload className="w-4 h-4" /><span>Upload Hasil</span>
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderServices = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Jasa Saya</h2>
        <Link to="/seller/service/add" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl transition">
          <Plus className="w-4 h-4" /><span>Tambah Jasa</span>
        </Link>
      </div>
      {myServices.length === 0 ? (
        <p className="text-slate-400 text-center py-12">Belum ada jasa. <Link to="/seller/service/add" className="text-blue-600">Tambah jasa</Link></p>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {myServices.map((service) => (
            <div key={service.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              {service.image ? (
                <img src={service.image.startsWith('/') ? `${(import.meta.env.VITE_API_URL as string)?.replace(/\/api$/, '') || 'http://localhost:3000'}${service.image}` : service.image} alt={service.title} className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-48 bg-slate-100 flex items-center justify-center text-slate-400">No Image</div>
              )}
              <div className="p-5">
                <h3 className="font-semibold text-slate-800 line-clamp-2 mb-4">{service.title}</h3>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-blue-600">{formatRupiah(service.price)}</span>
                  <div className="text-sm text-slate-500">⭐ {service.rating ? Number(service.rating).toFixed(1) : '0.0'}</div>
                </div>
                <div className="flex gap-2">
                  <Link to={`/seller/service/${service.id}/edit`} className="flex-1 flex items-center justify-center gap-2 border border-blue-600 text-blue-600 hover:bg-blue-50 py-2 rounded-xl transition">
                    <Edit className="w-4 h-4" /><span>Edit</span>
                  </Link>
                  {deleteConfirm === service.id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleDeleteService(service.id)}
                        className="px-3 py-2 bg-red-500 text-white text-xs rounded-xl hover:bg-red-600 transition">
                        Yakin?
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-2 bg-slate-200 text-slate-600 text-xs rounded-xl hover:bg-slate-300 transition">
                        Batal
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDeleteService(service.id)}
                      className="w-11 h-11 flex items-center justify-center border border-red-500 text-red-500 hover:bg-red-50 rounded-xl transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderEarnings = () => {
    const total = earnings.reduce((sum, e) => sum + e.amount, 0);
    const completed = earnings.filter(e => e.status === 'completed').reduce((sum, e) => sum + e.amount, 0);
    const pending = total - completed;

    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-3 gap-5">
          <div className="bg-blue-600 text-white rounded-2xl p-6">
            <p className="text-sm opacity-80 mb-2">Total Penghasilan</p>
            <h2 className="text-3xl font-bold">{formatRupiah(total)}</h2>
          </div>
          <div className="bg-green-600 text-white rounded-2xl p-6">
            <p className="text-sm opacity-80 mb-2">Saldo Tersedia</p>
            <h2 className="text-3xl font-bold">{formatRupiah(stats.balance)}</h2>
            <Link to="/withdraw" className="inline-block mt-3 text-sm underline">Tarik Saldo</Link>
          </div>
          <div className="bg-yellow-500 text-white rounded-2xl p-6">
            <p className="text-sm opacity-80 mb-2">Saldo Pending</p>
            <h2 className="text-3xl font-bold">{formatRupiah(pending)}</h2>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Riwayat Transaksi</h3>
          {earnings.length === 0 ? (
            <p className="text-slate-400 text-center py-8">Belum ada transaksi</p>
          ) : (
            <div className="space-y-4">
              {earnings.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-none">
                  <div>
                    <p className="font-medium text-slate-800">{item.description}</p>
                    <p className="text-sm text-slate-500">{item.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800">{formatRupiah(item.amount)}</p>
                    <span className={`text-xs px-3 py-1 rounded-full ${item.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {item.status === 'completed' ? 'Selesai' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-500">Memuat dashboard...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex">
      <aside className="w-[260px] bg-[#eef3fb] border-r border-slate-200 fixed h-screen flex flex-col">
        <div className="px-6 pt-6">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo Grafenda" className="w-8 h-8 object-contain" />
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent">Grafenda</span>
              <p className="text-xs text-slate-500">Seller Panel</p>
            </div>
          </Link>
        </div>
        <div className="px-5 mt-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-500 rounded-2xl p-3 flex items-center gap-3">
            <img
              src={
                user?.avatar
                  ? user.avatar.startsWith('/')
                    ? `${API_BASE_URL}${user.avatar}`
                    : user.avatar
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'S')}`
              }
              alt="profile"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">{user?.full_name || 'Seller'}</p>
              <p className="text-blue-100 text-xs">{user?.email || ''}</p>
            </div>
          </div>
        </div>
        <nav className="mt-6 px-4 flex-1">
          {sidebarMenus.map((menu) => (
            <button key={menu.id} onClick={() => handleMenuClick(menu.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition text-sm font-medium ${activeMenu === menu.id ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-white"}`}>
              <menu.icon className="w-5 h-5" />
              <span>{menu.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition">
            <LogOut className="w-5 h-5" /><span>Keluar</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-[260px] p-8 w-[calc(100%-260px)]">
        <div className="max-w-7xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-3xl leading-tight font-bold text-slate-800">Dashboard Freelancer</h1>
            <p className="text-slate-500 mt-1">Kelola jasa dan order Anda dengan mudah</p>
          </div>
          <div className="grid md:grid-cols-4 gap-5 mb-8">
          {statCards.map((stat, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg cursor-pointer">
              <div className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-slate-800">{stat.value}</h3>
              <p className="text-sm text-slate-400 mt-1">{stat.subtext}</p>
            </div>
          ))}
        </div>
            <div className="inline-flex gap-7 bg-white border border-slate-200 rounded-2xl p-1 mb-6">
          {(['orders', 'services', 'earnings'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-23 py-2 rounded-xl text-sm font-medium transition ${activeTab === tab ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
              {tab === 'orders' ? 'Manajemen Order' : tab === 'services' ? 'Pekerjaan Saya' : 'Pendapatan'}
            </button>
          ))}
        </div>
        {activeTab === 'orders' && renderOrders()}
        {activeTab === 'services' && renderServices()}
        {activeTab === 'earnings' && renderEarnings()}
      </div>
      </main>
    </div>
  );
}