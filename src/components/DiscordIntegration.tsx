import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle2, AlertOctagon, HelpCircle, Sparkles, RefreshCw, Clock, BellRing } from 'lucide-react';
import { DiscordConfig, ServiceItem } from '../types';

interface DiscordIntegrationProps {
  discord: DiscordConfig;
  services: ServiceItem[];
  onUpdateDiscord: (newConfig: Partial<DiscordConfig>) => void;
  onSendTest: (webhookUrl?: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  onSendReportNow: () => Promise<{ success: boolean; message?: string; error?: string }>;
}

export const DiscordIntegration: React.FC<DiscordIntegrationProps> = ({
  discord,
  services,
  onUpdateDiscord,
  onSendTest,
  onSendReportNow
}) => {
  const [urlInput, setUrlInput] = useState(discord.webhookUrl || '');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isSendingReport, setIsSendingReport] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; text: string } | null>(null);

  const handleSaveUrl = () => {
    onUpdateDiscord({ webhookUrl: urlInput.trim(), enabled: Boolean(urlInput.trim()) });
    setFeedback({ success: true, text: 'Zapisano adres URL Webhooka Discord!' });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleTestCall = async () => {
    setIsSendingTest(true);
    setFeedback(null);
    const result = await onSendTest(urlInput.trim());
    setIsSendingTest(false);

    if (result.success) {
      setFeedback({ success: true, text: result.message || 'Wiadomość testowa wysłana na Twój kanał Discord!' });
    } else {
      setFeedback({ success: false, text: result.error || 'Błąd wysyłania na Discord.' });
    }
  };

  const handleReportCall = async () => {
    setIsSendingReport(true);
    setFeedback(null);
    const result = await onSendReportNow();
    setIsSendingReport(false);

    if (result.success) {
      setFeedback({ success: true, text: result.message || 'Pomyślnie wysłano raport na Discord!' });
    } else {
      setFeedback({ success: false, text: result.error || 'Błąd wysyłania raportu.' });
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-8">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Integracja z Discordem
              <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Raporty i Alerting
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Otrzymuj automatyczne powiadomienia o awariach oraz pełne raporty dostępności bezpośrednio na Twój kanał Discord
            </p>
          </div>
        </div>

        {/* Action triggers */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReportCall}
            disabled={isSendingReport || !urlInput.trim()}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
          >
            {isSendingReport ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Wyślij Raport Dostępności Teraz</span>
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5">
        
        {/* Left Column: Form Settings */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Webhook Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Adres Webhooka Discord (Discord Webhook URL)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://discord.com/api/webhooks/123456789/xyz..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleSaveUrl}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all shrink-0"
              >
                Zapisz
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              Jak uzyskać? Ustawienia Kanału Discord → Integracje → Webhooki → Nowy Webhook → Kopiuj URL
            </p>
          </div>

          {/* Feedback Toast Banner */}
          {feedback && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              feedback.success 
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300' 
                : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
            }`}>
              {feedback.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertOctagon className="w-4 h-4 text-rose-400" />}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* Automation Checkboxes */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Zasady Wysłania Wiadomości Automatycznych
            </h3>

            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
              <span className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-rose-400" />
                <span>Wysyłaj alert gdy usługa przejdzie w stan AWARIA (Offline)</span>
              </span>
              <input
                type="checkbox"
                checked={discord.notifyOnOutage}
                onChange={(e) => onUpdateDiscord({ notifyOnOutage: e.target.checked })}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer pt-2 border-t border-slate-800/60">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Wysyłaj powiadomienie po PRZYWRÓCENIU sprawności (Recovery)</span>
              </span>
              <input
                type="checkbox"
                checked={discord.notifyOnRecovery}
                onChange={(e) => onUpdateDiscord({ notifyOnRecovery: e.target.checked })}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer pt-2 border-t border-slate-800/60">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400" />
                <span>Wysyłaj cykliczne Raporty Dostępności (Co 24 godziny)</span>
              </span>
              <input
                type="checkbox"
                checked={discord.autoReportEnabled}
                onChange={(e) => onUpdateDiscord({ autoReportEnabled: e.target.checked })}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
              />
            </label>
          </div>

          {/* Test Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleTestCall}
              disabled={isSendingTest || !urlInput.trim()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 text-xs font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSendingTest ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Wyślij Wiadomość Testową</span>
            </button>
          </div>

        </div>

        {/* Right Column: Live Discord Embed Preview */}
        <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Podgląd Embedu Discord</span>
              <span className="text-[10px] text-indigo-400 font-mono">#status-alert</span>
            </div>

            {/* Discord Dark Theme Card Mockup */}
            <div className="bg-[#2b2d31] text-slate-200 rounded-lg p-3 text-xs font-sans border-l-4 border-emerald-500 shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
                  M
                </div>
                <div>
                  <div className="font-bold text-white text-xs flex items-center gap-1.5">
                    {discord.botName || 'Arrr-Dash Sentinel'}
                    <span className="bg-[#5865f2] text-[9px] text-white px-1 py-0.2 rounded font-semibold">BOT</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Dzisiaj o {new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>

              {/* Embed Content Box */}
              <div className="bg-[#1e1f22] p-3 rounded border border-slate-800 space-y-2">
                <div className="font-bold text-white text-sm">
                  📊 Raport Dostępności Usług Arrr-Dash
                </div>
                <div className="text-slate-300 text-[11px]">
                  <strong>Ogólny Stan:</strong> 🟢 Wszystkie systemy sprawne ({services.length}/{services.length})
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800 text-[11px]">
                  <div>
                    <div className="text-slate-400 font-semibold text-[10px]">MONITOROWANE</div>
                    <div className="text-white font-mono">{services.length} serwerów</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-semibold text-[10px]">ŚR. OPÓŹNIENIE</div>
                    <div className="text-emerald-400 font-mono">18 ms</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[10px] space-y-1 font-mono text-slate-300">
                  {services.slice(0, 4).map((s, idx) => (
                    <div key={idx} className="truncate">
                      🟢 <strong>{s.name}</strong> ({s.ip}:{s.port}) — {s.latencyMs}ms
                    </div>
                  ))}
                  {services.length > 4 && (
                    <div className="text-slate-500 italic">+ {services.length - 4} kolejnych usług...</div>
                  )}
                </div>

              </div>

            </div>

          </div>

          <div className="text-[11px] text-slate-500 italic mt-3 text-center">
            Tak będzie wyglądał alert wygenerowany automatycznie przez Twój serwer.
          </div>

        </div>

      </div>

    </div>
  );
};
