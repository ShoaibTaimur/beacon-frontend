import { useState, useEffect } from 'react';
import { getMySupportMessages, sendSupportMessage } from '../../services/api';
import Button from '../ui/Button';

interface SupportMessage {
  _id: string;
  message: string;
  adminReply: string | null;
  repliedAt: string | null;
  createdAt: string;
}

interface SupportPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupportPanel({ isOpen, onClose }: SupportPanelProps) {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchMessages = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getMySupportMessages();
      if (res.data?.success) {
        setMessages(res.data.messages);
      }
    } catch (err: any) {
      console.error('[Support] Fetch error:', err.message);
      setError(err.response?.data?.error || 'Failed to load message history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setError('');
    setSuccess('');
    setSubmitLoading(true);
    try {
      const res = await sendSupportMessage(messageText);
      if (res.data?.success) {
        setMessageText('');
        setSuccess('Your support ticket was submitted successfully.');
        await fetchMessages();
        // Clear success message after 4s
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit support request.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className={`relative w-full max-w-md bg-[#080d1a] border-l border-white/10 h-full flex flex-col shadow-2xl transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Support & Bug Reports
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Submit bug reports or ask questions directly to admins</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-white/5 bg-white/[0.02] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l18 18" />
            </svg>
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs animate-fade-in">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs animate-fade-in">
              {success}
            </div>
          )}

          {/* New Message Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Submit Bug Report or Message
            </label>
            <textarea
              placeholder="Describe your bug or query here... Be as specific as possible."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full h-28 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 text-sm resize-none focus:ring-1 focus:ring-cyan-500/20"
              maxLength={1000}
              required
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                loading={submitLoading}
                disabled={!messageText.trim()}
                size="sm"
                className="cursor-pointer"
              >
                Send Message
              </Button>
            </div>
          </form>

          <hr className="border-white/5" />

          {/* History */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Support History
            </h3>

            {loading && messages.length === 0 ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-white/5 rounded-xl bg-white/[0.005]">
                <svg className="w-8 h-8 text-slate-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742l4.735-4.735a1.125 1.125 0 111.591 1.591l-4.735 4.735a1.125 1.125 0 01-1.591 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742l4.735 4.735a1.125 1.125 0 111.591 1.591l-4.735 4.735a1.125 1.125 0 01-1.591 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707" />
                </svg>
                <p className="text-xs text-slate-500">No support tickets found.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-1">
                {messages.map((msg) => (
                  <div key={msg._id} className="p-3.5 rounded-xl border border-white/5 bg-white/[0.01] space-y-3 animate-fade-in hover:border-white/10 transition-colors">
                    {/* User message */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatDate(msg.createdAt)}
                        </span>
                        {msg.adminReply ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Answered
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Pending
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-200 break-words whitespace-pre-line leading-relaxed">
                        {msg.message}
                      </p>
                    </div>

                    {/* Admin Reply */}
                    {msg.adminReply && (
                      <div className="p-2.5 rounded-lg bg-red-500/[0.03] border border-red-500/10 space-y-1">
                        <div className="flex items-center gap-1.5 text-red-400">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622" />
                          </svg>
                          <span className="text-[10px] font-bold uppercase tracking-wider">
                            Administrator Reply
                          </span>
                          {msg.repliedAt && (
                            <span className="text-[9px] text-slate-500 font-mono ml-auto">
                              {formatDate(msg.repliedAt)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 break-words whitespace-pre-line leading-relaxed">
                          {msg.adminReply}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
