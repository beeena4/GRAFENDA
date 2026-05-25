import { useParams, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, MessageCircle, Star, Clock, CheckCircle2, XCircle, Download } from "lucide-react";
import { orderAPI } from "../../services/api";

export function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      try {
        const data = await orderAPI.getOrderById(Number(id));
        setOrder(data);
      } catch (err) {
        console.error("Gagal memuat pesanan", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center text-slate-500">Memuat detail pesanan...</div>
      </div>
    );
  }

  if (!order) {
    return <div className="p-10 text-center">Pesanan tidak ditemukan.</div>;
  }

  // 1. Normalisasi Status & Anti-NULL (Wajib)
  const safeStatus = order?.status ? order.status.toLowerCase().trim() : 'pending';
  
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return {
          color: "bg-green-600",
          lightColor: "bg-green-50",
          textColor: "text-green-600",
          icon: <CheckCircle2 className="w-10 h-10 text-green-200" />,
          step: 4
        };
      case "paid":
      case "process":
        return {
          color: "bg-blue-600",
          lightColor: "bg-blue-50",
          textColor: "text-blue-600",
          icon: <Clock className="w-10 h-10 text-blue-200" />,
          step: 3
        };
      case "accepted":
        return {
          color: "bg-orange-500",
          lightColor: "bg-orange-50",
          textColor: "text-orange-600",
          icon: <Clock className="w-10 h-10 text-orange-200" />,
          step: 2
        };
      case "cancelled":
        return {
          color: "bg-red-500",
          lightColor: "bg-red-50",
          textColor: "text-red-600",
          icon: <XCircle className="w-10 h-10 text-red-200" />,
          step: 0
        };
      case "pending":
      default:
        return {
          color: "bg-slate-500",
          lightColor: "bg-slate-50",
          textColor: "text-slate-600",
          icon: <Clock className="w-10 h-10 text-slate-200" />,
          step: 1
        };
    }
  };

  const config = getStatusConfig(safeStatus);

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      pending: 'Menunggu Seller', 
      accepted: 'Menunggu Pembayaran',
      paid: 'Sedang Diproses', 
      process: 'Sedang Diproses',
      completed: 'Selesai', 
      cancelled: 'Dibatalkan',
    };
    return map[status] || 'Menunggu';
  };

  const handleDownloadResult = async (url: string, filename: string) => {
    try {
      const fullUrl = url.startsWith('/') ? `${(import.meta.env.VITE_API_URL as string)?.replace(/\/api$/, '') || 'http://localhost:3000'}${url}` : url;
      const response = await fetch(fullUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'hasil-pesanan';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Gagal mengunduh file:', err);
      window.open(url.startsWith('/') ? `${(import.meta.env.VITE_API_URL as string)?.replace(/\/api$/, '') || 'http://localhost:3000'}${url}` : url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-slate-600 hover:text-blue-600 mb-6 transition-colors cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>Kembali</span>
        </button>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
          <div className={`${config.color} p-6 text-white flex justify-between items-center transition-colors duration-500`}>
            <div>
              <p className="opacity-80 text-sm">Status Pesanan</p>
              <h1 className="text-xl font-bold">{getStatusLabel(safeStatus)}</h1>
            </div>
            {config.icon}
          </div>

          <div className="p-8 space-y-8">
            {/* Progress Step */}
            {safeStatus !== 'cancelled' && (
              <div className="relative flex justify-between">
                {[
                  { label: "Menunggu", step: 1 },
                  { label: "Bayar", step: 2 },
                  { label: "Proses", step: 3 },
                  { label: "Selesai", step: 4 },
                ].map((item, index) => (
                  <div key={index} className="flex flex-col items-center z-10 w-16">
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
                    style={{ width: config.step === 1 ? '0%' : config.step === 2 ? '33.33%' : config.step === 3 ? '66.66%' : '100%' }}
                  />
                </div>
              </div>
            )}

            {/* Rincian Info */}
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Nomor Pesanan</p>
                <p className="text-sm font-bold text-slate-800">GRF-{String(order.id).padStart(6, '0')}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Total Bayar</p>
                <p className="text-sm font-bold text-blue-600">{formatRupiah(order.price)}</p>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="space-y-3">
              <h3 className="font-bold text-slate-800 text-sm">Aksi Pesanan</h3>
              
              <div className="grid grid-cols-1 gap-3">
                {/* Chat Seller */}
                <button 
                  onClick={() => navigate(`/chat/${order.id}`)}
                  className="flex items-center justify-center space-x-2 w-full py-3 border-2 border-blue-600 text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Chat Seller</span>
                </button>

                {/* Tombol Bayar Sekarang */}
                {safeStatus === "accepted" && (
                  <button 
                    onClick={() => navigate(`/payment/${order.service_id}`, { state: { selectedPackageId: order.package_id, orderId: order.id } })}
                    className="flex items-center justify-center space-x-2 w-full py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 shadow-lg shadow-orange-200 transition-all cursor-pointer active:scale-[0.98]"
                  >
                    <Clock className="w-5 h-5" />
                    <span>Bayar Sekarang</span>
                  </button>
                )}

                {/* Unduh Hasil */}
                {safeStatus === "completed" && order.result_image && (
                  <button 
                    onClick={() => handleDownloadResult(order.result_image, `Hasil_Order_GRF-${order.id}`)}
                    className="flex items-center justify-center space-x-2 w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200 transition-all cursor-pointer active:scale-[0.98]"
                  >
                    <Download className="w-5 h-5" />
                    <span>Unduh Hasil Pesanan</span>
                  </button>
                )}

                {/* Beri Review */}
                {safeStatus === "completed" && (
                  <button 
                    onClick={() => navigate(`/order/${order.id}/review`, { 
                      state: { 
                        from: 'order-detail',
                        orderId: order.id 
                      } 
                    })}
                    className="flex items-center justify-center space-x-2 w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all cursor-pointer active:scale-[0.98]"
                  >
                    <Star className="w-5 h-5" />
                    <span>Beri Review Sekarang</span>
                  </button>
                )}

                {/* Info Seller sedang mengerjakan */}
                {(safeStatus === "paid" || safeStatus === "process") && (
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