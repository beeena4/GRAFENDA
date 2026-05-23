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
  Clock,
} from "lucide-react";
import { adminAPI, authAPI, API_ASSET_URL } from "../../services/api";

export function DashboardAdmin() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [dashboardStats, setDashboardStats] = useState<any | null>(null);
  const [usersData, setUsersData] = useState<any[]>([]);
  const [sellersData, setSellersData] = useState<any[]>([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<number, boolean>>({});
  const [paymentActionLoading, setPaymentActionLoading] = useState<Record<number, boolean>>({});
  const [ordersData, setOrdersData] = useState<any[]>([]);
  const [paymentsData, setPaymentsData] = useState<any[]>([]);
  const [transactionsData, setTransactionsData] = useState<any[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [adminAvatar, setAdminAvatar] = useState('');

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

  const normalizeAvatarUrl = (avatar: string) => {
    if (!avatar) return '';
    if (avatar.startsWith('http') || avatar.startsWith('blob:')) return avatar;
    if (avatar.startsWith('/')) return `${API_ASSET_URL}${avatar}`;
    return avatar;
  };

  const sidebarMenus = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'users', icon: Users, label: 'Kelola User' },
    { id: 'sellers', icon: UserCheck, label: 'Kelola Freelancer' },
    { id: 'transactions', icon: DollarSign, label: 'Transaksi' },
    { id: 'verification', icon: CheckCircle, label: 'Verifikasi Pembayaran' },
  ];

  const loadDashboardStats = async (showLoading = true) => {
    if (showLoading) setLoadingDashboard(true);
    setError(null);
    try {
      const dashboardData = await adminAPI.getDashboardStats();
      setDashboardStats(dashboardData);
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat statistik admin');
    } finally {
      if (showLoading) setLoadingDashboard(false);
    }
  };

  const loadUsersData = async (showLoading = true) => {
    if (showLoading) setLoadingUsers(true);
    setError(null);
    try {
      const usersResult = await adminAPI.getUsers(1, 100);
      setUsersData(
        usersResult.users.map((user: any) => ({
          id: user.id,
          name: user.full_name || user.email,
          email: user.email,
          joinDate: user.created_at ? new Date(user.created_at).toLocaleDateString('id-ID') : '-',
          orders: user.total_orders || 0,
          status: user.status === 'suspended' ? 'Suspended' : user.status === 'inactive' ? 'Tidak Aktif' : 'Aktif',
          isVerified: Boolean(user.is_verified),
          role: user.role,
        }))
      );

      const sellerResult = await adminAPI.getUsers(1, 100, 'seller');
      setSellersData(
        sellerResult.users.map((seller: any) => ({
          id: seller.id,
          name: seller.full_name || seller.email,
          email: seller.email,
          joinDate: seller.created_at ? new Date(seller.created_at).toLocaleDateString('id-ID') : '-',
          services: seller.total_services || seller.total_jasa || 0,
          orders: seller.total_orders || 0,
          earnings: seller.total_revenue || seller.total_earnings || seller.total_pendapatan || 0,
          rating: seller.rating || '-',
          status: seller.status === 'suspended' ? 'Suspended' : seller.status === 'inactive' ? 'Tidak Aktif' : 'Aktif',
          isVerified: Boolean(seller.is_verified),
          role: seller.role || 'seller',
        }))
      );
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat daftar user');
    } finally {
      if (showLoading) setLoadingUsers(false);
    }
  };

  const loadOrdersData = async (showLoading = true) => {
    if (showLoading) setOrdersLoading(true);
    setError(null);
    try {
      const ordersResult = await adminAPI.getOrders(1, 100);
      setOrdersData(ordersResult.orders);
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat data transaksi');
      setOrdersData([]);
    } finally {
      if (showLoading) setOrdersLoading(false);
    }
  };

  const loadPaymentsData = async (showLoading = true) => {
    if (showLoading) setPaymentsLoading(true);
    setError(null);
    try {
      const paymentsResult = await adminAPI.getPendingPayments(1, 100);
      setPaymentsData(paymentsResult.payments);
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat data verifikasi pembayaran');
      setPaymentsData([]);
    } finally {
      if (showLoading) setPaymentsLoading(false);
    }
  };

  const loadTransactionsData = async (showLoading = true) => {
    if (showLoading) setTransactionsLoading(true);
    setError(null);
    try {
      // Pastikan fetch tanpa filter, dan ambil array langsung dari berbagai kemungkinan payload
      const transactionsResult = await adminAPI.getTransactionHistory(1, 100);
      setTransactionsData(transactionsResult.transactions || transactionsResult.orders || transactionsResult.data || []);
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat riwayat transaksi');
      setTransactionsData([]);
    } finally {
      if (showLoading) setTransactionsLoading(false);
    }
  };


  // Load admin profile avatar
  useEffect(() => {
    const loadAdminProfile = async () => {
      try {
        const profileData = await authAPI.getProfile();
        if (profileData?.avatar) {
          setAdminAvatar(normalizeAvatarUrl(profileData.avatar));
        }
      } catch (e) {}
    };
    loadAdminProfile();
  }, []);

  useEffect(() => {
    let isMounted = true;
    let isFetching = false;

    const loadData = async (showLoading = true) => {
      if (!isMounted || isFetching) return;
      isFetching = true;
      try {
        await Promise.allSettled([
          loadDashboardStats(showLoading),
          loadUsersData(showLoading),
          loadOrdersData(showLoading),
          loadPaymentsData(showLoading),
          loadTransactionsData(showLoading),
        ]);
      } finally {
        isFetching = false;
      }
    };

    loadData(true);

    const interval = setInterval(() => {
      if (isMounted) {
        loadData(false);
      }
    }, 60000); // Ubah dari 5 detik menjadi 60 detik untuk mencegah spam dan overload server

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleViewUserDetail = async (user: any) => {
    setError(null);
    try {
      const detailedUser = await adminAPI.getUserById(user.id);
      setSelectedUser({
        id: detailedUser.id,
        name: detailedUser.full_name || detailedUser.email,
        email: detailedUser.email,
        joinDate: detailedUser.created_at ? new Date(detailedUser.created_at).toLocaleDateString('id-ID') : '-',
        status: detailedUser.status === 'suspended' ? 'Suspended' : detailedUser.status === 'inactive' ? 'Tidak Aktif' : 'Aktif',
        role: detailedUser.role,
      });
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat detail user');
    }
  };

  const handleDeleteUser = async (user: any) => {
    setActionLoading((prev) => ({ ...prev, [user.id]: true }));
    setError(null);
    try {
      await adminAPI.deleteUser(user.id);
      await loadUsersData();
      if (selectedUser?.id === user.id) {
        setSelectedUser(null);
      }
    } catch (err: any) {
      setError(err?.message || 'Gagal menghapus user');
    } finally {
      setActionLoading((prev) => ({ ...prev, [user.id]: false }));
    }
  };

  const handleVerifyPayment = async (paymentId: number) => {
    const confirmMsg = "Apakah Anda yakin ingin memverifikasi pesanan ini? Dana akan langsung dicairkan ke penjual.";
    if (!window.confirm(confirmMsg)) return;

    setPaymentActionLoading((prev) => ({ ...prev, [paymentId]: true }));
    setError(null);
    try {
      await adminAPI.verifyPayment(paymentId, 'verify');
      alert("Sukses! Verifikasi berhasil dan dana telah dicairkan.");
      await loadPaymentsData();
      await loadDashboardStats();
      await loadOrdersData(false);
      await loadTransactionsData(false);
    } catch (err: any) {
      setError(err?.message || 'Gagal memverifikasi pembayaran');
      alert(err?.response?.data?.message || err?.message || "Terjadi kesalahan saat memverifikasi.");
    } finally {
      setPaymentActionLoading((prev) => ({ ...prev, [paymentId]: false }));
    }
  };


  // Small reusable components
  const StatCard = ({ icon: Icon, label, value, change }: any) => (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-white flex items-center justify-center text-slate-700">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-3xl font-semibold text-slate-800">{value}</p>
          </div>
        </div>
        <div className="text-sm text-green-600 font-medium">{change}</div>
      </div>
    </div>
  );

  const formatStatusLabel = (status: string) => {
    if (!status) return status;
    const normalized = status.toLowerCase();
    if (normalized === 'pending') return 'Menunggu Verifikasi';
    if (normalized === 'completed') return 'Selesai';
    if (normalized === 'processing' || normalized === 'process') return 'Dalam Proses';
    if (normalized === 'paid') return 'Sudah Dibayar';
    if (normalized === 'revision') return 'Revisi';
    if (normalized === 'cancelled') return 'Dibatalkan';
    return status;
  };

  const Badge = ({ status }: { status: string }) => {
    const map: any = {
      Aktif: 'bg-emerald-100 text-emerald-700',
      'Tidak Aktif': 'bg-amber-100 text-amber-700',
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

  const ActionButton = ({ title, icon: Icon, onClick, variant = 'default', disabled = false }: any) => (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-transform ${disabled ? 'cursor-not-allowed opacity-60 bg-slate-100 text-slate-400 border border-slate-100' : variant === 'danger' ? 'bg-red-50 text-red-600 border border-red-100 hover:-translate-y-0.5' : 'bg-slate-50 text-slate-700 border border-slate-100 hover:-translate-y-0.5'}`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  // Gabungkan usersData dan sellersData menggunakan Map untuk menghindari duplikat
  const allPlatformUsersMap = new Map();
  usersData.forEach(u => allPlatformUsersMap.set(u.id, u));
  sellersData.forEach(s => allPlatformUsersMap.set(s.id, s));
  const allPlatformUsers = Array.from(allPlatformUsersMap.values());
  const platformUsersNoAdmin = allPlatformUsers.filter(u => u.role !== 'admin');

  const stats = loadingUsers && platformUsersNoAdmin.length === 0
    ? [
        { icon: Users, label: 'Total User', value: '-', change: '' },
        { icon: UserCheck, label: 'Active User', value: '-', change: '' },
        { icon: Clock, label: 'Pending User', value: '-', change: '' },
        { icon: UserCheck, label: 'Freelancer', value: '-', change: '' },
      ]
    : [
        { icon: Users, label: 'Total User', value: platformUsersNoAdmin.length.toLocaleString(), change: '' },
        { icon: UserCheck, label: 'Active User', value: platformUsersNoAdmin.filter((u) => u.status === 'Aktif').length.toLocaleString(), change: '' },
        { icon: Clock, label: 'Pending User', value: platformUsersNoAdmin.filter((u) => u.status === 'Tidak Aktif' || u.status === 'Pending').length.toLocaleString(), change: '' },
        { icon: UserCheck, label: 'Freelancer', value: platformUsersNoAdmin.filter((u) => u.role === 'seller' || u.role === 'freelancer').length.toLocaleString(), change: '' },
      ];

  // compute filtered users
  const filteredUsers = platformUsersNoAdmin.filter((u) => {
    const q = searchTerm.trim().toLowerCase();
    const matchSearch = q ? (u.name || u.email).toLowerCase().includes(q) : true;
    const matchStatus = filterStatus === 'all' ? true : (u.status || '').toLowerCase() === filterStatus.toLowerCase();
    const matchFrom = filterFrom ? new Date(u.joinDate) >= new Date(filterFrom) : true;
    const matchTo = filterTo ? new Date(u.joinDate) <= new Date(filterTo) : true;
    return matchSearch && matchStatus && matchFrom && matchTo;
  });

  const userPageStats = [
    { icon: Users, label: 'Total User', value: filteredUsers.length.toString(), change: '' },
    { icon: UserCheck, label: 'Active User', value: filteredUsers.filter((u) => u.status === 'Aktif').length.toString(), change: '' },
    { icon: Clock, label: 'Pending User', value: filteredUsers.filter((u) => u.status === 'Tidak Aktif' || u.status === 'Pending').length.toString(), change: '' },
    { icon: UserCheck, label: 'Freelancer', value: filteredUsers.filter((u) => u.role === 'seller' || u.role === 'freelancer').length.toString(), change: '' },
  ];

  const pendingVerifications = paymentsData;
  const recentTransactions = transactionsData;
  const transactionStats = dashboardStats?.transactions || {
    total: dashboardStats?.orders?.total || 0,
    completed: dashboardStats?.orders?.completed || 0,
    pending: dashboardStats?.orders?.pending || 0,
    revenue: dashboardStats?.revenue?.total_revenue || 0,
  };

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
              <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">Verifikasi Pembayaran Menunggu</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Order ID</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Buyer</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Jasa</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Metode</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Jumlah</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Tanggal</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingVerifications.map((item: any) => {
                      const orderId = item.orderId || item.order_id;
                      const buyer = item.buyer || item.buyer_name || '-';
                      const service = item.title || item.service_title || item.service || '-';
                      const method = item.payment_method ? item.payment_method.replace('_', ' ') : '-';
                      const date = item.date || (item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '');
                      const amount = item.amount ? `Rp ${Number(item.amount).toLocaleString('id-ID')}` : item.amount;

                      return (
                        <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-4 px-4 text-sm font-medium text-slate-800">GRF-{String(orderId).padStart(6, '0')}</td>
                          <td className="py-4 px-4 text-sm text-slate-600">{buyer}</td>
                          <td className="py-4 px-4 text-sm text-slate-600">{service}</td>
                          <td className="py-4 px-4 text-sm text-slate-600 capitalize">{method}</td>
                          <td className="py-4 px-4 text-sm font-semibold text-slate-800">{amount}</td>
                          <td className="py-4 px-4 text-sm text-slate-600">{date}</td>
                          <td className="py-4 px-4">
                            <div className="flex space-x-2">
                              <button
                                className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
                                onClick={() => handleVerifyPayment(item.id)}
                                disabled={Boolean(paymentActionLoading[item.id])}
                              >
                                {paymentActionLoading[item.id] ? 'Memproses...' : 'Verifikasi'}
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
              <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">Transaksi Terbaru</h2>
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
                      const orderId = txn.orderId || txn.order_id || txn.id;
                      const buyer = txn.buyer || txn.buyer_name || '-';
                      const seller = txn.seller || txn.seller_name || '-';
                      const service = txn.title || txn.service || txn.service_title || txn.package_name || '-';
                      const status = txn.status || txn.order_status || '-';
                      const date = txn.date || (txn.created_at ? new Date(txn.created_at).toLocaleDateString('id-ID') : '-');
                      const amountValue = txn.amount || txn.price || 0;
                      const amount = `Rp ${Number(amountValue).toLocaleString('id-ID')}`;

                      return (
                        <tr key={txn.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-4 px-4 text-sm font-medium text-slate-800">{orderId}</td>
                          <td className="py-4 px-4 text-sm text-slate-600">{buyer}</td>
                          <td className="py-4 px-4 text-sm text-slate-600">{seller}</td>
                          <td className="py-4 px-4 text-sm text-slate-600">{service}</td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              status.toLowerCase() === 'completed' || status.toLowerCase() === 'selesai' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {formatStatusLabel(status)}
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
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Cari nama atau email" className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-200" />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="py-2 px-3 rounded-lg border border-slate-200 bg-white text-sm">
                      <option value="all">Semua Status</option>
                      <option value="Aktif">Aktif</option>
                      <option value="Tidak Aktif">Tidak Aktif</option>
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

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {userPageStats.map((s, i) => (
                  <StatCard key={i} icon={s.icon} label={s.label} value={s.value} change={s.change} />
                ))}
              </div>
            </div>

            {selectedUser && (
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 mb-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">Detail User</h3>
                    <p className="text-sm text-slate-500 mt-1">Informasi lengkap user yang dipilih.</p>
                  </div>
                  <button
                    className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    onClick={() => setSelectedUser(null)}
                  >
                    Tutup
                  </button>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Nama</p>
                    <p className="mt-2 font-semibold text-slate-900">{selectedUser.name}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="mt-2 font-semibold text-slate-900">{selectedUser.email}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Terdaftar</p>
                    <p className="mt-2 font-semibold text-slate-900">{selectedUser.joinDate}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Status</p>
                    <p className="mt-2 font-semibold text-slate-900">{selectedUser.status}</p>
                  </div>
                </div>
              </div>
            )}

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
                              <ActionButton
                                title="Delete"
                                icon={Trash}
                                onClick={() => handleDeleteUser(user)}
                                variant="danger"
                                disabled={Boolean(actionLoading[user.id])}
                              />
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
            <div className="flex flex-col items-center justify-between gap-4 mb-6 md:flex-row md:items-center">
              <h2 className="text-2xl font-bold text-slate-800 text-center">Kelola Freelancer</h2>
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
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Pendapatan</th>
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
                      <td className="py-4 px-4 text-sm font-semibold text-green-600">Rp {Number(seller.earnings).toLocaleString('id-ID')}</td>
                      <td className="py-4 px-4 text-sm text-slate-600 flex items-center">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                        {seller.rating}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          seller.status === 'Aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {seller.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <ActionButton
                            title="Delete"
                            icon={Trash}
                            onClick={() => handleDeleteUser(seller)}
                            variant="danger"
                            disabled={Boolean(actionLoading[seller.id])}
                          />
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
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm text-slate-500 font-medium">Total Transaksi</p>
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
                </div>
                <p className="text-3xl font-bold text-slate-800 tracking-tight">{transactionStats.total?.toLocaleString() ?? '—'}</p>
                <p className="text-xs mt-3 font-bold px-2 py-1 rounded-full inline-block bg-slate-50 text-slate-500">Dari semua transaksi</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm text-slate-500 font-medium">Volume</p>
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">+8%</span>
                </div>
                <p className="text-3xl font-bold text-slate-800 tracking-tight">Rp {(transactionStats.revenue || 0).toLocaleString('id-ID')}</p>
                <p className="text-xs mt-3 font-bold px-2 py-1 rounded-full inline-block bg-slate-50 text-slate-500">Total nilai transaksi</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm text-slate-500 font-medium">Fee Platform</p>
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">+15%</span>
                </div>
                <p className="text-3xl font-bold text-slate-800 tracking-tight">Rp {((transactionStats.revenue || 0) * 0.1).toLocaleString('id-ID')}</p>
                <p className="text-xs mt-3 font-bold px-2 py-1 rounded-full inline-block bg-slate-50 text-slate-500">10% dari volume</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm text-slate-500 font-medium">Rata-rata</p>
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">+5%</span>
                </div>
                <p className="text-3xl font-bold text-slate-800 tracking-tight">Rp {transactionStats.total ? Math.round((transactionStats.revenue || 0) / transactionStats.total).toLocaleString('id-ID') : '0'}</p>
                <p className="text-xs mt-3 font-bold px-2 py-1 rounded-full inline-block bg-slate-50 text-slate-500">Nilai per transaksi</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800">Riwayat Transaksi</h3>
                <div className="text-sm text-slate-500">Menampilkan {transactionsData.length} transaksi terbaru</div>
              </div>

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
                    {transactionsLoading ? (
                      Array.from({ length: 5 }).map((_, idx) => (
                        <tr key={idx} className="animate-pulse bg-white border-b border-slate-100">
                          {Array.from({ length: 8 }).map((__, colIdx) => (
                            <td key={colIdx} className="py-4 px-4"><div className="h-4 bg-slate-200 rounded" /></td>
                          ))}
                        </tr>
                      ))
                    ) : transactionsData.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-500">Tidak ada transaksi ditemukan.</td>
                      </tr>
                    ) : (
                      transactionsData.map((txn: any) => {
                        const orderId = txn.order_id || txn.id;
                        const buyer = txn.buyer_name || txn.buyer || '-';
                        const seller = txn.seller_name || txn.seller || '-';
                        const service = txn.title || txn.order_title || txn.service_title || txn.service || '-';
                        const status = txn.status || txn.order_status || '-';
                        const date = txn.created_at ? new Date(txn.created_at).toLocaleDateString('id-ID') : '-';
                        const amountValue = txn.amount || txn.order_price || 0;
                        const feeValue = txn.fee || amountValue * 0.1;
                        return (
                          <tr key={txn.id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-4 px-4 text-sm font-medium text-slate-800">GRF-{String(orderId).padStart(6, '0')}</td>
                            <td className="py-4 px-4 text-sm text-slate-600">{buyer}</td>
                            <td className="py-4 px-4 text-sm text-slate-600">{seller}</td>
                            <td className="py-4 px-4 text-sm text-slate-600">{service}</td>
                            <td className="py-4 px-4 text-sm font-semibold text-slate-800">Rp {Number(amountValue).toLocaleString('id-ID')}</td>
                            <td className="py-4 px-4 text-sm font-semibold text-green-600">Rp {Number(feeValue).toLocaleString('id-ID')}</td>
                            <td className="py-4 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                status.toLowerCase() === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {formatStatusLabel(status)}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-sm text-slate-600">{date}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'verification':
        return (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Verifikasi Pembayaran</h2>
              <p className="text-sm text-slate-500">Menampilkan pembayaran yang menunggu persetujuan admin.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Order ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Buyer</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Jasa</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Metode</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Jumlah</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Tanggal</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentsLoading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse bg-white border-b border-slate-100">
                        {Array.from({ length: 7 }).map((__, colIdx) => (
                          <td key={colIdx} className="py-4 px-4"><div className="h-4 bg-slate-200 rounded" /></td>
                        ))}
                      </tr>
                    ))
                  ) : paymentsData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">Tidak ada pembayaran yang perlu diverifikasi.</td>
                    </tr>
                  ) : (
                    paymentsData.map((item: any) => {
                      const orderId = item.order_id || item.orderId || item.id;
                      const buyer = item.buyer_name || item.buyer || '-';
                      const service = item.title || item.service_title || item.service || '-';
                      const method = item.payment_method ? item.payment_method.replace('_', ' ') : '-';
                      const date = item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '-';
                      const amount = item.amount ? `Rp ${Number(item.amount).toLocaleString('id-ID')}` : '-';

                      return (
                        <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-4 px-4 text-sm font-medium text-slate-800">GRF-{String(orderId).padStart(6, '0')}</td>
                          <td className="py-4 px-4 text-sm text-slate-600">{buyer}</td>
                          <td className="py-4 px-4 text-sm text-slate-600">{service}</td>
                          <td className="py-4 px-4 text-sm text-slate-600 capitalize">{method}</td>
                          <td className="py-4 px-4 text-sm font-semibold text-slate-800">{amount}</td>
                          <td className="py-4 px-4 text-sm text-slate-600">{date}</td>
                          <td className="py-4 px-4">
                            <div className="flex flex-wrap gap-2">
                              <button
                                className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
                                onClick={() => handleVerifyPayment(item.id)}
                                disabled={Boolean(paymentActionLoading[item.id])}
                              >
                                {paymentActionLoading[item.id] ? 'Memproses...' : 'Verifikasi'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
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
            <img
              src="/logo.png"
              alt="Logo Grafenda"
              className="w-8 h-8 object-contain"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent">
              Grafenda
            </span>
          </Link>
          <p className="text-sm text-slate-600 mt-2">Admin Panel</p>
        </div>

        <nav className="p-3 pb-24 space-y-1">
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

        {/* Sidebar Bottom: Avatar + Nama + Logout */}
        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-slate-200 bg-white">
          <div className="flex items-center gap-3 mb-3">
            {/* Avatar: foto profil jika ada, fallback ke inisial */}
            {adminAvatar ? (
              <img
                src={adminAvatar}
                alt={currentUserName}
                className="w-10 h-10 rounded-full object-cover border-2 border-blue-100 flex-shrink-0"
                onError={(e) => {
                  // Kalau gambar gagal load, sembunyikan dan tampilkan fallback
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            {/* Fallback inisial — ditampilkan jika tidak ada avatar atau gambar gagal */}
            <div
              className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
              style={{ display: adminAvatar ? 'none' : 'flex' }}
            >
              {(currentUserName || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-800 truncate">{currentUserName}</div>
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
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800">
              {sidebarMenus.find(m => m.id === activeMenu)?.label}
            </h1>
            <p className="text-slate-600 mt-2">Kelola platform Grafenda dengan mudah</p>
            {activeMenu === 'users' && (
              <p className="text-slate-500 mt-1">Cari, filter, dan kelola user aktif atau freelancer dengan mudah.</p>
            )}
          </div>

          {renderContent()}
        </div>
      </div>
    </div>
  );
}