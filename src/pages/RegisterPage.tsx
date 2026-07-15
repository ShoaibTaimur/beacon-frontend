import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RegisterForm from '../components/auth/RegisterForm';
import GoogleSignIn from '../components/auth/GoogleSignIn';
import Loader from '../components/ui/Loader';

export default function RegisterPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050912] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-[#050912] text-white flex items-center justify-center p-4 relative overflow-hidden antialiased">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 h-[400px] w-[400px] animate-float-slow rounded-full bg-blue-600/[0.04] blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] animate-float-slow rounded-full bg-cyan-500/[0.04] blur-3xl" style={{ animationDelay: "-3s" }} />
      </div>

      <div className="relative w-full max-w-md animate-beacon-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 items-center justify-center shadow-2xl shadow-cyan-500/30 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer hover:shadow-cyan-400/40"
          >
             <svg
               className="w-9 h-9 text-white"
               fill="none"
               viewBox="0 0 24 24"
               stroke="currentColor"
               strokeWidth={2}
             >
               <path
                 strokeLinecap="round"
                 strokeLinejoin="round"
                 d="M9.348 14.652a3.75 3.75 0 010-5.304m5.304 0a3.75 3.75 0 010 5.304m-7.425 2.121a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.788m13.788 0c3.808 3.808 3.808 9.98 0 13.788M12 12h.008v.008H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
               />
             </svg>
          </Link>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Create account
          </h1>
          <p className="mt-2 text-slate-400 text-sm">
            Get started with Beacon
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-2xl">
          <RegisterForm />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-[#050912] text-slate-500">or</span>
            </div>
          </div>

          <GoogleSignIn />
        </div>

        {/* Login link */}
        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors cursor-pointer"
            id="login-link"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
