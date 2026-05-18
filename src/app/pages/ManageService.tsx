import { useNavigate, useParams } from "react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Upload, X, Plus } from "lucide-react";
import { serviceAPI } from "../../services/api";

const categoryMap: Record<string, number> = {
  design: 1,
  video: 2,
  writing: 3,
};

export function ManageService() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    images: [] as any[],
    packages: {
      basic: {
        name: 'Basic',
        price: '',
        delivery: '1',
        revisions: '1',
        features: [''],
      },
      standard: {
        name: 'Standard',
        price: '',
        delivery: '1',
        revisions: '1',
        features: [''],
      },
      premium: {
        name: 'Premium',
        price: '',
        delivery: '1',
        revisions: '1',
        features: [''],
      },
    },
  });

  // Fetch data service saat mode edit
  useEffect(() => {
    if (!isEdit) return;
    const fetchService = async () => {
      try {
        const data = await serviceAPI.getServiceById(Number(id));
        setFormData({
          title: data.title || '',
          category: Object.keys(categoryMap).find(k => categoryMap[k] === data.category_id) || '',
          description: data.description || '',
          images: [],
          packages: {
            basic: {
              name: 'Basic',
              price: data.packages?.find((p: any) => p.package_type === 'basic')?.price?.toString() || '1',
              delivery: data.packages?.find((p: any) => p.package_type === 'basic')?.delivery_days?.toString() || '1',
              revisions: data.packages?.find((p: any) => p.package_type === 'basic')?.revisions?.toString() || '1',
              features: data.packages?.find((p: any) => p.package_type === 'basic')?.features?.split(',') || [''],
            },
            standard: {
              name: 'Standard',
              price: data.packages?.find((p: any) => p.package_type === 'standard')?.price?.toString() || '1',
              delivery: data.packages?.find((p: any) => p.package_type === 'standard')?.delivery_days?.toString() || '1',
              revisions: data.packages?.find((p: any) => p.package_type === 'standard')?.revisions?.toString() || '1',
              features: data.packages?.find((p: any) => p.package_type === 'standard')?.features?.split(',') || [''],
            },
            premium: {
              name: 'Premium',
              price: data.packages?.find((p: any) => p.package_type === 'premium')?.price?.toString() || '1',
              delivery: data.packages?.find((p: any) => p.package_type === 'premium')?.delivery_days?.toString() || '1',
              revisions: data.packages?.find((p: any) => p.package_type === 'premium')?.revisions?.toString() || '1',
              features: data.packages?.find((p: any) => p.package_type === 'premium')?.features?.split(',') || [''],
            },
          },
        });
      } catch (err) {
        console.error('Gagal fetch service:', err);
        setError('Gagal memuat data jasa.');
      }
    };
    fetchService();
  }, [isEdit, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const category_id = categoryMap[formData.category];
    if (!category_id) {
      setError('Kategori tidak valid.');
      setSubmitting(false);
      return;
    }

    const packages = (['basic', 'standard', 'premium'] as const).map((type) => ({
      package_type: type,
      name: formData.packages[type].name,
      price: Number(formData.packages[type].price),
      delivery_days: Number(formData.packages[type].delivery),
      revisions: isNaN(Number(formData.packages[type].revisions))
        ? 0
        : Number(formData.packages[type].revisions),
      features: formData.packages[type].features.filter((f) => f.trim() !== ''),
    }));

    try {
     const payload = new FormData();
     payload.append('title', formData.title);
     payload.append('category_id', String(category_id));
     payload.append('description', formData.description);
     payload.append('packages', JSON.stringify(packages));
     // append first image if exists
     if (formData.images.length > 0) {
       formData.images.forEach((img, idx) => {
         if (img instanceof File) {
           payload.append('images', img);
         }
       });
     }

     if (isEdit) {
        await serviceAPI.updateService(Number(id), payload);
      } else {
        await serviceAPI.createService(payload);
      }
      navigate('/dashboard/seller');
    } catch (err: any) {
      console.error('Gagal menyimpan jasa:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Gagal menyimpan jasa. Coba lagi.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = () => {
    // trigger hidden file input
    const el = document.getElementById('service-image-input') as HTMLInputElement | null;
    el?.click();
  };

  const handleFilesSelected = (files: FileList | null) => {
    if (!files) return;
    const fileArr = Array.from(files).slice(0, 5 - formData.images.length);
    setFormData({ ...formData, images: [...formData.images, ...fileArr] });
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const addFeature = (packageType: 'basic' | 'standard' | 'premium') => {
    const updatedPackages = { ...formData.packages };
    updatedPackages[packageType].features.push('');
    setFormData({ ...formData, packages: updatedPackages });
  };

  const updateFeature = (packageType: 'basic' | 'standard' | 'premium', index: number, value: string) => {
    const updatedPackages = { ...formData.packages };
    updatedPackages[packageType].features[index] = value;
    setFormData({ ...formData, packages: updatedPackages });
  };

  const removeFeature = (packageType: 'basic' | 'standard' | 'premium', index: number) => {
    const updatedPackages = { ...formData.packages };
    updatedPackages[packageType].features = updatedPackages[packageType].features.filter((_, i) => i !== index);
    setFormData({ ...formData, packages: updatedPackages });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/dashboard/seller')}
          className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali ke Dashboard</span>
        </button>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            {isEdit ? 'Edit Jasa' : 'Tambah Jasa Baru'}
          </h1>
          <p className="text-slate-600 mb-8">
            {isEdit ? 'Perbarui informasi jasa Anda' : 'Buat jasa baru untuk ditawarkan ke pembeli'}
          </p>

          {error && (
            <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-800">Informasi Dasar</h3>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Judul Jasa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Contoh: Desain Logo Profesional untuk Brand Anda"
                  minLength={5}
                  required
                />
                <p className="text-xs text-slate-400 mt-1">Minimal 5 karakter</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="">Pilih Kategori</option>
                  <option value="design">Desain Grafis</option>
                  <option value="video">Video Editing</option>
                  <option value="writing">Penulisan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Deskripsi <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  placeholder="Jelaskan detail jasa yang Anda tawarkan..."
                  minLength={20}
                  required
                />
                <p className="text-xs text-slate-400 mt-1">Minimal 20 karakter</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Gambar Jasa (Maksimal 5)
                </label>
                <div className="grid grid-cols-5 gap-4">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square">
                      <img
                        src={typeof img === 'string' ? img : URL.createObjectURL(img)}
                        alt={`Service ${idx + 1}`}
                        className="w-full h-full object-cover rounded-lg border-2 border-slate-200"
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
                  <input id="service-image-input" type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFilesSelected(e.target.files)} />
                  {formData.images.length < 5 && (
                    <button
                      type="button"
                      onClick={handleImageUpload}
                      className="aspect-square border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      <Upload className="w-6 h-6 text-slate-400 mb-1" />
                      <span className="text-xs text-slate-500">Upload</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Packages */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-800">Paket Layanan</h3>

              {(['basic', 'standard', 'premium'] as const).map((packageType) => (
                <div key={packageType} className="border border-slate-200 rounded-xl p-6">
                  <h4 className="font-bold text-slate-800 mb-4 capitalize">{packageType}</h4>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Harga (Rp) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.packages[packageType].price}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          const updatedPackages = { ...formData.packages };
                          updatedPackages[packageType].price = e.target.value;
                          setFormData({ ...formData, packages: updatedPackages });
                        }}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="150000"
                        min={10000}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Waktu Pengerjaan (Hari)
                      </label>
                      <input
                        type="number"
                        value={formData.packages[packageType].delivery}
                        onChange={(e) => {
                          const updatedPackages = { ...formData.packages };
                          updatedPackages[packageType].delivery = e.target.value;
                          setFormData({ ...formData, packages: updatedPackages });
                        }}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="3"
                        min={1}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Jumlah Revisi
                      </label>
                      <input
                        type="text"
                        value={formData.packages[packageType].revisions}
                        onChange={(e) => {
                          const updatedPackages = { ...formData.packages };
                          updatedPackages[packageType].revisions = e.target.value;
                          setFormData({ ...formData, packages: updatedPackages });
                        }}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Fitur yang Didapat
                    </label>
                    <div className="space-y-2">
                      {formData.packages[packageType].features.map((feature, idx) => (
                        <div key={idx} className="flex space-x-2">
                          <input
                            type="text"
                            value={feature}
                            onChange={(e) => updateFeature(packageType, idx, e.target.value)}
                            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Contoh: 1 Konsep Logo"
                          />
                          <button
                            type="button"
                            onClick={() => removeFeature(packageType, idx)}
                            className="px-3 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addFeature(packageType)}
                        className="flex items-center space-x-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Fitur</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit */}
            <div className="flex space-x-4 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => navigate('/dashboard/seller')}
                className="flex-1 px-6 py-3 border-2 border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:shadow-lg transition-shadow font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting
                  ? 'Menyimpan...'
                  : isEdit
                  ? 'Simpan Perubahan'
                  : 'Tambah Jasa'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}