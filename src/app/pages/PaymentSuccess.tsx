import { Link, useParams } from "react-router";
import { CheckCircle, Download, Home, MessageCircle, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { orderAPI, paymentAPI } from "../../services/api";

export function PaymentSuccess() {
  const { id } = useParams();
  const [showNotification, setShowNotification] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const packagePrice = Number(order?.price) || 0;
  const ADMIN_FEE_RATE = 0.1;
  const adminFee = Math.round(packagePrice * ADMIN_FEE_RATE);
  const totalPayment = packagePrice + adminFee;

  useEffect(() => {
    // Memunculkan popup notifikasi
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);

    // Mengambil data transaksi yang asli berdasarkan ID
    if (id) {
      orderAPI.getOrderById(Number(id))
        .then(async (data) => {
          setOrder(data);
          try {
            const payments = await paymentAPI.getPaymentByOrderId(data.id);
            setPayment(Array.isArray(payments) ? payments[0] : payments);
          } catch (paymentErr) {
            console.error('Gagal memuat data payment', paymentErr);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Gagal memuat data order", err);
          setLoading(false);
        });
    }
  }, [id]);

  const getFileNameFromDisposition = (disposition: string | null) => {
    if (!disposition) return `invoice-${order?.id || 'receipt'}.pdf`;
    const match = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
    if (match?.[1]) {
      return match[1].replace(/['"]/g, '');
    }
    return `invoice-${order?.id || 'receipt'}.pdf`;
  };

  const handleDownloadInvoice = async () => {
    if (!payment) {
      setDownloadError('Data pembayaran tidak tersedia untuk mengunduh invoice.');
      return;
    }

    setDownloading(true);
    setDownloadError(null);

    try {
      const response = await paymentAPI.generateReceipt(payment.id);
      const contentTypeHeader = response.headers['content-type'];
      const contentType = typeof contentTypeHeader === 'string' ? contentTypeHeader : 'application/pdf';
      const blob = new Blob([response.data], { type: contentType });
      const dispositionHeader = response.headers['content-disposition'];
      const disposition = typeof dispositionHeader === 'string' ? dispositionHeader : null;
      const fileName = getFileNameFromDisposition(disposition);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Gagal mengunduh invoice', err);
      setDownloadError(err.response?.data?.message || err.message || 'Gagal mengunduh invoice.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Menyiapkan invoice Anda...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Notification Popup */}
      {showNotification && (
        <div className="fixed top-24 right-4 z-50 animate-slide-in-right">
          <div className="bg-white rounded-xl shadow-2xl border border-green-200 p-4 flex items-center space-x-3 max-w-sm">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Pembayaran Diproses!</p>
              <p className="text-sm text-slate-600">Pembayaran berhasil diproses.</p>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>

            <h1 className="text-2xl font-bold text-slate-800 mb-4">Pembayaran Berhasil!</h1>
            <p className="text-slate-600 mb-8">Pembayaran Anda telah diterima. Seller akan segera memproses pesananmu.</p>


            {/* Invoice Dinamis */}
            <div className="bg-slate-50 rounded-xl p-6 mb-8 text-left border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">Invoice</h2>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                  Berhasil
                </span>

              </div>

              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-slate-200">
                  <span className="text-slate-600">Order ID</span>
                  <span className="font-semibold text-slate-800">#{order?.id || id}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-200">
                  <span className="text-slate-600">Tanggal</span>
                  <span className="font-semibold text-slate-800">
                    {order?.created_at ? new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleDateString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-200">
                  <span className="text-slate-600">Jasa</span>
                  <span className="font-semibold text-slate-800 text-right max-w-[250px] truncate">
                    {order?.service_title || 'Layanan Profesional'}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-200">
                  <span className="text-slate-600">Penyedia Jasa</span>
                  <span className="font-semibold text-slate-800">{order?.seller_name || 'Seller'}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-200">
                  <span className="text-slate-600">Metode Pembayaran</span>
                  <span className="font-semibold text-slate-800 uppercase">Transfer / E-Wallet</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-200">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-semibold text-slate-800">Rp {packagePrice.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-200">
                  <span className="text-slate-600">Biaya Admin</span>
                  <span className="font-semibold text-slate-800">Rp {adminFee.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-slate-800 font-bold">Total</span>
                  <span className="text-blue-600 font-bold text-xl">
                    Rp {totalPayment.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
              <p className="text-sm text-blue-800">
                Pembayaran Anda telah kami terima dan sedang dalam proses verifikasi. Setelah disetujui, pesanan akan diteruskan ke penyedia jasa.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleDownloadInvoice}
                disabled={!order || downloading}
                className={`flex items-center justify-center space-x-2 px-6 py-3 border-2 rounded-xl transition-colors duration-200 ${downloading ? 'border-slate-300 text-slate-400 bg-slate-100 cursor-not-allowed' : 'border-blue-600 text-blue-600 hover:bg-blue-50 cursor-pointer active:scale-95'}`}
              >
                <Download className="w-5 h-5" />
                <span>{downloading ? 'Mengunduh...' : 'Unduh Invoice'}</span>
              </button>
              <Link
                to={`/chat/${id}`}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-500 text-white rounded-xl hover:shadow-lg transition-shadow cursor-pointer active:scale-95"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Chat Seller</span>
              </Link>
            </div>
            {downloadError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {downloadError}
              </div>
            )}

            <Link 
              to="/dashboard/user" 
              className="inline-flex items-center space-x-2 text-slate-600 hover:text-blue-600 mt-6 cursor-pointer"
            >
              <Home className="w-5 h-5" />
              <span>Kembali ke Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}