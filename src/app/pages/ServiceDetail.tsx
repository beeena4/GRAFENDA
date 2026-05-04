import { useNavigate, useParams, Link } from "react-router";
import { Star, Clock, CheckCircle2, MessageCircle, ShoppingCart, Award, ArrowLeft } from "lucide-react";
import { useState } from "react";

export function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState<'basic' | 'standard' | 'premium'>('basic');

  const service = {
    title: "Desain Logo Profesional untuk Bisnis Anda",
    description: "Saya akan mendesain logo profesional yang unik dan menarik untuk bisnis Anda. Dengan pengalaman lebih dari 3 tahun, saya telah membantu ratusan klien menciptakan identitas brand yang kuat.",
    image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800",
    seller: {
      name: "Design Studio",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
      rating: 4.9,
      reviews: 250,
      orders: 450,
      responseTime: "< 1 jam",
    },
    packages: {
      basic: {
        name: "Basic",
        price: "Rp 150.000",
        delivery: "3 Hari",
        revisions: "2x Revisi",
        features: [
          "1 Konsep Logo",
          "File PNG & JPG",
          "2x Revisi",
          "Source File",
        ],
      },
      standard: {
        name: "Standard",
        price: "Rp 250.000",
        delivery: "5 Hari",
        revisions: "3x Revisi",
        features: [
          "3 Konsep Logo",
          "File PNG, JPG, SVG",
          "3x Revisi",
          "Source File",
          "Logo Guideline",
        ],
      },
      premium: {
        name: "Premium",
        price: "Rp 400.000",
        delivery: "7 Hari",
        revisions: "Unlimited Revisi",
        features: [
          "5 Konsep Logo",
          "Semua Format File",
          "Unlimited Revisi",
          "Source File",
          "Logo Guideline",
          "Mockup Presentasi",
          "Brand Identity Kit",
        ],
      },
    },
    reviews: [
      {
        id: 1,
        user: "Rina Wijaya",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
        rating: 5,
        date: "2 minggu lalu",
        comment: "Hasil desain sangat memuaskan! Seller sangat responsif dan profesional. Sangat recommended!",
      },
      {
        id: 2,
        user: "Budi Santoso",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
        rating: 5,
        date: "1 bulan lalu",
        comment: "Logo yang dibuat sangat sesuai dengan brand kami. Terima kasih!",
      },
    ],
  };

  const currentPackage = service.packages[selectedPackage];

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/search')}
          className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali ke Pencarian</span>
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Image */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <img src={service.image} alt={service.title} className="w-full aspect-video object-cover" />
            </div>

            {/* Service Info */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h1 className="text-3xl font-bold text-slate-800 mb-4">{service.title}</h1>
              <p className="text-slate-600 leading-relaxed">{service.description}</p>
            </div>

            {/* Packages */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Pilih Paket</h2>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {(['basic', 'standard', 'premium'] as const).map((pkg) => (
                  <button
                    key={pkg}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedPackage === pkg
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-center">
                      <p className="font-semibold text-slate-800 capitalize">{pkg}</p>
                      <p className="text-xl font-bold text-blue-600 mt-2">{service.packages[pkg].price}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="border border-slate-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-1">{currentPackage.name}</h3>
                    <p className="text-2xl font-bold text-blue-600">{currentPackage.price}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-slate-600 mb-1">
                      <Clock className="w-4 h-4 mr-1" />
                      <span className="text-sm">{currentPackage.delivery}</span>
                    </div>
                    <p className="text-sm text-slate-600">{currentPackage.revisions}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {currentPackage.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-slate-700">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => navigate(`/chat/${id}`)}
                    className="flex items-center justify-center space-x-2 px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Chat Seller</span>
                  </button>
                  <button
                    onClick={() => navigate(`/payment/${id}`)}
                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:shadow-lg transition-shadow"
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
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
                >
                  <span>Lihat Semua Ulasan</span>
                  <span>→</span>
                </Link>
              </div>

              <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-slate-800 mb-1">{service.seller.rating}</div>
                    <div className="flex items-center justify-center mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(service.seller.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-slate-600">{service.seller.reviews} ulasan</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="flex items-center space-x-2">
                        <span className="text-xs text-slate-600 w-6">{star}★</span>
                        <div className="flex-1 bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{ width: `${star === 5 ? 80 : star === 4 ? 15 : 5}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {service.reviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="border-b border-slate-100 pb-6 last:border-0">
                    <div className="flex items-start space-x-4">
                      <img src={review.avatar} alt={review.user} className="w-12 h-12 rounded-full" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-semibold text-slate-800">{review.user}</p>
                            <div className="flex items-center mt-1">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-slate-500">{review.date}</span>
                        </div>
                        <p className="text-slate-600">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                to={`/service/${id}/reviews`}
                className="block mt-6 text-center py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
              >
                Lihat Semua {service.seller.reviews} Ulasan
              </Link>
            </div>
          </div>

          {/* Sidebar - Seller Profile */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <div className="text-center mb-6">
                <img
                  src={service.seller.avatar}
                  alt={service.seller.name}
                  className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-blue-100"
                />
                <h3 className="font-bold text-slate-800 mb-1">{service.seller.name}</h3>
                <div className="flex items-center justify-center space-x-1 mb-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-slate-800">{service.seller.rating}</span>
                  <span className="text-slate-500 text-sm">({service.seller.reviews} ulasan)</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <span className="text-slate-600">Total Order</span>
                  <span className="font-semibold text-slate-800">{service.seller.orders}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <span className="text-slate-600">Waktu Respon</span>
                  <span className="font-semibold text-slate-800">{service.seller.responseTime}</span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center space-x-2 text-blue-600 mb-2">
                  <Award className="w-5 h-5" />
                  <span className="font-semibold">Seller Terverifikasi</span>
                </div>
                <p className="text-sm text-slate-600">
                  Seller ini telah diverifikasi dan memiliki track record yang baik
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
