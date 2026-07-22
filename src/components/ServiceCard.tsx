import React from 'react';
import { 
  Tv, Tv2, Film, Search, Subtitles, Music, BookOpen, DownloadCloud, HardDrive, Server,
  ExternalLink, RefreshCw, Edit3, Trash2, ShieldCheck, AlertTriangle, AlertOctagon,
  Users, PlayCircle, Film as FilmIcon, ListOrdered, CheckCircle
} from 'lucide-react';
import { ServiceItem, ServiceType } from '../types';
import { SERVICE_PRESETS } from '../data/presetServices';

interface ServiceCardProps {
  service: ServiceItem;
  onCheckSingle: (id: string) => void;
  onEdit: (service: ServiceItem) => void;
  onDelete: (service: ServiceItem) => void;
  isChecking: boolean;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onCheckSingle,
  onEdit,
  onDelete,
  isChecking
}) => {
  const preset = SERVICE_PRESETS.find(p => p.type === service.type) || SERVICE_PRESETS[SERVICE_PRESETS.length - 1];

  // Pick matching Lucide Icon dynamically
  const renderIcon = (type: ServiceType) => {
    switch (type) {
      case 'jellyfin': return <Tv className="w-5 h-5 text-sky-400" />;
      case 'sonarr': return <Tv2 className="w-5 h-5 text-cyan-400" />;
      case 'radarr': return <Film className="w-5 h-5 text-amber-400" />;
      case 'prowlarr': return <Search className="w-5 h-5 text-rose-400" />;
      case 'bazarr': return <Subtitles className="w-5 h-5 text-purple-400" />;
      case 'lidarr': return <Music className="w-5 h-5 text-emerald-400" />;
      case 'readarr': return <BookOpen className="w-5 h-5 text-orange-400" />;
      case 'qbittorrent': return <DownloadCloud className="w-5 h-5 text-blue-400" />;
      case 'sabnzbd': return <HardDrive className="w-5 h-5 text-yellow-400" />;
      default: return <Server className="w-5 h-5 text-slate-400" />;
    }
  };

  const protocol = service.useSsl ? 'https' : 'http';
  const directUrl = `${protocol}://${service.ip}:${service.port}${service.pathPrefix || ''}`;

  // Status Styling
  const getStatusBadge = () => {
    switch (service.status) {
      case 'online':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>ONLINE</span>
          </span>
        );
      case 'degraded':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>DEGRADED</span>
          </span>
        );
      case 'offline':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-semibold animate-pulse">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
            <span>OFFLINE</span>
          </span>
        );
      case 'checking':
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs font-semibold">
            <RefreshCw className="w-3.5 h-3.5 text-sky-400 animate-spin" />
            <span>PUNKTOWANIE...</span>
          </span>
        );
    }
  };

  return (
    <div className={`bg-slate-900/90 border rounded-2xl p-5 shadow-lg transition-all duration-200 hover:shadow-xl flex flex-col justify-between relative group ${
      service.status === 'offline' 
        ? 'border-rose-500/40 shadow-rose-950/20' 
        : service.status === 'degraded'
        ? 'border-amber-500/30'
        : 'border-slate-800 hover:border-slate-700'
    }`}>
      
      {/* Top Header Row */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div 
              className="p-2.5 rounded-xl border border-slate-700/60 bg-slate-800/80 shadow-inner flex items-center justify-center"
              style={{ borderColor: (preset.accentColor || '#6366f1') + '40' }}
            >
              {renderIcon(service.type)}
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {service.name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                <span className="font-mono bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 text-indigo-300">
                  {service.ip}:{service.port}
                </span>
                {service.useSsl && (
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                    HTTPS
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {getStatusBadge()}
          </div>
        </div>

        {/* Error message if present */}
        {service.errorMessage && service.status !== 'online' && (
          <div className="mb-3 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="truncate">{service.errorMessage}</span>
          </div>
        )}

        {/* Metrics Bar */}
        <div className="grid grid-cols-3 gap-2 bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 my-3 text-center">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">Opóźnienie</div>
            <div className={`text-sm font-bold ${service.status === 'offline' ? 'text-slate-500' : 'text-sky-300'}`}>
              {service.status === 'offline' ? '—' : `${service.latencyMs} ms`}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">Uptime (24h)</div>
            <div className="text-sm font-bold text-emerald-400">{service.uptime24h}%</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">Status HTTP</div>
            <div className="text-sm font-bold text-slate-300 font-mono">
              {service.httpStatusCode && service.httpStatusCode > 0 ? service.httpStatusCode : 'N/A'}
            </div>
          </div>
        </div>

        {/* Mini History Latency Bar Graph */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
            <span>Ostatnie opóźnienia ping (ms)</span>
            <span className="text-slate-500 font-mono">
              {service.lastChecked ? new Date(service.lastChecked).toLocaleTimeString('pl-PL') : 'Brak danych'}
            </span>
          </div>
          <div className="h-7 w-full flex items-end gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800/60">
            {service.history && service.history.length > 0 ? (
              service.history.map((pt, i) => {
                const maxVal = 200;
                const barHeightPct = Math.min(100, Math.max(15, (pt.latencyMs / maxVal) * 100));
                const barColor = 
                  pt.status === 'offline' ? 'bg-rose-500' :
                  pt.status === 'degraded' ? 'bg-amber-400' : 'bg-emerald-500';

                return (
                  <div
                    key={i}
                    className="flex-1 rounded-xs transition-all hover:opacity-100 group/bar relative"
                    style={{ height: `${barHeightPct}%` }}
                  >
                    <div className={`w-full h-full rounded-xs ${barColor}`}></div>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover/bar:block bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded border border-slate-700 whitespace-nowrap z-20 shadow-lg">
                      {pt.timestamp}: {pt.latencyMs}ms ({pt.status})
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-[10px] text-slate-600 text-center w-full my-auto">Pobieranie historii...</div>
            )}
          </div>
        </div>

        {/* Specific App Stats (Jellyfin / Arr) */}
        {(service.type === 'sonarr' || service.type === 'radarr' || service.type === 'prowlarr' || service.type === 'jellyfin') && (
          <div className="mb-3">
            {service.apiKey ? (
              <div className="text-[10px] text-emerald-400 font-mono mb-1.5 flex items-center justify-between px-1">
                <span className="flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>LIVE API POŁĄCZONE</span>
                </span>
                <span className="text-slate-500">API Key OK</span>
              </div>
            ) : (
              <div className="text-[10px] text-slate-500 font-mono mb-1.5 flex items-center justify-between px-1 bg-slate-950/40 p-1 rounded border border-slate-800/50">
                <span>Tryb Ping HTTP</span>
                <span className="text-amber-400/90 font-sans">Dodaj Klucz API w edycji dla danych Live</span>
              </div>
            )}

            {service.type === 'jellyfin' && service.jellyfinStats && (
              <div className="bg-sky-950/20 border border-sky-800/40 rounded-xl p-3 text-xs">
                <div className="flex items-center justify-between text-sky-300 font-semibold mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <PlayCircle className="w-4 h-4 text-sky-400" />
                    <span>Aktywne Strumienie ({service.jellyfinStats.activeStreams})</span>
                  </span>
                  <span className="text-[10px] text-sky-400/80">v{service.jellyfinStats.serverVersion}</span>
                </div>
                {service.jellyfinStats.activeUsers && service.jellyfinStats.activeUsers.length > 0 ? (
                  <div className="space-y-1">
                    {service.jellyfinStats.activeUsers.map((usr, uIdx) => (
                      <div key={uIdx} className="flex items-center gap-1.5 text-slate-300 text-[11px] bg-slate-900/60 px-2 py-0.5 rounded">
                        <Users className="w-3 h-3 text-sky-400 shrink-0" />
                        <span className="truncate">{usr}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-400 text-[11px] italic">Brak aktywnych odtwarzaczy</div>
                )}
              </div>
            )}

            {(service.type === 'sonarr' || service.type === 'radarr' || service.type === 'prowlarr') && service.arrStats && (
              <div className="bg-indigo-950/20 border border-indigo-800/40 rounded-xl p-3 text-xs">
                <div className="flex items-center justify-between text-indigo-300 font-semibold mb-1">
                  <span className="flex items-center gap-1.5">
                    <ListOrdered className="w-4 h-4 text-indigo-400" />
                    <span>Kolejka / Pobieranie ({service.arrStats.queuedDownloads ?? 0})</span>
                  </span>
                  {service.arrStats.totalItems !== undefined && (
                    <span className="text-[10px] text-indigo-400">
                      Łącznie w bazie: {service.arrStats.totalItems}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400">
                  Wersja API: <span className="text-slate-200 font-mono">{service.arrStats.version || 'v4'}</span>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Bottom Action Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 mt-1">
        
        {/* Direct Link to Web GUI */}
        <a
          href={directUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
          <span>Otwórz Panel</span>
        </a>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onCheckSingle(service.id)}
            disabled={isChecking}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-indigo-300 border border-slate-700/60 transition-all"
            title="Sprawdź stan ten usługi"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-indigo-400' : ''}`} />
          </button>

          <button
            onClick={() => onEdit(service)}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-sky-300 border border-slate-700/60 transition-all"
            title="Edytuj parametry / IP"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onDelete(service)}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700/60 hover:border-rose-800/50 transition-all cursor-pointer"
            title="Usuń uslugę"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
};
