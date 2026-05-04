import { Link, useParams } from "react-router";
import { CheckCircle, Download, Home, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

export function PaymentSuccess() {
  const { id } = useParams();
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  }, []);

  const invoice = {
    orderId: "GRF-2026-04-001",
    date: "18 April 2026, 14:30",
    service: "Desain Logo Profesional - Paket Standard",
    seller: "Design Studio",
    amount: 225000,
    paymentMethod: "GoPay",
    status: "Terbayar",
  };

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
              <p className="font-semibold text-slate-800">Pembayaran Berhasil!</p>
              <p className="text-sm text-slate-600">Bukti pembayaran telah dikirim ke admin</p>
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

            <h1 className="text-3xl font-bold text-slate-800 mb-2">Pembayaran Berhasil!</h1>
            <p className="text-slate-600 mb-8">Terima kasih telah melakukan pembayaran</p>

            {/* Invoice */}
            <div className="bg-slate-50 rounded-xl p-6 mb-8 text-left">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">Invoice</h2>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  {invoice.status}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-slate-200">
                  <span className="text-slate-600">Order ID</span>
                  <span className="font-semibold text-slate-800">{invoice.orderId}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-200">
                  <span className="text-slate-600">Tanggal</span>
                  <span className="font-semibold text-slate-800">{invoice.date}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-200">
                  <span className="text-slate-600">Jasa</span>
                  <span className="font-semibold text-slate-800 text-right">{invoice.service}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-200">
                  <span className="text-slate-600">Seller</span>
                  <span className="font-semibold text-slate-800">{invoice.seller}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-200">
                  <span className="text-slate-600">Metode Pembayaran</span>
                  <span className="font-semibold text-slate-800">{invoice.paymentMethod}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-slate-800 font-bold">Total</span>
                  <span className="text-blue-600 font-bold text-xl">
                    Rp {invoice.amount.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
              <p className="text-sm text-blue-800">
                Pembayaran Anda telah kami terima dan disimpan dalam sistem escrow. Seller akan mulai mengerjakan pesanan Anda segera.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center space-x-2 px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors">
                <Download className="w-5 h-5" />
                <span>Unduh Invoice</span>
              </button>
              <Link
                to={`/chat/${id}`}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:shadow-lg transition-shadow"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Chat Seller</span>
              </Link>
            </div>

            <Link to="/dashboard/user" className="inline-flex items-center space-x-2 text-slate-600 hover:text-blue-600 mt-6">
              <Home className="w-5 h-5" />
              <span>Kembali ke Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
