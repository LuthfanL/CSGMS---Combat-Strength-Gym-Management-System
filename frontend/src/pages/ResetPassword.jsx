import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useGym } from '../context/GymContext';
import { toast } from 'sonner';

// Password strength checker
const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[@$!%*?&#]/.test(password)) score++;

  const levels = [
    { label: '', color: '' },
    { label: 'Sangat Lemah', color: 'bg-red-500' },
    { label: 'Lemah', color: 'bg-orange-500' },
    { label: 'Cukup', color: 'bg-yellow-500' },
    { label: 'Kuat', color: 'bg-blue-500' },
    { label: 'Sangat Kuat', color: 'bg-green-500' },
  ];
  return { score, ...levels[score] };
};

const ResetPassword = () => {
  useEffect(() => {
    document.title = "Reset Password - CSGMS";
  }, []);

  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');
  const passwordStrength = getPasswordStrength(password);

  const { gymSettings } = useGym();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!email || !token) {
      toast.error('Tautan tidak valid atau tidak lengkap.');
    }
  }, [email, token]);

  const onSubmit = async (data) => {
    if (!email || !token) {
      toast.error('Tautan tidak valid.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:8000/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          token: token,
          password: data.password
        })
      });
      
      const responseData = await res.json();
      
      if (res.ok) {
        setIsSuccess(true);
        toast.success('Kata sandi berhasil diatur ulang!');
      } else {
        toast.error(responseData.message || 'Gagal mengubah kata sandi.');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan pada server. Coba lagi nanti.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!email || !token) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="text-center p-8 bg-card rounded-xl border border-red-500/20 max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Tautan Tidak Valid</h2>
          <p className="text-foreground/70 mb-6">Tautan reset kata sandi tidak lengkap atau salah.</p>
          <Link to="/login" className="bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary-hover transition-colors">
            Kembali ke Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background py-8 lg:py-0 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-6 flex flex-col items-center">
          <div className="flex items-center justify-center mb-2">
            {gymSettings?.logo ? (
              <img 
                src={`http://localhost:8000/storage/${gymSettings.logo}`} 
                alt="Logo Gym" 
                className="h-16 w-auto object-contain drop-shadow-lg" 
              />
            ) : null}
          </div>
          <h2 className="text-3xl font-extrabold text-foreground">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-foreground/70">
            Buat kata sandi baru untuk akun <span className="font-medium text-foreground">{email}</span>
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
                Selamat, kata sandi Anda berhasil diubah!
              </div>
              <Link to="/login" className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white py-2 px-4 rounded-md font-medium transition-colors">
                Lanjut Login <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Password Baru</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-foreground/40" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className="bg-background block w-full pl-10 pr-10 py-2 border border-border rounded-md focus:ring-primary focus:border-primary sm:text-sm text-foreground"
                    placeholder="••••••••"
                    {...register('password', { 
                      required: 'Password wajib diisi',
                      minLength: { value: 8, message: 'Password minimal 8 karakter' },
                      validate: {
                        hasUpperCase: (v) => /[A-Z]/.test(v) || 'Harus mengandung minimal 1 huruf besar',
                        hasLowerCase: (v) => /[a-z]/.test(v) || 'Harus mengandung minimal 1 huruf kecil',
                        hasNumber: (v) => /[0-9]/.test(v) || 'Harus mengandung minimal 1 angka',
                        hasSpecial: (v) => /[@$!%*?&#]/.test(v) || 'Harus mengandung minimal 1 karakter spesial (@$!%*?&#)',
                      }
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-foreground/40 hover:text-foreground/70"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
                
                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= passwordStrength.score ? passwordStrength.color : 'bg-foreground/10'}`} />
                      ))}
                    </div>
                    <p className={`text-xs ${passwordStrength.score <= 2 ? 'text-red-400' : passwordStrength.score <= 3 ? 'text-yellow-400' : 'text-green-400'}`}>
                      Kekuatan: {passwordStrength.label}
                    </p>
                  </div>
                )}
              </div>

              {/* Konfirmasi Password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Konfirmasi Password Baru</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-foreground/40" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className="bg-background block w-full pl-10 pr-10 py-2 border border-border rounded-md focus:ring-primary focus:border-primary sm:text-sm text-foreground"
                    placeholder="••••••••"
                    {...register('passwordConfirmation', { 
                      required: 'Konfirmasi password wajib diisi',
                      validate: value => value === password || 'Password tidak cocok'
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-foreground/40 hover:text-foreground/70"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.passwordConfirmation && <p className="mt-1 text-sm text-red-500">{errors.passwordConfirmation.message}</p>}
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
                      Memproses...
                    </span>
                  ) : 'Simpan Password Baru'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;
