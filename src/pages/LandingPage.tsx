import React, { useState, useEffect, useRef, MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

function AnimatedSection({ children, className = '', delay = 0 }: AnimatedSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.05 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-[0.98]'
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Update active tab on scroll
  useEffect(() => {
    const sections = ['features', 'usefulness', 'setup', 'requirements', 'about'];
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveTab(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTabClick = (e: MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setActiveTab(targetId);
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background glowing spheres */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-[40%] -left-40 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute -bottom-40 right-20 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[100px] animate-pulse delay-700" />
      </div>

      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 bg-slate-950/40 backdrop-blur-lg border-b border-white/5 transition-all duration-300 shadow-2xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-300">
              <svg className="w-5.5 h-5.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.652a3.75 3.75 0 010-5.304m5.304 0a3.75 3.75 0 010 5.304m-7.425 2.121a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.788m13.788 0c3.808 3.808 3.808 9.98 0 13.788M12 12h.008v.008H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent tracking-wide group-hover:text-cyan-400 transition-colors duration-300">Beacon</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
            <a
              href="#features"
              onClick={(e) => handleTabClick(e, 'features')}
              className={`relative py-1 transition-all duration-300 hover:text-cyan-400 ${
                activeTab === 'features' ? 'text-cyan-400' : 'text-slate-400'
              }`}
            >
              Features
              <span className={`absolute bottom-0 left-0 h-[2px] bg-cyan-500 transition-all duration-300 ${activeTab === 'features' ? 'w-full' : 'w-0'}`} />
            </a>
            <a
              href="#usefulness"
              onClick={(e) => handleTabClick(e, 'usefulness')}
              className={`relative py-1 transition-all duration-300 hover:text-cyan-400 ${
                activeTab === 'usefulness' ? 'text-cyan-400' : 'text-slate-400'
              }`}
            >
              Usefulness
              <span className={`absolute bottom-0 left-0 h-[2px] bg-cyan-500 transition-all duration-300 ${activeTab === 'usefulness' ? 'w-full' : 'w-0'}`} />
            </a>
            <a
              href="#setup"
              onClick={(e) => handleTabClick(e, 'setup')}
              className={`relative py-1 transition-all duration-300 hover:text-cyan-400 ${
                activeTab === 'setup' ? 'text-cyan-400' : 'text-slate-400'
              }`}
            >
              Setup
              <span className={`absolute bottom-0 left-0 h-[2px] bg-cyan-500 transition-all duration-300 ${activeTab === 'setup' ? 'w-full' : 'w-0'}`} />
            </a>
            <a
              href="#requirements"
              onClick={(e) => handleTabClick(e, 'requirements')}
              className={`relative py-1 transition-all duration-300 hover:text-cyan-400 ${
                activeTab === 'requirements' ? 'text-cyan-400' : 'text-slate-400'
              }`}
            >
              Requirements
              <span className={`absolute bottom-0 left-0 h-[2px] bg-cyan-500 transition-all duration-300 ${activeTab === 'requirements' ? 'w-full' : 'w-0'}`} />
            </a>
            <a
              href="#about"
              onClick={(e) => handleTabClick(e, 'about')}
              className={`relative py-1 transition-all duration-300 hover:text-cyan-400 ${
                activeTab === 'about' ? 'text-cyan-400' : 'text-slate-400'
              }`}
            >
              Developer
              <span className={`absolute bottom-0 left-0 h-[2px] bg-cyan-500 transition-all duration-300 ${activeTab === 'about' ? 'w-full' : 'w-0'}`} />
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <Link to="/dashboard" className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-[1.05] active:scale-[0.98]">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-xs font-bold text-slate-400 hover:text-white transition-colors duration-300">
                    Sign In
                  </Link>
                  <Link to="/register" className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold transition-all hover:scale-[1.05] active:scale-[0.98]">
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300 cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-28 text-center relative z-10">
        <AnimatedSection delay={0}>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6">
            Track, Monitor, and Control <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent hover:brightness-110 transition-all duration-300">Your Devices Remotely</span>
          </h1>
        </AnimatedSection>

        <AnimatedSection delay={150}>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 leading-relaxed mb-10">
            Link your Android devices seamlessly. Monitor battery level, RAM usage, storage stats, and sound mode in real-time. Execute remote ring alerts and track precise location histories with secure role-based sharing permissions.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={300}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/beacon.apk"
              download
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-8 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold transition-all shadow-[0_0_25px_rgba(6,182,212,0.2)] hover:shadow-[0_0_35px_rgba(6,182,212,0.4)] hover:scale-[1.05] active:scale-[0.98] cursor-pointer"
            >
              <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Android APK
            </a>
            <Link
              to={user ? "/dashboard" : "/login"}
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-8 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-bold transition-all hover:scale-[1.05] active:scale-[0.98]"
            >
              Open Web Dashboard
            </Link>
          </div>
        </AnimatedSection>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 border-t border-white/5 relative z-10 bg-slate-950/40 backdrop-blur-3xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection delay={0} className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Powerful Features</h2>
            <p className="text-slate-400 max-w-lg mx-auto">Everything you need to keep tabs on your device and keep it safe.</p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <AnimatedSection delay={0}>
              <div className="h-full p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 hover:bg-white/[0.04] transition-all duration-300 hover:scale-[1.03] group">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-6 group-hover:bg-cyan-500/20 transition-all duration-300 group-hover:scale-110">
                  <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">Location & History</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Check active location and trace the exact timeline movements on an interactive map.
                </p>
              </div>
            </AnimatedSection>

            {/* Feature 2 */}
            <AnimatedSection delay={150}>
              <div className="h-full p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 hover:bg-white/[0.04] transition-all duration-300 hover:scale-[1.03] group">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-6 group-hover:bg-cyan-500/20 transition-all duration-300 group-hover:scale-110">
                  <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">Remote Commands</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Trigger sound rings remotely, force locate coordinates, and request instant system parameter updates.
                </p>
              </div>
            </AnimatedSection>

            {/* Feature 3 */}
            <AnimatedSection delay={300}>
              <div className="h-full p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 hover:bg-white/[0.04] transition-all duration-300 hover:scale-[1.03] group">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-6 group-hover:bg-cyan-500/20 transition-all duration-300 group-hover:scale-110">
                  <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">Device Vitals</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Monitor storage levels, RAM usage, sound state, battery percentage, charging state, and online statuses.
                </p>
              </div>
            </AnimatedSection>

            {/* Feature 4 */}
            <AnimatedSection delay={450}>
              <div className="h-full p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 hover:bg-white/[0.04] transition-all duration-300 hover:scale-[1.03] group">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-6 group-hover:bg-cyan-500/20 transition-all duration-300 group-hover:scale-110">
                  <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">Granular Sharing</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Invite companions with distinct ranks (Manager, Finder, Viewer) and precise visibility permissions.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Usefulness Section */}
      <section id="usefulness" className="py-24 border-t border-white/5 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection delay={0} className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">When is it Useful?</h2>
            <p className="text-slate-400 max-w-lg mx-auto">Real-world scenarios where Beacon keeps you in control.</p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Case 1 */}
            <AnimatedSection delay={0}>
              <div className="h-full p-8 rounded-2xl bg-white/[0.01] border border-white/5 hover:border-cyan-500/20 hover:bg-white/[0.02] shadow-2xl relative overflow-hidden group transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all duration-500" />
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">Lost Device Recovery</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Can't find your phone under a couch? Log into the web dashboard, see its current GPS marker, and trigger a high-volume remote ring to locate it instantly, even if the device sound profile is set to silent.
                </p>
              </div>
            </AnimatedSection>

            {/* Case 2 */}
            <AnimatedSection delay={150}>
              <div className="h-full p-8 rounded-2xl bg-white/[0.01] border border-white/5 hover:border-blue-500/20 hover:bg-white/[0.02] shadow-2xl relative overflow-hidden group transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all duration-500" />
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">Consent-Based Sharing</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Keep loved ones safe. Share your location timeline with family members or friends. Customize their ranks so they can view details or execute remote locate pings during emergencies.
                </p>
              </div>
            </AnimatedSection>

            {/* Case 3 */}
            <AnimatedSection delay={300}>
              <div className="h-full p-8 rounded-2xl bg-white/[0.01] border border-white/5 hover:border-cyan-500/20 hover:bg-white/[0.02] shadow-2xl relative overflow-hidden group transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all duration-500" />
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">Remote Hardware Checks</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Manage secondary devices or tablets remotely. Check battery status, active charging indicator, storage capacity, and RAM usage from any modern web browser without needing the physical device in hand.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Setup Guide Section */}
      <section id="setup" className="py-24 border-t border-white/5 relative z-10 bg-slate-950/40 backdrop-blur-3xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection delay={0} className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Quick Setup Guide</h2>
            <p className="text-slate-400 max-w-lg mx-auto">Get your devices connected and monitored in less than 5 minutes.</p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
            {/* Timeline connector line for desktop */}
            <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-cyan-500/30 -translate-y-1/2 z-0" />

            {/* Step 1 */}
            <AnimatedSection delay={0} className="relative z-10 md:col-span-1">
              <div className="h-full p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-cyan-500/30 hover:bg-slate-900 transition-all duration-300 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-extrabold text-lg mb-4 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                  1
                </div>
                <h4 className="text-sm font-bold text-white mb-2">Create Account</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Sign up on the web dashboard using email or Google one-tap SSO.
                </p>
              </div>
            </AnimatedSection>

            {/* Step 2 */}
            <AnimatedSection delay={100} className="relative z-10 md:col-span-1">
              <div className="h-full p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-cyan-500/30 hover:bg-slate-900 transition-all duration-300 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-extrabold text-lg mb-4 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                  2
                </div>
                <h4 className="text-sm font-bold text-white mb-2">Download APK</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Download the Android Companion App from the landing page.
                </p>
              </div>
            </AnimatedSection>

            {/* Step 3 */}
            <AnimatedSection delay={200} className="relative z-10 md:col-span-1">
              <div className="h-full p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-cyan-500/30 hover:bg-slate-900 transition-all duration-300 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-extrabold text-lg mb-4 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                  3
                </div>
                <h4 className="text-sm font-bold text-white mb-2">Login on App</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Log in on the Android app to automatically register the device.
                </p>
              </div>
            </AnimatedSection>

            {/* Step 4 */}
            <AnimatedSection delay={300} className="relative z-10 md:col-span-1">
              <div className="h-full p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-cyan-500/30 hover:bg-slate-900 transition-all duration-300 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-extrabold text-lg mb-4 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                  4
                </div>
                <h4 className="text-sm font-bold text-white mb-2">Grant Access</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Enable location, background service, & notification permissions.
                </p>
              </div>
            </AnimatedSection>

            {/* Step 5 */}
            <AnimatedSection delay={400} className="relative z-10 md:col-span-1">
              <div className="h-full p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-cyan-500/30 hover:bg-slate-900 transition-all duration-300 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-extrabold text-lg mb-4 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                  5
                </div>
                <h4 className="text-sm font-bold text-white mb-2">Remote Sync</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Control settings & vitals on the Web Dashboard instantly!
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section id="requirements" className="py-24 border-t border-white/5 relative z-10 bg-slate-950/40 backdrop-blur-3xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection delay={0} className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Device Requirements</h2>
            <p className="text-slate-400 max-w-lg mx-auto">Make sure your hardware supports the background syncing mechanics.</p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AnimatedSection delay={0}>
              <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/20 transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">Android Companion App</h3>
                </div>
                <ul className="space-y-4 text-slate-400 text-sm">
                  <li className="flex gap-3 hover:translate-x-1 transition-transform duration-200">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>Android 8.0 (Oreo, API 26) or higher.</span>
                  </li>
                  <li className="flex gap-3 hover:translate-x-1 transition-transform duration-200">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>Google Play Services (required for Firebase Cloud Messaging functionality).</span>
                  </li>
                  <li className="flex gap-3 hover:translate-x-1 transition-transform duration-200">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>"Always Allow" location permission (for background updates and locate command syncs).</span>
                  </li>
                  <li className="flex gap-3 hover:translate-x-1 transition-transform duration-200">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>Battery Optimization exemption (required to prevent OS sleeping the background service).</span>
                  </li>
                </ul>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={150}>
              <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/20 transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">Web Dashboard</h3>
                </div>
                <ul className="space-y-4 text-slate-400 text-sm">
                  <li className="flex gap-3 hover:translate-x-1 transition-transform duration-200">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>Modern, standard browser (Google Chrome, Mozilla Firefox, Apple Safari, Microsoft Edge).</span>
                  </li>
                  <li className="flex gap-3 hover:translate-x-1 transition-transform duration-200">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>Active internet connectivity to query database updates and dispatch commands.</span>
                  </li>
                  <li className="flex gap-3 hover:translate-x-1 transition-transform duration-200">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>Google account (optional, supported for seamless one-tap Google SSO sign-in).</span>
                  </li>
                </ul>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section id="about" className="py-24 border-t border-white/5 relative z-10 text-center">
        <AnimatedSection delay={0} className="max-w-2xl mx-auto px-4">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-xl shadow-cyan-500/10 hover:rotate-12 hover:scale-105 transition-all duration-300">
            S
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">About the Developer</h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-8">
            Project Beacon is designed and built by Shoaib Taimur, a passionate software developer specializing in secure, real-time full-stack web architectures and companion native applications.
          </p>
          <a
            href="https://taimur.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 py-3.5 px-8 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold transition-all hover:scale-[1.05] active:scale-[0.98] hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] cursor-pointer"
          >
            Visit Portfolio: taimur.dev ↗
          </a>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 relative z-10 bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Beacon. All rights reserved.</p>
          <p>
            Designed with premium aesthetics by{' '}
            <a href="https://taimur.dev" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors font-semibold">
              Shoaib Taimur
            </a>
          </p>
        </div>
      </footer>

      {/* Mobile menu drawer */}
      <div className={`fixed inset-0 z-50 md:hidden transition-all duration-500 ${isMenuOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'}`}>
        {/* Backdrop overlay */}
        <div
          onClick={() => setIsMenuOpen(false)}
          className={`absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-500 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
        />
        
        {/* Slide-out panel */}
        <div className={`absolute top-0 right-0 w-72 h-full bg-slate-950/90 backdrop-blur-xl border-l border-white/5 p-6 flex flex-col gap-8 transition-transform duration-500 ease-out transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent tracking-wide">Menu</span>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300 cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex flex-col gap-6 text-base font-semibold">
            <a
              href="#features"
              onClick={(e) => { handleTabClick(e, 'features'); setIsMenuOpen(false); }}
              className={`hover:text-cyan-400 transition-colors duration-300 ${activeTab === 'features' ? 'text-cyan-400' : 'text-slate-400'}`}
            >
              Features
            </a>
            <a
              href="#usefulness"
              onClick={(e) => { handleTabClick(e, 'usefulness'); setIsMenuOpen(false); }}
              className={`hover:text-cyan-400 transition-colors duration-300 ${activeTab === 'usefulness' ? 'text-cyan-400' : 'text-slate-400'}`}
            >
              Usefulness
            </a>
            <a
              href="#setup"
              onClick={(e) => { handleTabClick(e, 'setup'); setIsMenuOpen(false); }}
              className={`hover:text-cyan-400 transition-colors duration-300 ${activeTab === 'setup' ? 'text-cyan-400' : 'text-slate-400'}`}
            >
              Setup
            </a>
            <a
              href="#requirements"
              onClick={(e) => { handleTabClick(e, 'requirements'); setIsMenuOpen(false); }}
              className={`hover:text-cyan-400 transition-colors duration-300 ${activeTab === 'requirements' ? 'text-cyan-400' : 'text-slate-400'}`}
            >
              Requirements
            </a>
            <a
              href="#about"
              onClick={(e) => { handleTabClick(e, 'about'); setIsMenuOpen(false); }}
              className={`hover:text-cyan-400 transition-colors duration-300 ${activeTab === 'about' ? 'text-cyan-400' : 'text-slate-400'}`}
            >
              Developer
            </a>
          </nav>

          <div className="mt-auto flex flex-col gap-4">
            <a
              href="/beacon.apk"
              download
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold transition-all shadow-lg hover:brightness-110 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download APK
            </a>
            {user ? (
              <Link
                to="/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-bold transition-all hover:bg-white/10"
              >
                Go to Dashboard
              </Link>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-bold transition-all hover:bg-white/10"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center py-3 px-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-bold transition-all hover:bg-cyan-500/20"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
