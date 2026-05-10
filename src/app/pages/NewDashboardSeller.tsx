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

  const [activeTab, setActiveTab] = useState<
    "orders" | "services" | "earnings"
  >("orders");

  const [activeMenu, setActiveMenu] = useState("dashboard");

  const stats = [
    {
      label: "Total Pendapatan",
      value: "Rp 5.430K",
      subtext: "+Rp 850K pending",
      icon: DollarSign,
      bg: "bg-blue-600",
    },
    {
      label: "Order Aktif",
      value: "5",
      subtext: "47 selesai",
      icon: ShoppingCart,
      bg: "bg-orange-500",
    },
    {
      label: "Waktu Respon",
      value: "< 2 jam",
      subtext: "Rata-rata",
      icon: Clock,
      bg: "bg-green-500",
    },
    {
      label: "Repeat Order",
      value: "23",
      subtext: "Customer",
      icon: Repeat,
      bg: "bg-purple-500",
    },
  ];

  const activeOrders = [
    {
      id: 1,
      title: "Desain Logo Profesional",
      buyer: "Rina Marlina",
      date: "2026-04-18",
      deadline: "2026-04-20",
      amount: "Rp 150.000",
      status: "Menunggu Konfirmasi",
      statusColor: "bg-yellow-100 text-yellow-700",
      actions: ["accept", "reject"],
    },
    {
      id: 2,
      title: "Video Editing Youtube",
      buyer: "Andi Wijaya",
      date: "2026-04-17",
      deadline: "2026-04-22",
      amount: "Rp 200.000",
      status: "Dalam Pengerjaan",
      statusColor: "bg-blue-100 text-blue-700",
      actions: ["upload"],
    },
    {
      id: 3,
      title: "Ilustrasi Digital Custom",
      buyer: "Siti Nurhaliza",
      date: "2026-04-16",
      deadline: "2026-04-21",
      amount: "Rp 250.000",
      status: "Revisi",
      statusColor: "bg-orange-100 text-orange-700",
      actions: ["revision"],
    },
  ];

  const myServices = [
    {
      id: 1,
      title: "Desain Logo Profesional untuk Brand Anda",
      image:
        "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400",
      price: "Rp 150K",
      orders: 45,
      rating: 4.9,
    },
    {
      id: 2,
      title: "Desain Digital Custom Tema Apapun",
      image:
        "https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=400",
      price: "Rp 200K",
      orders: 32,
      rating: 5.0,
    },
    {
      id: 3,
      title: "Desain & Ilustrasi Social Media Feeds (any)",
      image:
        "https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=400",
      price: "Rp 175K",
      orders: 28,
      rating: 4.8,
    },
  ];

  const earnings = [
    {
      date: "18 Apr 2026",
      description: "Logo Design - Rina M.",
      amount: 150000,
      status: "Completed",
    },
    {
      date: "17 Apr 2026",
      description: "Video Editing - Andi W.",
      amount: 200000,
      status: "Pending",
    },
    {
      date: "16 Apr 2026",
      description: "Illustration - Siti N.",
      amount: 250000,
      status: "Pending",
    },
    {
      date: "15 Apr 2026",
      description: "Logo Design - Budi S.",
      amount: 150000,
      status: "Completed",
    },
    {
      date: "14 Apr 2026",
      description: "Social Media - Dian P.",
      amount: 175000,
      status: "Completed",
    },
  ];

  const totalEarnings = earnings.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const completedEarnings = earnings
    .filter((e) => e.status === "Completed")
    .reduce((sum, item) => sum + item.amount, 0);

  const pendingEarnings = totalEarnings - completedEarnings;

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
    navigate("/");
  };

  const renderOrders = () => {
    return (
      <div className="space-y-5">
        {activeOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="font-bold text-[18px] text-slate-800">
                  {order.title}
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  dari {order.buyer} • {order.date}
                </p>

                <p className="text-sm text-slate-400 mt-1">
                  Deadline: {order.deadline}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${order.statusColor}`}
              >
                {order.status}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <h4 className="font-bold text-slate-800">{order.amount}</h4>

              <div className="flex items-center gap-2">
                {order.actions.includes("accept") && (
                  <button className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-xl transition">
                    <CheckCircle className="w-4 h-4" />
                    <span>Terima</span>
                  </button>
                )}

                {order.actions.includes("reject") && (
                  <button className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-xl transition">
                    <XCircle className="w-4 h-4" />
                    <span>Tolak</span>
                  </button>
                )}

                {order.actions.includes("upload") && (
                  <button className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-xl transition">
                    <Upload className="w-4 h-4" />
                    <span>Upload Hasil</span>
                  </button>
                )}

                {order.actions.includes("revision") && (
                  <button className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-2 rounded-xl transition">
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
  };

  const renderServices = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">
            Jasa Saya
          </h2>

          <Link
            to="/seller/service/add"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Jasa</span>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {myServices.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
              />

              <div className="p-5">
                <h3 className="font-semibold text-slate-800 line-clamp-2 mb-4">
                  {service.title}
                </h3>

                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-blue-600">
                    {service.price}
                  </span>

                  <div className="text-sm text-slate-500">
                    ⭐ {service.rating}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/seller/service/${service.id}/edit`}
                    className="flex-1 flex items-center justify-center gap-2 border border-blue-600 text-blue-600 hover:bg-blue-50 py-2 rounded-xl transition"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </Link>

                  <button className="w-11 h-11 flex items-center justify-center border border-red-500 text-red-500 hover:bg-red-50 rounded-xl transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderEarnings = () => {
    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-3 gap-5">
          <div className="bg-blue-600 text-white rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <p className="text-sm opacity-80 mb-2">
              Total Penghasilan
            </p>

            <h2 className="text-3xl font-bold">
              Rp {totalEarnings.toLocaleString("id-ID")}
            </h2>
          </div>

          <div className="bg-green-600 text-white rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <p className="text-sm opacity-80 mb-2">
              Saldo Tersedia
            </p>

            <h2 className="text-3xl font-bold">
              Rp {completedEarnings.toLocaleString("id-ID")}
            </h2>

            <Link
              to="/withdraw"
              className="inline-block mt-3 text-sm underline"
            >
              Tarik Saldo
            </Link>
          </div>

          <div className="bg-yellow-500 text-white rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <p className="text-sm opacity-80 mb-2">
              Saldo Pending
            </p>

            <h2 className="text-3xl font-bold">
              Rp {pendingEarnings.toLocaleString("id-ID")}
            </h2>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-6">
            Riwayat Transaksi
          </h3>

          <div className="space-y-4">
            {earnings.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-none"
              >
                <div>
                  <p className="font-medium text-slate-800">
                    {item.description}
                  </p>

                  <p className="text-sm text-slate-500">
                    {item.date}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-slate-800">
                    Rp {item.amount.toLocaleString("id-ID")}
                  </p>

                  <span
                    className={`text-xs px-3 py-1 rounded-full ${
                      item.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (activeTab === "orders") return renderOrders();
    if (activeTab === "services") return renderServices();
    if (activeTab === "earnings") return renderEarnings();

    return renderOrders();
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex">
      {/* Sidebar */}
      <aside className="w-[260px] bg-[#eef3fb] border-r border-slate-200 fixed h-screen flex flex-col">
        {/* Logo */}
        <div className="px-6 pt-6">
          <Link to="/" className="flex items-center gap-3">
           <img 
              src="/logo.png" 
              alt="Logo Grafenda" 
              className="w-8 h-8 object-contain" 
            />

            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent">
              Grafenda
              </span>

              <p className="text-xs text-slate-500">
                Seller Panel
              </p>
            </div>
          </Link>
        </div>

        {/* Profile */}
        <div className="px-5 mt-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-500 rounded-2xl p-3 flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100"
              alt="profile"
              className="w-12 h-12 rounded-full object-cover"
            />

            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">
                Design Studio
              </p>

              <p className="text-blue-100 text-xs">
                @designstudio
              </p>
            </div>

            <div className="w-6 h-6 rounded-full bg-yellow-400 text-slate-800 text-xs font-bold flex items-center justify-center">
              5
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="mt-6 px-4 flex-1">
          {sidebarMenus.map((menu) => (
            <button
              key={menu.id}
              onClick={() => handleMenuClick(menu.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition text-sm font-medium ${
                activeMenu === menu.id
                  ? "bg-blue-600 text-white"
                  : "text-slate-700 hover:bg-white"
              }`}
            >
              <menu.icon className="w-5 h-5" />
              <span>{menu.label}</span>
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition"
          >
            <LogOut className="w-5 h-5" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-[260px] p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[34px] leading-tight font-bold text-slate-800">
            Dashboard Freelancer
          </h1>

          <p className="text-slate-500 mt-1">
            Kelola jasa dan order Anda dengan mudah
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-5 mb-8">
          {stats.map((stat, idx) => (
            <div
            key={idx}
            className="bg-white border border-slate-200 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg cursor-pointer"
            >
              <div
                className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}
              >
                <stat.icon className="w-5 h-5 text-white" />
              </div>

              <p className="text-sm text-slate-500 mb-1">
                {stat.label}
              </p>

              <h3 className="text-2xl font-bold text-slate-800">
                {stat.value}
              </h3>

              <p className="text-xs text-slate-400 mt-1">
                {stat.subtext}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="inline-flex gap-7 bg-white border border-slate-200 rounded-2xl p-1 mb-6">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-36 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === "orders"
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Manajemen Order
          </button>

          <button
            onClick={() => setActiveTab("services")}
            className={`px-36 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === "services"
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Pekerjaan Saya
          </button>

          <button
            onClick={() => setActiveTab("earnings")}
            className={`px-36 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === "earnings"
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Pendapatan
          </button>
        </div>

        {/* Content */}
        {renderContent()}
      </main>
    </div>
  );
}