import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { Search as SearchIcon, Sparkles, Star, SlidersHorizontal, ArrowLeft } from "lucide-react";

export function Search() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

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

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex items-center bg-slate-50 rounded-xl p-2">
            <div className="flex-1 flex items-center">
              <Sparkles className="w-5 h-5 text-yellow-500 ml-3 mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari jasa..."
                className="flex-1 px-2 py-2 bg-transparent outline-none text-sm"
              />
            </div>
            <button className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 text-white px-6 py-2 rounded-lg flex items-center space-x-1 hover:opacity-90 transition-all">
              <span className="text-sm">Cari</span>
            </button>
          </div>

          {/* Popular */}
          <div className="mt-4">
            <p className="text-xs text-slate-500 mb-2 ml-1">Pencarian Populer:</p>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term, idx) => (
                <button
                  key={idx}
                  onClick={() => setSearchQuery(term)}
                  className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-lg"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* GRID UTAMA */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* FILTER */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100 sticky top-24">

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">Filter</h3>
                <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              </div>

              <div className="space-y-4">

                {/* Harga */}
                <div>
                  <p className="text-xs text-slate-500 mb-1">Harga</p>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Min"
                      className="w-full px-2 py-1 text-sm border rounded-lg" />
                    <input type="number" placeholder="Max"
                      className="w-full px-2 py-1 text-sm border rounded-lg" />
                  </div>
                </div>

                {/* Kategori */}
                <div>
                  <p className="text-xs text-slate-500 mb-1">Kategori</p>
                  <select className="w-full px-2 py-1 text-sm border rounded-lg">
                    <option>Semua</option>
                    <option>Desain Grafis</option>
                    <option>Audio & Video</option>
                    <option>Penulisan</option>
                  </select>
                </div>

                {/* Durasi */}
                <div>
                  <p className="text-xs text-slate-500 mb-1">Durasi</p>
                  <select className="w-full px-2 py-1 text-sm border rounded-lg">
                    <option>Semua</option>
                    <option>1-3 Hari</option>
                    <option>4-7 Hari</option>
                    <option>7 Hari</option>
                  </select>
                </div>

                <button className="w-full py-2 text-xs bg-slate-100 rounded-lg">
                  Reset
                </button>

              </div>
            </div>
          </div>

          {/* RESULTS */}
          <div className="lg:col-span-3">

            <p className="text-sm text-slate-600 mb-4">
              Menampilkan <span className="font-semibold">{services.length}</span> hasil
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {services.map((service) => (
                <Link
                  key={service.id}
                  to={`/service/${service.id}`}
                  className="bg-white rounded-2xl border hover:shadow-lg transition"
                >
                  <div className="aspect-video overflow-hidden rounded-t-2xl">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-4">
                    <p className="text-xs text-blue-600 mb-1">{service.category}</p>
                    <h3 className="text-sm font-semibold line-clamp-2 mb-2">
                      {service.title}
                    </h3>

                    <p className="text-xs text-slate-500 mb-2">{service.seller}</p>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-xs">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 mr-1" />
                        {service.rating}
                      </div>
                      <span className="text-sm font-bold text-blue-600">
                        {service.price}
                      </span>
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