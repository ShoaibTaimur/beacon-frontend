import Navbar from '../components/layout/Navbar';
import DeviceList from '../components/dashboard/DeviceList';
import IncomingInvites from '../components/dashboard/IncomingInvites';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#050912] text-white antialiased">
      <Navbar />

      {/* Main content */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-beacon-slide-up">
        {/* Pending Invites Alert Area */}
        <IncomingInvites />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            My Devices
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage and monitor your registered devices
          </p>
        </div>

        {/* Device grid */}
        <DeviceList />
      </main>

      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 h-[500px] w-[500px] animate-float-slow rounded-full bg-blue-600/[0.04] blur-3xl" />
        <div className="absolute top-1/3 left-0 h-[400px] w-[400px] animate-float-slow rounded-full bg-cyan-500/[0.04] blur-3xl" style={{ animationDelay: "-3s" }} />
      </div>
    </div>
  );
}
