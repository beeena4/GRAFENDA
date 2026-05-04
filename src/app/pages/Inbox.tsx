import { Link, useNavigate } from "react-router";
import { Search, MoreVertical, ArrowLeft } from "lucide-react";
import { useState } from "react";

export function Inbox() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const conversations = [
    {
      id: 1,
      serviceId: 1,
      name: 'Design Studio',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      lastMessage: 'Baik, saya akan segera memproses order Anda!',
      timestamp: '10:33',
      unread: 2,
      online: true,
    },
    {
      id: 2,
      serviceId: 2,
      name: 'Creative Media',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100',
      lastMessage: 'Terima kasih! Akan saya kerjakan dengan baik',
      timestamp: 'Kemarin',
      unread: 0,
      online: false,
    },
    {
      id: 3,
      serviceId: 3,
      name: 'WordCraft',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100',
      lastMessage: 'File sudah saya kirim, silakan dicek',
      timestamp: '2 hari lalu',
      unread: 1,
      online: false,
    },
    {
      id: 4,
      serviceId: 4,
      name: 'Social Design Co',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100',
      lastMessage: 'Revisi pertama sudah selesai',
      timestamp: '3 hari lalu',
      unread: 0,
      online: true,
    },
  ];

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 mb-6 transition-colors"
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
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="divide-y divide-slate-100">
            {filteredConversations.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <p>Tidak ada percakapan ditemukan</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <Link
                  key={conv.id}
                  to={`/chat/${conv.serviceId}`}
                  className="flex items-center p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="relative">
                    <img
                      src={conv.avatar}
                      alt={conv.name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    {conv.online && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>

                  <div className="flex-1 ml-4 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-slate-800 truncate">{conv.name}</h3>
                      <span className="text-xs text-slate-500 ml-2 flex-shrink-0">{conv.timestamp}</span>
                    </div>
                    <p className="text-sm text-slate-600 truncate">{conv.lastMessage}</p>
                  </div>

                  <div className="ml-4 flex items-center space-x-2">
                    {conv.unread > 0 && (
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                        {conv.unread}
                      </div>
                    )}
                    <button className="p-1 hover:bg-slate-200 rounded-lg transition-colors">
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
