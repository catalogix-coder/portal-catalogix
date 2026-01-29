
import React, { useState } from 'react';
import { X, Lock, ArrowRight, ExternalLink, Loader2, AlertCircle, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthModal: React.FC = () => {
  const { showAuthModal, closeAuthModal, login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!showAuthModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Reset error sebelumnya

    if(email.trim()) {
        const result = await login(email);
        
        // Jika login gagal, tampilkan pesan error dari context
        if (!result.success && result.message) {
            setError(result.message);
        }
    }
  };

  const handleClose = () => {
      if(!isLoading) {
          setError(null);
          setEmail('');
          closeAuthModal();
      }
  };

  const handleContactAdmin = () => {
      // Ganti nomor ini dengan nomor WhatsApp Admin yang asli
      const phoneNumber = "6281234567890"; 
      const message = encodeURIComponent("Halo Admin, saya sudah melakukan pembayaran untuk akses materi, mohon bantuannya untuk verifikasi.");
      window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-zinc-900/70 backdrop-blur-sm transition-opacity" 
        onClick={handleClose}
      ></div>

      {/* Modal Content - Compact & Clean */}
      <div className="relative bg-white w-full max-w-[380px] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 ring-1 ring-white/10">
        
        {/* Close Button */}
        {!isLoading && (
            <button 
                onClick={handleClose}
                className="absolute top-3 right-3 p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-all"
            >
                <X className="w-5 h-5" />
            </button>
        )}

        <div className="p-6">
            {/* Minimal Header */}
            <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary-50 mb-3 ring-4 ring-primary-50/50">
                    <Lock className="w-5 h-5 text-primary-500" />
                </div>
                <h2 className="text-xl font-bold text-zinc-900">
                    Member Area
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                    Masukan email terdaftar untuk akses.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Compact Error Box */}
                {error && (
                    <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-start gap-2 animate-in slide-in-from-top-1">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-red-600 font-medium leading-snug text-left">
                            {error}
                        </p>
                    </div>
                )}

                <div>
                    <input 
                        type="email" 
                        required
                        disabled={isLoading}
                        placeholder="Masukan email pembelian..." 
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if(error) setError(null);
                        }}
                        className={`w-full px-4 py-2.5 bg-zinc-50 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder-zinc-400 text-sm text-zinc-900 disabled:opacity-50 ${error ? 'border-red-300 focus:ring-red-200' : 'border-zinc-300'}`}
                    />
                </div>
                
                <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Masuk...
                        </>
                    ) : (
                        <>
                            Akses Materi <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </form>

            {/* Compact Footer Actions */}
            <div className="mt-6 pt-5 border-t border-zinc-100 space-y-3">
                
                {/* Main Secondary Action */}
                <button 
                    type="button"
                    disabled={isLoading}
                    className="w-full py-2 px-4 bg-white border border-zinc-300 hover:border-primary-500 hover:text-primary-600 text-zinc-600 transition-all font-semibold rounded-lg text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                    onClick={() => window.open('#', '_blank')} 
                >
                    Belum punya akses? Beli Sekarang <ExternalLink className="w-3 h-3" />
                </button>

                {/* Subtle Help Link */}
                <button 
                    type="button"
                    disabled={isLoading}
                    onClick={handleContactAdmin}
                    className="w-full text-[11px] text-zinc-400 hover:text-primary-600 transition-colors flex items-center justify-center gap-1.5 py-1"
                >
                    <MessageCircle className="w-3 h-3" />
                    Sudah bayar tapi gagal login? Hubungi Admin
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
