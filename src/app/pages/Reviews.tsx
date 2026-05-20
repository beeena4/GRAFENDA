import { useNavigate, useParams } from "react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Star, SlidersHorizontal, ThumbsUp } from "lucide-react";
// Asumsi Anda memiliki fungsi subscribe di API Anda untuk realtime
import { reviewAPI, serviceAPI } from "../../services/api";

export function Reviews() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'helpful'>('recent');
  const [service, setService] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let unsubscribeReviews: (() => void) | undefined;
    let unsubscribeStats: (() => void) | undefined;

    const initializeRealtimeData = async () => {
      try {
        setLoading(true);
        // Ambil data service untuk mengetahui seller_id (bisa juga dibuat realtime jika diperlukan)
        const serviceData = await serviceAPI.getServiceById(Number(id));
        setService(serviceData);

        if (serviceData?.seller_id) {
          // IMPLEMENTASI REALTIME REVIEWS LIST
          // Mendengarkan tambahan atau perubahan ulasan secara instan
          unsubscribeReviews = reviewAPI.subscribeToSellerReviews(
            serviceData.seller_id,
            (updatedReviews) => {
              setReviews(updatedReviews || []);
            }
          );

          // IMPLEMENTASI REALTIME STATS (Rating Distribution & Average)
          // Mendengarkan perubahan kalkulasi rata-rata rating
          unsubscribeStats = reviewAPI.subscribeToSellerStats(
            serviceData.seller_id,
            (updatedStats) => {
              setStats(updatedStats);
            }
          );
        }
      } catch (err: any) {
        console.error('Error fetching reviews:', err);
        setError('Gagal memuat ulasan');
      } finally {
        setLoading(false);
      }
    };

    initializeRealtimeData();

    // Cleanup function: Memutus koneksi realtime saat keluar dari halaman
    return () => {
      if (unsubscribeReviews) unsubscribeReviews();
      if (unsubscribeStats) unsubscribeStats();
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Memuat ulasan...</p>
        </div>
      </div>
    );
  }

  const ratingDistribution = stats?.ratingDistribution || [
    { stars: 5, count: 0, percentage: 0 },
    { stars: 4, count: 0, percentage: 0 },
    { stars: 3, count: 0, percentage: 0 },
    { stars: 2, count: 0, percentage: 0 },
    { stars: 1, count: 0, percentage: 0 },
  ];

  const filteredReviews = filter === 'all'
    ? reviews
    : reviews.filter(r => r.rating === parseInt(filter));

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === 'helpful') {
      return (b.helpful_count || 0) - (a.helpful_count || 0);
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Perbaikan Kursor & Ukuran Tombol Back */}
        <button
          onClick={() => navigate(`/service/${id}`)}
          className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 mb-6 transition-colors cursor-pointer w-max"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali ke Detail Jasa</span>
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Rating Overview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Rating & Ulasan</h2>

              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-slate-800 mb-2">{(stats?.averageRating || 0).toFixed(1)}</div>
                <div className="flex items-center justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 ${
                        i < Math.floor(stats?.averageRating || 0)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-slate-600">{reviews.length} ulasan</p>
              </div>

              <div className="space-y-2 mb-6">
                {ratingDistribution.map((item: any) => (
                  <button
                    key={item.stars}
                    onClick={() => setFilter(item.stars.toString() as any)}
                    className={`w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer ${
                      filter === item.stars.toString() ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-1 min-w-[60px]">
                      <span className="text-sm font-medium text-slate-700">{item.stars}</span>
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1 bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-slate-600 min-w-[40px] text-right">{item.count}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setFilter('all')}
                className="w-full px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Tampilkan Semua
              </button>
            </div>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800">
                  {filteredReviews.length} Ulasan
                  {filter !== 'all' && ` (${filter} Bintang)`}
                </h3>
                <div className="flex items-center space-x-2">
                  <SlidersHorizontal className="w-5 h-5 text-slate-400" />
                  {/* Perbaikan Kursor Dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm cursor-pointer hover:border-slate-300 transition-colors bg-white"
                  >
                    <option value="recent">Terbaru</option>
                    <option value="helpful">Paling Membantu</option>
                  </select>
                </div>
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p>Belum ada ulasan untuk layanan ini</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {sortedReviews.map((review) => (
                    <div key={review.id} className="border-b border-slate-100 pb-6 last:border-0">
                      <div className="flex items-start space-x-4">
                        {/* Perbaikan Object Cover untuk Avatar */}
                        <img
                          src={review.reviewer_avatar || "https://via.placeholder.com/48"}
                          alt={review.reviewer_name}
                          className="w-12 h-12 rounded-full object-cover border border-slate-100"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-semibold text-slate-800">{review.reviewer_name}</p>
                              <div className="flex items-center mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-slate-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-sm text-slate-500">
                              {new Date(review.created_at).toLocaleDateString('id-ID')}
                            </span>
                          </div>
                          <p className="text-slate-700 mb-3 leading-relaxed">{review.comment}</p>

                          {/* Perbaikan Tombol Membantu */}
                          <button className="flex items-center space-x-2 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer w-max active:scale-95">
                            <ThumbsUp className="w-4 h-4" />
                            <span className="text-sm font-medium">Membantu ({review.helpful_count || 0})</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}