import { useNavigate, useParams, useLocation } from "react-router";
import { useState, useEffect, useRef, useMemo } from "react";
import { Send, ArrowLeft, Paperclip, ShoppingCart, Loader } from "lucide-react";
import { chatAPI, orderAPI, API_ASSET_URL } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

type ChatMessage = {
  id: number;
  order_id: number;
  sender_id: number;
  receiver_id: number;
  message?: string | null;
  message_type?: 'text' | 'image' | 'file' | string;
  file_url?: string | null;
  file_name?: string | null;
  created_at: string;
};

function resolveImageUrl(url?: string | null) {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('blob:')) return url;
  // URL relatif
  if (url.startsWith('/')) return `${API_ASSET_URL}${url}`;
  return `${API_ASSET_URL}/${url}`;
}


function getFileKind(file: File): 'image' | 'file' {
  if (file.type.startsWith('image/')) return 'image';
  return 'file'; 
}

export function Chat() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<any>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const currentUserId = user?.id;
  const otherPartyAvatar = useMemo(() => {
    const raw = currentUserId === order?.buyer_id ? order?.seller_avatar : order?.buyer_avatar;
    return resolveImageUrl(raw) || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100';
  }, [currentUserId, order]);

  const otherPartyName = currentUserId === order?.buyer_id ? order?.seller_name : order?.buyer_name;

  useEffect(() => {
    if (!id) return;

    let unsubscribeChat: (() => void) | undefined;

    const initializeChat = async () => {
      try {
        setLoading(true);

        const orderId = Number(id);
        if (Number.isNaN(orderId) || orderId < 1) {
          setError('ID order tidak valid untuk chat.');
          setLoading(false);
          return;
        }

        // Sinkron: route param ini selalu dianggap order_id
        const orderData = await orderAPI.getOrderById(orderId);
        setOrder(orderData);

        unsubscribeChat = chatAPI.subscribeToOrderMessages(
          orderData.id,
          (data) => {
            setMessages(
              Array.isArray(data)
                ? (data as ChatMessage[])
                : ((data?.messages as ChatMessage[]) || [])
            );
            setLoading(false);
            setError(null);
          },
          (err) => {
            console.error('Error loading order messages:', err);
            setError('Gagal memuat pesan chat. Silakan muat ulang halaman.');
            setLoading(false);
          }
        );
      } catch (err: any) {
        console.error('Error fetching chat data:', err);
        setError(err.response?.data?.message || err.message || 'Gagal memuat ruang obrolan');
        setLoading(false);
      }
    };

    initializeChat();

    return () => {
      if (unsubscribeChat) unsubscribeChat();
    };
  }, [id]);

  useEffect(() => {
    return () => {
      if (filePreviewUrl && selectedFile) {
        try {
          URL.revokeObjectURL(filePreviewUrl);
        } catch {
          // ignore
        }
      }
    };
  }, [filePreviewUrl, selectedFile]);

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (filePreviewUrl) {
      try {
        URL.revokeObjectURL(filePreviewUrl);
      } catch {
        // ignore
      }
    }
    setFilePreviewUrl('');
  };

  const handlePickFile = () => {
    if (!order) return;
    fileInputRef.current?.click();
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      clearSelectedFile();
      return;
    }

    setSelectedFile(file);

    if (file.type.startsWith('image/')) {
      const preview = URL.createObjectURL(file);
      setFilePreviewUrl(preview);
    } else {
      setFilePreviewUrl('');
    }
  };

  const sendPayload = async (payload: {
    message_type: 'text' | 'image' | 'file';
    message?: string;
    file_url?: string;
  }) => {
    if (!order || !user) return;

    const sellerUserId = order.seller_user_id ?? order.seller_id;
    const receiverId = user.id === order.buyer_id ? sellerUserId : order.buyer_id;

    if (!receiverId) {
      setError('Gagal mengirim pesan: ID penerima tidak valid');
      return;
    }

    await chatAPI.sendMessage({
      order_id: order.id,
      receiver_id: receiverId,
      message: payload.message ?? (payload.message_type === 'text' ? (message.trim() || '') : ''),
      message_type: payload.message_type,
      file_url: payload.file_url,
    });

    const refreshed = await chatAPI.getOrderMessages(order.id);
    setMessages(Array.isArray(refreshed) ? (refreshed as ChatMessage[]) : (refreshed?.messages as ChatMessage[]) || []);
  };

  const handleSendText = async () => {
    if (!message.trim() || !order || !user) return;

    const tempMessage = message.trim();
    setMessage('');
    setSending(true);

    try {
      await sendPayload({
        message_type: 'text',
        message: tempMessage,
      });
      setError(null);
    } catch (err: any) {
      console.error('Error sending message:', err);
      const backendMessage = err.response?.data?.message || err.message || 'Gagal mengirim pesan';
      setError(`Gagal mengirim pesan: ${backendMessage}`);
      setMessage(tempMessage);
    } finally {
      setSending(false);
      scrollToBottom();
    }
  };

  const handleSendWithFile = async () => {
    if (!selectedFile || !order || !user) return;

    const file = selectedFile;
    setSending(true);
    setError(null);

    try {
      // Upload dulu
      const formData = new FormData();
      formData.append('file', file);
      const uploaded = await chatAPI.uploadChatFile(formData);

      const kind = getFileKind(file); // image or file

      // Backend upload mengembalikan file_url seperti: /uploads/chats/xxx
      // Endpoint /chat/send memakai express-validator isURL(), jadi harus dibuat absolute URL.
      const uploadedFileUrl = uploaded.file_url;
      // Backend upload mengembalikan file_url seperti: /uploads/chats/xxx
      // /chat/send memakai express-validator isURL(), jadi harus absolute.
      // API_ASSET_URL sudah berisi base tanpa /api.
      const absoluteFileUrl = uploadedFileUrl
        ? uploadedFileUrl.startsWith('http')
          ? uploadedFileUrl
          : `${API_ASSET_URL}${uploadedFileUrl.startsWith('/') ? '' : '/'}${uploadedFileUrl}`
        : undefined;


      await sendPayload({
        message_type: kind,
        message: '',
        file_url: absoluteFileUrl,
      });

      clearSelectedFile();
    } catch (err: any) {
      console.error('Error sending file message:', err);
      const backendMessage = err.response?.data?.message || err.message || 'Gagal mengirim file';
      setError(`Gagal mengirim file: ${backendMessage}`);
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

  const chatParticipant = {
    name: currentUserId === order?.buyer_id ? order?.seller_name : order?.buyer_name || 'Penyedia Jasa',
    avatar: otherPartyAvatar,
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
              <img
                src={chatParticipant.avatar}
                alt={chatParticipant.name}
                className="w-12 h-12 rounded-full object-cover border border-slate-100"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100';
                }}
              />
              <div>
                <h3 className="font-semibold text-slate-800">{chatParticipant.name}</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-slate-500 capitalize">{chatParticipant.status || 'online'}</span>
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

          {messages.map((msg) => {
            const isOutgoing = msg.sender_id === currentUserId;
            const rawType = (msg.message_type || 'text') as 'text' | 'image' | 'file' | string;
            const fileUrl = resolveImageUrl(msg.file_url);
            const u = (msg.file_url || '').toString().toLowerCase();
            const isImageByExt = u.endsWith('.png') || u.endsWith('.jpg') || u.endsWith('.jpeg') || u.endsWith('.gif') || u.endsWith('.webp');
            // paksa gambar bila file_url mengarah ke ekstensi gambar (supaya tidak jatuh ke teks)
            const isImage = rawType === 'image' || isImageByExt;
            const type = isImage ? 'image' : (rawType === 'file' ? 'file' : 'text');

            return (
              <div
                key={msg.id}
                className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex items-end space-x-2 max-w-md">
                  {!isOutgoing && (
                    <img
                      src={otherPartyAvatar}
                      alt={otherPartyName || chatParticipant.name}
                      className="w-8 h-8 rounded-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100';
                      }}
                    />
                  )}

                  <div>
                    <div
                      className={`px-4 py-3 rounded-2xl transition-all duration-200 ${
                        isOutgoing
                          ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-br-sm shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'
                      }`}
                    >
                      {type === 'image' && fileUrl ? (
                        <div className="space-y-2">
                          <img
                            src={fileUrl}
                            alt={msg.file_name || 'Gambar'}
                            className="max-w-[320px] rounded-md border border-white/20"
                            onError={(e) => {
                              const el = e.currentTarget as HTMLImageElement;
                              // fallback to force showing something instead of plain text
                              el.style.display = 'none';
                            }}
                          />
                          {msg.message ? <p className="leading-relaxed">{msg.message}</p> : null}
                        </div>
                      ) : type === 'file' && fileUrl ? (
                        <div className="space-y-2">
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 underline underline-offset-2 break-all"
                          >
                            <span className="font-medium">{msg.file_name || 'Dokumen'}</span>
                            <span className="text-xs opacity-90">(klik untuk buka)</span>
                          </a>
                          {msg.message ? <p className="leading-relaxed">{msg.message}</p> : null}
                        </div>
                      ) : (
                        <p className="leading-relaxed">{msg.message}</p>
                      )}
                    </div>

                    <p className={`text-xs text-slate-500 mt-1 px-1 ${isOutgoing ? 'text-right' : 'text-left'}`}>
                      {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t border-slate-200 px-6 py-4">
          <div className="flex items-center space-x-3">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.zip,.rar"
              onChange={handleFileChange}
              disabled={sending || !order}
            />

            <button
              type="button"
              onClick={handlePickFile}
              disabled={sending || !order}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer text-slate-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !sending && order) {
                  e.preventDefault();
                  handleSendText();
                }
              }}
              placeholder={order ? 'Ketik pesan...' : 'Chat akan tersedia setelah order dibuat'}
              disabled={sending || !order}
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none hover:bg-white transition-all duration-200 cursor-text disabled:opacity-50"
            />

            <button
              onClick={async () => {
                if (selectedFile) {
                  await handleSendWithFile();
                  return;
                }
                await handleSendText();
              }}
              disabled={
                sending ||
                !order ||
                (selectedFile ? false : !message.trim())
              }
              className="p-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:shadow-md active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title={selectedFile ? 'Kirim file' : 'Kirim pesan teks'}
            >
              {sending ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : selectedFile ? (
                <Send className="w-5 h-5" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>

          {selectedFile && (
            <div className="mt-3 flex items-start gap-3">
              {filePreviewUrl ? (
                <img src={filePreviewUrl} alt="Preview" className="w-16 h-16 rounded-md border border-slate-200 object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-md border border-slate-200 bg-slate-50 flex items-center justify-center text-xs text-slate-500">
                  FILE
                </div>
              )}
              <div className="flex-1">
                <div className="text-sm text-slate-800 font-medium truncate">{selectedFile.name}</div>
                <div className="text-xs text-slate-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type || 'application/octet-stream'}
                </div>
              </div>
              <button
                type="button"
                onClick={clearSelectedFile}
                disabled={sending}
                className="text-xs px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
              >
                Hapus
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

