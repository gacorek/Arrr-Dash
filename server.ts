import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { INITIAL_DEMO_SERVICES } from './src/data/presetServices';
import { AppSettings, IncidentLog, ServiceItem, SystemOverview } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Disk Persistence Configuration
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

function ensureDataDirExists() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (e) {
      console.error('[DATA] Błąd tworzenia katalogu data:', e);
    }
  }
}

// In-memory state
let services: ServiceItem[] = [...INITIAL_DEMO_SERVICES];

let settings: AppSettings = {
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
    botName: 'Arrr-Dash Sentinel',
    avatarUrl: 'https://cdn-icons-png.flaticon.com/512/888/888859.png'
  }
};

let incidentLogs: IncidentLog[] = [];

function loadDataFromDisk() {
  ensureDataDirExists();
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.services)) {
        services = parsed.services;
      }
      if (parsed.settings && typeof parsed.settings === 'object') {
        settings = { ...settings, ...parsed.settings };
      }
      console.log(`[DATA] Pomyślnie załadowano konfigurację z ${CONFIG_FILE} (${services.length} usług)`);
    } catch (err) {
      console.error('[DATA] Błąd odczytu pliku konfiguracji, używam domyślnych:', err);
    }
  } else {
    console.log('[DATA] Brak pliku konfiguracji. Tworzę domyślny plik w data/config.json');
    saveDataToDisk();
  }
}

function saveDataToDisk() {
  ensureDataDirExists();
  try {
    const payload = {
      services,
      settings,
      updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    console.log(`[DATA] Zapisano stan w ${CONFIG_FILE}`);
  } catch (err) {
    console.error('[DATA] Błąd zapisu do data/config.json:', err);
  }
}

// Initial load on server module startup
loadDataFromDisk();

// Helper: Check if IP is private/LAN
function isPrivateIp(ip: string): boolean {
  const clean = ip.trim().toLowerCase();
  return (
    clean.startsWith('192.168.') ||
    clean.startsWith('10.') ||
    clean.startsWith('172.16.') ||
    clean.startsWith('172.17.') ||
    clean.startsWith('172.18.') ||
    clean.startsWith('172.19.') ||
    clean.startsWith('172.20.') ||
    clean.startsWith('172.21.') ||
    clean.startsWith('172.22.') ||
    clean.startsWith('172.23.') ||
    clean.startsWith('172.24.') ||
    clean.startsWith('172.25.') ||
    clean.startsWith('172.26.') ||
    clean.startsWith('172.27.') ||
    clean.startsWith('172.28.') ||
    clean.startsWith('172.29.') ||
    clean.startsWith('172.30.') ||
    clean.startsWith('172.31.') ||
    clean.startsWith('127.') ||
    clean === 'localhost' ||
    clean.endsWith('.local')
  );
}

// Helper: Send Discord Webhook
async function sendDiscordWebhook(payload: any) {
  if (!settings.discord.webhookUrl || !settings.discord.webhookUrl.startsWith('http')) {
    return { success: false, error: 'Brak skonfigurowanego poprawnego URL Webhooka Discord' };
  }

  try {
    const res = await fetch(settings.discord.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: settings.discord.botName || 'Arrr-Dash Sentinel',
        avatar_url: settings.discord.avatarUrl || 'https://cdn-icons-png.flaticon.com/512/888/888859.png',
        ...payload
      })
    });

    if (res.ok || res.status === 204) {
      return { success: true };
    } else {
      const text = await res.text();
      return { success: false, error: `Discord HTTP ${res.status}: ${text}` };
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Błąd połączenia z Discord API' };
  }
}

