import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { Search as SearchIcon, Sparkles, Star, SlidersHorizontal, ArrowLeft } from "lucide-react";

export function Search() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    priceRating: 'all',
    category: 'all',
    duration: 'all',
  });

  const popularSearches = [
    "Desain Logo",
    "Video Editing",
    "Copywriting",
    "Social Media Design",
    "Ilustrasi Digital",
  ];

  const services = [
    {
      id: 1,
      title: "Desain Logo Profesional untuk Bisnis Anda",
      seller: "Design Studio",
      rating: 4.9,
      reviews: 250,
      price: "Rp 150.000",
      image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400",
      category: "Desain Grafis",
    },
    {
      id: 2,
      title: "Video Editing untuk Social Media & YouTube",
      seller: "Creative Media",
      rating: 5.0,
      reviews: 180,
      price: "Rp 200.000",
      image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400",
      category: "Audio & Video",
    },
    {
      id: 3,
      title: "Copywriting Website & Landing Page Menarik",
      seller: "WordCraft",
      rating: 4.8,
      reviews: 120,
      price: "Rp 100.000",
      image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400",
      category: "Penulisan",
    },
    {
      id: 4,
      title: "Desain Instagram Feed yang Aesthetic",
      seller: "Social Design Co",
      rating: 4.9,
      reviews: 95,
      price: "Rp 175.000",
      image: "https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=400",
      category: "Desain Grafis",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali ke Beranda</span>
        </button>

        {/* AI Search Bar */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex items-center bg-slate-50 rounded-xl p-2">
            <div className="flex-1 flex items-center">
              <Sparkles className="w-6 h-6 text-yellow-500 ml-4 mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Coba: 'Desain logo modern untuk kafe' atau 'Edit video YouTube'"
                className="flex-1 px-2 py-3 bg-transparent outline-none"
              />
            </div>
            <button className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-shadow flex items-center space-x-2">
              <SearchIcon className="w-5 h-5" />
              <span>Cari</span>
            </button>
          </div>

          {/* Popular Searches */}
          <div className="mt-4">
            <p className="text-sm text-slate-600 mb-2">Pencarian Populer:</p>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term, idx) => (
                <button
                  key={idx}
                  onClick={() => setSearchQuery(term)}
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-slate-800">Filter</h3>
                <SlidersHorizontal className="w-5 h-5 text-slate-400" />
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Harga & Rating</label>
                  <select
                    value={filters.priceRating}
                    onChange={(e) => setFilters({ ...filters, priceRating: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="all">Semua</option>
                    <option value="low-price">Harga Terendah</option>
                    <option value="high-price">Harga Tertinggi</option>
                    <option value="high-rating">Rating Tertinggi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Kategori</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="all">Semua Kategori</option>
                    <option value="design">Desain Grafis</option>
                    <option value="video">Audio & Video</option>
                    <option value="writing">Penulisan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Durasi Pengerjaan</label>
                  <select
                    value={filters.duration}
                    onChange={(e) => setFilters({ ...filters, duration: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="all">Semua Durasi</option>
                    <option value="1-3">1-3 Hari</option>
                    <option value="4-7">4-7 Hari</option>
                    <option value="7+">Lebih dari 7 Hari</option>
                  </select>
                </div>

                <button className="w-full px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
                  Reset Filter
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-slate-600">
                Menampilkan <span className="font-semibold text-slate-800">{services.length}</span> hasil
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {services.map((service) => (
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
                    <div className="text-xs text-blue-600 mb-2">{service.category}</div>
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
        </div>
      </div>
    </div>
  );
}
