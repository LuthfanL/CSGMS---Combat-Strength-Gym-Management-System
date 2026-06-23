import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGym } from '../context/GymContext';
import { toast } from 'sonner';

const ForgotPassword = () => {
  useEffect(() => {
    document.title = "Lupa Password - CSGMS";
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm();
  const { gymSettings } = useGym();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      const responseData = await res.json();
      
      if (res.ok) {
        setIsSuccess(true);
        toast.success(responseData.message || 'Tautan reset telah dikirim ke email Anda.');
      } else {
        toast.error(responseData.message || 'Gagal mengirim email reset.');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan pada server. Coba lagi nanti.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background py-8 lg:py-0 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-6 flex flex-col items-center">
          <div className="flex items-center justify-center mb-2">
            {gymSettings?.logo ? (
              <img 
                src={`${import.meta.env.VITE_STORAGE_URL}/${gymSettings.logo}`} 
                alt="Logo Gym" 
                className="h-16 w-auto object-contain drop-shadow-lg" 
              />
            ) : null}
          </div>
          <h2 className="text-3xl font-extrabold text-foreground">
            Lupa Password
          </h2>
          <p className="mt-2 text-sm text-foreground/70">
            Masukkan email Anda untuk menerima tautan reset kata sandi.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card py-6 px-6 sm:px-10 shadow-2xl rounded-2xl border border-border"
        >
          {isSuccess ? (
            <div className="text-center space-y-4">
              <div className="bg-green-500/10 text-green-500 p-4 rounded-lg border border-green-500/20">
                Tautan untuk mengatur ulang kata sandi telah dikirim ke email Anda. Silakan periksa folder Inbox atau Spam Anda.
              </div>
              <Link to="/login" className="flex items-center justify-center gap-2 text-primary hover:text-primary-hover font-medium transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email Anda</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-foreground/40" />
                  </div>
                  <input
                    type="email"
                    autoComplete="off"
                    className="bg-background block w-full pl-10 pr-3 py-2 border border-border rounded-md focus:ring-primary focus:border-primary sm:text-sm text-foreground"
                    placeholder="budi@example.com"
                    {...register('email', { 
                      required: 'Email wajib diisi',
                      pattern: { value: /^\S+@\S+$/i, message: 'Format email tidak valid' }
                    })}
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Mengirim...
                    </span>
                  ) : 'Kirim Tautan Reset'}
                </button>
              </div>
              
              <div className="text-center mt-4">
                <Link to="/login" className="flex items-center justify-center gap-1 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  Kembali ke halaman login
                </Link>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