// Health Check Logic for a service
async function checkServiceHealth(service: ServiceItem): Promise<ServiceItem> {
  const startTime = Date.now();
  const protocol = service.useSsl ? 'https' : 'http';
  const url = `${protocol}://${service.ip}:${service.port}${service.pathPrefix || ''}`;
  const isLan = isPrivateIp(service.ip);

  let newStatus: 'online' | 'offline' | 'degraded' = 'online';
  let latency = 0;
  let statusCode = 200;
  let errMsg = '';
  let updatedJellyfinStats = service.jellyfinStats;
  let updatedArrStats = service.arrStats;

  // If Demo Mode is explicitly enabled by the user in settings, use simulated metrics
  if (settings.demoMode) {
    latency = Math.floor(Math.random() * 25) + 12; // 12ms - 37ms
    newStatus = 'online';
    statusCode = 200;
  } else {
    // REAL HTTP Ping & API Query Logic
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const headers: Record<string, string> = {
        'User-Agent': 'ArrrDash/1.0',
        'Accept': 'application/json'
      };
      if (service.apiKey) {
        headers['X-Api-Key'] = service.apiKey;
        headers['X-Emby-Token'] = service.apiKey;
        headers['X-MediaBrowser-Token'] = service.apiKey;
        headers['Authorization'] = `MediaBrowser Client="ArrrDash", Device="Server", DeviceId="arrr-dash", Version="1.0.0", Token="${service.apiKey}"`;
      }

      const res = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers
      });
      clearTimeout(timeoutId);

      latency = Date.now() - startTime;
      statusCode = res.status;

      if (res.ok || res.status === 401 || res.status === 403 || res.status === 302) {
        // HTTP 200/401/403/302 means target server is alive and responding
        if (latency > 600) {
          newStatus = 'degraded';
          errMsg = `Wysoki czas opóźnienia HTTP: ${latency}ms`;
        } else {
          newStatus = 'online';
        }

        // Try querying live service stats if HTTP is OK
        if (res.ok) {
          try {
            // JELLYFIN
            if (service.type === 'jellyfin') {
              const pubRes = await fetch(`${url}/System/Info/Public`, { headers }).then(r => r.ok ? r.json() : null).catch(() => null);
              let activeStreams = 0;
              let activeUsersArr: string[] = [];
              
              if (service.apiKey) {
                const sessUrl = `${url}/Sessions?api_key=${encodeURIComponent(service.apiKey)}`;
                const sessRes = await fetch(sessUrl, { headers }).then(r => r.ok ? r.json() : null).catch(() => null);
                if (Array.isArray(sessRes)) {
                  const active = sessRes.filter((s: any) => s.NowPlayingItem);
                  activeStreams = active.length;
                  activeUsersArr = active.map((s: any) => `${s.UserName || 'Użytkownik'} (${s.Client || 'Odtwarzacz'})`);
                }
              }

              updatedJellyfinStats = {
                activeStreams: service.apiKey ? activeStreams : (settings.demoMode ? (service.jellyfinStats?.activeStreams || 0) : 0),
                activeUsers: service.apiKey ? activeUsersArr : (settings.demoMode ? (service.jellyfinStats?.activeUsers || []) : []),
                serverVersion: pubRes?.Version || service.jellyfinStats?.serverVersion || 'Jellyfin',
                mediaCount: service.jellyfinStats?.mediaCount
              };
            }

            // SONARR / RADARR / PROWLARR
            if (service.type === 'sonarr' || service.type === 'radarr' || service.type === 'prowlarr') {
              const apiVer = service.type === 'prowlarr' ? 'v1' : 'v3';
              const sysUrl = `${url}/api/${apiVer}/system/status${service.apiKey ? `?apiKey=${service.apiKey}` : ''}`;
              const sysRes = await fetch(sysUrl, { headers }).then(r => r.ok ? r.json() : null).catch(() => null);

              let queued = 0;
              let total = 0;

              if (service.apiKey) {
                const queueUrl = `${url}/api/${apiVer}/queue?apiKey=${service.apiKey}`;
                const queueRes = await fetch(queueUrl, { headers }).then(r => r.ok ? r.json() : null).catch(() => null);
                if (queueRes) {
                  queued = queueRes.totalRecords ?? (Array.isArray(queueRes.records) ? queueRes.records.length : 0);
                }

                if (service.type === 'sonarr') {
                  const seriesRes = await fetch(`${url}/api/v3/series?apiKey=${service.apiKey}`, { headers }).then(r => r.ok ? r.json() : null).catch(() => null);
                  if (Array.isArray(seriesRes)) total = seriesRes.length;
                } else if (service.type === 'radarr') {
                  const movieRes = await fetch(`${url}/api/v3/movie?apiKey=${service.apiKey}`, { headers }).then(r => r.ok ? r.json() : null).catch(() => null);
                  if (Array.isArray(movieRes)) total = movieRes.length;
                }
              }

              updatedArrStats = {
                queuedDownloads: service.apiKey ? queued : (settings.demoMode ? (service.arrStats?.queuedDownloads || 0) : 0),
                totalItems: service.apiKey ? total : (settings.demoMode ? (service.arrStats?.totalItems || 0) : 0),
                version: sysRes?.version || service.arrStats?.version || 'v4'
              };
            }
          } catch {
            // Ignore API sub-fetch failure; primary ping succeeded
          }
        }
      } else {
        newStatus = 'degraded';
        errMsg = `Kod odpowiedzi HTTP ${res.status}`;
      }
    } catch (err: any) {
      latency = Date.now() - startTime;
      newStatus = 'offline';
      statusCode = 0;
      if (err.name === 'AbortError') {
        errMsg = 'Przekroczono limit czasu połączenia (Timeout >6s)';
      } else if (isLan) {
        errMsg = `Brak bezpośredniego połączenia chmury z lokalnym IP (${service.ip}). Skonfiguruj domeny/publiczny URL z przekierowaniem portów lub włącz Tryb Demo w Ustawieniach.`;
      } else {
        errMsg = err.message || 'Brak odpowiedzi ze strony hosta';
      }
    }
  }

  const prevStatus = service.status;
  const timeFormatted = new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

  // Update history slice
  const updatedHistory = [
    ...(service.history || []).slice(-14),
    { timestamp: timeFormatted, latencyMs: latency, status: newStatus }
  ];

  // Detect state flip for Incident Logging & Discord alert
  if (prevStatus !== newStatus && prevStatus !== 'checking') {
    let incidentType: IncidentLog['type'] = 'degraded';
    let msg = '';

    if (newStatus === 'offline') {
      incidentType = 'outage';
      msg = `Usługa ${service.name} przestała odpowiadać (${errMsg || 'Błąd połączenia'})`;
    } else if (newStatus === 'online' && prevStatus === 'offline') {
      incidentType = 'recovered';
      msg = `Usługa ${service.name} powróciła do stanu ONLINE (${latency}ms)`;
    } else if (newStatus === 'degraded') {
      incidentType = 'degraded';
      msg = `Usługa ${service.name} ma obniżoną wydajność (${errMsg || `${latency}ms`})`;
    }

    const incident: IncidentLog = {
      id: `inc-${Date.now()}`,
      serviceId: service.id,
      serviceName: service.name,
      serviceType: service.type,
      type: incidentType,
      message: msg,
      timestamp: new Date().toISOString(),
      latencyMs: latency,
      discordSent: false
    };

    incidentLogs.unshift(incident);

    // Send Discord alert if configured
    if (settings.discord.enabled && settings.discord.webhookUrl) {
      const isOutageAlert = incidentType === 'outage' && settings.discord.notifyOnOutage;
      const isRecoveryAlert = incidentType === 'recovered' && settings.discord.notifyOnRecovery;

      if (isOutageAlert || isRecoveryAlert) {
        const title = incidentType === 'outage' 
          ? `🚨 AWARIA USŁUGI: ${service.name}` 
          : `✅ PRZYWRÓCONO USŁUGĘ: ${service.name}`;
        const color = incidentType === 'outage' ? 15158332 : 3066993;

        sendDiscordWebhook({
          embeds: [
            {
              title,
              description: msg,
              color,
              fields: [
                { name: 'Adres Host/IP', value: `\`${service.ip}:${service.port}\``, inline: true },
                { name: 'Czas Odpowiedzi', value: `${latency} ms`, inline: true },
                { name: 'Data i Czas', value: new Date().toLocaleString('pl-PL'), inline: true }
              ],
              footer: { text: 'Arrr-Dash • Monitorowanie Czasu Rzeczywistego' }
            }
          ]
        }).then(res => {
          if (res.success) incident.discordSent = true;
        });
      }
    }
  }

  return {
    ...service,
    status: newStatus,
    latencyMs: latency,
    httpStatusCode: statusCode,
    errorMessage: errMsg,
    lastChecked: new Date().toISOString(),
    history: updatedHistory,
    jellyfinStats: updatedJellyfinStats,
    arrStats: updatedArrStats
  };
}

