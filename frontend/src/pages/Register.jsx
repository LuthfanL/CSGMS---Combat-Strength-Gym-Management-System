import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Upload, User, Mail, Phone, MapPin, Lock, Camera, Eye, EyeOff, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const API_URL = 'http://localhost:8000/api';

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

const Register = () => {
  useEffect(() => {
    document.title = "Register - CSGMS";
  }, []);

  const { register: registerField, handleSubmit, watch, formState: { errors }, setError, clearErrors } = useForm({ mode: 'onChange' });
  const password = watch('password');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null); // null | 'checking' | 'available' | 'taken'
  const emailCheckTimeout = useRef(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const passwordStrength = getPasswordStrength(password);

  // Debounced email availability check
  const checkEmailAvailability = useCallback((email) => {
    if (emailCheckTimeout.current) clearTimeout(emailCheckTimeout.current);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailStatus(null);
      return;
    }

    setEmailStatus('checking');
    emailCheckTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/check-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (data.available) {
          setEmailStatus('available');
          clearErrors('email');
        } else {
          setEmailStatus('taken');
          setError('email', { type: 'manual', message: 'Email ini sudah terdaftar.' });
        }
      } catch {
        setEmailStatus(null);
      }
    }, 600);
  }, [clearErrors, setError]);

  const onSubmit = async (data) => {
    if (emailStatus === 'taken') {
      toast.error('Email sudah terdaftar, gunakan email lain.');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('name', data.name.trim());
    formData.append('email', data.email.trim());
    formData.append('phone', data.phone);
    formData.append('address', data.address.trim());
    formData.append('password', data.password);
    
    if (data.photo && data.photo[0]) {
      formData.append('photo', data.photo[0]);
    }

    const result = await register(formData);
    
    if (result.success) {
      toast.success('Pendaftaran berhasil! Selamat datang di CSGMS.');
      navigate('/member/dashboard');
    } else {
      toast.error(result.message || 'Terjadi kesalahan saat pendaftaran.');
    }
    
    setIsSubmitting(false);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Ukuran foto maksimal 2MB.');
        e.target.value = '';
        setPhotoPreview(null);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Block non-digit characters in phone input
  const handlePhoneInput = (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
  };

  // Block digit characters in name input
  const handleNameInput = (e) => {
    e.target.value = e.target.value.replace(/[^a-zA-Z\s.'-]/g, '');
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background py-4 lg:py-0 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div className="text-center lg:text-left mb-6 lg:mb-0">
          <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl lg:text-5xl lg:leading-tight">
            Bergabung <br className="hidden lg:block"/>Bersama Kami
          </h2>
          <p className="mt-4 text-lg text-foreground/70 max-w-xl mx-auto lg:mx-0">
            Lengkapi data diri Anda untuk memulai perjalanan kebugaran di CSGMS. Dapatkan akses ke program latihan terbaik dan fasilitas premium.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card py-4 px-6 sm:px-10 shadow-2xl rounded-2xl border border-border w-full max-w-xl mx-auto"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            {/* Foto Profile */}
            <div className="flex flex-col items-center mb-2">
              <div className="relative w-20 h-20 rounded-full border-2 border-dashed border-border flex items-center justify-center bg-background overflow-hidden group">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-10 h-10 text-foreground/30" />
                )}
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Upload className="w-6 h-6 text-white mb-1" />
                  <span className="text-xs text-white">Upload</span>
                  <input 
                    type="file" 
                    accept="image/jpeg,image/png,image/jpg" 
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    {...registerField('photo', { 
                      required: 'Foto wajah wajib diunggah',
                      validate: {
                        fileType: (files) => {
                          if (!files || !files[0]) return true;
                          const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
                          return allowed.includes(files[0].type) || 'Format foto harus JPEG, PNG, atau JPG.';
                        },
                        fileSize: (files) => {
                          if (!files || !files[0]) return true;
                          return files[0].size <= 2 * 1024 * 1024 || 'Ukuran foto maksimal 2MB.';
                        }
                      }
                    })}
                    onChange={(e) => {
                      registerField('photo').onChange(e);
                      handlePhotoChange(e);
                    }}
                  />
                </div>
              </div>
              {errors.photo && <p className="mt-1 text-xs text-red-500">{errors.photo.message}</p>}
            </div>

            <div className="grid grid-cols-1 gap-y-3 gap-x-6 sm:grid-cols-2">
              {/* Nama Lengkap */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Nama Lengkap</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-foreground/40" />
                  </div>
                  <input
                    type="text"
                    className="bg-background block w-full pl-10 pr-3 py-1.5 border border-border rounded-md focus:ring-primary focus:border-primary sm:text-sm text-foreground"
                    placeholder="Budi Santoso"
                    onInput={handleNameInput}
                    {...registerField('name', { 
                      required: 'Nama lengkap wajib diisi',
                      minLength: { value: 3, message: 'Nama minimal 3 karakter' },
                      maxLength: { value: 255, message: 'Nama maksimal 255 karakter' },
                      pattern: {
                        value: /^[a-zA-Z\s.'-]+$/,
                        message: 'Nama hanya boleh berisi huruf, spasi, titik, dan tanda petik'
                      }
                    })}
                  />
                </div>
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-foreground/40" />
                  </div>
                  <input
                    type="email"
                    className="bg-background block w-full pl-10 pr-9 py-1.5 border border-border rounded-md focus:ring-primary focus:border-primary sm:text-sm text-foreground"
                    placeholder="budi@example.com"
                    {...registerField('email', { 
                      required: 'Email wajib diisi',
                      pattern: { 
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
                        message: 'Format email tidak valid' 
                      },
                      onChange: (e) => checkEmailAvailability(e.target.value)
                    })}
                  />
                  {/* Email status indicator */}
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    {emailStatus === 'checking' && <Loader2 className="h-4 w-4 text-foreground/40 animate-spin" />}
                    {emailStatus === 'available' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                    {emailStatus === 'taken' && <XCircle className="h-4 w-4 text-red-500" />}
                  </div>
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
                {emailStatus === 'available' && !errors.email && <p className="mt-1 text-sm text-green-500">Email tersedia</p>}
              </div>

              {/* No HP */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1">Nomor Handphone</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-foreground/40" />
                  </div>
                  <input
                    type="tel"
                    className="bg-background block w-full pl-10 pr-3 py-1.5 border border-border rounded-md focus:ring-primary focus:border-primary sm:text-sm text-foreground"
                    placeholder="081234567890"
                    onInput={handlePhoneInput}
                    maxLength={15}
                    {...registerField('phone', { 
                      required: 'Nomor HP wajib diisi',
                      minLength: { value: 10, message: 'Nomor HP minimal 10 digit' },
                      maxLength: { value: 15, message: 'Nomor HP maksimal 15 digit' },
                      pattern: {
                        value: /^[0-9]{10,15}$/,
                        message: 'Nomor HP harus berupa angka dengan panjang 10-15 digit'
                      }
                    })}
                  />
                </div>
                {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>}
              </div>

              {/* Alamat */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1">Alamat Lengkap</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 pt-2.5 pointer-events-none">
                    <MapPin className="h-5 w-5 text-foreground/40" />
                  </div>
                  <textarea
                    rows={2}
                    className="bg-background block w-full pl-10 pr-3 py-1.5 border border-border rounded-md focus:ring-primary focus:border-primary sm:text-sm text-foreground resize-none"
                    placeholder="Jl. Merdeka No. 123..."
                    {...registerField('address', { 
                      required: 'Alamat wajib diisi',
                      minLength: { value: 10, message: 'Alamat minimal 10 karakter' }
                    })}
                  />
                </div>
                {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Password</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-foreground/40" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="bg-background block w-full pl-10 pr-10 py-1.5 border border-border rounded-md focus:ring-primary focus:border-primary sm:text-sm text-foreground"
                    placeholder="••••••••"
                    {...registerField('password', { 
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
                <label className="block text-sm font-medium text-foreground mb-1">Konfirmasi Password</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-foreground/40" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="bg-background block w-full pl-10 pr-10 py-1.5 border border-border rounded-md focus:ring-primary focus:border-primary sm:text-sm text-foreground"
                    placeholder="••••••••"
                    {...registerField('passwordConfirmation', { 
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
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors shadow-[0_0_15px_rgba(255,42,42,0.3)] hover:shadow-[0_0_20px_rgba(255,42,42,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memproses...
                  </span>
                ) : 'Selesaikan Pendaftaran'}
              </button>
            </div>
            
            <p className="text-center text-sm text-foreground/70 mt-3">
              Sudah punya akun? <Link to="/login" className="font-medium text-primary hover:text-primary-hover transition-colors">Masuk di sini</Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
