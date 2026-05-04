import { useNavigate, useParams } from "react-router";
import { useState } from "react";
import { CreditCard, Wallet, Building2, CheckCircle2, ArrowLeft } from "lucide-react";

export function Payment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'ewallet' | 'va'>('ewallet');

  const order = {
    service: "Desain Logo Profesional - Paket Standard",
    seller: "Design Studio",
    package: "Standard",
    price: 220000,
    fee: 5000,
    total: 225000,
  };

  const handlePayment = () => {
    navigate(`/payment-success/${id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali</span>
        </button>

        <h1 className="text-3xl font-bold text-slate-800 mb-8">Pembayaran</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Payment Method */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Pilih Metode Pembayaran</h2>

              <div className="space-y-3">
                <button
                  onClick={() => setPaymentMethod('ewallet')}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'ewallet'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-800">E-Wallet</p>
                      <p className="text-sm text-slate-500">GoPay, OVO, DANA, ShopeePay</p>
                    </div>
                  </div>
                  {paymentMethod === 'ewallet' && <CheckCircle2 className="w-6 h-6 text-blue-600" />}
                </button>

                <button
                  onClick={() => setPaymentMethod('transfer')}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'transfer'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-800">Transfer Bank</p>
                      <p className="text-sm text-slate-500">BCA, Mandiri, BNI, BRI</p>
                    </div>
                  </div>
                  {paymentMethod === 'transfer' && <CheckCircle2 className="w-6 h-6 text-blue-600" />}
                </button>

                <button
                  onClick={() => setPaymentMethod('va')}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'va'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-800">Virtual Account</p>
                      <p className="text-sm text-slate-500">Permata, CIMB, BNI VA</p>
                    </div>
                  </div>
                  {paymentMethod === 'va' && <CheckCircle2 className="w-6 h-6 text-blue-600" />}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                <strong>Sistem Escrow:</strong> Pembayaran Anda akan disimpan dengan aman oleh admin hingga pekerjaan selesai dan Anda puas dengan hasilnya.
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Ringkasan Pesanan</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-slate-600 mb-1">{order.seller}</p>
                  <p className="font-semibold text-slate-800">{order.service}</p>
                </div>

                <div className="border-t border-slate-200 pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Paket {order.package}</span>
                    <span className="font-semibold text-slate-800">Rp {order.price.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Biaya Layanan</span>
                    <span className="font-semibold text-slate-800">Rp {order.fee.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-3 flex justify-between">
                    <span className="font-bold text-slate-800">Total</span>
                    <span className="font-bold text-blue-600 text-xl">Rp {order.total.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePayment}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-500 text-white py-3 rounded-xl hover:shadow-lg transition-shadow font-medium"
              >
                Bayar Sekarang
              </button>

              <p className="text-xs text-slate-500 mt-4 text-center">
                Dengan melanjutkan, Anda menyetujui syarat dan ketentuan kami
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