// Perform health check across all active services
async function checkAllServices() {
  services = await Promise.all(
    services.map(s => (s.enabled ? checkServiceHealth(s) : Promise.resolve(s)))
  );
}

// Background monitoring ticker
setInterval(() => {
  checkAllServices();
}, (settings.checkIntervalSeconds || 30) * 1000);

// API Endpoints

// 1. Get services
app.get('/api/services', (req, res) => {
  res.json({ services });
});

// 2. Add new service
app.post('/api/services', async (req, res) => {
  const body = req.body;
  if (!body.name || !body.ip || !body.port) {
    return res.status(400).json({ error: 'Nazwa, IP oraz port są wymagane.' });
  }

  const newService: ServiceItem = {
    id: `srv-${Date.now()}`,
    name: body.name,
    type: body.type || 'custom',
    ip: body.ip.trim(),
    port: parseInt(body.port, 10) || 80,
    useSsl: Boolean(body.useSsl),
    pathPrefix: body.pathPrefix || '',
    apiKey: body.apiKey || '',
    enabled: body.enabled !== false,
    status: 'checking',
    latencyMs: 0,
    lastChecked: null,
    uptime24h: 100.0,
    history: []
  };

  const checked = await checkServiceHealth(newService);
  services.push(checked);
  saveDataToDisk();
  res.json({ service: checked, services });
});

