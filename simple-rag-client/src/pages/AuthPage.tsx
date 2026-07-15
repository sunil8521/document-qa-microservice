import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { GiWhiteBook } from 'react-icons/gi';
import { useForm } from 'react-hook-form';
import { useLoginMutation, useSignupMutation } from '../hooks/useAuth';
import type { LoginRequest, SignupRequest } from '../types/auth';

export function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const mode = searchParams.get('mode');

  const [isLogin, setIsLogin] = useState(mode !== 'signup');
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useLoginMutation();
  const signupMutation = useSignupMutation();

  const { register: registerLogin, handleSubmit: handleSubmitLogin, reset: resetLogin, formState: { errors: loginErrors } } = useForm<LoginRequest>();
  const { register: registerSignup, handleSubmit: handleSubmitSignup, reset: resetSignup, formState: { errors: signupErrors } } = useForm<SignupRequest>();

  useEffect(() => {
    setIsLogin(mode !== 'signup');
    resetLogin();
    resetSignup();
    setShowPassword(false);
  }, [mode, resetLogin, resetSignup]);

  const onLogin = (data: LoginRequest) => {
    loginMutation.mutate(data, {
      onSuccess: () => navigate('/chat')
    });
  };

  const onSignup = (data: SignupRequest) => {
    signupMutation.mutate(data, {
      onSuccess: () => {
        resetSignup();
        navigate('/auth?mode=login');
      }
    });
  };

  const toggleMode = () => {
    const nextMode = isLogin ? 'signup' : 'login';
    navigate(`/auth?mode=${nextMode}`);
  };

  return (
    <div className="min-h-screen bg-[#f8faf8] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-[#E8F5E9] opacity-40" />
        <div className="absolute -bottom-60 -left-40 w-[500px] h-[500px] rounded-full bg-[#C8E6C9] opacity-30" />
      </div>

      {/* Main Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-[950px] min-h-[580px] bg-white rounded-3xl shadow-2xl shadow-gray-200/60 overflow-hidden flex z-10"
      >
        {/* ─── LEFT PANEL (Slides) ─── */}
        <motion.div
          layout
          className="hidden md:block absolute top-0 bottom-0 w-[45%] z-20"
          animate={{
            left: isLogin ? '0%' : '55%',
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#388E3C] rounded-3xl p-10 flex flex-col justify-between relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3" />
            <div className="absolute top-1/2 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-1/2" />

            {/* Logo */}
            <div className="relative z-10">
              <div className="flex items-center gap-2.5 mb-2">
                <GiWhiteBook className="w-8 h-8 text-white" />
                <span className="text-xl font-extrabold font-heading text-white tracking-tight">
                  RAG Book<span className="text-[#A5D6A7]">.</span>
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {isLogin ? (
                  <motion.div
                    key="login-panel"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-4xl font-extrabold font-heading text-white leading-tight mb-4">
                      Hello,<br />
                      <span className="font-serif italic font-normal text-[#A5D6A7]">Welcome!</span>
                    </h2>
                    <p className="text-green-100/70 text-[15px] leading-relaxed mb-8 max-w-xs">
                      Don't have an account yet? Create one now and start chatting with your documents.
                    </p>
                    <button
                      onClick={toggleMode}
                      className="inline-flex items-center gap-2 bg-transparent border-2 border-white/30 text-white font-semibold px-8 py-3 rounded-full hover:bg-white/10 hover:border-white/50 transition-all text-sm"
                    >
                      Register <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="signup-panel"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-4xl font-extrabold font-heading text-white leading-tight mb-4">
                      Welcome<br />
                      <span className="font-serif italic font-normal text-[#A5D6A7]">back!</span>
                    </h2>
                    <p className="text-green-100/70 text-[15px] leading-relaxed mb-8 max-w-xs">
                      Already have an account? Sign in and continue your AI-powered document research.
                    </p>
                    <button
                      onClick={toggleMode}
                      className="inline-flex items-center gap-2 bg-transparent border-2 border-white/30 text-white font-semibold px-8 py-3 rounded-full hover:bg-white/10 hover:border-white/50 transition-all text-sm"
                    >
                      <ArrowLeft className="w-4 h-4" /> Sign In
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom features */}
            <div className="relative z-10 flex items-center gap-3 text-green-100/40 text-xs">
              <span>Powered by Gemini AI & pgvector</span>
            </div>
          </div>
        </motion.div>

        {/* ─── RIGHT SIDE: LOGIN FORM ─── */}
        <div className={`w-full md:w-[55%] ml-auto p-8 sm:p-12 flex flex-col justify-center transition-all duration-300 ${!isLogin ? 'pointer-events-none opacity-0 md:opacity-100' : 'pointer-events-auto opacity-100'}`}>
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors mb-6 group"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 group-hover:bg-gray-100 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                  </div>
                  Back to home
                </button>
                <h1 className="text-3xl font-extrabold font-heading text-gray-900 mb-2">
                  Sign In
                </h1>
                <p className="text-gray-400 text-sm mb-10">
                  Access your knowledge books
                </p>

                <form onSubmit={handleSubmitLogin(onLogin)} className="space-y-5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      {...registerLogin('email', { required: 'Email is required' })}
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/15 focus:border-[#2E7D32] transition-all"
                    />
                    {loginErrors.email && <span className="text-red-500 text-xs mt-1 block">{loginErrors.email.message}</span>}
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...registerLogin('password', { required: 'Password is required' })}
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/15 focus:border-[#2E7D32] transition-all pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {loginErrors.password && <span className="text-red-500 text-xs mt-1 block">{loginErrors.password.message}</span>}
                    
                    <div className="flex justify-end mt-2">
                      <a href="#" className="text-xs font-semibold text-[#2E7D32] hover:text-[#1B5E20] transition-colors">
                        Forgot Password?
                      </a>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="w-full bg-[#2E7D32] text-white font-bold text-sm py-4 rounded-xl hover:bg-[#1B5E20] transition-all hover:shadow-lg hover:shadow-green-100 flex items-center justify-center gap-2 group disabled:opacity-70"
                  >
                    {loginMutation.isPending ? 'Signing In...' : 'Sign In'}
                  </button>

                  <div className="text-center mt-6 md:hidden">
                    <p className="text-sm text-gray-500">
                      Don't have an account ?{' '}
                      <button
                        type="button"
                        onClick={toggleMode}
                        className="font-bold text-[#2E7D32] hover:text-[#1B5E20] transition-colors"
                      >
                        Register
                      </button>
                    </p>
                  </div>
                </form>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* ─── LEFT SIDE: SIGNUP FORM ─── */}
        <div className={`absolute left-0 top-0 bottom-0 w-full md:w-[55%] p-8 sm:p-12 flex flex-col justify-center transition-all duration-300 ${isLogin ? 'pointer-events-none opacity-0 md:opacity-100' : 'pointer-events-auto opacity-100'}`}>
          <AnimatePresence mode="wait">
            {!isLogin ? (
              <motion.div
                key="signup-form"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors mb-6 group"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 group-hover:bg-gray-100 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                  </div>
                  Back to home
                </button>
                <h1 className="text-3xl font-extrabold font-heading text-gray-900 mb-2">
                  Create Account
                </h1>
                <p className="text-gray-400 text-sm mb-8">
                  Start your AI document journey
                </p>

                <form onSubmit={handleSubmitSignup(onSignup)} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      {...registerSignup('name', { required: 'Name is required' })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/15 focus:border-[#2E7D32] transition-all"
                    />
                    {signupErrors.name && <span className="text-red-500 text-xs mt-1 block">{signupErrors.name.message}</span>}
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      {...registerSignup('email', { required: 'Email is required' })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/15 focus:border-[#2E7D32] transition-all"
                    />
                    {signupErrors.email && <span className="text-red-500 text-xs mt-1 block">{signupErrors.email.message}</span>}
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min. 8 characters"
                        {...registerSignup('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/15 focus:border-[#2E7D32] transition-all pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {signupErrors.password && <span className="text-red-500 text-xs mt-1 block">{signupErrors.password.message}</span>}
                  </div>

                  <button
                    type="submit"
                    disabled={signupMutation.isPending}
                    className="w-full bg-[#2E7D32] text-white font-bold text-sm py-4 rounded-xl hover:bg-[#1B5E20] transition-all hover:shadow-lg hover:shadow-green-100 flex items-center justify-center gap-2 group disabled:opacity-70"
                  >
                    {signupMutation.isPending ? 'Creating Account...' : 'Create Account'}
                  </button>

                  <div className="text-center mt-6 md:hidden">
                    <p className="text-sm text-gray-500">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={toggleMode}
                        className="font-bold text-[#2E7D32] hover:text-[#1B5E20] transition-colors"
                      >
                        Sign In
                      </button>
                    </p>
                  </div>
                </form>

                <p className="text-center text-[11px] text-gray-300 mt-4">
                  By signing up you agree to our Terms & Privacy Policy
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
