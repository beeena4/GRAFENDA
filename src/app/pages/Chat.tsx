import { useNavigate, useParams } from "react-router";
import { useState } from "react";
import { Send, ArrowLeft, Paperclip, ShoppingCart } from "lucide-react";

export function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'seller',
      text: 'Halo! Terima kasih sudah tertarik dengan jasa saya. Ada yang bisa saya bantu?',
      time: '10:30',
    },
    {
      id: 2,
      sender: 'user',
      text: 'Halo, saya butuh logo untuk bisnis kafe saya. Bisa nego harga?',
      time: '10:32',
    },
    {
      id: 3,
      sender: 'seller',
      text: 'Tentu! Untuk logo kafe, saya sarankan paket Standard. Bisa nego di Rp 220.000 untuk Anda.',
      time: '10:33',
    },
    {
      id: 4,
      sender: 'auto',
      text: 'Seller menawarkan harga khusus: Rp 220.000 untuk Paket Standard',
      time: '10:33',
    },
  ]);

  const seller = {
    name: 'Design Studio',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    status: 'online',
  };

  const handleSend = () => {
    if (message.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          sender: 'user',
          text: message,
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setMessage('');

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            sender: 'seller',
            text: 'Baik, saya akan segera memproses order Anda!',
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }, 1000);
    }
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
              <img src={seller.avatar} alt={seller.name} className="w-12 h-12 rounded-full" />
              <div>
                <h3 className="font-semibold text-slate-800">{seller.name}</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-slate-500 capitalize">{seller.status}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate(`/payment/${id}`)}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 text-white rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Pesan</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="h-[calc(100vh-200px)] overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} ${
                msg.sender === 'auto' ? 'justify-center' : ''
              }`}
            >
              {msg.sender === 'auto' ? (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-lg text-sm max-w-md text-center cursor-pointer hover:bg-yellow-100 hover:shadow-sm transition-all duration-200">
                  {msg.text}
                </div>
              ) : (
                <div className="flex items-end space-x-2 max-w-md">
                  {msg.sender === 'seller' && (
                    <img src={seller.avatar} alt={seller.name} className="w-8 h-8 rounded-full" />
                  )}
                  <div>
                    <div
                      className={`px-4 py-3 rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:opacity-90 hover:-translate-y-0.5'
                          : 'bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 hover:-translate-y-0.5'
                      }`}
                    >
                      <p>{msg.text}</p>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 px-2">{msg.time}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="bg-white border-t border-slate-200 px-6 py-4">
          <div className="flex items-center space-x-3">
            {/* Tombol File / Paperclip */}
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
              <Paperclip className="w-5 h-5 text-slate-600" />
            </button>
            
            {/* Kolom Ketik Pesan */}
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ketik pesan..."
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none hover:border-blue-400 hover:bg-white hover:shadow-sm transition-all duration-200 cursor-text"
            />
            
            {/* Tombol Kirim / Send */}
            <button
              onClick={handleSend}
              className="p-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}