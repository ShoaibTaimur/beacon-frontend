import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const [activeTab, setActiveTab] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onMove = (e: MouseEvent) => {
      setMouse({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Update active tab on scroll
  useEffect(() => {
    const sections = ['features', 'how-it-works', 'setup', 'compare', 'requirements', 'about'];
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

  const handleTabClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setActiveTab(targetId);
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const features = [
    {
      title: "Location Timeline",
      desc: "Scrub through the day's trajectory, spot stay points, and replay every route.",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
      ),
    },
    {
      title: "System Parameters",
      desc: "Live battery, storage, RAM, and OS state — synced seconds after they change.",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 10.5h.375c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125H21M4.5 18.75h9.75a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H4.5A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
      ),
    },
    {
      title: "Trusted Companions",
      desc: "Invite viewers, finders, or managers with granular data scope permissions.",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72M6.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM18.75 9.75a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
      ),
    },
    {
      title: "Remote Commands",
      desc: "Ring, locate, and refresh — trigger any registered device from anywhere.",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9a6 6 0 0 0-12 0v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m3.714 0a24.255 24.255 0 0 1-3.714 0m3.714 0a3 3 0 1 1-3.714 0" />
      ),
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050912] text-white antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute h-[600px] w-[600px] rounded-full bg-cyan-500/[0.08] blur-3xl transition-transform duration-700 ease-out"
          style={{ top: `${mouse.y * 20 - 10}%`, left: `${mouse.x * 40 + 10}%` }}
        />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] animate-float-slow rounded-full bg-blue-600/[0.07] blur-3xl" />
        <div className="absolute top-1/3 left-0 h-[400px] w-[400px] animate-float-slow rounded-full bg-indigo-500/[0.06] blur-3xl" style={{ animationDelay: "-3s" }} />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.1]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.12) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse at 50% 0%, black 40%, transparent 75%)",
          }}
        />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#050912]/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <a href="#" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="group flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-[0.22em] text-cyan-400 transition-all duration-300 group-hover:text-cyan-300 group-hover:tracking-[0.28em]">
              BEACON
            </span>
          </a>
          <div className="hidden items-center gap-1 md:flex">
            {[
              { l: "Features", id: "features" },
              { l: "How it works", id: "how-it-works" },
              { l: "Setup Guide", id: "setup" },
              { l: "Compare", id: "compare" },
              { l: "Requirements", id: "requirements" },
              { l: "Developer", id: "about" }
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleTabClick(e, item.id)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-white/5 ${
                  activeTab === item.id ? 'text-cyan-400 bg-white/[0.02]' : 'text-slate-400 hover:text-white'
                }`}
              >
                {item.l}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <Link
                to="/dashboard"
                className="group relative inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:shadow-cyan-500/50 hover:-translate-y-0.5"
              >
                Dashboard
                <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
              </Link>
            ) : (
              <>
                <Link to="/login" className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 transition-colors hover:text-white sm:inline">Sign in</Link>
                <Link
                  to="/register"
                  className="group relative inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:shadow-cyan-500/50 hover:-translate-y-0.5"
                >
                  Register
                  <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
                </Link>
              </>
            )}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300 cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-6 pt-40 pb-24 sm:pt-48">
        <div className={`mx-auto max-w-3xl text-center ${mounted ? "animate-beacon-slide-up" : "opacity-0"}`}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300 backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping-slow rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
            </span>
            Live tracking for Android
          </div>
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            Know where your{" "}
            <span className="relative inline-block">
              <span className="animate-gradient-shift bg-gradient-to-r from-cyan-300 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
                Android
              </span>
              <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 300 8" fill="none" preserveAspectRatio="none">
                <path d="M1 5 C 75 1, 150 8, 299 3" stroke="url(#g)" strokeWidth="2" strokeLinecap="round" />
                <defs><linearGradient id="g" x1="0" x2="1"><stop stopColor="#22d3ee" /><stop offset="1" stopColor="#4f46e5" /></linearGradient></defs>
              </svg>
            </span>{" "}
            is.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-slate-400 leading-relaxed">
            Beacon is a lightweight companion for your Android device. Live GPS, battery, storage, and RAM — plus remote ring, locate, and refresh from anywhere.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              to={user ? "/dashboard" : "/register"}
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-7 py-3.5 text-sm font-semibold text-slate-950 shadow-xl shadow-cyan-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-cyan-500/60"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              {user ? "Open Dashboard" : "Register This Device"}
              <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
            </Link>
            <a
              href="/beacon.apk"
              download
              className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/5 px-7 py-3.5 text-sm font-semibold text-cyan-300 backdrop-blur transition-all duration-300 hover:border-cyan-400/60 hover:bg-cyan-500/10 cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Download APK
            </a>
          </div>
        </div>

        {/* Radar visual */}
        <div className={`relative mx-auto mt-24 flex h-80 w-80 items-center justify-center sm:h-96 sm:w-96 pointer-events-none ${mounted ? "animate-beacon-fade-in" : "opacity-0"}`} style={{ animationDelay: "300ms" }}>
          {[0, 0.4, 0.8, 1.2].map((d) => (
            <span key={d} className="absolute h-full w-full animate-pulse-ring rounded-full border border-cyan-400/30" style={{ animationDelay: `${d}s` }} />
          ))}
          <div className="absolute h-72 w-72 rounded-full border border-white/10 sm:h-80 sm:w-80" />
          <div className="absolute h-48 w-48 rounded-full border border-white/10" />
          <div className="absolute h-24 w-24 rounded-full border border-white/10" />
          <div className="absolute h-full w-full animate-radar-sweep origin-center">
            <div className="absolute top-1/2 left-1/2 h-1/2 w-1/2 origin-top-left bg-gradient-to-br from-cyan-400/40 via-cyan-400/10 to-transparent" style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }} />
          </div>
          <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 shadow-2xl shadow-cyan-500/60">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
          </div>
          {/* Blips */}
          {[
            { top: "18%", left: "72%", delay: "0.2s", label: "Pixel 8" },
            { top: "60%", left: "20%", delay: "0.8s", label: "Galaxy S24" },
            { top: "78%", left: "68%", delay: "1.4s", label: "OnePlus 12" },
          ].map((b) => (
            <div key={b.label} className="absolute" style={{ top: b.top, left: b.left }}>
              <div className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-75" style={{ animationDelay: b.delay }} />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-300 shadow-lg shadow-cyan-400/50" />
              </div>
              <span className="mt-1.5 block whitespace-nowrap rounded-md border border-white/10 bg-slate-900/80 px-2 py-0.5 text-[10px] font-medium text-slate-200 backdrop-blur">
                {b.label}
              </span>
            </div>
          ))}
        </div>

        {/* Stat strip */}
        <div className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-6 border-t border-white/5 pt-8 text-center">
          {[
            { v: "120M+", l: "pings / day" },
            { v: "99.98%", l: "uptime" },
            { v: "<300ms", l: "location latency" },
          ].map((s) => (
            <div key={s.l} className="group cursor-default">
              <div className="bg-gradient-to-br from-white to-slate-400 bg-clip-text text-2xl font-bold text-transparent transition-transform duration-300 group-hover:scale-110 sm:text-3xl">
                {s.v}
              </div>
              <div className="mt-1 text-xs uppercase tracking-wider text-slate-500">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative mx-auto max-w-7xl px-6 py-24 border-t border-white/5">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Built like the dashboard{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-transparent">you'll live in.</span>
          </h2>
          <p className="mt-4 text-slate-400">Every surface — from the map to the battery meter — is engineered to be glanceable, responsive, and quietly beautiful.</p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-6 transition-all duration-500 hover:-translate-y-1 hover:border-cyan-400/30 hover:from-cyan-500/10"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-cyan-500/0 blur-2xl transition-all duration-500 group-hover:bg-cyan-500/30" />
              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-600/20 ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                <svg className="h-5 w-5 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>{f.icon}</svg>
              </div>
              <h3 className="relative mt-5 text-base font-semibold text-white">{f.title}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Dashboard preview mock */}
      <section id="how-it-works" className="relative mx-auto max-w-7xl px-6 py-24 border-t border-white/5">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">One tap to register. That's it.</h2>
          <p className="mt-4 text-slate-400">A fresh install shows just the Register button. Once registered, the home screen becomes your command center.</p>
        </div>

        <div className="mx-auto mt-14 flex flex-col items-center justify-center gap-10 lg:flex-row lg:items-start lg:gap-8">
          {/* Phone 1 — Empty state */}
          <div className="relative">
            <div className="mb-3 flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-xs font-bold text-slate-400 ring-1 ring-white/10">1</span>
              <span className="text-sm font-semibold text-slate-300">Fresh install</span>
            </div>
            <div className="relative w-[280px] rounded-[2.5rem] border border-white/10 bg-[#050912] p-2">
              <div className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-[#070c17] min-h-[560px]">
                {/* Status bar */}
                <div className="flex items-center justify-between px-5 pt-3 pb-2 text-[10px] font-medium text-slate-300">
                  <span>11:01</span>
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-4 rounded-sm bg-slate-400" />
                    <span className="text-slate-400">70</span>
                  </div>
                </div>
                <div className="flex items-center justify-between px-5 pb-3 pt-1">
                  <span className="text-lg font-extrabold tracking-[0.2em] text-cyan-400">BEACON</span>
                  <div className="flex items-center gap-3 text-cyan-400">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4 0-8 2-8 6v2h16v-2c0-4-4-6-8-6z"/></svg>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" /></svg>
                  </div>
                </div>
                <div className="px-5 pt-2">
                  <div className="text-lg font-bold text-white">Hello User</div>
                  <div className="mt-0.5 text-[11px] text-slate-500">Manage your connected devices</div>
                </div>
                {/* Register button */}
                <div className="px-5 pt-8">
                  <div className="rounded-full bg-cyan-400 py-3.5 text-center text-sm font-bold text-slate-950">
                    Register This Device
                  </div>
                </div>
                <div className="px-5 pt-8 text-sm font-bold text-white">My Devices</div>
                {/* Empty state */}
                <div className="mx-3 mt-2 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.015] py-10 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-500/5">
                    <svg className="h-5 w-5 text-cyan-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3" /></svg>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-400">No devices yet</div>
                  <div className="max-w-[180px] text-[10px] leading-relaxed text-slate-600">Tap Register to add this Android as your first beacon.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center lg:pt-32">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 text-xs font-semibold text-slate-400">
              <span className="hidden lg:inline">One tap</span>
              <svg className="h-4 w-4 rotate-90 lg:rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
            </div>
          </div>

          {/* Phone 2 — Registered */}
          <div className="relative">
            <div className="mb-3 flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/15 text-xs font-bold text-cyan-300 ring-1 ring-cyan-400/40">2</span>
              <span className="text-sm font-semibold text-white">Registered</span>
            </div>
            <div className="relative w-[280px] rounded-[2.5rem] border border-white/10 bg-[#050912] p-2">
              <div className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-[#070c17]">
                {/* Status bar */}
                <div className="flex items-center justify-between px-5 pt-3 pb-2 text-[10px] font-medium text-slate-300">
                  <span>11:01</span>
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-4 rounded-sm bg-slate-400" />
                    <span className="text-slate-400">70</span>
                  </div>
                </div>
                {/* Header */}
                <div className="flex items-center justify-between px-5 pb-3 pt-1">
                  <span className="text-lg font-extrabold tracking-[0.2em] text-cyan-400">BEACON</span>
                  <div className="flex items-center gap-3 text-cyan-400">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4 0-8 2-8 6v2h16v-2c0-4-4-6-8-6z"/></svg>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" /></svg>
                  </div>
                </div>
                {/* Greeting */}
                <div className="px-5 pt-2">
                  <div className="text-lg font-bold text-white">Hello User</div>
                  <div className="mt-0.5 text-[11px] text-slate-500">Manage your connected devices</div>
                </div>
                {/* My Devices */}
                <div className="px-5 pt-5 text-sm font-bold text-white">My Devices</div>
                <div className="mx-3 mt-2 mb-4 rounded-2xl border border-white/10 bg-white/[0.02] p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-400/40 bg-cyan-500/10">
                      <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /></svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-white">Xiaomi 21091…</div>
                      <div className="text-[9px] text-slate-500">Xiaomi 2109119DG</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Share */}
                      <svg className="h-3.5 w-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" /></svg>
                      {/* History / Timeline */}
                      <svg className="h-3.5 w-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                      {/* Refresh */}
                      <svg className="h-3.5 w-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
                    </div>
                  </div>
                  {/* Battery */}
                  <div className="mt-3 rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-white">
                        <svg className="h-3 w-3 text-emerald-400" fill="currentColor" viewBox="0 0 24 24"><path d="M17 4h-3V2h-4v2H7C5.9 4 5 4.9 5 6v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/></svg>
                        Battery
                      </div>
                      <span className="text-[11px] font-bold text-emerald-400">71%</span>
                    </div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/5">
                      <div className="h-full rounded-full bg-emerald-400" style={{ width: "71%" }} />
                    </div>
                  </div>
                  {/* Storage / RAM */}
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {[
                      { label: "Storage", val: "32.6 GB", of: "of 105.5 GB", pct: 31 },
                      { label: "RAM", val: "5.3 GB", of: "of 7.1 GB", pct: 75 },
                    ].map((s) => (
                      <div key={s.label} className="rounded-lg border border-white/5 bg-white/[0.02] p-2">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-400">{s.label}</span>
                          <span className="font-semibold text-white">{s.val}</span>
                        </div>
                        <div className="mt-1 h-0.5 overflow-hidden rounded-full bg-white/5">
                          <div className="h-full rounded-full bg-cyan-400" style={{ width: `${s.pct}%` }} />
                        </div>
                        <div className="mt-0.5 text-right text-[8px] text-slate-500">{s.of}</div>
                      </div>
                    ))}
                  </div>
                  {/* Radar tile */}
                  <div className="relative mt-2 h-24 overflow-hidden rounded-lg border border-white/5 bg-slate-950/60">
                    <div className="absolute top-1.5 left-1.5 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-1.5 py-0.5 text-[8px] font-medium text-cyan-400">
                      SYNCED: 52s AGO
                    </div>
                    <div className="absolute top-1.5 right-1.5 rounded border border-cyan-400/40 bg-cyan-500/5 px-1.5 py-0.5 text-[8px] font-bold text-cyan-400">
                      TIMELINE
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative flex h-14 w-14 items-center justify-center">
                        <span className="absolute h-full w-full rounded-full border border-cyan-400/20" />
                        <span className="absolute h-9 w-9 rounded-full border border-cyan-400/30" />
                        <div className="absolute h-full w-full animate-radar-sweep">
                          <div className="absolute top-1/2 left-1/2 h-1/2 w-1/2 origin-top-left bg-gradient-to-br from-cyan-400/50 via-cyan-400/10 to-transparent" style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }} />
                        </div>
                        <span className="relative h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-lg shadow-cyan-400/70" />
                      </div>
                    </div>
                    <div className="absolute bottom-1.5 left-1.5 text-[8px] font-semibold text-cyan-400">● GPS BEACON</div>
                    <div className="absolute bottom-1.5 right-1.5 text-[8px] text-slate-400">23.817°N, 90.390°E</div>
                  </div>
                  {/* View Location Timeline button */}
                  <button className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-cyan-400/40 bg-cyan-500/5 py-2 text-[10px] font-bold text-cyan-400">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" /></svg>
                    View Location Timeline
                  </button>
                  {/* System Parameters row */}
                  <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-2 px-1">
                    <span className="text-[10px] font-semibold text-slate-300">System Parameters</span>
                    <svg className="h-3 w-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                  </div>
                  <div className="mt-1 text-[8px] font-medium uppercase tracking-wider text-slate-500 px-1">Remote Commands</div>
                  {/* Remote commands */}
                  <div className="mt-2 grid grid-cols-3 gap-1.5">
                    {[
                      { l: "Ring", d: "M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9a6 6 0 0 0-12 0v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m3.714 0a24.255 24.255 0 0 1-3.714 0m3.714 0a3 3 0 1 1-3.714 0" },
                      { l: "Locate", d: "M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" },
                      { l: "Refresh", d: "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" },
                    ].map((c) => (
                      <div key={c.l} className="flex flex-col items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/[0.02] py-2">
                        <svg className="h-3.5 w-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={c.d} /></svg>
                        <span className="text-[9px] font-semibold text-cyan-400">{c.l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Setup Guide Section */}
      <section id="setup" className="py-24 border-t border-white/5 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight text-white mb-4">Quick Setup Guide</h2>
            <p className="text-slate-400">Get your devices connected and monitored in less than 5 minutes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
            {/* Timeline connector line for desktop */}
            <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-cyan-500/20 -translate-y-1/2 z-0" />

            {/* Step 1 */}
            <div className="relative z-10 md:col-span-1 group">
              <div className="h-full p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 hover:bg-white/[0.04] transition-all duration-300 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-extrabold text-lg mb-4 shadow-[0_0_15px_rgba(6,182,212,0.1)] group-hover:scale-110 transition-transform">
                  1
                </div>
                <h4 className="text-sm font-bold text-white mb-2">Create Account</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Sign up on the web dashboard using email or Google one-tap SSO.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 md:col-span-1 group">
              <div className="h-full p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 hover:bg-white/[0.04] transition-all duration-300 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-extrabold text-lg mb-4 shadow-[0_0_15px_rgba(6,182,212,0.1)] group-hover:scale-110 transition-transform">
                  2
                </div>
                <h4 className="text-sm font-bold text-white mb-2">Download APK</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Download the Android Companion App from the landing page.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 md:col-span-1 group">
              <div className="h-full p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 hover:bg-white/[0.04] transition-all duration-300 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-extrabold text-lg mb-4 shadow-[0_0_15px_rgba(6,182,212,0.1)] group-hover:scale-110 transition-transform">
                  3
                </div>
                <h4 className="text-sm font-bold text-white mb-2">Login on App</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Log in on the Android app to automatically register the device.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative z-10 md:col-span-1 group">
              <div className="h-full p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 hover:bg-white/[0.04] transition-all duration-300 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-extrabold text-lg mb-4 shadow-[0_0_15px_rgba(6,182,212,0.1)] group-hover:scale-110 transition-transform">
                  4
                </div>
                <h4 className="text-sm font-bold text-white mb-2">Grant Access</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Enable location, background service, & notification permissions.
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="relative z-10 md:col-span-1 group">
              <div className="h-full p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 hover:bg-white/[0.04] transition-all duration-300 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-extrabold text-lg mb-4 shadow-[0_0_15px_rgba(6,182,212,0.1)] group-hover:scale-110 transition-transform">
                  5
                </div>
                <h4 className="text-sm font-bold text-white mb-2">Remote Sync</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Control settings & vitals on the Web Dashboard instantly!
                </p>
              </div>
            </div>
          </div>

          {/* VPN & Ad-blocker Advisory */}
          <div className="mt-12 max-w-3xl mx-auto">
            <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 hover:border-amber-500/30 transition-all duration-300 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-amber-400 mb-1">Important: Disable VPNs & DNS Ad-Blockers</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Active VPNs, DNS-level ad-blockers (like Pi-hole or AdGuard), and device firewalls often block Firebase Installation calls, which will prevent the companion app from registering or receiving remote commands. 
                  Please temporarily disable them during setup, or whitelist <strong><code>firebaseinstallations.googleapis.com</code></strong> and <strong><code>fcmregistrations.googleapis.com</code></strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section id="compare" className="relative mx-auto max-w-6xl px-6 py-24 border-t border-white/5">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
            Not a competitor. A companion.
          </div>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            The small details other apps{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-transparent">forget.</span>
          </h2>
          <p className="mt-4 text-slate-400">
            Most apps only tell you <em className="not-italic text-slate-200">where</em> your device is. Beacon is one of the few that lets you <em className="not-italic text-cyan-300">act on it</em> too — ring, locate, and refresh from anywhere, in the same place you see the map.
          </p>
        </div>

        {/* Tracking + Commands highlight */}
        <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-all hover:border-cyan-400/30 hover:bg-cyan-500/5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 ring-1 ring-cyan-400/30">
                <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
              </div>
              <div className="text-sm font-semibold text-white">Tracking</div>
              <span className="ml-auto text-[10px] uppercase tracking-wider text-slate-500 font-mono">most apps</span>
            </div>
            <p className="mt-3 text-sm text-slate-400">Live GPS, timeline scrubbing, and stay-point detection. The table stakes — done well.</p>
          </div>
          <div className="group relative overflow-hidden rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-500/10 to-blue-600/5 p-6 transition-all hover:border-cyan-400/60">
            <div className="absolute -right-8 -top-8 h-28 w-28 animate-float-slow rounded-full bg-cyan-500/20 blur-2xl" />
            <div className="relative flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/20 ring-1 ring-cyan-400/50">
                <svg className="h-5 w-5 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9a6 6 0 0 0-12 0v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m3.714 0a24.255 24.255 0 0 1-3.714 0m3.714 0a3 3 0 1 1-3.714 0" /></svg>
              </div>
              <div className="text-sm font-semibold text-white">+ Remote Commands</div>
              <span className="ml-auto rounded-full bg-cyan-400/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300 ring-1 ring-cyan-400/30">Beacon</span>
            </div>
            <p className="relative mt-3 text-sm text-slate-300">Ring, locate on demand, and force-refresh sync — right next to the map. No jumping between apps, no separate consoles.</p>
          </div>
        </div>

        {(() => {
          const rows = [
            { f: "Live device tracking", b: true, g: true, l: true, fm: true },
            { f: "Location history / timeline", b: true, g: true, l: true, fm: true },
            { f: "Live battery %", b: true, g: "partial", l: true, fm: "partial" },
            { f: "Live RAM & storage", b: true, g: false, l: false, fm: false },
            { f: "Timeline scrubber & replay", b: true, g: false, l: "partial", fm: false },
            { f: "Stay-point detection", b: true, g: false, l: true, fm: false },
            { f: "Granular data-scope sharing", b: true, g: false, l: false, fm: false },
            { f: "Roles (viewer / finder / manager)", b: true, g: false, l: "partial", fm: false },
            { f: "Device action history + attribution", b: true, g: false, l: false, fm: false },
            { f: "Remote ring", b: true, g: false, l: false, fm: true },
            { f: "Remote locate on demand", b: true, g: "partial", l: false, fm: "partial" },
            { f: "Force-refresh device sync", b: true, g: false, l: false, fm: false },
            { f: "Tracking + commands in one screen", b: true, g: false, l: false, fm: false },
            { f: "Sleek dark & light map modes", b: true, g: false, l: false, fm: false },
            { f: "No ads, no data resale", b: true, g: true, l: false, fm: true },
          ] as const;

          const Cell = ({ v }: { v: boolean | "partial" }) => {
            if (v === true) {
              return (
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400/15 ring-1 ring-cyan-400/40">
                  <svg className="h-3.5 w-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </span>
              );
            }
            if (v === "partial") {
              return (
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-400/10 ring-1 ring-amber-400/30">
                  <span className="h-1.5 w-3 rounded-full bg-amber-400/80" />
                </span>
              );
            }
            return (
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.03] ring-1 ring-white/10">
                <span className="h-1 w-2.5 rounded-full bg-slate-600" />
              </span>
            );
          };

          return (
            <div className="mt-14 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur">
              <div className="overflow-x-auto">
                <div className="min-w-[560px]">
                  {/* Header row */}
                  <div className="grid grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))] items-center gap-2 border-b border-white/10 bg-white/[0.02] px-4 py-4 text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:gap-4 sm:px-8 sm:text-xs">
                    <div>Feature</div>
                    <div className="text-center">
                      <span className="block text-cyan-400">Beacon</span>
                    </div>
                    <div className="text-center text-slate-400">Google Find Hub</div>
                    <div className="text-center text-slate-400">Life360</div>
                    <div className="text-center text-slate-400">Find My Device</div>
                  </div>
                  {rows.map((r, i) => (
                    <div
                      key={r.f}
                      className="group grid grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))] items-center gap-2 border-b border-white/5 px-4 py-4 text-xs transition-colors last:border-0 hover:bg-cyan-500/[0.03] sm:gap-4 sm:px-8 sm:text-sm"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <div className="min-w-0 pr-2 text-slate-200">{r.f}</div>
                      <div className="flex justify-center"><Cell v={r.b} /></div>
                      <div className="flex justify-center"><Cell v={r.g} /></div>
                      <div className="flex justify-center"><Cell v={r.l} /></div>
                      <div className="flex justify-center"><Cell v={r.fm} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full bg-cyan-400/60" /> Full support</span>
          <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400/60" /> Partial</span>
          <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-600" /> Not available</span>
        </div>

        <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-slate-500">
          Feature comparisons based on publicly available product documentation as of 2026. Beacon is designed to run alongside the tracking tools you already trust.
        </p>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-5xl px-6 py-24">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/10 via-slate-900 to-blue-600/10 p-12 text-center">
          <div className="absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 animate-float-slow rounded-full bg-cyan-500/30 blur-3xl" />
          <h2 className="relative text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Bring in a trusted companion.
          </h2>
          <p className="relative mx-auto mt-4 max-w-md text-slate-400 leading-relaxed">
            Invite family with viewer, finder, or manager roles. Choose exactly which data each companion can see — revoke anytime.
          </p>
          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/register" className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-7 py-3.5 text-sm font-semibold text-slate-950 shadow-xl shadow-cyan-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-cyan-500/60">
              Get Beacon for Android
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section id="requirements" className="py-24 border-t border-white/5 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Device Requirements</h2>
            <p className="text-slate-400 max-w-lg mx-auto">Make sure your hardware supports the background syncing mechanics.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section id="about" className="py-24 border-t border-white/5 relative z-10 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <div className="relative w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            {/* Pulsing backing glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-500 blur-lg opacity-30 animate-pulse" />
            <div className="relative w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center hover:border-cyan-400/30 transition-all duration-300">
              <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">About the Developer</h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-8">
            Project Beacon is designed and built by Shoaib Taimur, an Aspiring Data Scientist and MERN Stack Developer. He specializes in engineering secure, real-time full-stack web applications and leveraging data-driven solutions for connected ecosystems.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://taimur.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-8 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold transition-all hover:scale-[1.05] active:scale-[0.98] hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] cursor-pointer"
            >
              Visit Portfolio: taimur.dev ↗
            </a>
            <a
              href="https://github.com/ShoaibTaimur/beacon-frontend"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-8 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold transition-all hover:scale-[1.05] active:scale-[0.98] hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] cursor-pointer"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
              </svg>
              GitHub: beacon-frontend ↗
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 relative z-10 bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Beacon. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="https://github.com/ShoaibTaimur/beacon-frontend" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors font-semibold flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
              </svg>
              GitHub
            </a>
            <span className="text-neutral-800">|</span>
            <p>
              Designed with premium aesthetics by{' '}
              <a href="https://taimur.dev" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors font-semibold">
                Shoaib Taimur
              </a>
            </p>
          </div>
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
            {[
              { l: "Features", id: "features" },
              { l: "How it works", id: "how-it-works" },
              { l: "Setup Guide", id: "setup" },
              { l: "Compare", id: "compare" },
              { l: "Requirements", id: "requirements" },
              { l: "Developer", id: "about" }
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => { handleTabClick(e, item.id); setIsMenuOpen(false); }}
                className={`hover:text-cyan-400 transition-colors duration-300 ${activeTab === item.id ? 'text-cyan-400' : 'text-slate-400'}`}
              >
                {item.l}
              </a>
            ))}
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
