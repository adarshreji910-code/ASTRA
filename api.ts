import {
  SolarSystemState,
  AstronomicalEvent,
  SpaceWeather,
  NewsArticle,
  SpaceMission,
  SkyTonightData,
  ISSTelemetry
} from '../types';

const API_BASE = '/api';

export async function fetchCurrentSolarSystem(): Promise<SolarSystemState> {
  const res = await fetch(`${API_BASE}/solar-system/current`);
  if (!res.ok) throw new Error(`Failed to fetch current solar system: ${res.statusText}`);
  return res.json();
}

export async function fetchSolarSystemAtTime(timestampIso: string): Promise<SolarSystemState> {
  const res = await fetch(`${API_BASE}/solar-system/${encodeURIComponent(timestampIso)}`);
  if (!res.ok) throw new Error(`Failed to fetch solar system at time: ${res.statusText}`);
  return res.json();
}

export async function fetchUpcomingEvents(category?: string): Promise<AstronomicalEvent[]> {
  const url = category && category !== 'all'
    ? `${API_BASE}/events/upcoming?category=${encodeURIComponent(category)}`
    : `${API_BASE}/events/upcoming`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch upcoming events: ${res.statusText}`);
  return res.json();
}

export async function fetchEventDetails(eventId: string): Promise<AstronomicalEvent> {
  const res = await fetch(`${API_BASE}/events/${encodeURIComponent(eventId)}`);
  if (!res.ok) throw new Error(`Failed to fetch event details: ${res.statusText}`);
  return res.json();
}

export async function fetchSkyTonight(lat: number, lon: number, timestamp?: string): Promise<SkyTonightData> {
  let url = `${API_BASE}/sky/tonight?lat=${lat}&lon=${lon}`;
  if (timestamp) url += `&timestamp=${encodeURIComponent(timestamp)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch sky tonight: ${res.statusText}`);
  return res.json();
}

export async function fetchSpaceWeather(): Promise<SpaceWeather> {
  const res = await fetch(`${API_BASE}/space-weather`);
  if (!res.ok) throw new Error(`Failed to fetch space weather: ${res.statusText}`);
  return res.json();
}

export async function fetchNews(category?: string, organization?: string): Promise<NewsArticle[]> {
  let url = `${API_BASE}/news/latest?limit=30`;
  if (category && category !== 'all') url += `&category=${encodeURIComponent(category)}`;
  if (organization && organization !== 'all') url += `&organization=${encodeURIComponent(organization)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch news: ${res.statusText}`);
  return res.json();
}

export async function fetchMissions(agency?: string): Promise<SpaceMission[]> {
  const url = agency && agency !== 'all'
    ? `${API_BASE}/missions?agency=${encodeURIComponent(agency)}`
    : `${API_BASE}/missions`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch missions: ${res.statusText}`);
  return res.json();
}

export async function fetchISSTelemetry(): Promise<ISSTelemetry> {
  const res = await fetch(`${API_BASE}/iss/current`);
  if (!res.ok) throw new Error(`Failed to fetch ISS telemetry: ${res.statusText}`);
  return res.json();
}

export async function fetchNearEarthAsteroids(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/asteroids/near-earth`);
  if (!res.ok) throw new Error(`Failed to fetch asteroids: ${res.statusText}`);
  return res.json();
}

export async function askSpaceVerse(query: string): Promise<{
  query: string;
  answer: string;
  context_type: string;
  related_object: string;
  suggested_actions: string[];
}> {
  const res = await fetch(`${API_BASE}/assistant/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`Assistant query failed: ${res.statusText}`);
  return res.json();
}
