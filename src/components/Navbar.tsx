import React from 'react';
import { Server, Activity, Bell, BellOff, Volume2, VolumeX, Plus, MessageSquare, RefreshCw, Settings, ShieldCheck, AlertTriangle } from 'lucide-react';
import { AppSettings, SystemOverview } from '../types';

interface NavbarProps {
  overview: SystemOverview;
  settings: AppSettings;
  isRefreshing: boolean;
  onRefreshAll: () => void;
  onOpenAddModal: () => void;
  onOpenDiscordModal: () => void;
  onOpenSettingsModal: () => void;
  onToggleSound: () => void;
  onToggleNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  overview,
  settings,
  isRefreshing,
  onRefreshAll,
  onOpenAddModal,
  onOpenDiscordModal,
  onOpenSettingsModal,
  onToggleSound,
  onToggleNotifications
}) => {
  const isHealthy = overview.offlineCount === 0;

  return (
    <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 py-3.5 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Overall System Badge */}
        <div className="flex items-center gap-3.5 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Server className="h-5.5 w-5.5 text-indigo-400" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Arrr-Dash
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Arr & Jellyfin
                </span>
              </h1>
              <p className="text-xs text-slate-400">Monitorowanie serwerów IP w czasie rzeczywistym</p>
            </div>
          </div>

          {/* Overall System Health Pill */}
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${
              isHealthy
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
            }`}>
              {isHealthy ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>System Sprawny</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Awarie ({overview.offlineCount})</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Center/Right Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          
          {/* Demo / Live Indicator */}
          <button
            onClick={onOpenSettingsModal}
            className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all ${
              settings.demoMode 
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20' 
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
            }`}
            title="Kliknij, aby zmienić tryb sprawdzania (Demo vs HTTP Live)"
          >
            <span className={`w-2 h-2 rounded-full ${settings.demoMode ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`}></span>
            {settings.demoMode ? 'Tryb Demo (LAN)' : 'Live HTTP Checks'}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-lg border transition-all ${
              settings.soundAlerts
                ? 'bg-slate-800 text-indigo-400 border-indigo-500/30 hover:bg-slate-700'
                : 'bg-slate-800/50 text-slate-500 border-slate-800 hover:bg-slate-800'
            }`}
            title={settings.soundAlerts ? 'Dźwięki powiadomień włączone' : 'Dźwięki wyłączone'}
          >
            {settings.soundAlerts ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Browser Notifications Toggle */}
          <button
            onClick={onToggleNotifications}
            className={`p-2 rounded-lg border transition-all ${
              settings.browserNotifications
                ? 'bg-slate-800 text-sky-400 border-sky-500/30 hover:bg-slate-700'
                : 'bg-slate-800/50 text-slate-500 border-slate-800 hover:bg-slate-800'
            }`}
            title={settings.browserNotifications ? 'Powiadomienia przeglądarki włączone' : 'Powiadomienia przeglądarki wyłączone'}
          >
            {settings.browserNotifications ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </button>

          {/* Manual Refresh All */}
          <button
            onClick={onRefreshAll}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 disabled:opacity-50 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-sm"
            title="Odśwież stan wszystkich serwerów (pobierz najnowsze opóźnienia i statystyki)"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
            <span className="hidden sm:inline">Odśwież wszystko</span>
          </button>

          {/* Discord Modal Button */}
          <button
            onClick={onOpenDiscordModal}
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 text-xs font-semibold transition-all ${
              settings.discord.enabled && settings.discord.webhookUrl
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-600/30'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <span>Discord</span>
            {settings.discord.enabled && settings.discord.webhookUrl && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
            )}
          </button>

          {/* Global Settings Modal Button */}
          <button
            onClick={onOpenSettingsModal}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all"
            title="Ustawienia"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Add Service Button */}
          <button
            onClick={onOpenAddModal}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Dodaj Adres IP / Usługę</span>
          </button>

        </div>

      </div>
    </header>
  );
};
