import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { loginWithEmail, loginWithSocial } = useAuth();
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await loginWithEmail(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSocialLogin = async (provider) => {
    setError('');
    try {
      await loginWithSocial(provider, {
        name: provider === 'Google' ? 'Google Student' : 'GitHub Developer',
        email: provider === 'Google' ? 'google.student@inst.edu' : 'github.dev@inst.edu',
      });
      navigate('/dashboard');
    } catch {
      setError(`Failed to sign in with ${provider}.`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 space-y-6 border border-slate-200">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">StudManager Portal</h1>
          <p className="text-sm text-slate-500">Institutional Student & Academic Records System</p>
        </div>

        {error && (
          <div role="alert" className="p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Institutional Email</label>
            <div className="relative mt-1">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                id="email"
                type="email"
                required
                placeholder="admin@inst.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
            <div className="relative mt-1">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg text-sm transition cursor-pointer"
          >
            Sign In with Email
          </button>
        </form>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-xs uppercase text-slate-400">Or continue with Social Auth</span>
          <div className="border-t border-slate-200 w-full" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleSocialLogin('Google')}
            className="flex items-center justify-center gap-2 border border-slate-300 hover:bg-slate-50 py-2.5 px-4 rounded-lg text-sm font-medium text-slate-700 transition cursor-pointer"
          >
            Google
          </button>
          <button
            type="button"
            onClick={() => handleSocialLogin('GitHub')}
            className="flex items-center justify-center gap-2 border border-slate-300 hover:bg-slate-50 py-2.5 px-4 rounded-lg text-sm font-medium text-slate-700 transition cursor-pointer"
          >
            GitHub
          </button>
        </div>

        <p className="text-xs text-center text-slate-400">
          Demo Admin: <span className="font-mono text-slate-600">admin@inst.edu</span> / <span className="font-mono text-slate-600">password123</span>
        </p>
      </div>
    </div>
  );
}

