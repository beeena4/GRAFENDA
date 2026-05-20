import { useNavigate, useParams, Link } from "react-router";
import { Star, Clock, CheckCircle2, MessageCircle, ShoppingCart, Award, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
// Asumsi Anda memiliki fungsi subscribe di API Anda untuk realtime
import { serviceAPI, reviewAPI } from "../../services/api"; 

export function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<any>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const selectedPackage = service?.packages?.find((pkg: any) => pkg.id === selectedPackageId) || service?.packages?.[0] || null;

  useEffect(() => {
    if (service?.packages?.length > 0 && !selectedPackageId) {
      setSelectedPackageId(service.packages[0].id);
    }
  }, [service, selectedPackageId]);

  useEffect(() => {
    if (!id) return;

    setLoading(true);

    // 1. IMPLEMENTASI REALTIME SERVICE DETAIL
    // Mengganti fetch statis dengan listener/subscription
    // Contoh di bawah mengasumsikan API Anda mendukung realtime callback
    const unsubscribeService = serviceAPI.subscribeToService(Number(id), (updatedServiceData) => {
      if (!updatedServiceData) {
        setError('Layanan tidak ditemukan');
      } else {
        setService(updatedServiceData);
        setError(null);
      }
      setLoading(false);
    }, (err: any) => {
      console.error('Error fetching realtime service:', err);
      setError('Gagal memuat detail layanan');
      setLoading(false);
    });

    // 2. IMPLEMENTASI REALTIME REVIEWS
    let unsubscribeReviews: (() => void) | undefined;

    // Karena review butuh seller_id, kita ambil data statis awal dulu
    // atau jika backend Anda mendukung query realtime relasional, bisa disesuaikan
    const fetchInitialDataForReviews = async () => {
      try {
        const initialService = await serviceAPI.getServiceById(Number(id));
        if (initialService?.seller_id) {
          unsubscribeReviews = reviewAPI.subscribeToSellerReviews(
            initialService.seller_id, 
            (updatedReviews) => {
              setReviews(updatedReviews || []);
            }
          );
        }
      } catch (err) {
        console.error("Gagal inisialisasi review", err);
      }
    };

    fetchInitialDataForReviews();

    // Cleanup function: Memutuskan koneksi realtime saat pindah halaman
    return () => {
      if (unsubscribeService) unsubscribeService();
      if (unsubscribeReviews) unsubscribeReviews();
    };
  }, [id]);

  // Handler navigasi yang membawa data context realtime
  const handleChatNavigation = () => {
    // Karena chat di backend terikat pada order, kita arahkan ke halaman chat yang dapat mencari order
    navigate(`/chat/${id}`, { state: { serviceName: service?.title } });
  };

  const handlePaymentNavigation = () => {
    if (!selectedPackageId) return;
    navigate(`/payment/${id}`, { state: { selectedPackageId } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Memuat detail layanan...</p>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-slate-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-4">{error || 'Layanan tidak ditemukan'}</p>
          <button
            onClick={() => navigate('/search')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Kembali ke Pencarian
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Tombol Back */}
        <button
          onClick={() => navigate('/search')}
          className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 mb-6 transition-colors cursor-pointer w-max"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali ke Pencarian</span>
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Image */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <img src={service.image || service.image_url || "https://via.placeholder.com/800x600"} alt={service.title || 'Service'} className="w-full aspect-video object-cover" />
            </div>

            {/* Service Info */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h1 className="text-3xl font-bold text-slate-800 mb-4">{service.title || service.name}</h1>
              <p className="text-slate-600 leading-relaxed">{service.description || 'Deskripsi layanan'}</p>
            </div>

            {/* Packages */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Pilih Paket</h2>

              {service.packages?.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-3 mb-6">
                  {service.packages.map((pkg: any) => (
                    <button
                      key={pkg.id}
                      onClick={() => setSelectedPackageId(pkg.id)}
                      className={`border rounded-2xl p-5 text-left transition-all duration-200 cursor-pointer ${selectedPackageId === pkg.id ? 'border-blue-600 bg-blue-50 shadow-sm' : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'}`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="font-semibold text-slate-800">{pkg.name || pkg.package_type || 'Paket'}</p>
                          <p className="text-sm text-slate-500">{pkg.description || 'Detail paket'}</p>
                        </div>
                        <span className="text-lg font-bold text-blue-600">Rp {pkg.price?.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="text-slate-600 text-sm space-y-2">
                        <p>{pkg.delivery_days ? `${pkg.delivery_days} hari kirim` : 'Waktu kirim tersedia'}</p>
                        <p>{pkg.revisions != null ? `${pkg.revisions} kali revisi` : 'Jumlah revisi tersedia'}</p>
                        {pkg.features && (
                          <p>{Array.isArray(pkg.features) ? pkg.features.join(', ') : pkg.features}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="border border-slate-200 rounded-2xl p-6 text-slate-600">Tidak ada paket tersedia untuk layanan ini.</div>
              )}

              <div className="border border-slate-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-1">{service.title || 'Layanan'}</h3>
                    <p className="text-2xl font-bold text-blue-600">Rp {(selectedPackage?.price || 0).toLocaleString('id-ID')}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-slate-600 mb-1">
                      <Clock className="w-4 h-4 mr-1" />
                      <span className="text-sm">Pengiriman standar</span>
                    </div>
                    <p className="text-sm text-slate-600">Negosiabel</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-slate-700">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>{service.category_name || service.category || 'Layanan Profesional'}</span>
                  </div>
                  <div className="flex items-center text-slate-700">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Komunikasi langsung dengan penyedia jasa</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleChatNavigation}
                    className="flex items-center justify-center space-x-2 px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 hover:shadow-md active:scale-95 transition-all cursor-pointer duration-200"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Chat Penyedia Jasa</span>
                  </button>
                  
                  <button
                    onClick={handlePaymentNavigation}
                    disabled={!selectedPackageId}
                    className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-xl text-white transition-all duration-200 ${selectedPackageId ? 'bg-gradient-to-r from-blue-600 to-purple-500 hover:shadow-lg hover:opacity-95 active:scale-95' : 'bg-slate-300 cursor-not-allowed'}`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Pesan Sekarang</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Ulasan Pembeli</h2>
                <Link
                  to={`/service/${id}/reviews`}
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1 cursor-pointer"
                >
                  <span>Lihat Semua Ulasan</span>
                  <span>→</span>
                </Link>
              </div>

              {/* Rekap Rating (Disembunyikan untuk menyingkat visual, sesuaikan dengan kode Anda sebelumnya jika ingin ditampilkan penuh) */}
              
              <div className="space-y-6">
                {reviews.length > 0 ? (
                  reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="border-b border-slate-100 pb-6 last:border-0">
                      <div className="flex items-start space-x-4">
                        <img src={review.reviewer_avatar || "https://via.placeholder.com/48"} alt={review.reviewer_name} className="w-12 h-12 rounded-full object-cover" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-semibold text-slate-800">{review.reviewer_name}</p>
                              <div className="flex items-center mt-1">
                                {[...Array(review.rating || 0)].map((_, i) => (
                                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                              </div>
                            </div>
                            <span className="text-sm text-slate-500">
                              {new Date(review.created_at).toLocaleDateString('id-ID')}
                            </span>
                          </div>
                          <p className="text-slate-600">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-4">Belum ada ulasan untuk layanan ini.</p>
                )}
              </div>

              {reviews.length > 3 && (
                <Link
                  to={`/service/${id}/reviews`}
                  className="block mt-6 text-center py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium cursor-pointer"
                >
                  Lihat Semua {reviews.length} Ulasan
                </Link>
              )}
            </div>
          </div>

          {/* Sidebar - Seller Profile */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <div className="text-center mb-6">
                <img
                  src={service.seller_avatar || "https://via.placeholder.com/80"}
                  alt={service.seller_name || 'Seller'}
                  className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-blue-100 object-cover"
                />
                <h3 className="font-bold text-slate-800 mb-1">{service.seller_name || 'Penyedia Jasa'}</h3>
                <div className="flex items-center justify-center space-x-1 mb-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-slate-800">{(service.rating || 0).toFixed(1)}</span>
                  <span className="text-slate-500 text-sm">({reviews.length} ulasan)</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <span className="text-slate-600">Total Order</span>
                  <span className="font-semibold text-slate-800">{service.total_orders || 0}</span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center space-x-2 text-blue-600 mb-2">
                  <Award className="w-5 h-5" />
                  <span className="font-semibold">Terverifikasi</span>
                </div>
                <p className="text-sm text-slate-600">
                  Penyedia jasa ini telah diverifikasi dan siap mengerjakan pesanan Anda.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}