import React, { useState, useEffect } from 'react';
import { X, Server, Globe, Key, Layers, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { ServiceItem, ServiceType } from '../types';
import { SERVICE_PRESETS } from '../data/presetServices';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (serviceData: Partial<ServiceItem>) => void;
  initialData?: ServiceItem | null;
}

export const ServiceModal: React.FC<ServiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [selectedType, setSelectedType] = useState<ServiceType>('jellyfin');
  const [name, setName] = useState('');
  const [ip, setIp] = useState('');
  const [port, setPort] = useState<number>(8096);
  const [useSsl, setUseSsl] = useState(false);
  const [pathPrefix, setPathPrefix] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [enabled, setEnabled] = useState(true);

  const [testResult, setTestResult] = useState<{ testing: boolean; message?: string; success?: boolean } | null>(null);

  useEffect(() => {
    if (initialData) {
      setSelectedType(initialData.type);
      setName(initialData.name);
      setIp(initialData.ip);
      setPort(initialData.port);
      setUseSsl(initialData.useSsl);
      setPathPrefix(initialData.pathPrefix || '');
      setApiKey(initialData.apiKey || '');
      setEnabled(initialData.enabled !== false);
    } else {
      // Defaults for new service
      const defaultPreset = SERVICE_PRESETS[0];
      setSelectedType(defaultPreset.type);
      setName(defaultPreset.name);
      setIp('192.168.1.150');
      setPort(defaultPreset.defaultPort);
      setUseSsl(false);
      setPathPrefix(defaultPreset.defaultPath);
      setApiKey('');
      setEnabled(true);
    }
    setTestResult(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSelectPreset = (presetType: ServiceType) => {
    const preset = SERVICE_PRESETS.find(p => p.type === presetType);
    if (preset) {
      setSelectedType(preset.type);
      if (!initialData || !name) {
        setName(preset.name);
        setPort(preset.defaultPort);
        setPathPrefix(preset.defaultPath);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !ip.trim()) return;

    onSave({
      id: initialData?.id,
      name: name.trim(),
      type: selectedType,
      ip: ip.trim(),
      port: Number(port) || 80,
      useSsl,
      pathPrefix: pathPrefix.trim(),
      apiKey: apiKey.trim(),
      enabled
    });
    onClose();
  };

  // Quick test connection inside modal
  const handleTestConnection = async () => {
    setTestResult({ testing: true });
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Endpoint',
          type: selectedType,
          ip: ip.trim(),
          port: Number(port),
          useSsl,
          pathPrefix: pathPrefix.trim(),
          apiKey: apiKey.trim()
        })
      });
      const data = await res.json();
      if (data.service) {
        // Delete the temporary test service from server state immediately
        await fetch(`/api/services/${data.service.id}`, { method: 'DELETE' });

        if (data.service.status === 'online' || data.service.status === 'degraded') {
          setTestResult({
            testing: false,
            success: true,
            message: `Połączenie udane! Czas odpowiedzi: ${data.service.latencyMs}ms (Status: ${data.service.status.toUpperCase()})`
          });
        } else {
          setTestResult({
            testing: false,
            success: false,
            message: `Nie udało się połączyć: ${data.service.errorMessage || 'Brak odpowiedzi HTTP'}`
          });
        }
      }
    } catch (err: any) {
      setTestResult({
        testing: false,
        success: false,
        message: `Błąd testu: ${err.message || 'Przekroczono limit czasu'}`
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">
              {initialData ? 'Edytuj Usługę / IP' : 'Dodaj Nowy Serwer lub Adres IP'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          
          {/* Preset Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
              1. Wybierz Rodzaj Usługi / Szablon
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {SERVICE_PRESETS.map((p) => {
                const isSelected = selectedType === p.type;
                return (
                  <button
                    key={p.type}
                    type="button"
                    onClick={() => handleSelectPreset(p.type)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-semibold text-xs truncate">{p.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">Port: {p.defaultPort}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Service Name */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nazwa Wyświetlana
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="np. Główny Jellyfin NAS"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* IP Address or Hostname */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Adres IP lub Domena Host
              </label>
              <input
                type="text"
                required
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                placeholder="np. 192.168.1.150 lub jellyfin.home.lan"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                <strong className="text-amber-400 font-semibold">Uwaga odnośnie IP w Chmurze:</strong> Jeśli używasz podglądu chmurowego (Cloud Run), serwer chmury nie widzi Twojego domowego IP <code className="text-slate-300 font-mono">192.168.x.x</code>. Aby połączyć się w chmurze, podaj domenę/DDNS (np. DuckDNS/Cloudflare Tunnel) LUB włącz <strong className="text-indigo-300">Tryb Symulacji</strong> w Ustawieniach. Po pobraniu projektu i uruchomieniu go lokalnie (<code className="text-emerald-400 font-mono">npm run dev</code>), adresy <code className="text-slate-300 font-mono">192.168.x.x</code> połączą się natychmiastowo!
              </p>
            </div>

            {/* Port */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Port HTTP / HTTPS
              </label>
              <input
                type="number"
                required
                value={port}
                onChange={(e) => setPort(Number(e.target.value))}
                placeholder="8096"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Path Prefix */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Ścieżka Prefix (Opcjonalnie)
              </label>
              <input
                type="text"
                value={pathPrefix}
                onChange={(e) => setPathPrefix(e.target.value)}
                placeholder="np. /sonarr lub /jellyfin"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* API Key */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-semibold text-indigo-300">
                  <Key className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Klucz API (Wymagany dla danych Live w czasie rzeczywistym)</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">Dla Sonarr / Radarr / Jellyfin / Prowlarr</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Wklej API Key z Ustawień Sonarr / Radarr / Jellyfin..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500 pr-10"
                />
                <Key className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
              </div>
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 mt-2 text-[11px] text-slate-400 space-y-1">
                <p className="font-semibold text-slate-300 flex items-center gap-1">
                  <span>Co umożliwia podanie Klucza API?</span>
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li><strong className="text-slate-200">Sonarr / Radarr:</strong> Pobiera rzeczywistą aktywną kolejkę pobierania (aktywne zadania) oraz sumę seriali/filmów w Twojej bazie.</li>
                  <li><strong className="text-slate-200">Jellyfin:</strong> Pobiera w czasie rzeczywistym liczbę aktywnych strumieni i nazwy użytkowników, którzy coś oglądają.</li>
                  <li><strong className="text-slate-200">Prowlarr:</strong> Pokazuje aktywną liczbę podłączonych indeksatorów Torrent/Usenet.</li>
                </ul>
              </div>
            </div>

            {/* SSL Toggle & Active Toggle */}
            <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800">
              
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-300">
                <input
                  type="checkbox"
                  checked={useSsl}
                  onChange={(e) => setUseSsl(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Używaj bezpiecznego szyfrowania SSL (https://)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-300">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Włącz natychmiastowe monitorowanie</span>
              </label>

            </div>

          </div>

          {/* Test connection output box */}
          {testResult && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
              testResult.testing
                ? 'bg-sky-950/30 border-sky-800/40 text-sky-300'
                : testResult.success
                ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                : 'bg-rose-950/30 border-rose-800/40 text-rose-300'
            }`}>
              {testResult.testing ? (
                <RefreshCw className="w-4 h-4 animate-spin text-sky-400 shrink-0" />
              ) : testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{testResult.testing ? 'Testowanie połączenia z IP i portem...' : testResult.message}</span>
            </div>
          )}

          {/* Footer controls */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
            
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testResult?.testing || !ip.trim()}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 disabled:opacity-50 transition-all flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>Testuj Połączenie</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
              >
                Anuluj
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all"
              >
                {initialData ? 'Zapisz Zmiany' : 'Dodaj Usługę'}
              </button>
            </div>

          </div>

        </form>

      </div>
    </div>
  );
};
