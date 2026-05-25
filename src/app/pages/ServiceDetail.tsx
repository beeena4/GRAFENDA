import { useNavigate, useParams, Link } from "react-router";
import { Star, Clock, CheckCircle2, MessageCircle, ShoppingCart, Award, ArrowLeft, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
// Asumsi Anda memiliki fungsi subscribe di API Anda untuk realtime
import { serviceAPI, reviewAPI, API_ASSET_URL } from "../../services/api"; 

const resolveImageUrl = (url?: string, fallback = "https://via.placeholder.com/800x600") => {
  if (!url) return fallback;
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  if (url.startsWith("/")) return `${API_ASSET_URL}${url}`;
  return url;
};

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

  // Handler: Find/Create room chat (berbasis order_id) lalu navigasi ke chat yang tepat
  // + kirim initialMessage agar Chat.tsx bisa auto-kirim pesan pertama
  const handleChatSeller = async () => {
    try {
      if (!service) return;

      // backend chat memakai order_id, bukan service_id
      // service.id => id (params) di halaman ini
      // seller user id biasanya ada di service.seller_id
      const serviceId = Number(id);
      const sellerUserId = service.seller_id;

      if (!Number.isFinite(serviceId) || serviceId < 1) {
        navigate('/search');
        return;
      }

      // Kalau sistem mengharuskan order dibuat dulu untuk chat
      // kita buat order baru dari service (gunakan paket yang dipilih agar sesuai harga)
      if (!selectedPackageId) {
        // tetap aman: fallback ke pesan sekarang agar order dibuat dulu
        // (tidak mengubah UI, hanya mengarahkan)
        return;
      }

      // Cari apakah sudah ada chat/order yang terkait seller ini
      // (pakai endpoint chat list yang sudah ada)
      let existingOrderId: number | null = null;

      try {
        // lazy import agar tidak menambah beban bundle awal
        const { chatAPI, orderAPI } = await import('../../services/api');
        const chatsData = await chatAPI.getUserChats();
        const chats = Array.isArray(chatsData)
          ? chatsData
          : (chatsData?.data || chatsData?.chats || chatsData?.conversations || []);

        // Respons chat list punya field: o.id (order id), title, other_party...
        // Pada implementation sekarang, tidak jelas ada service_id.
        // Jadi kita fallback dengan match via sellerUserId bila tersedia.
        for (const c of chats) {
          if (!c) continue;
          if (sellerUserId != null && (c.seller_user_id === sellerUserId || c.receiver_id === sellerUserId || c.buyer_id === sellerUserId)) {
            if (c.id) {
              existingOrderId = Number(c.id);
              break;
            }
          }

          // Fallback: jika backend tidak mengirim buyer_id/seller_id di list,
          // kita tidak bisa mengandalkan filter; lanjut create order.
        }


      } catch {
        // silent fail (tetap lanjut create)
      }

        if (existingOrderId && Number.isFinite(existingOrderId)) {
        const initialMessage = `Halo, saya tertarik dengan jasa *${service?.title}* seharga *${selectedPackage?.price ?? ''}*. Apakah sedang available?`;
        navigate(`/chat/${existingOrderId}`, {
          state: {
            serviceName: service?.title,
            orderId: existingOrderId,
            initialMessage,
          },
        });
        return;
      }

      // Create order baru sebagai basis room chat
      const { orderAPI, chatAPI } = await import('../../services/api');

      // Pastikan payload sesuai validasi backend: service_id dan package_id
      const createdOrder = await orderAPI.createOrder({
        service_id: serviceId,
        package_id: selectedPackageId,
        title: service?.title,
        description: service?.description,
      });

      const newOrderId = createdOrder?.id;
      if (!newOrderId) {
        // Jika backend respons tidak berisi id, fallback ke error
        navigate('/search');
        return;
      }

      // (Opsional) lakukan quick fetch messages supaya UI chat langsung terisi
      // tapi Chat page sudah punya polling/subscribe.
      void chatAPI;

      navigate(`/chat/${newOrderId}`, { state: { serviceName: service?.title, orderId: newOrderId } });
    } catch (err: any) {
      // Aman: jangan rusak routing dashboard/admin/user
      navigate('/search');
    }
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

  // Mengecek apakah seller sedang penuh antreannya
  const isSellerFull = service?.seller_max_orders != null 
    ? (service?.seller_active_orders || 0) >= service.seller_max_orders 
    : false;

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
              <img src={resolveImageUrl(service.image || service.image_url)} alt={service.title || 'Service'} className="w-full aspect-video object-cover" />
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
                <>
                  {/* Tab nama + harga saja */}
                  <div className="grid gap-3 md:grid-cols-3 mb-6">
                    {service.packages.map((pkg: any) => (
                      <button
                        key={pkg.id}
                        onClick={() => setSelectedPackageId(pkg.id)}
                        className={`border rounded-2xl p-4 text-center transition-all duration-200 cursor-pointer ${
                          selectedPackageId === pkg.id
                            ? 'border-blue-600 bg-blue-50 shadow-sm'
                            : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'
                        }`}
                      >
                        <p className="font-semibold text-slate-800 mb-1">
                          {pkg.name || pkg.package_type || 'Paket'}
                        </p>
                        <p className="text-lg font-bold text-blue-600">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(pkg.price ?? 0)}
                        </p>
                      </button>
                    ))}
                  </div>

                  {/* Detail paket yang dipilih */}
                  {selectedPackage && (
                    <div className="border border-slate-200 rounded-xl p-6 mb-0">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-slate-800 mb-1">
                            {selectedPackage.name || selectedPackage.package_type || 'Paket'}
                          </h3>
                          <p className="text-sm text-slate-500">{selectedPackage.description || ''}</p>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(selectedPackage.price ?? 0)}
                        </p>
                      </div>

                      <div className="space-y-2 mb-6 text-sm text-slate-600">
                        {selectedPackage.delivery_days && (
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-green-500" />
                            <span>{selectedPackage.delivery_days} hari pengiriman</span>
                          </div>
                        )}
                        {selectedPackage.revisions != null && (
                          <div className="flex items-center">
                            <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                            <span>{selectedPackage.revisions} kali revisi</span>
                          </div>
                        )}
                        {selectedPackage.features && (
                          Array.isArray(selectedPackage.features)
                            ? selectedPackage.features.map((f: string, i: number) => (
                                <div key={i} className="flex items-center">
                                  <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                                  <span>{f}</span>
                                </div>
                              ))
                            : (
                              <div className="flex items-center">
                                <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                                <span>{selectedPackage.features}</span>
                              </div>
                            )
                        )}
                        <div className="flex items-center">
                          <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                          <span>Komunikasi langsung dengan penyedia jasa</span>
                        </div>
                      </div>

                      {isSellerFull && (
                        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm flex items-start">
                          <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
                          <p><strong>Antrean Penuh.</strong> Freelancer ini sedang mengerjakan batas maksimal pesanannya. Silakan coba kembali nanti.</p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={handleChatSeller}
                          className="flex items-center justify-center space-x-2 px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 hover:shadow-md active:scale-95 transition-all cursor-pointer duration-200"
                        >
                          <MessageCircle className="w-5 h-5" />
                          <span>Chat Penyedia Jasa</span>
                        </button>

                        <button
                          onClick={handlePaymentNavigation}
                          disabled={!selectedPackageId || isSellerFull}
                          className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-xl text-white transition-all duration-200 ${
                            !selectedPackageId || isSellerFull
                              ? 'bg-slate-300 cursor-not-allowed'
                              : 'bg-gradient-to-r from-blue-600 to-purple-500 hover:shadow-lg hover:opacity-95 active:scale-95'
                          }`}
                        >
                          <ShoppingCart className="w-5 h-5" />
                          <span>{isSellerFull ? 'Antrean Penuh' : 'Pesan Sekarang'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="border border-slate-200 rounded-2xl p-6 text-slate-600">
                  Tidak ada paket tersedia untuk layanan ini.
                </div>
              )}
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
                        <img src={resolveImageUrl(review.reviewer_avatar, "https://via.placeholder.com/48")} alt={review.reviewer_name} className="w-12 h-12 rounded-full object-cover" />
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
                  src={resolveImageUrl(service.seller_avatar, "https://via.placeholder.com/80")}
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