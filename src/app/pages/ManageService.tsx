import { useNavigate, useParams } from "react-router";
import { useState } from "react";
import { ArrowLeft, Upload, X, Plus } from "lucide-react";

export function ManageService() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: isEdit ? 'Desain Logo Profesional untuk Brand Anda' : '',
    category: isEdit ? 'design' : '',
    description: isEdit ? 'Saya akan mendesain logo profesional yang unik dan menarik untuk bisnis Anda.' : '',
    images: isEdit ? ['https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400'] : [],
    packages: {
      basic: {
        name: 'Basic',
        price: isEdit ? '150000' : '',
        delivery: isEdit ? '3' : '',
        revisions: isEdit ? '2' : '',
        features: isEdit ? ['1 Konsep Logo', 'File PNG & JPG', '2x Revisi'] : [''],
      },
      standard: {
        name: 'Standard',
        price: isEdit ? '250000' : '',
        delivery: isEdit ? '5' : '',
        revisions: isEdit ? '3' : '',
        features: isEdit ? ['3 Konsep Logo', 'File PNG, JPG, SVG', '3x Revisi', 'Logo Guideline'] : [''],
      },
      premium: {
        name: 'Premium',
        price: isEdit ? '400000' : '',
        delivery: isEdit ? '7' : '',
        revisions: isEdit ? 'Unlimited' : '',
        features: isEdit ? ['5 Konsep Logo', 'Semua Format File', 'Unlimited Revisi', 'Brand Identity Kit'] : [''],
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save service logic here
    navigate('/dashboard/seller');
  };

  const handleImageUpload = () => {
    const dummyImage = "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400";
    if (formData.images.length < 5) {
      setFormData({ ...formData, images: [...formData.images, dummyImage] });
    }
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
                  required
                />
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
                  <option value="video">Audio & Video</option>
                  <option value="writing">Penulisan</option>
                  <option value="programming">Programming</option>
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
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Gambar Jasa (Maksimal 5)
                </label>
                <div className="grid grid-cols-5 gap-4">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square">
                      <img
                        src={img}
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
                        type="number"
                        value={formData.packages[packageType].price}
                        onChange={(e) => {
                          const updatedPackages = { ...formData.packages };
                          updatedPackages[packageType].price = e.target.value;
                          setFormData({ ...formData, packages: updatedPackages });
                        }}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="150000"
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
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:shadow-lg transition-shadow font-medium"
              >
                {isEdit ? 'Simpan Perubahan' : 'Tambah Jasa'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
