import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { Search, Sparkles, Pen, Video, Palette, TrendingUp, Shield, Clock, Star, ChevronRight } from "lucide-react";
import { serviceAPI, API_ASSET_URL } from "../../services/api";

export function Home() {
  const navigate = useNavigate();
  const [homeSearchQuery, setHomeSearchQuery] = useState('');
  const [popularServices, setPopularServices] = useState<any[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await serviceAPI.getServices(1, 3);
        setPopularServices(data.services || data || []);
      } catch (err) {
        console.error('Gagal fetch services:', err);
      }
    };
    fetchServices();
  }, []);

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  const getImageUrl = (image: string) => {
    if (!image) return 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400';
    if (image.startsWith('http')) return image;
    return `${API_ASSET_URL}${image}`;
  };

  const categories = [
    { icon: Palette, name: "Desain Grafis", count: "2,500+ jasa", color: "from-blue-500 to-blue-600" },
    { icon: Video, name: "Audio & Video", count: "1,800+ jasa", color: "from-purple-500 to-purple-700" },
    { icon: Pen, name: "Penulisan", count: "1,200+ jasa", color: "from-fuchsia-500 to-fuchsia-600" },
  ];

  const reasons = [
    { icon: Shield, title: "Pembayaran Aman", desc: "Sistem escrow melindungi transaksi Anda" },
    { icon: Clock, title: "Pengerjaan Cepat", desc: "Freelancer berpengalaman siap membantu" },
    { icon: TrendingUp, title: "Kualitas Terjamin", desc: "Review dan rating dari pembeli asli" },
  ];

  const steps = [
    { num: "1", title: "Cari Jasa", desc: "Gunakan AI search untuk menemukan jasa yang tepat" },
    { num: "2", title: "Pilih Paket", desc: "Pilih paket yang sesuai dengan kebutuhan Anda" },
    { num: "3", title: "Bayar & Order", desc: "Lakukan pembayaran dengan metode favorit Anda" },
    { num: "4", title: "Terima Hasil", desc: "Dapatkan hasil kerja berkualitas tepat waktu" },
  ];

  const reviews = [
    {
      name: "Rina Wijaya",
      role: "Pemilik UMKM",
      text: "Grafenda membantu saya menemukan desainer logo yang sempurna. Hasilnya melebihi ekspektasi!",
      rating: 5,
    },
    {
      name: "Budi Santoso",
      role: "Content Creator",
      text: "Video editor di sini sangat profesional. Revisi cepat dan hasil memuaskan.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-slate-800 mb-6">
              Platform Jasa Kreatif
              <span className="block mt-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent bg-[length:200%_auto] transition-all duration-500 hover:bg-right cursor-default">
                Mahasiswa Terbaik
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              Temukan freelancer berbakat untuk mewujudkan proyek kreatif Anda
            </p>

            {/* AI Search */}
            <div className="relative max-w-2xl mx-auto group">
              <div className="flex items-center bg-white rounded-2xl shadow-lg p-2 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-1xl hover:ring-4 hover:ring-blue-50/50">
                <div className="flex-1 flex items-center">
                  <Sparkles className="w-6 h-6 text-yellow-500 ml-4 mr-2" />
                  <input
                    type="text"
                    placeholder="Coba: 'Desain logo modern untuk kafe' atau 'Edit video YouTube'"
                    className="flex-1 px-2 py-3 outline-none"
                    value={homeSearchQuery}
                    onChange={(e) => setHomeSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/search?search=${encodeURIComponent(homeSearchQuery.trim())}`)}
                  />
                </div>
                <button
                  onClick={() => navigate(`/search?search=${encodeURIComponent(homeSearchQuery.trim())}`)}
                  className="bg-gradient-to-r from-blue-600 to-purple-500 text-white px-8 py-3 rounded-xl hover:shadow-lg transition-shadow flex items-center space-x-2"
                >
                  <Search className="w-5 h-5" />
                  <span>Cari</span>
                </button>
              </div>
              <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-slate-500">
                <span className="flex items-center">
                  <Sparkles className="w-4 h-4 mr-1 text-yellow-500" />
                  AI-Powered Search
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-800">Kategori Populer</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {categories.map((cat, idx) => (
              <Link
                key={idx}
                to={`/search?search=${encodeURIComponent(cat.name)}`}
                className="group p-8 rounded-2xl bg-gradient-to-br hover:shadow-xl transition-all duration-300 border border-slate-100"
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <cat.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">{cat.name}</h3>
                <p className="text-slate-500">{cat.count}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-800">Mengapa Memilih Kami?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {reasons.map((reason, idx) => (
              <div key={idx} className="group text-center p-6 cursor-default">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-6 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-100 group-hover:-translate-y-2">
                  <reason.icon className="w-8 h-8 text-blue-600 transition-transform duration-300 group-hover:scale-110" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-slate-800 transition-all duration-300 group-hover:text-blue-600">
                  {reason.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {reason.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Order */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-800">Cara Kerja Grafenda</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, idx) => (
              <div key={idx} className="relative group">
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-400 via-violet-400 to-purple-400 text-white flex items-center justify-center text-2xl font-bold mb-4 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] group-hover:brightness-110 cursor-default">
                    {step.num}
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-slate-800 transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-500 group-hover:bg-clip-text group-hover:text-transparent">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 text-sm">{step.desc}</p>
                </div>
                {idx < steps.length - 1 && (
                  <ChevronRight className="hidden md:block absolute top-6 -right-4 w-6 h-6 text-slate-300 transition-all duration-300 group-hover:translate-x-2 group-hover:text-indigo-400" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-16 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Promo Spesial Minggu Ini!</h2>
          <p className="text-lg text-slate-700 mb-6">Diskon hingga 30% untuk pengguna baru</p>
          <Link
            to="/register"
            className="w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 text-white py-3 px-6 rounded-lg hover:opacity-90 transition-all font-medium"
          >
            Daftar Sekarang
          </Link>
        </div>
      </section>

      {/* Popular Services */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800">Jasa Terpopuler</h2>
            <Link to="/search" className="text-blue-600 hover:text-blue-700 flex items-center">
              Lihat Semua <ChevronRight className="w-5 h-5 ml-1" />
            </Link>
          </div>

          {popularServices.length === 0 ? (
            <p className="text-center text-slate-400 py-12">Belum ada jasa tersedia</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {popularServices.map((service) => (
                <Link
                  key={service.id}
                  to={`/service/${service.id}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl transition-shadow"
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={getImageUrl(service.image)}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400';
                      }}
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-slate-800 mb-2 line-clamp-2">{service.title}</h3>
                    <p className="text-sm text-slate-600 mb-3">
                      {service.seller_name || service.seller || 'Freelancer'}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-slate-800">
                          {service.rating ? Number(service.rating).toFixed(1) : '0.0'}
                        </span>
                        <span className="text-slate-500 text-sm">
                          ({service.reviews_count ?? service.total_reviews ?? 0})
                        </span>
                      </div>
                      <span className="font-bold text-blue-600">
                        {formatRupiah(service.price)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Reviews */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-800">Kata Mereka</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {reviews.map((review, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm">
                <div className="flex items-center mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 mb-4 italic">"{review.text}"</p>
                <div>
                  <p className="font-semibold text-slate-800">{review.name}</p>
                  <p className="text-sm text-slate-500">{review.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-400">© 2026 Grafenda. Platform Jasa Kreatif Mahasiswa.</p>
        </div>
      </footer>
    </div>
  );
}