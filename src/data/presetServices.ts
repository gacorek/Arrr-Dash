import { ServicePreset, ServiceItem } from '../types';

export const SERVICE_PRESETS: ServicePreset[] = [
  {
    type: 'jellyfin',
    name: 'Jellyfin',
    defaultPort: 8096,
    defaultPath: '',
    category: 'Media Server',
    description: 'Darmowy, otwarty serwer multimediów do filmów, seriali i muzyki',
    accentColor: '#00A4DC'
  },
  {
    type: 'sonarr',
    name: 'Sonarr',
    defaultPort: 8989,
    defaultPath: '',
    category: 'Media Management',
    description: 'Automatyczne pobieranie i zarządzanie serialami TV',
    accentColor: '#37C5F3'
  },
  {
    type: 'radarr',
    name: 'Radarr',
    defaultPort: 7878,
    defaultPath: '',
    category: 'Media Management',
    description: 'Automatyczne pobieranie i zarządzanie filmami',
    accentColor: '#FFC233'
  },
  {
    type: 'prowlarr',
    name: 'Prowlarr',
    defaultPort: 9696,
    defaultPath: '',
    category: 'Indexer Manager',
    description: 'Menedżer indeksatorów Usenet i Torrent dla aplikacji *arr',
    accentColor: '#EC4899'
  },
  {
    type: 'bazarr',
    name: 'Bazarr',
    defaultPort: 6767,
    defaultPath: '',
    category: 'Subtitles',
    description: 'Automatyczne wyszukiwanie i pobieranie napisów do filmów i seriali',
    accentColor: '#A855F7'
  },
  {
    type: 'lidarr',
    name: 'Lidarr',
    defaultPort: 8686,
    defaultPath: '',
    category: 'Media Management',
    description: 'Menedżer kolekcji muzycznej i automatyczne pobieranie albumów',
    accentColor: '#10B981'
  },
  {
    type: 'readarr',
    name: 'Readarr',
    defaultPort: 8787,
    defaultPath: '',
    category: 'Media Management',
    description: 'Menedżer książek i e-booków',
    accentColor: '#F97316'
  },
  {
    type: 'qbittorrent',
    name: 'qBittorrent',
    defaultPort: 8080,
    defaultPath: '',
    category: 'Download Client',
    description: 'Klient BitTorrent z interfejsem Web UI',
    accentColor: '#2563EB'
  },
  {
    type: 'sabnzbd',
    name: 'SABnzbd',
    defaultPort: 8080,
    defaultPath: '',
    category: 'Download Client',
    description: 'Pobieranie plików z grup dyskusyjnych Usenet',
    accentColor: '#EAB308'
  },
  {
    type: 'custom',
    name: 'Niestandardowa Usługa',
    defaultPort: 80,
    defaultPath: '',
    category: 'Custom Service',
    description: 'Dowolna usługa sieciowa lub serwer HTTP/HTTPS',
    accentColor: '#94A3B8'
  }
];

export const INITIAL_DEMO_SERVICES: ServiceItem[] = [
  {
    id: 'jellyfin-1',
    name: 'Jellyfin Media Server',
    type: 'jellyfin',
    ip: '192.168.1.100',
    port: 8096,
    useSsl: false,
    pathPrefix: '',
    apiKey: '',
    enabled: true,
    status: 'online',
    latencyMs: 12,
    lastChecked: new Date().toISOString(),
    uptime24h: 99.9,
    httpStatusCode: 200,
    history: [
      { timestamp: '23:00', latencyMs: 14, status: 'online' },
      { timestamp: '23:05', latencyMs: 11, status: 'online' },
      { timestamp: '23:10', latencyMs: 13, status: 'online' },
      { timestamp: '23:15', latencyMs: 15, status: 'online' },
      { timestamp: '23:20', latencyMs: 12, status: 'online' },
      { timestamp: '23:25', latencyMs: 11, status: 'online' },
      { timestamp: '23:30', latencyMs: 10, status: 'online' }
    ],
    jellyfinStats: {
      activeStreams: 0,
      activeUsers: [],
      serverVersion: '10.9.x'
    }
  },
  {
    id: 'sonarr-1',
    name: 'Sonarr TV',
    type: 'sonarr',
    ip: '192.168.1.100',
    port: 8989,
    useSsl: false,
    pathPrefix: '',
    apiKey: '',
    enabled: true,
    status: 'online',
    latencyMs: 18,
    lastChecked: new Date().toISOString(),
    uptime24h: 100,
    httpStatusCode: 200,
    history: [
      { timestamp: '23:00', latencyMs: 20, status: 'online' },
      { timestamp: '23:05', latencyMs: 18, status: 'online' },
      { timestamp: '23:10', latencyMs: 19, status: 'online' },
      { timestamp: '23:15', latencyMs: 22, status: 'online' },
      { timestamp: '23:20', latencyMs: 18, status: 'online' },
      { timestamp: '23:25', latencyMs: 16, status: 'online' },
      { timestamp: '23:30', latencyMs: 17, status: 'online' }
    ],
    arrStats: {
      queuedDownloads: 0,
      totalItems: 0,
      version: 'v4'
    }
  },
  {
    id: 'radarr-1',
    name: 'Radarr Movies',
    type: 'radarr',
    ip: '192.168.1.100',
    port: 7878,
    useSsl: false,
    pathPrefix: '',
    apiKey: '',
    enabled: true,
    status: 'online',
    latencyMs: 15,
    lastChecked: new Date().toISOString(),
    uptime24h: 99.8,
    httpStatusCode: 200,
    history: [
      { timestamp: '23:00', latencyMs: 16, status: 'online' },
      { timestamp: '23:05', latencyMs: 15, status: 'online' },
      { timestamp: '23:10', latencyMs: 14, status: 'online' },
      { timestamp: '23:15', latencyMs: 17, status: 'online' },
      { timestamp: '23:20', latencyMs: 15, status: 'online' },
      { timestamp: '23:25', latencyMs: 13, status: 'online' },
      { timestamp: '23:30', latencyMs: 14, status: 'online' }
    ],
    arrStats: {
      queuedDownloads: 0,
      totalItems: 0,
      version: 'v5'
    }
  },
  {
    id: 'prowlarr-1',
    name: 'Prowlarr Indexer',
    type: 'prowlarr',
    ip: '192.168.1.100',
    port: 9696,
    useSsl: false,
    pathPrefix: '',
    apiKey: '',
    enabled: true,
    status: 'online',
    latencyMs: 9,
    lastChecked: new Date().toISOString(),
    uptime24h: 100,
    httpStatusCode: 200,
    history: [
      { timestamp: '23:00', latencyMs: 10, status: 'online' },
      { timestamp: '23:05', latencyMs: 9, status: 'online' },
      { timestamp: '23:10', latencyMs: 8, status: 'online' },
      { timestamp: '23:15', latencyMs: 11, status: 'online' },
      { timestamp: '23:20', latencyMs: 9, status: 'online' },
      { timestamp: '23:25', latencyMs: 9, status: 'online' },
      { timestamp: '23:30', latencyMs: 8, status: 'online' }
    ]
  }
];
