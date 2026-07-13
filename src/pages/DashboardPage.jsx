import Navbar from '../components/layout/Navbar';
import DeviceList from '../components/dashboard/DeviceList';
import IncomingInvites from '../components/dashboard/IncomingInvites';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      {/* Main content */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-slide-up">
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

      {/* Subtle background gradient */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/3 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/3 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
