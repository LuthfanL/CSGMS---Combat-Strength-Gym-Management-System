import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Mail, Lock, Dumbbell, Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const Login = () => {
  useEffect(() => {
    document.title = "Masuk - CSGMS";
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    setLoginError('');
    const result = await login(data.email, data.password);
    
    if (result.success) {
      const roleName = result.role.charAt(0).toUpperCase() + result.role.slice(1);
      toast.success(`Berhasil Login sebagai ${roleName}`);
      
      if (result.role === 'owner') navigate('/owner/dashboard');
      else if (result.role === 'admin') navigate('/admin/dashboard');
      else if (result.role === 'member') navigate('/member/dashboard');
      else navigate('/');
    } else {
      setLoginError(result.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background py-8 lg:py-0 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-6 flex flex-col items-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Dumbbell className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-3xl font-extrabold text-foreground">
            Selamat Datang Kembali
          </h2>
          <p className="mt-2 text-sm text-foreground/70">
            Masuk ke akun Anda untuk mengakses dashboard.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card py-6 px-6 sm:px-10 shadow-2xl rounded-2xl border border-border"
        >
          {loginError && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{loginError}</span>
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-foreground/40" />
                </div>
                <input
                  type="email"
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

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Password</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-foreground/40" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="bg-background block w-full pl-10 pr-10 py-2 border border-border rounded-md focus:ring-primary focus:border-primary sm:text-sm text-foreground"
                  placeholder="••••••••"
                  {...register('password', { 
                    required: 'Password wajib diisi'
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-foreground/40 hover:text-foreground focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-border rounded bg-background"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-foreground/70">
                  Ingat saya
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-primary hover:text-primary-hover transition-colors">
                  Lupa password?
                </a>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors shadow-[0_0_15px_rgba(255,42,42,0.3)] hover:shadow-[0_0_20px_rgba(255,42,42,0.5)]"
              >
                Masuk
              </button>
            </div>
            
            <p className="text-center text-sm text-foreground/70 mt-4">
              Belum punya akun? <Link to="/register" className="font-medium text-primary hover:text-primary-hover transition-colors">Daftar sekarang</Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
