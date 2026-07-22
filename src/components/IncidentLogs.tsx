import React, { useState } from 'react';
import { AlertOctagon, CheckCircle2, AlertTriangle, MessageSquare, Trash2, Shield, Filter, Search } from 'lucide-react';
import { IncidentLog } from '../types';

interface IncidentLogsProps {
  incidents: IncidentLog[];
  onClearLogs: () => void;
}

export const IncidentLogs: React.FC<IncidentLogsProps> = ({
  incidents,
  onClearLogs
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  const filtered = incidents.filter(inc => {
    if (filterType === 'all') return true;
    if (filterType === 'outage') return inc.type === 'outage';
    if (filterType === 'recovered') return inc.type === 'recovered';
    if (filterType === 'degraded') return inc.type === 'degraded';
    if (filterType === 'discord') return inc.discordSent;
    return true;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Logi Incydentów i Powiadomienia
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {incidents.length} zdarzeń
            </span>
          </h2>
          <p className="text-xs text-slate-400">Historia awarii, odzyskanych połączeń i raportów z monitoringu</p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filterType === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Wszystkie
            </button>
            <button
              onClick={() => setFilterType('outage')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filterType === 'outage' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-rose-400'
              }`}
            >
              Awarie
            </button>
            <button
              onClick={() => setFilterType('recovered')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filterType === 'recovered' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              Przywrócone
            </button>
            <button
              onClick={() => setFilterType('discord')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filterType === 'discord' ? 'bg-indigo-600/30 text-indigo-300' : 'text-slate-400 hover:text-indigo-300'
              }`}
            >
              Discord
            </button>
          </div>

          <button
            onClick={onClearLogs}
            disabled={incidents.length === 0}
            className="p-2 bg-slate-800 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 rounded-xl border border-slate-700 disabled:opacity-40 transition-all"
            title="Wyczyść historię zdarzeń"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Timeline List */}
      <div className="mt-4 space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
        {filtered.length > 0 ? (
          filtered.map((inc) => {
            const isOutage = inc.type === 'outage';
            const isRecovered = inc.type === 'recovered';
            const isDegraded = inc.type === 'degraded';

            return (
              <div
                key={inc.id}
                className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 text-xs transition-all ${
                  isOutage
                    ? 'bg-rose-950/20 border-rose-800/40 text-rose-200'
                    : isRecovered
                    ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                    : isDegraded
                    ? 'bg-amber-950/20 border-amber-800/40 text-amber-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {isOutage ? (
                      <AlertOctagon className="w-4 h-4 text-rose-400" />
                    ) : isRecovered ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isDegraded ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    ) : (
                      <MessageSquare className="w-4 h-4 text-indigo-400" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold flex items-center gap-2">
                      <span>{inc.serviceName}</span>
                      <span className="text-[10px] opacity-70 font-mono">
                        ({new Date(inc.timestamp).toLocaleString('pl-PL')})
                      </span>
                    </div>
                    <p className="mt-0.5 text-slate-300">{inc.message}</p>
                  </div>
                </div>

                {/* Right side tags */}
                <div className="flex items-center gap-2 shrink-0">
                  {inc.latencyMs !== undefined && (
                    <span className="font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-400 text-[11px]">
                      {inc.latencyMs} ms
                    </span>
                  )}

                  {inc.discordSent && (
                    <span className="flex items-center gap-1 bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20 text-[10px] font-semibold">
                      <MessageSquare className="w-3 h-3 text-indigo-400" />
                      Discord
                    </span>
                  )}
                </div>

              </div>
            );
          })
        ) : (
          <div className="py-8 text-center text-slate-500 text-xs italic">
            Brak zarejestrowanych incydentów w historii.
          </div>
        )}
      </div>

    </div>
  );
};
