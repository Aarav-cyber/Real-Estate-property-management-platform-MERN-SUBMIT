import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLES = [
  { value: 'owner', label: 'Property Owner', desc: 'List and manage your properties' },
  { value: 'tenant', label: 'Tenant', desc: 'Find and rent properties' },
  { value: 'manager', label: 'Manager', desc: 'Manage on behalf of owners' },
];

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'tenant' });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    const res = await register(form);
    if (res.success) {
      toast.success('Account created! Welcome to RealEst.');
      navigate('/dashboard');
    } else {
      toast.error(res.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="orb w-[500px] h-[500px] bg-primary-600/15 -top-32 -right-32 pointer-events-none" />
      <div className="orb w-[400px] h-[400px] bg-accent-500/10 -bottom-20 -left-20 pointer-events-none" />

      <div className="w-full max-w-lg relative z-10 animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
              <Building2 size={20} className="text-white" />
            </div>
            <span className="font-display font-bold text-2xl text-white">Real<span className="gradient-text">Est</span></span>
          </Link>
          <h1 className="text-3xl font-display font-bold text-white">Create your account</h1>
          <p className="text-gray-400 mt-2 text-sm">Join thousands of property professionals</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5" id="register-form">
            {/* Name */}
            <div>
              <label className="label" htmlFor="reg-name">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  id="reg-name"
                  type="text"
                  required
                  placeholder="John Doe"
                  className="input pl-10"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="label" htmlFor="reg-email">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  id="reg-email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="input pl-10"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label" htmlFor="reg-password">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="Min. 6 characters"
                  className="input pl-10 pr-10"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  id="reg-toggle-password"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Role selector */}
            <div>
              <label className="label">I am a...</label>
              <div className="grid grid-cols-3 gap-2" id="role-selector">
                {ROLES.map(({ value, label, desc }) => (
                  <button
                    key={value}
                    type="button"
                    id={`role-${value}`}
                    onClick={() => setForm({ ...form, role: value })}
                    className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                      form.role === value
                        ? 'border-primary-500 bg-primary-500/15 text-primary-300'
                        : 'border-white/10 bg-dark-700 text-gray-400 hover:border-primary-500/40'
                    }`}
                  >
                    <p className="text-xs font-semibold">{label}</p>
                    <p className="text-[10px] mt-0.5 opacity-70">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-base"
              id="register-submit-btn"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <>Create Account <ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="flex items-center gap-2 mt-5 p-3 rounded-xl bg-green-500/5 border border-green-500/10">
            <Shield size={14} className="text-green-400 flex-shrink-0" />
            <p className="text-xs text-green-400/80">Your data is protected with bank-grade 256-bit encryption</p>
          </div>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors" id="goto-login">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
