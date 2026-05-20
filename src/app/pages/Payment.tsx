import { useNavigate, useParams, useLocation } from "react-router";
import { useState, useEffect } from "react";
import { CreditCard, Wallet, Building2, CheckCircle2, ArrowLeft, Loader } from "lucide-react";
import { serviceAPI, orderAPI, paymentAPI } from "../../services/api"; // Tambahkan paymentAPI

export function Payment() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'ewallet' | 'va'>('ewallet');
  const [service, setService] = useState<any>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(location.state?.selectedPackageId || null);
  const [orderNotes, setOrderNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ADMIN_FEE_RATE = 0.1;
  const selectedPackage = service?.packages?.find((pkg: any) => pkg.id === selectedPackageId) || service?.packages?.[0] || null;
  const packagePrice = Number(selectedPackage?.price) || 0;
  const adminFee = Math.round(packagePrice * ADMIN_FEE_RATE);
  const totalAmount = packagePrice + adminFee;

  const paymentMethodLabel = paymentMethod === 'ewallet' ? 'E-Wallet' : paymentMethod === 'transfer' ? 'Transfer Bank' : 'Virtual Account';

  const handlePayment = async () => {
    if (!service || !selectedPackage) {
      setError('Pilih paket terlebih dahulu sebelum melanjutkan pembayaran.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // 1. Buat Pesanan (Order) di Database terlebih dahulu
      const order = await orderAPI.createOrder({
        service_id: Number(id),
        package_id: selectedPackage.id,
        title: service.title,
        description: orderNotes,
      });

      // 2. Map metode pembayaran ke nilai yang sesuai dengan enum backend
      const mappedMethod = paymentMethod === 'transfer'
        ? 'bank_transfer'
        : paymentMethod === 'va'
          ? 'virtual_account'
          : 'e_wallet';

      // 3. Simpan pilihan metode pembayaran ke database menggunakan ID order yang baru saja terbuat
      await paymentAPI.uploadPaymentProof({
        order_id: order.id,
        payment_method: mappedMethod,
      });

      // 4. Berhasil, lanjut ke halaman sukses dengan ID order
      navigate(`/payment-success/${order.id}`);
    } catch (err: any) {
      console.error('Error creating order/payment:', err);
      setError(err.response?.data?.message || err.message || 'Gagal memproses pembayaran.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!id) return;

    // PERBAIKAN: Menggunakan fitur realtime (polling) agar jika harga/paket diubah penjual,
    // halaman checkout pembeli langsung menyesuaikan harganya otomatis.
    setLoading(true);
    
    const unsubscribeService = serviceAPI.subscribeToService(
      Number(id),
      (data) => {
        setService(data);
        // Set paket default hanya jika sebelumnya masih kosong
        setSelectedPackageId((prev) => prev || data?.packages?.[0]?.id || null);
        setLoading(false);
      },
      (err) => {
        console.error('Error loading service for checkout:', err);
        setError('Gagal memuat layanan. Silakan coba lagi.');
        setLoading(false);
      }
    );

    // Cleanup: Matikan realtime saat pindah halaman
    return () => {
      if (unsubscribeService) unsubscribeService();
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-14 h-14 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Memuat checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-slate-600 hover:text-blue-600 mb-6 transition-colors cursor-pointer active:scale-95 w-max"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          <span>Kembali</span>
        </button>

        <h1 className="text-3xl font-bold text-slate-800 mb-4">Pembayaran</h1>
        <p className="max-w-2xl text-slate-600 mb-8">Paket sudah dipilih pada halaman detail layanan. Lanjutkan pembayaran dan konfirmasi pesanan Anda.</p>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Payment Method */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Ringkasan Paket</h2>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 mb-6">
                <p className="text-sm text-slate-600 mb-3">Paket yang dipilih pada halaman detail layanan.</p>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-800">{selectedPackage?.name || selectedPackage?.package_type || 'Paket terpilih'}</p>
                    <p className="text-sm text-slate-500">{selectedPackage?.description || 'Deskripsi paket tersedia'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-600">Rp {(selectedPackage?.price || 0).toLocaleString('id-ID')}</p>
                    <p className="text-xs text-slate-500 mt-1">{selectedPackage?.delivery_days ? `${selectedPackage.delivery_days} hari` : 'Waktu pengiriman'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Catatan untuk penjual</label>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Tuliskan detail tambahan atau arahan spesifik..."
                  className="w-full min-h-[120px] p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:border-blue-400 focus:ring-blue-200 focus:ring-2 outline-none resize-none transition-all duration-200"
                />
              </div>

              <h2 className="text-xl font-bold text-slate-800 mb-6 mt-8">Pilih Metode Pembayaran</h2>

              <div className="space-y-3">
                {/* E-Wallet */}
                <button
                  onClick={() => setPaymentMethod('ewallet')}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                    paymentMethod === 'ewallet'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 hover:border-blue-400 hover:shadow-sm hover:bg-slate-50'
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

                {/* Transfer Bank */}
                <button
                  onClick={() => setPaymentMethod('transfer')}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                    paymentMethod === 'transfer'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 hover:border-blue-400 hover:shadow-sm hover:bg-slate-50'
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

                {/* Virtual Account */}
                <button
                  onClick={() => setPaymentMethod('va')}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                    paymentMethod === 'va'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 hover:border-blue-400 hover:shadow-sm hover:bg-slate-50'
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

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-slate-600 mb-1">{service?.seller_name || 'Penyedia Jasa'}</p>
                  <p className="font-semibold text-slate-800">{service?.title || 'Layanan Profesional'}</p>
                </div>

                <div className="border-t border-slate-200 pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600 capitalize">Paket {selectedPackage?.name || selectedPackage?.package_type || '-'}</span>
                    <span className="font-semibold text-slate-800">Rp {packagePrice.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Biaya Admin</span>
                    <span className="font-semibold text-slate-800">Rp {adminFee.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Metode</span>
                    <span className="font-semibold text-slate-800 uppercase">{paymentMethodLabel}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                    <span className="font-bold text-slate-800">Total</span>
                    <span className="text-blue-600 font-bold text-xl">Rp {totalAmount.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={!selectedPackage || submitting}
                className={`w-full flex justify-center items-center text-white py-3 rounded-xl transition-all duration-200 font-medium ${
                  selectedPackage && !submitting 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-500 hover:shadow-xl hover:opacity-95 active:scale-95 cursor-pointer' 
                    : 'bg-slate-300 cursor-not-allowed'
                }`}
              >
                {submitting ? <Loader className="w-5 h-5 animate-spin mr-2" /> : null}
                {submitting ? 'Memproses...' : 'Bayar Sekarang'}
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