// 3. Edit service
app.put('/api/services/:id', async (req, res) => {
  const { id } = req.params;
  const idx = services.findIndex(s => s.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Nie znaleziono usługi' });
  }

  const updated: ServiceItem = {
    ...services[idx],
    ...req.body,
    port: parseInt(req.body.port, 10) || services[idx].port
  };

  const checked = await checkServiceHealth(updated);
  services[idx] = checked;
  saveDataToDisk();
  res.json({ service: checked, services });
});

// 4. Delete service
app.delete('/api/services/:id', (req, res) => {
  const { id } = req.params;
  services = services.filter(s => s.id !== id);
  saveDataToDisk();
  res.json({ success: true, services });
});

// 5. Trigger manual health check (all)
app.post('/api/services/check', async (req, res) => {
  await checkAllServices();
  res.json({ services });
});

// 5b. Trigger manual health check for a SINGLE service
app.post('/api/services/:id/check', async (req, res) => {
  const { id } = req.params;
  const idx = services.findIndex(s => s.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Nie znaleziono usługi' });
  }

  const checked = await checkServiceHealth(services[idx]);
  services[idx] = checked;
  res.json({ service: checked, services });
});

// 6. Reset demo services
app.post('/api/services/reset-demo', async (req, res) => {
  services = JSON.parse(JSON.stringify(INITIAL_DEMO_SERVICES));
  await checkAllServices();
  saveDataToDisk();
  res.json({ services });
});

// 6b. Clear all services (wipe demo/mock data)
app.delete('/api/services', (req, res) => {
  services = [];
  saveDataToDisk();
  res.json({ success: true, services: [] });
});

// 7. Get settings
app.get('/api/settings', (req, res) => {
  res.json({ settings });
});

// 8. Update settings
app.post('/api/settings', (req, res) => {
  settings = {
    ...settings,
    ...req.body,
    discord: {
      ...settings.discord,
      ...(req.body.discord || {})
    }
  };
  saveDataToDisk();
  res.json({ settings });
});

// 8b. Export JSON Config
app.get('/api/config/export', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="arrr-dash-config.json"');
  res.json({
    services,
    settings,
    exportedAt: new Date().toISOString()
  });
});

// 8c. Import JSON Config
app.post('/api/config/import', async (req, res) => {
  try {
    const { services: newServices, settings: newSettings } = req.body;
    if (Array.isArray(newServices)) {
      services = newServices;
    }
    if (newSettings && typeof newSettings === 'object') {
      settings = {
        ...settings,
        ...newSettings,
        discord: {
          ...settings.discord,
          ...(newSettings.discord || {})
        }
      };
    }
    saveDataToDisk();
    await checkAllServices();
    res.json({ success: true, services, settings });
  } catch (err: any) {
    res.status(400).json({ error: 'Błąd importu konfiguracji: ' + (err.message || 'Niepoprawny plik') });
  }
});

