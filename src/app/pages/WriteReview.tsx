import { useNavigate, useParams, useLocation } from "react-router";
import { useState } from "react";
import { ArrowLeft, Star, Upload, X } from "lucide-react";

export function WriteReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<string[]>([]);

  const order = {
    orderId: "GRF-2026-04-001",
    service: "Desain Logo Profesional",
    seller: "Design Studio",
    amount: "Rp 225.000",
    date: "18 Apr 2026",
  };

  const handleBack = () => {
    const from = location.state?.from;

    if (from === 'order-detail') {
      navigate(-1);
    } 
    else if (from === 'profile-orders') {
      navigate('/profile/user', { state: { activeTab: 'orders' } });
    } 
    else if (from === 'dashboard') {
      navigate(-1);
    } 
    else {
      navigate('/dashboard/user');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Silakan berikan rating terlebih dahulu');
      return;
    }
    if (comment.length < 20) {
      alert('Ulasan minimal 20 karakter');
      return;
    }

    alert('Ulasan berhasil dikirim! Terima kasih.');
    
    navigate('/profile/user', { state: { activeTab: 'orders' } });
  };

  const handleImageUpload = () => {
    const dummyImage = "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=300";
    if (images.length < 3) {
      setImages([...images, dummyImage]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 mb-6 transition-colors cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali</span>
        </button>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Tulis Ulasan</h1>
          <p className="text-slate-600 mb-8">Bagikan pengalaman Anda dengan layanan ini</p>

          {/* Order Info */}
          <div className="bg-slate-50 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Order {order.orderId}</p>
                <h3 className="font-bold text-slate-800 mb-1">{order.service}</h3>
                <p className="text-sm text-slate-600">Seller: {order.seller}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-600">{order.amount}</p>
                <p className="text-sm text-slate-500">{order.date}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating, Comment, Images, Tips */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Berikan Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-10 h-10 transition-colors ${
                        star <= (hoverRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-3 text-slate-700 font-semibold">
                    {rating === 5 && 'Sangat Puas'}
                    {rating === 4 && 'Puas'}
                    {rating === 3 && 'Cukup'}
                    {rating === 2 && 'Kurang'}
                    {rating === 1 && 'Sangat Kurang'}
                  </span>
                )}
              </div>
            </div>

            {/* Comment Section */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Tulis Ulasan Anda
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                placeholder="Ceritakan pengalaman Anda dengan layanan ini..."
              />
              <p className="text-sm text-slate-500 mt-2">
                {comment.length} karakter (minimal 20 karakter)
              </p>
            </div>

            {/* Images Section */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Tambahkan Foto (Opsional)
              </label>
              <div className="flex items-start space-x-4">
                {images.map((img, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={img}
                      alt={`Upload ${idx + 1}`}
                      className="w-24 h-24 rounded-lg object-cover border-2 border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {images.length < 3 && (
                  <button
                    type="button"
                    onClick={handleImageUpload}
                    className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <Upload className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-xs text-slate-500">Upload</span>
                  </button>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-2">
                Maksimal 3 foto (Format: JPG, PNG)
              </p>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800 font-semibold mb-2">💡 Tips menulis ulasan yang baik:</p>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Jelaskan pengalaman Anda secara detail</li>
                <li>Sebutkan hal yang Anda sukai dan yang perlu diperbaiki</li>
                <li>Bersikap objektif dan konstruktif</li>
                <li>Hindari kata-kata kasar atau tidak pantas</li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 px-6 py-3 border-2 border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={rating === 0 || comment.length < 20}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:shadow-lg transition-shadow font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Kirim Ulasan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}