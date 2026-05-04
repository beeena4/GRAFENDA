import { useParams, useNavigate } from "react-router";
import { ordersData } from "./mockData";
import { ArrowLeft, Package, MessageCircle, FileText, MapPin, Star, Clock, CheckCircle2 } from "lucide-react";

export function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const order = ordersData.find((item) => item.id === Number(id));

  if (!order) {
    return <div className="p-10 text-center">Pesanan tidak ditemukan.</div>;
  }
  
  // 1. Logika Penentuan Warna & Ikon berdasarkan Status
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Selesai":
        return {
          color: "bg-green-600",
          lightColor: "bg-green-50",
          textColor: "text-green-600",
          icon: <CheckCircle2 className="w-10 h-10 text-green-200" />,
          step: 3
        };
      case "Menunggu Review":
        return {
          color: "bg-yellow-500",
          lightColor: "bg-yellow-50",
          textColor: "text-yellow-600",
          icon: <Star className="w-10 h-10 text-yellow-200" />,
          step: 3 // Sudah selesai pengerjaan, tinggal review
        };
      case "Dalam Proses":
      default:
        return {
          color: "bg-blue-600",
          lightColor: "bg-blue-50",
          textColor: "text-blue-600",
          icon: <Clock className="w-10 h-10 text-blue-200" />,
          step: 2
        };
    }
  };

  const config = getStatusConfig(order.status);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <button onClick={() => navigate(-1)} className="flex items-center text-slate-600 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>Kembali</span>
        </button>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
          <div className={`${config.color} p-6 text-white flex justify-between items-center transition-colors duration-500`}>
            <div>
              <p className="opacity-80 text-sm">Status Pesanan</p>
              <h1 className="text-xl font-bold">{order.status}</h1>
            </div>
            {config.icon}
          </div>

          <div className="p-8 space-y-8">
            <div className="relative flex justify-between">
              {[
                { label: "Dibayar", step: 1 },
                { label: "Proses", step: 2 },
                { label: "Selesai", step: 3 },
              ].map((item, index) => (
                <div key={index} className="flex flex-col items-center z-10 w-20">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    config.step >= item.step ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {item.step}
                  </div>
                  <span className={`text-[10px] mt-2 font-semibold uppercase ${config.step >= item.step ? 'text-blue-600' : 'text-slate-400'}`}>
                    {item.label}
                  </span>
                </div>
              ))}
              <div className="absolute top-4 left-10 right-10 h-0.5 bg-slate-100 -z-0">
                <div 
                  className="h-full bg-blue-600 transition-all duration-700" 
                  style={{ width: config.step === 1 ? '0%' : config.step === 2 ? '50%' : '100%' }}
                />
              </div>
            </div>

            {/* Rincian Info */}
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Nomor Pesanan</p>
                <p className="text-sm font-bold text-slate-800">{order.orderId}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Total Bayar</p>
                <p className="text-sm font-bold text-blue-600">{order.amount}</p>
              </div>
            </div>

            {/* Tombol Berdasarkan Status */}
            <div className="space-y-3">
              <h3 className="font-bold text-slate-800 text-sm">Aksi Pesanan</h3>
              
              <div className="grid grid-cols-1 gap-3">
                {/* Tombol Chat selalu muncul */}
                <button className="flex items-center justify-center space-x-2 w-full py-3 border-2 border-blue-600 text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all">
                  <MessageCircle className="w-5 h-5" />
                  <span>Chat Seller</span>
                </button>

                {/* Tombol Khusus Selesai / Menunggu Review */}
                {(order.status === "Selesai" || order.status === "Menunggu Review") && (
                  <button 
                    onClick={() => navigate(`/order/${order.id}/review`)}
                    className="flex items-center justify-center space-x-2 w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
                  >
                    <Star className="w-5 h-5" />
                    <span>Beri Review Sekarang</span>
                  </button>
                )}

                {/* Pesan Tambahan jika masih dalam proses */}
                {order.status === "Dalam Proses" && (
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <p className="text-xs text-blue-700 leading-relaxed text-center italic">
                      "Seller sedang mengerjakan pesananmu. Kamu akan menerima notifikasi jika pengerjaan telah selesai."
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}