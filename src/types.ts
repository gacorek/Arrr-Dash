export type ServiceType = 
  | 'jellyfin' 
  | 'sonarr' 
  | 'radarr' 
  | 'prowlarr' 
  | 'lidarr' 
  | 'readarr' 
  | 'bazarr' 
  | 'sabnzbd' 
  | 'qbittorrent' 
  | 'custom';

export interface ServicePreset {
  type: ServiceType;
  name: string;
  defaultPort: number;
  defaultPath: string;
  category: string;
  description: string;
  accentColor?: string;
}

export type StatusState = 'online' | 'offline' | 'degraded' | 'checking';

export interface LatencyPoint {
  timestamp: string;
  latencyMs: number;
  status: StatusState;
}

export interface JellyfinStats {
  activeStreams: number;
  activeUsers: string[];
  serverVersion?: string;
  mediaCount?: {
    movies: number;
    series: number;
    episodes: number;
  };
}

export interface ArrStats {
  queuedDownloads?: number;
  warningsCount?: number;
  totalItems?: number; // Total movies or series
  version?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  type: ServiceType;
  ip: string; // e.g. 192.168.1.100 or domain.com
  port: number;
  useSsl: boolean;
  pathPrefix?: string; // e.g. /sonarr
  apiKey?: string;
  enabled: boolean;
  
  // Real-time status fields
  status: StatusState;
  latencyMs: number;
  lastChecked: string | null;
  uptime24h: number; // percentage e.g. 99.8
  httpStatusCode?: number;
  errorMessage?: string;
  
  // History for micro-chart (last 15 checks)
  history: LatencyPoint[];
  
  // Specific app metrics when available
  jellyfinStats?: JellyfinStats;
  arrStats?: ArrStats;
}

export interface IncidentLog {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceType: ServiceType;
  type: 'outage' | 'recovered' | 'degraded' | 'test_report';
  message: string;
  timestamp: string;
  latencyMs?: number;
  discordSent?: boolean;
}

export interface DiscordConfig {
  webhookUrl: string;
  enabled: boolean;
  notifyOnOutage: boolean;
  notifyOnRecovery: boolean;
  autoReportEnabled: boolean;
  autoReportIntervalHours: number; // e.g. 24
  lastReportSent?: string;
  botName?: string;
  avatarUrl?: string;
}

export interface AppSettings {
  checkIntervalSeconds: number; // e.g. 30
  demoMode: boolean; // toggle simulated response for LAN IPs in cloud env
  soundAlerts: boolean;
  browserNotifications: boolean;
  discord: DiscordConfig;
}

export interface SystemOverview {
  totalServices: number;
  onlineCount: number;
  offlineCount: number;
  degradedCount: number;
  avgLatencyMs: number;
  overallUptime: number;
}
