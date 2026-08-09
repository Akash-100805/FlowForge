import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/authService';
import { Eye, EyeOff, LayoutTemplate } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await register({ name, email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex animate-fade-in">
      {/* Left Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-8 sm:px-16 relative">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-10">
            <LayoutTemplate className="w-8 h-8 text-accent" />
            <span className="text-2xl font-bold text-text-primary tracking-tight">FlowForge</span>
          </div>

          <h1 className="text-4xl font-bold text-text-primary mb-2">Create Account</h1>
          <p className="text-text-secondary mb-10">Start managing your projects seamlessly.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Full Name" 
                className="input-styled" 
                required 
              />
            </div>
            <div>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Email Address" 
                className="input-styled" 
                required 
              />
            </div>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Password" 
                className="input-styled pr-12" 
                required 
              />
              <button 
                type="button" 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                placeholder="Confirm Password" 
                className="input-styled pr-12" 
                required 
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>
            )}

            <button type="submit" disabled={loading} className="w-full btn-accent shadow-lg shadow-accent/20 mt-2">
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-text-secondary">
            Already a member?{' '}
            <Link to="/login" className="text-accent hover:text-accent-hover font-semibold transition-colors">
              Log In
            </Link>
          </div>
        </div>
      </div>

      {/* Right Panel - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 p-4">
        <div className="w-full h-full relative rounded-3xl overflow-hidden bg-secondary">
          <img 
            src="/assets/login_illustration.png" 
            alt="Workspace Illustration" 
            className="absolute inset-0 w-full h-full object-cover rounded-3xl transition-transform duration-1000 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent pointer-events-none"></div>
          <div className="absolute bottom-12 left-12 right-12 z-10 text-white drop-shadow-md">
            <h2 className="text-3xl font-bold mb-2">Plan. Build. Ship - Together.</h2>
            <p className="text-white/80">Finally, all your work in one place.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

