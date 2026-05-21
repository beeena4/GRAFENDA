import { Link, useNavigate, useLocation } from "react-router";
import { Search, Bell, User, LogOut, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { API_ASSET_URL, notificationAPI, chatAPI } from "../../services/api";


const normalizeAvatarUrl = (avatar?: string | null) => {
  if (!avatar) return undefined;
  if (avatar.startsWith('http') || avatar.startsWith('blob:')) return avatar;
  if (avatar.startsWith('/')) return `${API_ASSET_URL}${avatar}`;
  return avatar;
};

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState<Array<any>>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [unreadChatCount, setUnreadChatCount] = useState<number>(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);


  const { user, logout } = useAuth();
  const isLoggedIn = Boolean(user);
  const userRole = user?.role || null;

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowProfileMenu(false);
  };

  const fetchNotifications = async () => {
    if (!user?.id) return;

    setIsLoadingNotifications(true);
    try {
      const { notifications: items, pagination } = await (await import('../../services/api')).notificationAPI.getUserNotifications({
        page: 1,
        limit: 10,
      });

      setNotifications(items ?? []);

      // unread_count is computed by backend separately (lebih ringan)
      const unreadRes = await (await import('../../services/api')).notificationAPI.getUnreadCount();
      setUnreadCount(unreadRes?.unread_count ?? 0);

      // jika backend mengirim unread juga di response list, nanti bisa dipakai
      void pagination;
    } catch {
      // silent fail (UI tetap jalan)
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    let isMounted = true;

    const fetchUnreadChats = async () => {
      try {
        let totalUnread = 0;
        let isFromDashboard = false;

        try {
          const dashboardAPI = (await import('../../services/api')).dashboardAPI;
          const dash = userRole === 'seller' ? await dashboardAPI.getSellerDashboard() : await dashboardAPI.getBuyerDashboard();
          
          if (dash?.stats?.unread_chats !== undefined) {
            totalUnread = Number(dash.stats.unread_chats);
            isFromDashboard = true;
          }
        } catch (e) {
          // Abaikan error dashboard API
        }

        if (!isFromDashboard) {
          const data = await chatAPI.getUserChats();
          const chats = Array.isArray(data) ? data : (data?.data || data?.chats || data?.conversations || []);
          totalUnread = Array.isArray(chats)
            ? chats.reduce((sum: number, chat: any) => sum + (Number(chat.unread_count) || 0), 0)
            : 0;
        }

        if (!isMounted) return;
        setUnreadChatCount(totalUnread);
      } catch (error) {
        console.error('Failed to fetch unread chats', error);
      }
    };

    fetchUnreadChats();
    const interval = setInterval(fetchUnreadChats, 15000); // Sinkronisasi setiap 15 detik

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user?.id, userRole]);



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
                <span className={`absolute -top-1 -right-1 min-w-5 h-5 ${unreadChatCount > 0 ? 'bg-red-500' : 'bg-slate-400'} text-white text-[10px] font-medium rounded-full px-1 flex items-center justify-center shadow-sm`}>
                  {unreadChatCount > 99 ? '99+' : unreadChatCount}
                </span>
                </Link>


                <div className="relative">
                  <button
                    onClick={() => {
                      const next = !showNotifications;
                      setShowNotifications(next);
                      if (next) fetchNotifications();
                    }}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors relative"
                >
                    <div className="relative">
                      <Bell className="w-5 h-5 text-slate-600" />
                      {unreadCount > 0 && (
                      <span className="absolute -top-3 -right-1 min-w-5 h-5 bg-red-500 text-white text-[10px] font-medium rounded-full px-1 flex items-center justify-center">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                  </button>


                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                      <div className="p-4 border-b border-slate-200">
                        <h3 className="font-semibold text-slate-800">Notifikasi</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {isLoadingNotifications ? (
                          <div className="p-4 text-sm text-slate-500">Memuat notifikasi...</div>
                        ) : notifications.length === 0 ? (
                          <div className="p-4 text-sm text-slate-500">Belum ada notifikasi</div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className={`p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer ${
                                notif.is_read ? '' : 'bg-blue-50'
                              }`}
                              onClick={async () => {
                                if (!notif.is_read) {
                                  try {
                                    const { notificationAPI } = await import('../../services/api');
                                    await notificationAPI.markAsRead(notif.id);
                                    fetchNotifications();
                                  } catch {
                                    // ignore
                                  }
                                }
                              }}
                            >
                              <p className="text-sm text-slate-800 font-semibold">
                                {notif.title || 'Notifikasi'}
                              </p>
                              {notif.message && (
                                <p className="text-sm text-slate-700 mt-1">{notif.message}</p>
                              )}
                              <p className="text-xs text-slate-500 mt-1">
                                {notif.created_at ? new Date(notif.created_at).toLocaleString('id-ID') : ''}
                              </p>
                            </div>
                          ))
                        )}
                      </div>

                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-2 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    {normalizeAvatarUrl(user?.avatar ?? null) ? (
                      <img
                        src={normalizeAvatarUrl(user?.avatar ?? null)}
                        alt={user?.full_name || 'Profil'}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
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
