import { Link, useNavigate } from "react-router";
import { Search, Sparkles, Pen, Video, Palette, TrendingUp, Shield, Clock, Star, ChevronRight } from "lucide-react";

export function Home() {
  const navigate = useNavigate();

  const categories = [
    { icon: Palette, name: "Desain Grafis", count: "2,500+ jasa", color: "from-blue-500 to-blue-600" },
    { icon: Video, name: "Audio & Video", count: "1,800+ jasa", color: "from-purple-500 to-purple-600" },
    { icon: Pen, name: "Penulisan", count: "1,200+ jasa", color: "from-yellow-500 to-yellow-600" },
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

  const popularServices = [
    {
      id: 1,
      title: "Desain Logo Profesional",
      seller: "Design Studio",
      rating: 4.9,
      reviews: 250,
      price: "Rp 150.000",
      image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400",
    },
    {
      id: 2,
      title: "Video Editing untuk Social Media",
      seller: "Creative Media",
      rating: 5.0,
      reviews: 180,
      price: "Rp 200.000",
      image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400",
    },
    {
      id: 3,
      title: "Copywriting Website & Landing Page",
      seller: "WordCraft",
      rating: 4.8,
      reviews: 120,
      price: "Rp 100.000",
      image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400",
    },
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
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-yellow-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-slate-800 mb-6">
              Platform Jasa Kreatif
              <span className="block text-blue-600 mt-2">Mahasiswa Terbaik</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              Temukan freelancer berbakat untuk mewujudkan proyek kreatif Anda
            </p>

            {/* AI Search */}
            <div className="relative max-w-2xl mx-auto">
              <div className="flex items-center bg-white rounded-2xl shadow-lg p-2">
                <div className="flex-1 flex items-center">
                  <Sparkles className="w-6 h-6 text-yellow-500 ml-4 mr-2" />
                  <input
                    type="text"
                    placeholder="Coba: 'Desain logo modern untuk kafe' atau 'Edit video YouTube'"
                    className="flex-1 px-2 py-3 outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && navigate('/search')}
                  />
                </div>
                <button
                  onClick={() => navigate('/search')}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-3 rounded-xl hover:shadow-lg transition-shadow flex items-center space-x-2"
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
                to="/search"
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
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-800">Kenapa Memilih Grafenda?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {reasons.map((reason, idx) => (
              <div key={idx} className="text-center p-6">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <reason.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-slate-800">{reason.title}</h3>
                <p className="text-slate-600">{reason.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Order */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-800">Cara Memesan</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, idx) => (
              <div key={idx} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 text-white flex items-center justify-center text-2xl font-bold mb-4">
                    {step.num}
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-slate-800">{step.title}</h3>
                  <p className="text-slate-600 text-sm">{step.desc}</p>
                </div>
                {idx < steps.length - 1 && (
                  <ChevronRight className="hidden md:block absolute top-6 -right-4 w-6 h-6 text-slate-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-16 bg-gradient-to-r from-yellow-400 to-yellow-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Promo Spesial Minggu Ini!</h2>
          <p className="text-lg text-slate-700 mb-6">Diskon hingga 30% untuk pengguna baru</p>
          <Link
            to="/register"
            className="inline-block px-8 py-4 bg-white text-yellow-600 font-semibold rounded-xl hover:shadow-xl transition-shadow"
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
          <div className="grid md:grid-cols-3 gap-6">
            {popularServices.map((service) => (
              <Link
                key={service.id}
                to={`/service/${service.id}`}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl transition-shadow"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-slate-800 mb-2 line-clamp-2">{service.title}</h3>
                  <p className="text-sm text-slate-600 mb-3">{service.seller}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-slate-800">{service.rating}</span>
                      <span className="text-slate-500 text-sm">({service.reviews})</span>
                    </div>
                    <span className="font-bold text-blue-600">{service.price}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
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
