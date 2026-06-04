import { useNavigate, useParams, useLocation } from "react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Star, X, CheckCircle, AlertCircle } from "lucide-react";
import { orderAPI, reviewAPI } from "../../services/api";

export function WriteReview() {
  const { id } = useParams(); // order id
  const navigate = useNavigate();
  const location = useLocation();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await orderAPI.getOrderById(Number(id));
        setOrder(data);

        // Cek apakah order sudah direview
        if (data?.has_review || data?.review_id) {
          setAlreadyReviewed(true);
        }
      } catch (err: any) {
        setError('Gagal memuat data pesanan');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleBack = () => {
    const from = location.state?.from;
    if (from === 'order-detail') {
      navigate(-1);
    } else if (from === 'profile-orders') {
      navigate('/profile/user', { state: { activeTab: 'orders' } });
    } else if (from === 'dashboard') {
      navigate(-1);
    } else {
      navigate('/dashboard/user');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Silakan berikan rating terlebih dahulu');
      return;
    }
    if (comment.length < 20) {
      setError('Ulasan minimal 20 karakter');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await reviewAPI.createReview({
        order_id: Number(id),
        rating,
        comment,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/profile/user', { state: { activeTab: 'orders' } });
      }, 2000);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Gagal mengirim ulasan';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Memuat data pesanan...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-slate-700 font-semibold">Pesanan tidak ditemukan</p>
          <button onClick={handleBack} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
            Kembali
          </button>
        </div>
      </div>
    );
  }

  if (order.status !== 'completed') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto p-6">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
          <p className="text-slate-700 font-semibold mb-2">Review belum bisa diberikan</p>
          <p className="text-slate-500 text-sm mb-4">Ulasan hanya dapat diberikan setelah pesanan berstatus <strong>Selesai</strong>.</p>
          <button onClick={handleBack} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            Kembali
          </button>
        </div>
      </div>
    );
  }

  if (alreadyReviewed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto p-6">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-slate-700 font-semibold mb-2">Ulasan sudah diberikan</p>
          <p className="text-slate-500 text-sm mb-4">Anda sudah memberikan ulasan untuk pesanan ini sebelumnya.</p>
          <button onClick={handleBack} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            Kembali
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto p-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Ulasan Terkirim!</h2>
          <p className="text-slate-500">Terima kasih telah memberikan ulasan. Mengarahkan kembali...</p>
        </div>
      </div>
    );
  }

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
                <p className="text-sm text-slate-500 mb-1">Order GRF-{String(order.id).padStart(6, '0')}</p>
                <h3 className="font-bold text-slate-800 mb-1">{order.title || order.service_title || 'Pesanan'}</h3>
                <p className="text-sm text-slate-600">Seller: {order.seller_name || '-'}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-600">{formatRupiah(order.price)}</p>
                <p className="text-sm text-slate-500">
                  {order.created_at ? new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
              <X className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
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
                Tulis Ulasan Anda <span className="text-red-500">*</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                placeholder="Ceritakan pengalaman Anda dengan layanan ini..."
              />
              <p className={`text-sm mt-2 ${comment.length < 20 ? 'text-red-400' : 'text-green-500'}`}>
                {comment.length} karakter (minimal 20 karakter)
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
                disabled={submitting}
                className="flex-1 px-6 py-3 border-2 border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors font-medium disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={rating === 0 || comment.length < 20 || submitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:shadow-lg transition-shadow font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Mengirim...
                  </>
                ) : (
                  'Kirim Ulasan'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}