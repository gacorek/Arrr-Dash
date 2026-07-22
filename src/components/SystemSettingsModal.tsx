import React, { useRef } from 'react';
import { X, Settings, RefreshCw, Volume2, ShieldAlert, Zap, RotateCcw, Download, Upload, HardDrive } from 'lucide-react';
import { AppSettings } from '../types';

interface SystemSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onResetDemoServices: () => void;
  onClearAllServices?: () => void;
  onTestAudioAlert: () => void;
  onExportConfig?: () => void;
  onImportConfig?: (file: File) => void;
}

export const SystemSettingsModal: React.FC<SystemSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetDemoServices,
  onClearAllServices,
  onTestAudioAlert,
  onExportConfig,
  onImportConfig
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImportConfig) {
      onImportConfig(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Ustawienia Monitorowania i Serwera</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Check Interval */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
              Częstotliwość Automatycznego Pingowania
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[10, 30, 60, 300].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => onUpdateSettings({ checkIntervalSeconds: sec })}
                  className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    settings.checkIntervalSeconds === sec
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {sec < 60 ? `${sec} sek` : `${sec / 60} min`}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Częstotliwość wykonywania zapytań HTTP/Ping w tle dla wszystkich aktywnych usług.
            </p>
          </div>

          {/* Demo Mode vs Live HTTP Checks */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  Tryb Symulacji Ping / Demo
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {settings.demoMode 
                    ? 'WŁĄCZONY: Generowane są symulowane wyniki opóźnień ping dla celów prezentacyjnych.'
                    : 'WYŁĄCZONY (Real Live HTTP): Serwer wykonuje rzeczywiste zapytania HTTP oraz zapytania API do Twoich podanych IP, domen i kluczy API.'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.demoMode}
                onChange={(e) => onUpdateSettings({ demoMode: e.target.checked })}
                className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500 shrink-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Audio Alert Testing */}
          <div className="flex items-center justify-between p-3.5 bg-slate-950/40 border border-slate-800/80 rounded-xl">
            <div className="flex items-center gap-2.5 text-xs font-medium text-slate-300">
              <Volume2 className="w-4 h-4 text-indigo-400" />
              <span>Dźwięki ostrzegawcze w przeglądarce</span>
            </div>
            <button
              type="button"
              onClick={onTestAudioAlert}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
            >
              Testuj Dźwięk Alerty
            </button>
          </div>

          {/* Server Config & Backup (JSON Export / Import) */}
          <div className="bg-indigo-950/30 border border-indigo-800/50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-indigo-200 flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-indigo-400" />
                  Kopia Zapasowa Konfiguracji (Katalog data/)
                </h3>
                <p className="text-[11px] text-indigo-300/80 mt-0.5">
                  Twój serwer zapisuje wszystkie IP i Klucze w pliku <code className="bg-slate-950 px-1 rounded text-emerald-400">data/config.json</code> (trwałym na dysku LXC/Docker).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={onExportConfig}
                className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-indigo-300 border border-indigo-800/60 text-xs font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-indigo-400" />
                <span>Pobierz Backup JSON</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-emerald-300 border border-emerald-800/60 text-xs font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Wgraj Backup JSON</span>
              </button>
            </div>
          </div>

          {/* Data Management Actions */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-300">Przywróć Usługi Startowe</div>
                <div className="text-[11px] text-slate-500">Zresetuj listę serwerów do domyślnego pakietu Arr + Jellyfin</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Czy na pewno chcesz przywrócić domyślne usługi (Jellyfin, Sonarr, Radarr, Prowlarr)?')) {
                    onResetDemoServices();
                    onClose();
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                <span>Resetuj Szablon</span>
              </button>
            </div>

            {onClearAllServices && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                <div>
                  <div className="text-xs font-bold text-rose-300">Wyczyść Wszystkie Serwery</div>
                  <div className="text-[11px] text-slate-500">Usuń wszystkie pozycje z listy, aby zacząć od zera</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClearAllServices();
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 text-xs font-semibold transition-all"
                >
                  Usuń Wszystkie
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950/60 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
          >
            Zamknij
          </button>
        </div>

      </div>
    </div>
  );
};
