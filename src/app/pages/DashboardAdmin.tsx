import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
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
  Search,
  Filter,
  Calendar,
  Eye,
  Check,
  Trash,
} from "lucide-react";
import { adminAPI } from "../../services/api";

export function DashboardAdmin() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [dashboardStats, setDashboardStats] = useState<any | null>(null);
  const [usersData, setUsersData] = useState<any[]>([]);
  const [sellersData, setSellersData] = useState<any[]>([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const currentUserName = (() => {
    try {
      const u = localStorage.getItem('user');
      if (u) {
        const p = JSON.parse(u);
        return p.full_name || p.email || 'Admin';
      }
    } catch (e) {}
    return 'Admin';
  })();

  const sidebarMenus = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'users', icon: Users, label: 'Kelola User' },
    { id: 'sellers', icon: UserCheck, label: 'Kelola Freelancer' },
    { id: 'transactions', icon: DollarSign, label: 'Transaksi' },
    { id: 'verification', icon: CheckCircle, label: 'Verifikasi Pembayaran' },
  ];

  useEffect(() => {
    const loadData = async () => {
      setLoadingDashboard(true);
      setLoadingUsers(true);
      setError(null);

      try {
        const dashboardData = await adminAPI.getDashboardStats();
        setDashboardStats(dashboardData);
      } catch (err: any) {
        setError(err?.message || 'Gagal memuat statistik admin');
      } finally {
        setLoadingDashboard(false);
      }

      try {
        const usersResult = await adminAPI.getUsers(1, 10);
        setUsersData(
          usersResult.users.map((user: any) => ({
            id: user.id,
            name: user.full_name || user.email,
            email: user.email,
            joinDate: user.created_at ? new Date(user.created_at).toLocaleDateString('id-ID') : '-',
            orders: '-',
            status: user.is_verified ? 'Active' : 'Pending',
          }))
        );

        const sellerResult = await adminAPI.getUsers(1, 10, 'seller');
        setSellersData(
          sellerResult.users.map((seller: any) => ({
            id: seller.id,
            name: seller.full_name || seller.email,
            email: seller.email,
            joinDate: seller.created_at ? new Date(seller.created_at).toLocaleDateString('id-ID') : '-',
            services: '-',
            orders: '-',
            rating: '-',
            status: seller.is_verified ? 'Verified' : 'Pending',
          }))
        );
      } catch (err: any) {
        setError(err?.message || 'Gagal memuat daftar user');
      } finally {
        setLoadingUsers(false);
      }
    };

    loadData();
  }, []);

  const transactionsData = [
    { id: 1, orderId: 'GRF-2026-04-010', buyer: 'Rina Wijaya', seller: 'Design Studio', service: 'Desain Logo', amount: 150000, fee: 15000, status: 'Completed', date: '18 Apr 2026' },
    { id: 2, orderId: 'GRF-2026-04-009', buyer: 'Budi Santoso', seller: 'Creative Media', service: 'Video Editing', amount: 200000, fee: 20000, status: 'Processing', date: '17 Apr 2026' },
    { id: 3, orderId: 'GRF-2026-04-008', buyer: 'Ahmad Fauzi', seller: 'WordCraft', service: 'Copywriting', amount: 100000, fee: 10000, status: 'Completed', date: '16 Apr 2026' },
  ];

  // Small reusable components
  const StatCard = ({ icon: Icon, label, value, change }: any) => (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-white flex items-center justify-center text-slate-700">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-lg font-semibold text-slate-800">{value}</p>
          </div>
        </div>
        <div className="text-sm text-green-600 font-medium">{change}</div>
      </div>
    </div>
  );

  const Badge = ({ status }: { status: string }) => {
    const map: any = {
      Active: 'bg-emerald-100 text-emerald-700',
      active: 'bg-emerald-100 text-emerald-700',
      Pending: 'bg-amber-100 text-amber-700',
      pending: 'bg-amber-100 text-amber-700',
      Suspended: 'bg-red-100 text-red-700',
      suspended: 'bg-red-100 text-red-700',
      Verified: 'bg-sky-100 text-sky-700',
      verified: 'bg-sky-100 text-sky-700',
    };
    const cls = map[status] || 'bg-slate-100 text-slate-700';
    return <span className={`${cls} text-xs font-medium px-3 py-1 rounded-full`}>{status}</span>;
  };

  const ActionButton = ({ title, icon: Icon, onClick, variant = 'default' }: any) => (
    <button onClick={onClick} title={title} className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-transform hover:-translate-y-0.5 ${variant === 'danger' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-50 text-slate-700 border border-slate-100'}`}>
      <Icon className="w-4 h-4" />
    </button>
  );

  const stats = dashboardStats
    ? [
        { icon: Users, label: 'Total User', value: dashboardStats.users.total.toLocaleString(), change: '+12%' },
        { icon: UserCheck, label: 'Active User', value: String(dashboardStats.users.total - (dashboardStats.users.buyers || 0)), change: '+5%' },
        { icon: ShoppingCart, label: 'Pending User', value: String(dashboardStats.users.total - dashboardStats.users.sellers || 0), change: '+2%' },
        { icon: UserCheck, label: 'Freelancer', value: dashboardStats.users.sellers.toLocaleString(), change: '+8%' },
      ]
    : [
        { icon: Users, label: 'Total User', value: 'Loading...', change: '' },
        { icon: UserCheck, label: 'Active User', value: 'Loading...', change: '' },
        { icon: ShoppingCart, label: 'Pending User', value: 'Loading...', change: '' },
        { icon: UserCheck, label: 'Freelancer', value: 'Loading...', change: '' },
      ];

  // compute filtered users
  const filteredUsers = usersData.filter((u) => {
    const q = searchTerm.trim().toLowerCase();
    const matchSearch = q ? (u.name || u.email).toLowerCase().includes(q) : true;
    const matchStatus = filterStatus === 'all' ? true : (u.status || '').toLowerCase() === filterStatus.toLowerCase();
    const matchFrom = filterFrom ? new Date(u.joinDate) >= new Date(filterFrom) : true;
    const matchTo = filterTo ? new Date(u.joinDate) <= new Date(filterTo) : true;
    return matchSearch && matchStatus && matchFrom && matchTo;
  });

  const pendingVerifications = dashboardStats?.recent_activity?.payments || [
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

  const recentTransactions = dashboardStats?.recent_activity?.orders || [
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
            {stats.map((s, i) => (
              <StatCard key={i} icon={s.icon} label={s.label} value={s.value} change={s.change} />
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
                    {(dashboardStats?.recent_activity?.payments?.length ? dashboardStats.recent_activity.payments : pendingVerifications).map((item: any) => {
                      const orderId = item.orderId || item.order_id;
                      const buyer = item.buyer || item.buyer_name;
                      const seller = item.seller || item.seller_name;
                      const date = item.date || (item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '');
                      const amount = item.amount ? `Rp ${Number(item.amount).toLocaleString('id-ID')}` : item.amount;

                      return (
                        <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-4 px-4 text-sm font-medium text-slate-800">{orderId}</td>
                          <td className="py-4 px-4 text-sm text-slate-600">{buyer}</td>
                          <td className="py-4 px-4 text-sm text-slate-600">{seller}</td>
                          <td className="py-4 px-4 text-sm font-semibold text-slate-800">{amount}</td>
                          <td className="py-4 px-4 text-sm text-slate-600">{date}</td>
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
                      );
                    })}
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
                    {recentTransactions.map((txn: any) => {
                      const orderId = txn.orderId || txn.id;
                      const buyer = txn.buyer || txn.buyer_name;
                      const seller = txn.seller || txn.seller_name;
                      const service = txn.service || txn.service_title || txn.package_name;
                      const status = txn.status || txn.order_status || txn.status;
                      const date = txn.date || (txn.created_at ? new Date(txn.created_at).toLocaleDateString('id-ID') : '');
                      const amountValue = txn.amount || txn.price || 0;
                      const amount = typeof amountValue === 'number' ? `Rp ${amountValue.toLocaleString('id-ID')}` : amountValue;

                      return (
                        <tr key={txn.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-4 px-4 text-sm font-medium text-slate-800">{orderId}</td>
                          <td className="py-4 px-4 text-sm text-slate-600">{buyer}</td>
                          <td className="py-4 px-4 text-sm text-slate-600">{seller}</td>
                          <td className="py-4 px-4 text-sm text-slate-600">{service}</td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              status === 'completed' || status === 'Selesai' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm font-semibold text-slate-800">{amount}</td>
                          <td className="py-4 px-4 text-sm text-slate-600">{date}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
              <div className="md:flex md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">Kelola User</h2>
                  <p className="text-sm text-slate-500 mt-1">Cari, filter, dan kelola user aktif atau freelancer dengan mudah.</p>
                </div>

                <div className="mt-4 md:mt-0 flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Cari nama atau email" className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-200" />
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-slate-500" />
                      <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="py-2 px-3 rounded-lg border border-slate-200 bg-white text-sm">
                        <option value="all">Semua Status</option>
                        <option value="Active">Active</option>
                        <option value="Pending">Pending</option>
                        <option value="Suspended">Suspended</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} className="py-2 px-3 rounded-lg border border-slate-200 text-sm" />
                      <span className="text-slate-400">—</span>
                      <input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} className="py-2 px-3 rounded-lg border border-slate-200 text-sm" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                  <StatCard key={i} icon={s.icon} label={s.label} value={s.value} change={s.change} />
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-4 border border-slate-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left">
                      <th className="sticky top-0 bg-white/90 backdrop-blur py-3 px-4 text-sm font-semibold text-slate-600">Nama</th>
                      <th className="sticky top-0 bg-white/90 backdrop-blur py-3 px-4 text-sm font-semibold text-slate-600">Email</th>
                      <th className="sticky top-0 bg-white/90 backdrop-blur py-3 px-4 text-sm font-semibold text-slate-600">Bergabung</th>
                      <th className="sticky top-0 bg-white/90 backdrop-blur py-3 px-4 text-sm font-semibold text-slate-600">Total Order</th>
                      <th className="sticky top-0 bg-white/90 backdrop-blur py-3 px-4 text-sm font-semibold text-slate-600">Status</th>
                      <th className="sticky top-0 bg-white/90 backdrop-blur py-3 px-4 text-sm font-semibold text-slate-600">Aksi</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loadingUsers ? (
                      Array.from({ length: 6 }).map((_, idx) => (
                        <tr key={idx} className={`animate-pulse ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                          <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-40" /></td>
                          <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-56" /></td>
                          <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-28" /></td>
                          <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-16" /></td>
                          <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-20" /></td>
                          <td className="py-4 px-4"><div className="h-8 bg-slate-200 rounded w-28" /></td>
                        </tr>
                      ))
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-500">
                          <div className="mx-auto max-w-md">
                            <svg width="80" height="80" viewBox="0 0 24 24" className="mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4z" strokeWidth="1.5"/><path d="M6 20v-1a4 4 0 014-4h4a4 4 0 014 4v1" strokeWidth="1.5"/></svg>
                            <p className="text-lg font-semibold">Tidak ada user</p>
                            <p className="text-sm mt-2">Coba ubah kata kunci pencarian atau filter untuk menampilkan data.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user, i) => (
                        <tr key={user.id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-slate-100 transition-colors`}>
                          <td className="py-4 px-4 text-sm font-medium text-slate-800">{user.name}</td>
                          <td className="py-4 px-4 text-sm text-slate-600">{user.email}</td>
                          <td className="py-4 px-4 text-sm text-slate-600">{user.joinDate}</td>
                          <td className="py-4 px-4 text-sm text-slate-600">{user.orders}</td>
                          <td className="py-4 px-4"><Badge status={user.status} /></td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <ActionButton title="Detail" icon={Eye} onClick={() => {}} />
                              {user.status === 'Active' ? (
                                <ActionButton title="Suspend" icon={Check} onClick={() => {}} />
                              ) : (
                                <ActionButton title="Activate" icon={Check} onClick={() => {}} />
                              )}
                              <ActionButton title="Delete" icon={Trash} onClick={() => {}} variant="danger" />
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
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
                  {(dashboardStats?.recent_activity?.payments?.length ? dashboardStats.recent_activity.payments : pendingVerifications).map((item: any) => {
                    const orderId = item.orderId || item.order_id;
                    const buyer = item.buyer || item.buyer_name;
                    const seller = item.seller || item.seller_name;
                    const paymentProof = item.paymentProof || item.payment_proof || '-';
                    const date = item.date || (item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '');
                    const amount = item.amount ? `Rp ${Number(item.amount).toLocaleString('id-ID')}` : item.amount;

                    return (
                      <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-4 px-4 text-sm font-medium text-slate-800">{orderId}</td>
                        <td className="py-4 px-4 text-sm text-slate-600">{buyer}</td>
                        <td className="py-4 px-4 text-sm text-slate-600">{seller}</td>
                        <td className="py-4 px-4 text-sm font-semibold text-slate-800">{amount}</td>
                        <td className="py-4 px-4 text-sm text-blue-600 hover:underline cursor-pointer">{paymentProof}</td>
                        <td className="py-4 px-4 text-sm text-slate-600">{date}</td>
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
                    );
                  })}
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

        <div className="absolute bottom-16 w-64 p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">{(currentUserName || 'A').charAt(0)}</div>
            <div>
              <div className="text-sm font-semibold text-slate-800">{currentUserName}</div>
              <div className="text-xs text-slate-500">Administrator</div>
            </div>
          </div>
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
