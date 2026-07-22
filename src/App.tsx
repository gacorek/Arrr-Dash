import React, { useState, useEffect, useMemo } from 'react';
import { 
  Server, Search, Filter, Plus, RefreshCw, MessageSquare, ShieldCheck, 
  AlertOctagon, CheckCircle2, SlidersHorizontal, Activity, Zap, Play, Terminal, HelpCircle
} from 'lucide-react';
import { AppSettings, DiscordConfig, IncidentLog, ServiceItem, ServiceType, SystemOverview } from './types';
import { Navbar } from './components/Navbar';
import { OverviewMetrics } from './components/OverviewMetrics';
import { ServiceCard } from './components/ServiceCard';
import { ServiceModal } from './components/ServiceModal';
import { DiscordIntegration } from './components/DiscordIntegration';
import { IncidentLogs } from './components/IncidentLogs';
import { SystemSettingsModal } from './components/SystemSettingsModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { playAlertSound } from './utils/sound';

export default function App() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    checkIntervalSeconds: 30,
    demoMode: false,
    soundAlerts: true,
    browserNotifications: true,
    discord: {
      webhookUrl: '',
      enabled: false,
      notifyOnOutage: true,
      notifyOnRecovery: true,
      autoReportEnabled: false,
      autoReportIntervalHours: 24,
      botName: 'Arrr-Dash Sentinel'
    }
  });
  const [incidents, setIncidents] = useState<IncidentLog[]>([]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [checkingIds, setCheckingIds] = useState<string[]>([]);
  const [serviceToDelete, setServiceToDelete] = useState<ServiceItem | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'discord' | 'incidents'>('dashboard');

  // Search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Modals state
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isDiscordModalOpen, setIsDiscordModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Initial Data Load
  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [resSrv, resSet, resInc] = await Promise.all([
        fetch('/api/services').then(r => r.json()),
        fetch('/api/settings').then(r => r.json()),
        fetch('/api/incidents').then(r => r.json())
      ]);

      if (resSrv.services) setServices(resSrv.services);
      if (resSet.settings) setSettings(resSet.settings);
      if (resInc.incidents) setIncidents(resInc.incidents);
    } catch (err) {
      console.error('Error fetching backend status:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Background polling timer
  useEffect(() => {
    const intervalMs = (settings.checkIntervalSeconds || 30) * 1000;
    const timer = setInterval(() => {
      fetch('/api/services')
        .then(r => r.json())
        .then(data => {
          if (data.services) {
            // Check if outage occurred for sound alert
            const prevOffline = services.filter(s => s.status === 'offline').length;
            const newOffline = data.services.filter((s: ServiceItem) => s.status === 'offline').length;

            if (newOffline > prevOffline && settings.soundAlerts) {
              playAlertSound('outage');
            }

            setServices(data.services);
          }
        });

      fetch('/api/incidents')
        .then(r => r.json())
        .then(data => {
          if (data.incidents) setIncidents(data.incidents);
        });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [settings.checkIntervalSeconds, settings.soundAlerts, services]);

  // Request browser notification permissions if enabled
  const handleToggleNotifications = () => {
    const nextVal = !settings.browserNotifications;
    if (nextVal && typeof window !== 'undefined' && 'Notification' in window) {
      Notification.requestPermission().then((perm) => {
        if (perm === 'granted') {
          new Notification('Arrr-Dash', {
            body: 'Powiadomienia w przeglądarce zostały aktywowane!',
            icon: 'https://cdn-icons-png.flaticon.com/512/888/888859.png'
          });
        }
      });
    }
    updateSettingsOnServer({ browserNotifications: nextVal });
  };

  // Helper to update settings
  const updateSettingsOnServer = async (partial: Partial<AppSettings>) => {
    try {
      const updated = { ...settings, ...partial };
      setSettings(updated);
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partial)
      });
    } catch (err) {
      console.error('Failed to update settings', err);
    }
  };

  // Service CRUD handlers
  const handleSaveService = async (serviceData: Partial<ServiceItem>) => {
    try {
      if (serviceData.id) {
        // Edit
        const res = await fetch(`/api/services/${serviceData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(serviceData)
        });
        const data = await res.json();
        if (data.services) setServices(data.services);
      } else {
        // Create
        const res = await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(serviceData)
        });
        const data = await res.json();
        if (data.services) setServices(data.services);
      }
    } catch (err) {
      console.error('Failed to save service', err);
    }
  };

  const handleConfirmDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.services) setServices(data.services);
      else setServices(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Failed to delete service', err);
    }
  };

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/services/check', { method: 'POST' });
      const data = await res.json();
      if (data.services) setServices(data.services);

      const resInc = await fetch('/api/incidents').then(r => r.json());
      if (resInc.incidents) setIncidents(resInc.incidents);
    } catch (err) {
      console.error('Failed to refresh', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCheckSingle = async (id: string) => {
    setCheckingIds(prev => [...prev, id]);
    // Set status to checking immediately for this item
    setServices(prev => prev.map(s => s.id === id ? { ...s, status: 'checking' } : s));

    try {
      const res = await fetch(`/api/services/${id}/check`, { method: 'POST' });
      const data = await res.json();
      if (data.service) {
        setServices(prev => prev.map(s => s.id === id ? data.service : s));
      } else if (data.services) {
        setServices(data.services);
      }

      const resInc = await fetch('/api/incidents').then(r => r.json()).catch(() => null);
      if (resInc?.incidents) setIncidents(resInc.incidents);
    } catch (err) {
      console.error('Failed single check', err);
    } finally {
      setCheckingIds(prev => prev.filter(i => i !== id));
    }
  };

  const handleResetDemoServices = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/services/reset-demo', { method: 'POST' });
      const data = await res.json();
      if (data.services) setServices(data.services);
    } catch (err) {
      console.error('Failed reset', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleClearAllServices = async () => {
    if (!confirm('Czy na pewno chcesz usunąć WSZYSTKIE usługi z listy? Tablica stanie się pusta.')) return;
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/services', { method: 'DELETE' });
      const data = await res.json();
      if (data.services) setServices(data.services);
      else setServices([]);
    } catch (err) {
      console.error('Failed clear all', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExportConfig = () => {
    window.open('/api/config/export', '_blank');
  };

  const handleImportConfig = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      
      const res = await fetch('/api/config/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed)
      });
      const data = await res.json();
      
      if (res.ok) {
        if (data.services) setServices(data.services);
        if (data.settings) setSettings(data.settings);
        alert('Pomyślnie zaimportowano konfigurację!');
      } else {
        alert('Błąd importu: ' + (data.error || 'Nieprawidłowy format'));
      }
    } catch (err: any) {
      alert('Błąd odczytu pliku JSON: ' + (err.message || 'Błąd'));
    }
  };

  // Discord API Triggers
  const handleSendDiscordTest = async (url?: string) => {
    try {
      const res = await fetch('/api/discord/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl: url || settings.discord.webhookUrl })
      });
      const data = await res.json();
      if (res.ok) {
        setSettings(prev => ({ ...prev, discord: { ...prev.discord, enabled: true, webhookUrl: url || prev.discord.webhookUrl } }));
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const handleSendDiscordReport = async () => {
    try {
      const res = await fetch('/api/discord/report', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const handleClearIncidents = async () => {
    try {
      await fetch('/api/incidents', { method: 'DELETE' });
      setIncidents([]);
    } catch (err) {
      console.error('Failed to clear logs', err);
    }
  };

  // System Overview Calculations
  const overview: SystemOverview = useMemo(() => {
    const total = services.length;
    const online = services.filter(s => s.status === 'online').length;
    const offline = services.filter(s => s.status === 'offline').length;
    const degraded = services.filter(s => s.status === 'degraded').length;

    const latencies = services.map(s => s.latencyMs || 0);
    const avgLat = total > 0 ? Math.round(latencies.reduce((a, b) => a + b, 0) / total) : 0;

    const uptimes = services.map(s => s.uptime24h || 100);
    const overallUptime = total > 0 ? Number((uptimes.reduce((a, b) => a + b, 0) / total).toFixed(1)) : 100;

    return {
      totalServices: total,
      onlineCount: online,
      offlineCount: offline,
      degradedCount: degraded,
      avgLatencyMs: avgLat,
      overallUptime
    };
  }, [services]);

  // Filtered Services List
  const filteredServices = useMemo(() => {
    return services.filter(s => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = 
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.ip.toLowerCase().includes(q) ||
        String(s.port).includes(q);

      let matchesType = false;
      if (typeFilter === 'all') {
        matchesType = true;
      } else if (typeFilter === 'torrent_usenet') {
        matchesType = s.type === 'qbittorrent' || s.type === 'sabnzbd';
      } else if (typeFilter === 'lidarr_readarr') {
        matchesType = s.type === 'lidarr' || s.type === 'readarr';
      } else {
        matchesType = s.type === typeFilter;
      }

      return matchesSearch && matchesType;
    });
  }, [services, searchQuery, typeFilter]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col">
      
      {/* Global Navigation */}
      <Navbar
        overview={overview}
        settings={settings}
        isRefreshing={isRefreshing}
        onRefreshAll={handleRefreshAll}
        onOpenAddModal={() => {
          setEditingService(null);
          setIsServiceModalOpen(true);
        }}
        onOpenDiscordModal={() => setActiveTab('discord')}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onToggleSound={() => updateSettingsOnServer({ soundAlerts: !settings.soundAlerts })}
        onToggleNotifications={handleToggleNotifications}
      />

      {/* Main App Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        
        {/* Navigation Tab Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                activeTab === 'dashboard' 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Server className="w-4 h-4" />
              <span>Pulpit Serwerów ({services.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('discord')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                activeTab === 'discord' 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Integracja Discord</span>
              {settings.discord.enabled && settings.discord.webhookUrl && (
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('incidents')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                activeTab === 'incidents' 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Logi & Incydenty ({incidents.length})</span>
            </button>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="hidden sm:inline">Odświeżanie: <strong className="text-slate-200">Co {settings.checkIntervalSeconds}s</strong></span>
            <span className="h-3 w-[1px] bg-slate-800 hidden sm:inline"></span>
            <span>Uptime SLA: <strong className="text-emerald-400 font-mono">{overview.overallUptime}%</strong></span>
          </div>
        </div>

        {/* Global Overview Metrics */}
        <OverviewMetrics
          overview={overview}
          settings={settings}
          onOpenDiscord={() => setActiveTab('discord')}
        />

        {/* TAB 1: MAIN DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Search & Category Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-2xl">
              
              {/* Search Bar & Refresh All */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto flex-1">
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Szukaj po nazwie, IP lub porcie..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                </div>

                <button
                  onClick={handleRefreshAll}
                  disabled={isRefreshing}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold flex items-center gap-2 transition-all shrink-0 cursor-pointer shadow-sm hover:shadow-indigo-500/10"
                  title="Odśwież stan wszystkich serwerów teraz"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
                  <span>Odśwież wszystko</span>
                </button>
              </div>

              {/* Type Category Filter Buttons */}
              <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs font-medium">
                {[
                  { key: 'all', label: 'Wszystkie' },
                  { key: 'jellyfin', label: 'Jellyfin' },
                  { key: 'sonarr', label: 'Sonarr' },
                  { key: 'radarr', label: 'Radarr' },
                  { key: 'prowlarr', label: 'Prowlarr' },
                  { key: 'bazarr', label: 'Bazarr' },
                  { key: 'lidarr_readarr', label: 'Lidarr/Readarr' },
                  { key: 'torrent_usenet', label: 'Torrent/Usenet' },
                  { key: 'custom', label: 'Własne IP' },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setTypeFilter(f.key)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                      typeFilter === f.key
                        ? 'bg-slate-800 text-indigo-300 font-semibold border border-indigo-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

            </div>

            {/* Services Grid */}
            {filteredServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredServices.map((srv) => (
                  <ServiceCard
                    key={srv.id}
                    service={srv}
                    onCheckSingle={handleCheckSingle}
                    onEdit={(serviceToEdit) => {
                      setEditingService(serviceToEdit);
                      setIsServiceModalOpen(true);
                    }}
                    onDelete={(serviceToDeleteObj) => setServiceToDelete(serviceToDeleteObj)}
                    isChecking={isRefreshing || checkingIds.includes(srv.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center my-8">
                <Server className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white">Brak pasujących usług do wyświetlenia</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  {searchQuery || typeFilter !== 'all' 
                    ? 'Nie znaleziono żądanych serwerów dla wpisanych kryteriów wyszukiwania.' 
                    : 'Nie skonfigurowano jeszcze żadnych adresów IP. Kliknij przycisk poniżej, aby dodać swój pierwszy serwer media stack.'}
                </p>
                <div className="mt-5 flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setEditingService(null);
                      setIsServiceModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Dodaj Adres IP / Usługę</span>
                  </button>
                  <button
                    onClick={handleResetDemoServices}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all"
                  >
                    Wczytaj Szablon Startowy
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: DISCORD INTEGRATION */}
        {activeTab === 'discord' && (
          <DiscordIntegration
            discord={settings.discord}
            services={services}
            onUpdateDiscord={(newConfig) => updateSettingsOnServer({ discord: { ...settings.discord, ...newConfig } })}
            onSendTest={handleSendDiscordTest}
            onSendReportNow={handleSendDiscordReport}
          />
        )}

        {/* TAB 3: INCIDENT LOGS & HISTORY */}
        {activeTab === 'incidents' && (
          <IncidentLogs
            incidents={incidents}
            onClearLogs={handleClearIncidents}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 px-4 lg:px-8 mt-auto text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Arrr-Dash (Sonarr, Radarr, Jellyfin, Prowlarr)</span>
          </div>
          <div>
            Monitorowanie IP & Discord Webhook Alerting System
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => {
          setIsServiceModalOpen(false);
          setEditingService(null);
        }}
        onSave={handleSaveService}
        initialData={editingService}
      />

      <SystemSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettingsOnServer}
        onResetDemoServices={handleResetDemoServices}
        onClearAllServices={handleClearAllServices}
        onTestAudioAlert={() => playAlertSound('test')}
        onExportConfig={handleExportConfig}
        onImportConfig={handleImportConfig}
      />

      <DeleteConfirmModal
        isOpen={!!serviceToDelete}
        service={serviceToDelete}
        onClose={() => setServiceToDelete(null)}
        onConfirmDelete={handleConfirmDelete}
      />

    </div>
  );
}
