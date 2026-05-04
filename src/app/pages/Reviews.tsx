import { useNavigate, useParams } from "react-router";
import { useState } from "react";
import { ArrowLeft, Star, SlidersHorizontal, ThumbsUp } from "lucide-react";

export function Reviews() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'helpful'>('recent');

  const service = {
    title: "Desain Logo Profesional",
    seller: "Design Studio",
    averageRating: 4.9,
    totalReviews: 250,
  };

  const reviews = [
    {
      id: 1,
      user: "Rina Wijaya",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
      rating: 5,
      date: "2 minggu lalu",
      comment: "Hasil desain sangat memuaskan! Seller sangat responsif dan profesional. Logo yang dibuat sesuai dengan brand kami dan revisi sangat cepat. Sangat recommended!",
      helpful: 24,
      images: [
        "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=300",
      ],
    },
    {
      id: 2,
      user: "Budi Santoso",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
      rating: 5,
      date: "1 bulan lalu",
      comment: "Logo yang dibuat sangat sesuai dengan brand kami. Terima kasih!",
      helpful: 18,
      images: [],
    },
    {
      id: 3,
      user: "Ahmad Fauzi",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
      rating: 4,
      date: "1 bulan lalu",
      comment: "Kualitas bagus, waktu pengerjaan sesuai deadline. Hanya saja komunikasi agak lambat di awal.",
      helpful: 12,
      images: [],
    },
    {
      id: 4,
      user: "Siti Nurhaliza",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
      rating: 5,
      date: "2 bulan lalu",
      comment: "Pelayanan excellent! Desain modern dan clean. Puas banget dengan hasilnya. Akan order lagi!",
      helpful: 30,
      images: [
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300",
      ],
    },
    {
      id: 5,
      user: "Dian Permata",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
      rating: 4,
      date: "2 bulan lalu",
      comment: "Desain bagus dan kreatif. Seller friendly dan terbuka untuk diskusi. Recommended!",
      helpful: 15,
      images: [],
    },
  ];

  const ratingDistribution = [
    { stars: 5, count: 200, percentage: 80 },
    { stars: 4, count: 35, percentage: 14 },
    { stars: 3, count: 10, percentage: 4 },
    { stars: 2, count: 3, percentage: 1 },
    { stars: 1, count: 2, percentage: 1 },
  ];

  const filteredReviews = filter === 'all'
    ? reviews
    : reviews.filter(r => r.rating === parseInt(filter));

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === 'helpful') {
      return b.helpful - a.helpful;
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(`/service/${id}`)}
          className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 mb-6 transition-colors"
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
                <div className="text-5xl font-bold text-slate-800 mb-2">{service.averageRating}</div>
                <div className="flex items-center justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 ${
                        i < Math.floor(service.averageRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-slate-600">{service.totalReviews} ulasan</p>
              </div>

              <div className="space-y-2 mb-6">
                {ratingDistribution.map((item) => (
                  <button
                    key={item.stars}
                    onClick={() => setFilter(item.stars.toString() as any)}
                    className={`w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 transition-colors ${
                      filter === item.stars.toString() ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-1 min-w-[60px]">
                      <span className="text-sm font-medium text-slate-700">{item.stars}</span>
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1 bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-slate-600 min-w-[40px] text-right">{item.count}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setFilter('all')}
                className="w-full px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
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
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                  >
                    <option value="recent">Terbaru</option>
                    <option value="helpful">Paling Membantu</option>
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                {sortedReviews.map((review) => (
                  <div key={review.id} className="border-b border-slate-100 pb-6 last:border-0">
                    <div className="flex items-start space-x-4">
                      <img
                        src={review.avatar}
                        alt={review.user}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-semibold text-slate-800">{review.user}</p>
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
                          <span className="text-sm text-slate-500">{review.date}</span>
                        </div>
                        <p className="text-slate-700 mb-3">{review.comment}</p>

                        {review.images.length > 0 && (
                          <div className="flex space-x-2 mb-3">
                            {review.images.map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                alt="Review"
                                className="w-24 h-24 rounded-lg object-cover border border-slate-200 cursor-pointer hover:opacity-75"
                              />
                            ))}
                          </div>
                        )}

                        <button className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition-colors">
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-sm">Membantu ({review.helpful})</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
