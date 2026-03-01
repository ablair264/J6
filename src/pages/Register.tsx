import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register(email.trim(), password, name.trim() || undefined);
      navigate('/projects');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-dvh flex items-center justify-center bg-gradient-to-br from-[#0f1419] via-[#1a1f2a] to-[#2c3e50] font-sans p-4 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(15,20,25,0.9)_0%,rgba(121,213,233,0.15)_20%,rgba(26,31,42,0.95)_40%,rgba(77,174,172,0.1)_60%,rgba(44,62,80,0.9)_80%,rgba(121,213,233,0.1)_100%)] bg-[length:300%_300%] animate-[gradient-shift_8s_ease_infinite]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(121,213,233,0.12)_0%,transparent_40%),radial-gradient(ellipse_at_30%_70%,rgba(77,174,172,0.08)_0%,transparent_50%)] pointer-events-none z-[1]" />
      <div className="absolute top-[60%] left-[10%] w-[clamp(150px,25vw,250px)] h-[clamp(150px,25vw,250px)] bg-[radial-gradient(circle,rgba(121,213,233,0.08)_0%,transparent_100%)] rounded-full blur-[40px] animate-[gentle-float_7s_ease-in-out_infinite_reverse] pointer-events-none z-[3] max-sm:hidden" />

      <div className="relative z-10 w-full max-w-[400px] md:max-w-[440px] lg:max-w-[480px]">
        <div className="bg-[rgba(26,31,42,0.95)] backdrop-blur-xl border-2 border-[rgba(121,213,233,0.2)] rounded-2xl p-8 lg:p-10 shadow-[0_25px_50px_rgba(0,0,0,0.5),0_0_40px_rgba(121,213,233,0.1)] transition-shadow duration-300 hover:shadow-[0_25px_50px_rgba(0,0,0,0.5),0_0_60px_rgba(121,213,233,0.15)]">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <img
                src="/J6.webp"
                alt="J6"
                className="h-[clamp(2.5rem,8vw,3.5rem)] w-auto object-contain brightness-110 drop-shadow-[0_4px_8px_rgba(121,213,233,0.3)] transition-transform duration-300 hover:scale-105"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
            <p className="text-sm text-[rgba(148,163,184,0.9)] font-medium">
              Create your account
            </p>
          </div>

          <form onSubmit={handleRegister} className="flex flex-col gap-1">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-medium mb-4 backdrop-blur-sm">
                <span className="text-xl shrink-0">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-2 mb-4">
              <label htmlFor="name" className="text-xs font-semibold text-white pl-1">
                Name <span className="text-[rgba(148,163,184,0.5)] font-normal">(optional)</span>
              </label>
              <input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-3 border-2 border-transparent rounded-xl text-sm font-medium bg-[rgba(255,255,255,0.05)] text-white placeholder-[rgba(148,163,184,0.5)] outline-none transition-all duration-300 shadow-md min-h-[48px] focus:border-[rgba(121,213,233,0.5)] focus:bg-[rgba(255,255,255,0.08)] focus:ring-2 focus:ring-[rgba(121,213,233,0.2)] focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed md:text-base"
                disabled={loading}
                autoComplete="name"
              />
            </div>

            <div className="flex flex-col gap-2 mb-4">
              <label htmlFor="email" className="text-xs font-semibold text-white pl-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3 border-2 border-transparent rounded-xl text-sm font-medium bg-[rgba(255,255,255,0.05)] text-white placeholder-[rgba(148,163,184,0.5)] outline-none transition-all duration-300 shadow-md min-h-[48px] focus:border-[rgba(121,213,233,0.5)] focus:bg-[rgba(255,255,255,0.08)] focus:ring-2 focus:ring-[rgba(121,213,233,0.2)] focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed md:text-base"
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="flex flex-col gap-2 mb-4">
              <label htmlFor="password" className="text-xs font-semibold text-white pl-1">
                Password <span className="text-[rgba(148,163,184,0.5)] font-normal">(min. 8 characters)</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-3 pr-12 border-2 border-transparent rounded-xl text-sm font-medium bg-[rgba(255,255,255,0.05)] text-white placeholder-[rgba(148,163,184,0.5)] outline-none transition-all duration-300 shadow-md min-h-[48px] focus:border-[rgba(121,213,233,0.5)] focus:bg-[rgba(255,255,255,0.08)] focus:ring-2 focus:ring-[rgba(121,213,233,0.2)] focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed md:text-base"
                  required
                  minLength={8}
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(148,163,184,0.6)] hover:text-white transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 w-full px-6 py-3.5 mt-4 bg-[rgba(121,213,233,0.9)] text-[#0f1419] border-none rounded-xl text-sm font-bold cursor-pointer transition-all duration-200 shadow-[0_8px_25px_rgba(121,213,233,0.15)] min-h-[48px] hover:bg-[rgba(121,213,233,1)] hover:-translate-y-0.5 hover:shadow-[0_15px_35px_rgba(121,213,233,0.25)] active:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 focus-visible:outline-2 focus-visible:outline-[rgba(121,213,233,0.8)] focus-visible:outline-offset-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-[rgba(148,163,184,0.7)]">
              Already have an account?{' '}
              <Link to="/login" className="text-[rgba(121,213,233,0.9)] hover:text-[rgba(121,213,233,1)] hover:underline transition-colors font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
