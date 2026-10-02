import React, { useState } from 'react';
import { History, X, Search, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AuditTrailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditTrailModal: React.FC<AuditTrailModalProps> = ({ isOpen, onClose }) => {
  const { auditLogs } = useApp();
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredLogs = auditLogs.filter(
    (log) =>
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.userName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
              <History className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Log Jejak Audit ADC (Audit Trail Log)
              </h3>
              <p className="text-xs text-slate-400">
                Rekod integriti setiap transaksi, kemaskini yuran dan perubahan data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/40">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari dalam log audit (pengguna, tindakan, butiran)..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Logs List */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2.5">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              Tiada log audit yang sepadan.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const d = new Date(log.timestamp);
              const formattedTime = !isNaN(d.getTime())
                ? `${d.toLocaleDateString('ms-MY')} ${d.toLocaleTimeString('ms-MY', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`
                : log.timestamp;

              return (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-800 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800 text-purple-300">
                        {log.action}
                      </span>
                      <span className="font-semibold text-slate-300">
                        Oleh: {log.userName} ({log.userRole})
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs">{log.details}</p>
                    {(log.previousData || log.newData) && (
                      <div className="text-[11px] font-mono text-slate-400 mt-1 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                        {log.previousData && (
                          <div className="text-rose-400">
                            Sebelum: <span className="text-slate-300">{log.previousData}</span>
                          </div>
                        )}
                        {log.newData && (
                          <div className="text-emerald-400">
                            Selepas: <span className="text-slate-300">{log.newData}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono shrink-0 whitespace-nowrap">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formattedTime}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
