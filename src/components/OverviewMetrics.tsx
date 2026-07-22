import React from 'react';
import { Server, CheckCircle2, AlertOctagon, Activity, Clock, MessageSquare } from 'lucide-react';
import { SystemOverview, AppSettings } from '../types';

interface OverviewMetricsProps {
  overview: SystemOverview;
  settings: AppSettings;
  onOpenDiscord: () => void;
}

export const OverviewMetrics: React.FC<OverviewMetricsProps> = ({
  overview,
  settings,
  onOpenDiscord
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      
      {/* Total Services */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium">Usługi Wszystkie</span>
          <Server className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-extrabold text-white">{overview.totalServices}</span>
          <span className="text-[11px] text-slate-500">Monitorowane</span>
        </div>
      </div>

      {/* Online Services */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium">Stan Online</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-extrabold text-emerald-400">{overview.onlineCount}</span>
          <span className="text-[11px] text-emerald-500/80 font-medium">
            {overview.totalServices > 0 ? `${Math.round((overview.onlineCount / overview.totalServices) * 100)}%` : '0%'}
          </span>
        </div>
      </div>

      {/* Offline / Degraded */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium">Problemy / Offline</span>
          <AlertOctagon className="w-4 h-4 text-rose-400" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className={`text-2xl font-extrabold ${overview.offlineCount > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-300'}`}>
            {overview.offlineCount + overview.degradedCount}
          </span>
          <span className="text-[11px] text-slate-500">
            {overview.degradedCount > 0 ? `${overview.degradedCount} z opóźnieniem` : 'Brak barier'}
          </span>
        </div>
      </div>

      {/* Average Latency */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium">Średnie Opóźnienie</span>
          <Activity className="w-4 h-4 text-sky-400" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-extrabold text-sky-400">{overview.avgLatencyMs} <span className="text-xs font-normal">ms</span></span>
          <span className="text-[11px] text-slate-500">Ping HTTP</span>
        </div>
      </div>

      {/* 24h Overall Uptime */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium">Średni Uptime (24h)</span>
          <Clock className="w-4 h-4 text-purple-400" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-extrabold text-purple-300">{overview.overallUptime}%</span>
          <span className="text-[11px] text-emerald-400 font-medium">SLA</span>
        </div>
      </div>

      {/* Discord Integration Status */}
      <div 
        onClick={onOpenDiscord}
        className="bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-3.5 flex flex-col justify-between cursor-pointer group transition-all"
      >
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium group-hover:text-indigo-300 transition-colors">Integracja Discord</span>
          <MessageSquare className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className={`text-xs font-bold px-2 py-1 rounded-md ${
            settings.discord.enabled && settings.discord.webhookUrl 
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
              : 'bg-slate-800 text-slate-400'
          }`}>
            {settings.discord.enabled && settings.discord.webhookUrl ? 'AKTYWNY' : 'SKONFIGURUJ'}
          </span>
          <span className="text-[11px] text-indigo-400 font-medium underline opacity-80 group-hover:opacity-100">
            Powiadomienia
          </span>
        </div>
      </div>

    </div>
  );
};
