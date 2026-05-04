import { Link, useNavigate, useLocation } from "react-router";
import { Search, Bell, User, LogOut, MessageCircle } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Order #1234 telah selesai", time: "2 menit lalu", unread: true },
    { id: 2, text: "Pembayaran dikonfirmasi", time: "1 jam lalu", unread: true },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  const isLoggedIn = location.pathname.includes('/dashboard') || location.pathname.includes('/profile');
  const userRole = location.pathname.includes('/dashboard/seller') || location.pathname.includes('/profile/seller') ? 'seller' :
                   location.pathname.includes('/dashboard/user') || location.pathname.includes('/profile/user') ? 'user' : null;

  const handleLogout = () => {
    navigate('/');
    setShowProfileMenu(false);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
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

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/search" className="text-slate-600 hover:text-blue-600 transition-colors">
              Jelajahi
            </Link>
            {!isLoggedIn && (
              <Link to="/register-seller" className="text-slate-600 hover:text-blue-600 transition-colors">
                Jadi Freelancer
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => navigate('/search')}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Search className="w-5 h-5 text-slate-600" />
                </button>

                <Link
                  to="/inbox"
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors relative"
                >
                  <MessageCircle className="w-5 h-5 text-slate-600" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors relative"
                  >
                    <Bell className="w-5 h-5 text-slate-600" />
                    {notifications.some(n => n.unread) && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                      <div className="p-4 border-b border-slate-200">
                        <h3 className="font-semibold text-slate-800">Notifikasi</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer ${
                              notif.unread ? 'bg-blue-50' : ''
                            }`}
                          >
                            <p className="text-sm text-slate-800">{notif.text}</p>
                            <p className="text-xs text-slate-500 mt-1">{notif.time}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-2 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                      <Link
                        to={userRole === 'seller' ? '/profile/seller' : '/profile/user'}
                        className="block px-4 py-3 hover:bg-slate-50 text-slate-700"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        Profil Saya
                      </Link>
                      <Link
                        to={userRole === 'seller' ? '/dashboard/seller' : '/dashboard/user'}
                        className="block px-4 py-3 hover:bg-slate-50 text-slate-700"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 flex items-center space-x-2 border-t border-slate-200"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Keluar</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-6 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-500 text-white rounded-lg hover:shadow-lg transition-shadow"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
