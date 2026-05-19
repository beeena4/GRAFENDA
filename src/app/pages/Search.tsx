import { Link, useNavigate, useSearchParams } from "react-router";
import { useEffect, useState } from "react";
import { Search as SearchIcon, Sparkles, Star, SlidersHorizontal, ArrowLeft } from "lucide-react";
import { API_ASSET_URL, serviceAPI } from "../../services/api";

export function Search() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const popularSearches = [
    "Desain Logo",
    "Video Editing",
    "Copywriting",
    "Social Media Design",
    "Ilustrasi Digital",
  ];

  const parsePrice = (price: string) => Number(price.toString().replace(/[^0-9]/g, '')) || 0;
  const formatRupiah = (value: number | string) => {
    const numberValue = Number(value) || 0;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(numberValue);
  };

  const filteredServices = services.filter((service) => {
    const query = searchQuery.trim().toLowerCase();
    const title = String(service.title).toLowerCase();
    const seller = String(service.seller_name || service.seller || '').toLowerCase();
    const category = String(service.category_name || service.category || '').toLowerCase();
    const matchesQuery = query
      ? title.includes(query) || seller.includes(query) || category.includes(query)
      : true;
    const matchesCategory = selectedCategory === 'Semua' || String(service.category_name || service.category) === selectedCategory;
    const priceValue = parsePrice(String(service.price || '0'));
    const matchesMin = minPrice ? priceValue >= Number(minPrice) : true;
    const matchesMax = maxPrice ? priceValue <= Number(maxPrice) : true;

    return matchesQuery && matchesCategory && matchesMin && matchesMax;
  });

  const fetchServices = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const queryValue = searchParams.get('search') || searchParams.get('query') || '';
      const result = await serviceAPI.getServices(1, 20, queryValue || undefined);
      setServices(result.services || []);
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat layanan');
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setSearchQuery(searchParams.get('search') || searchParams.get('query') || '');
    setSelectedCategory(searchParams.get('category') || 'Semua');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
  }, [searchParams]);

  useEffect(() => {
    fetchServices();
  }, [searchParams]);

  const applySearch = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (selectedCategory && selectedCategory !== 'Semua') params.set('category', selectedCategory);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    setSearchParams(params);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('Semua');
    setMinPrice('');
    setMaxPrice('');
    setSearchParams({});
  };

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
                onKeyDown={(e) => e.key === 'Enter' && applySearch()}
                placeholder="Cari jasa..."
                className="flex-1 px-2 py-2 bg-transparent outline-none text-sm"
              />
            </div>
            <button
              onClick={applySearch}
              className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 text-white px-6 py-2 rounded-lg flex items-center space-x-1 hover:opacity-90 transition-all"
            >
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
                  onClick={() => {
                    setSearchQuery(term);
                    setSearchParams(new URLSearchParams({ search: term }));
                  }}
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
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full px-2 py-1 text-sm border rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full px-2 py-1 text-sm border rounded-lg"
                    />
                  </div>
                </div>

                {/* Kategori */}
                <div>
                  <p className="text-xs text-slate-500 mb-1">Kategori</p>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-2 py-1 text-sm border rounded-lg"
                  >
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

                <button
                  onClick={resetFilters}
                  className="w-full py-2 text-xs bg-slate-100 rounded-lg"
                >
                  Reset
                </button>

              </div>
            </div>
          </div>

          {/* RESULTS */}
          <div className="lg:col-span-3">

            <p className="text-sm text-slate-600 mb-4">
              Menampilkan <span className="font-semibold">{filteredServices.length}</span> hasil
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredServices.map((service) => (
                <Link
                  key={service.id}
                  to={`/service/${service.id}`}
                  className="bg-white rounded-2xl border hover:shadow-lg transition"
                >
                  <div className="aspect-video overflow-hidden rounded-t-2xl">
                    <img
                      src={service.image?.startsWith('/') ? `${API_ASSET_URL}${service.image}` : service.image}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-4">
                    <p className="text-xs text-blue-600 mb-1">{service.category_name || service.category}</p>
                    <h3 className="text-sm font-semibold line-clamp-2 mb-2">
                      {service.title}
                    </h3>

                    <p className="text-xs text-slate-500 mb-2">{service.seller_name || service.seller}</p>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-xs">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 mr-1" />
                        {service.seller_rating || service.rating || '-'}
                      </div>
                      <span className="text-sm font-bold text-blue-600">
                        {service.price ? formatRupiah(service.price) : 'Harga variatif'}
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