// 9. Discord test message
app.post('/api/discord/test', async (req, res) => {
  const { webhookUrl } = req.body;
  const targetUrl = webhookUrl || settings.discord.webhookUrl;

  if (!targetUrl) {
    return res.status(400).json({ error: 'Proszę podać adres URL Webhooka Discord.' });
  }

  // Update URL if provided
  if (webhookUrl) settings.discord.webhookUrl = webhookUrl;

  const result = await sendDiscordWebhook({
    embeds: [
      {
        title: '🧪 Test Połączenia z Discord Webhook',
        description: 'Twój serwer Arrr-Dash pomyślnie nawiązał połączenie z Discordem!',
        color: 3447003, // Blue
        fields: [
          { name: 'Status Integracji', value: '🟢 POŁĄCZONO', inline: true },
          { name: 'Monitorowane Usługi', value: `${services.length} serwerów`, inline: true },
          { name: 'Czas systemowy', value: new Date().toLocaleString('pl-PL'), inline: true }
        ],
        footer: { text: 'Arrr-Dash • Test Webhooka' }
      }
    ]
  });

  if (result.success) {
    // Add incident log
    incidentLogs.unshift({
      id: `inc-test-${Date.now()}`,
      serviceId: 'discord',
      serviceName: 'Discord Webhook',
      serviceType: 'custom',
      type: 'test_report',
      message: 'Pomyślnie wysłano testowe powiadomienie na serwer Discord.',
      timestamp: new Date().toISOString(),
      discordSent: true
    });
    return res.json({ success: true, message: 'Wiadomość testowa została wysłana na Twój kanał Discord!' });
  } else {
    return res.status(500).json({ error: result.error });
  }
});

// 10. Discord full availability report
app.post('/api/discord/report', async (req, res) => {
  if (!settings.discord.webhookUrl) {
    return res.status(400).json({ error: 'Proszę podać adres URL Webhooka Discord w ustawieniach.' });
  }

  const onlineServices = services.filter(s => s.status === 'online');
  const offlineServices = services.filter(s => s.status === 'offline');
  const degradedServices = services.filter(s => s.status === 'degraded');

  const overallStatus = offlineServices.length === 0 ? '🟢 Wszystkie usługi działają prawidłowo' : `⚠️ Wykryto problemy (${offlineServices.length} offline)`;
  const color = offlineServices.length === 0 ? 3066993 : 15158332;

  const totalLatency = services.reduce((acc, s) => acc + (s.latencyMs || 0), 0);
  const avgLatency = services.length > 0 ? Math.round(totalLatency / services.length) : 0;

  const serviceListText = services
    .map(s => {
      const icon = s.status === 'online' ? '🟢' : s.status === 'degraded' ? '🟡' : '🔴';
      return `${icon} **${s.name}** (\`${s.ip}:${s.port}\`) — ${s.latencyMs}ms | Uptime: ${s.uptime24h}%`;
    })
    .join('\n');

  const result = await sendDiscordWebhook({
    embeds: [
      {
        title: '📊 Raport Dostępności Usług Arrr-Dash',
        description: `**Ogólny Stan:** ${overallStatus}`,
        color,
        fields: [
          { name: 'Podsumowanie Dostępności', value: `Wszystkie: **${services.length}** | Online: **${onlineServices.length}** | Degraded: **${degradedServices.length}** | Offline: **${offlineServices.length}**`, inline: false },
          { name: 'Średnie Opóźnienie', value: `\`${avgLatency} ms\``, inline: true },
          { name: 'Tryb Monitorowania', value: settings.demoMode ? 'Demo / Symulowany' : 'Produkcyjny / HTTP Live', inline: true },
          { name: 'Lista Usług', value: serviceListText || 'Brak skonfigurowanych usług', inline: false }
        ],
        footer: { text: `Wygenerowano: ${new Date().toLocaleString('pl-PL')} • Arrr-Dash Sentinel` }
      }
    ]
  });

  if (result.success) {
    settings.discord.lastReportSent = new Date().toISOString();
    incidentLogs.unshift({
      id: `inc-report-${Date.now()}`,
      serviceId: 'discord-report',
      serviceName: 'Discord Raport',
      serviceType: 'custom',
      type: 'test_report',
      message: 'Wysłano raport dostępności usług na kanał Discord.',
      timestamp: new Date().toISOString(),
      discordSent: true
    });
    return res.json({ success: true, message: 'Raport dostępności został wysłany na Discord!' });
  } else {
    return res.status(500).json({ error: result.error });
  }
});

// 11. Get incident logs
app.get('/api/incidents', (req, res) => {
  res.json({ incidents: incidentLogs });
});

// 12. Clear incident logs
app.delete('/api/incidents', (req, res) => {
  incidentLogs = [];
  res.json({ success: true, incidents: [] });
});

// Vite middleware for dev / static serving for prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Arrr-Dash Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
