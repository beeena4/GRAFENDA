import { Link, useNavigate } from "react-router";
import { Search, MoreVertical, ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { chatAPI, API_ASSET_URL } from "../../services/api";

function resolveAvatarUrl(url?: string | null) {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('blob:')) return url;
  if (url.startsWith('/')) return `${API_ASSET_URL}${url}`;
  return url;
}

type BackendChatOrder = {
  id: number;
  other_party_name: string;
  other_party_avatar: string | null;
  last_message: string | null;
  last_message_time: string | null;
  unread_count: number;
};

export function Inbox() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conversations, setConversations] = useState<BackendChatOrder[]>([]);

  useEffect(() => {
    let cancelled = false;

    const load = async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true);
        setError(null);
        const data = await chatAPI.getUserChats();
        if (cancelled) return;
        const chats = Array.isArray(data) ? data : (data?.data || data?.chats || data?.conversations || []);
        setConversations(chats);
      } catch (err: any) {
        if (cancelled) return;
        setError(err?.response?.data?.message || err.message || 'Gagal memuat percakapan');
        if (showLoading) setConversations([]);
      } finally {
        if (!cancelled && showLoading) setLoading(false);
      }
    };

    load();
    
    const interval = setInterval(() => {
      load(false);
    }, 15000); // Polling setiap 15 detik di belakang layar

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const filteredConversations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((conv) => (conv.other_party_name || '').toLowerCase().includes(q));
  }, [conversations, searchQuery]);

  const formatTimestamp = (t: string | null) => {
    if (!t) return '';
    const d = new Date(t);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-slate-600 hover:text-blue-600 mb-6 transition-colors cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali</span>
        </button>

        <h1 className="text-3xl font-bold text-slate-800 mb-8">Pesan</h1>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Search */}
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari percakapan..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none hover:border-blue-400 hover:bg-white hover:shadow-sm transition-all duration-200 cursor-text"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 border-b border-slate-200 bg-red-50 text-red-800 text-sm text-center">
              {error}
            </div>
          )}

          {/* Conversations List */}
          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-12 text-center text-slate-500">
                <p>Memuat percakapan...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <p>Tidak ada percakapan ditemukan</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <Link
                  key={conv.id}
                  to={`/chat/${conv.id}`}
                  className="flex items-center p-4 hover:bg-slate-100 transition-all duration-200 cursor-pointer"
                >
                  <div className="relative">
                    <img
                      src={resolveAvatarUrl(conv.other_party_avatar)}
                      alt={conv.other_party_name}
                      className="w-14 h-14 rounded-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100';
                      }}
                    />
                    {/* Online indicator belum tersedia dari backend saat ini */}
                  </div>

                  <div className="flex-1 ml-4 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-slate-800 truncate">{conv.other_party_name}</h3>
                      <span className="text-xs text-slate-500 ml-2 flex-shrink-0">{formatTimestamp(conv.last_message_time)}</span>
                    </div>
                    <p className="text-sm text-slate-600 truncate">{conv.last_message || '—'}</p>
                  </div>

                  <div className="ml-4 flex items-center space-x-2">
                    {conv.unread_count > 0 && (
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                        {conv.unread_count}
                      </div>
                    )}
                    <button
                      type="button"
                      className="p-2 hover:bg-slate-200 rounded-lg transition-all duration-200 cursor-pointer"
                      onClick={(e) => e.preventDefault()}
                      aria-label="Opsi"
                    >
                      <MoreVertical className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
