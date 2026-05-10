import { useNavigate } from "react-router";
import { useState } from "react";
import { ArrowLeft, Wallet, Building2, CreditCard, AlertCircle, CheckCircle } from "lucide-react";

export function WithdrawSaldo() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'bank' | 'ewallet'>('bank');
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountNumber: '',
    accountName: '',
  });
  const [ewalletDetails, setEwalletDetails] = useState({
    provider: 'gopay',
    phoneNumber: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const availableBalance = 2500000;
  const minWithdraw = 50000;

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccess(true);
    setTimeout(() => {
      navigate('/dashboard/seller');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/dashboard/seller')}
          className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali ke Dashboard</span>
        </button>

        {showSuccess ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Permintaan Penarikan Berhasil!</h2>
            <p className="text-slate-600 mb-4">
              Permintaan penarikan saldo sebesar Rp {parseInt(amount).toLocaleString('id-ID')} sedang diproses
            </p>
            <p className="text-sm text-slate-500">
              Dana akan ditransfer dalam 1-3 hari kerja
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-slate-800 mb-8">Tarik Saldo</h1>

            {/* Balance Info */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 mb-8 text-white">
              <p className="text-green-100 mb-2">Saldo Tersedia</p>
              <p className="text-4xl font-bold">Rp {availableBalance.toLocaleString('id-ID')}</p>
              <p className="text-green-100 mt-2 text-sm">Minimum penarikan: Rp {minWithdraw.toLocaleString('id-ID')}</p>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-6">
              {/* Amount */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <label className="block text-sm font-medium text-slate-700 mb-3">Jumlah Penarikan</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 font-semibold">Rp</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-xl font-semibold"
                    placeholder="0"
                    required
                    min={minWithdraw}
                    max={availableBalance}
                  />
                </div>
                <div className="flex justify-between mt-3">
                  {[500000, 1000000, availableBalance].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(preset.toString())}
                      className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                    >
                      Rp {(preset / 1000).toFixed(0)}K
                    </button>
                  ))}
                </div>
              </div>

              {/* Withdrawal Method */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Metode Penarikan</h3>

                <div className="space-y-3 mb-6">
                  <button
                    type="button"
                    onClick={() => setMethod('bank')}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                      method === 'bank'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-slate-800">Transfer Bank</p>
                        <p className="text-sm text-slate-500">BCA, Mandiri, BNI, BRI</p>
                      </div>
                    </div>
                    {method === 'bank' && <CheckCircle className="w-6 h-6 text-blue-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('ewallet')}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                      method === 'ewallet'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                        <Wallet className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-slate-800">E-Wallet</p>
                        <p className="text-sm text-slate-500">GoPay, OVO, DANA</p>
                      </div>
                    </div>
                    {method === 'ewallet' && <CheckCircle className="w-6 h-6 text-blue-600" />}
                  </button>
                </div>

                {/* Bank Details */}
                {method === 'bank' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Nama Bank</label>
                      <select
                        value={bankDetails.bankName}
                        onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        required
                      >
                        <option value="">Pilih Bank</option>
                        <option value="BCA">BCA</option>
                        <option value="Mandiri">Mandiri</option>
                        <option value="BNI">BNI</option>
                        <option value="BRI">BRI</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Nomor Rekening</label>
                      <input
                        type="text"
                        value={bankDetails.accountNumber}
                        onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="123456789"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Nama Pemilik Rekening</label>
                      <input
                        type="text"
                        value={bankDetails.accountName}
                        onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Nama sesuai rekening"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* E-Wallet Details */}
                {method === 'ewallet' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Provider E-Wallet</label>
                      <select
                        value={ewalletDetails.provider}
                        onChange={(e) => setEwalletDetails({ ...ewalletDetails, provider: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        required
                      >
                        <option value="gopay">GoPay</option>
                        <option value="ovo">OVO</option>
                        <option value="dana">DANA</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Nomor Telepon</label>
                      <input
                        type="tel"
                        value={ewalletDetails.phoneNumber}
                        onChange={(e) => setEwalletDetails({ ...ewalletDetails, phoneNumber: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="08xxxxxxxxxx"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-1">Perhatian:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Pastikan data rekening/e-wallet sudah benar</li>
                    <li>Proses penarikan memerlukan waktu 1-3 hari kerja</li>
                    <li>Biaya admin ditanggung oleh platform</li>
                  </ul>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!amount || parseInt(amount) < minWithdraw || parseInt(amount) > availableBalance}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-500 text-white py-4 rounded-xl hover:shadow-lg transition-shadow font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ajukan Penarikan
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
