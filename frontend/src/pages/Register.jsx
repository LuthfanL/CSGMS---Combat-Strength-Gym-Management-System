import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Upload, User, Mail, Phone, MapPin, Lock, Camera } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
  useEffect(() => {
    document.title = "Register - CSGMS";
  }, []);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');
  const [photoPreview, setPhotoPreview] = useState(null);

  const onSubmit = (data) => {
    console.log(data);
    alert('Registrasi berhasil disimulasikan!');
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background py-8 lg:py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
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
          className="bg-card py-6 px-6 sm:px-10 shadow-2xl rounded-2xl border border-border w-full max-w-xl mx-auto"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Foto Profile */}
            <div className="flex flex-col items-center mb-4">
              <div className="relative w-24 h-24 rounded-full border-2 border-dashed border-border flex items-center justify-center bg-background overflow-hidden group">
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
                    accept="image/*" 
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    {...register('photo', { required: 'Foto wajah wajib diunggah' })}
                    onChange={(e) => {
                      register('photo').onChange(e);
                      handlePhotoChange(e);
                    }}
                  />
                </div>
              </div>
              {errors.photo && <p className="mt-2 text-sm text-red-500">{errors.photo.message}</p>}
            </div>

            <div className="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-2">
              {/* Nama Lengkap */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Nama Lengkap</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-foreground/40" />
                  </div>
                  <input
                    type="text"
                    className="bg-background block w-full pl-10 pr-3 py-2 border border-border rounded-md focus:ring-primary focus:border-primary sm:text-sm text-foreground"
                    placeholder="Budi Santoso"
                    {...register('name', { required: 'Nama lengkap wajib diisi' })}
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

              {/* No HP */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1">Nomor Handphone</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-foreground/40" />
                  </div>
                  <input
                    type="tel"
                    className="bg-background block w-full pl-10 pr-3 py-2 border border-border rounded-md focus:ring-primary focus:border-primary sm:text-sm text-foreground"
                    placeholder="081234567890"
                    {...register('phone', { required: 'Nomor HP wajib diisi' })}
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
                    rows={3}
                    className="bg-background block w-full pl-10 pr-3 py-2 border border-border rounded-md focus:ring-primary focus:border-primary sm:text-sm text-foreground"
                    placeholder="Jl. Merdeka No. 123..."
                    {...register('address', { required: 'Alamat wajib diisi' })}
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
                    type="password"
                    className="bg-background block w-full pl-10 pr-3 py-2 border border-border rounded-md focus:ring-primary focus:border-primary sm:text-sm text-foreground"
                    placeholder="••••••••"
                    {...register('password', { 
                      required: 'Password wajib diisi',
                      minLength: { value: 6, message: 'Password minimal 6 karakter' }
                    })}
                  />
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
              </div>

              {/* Konfirmasi Password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Konfirmasi Password</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-foreground/40" />
                  </div>
                  <input
                    type="password"
                    className="bg-background block w-full pl-10 pr-3 py-2 border border-border rounded-md focus:ring-primary focus:border-primary sm:text-sm text-foreground"
                    placeholder="••••••••"
                    {...register('passwordConfirmation', { 
                      required: 'Konfirmasi password wajib diisi',
                      validate: value => value === password || 'Password tidak cocok'
                    })}
                  />
                </div>
                {errors.passwordConfirmation && <p className="mt-1 text-sm text-red-500">{errors.passwordConfirmation.message}</p>}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors shadow-[0_0_15px_rgba(255,42,42,0.3)] hover:shadow-[0_0_20px_rgba(255,42,42,0.5)]"
              >
                Selesaikan Pendaftaran
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
