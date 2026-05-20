import { useNavigate, useParams, useLocation } from "react-router";
import { useState, useEffect, useRef } from "react";
import { Send, ArrowLeft, Paperclip, ShoppingCart, Loader } from "lucide-react";
import { chatAPI, orderAPI } from "../../services/api";

export function Chat() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    // Timeout memastikan DOM selesai merender pesan baru sebelum melakukan scroll
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!id) return;

    let unsubscribeChat: (() => void) | undefined;

    const initializeChat = async () => {
      try {
        setLoading(true);
        const numericId = Number(id);
        let orderData: any = null;

        if (!Number.isNaN(numericId)) {
          try {
            orderData = await orderAPI.getOrderById(numericId);
          } catch (err: any) {
            if (err.response?.status !== 404) {
              throw err;
            }
          }
        }

        if (!orderData) {
          const allOrders = await orderAPI.getUserOrders(1, 100);
          const matchedOrder = allOrders.orders.find(
            (order: any) => order.service_id === numericId || order.service_title === location.state?.serviceName
          );

          if (matchedOrder) {
            orderData = await orderAPI.getOrderById(matchedOrder.id);
          }
        }

        if (!orderData) {
          setError('Anda belum memiliki order terkait layanan ini. Silakan pesan terlebih dahulu untuk memulai chat.');
          setLoading(false);
          return;
        }

        setOrder(orderData);

        unsubscribeChat = chatAPI.subscribeToOrderMessages(orderData.id, (data) => {
          setMessages(data?.messages || []);
          setLoading(false);
          setError(null);
        });
      } catch (err: any) {
        console.error('Error fetching chat data:', err);
        setError('Gagal memuat ruang obrolan');
        setLoading(false);
      }
    };

    initializeChat();

    // Cleanup: Memutus interval polling saat keluar dari halaman chat
    return () => {
      if (unsubscribeChat) unsubscribeChat();
    };
  }, [id]);

  const handleSend = async () => {
    if (!message.trim() || !order) return;

    // Simpan pesan sementara untuk UX yang lebih responsif
    const tempMessage = message.trim();
    setMessage(''); 
    setSending(true);

    try {
      await chatAPI.sendMessage({
        order_id: order.id,
        receiver_id: order.seller_id,
        message: tempMessage,
        message_type: 'text',
      });
      
      // Kita tidak perlu memanggil getOrderMessages di sini lagi,
      // karena fungsi realtime/polling akan otomatis menariknya dalam 2 detik.
      // Namun jika ingin benar-benar instan, polling yang menangkapnya sudah cukup cepat.
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError('Gagal mengirim pesan');
      setMessage(tempMessage); // Kembalikan teks jika gagal kirim
    } finally {
      setSending(false);
      scrollToBottom();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Memuat ruang obrolan...</p>
        </div>
      </div>
    );
  }

  const seller = {
    name: order?.seller_name || 'Penyedia Jasa',
    avatar: order?.seller_avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    status: 'online',
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate(-1)} 
                className="p-2 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              {/* Tambahan object-cover agar foto proporsional */}
              <img src={seller.avatar} alt={seller.name} className="w-12 h-12 rounded-full object-cover border border-slate-100" />
              <div>
                <h3 className="font-semibold text-slate-800">{seller.name}</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-slate-500 capitalize">{seller.status || 'online'}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate(order?.service_id ? `/service/${order.service_id}` : '/search')}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 text-white rounded-lg cursor-pointer hover:shadow-lg active:scale-95 transition-all duration-200"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>{order?.service_id ? 'Lihat Layanan' : 'Cari Layanan'}</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="h-[calc(100vh-200px)] overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-lg text-sm text-center">
              {error}
            </div>
          )}
          {messages.length === 0 && !error && (
            <div className="text-center text-slate-500 py-8 mt-10">
              <p>Belum ada pesan. Mulai percakapan sekarang!</p>
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_id === order?.buyer_id ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex items-end space-x-2 max-w-md">
                {msg.sender_id !== order?.buyer_id && (
                  <img src={seller.avatar} alt={seller.name} className="w-8 h-8 rounded-full object-cover" />
                )}
                <div>
                  <div
                    className={`px-4 py-3 rounded-2xl transition-all duration-200 ${
                      msg.sender_id === order?.buyer_id
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-br-sm shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'
                    }`}
                  >
                    <p className="leading-relaxed">{msg.message}</p>
                  </div>
                  <p className={`text-xs text-slate-500 mt-1 px-1 ${msg.sender_id === order?.buyer_id ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t border-slate-200 px-6 py-4">
          <div className="flex items-center space-x-3">
            {/* Tombol File / Paperclip */}
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer text-slate-500 hover:text-blue-600">
              <Paperclip className="w-5 h-5" />
            </button>
            
            {/* Kolom Ketik Pesan */}
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !sending && order) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={order ? 'Ketik pesan...' : 'Chat akan tersedia setelah order dibuat'}
              disabled={sending || !order}
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none hover:bg-white transition-all duration-200 cursor-text disabled:opacity-50"
            />
            
            {/* Tombol Kirim / Send */}
            <button
              onClick={handleSend}
              disabled={sending || !message.trim() || !order}
              className="p-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:shadow-md active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}