import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod'
import { NavLink, useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../slices/authSlice';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Sparkles, Code, ArrowRight, Shield, Zap } from 'lucide-react';

const signupSchema = z.object({
  firstName: z.string().min(3, "Minimum character should be 3"),
  emailId: z.string().email("Invalid Email"),
  password: z.string().min(8, "Password is too weak")
});

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm({ resolver: zodResolver(signupSchema) });

  const watchedFields = watch();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  const onSubmit = (data) => {
    dispatch(registerUser(data));
  };

  // Calculate password strength
  const getPasswordStrength = () => {
    const password = watchedFields.password || '';
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength();
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-purple-500'];
  const strengthTexts = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(128, 0, 128, 0.15) 1px, transparent 0)',
        backgroundSize: '50px 50px'
      }}></div>
      
      {/* Gradient orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/30 rounded-full filter blur-[128px] animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-600/30 rounded-full filter blur-[128px] animate-pulse animation-delay-2000"></div>
      
      {/* Floating code icons */}
      <div className="absolute top-20 left-20 text-purple-500/20 animate-float">
        <Code size={48} />
      </div>
      <div className="absolute bottom-20 right-20 text-purple-500/20 animate-float animation-delay-1000">
        <Code size={48} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Animated border card */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000 animate-pulse"></div>
        
        <div className="relative bg-black/80 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl hover:border-purple-400 transition-all duration-500 hover:shadow-[0_0_40px_rgba(128,0,128,0.3)] animate-slideIn">
          <div className="p-8">
            {/* Logo and Title */}
            <div className="text-center mb-8">
              <div className="relative inline-block">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-70 animate-pulse"></div>
                <div className="relative bg-black rounded-lg p-3">
                  <Code className="w-8 h-8 text-purple-400" />
                </div>
              </div>
              <h2 className="text-3xl font-black mt-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent bg-300% animate-gradient">
                CodeVerse
              </h2>
              <p className="text-purple-300/60 text-sm mt-2 flex items-center justify-center gap-1">
                <Sparkles size={14} className="text-yellow-400" />
                Join the coding community
                <Sparkles size={14} className="text-yellow-400" />
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* First Name Field */}
              <div className="group relative">
                <label className={`block text-sm font-medium mb-2 transition-all duration-300 ${
                  focusedField === 'firstName' ? 'text-purple-400' : 'text-purple-300'
                }`}>
                  First Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="John"
                    className={`w-full px-4 py-3 bg-black/50 border-2 rounded-xl text-white placeholder-purple-400/30 transition-all duration-300 outline-none ${
                      errors.firstName 
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                        : focusedField === 'firstName'
                        ? 'border-purple-400 ring-2 ring-purple-500/20'
                        : 'border-purple-500/30 hover:border-purple-500/50'
                    }`}
                    {...register('firstName')}
                    onFocus={() => setFocusedField('firstName')}
                    onBlur={() => setFocusedField(null)}
                  />
                  {watchedFields.firstName && !errors.firstName && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
                {errors.firstName && (
                  <div className="mt-2 text-sm text-red-400 flex items-center gap-1 animate-shake">
                    <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                    {errors.firstName.message}
                  </div>
                )}
              </div>

              {/* Email Field */}
              <div className="group relative">
                <label className={`block text-sm font-medium mb-2 transition-all duration-300 ${
                  focusedField === 'emailId' ? 'text-purple-400' : 'text-purple-300'
                }`}>
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="john@example.com"
                    className={`w-full px-4 py-3 bg-black/50 border-2 rounded-xl text-white placeholder-purple-400/30 transition-all duration-300 outline-none ${
                      errors.emailId 
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                        : focusedField === 'emailId'
                        ? 'border-purple-400 ring-2 ring-purple-500/20'
                        : 'border-purple-500/30 hover:border-purple-500/50'
                    }`}
                    {...register('emailId')}
                    onFocus={() => setFocusedField('emailId')}
                    onBlur={() => setFocusedField(null)}
                  />
                  {watchedFields.emailId && !errors.emailId && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
                {errors.emailId && (
                  <div className="mt-2 text-sm text-red-400 flex items-center gap-1 animate-shake">
                    <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                    {errors.emailId.message}
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div className="group relative">
                <label className={`block text-sm font-medium mb-2 transition-all duration-300 ${
                  focusedField === 'password' ? 'text-purple-400' : 'text-purple-300'
                }`}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 bg-black/50 border-2 rounded-xl text-white placeholder-purple-400/30 transition-all duration-300 outline-none pr-12 ${
                      errors.password 
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                        : focusedField === 'password'
                        ? 'border-purple-400 ring-2 ring-purple-500/20'
                        : 'border-purple-500/30 hover:border-purple-500/50'
                    }`}
                    {...register('password')}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-300 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {watchedFields.password && watchedFields.password.length > 0 && (
                  <div className="mt-3 space-y-2 animate-slideDown">
                    <div className="flex gap-1 h-1">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`flex-1 h-full rounded-full transition-all duration-300 ${
                            i < passwordStrength 
                              ? strengthColors[passwordStrength - 1] 
                              : 'bg-gray-600'
                          }`}
                        ></div>
                      ))}
                    </div>
                    <p className={`text-xs ${
                      passwordStrength <= 1 ? 'text-red-400' :
                      passwordStrength === 2 ? 'text-orange-400' :
                      passwordStrength === 3 ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {strengthTexts[passwordStrength - 1] || 'Enter password'}
                    </p>
                  </div>
                )}
                
                {errors.password && (
                  <div className="mt-2 text-sm text-red-400 flex items-center gap-1 animate-shake">
                    <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                    {errors.password.message}
                  </div>
                )}
              </div>

              {/* Features List */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-purple-300">
                  <Zap size={14} className="text-yellow-400" />
                  <span>200+ Problems</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-purple-300">
                  <Shield size={14} className="text-green-400" />
                  <span>Secure Platform</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={`group relative w-full bg-gradient-to-r from-purple-600 to-purple-400 text-white py-3 px-4 rounded-xl font-semibold overflow-hidden transition-all duration-300 ${
                  loading ? 'opacity-75 cursor-not-allowed' : 'hover:from-purple-500 hover:to-purple-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(128,0,128,0.3)]'
                }`}
                disabled={loading}
              >
                <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Sign Up
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Login Redirect */}
            <div className="text-center mt-6 pt-4 border-t border-purple-500/30">
              <p className="text-purple-300/70 text-sm">
                Already have an account?{' '}
                <NavLink 
                  to="/login" 
                  className="text-purple-400 hover:text-purple-300 font-semibold transition-all hover:underline underline-offset-2"
                >
                  Login
                </NavLink>
              </p>
            </div>

            {/* Terms */}
            <p className="text-center text-xs text-purple-300/50 mt-4">
              By signing up, you agree to our{' '}
              <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">Terms</a>
              {' '}and{' '}
              <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        
        .animate-gradient {
          background-size: 300% 300%;
          animation: gradient 6s ease infinite;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-slideIn {
          animation: slideIn 0.6s ease-out forwards;
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animation-delay-1000 {
          animation-delay: 1000ms;
        }
        
        .animation-delay-2000 {
          animation-delay: 2000ms;
        }
        
        .bg-300\% {
          background-size: 300%;
        }
      `}</style>
    </div>
  );
}

export default Signup;
// import { useEffect, useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { z } from 'zod'
// import { NavLink, useNavigate } from 'react-router'
// import { useDispatch, useSelector } from 'react-redux';
// import { registerUser } from '../slices/authSlice';
// import { zodResolver } from '@hookform/resolvers/zod';

// const signupSchema = z.object({
//   firstName: z.string().min(3, "Minimum character should be 3"),
//   emailId: z.string().email("Invalid Email"),
//   password: z.string().min(8, "Password is too weak")
// });

// function Signup() {

//   const [showPassword, setShowPassword] = useState(false);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { isAuthenticated, loading } = useSelector((state) => state.auth); // Removed error as it wasn't used


//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm({ resolver: zodResolver(signupSchema) });

//   useEffect(() => {
//     if (isAuthenticated) {
//       navigate('/')
//     }
//   }, [isAuthenticated, navigate])

//   const onSubmit = (data) => {
//     dispatch(registerUser(data));
//   };
//   return (
//     <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-900 to-black">
//       <div className="card w-96 bg-black/50 border border-purple-500/30 shadow-2xl backdrop-blur-sm">
//         <div className="card-body">
//           <h2 className="card-title justify-center text-3xl mb-6 text-white">CodeVerse</h2>

//           <form onSubmit={handleSubmit(onSubmit)}>
//             {/* First Name Field */}
//             <div className="form-control">
//               <label className="label">
//                 <span className="label-text text-purple-300">First Name</span>
//               </label>
//               <input
//                 type="text"
//                 placeholder="John"
//                 className={`input input-bordered w-full bg-black/30 border-purple-500/50 text-white placeholder-purple-400/50 ${errors.firstName ? 'input-error border-red-500' : 'focus:border-purple-400'
//                   }`}
//                 {...register('firstName')}
//               />
//               {errors.firstName && (
//                 <span className="text-red-400 text-sm mt-1">{errors.firstName.message}</span>
//               )}
//             </div>

//             {/* Email Field */}
//             <div className="form-control mt-4">
//               <label className="label">
//                 <span className="label-text text-purple-300">Email</span>
//               </label>
//               <input
//                 type="email"
//                 placeholder="john@example.com"
//                 className={`input input-bordered w-full bg-black/30 border-purple-500/50 text-white placeholder-purple-400/50 ${errors.emailId ? 'input-error border-red-500' : 'focus:border-purple-400'
//                   }`}
//                 {...register('emailId')}
//               />
//               {errors.emailId && (
//                 <span className="text-red-400 text-sm mt-1">{errors.emailId.message}</span>
//               )}
//             </div>

//             {/* Password Field with Toggle */}
//             <div className="form-control mt-4">
//               <label className="label">
//                 <span className="label-text text-purple-300">Password</span>
//               </label>
//               <div className="relative">
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   placeholder="••••••••"
//                   className={`input input-bordered w-full pr-10 bg-black/30 border-purple-500/50 text-white placeholder-purple-400/50 ${errors.password ? 'input-error border-red-500' : 'focus:border-purple-400'
//                     }`}
//                   {...register('password')}
//                 />
//                 <button
//                   type="button"
//                   className="absolute top-1/2 right-3 transform -translate-y-1/2 text-purple-400 hover:text-purple-300 transition-colors"
//                   onClick={() => setShowPassword(!showPassword)}
//                   aria-label={showPassword ? "Hide password" : "Show password"}
//                 >
//                   {showPassword ? (
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
//                     </svg>
//                   ) : (
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                     </svg>
//                   )}
//                 </button>
//               </div>
//               {errors.password && (
//                 <span className="text-red-400 text-sm mt-1">{errors.password.message}</span>
//               )}
//             </div>

//             {/* Submit Button */}
//             <div className="form-control mt-8 flex justify-center">
//               <button
//                 type="submit"
//                 className={`btn bg-purple-600 border-purple-600 text-white hover:bg-purple-700 w-full ${loading ? 'loading btn-disabled' : ''
//                   }`}
//                 disabled={loading}
//               >
//                 {loading ? (
//                   <>
//                     <span className="loading loading-spinner"></span>
//                     Signing Up...
//                   </>
//                 ) : 'Sign Up'}
//               </button>
//             </div>
//           </form>

//           {/* Login Redirect */}
//           <div className="text-center mt-6">
//             <span className="text-sm text-purple-300">
//               Already have an account?{' '}
//               <NavLink to="/login" className="text-purple-400 hover:text-purple-300 transition-colors font-semibold">
//                 Login
//               </NavLink>
//             </span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


// export default Signup