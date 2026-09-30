export interface Coordinates3D {
  x: number;
  y: number;
  z: number;
}

export interface PlanetCoordinates {
  heliocentric_au: Coordinates3D;
  three_js: Coordinates3D;
}

export interface OrbitalTrailPoint {
  x: number;
  y: number;
  z: number;
}

export interface MoonInfo {
  geocentric_x_au: number;
  geocentric_y_au: number;
  geocentric_z_au: number;
  three_rel_x: number;
  three_rel_y: number;
  three_rel_z: number;
  distance_km: number;
  distance_au: number;
  illumination: number;
  phase_name: string;
  elongation_deg: number;
}

export interface GalileanMoon {
  name: string;
  desc: string;
  color: string;
  period_days: number;
  rel_x: number;
  rel_y: number;
  rel_z: number;
}

export interface Planet {
  id: string;
  name: string;
  color: string;
  radius_km: number;
  visual_scale: number;
  has_rings?: boolean;
  description: string;
  atmosphere: string;
  orbit_period_days: number;
  moons_count: number;
  coordinates: PlanetCoordinates;
  distance_from_sun_au: number;
  distance_from_sun_million_km: number;
  distance_from_earth_au: number;
  distance_from_earth_million_km: number;
  apparent_magnitude: number;
  speed_km_s: number;
  light_travel_minutes: number;
  orbital_trail: OrbitalTrailPoint[];
  major_moons?: GalileanMoon[];
}

export interface SunData {
  id: string;
  name: string;
  color: string;
  radius_km: number;
  visual_scale: number;
  description: string;
  coordinates: {
    heliocentric_au: Coordinates3D;
    three_js: Coordinates3D;
  };
  distance_from_earth_million_km: number;
  surface_temp_k: number;
}

export interface SolarSystemState {
  timestamp_utc: string;
  julian_day: number;
  epoch: string;
  sun: SunData;
  earth: Planet;
  moon: MoonInfo;
  planets: Record<string, Planet>;
  disclosure: string;
}

export interface AstronomicalEvent {
  id: string;
  title: string;
  category: 'eclipse' | 'meteors' | 'planets' | 'asteroids' | 'solar';
  type: string;
  date: string;
  start_time_utc: string;
  peak_time_utc: string;
  end_time_utc: string;
  importance: string;
  highlight: boolean;
  summary: string;
  scientific_significance: string;
  best_visibility: {
    primary_regions: string[];
    totality_duration_seconds?: number;
    path_width_km?: number;
    magnitude?: number;
    radiant?: string;
    zhr?: number;
    speed_km_s?: number;
    closest_distance_km?: number;
    apparent_magnitude?: number;
    constellation?: string;
    geomagnetic_kp?: number;
    partial_visibility?: string[];
  };
  spatial_anchor: {
    target: string;
    three_position: Coordinates3D;
    sun_moon_earth_angle_deg?: number;
  };
  simulation_type: 'solar_eclipse' | 'lunar_eclipse' | 'planetary_conjunction' | 'meteor_shower' | 'asteroid_approach' | 'solar_flare';
  safety_notes: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  source_url: string;
  published_at: string;
  organization: string;
  category: string;
  tags: string[];
  image_url: string;
}

export interface SpaceMission {
  id: string;
  name: string;
  agency: string;
  type: string;
  target: string;
  launch_vehicle: string;
  status: string;
  launch_window: string;
  crew?: string[];
  description: string;
  official_url: string;
}

export interface SpaceWeather {
  timestamp_utc: string;
  solar_cycle: number;
  solar_cycle_phase: string;
  geomagnetic_k_index: number;
  geomagnetic_storm_level: string;
  solar_wind: {
    speed_km_s: number;
    density_p_cm3: number;
    magnetic_field_bt_nt: number;
    magnetic_field_bz_nt: number;
    temperature_k: number;
  };
  solar_flares_recent: Array<{
    id: string;
    class: string;
    peak_time_utc: string;
    active_region: string;
    cme_associated: boolean | string;
    earth_directed: boolean | string;
    radio_blackout: string;
  }>;
  aurora_forecast: {
    probability_high_latitudes: string;
    probability_mid_latitudes: string;
    visible_geomagnetic_latitude_cutoff: string;
    prime_observation_zones: string[];
    advice: string;
  };
  sunspot_number: number;
  source: string;
  data_status: string;
  last_updated: string;
}

export interface SkyTarget {
  id: string;
  name: string;
  type: string;
  altitude_deg: number;
  azimuth_deg: number;
  cardinal_direction: string;
  is_visible: boolean;
  apparent_magnitude: number;
  status?: string;
  quality?: string;
  observation_advice: string;
  illumination_percent?: number;
  phase_name?: string;
}

export interface SkyTonightData {
  observer_location: {
    latitude: number;
    longitude: number;
  };
  calculated_at_utc: string;
  local_sidereal_time_hours: number;
  moon_phase: string;
  moon_illumination: number;
  targets: SkyTarget[];
  meteor_outlook: {
    active_shower: string;
    expected_rate: string;
    best_viewing_window: string;
  };
  popular_locations: Array<{
    name: string;
    lat: number;
    lon: number;
    tz: string;
  }>;
}

export interface ISSTelemetry {
  timestamp_utc: string;
  latitude: number;
  longitude: number;
  altitude_km: number;
  velocity_km_h: number;
  orbital_period_minutes: number;
  expedition: string;
  current_crew: Array<{
    name: string;
    role: string;
  }>;
  status: string;
}
