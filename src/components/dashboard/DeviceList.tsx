import { useState, useEffect } from 'react';
import { getDevices } from '../../services/api';
import DeviceCard from './DeviceCard';
import Loader from '../ui/Loader';
import { Device } from '../../types';

export default function DeviceList() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDevices = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const response = await getDevices();
      const mappedDevices = (response.data.devices || []).map((d: any) => ({
        ...d,
        id: d.id || d._id,
      }));
      setDevices(mappedDevices);
    } catch (err: any) {
      setError('Failed to load devices');
      console.error('[DeviceList]', err.message);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices(true);

    let interval: NodeJS.Timeout;

    const startPolling = () => {
      clearInterval(interval);
      interval = setInterval(() => {
        if (!document.hidden) {
          fetchDevices(false);
        }
      }, 15000);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchDevices(false);
        startPolling();
      } else {
        clearInterval(interval);
      }
    };

    startPolling();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handleDeviceRemoved = (removedId: string) => {
    setDevices((prev) => prev.filter((d) => d.id !== removedId && d._id !== removedId));
  };

  if (loading) {
    return <Loader size="lg" className="py-20" />;
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={() => {
            setLoading(true);
            setError('');
            fetchDevices(true);
          }}
          className="text-cyan-400 hover:text-cyan-300 underline text-sm cursor-pointer"
        >
          Try again
        </button>
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-slate-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-400 mb-2">
          No devices yet
        </h3>
        <p className="text-sm text-slate-600 max-w-sm mx-auto">
          Install Beacon on your Android device to register it here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {devices.map((device) => (
        <DeviceCard
          key={device.id || device._id}
          device={device}
          onRemoved={handleDeviceRemoved}
          onRefreshed={() => fetchDevices(false)}
        />
      ))}
    </div>
  );
}
