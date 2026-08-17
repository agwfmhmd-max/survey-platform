// lib/weather/openMeteo.ts
// Thin service layer around the free, keyless Open-Meteo API.
// No API key required and none should ever be added here.
// https://open-meteo.com/en/docs

import { supabase } from "../supabaseClient";

export interface WeatherLocation {
  id: string;
  wilaya: string;
  location_name: string;
  latitude: number;
  longitude: number;
}

const BASE_URL = "https://api.open-meteo.com/v1/forecast";
const ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive";

const DAILY_VARS = [
  "temperature_2m_max",
  "temperature_2m_min",
  "precipitation_sum",
  "rain_sum",
  "wind_speed_10m_max",
  "weathercode",
].join(",");

const CURRENT_VARS = [
  "temperature_2m",
  "relative_humidity_2m",
  "precipitation",
  "rain",
  "wind_speed_10m",
  "weathercode",
].join(",");

/** Live conditions for one location. */
export async function getCurrentWeather(loc: WeatherLocation) {
  const url = `${BASE_URL}?latitude=${loc.latitude}&longitude=${loc.longitude}&current=${CURRENT_VARS}&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo current weather failed: ${res.status}`);
  return res.json();
}

/** Daily forecast (default 7 days) for one location. */
export async function getDailyWeather(loc: WeatherLocation, days = 7) {
  const url = `${BASE_URL}?latitude=${loc.latitude}&longitude=${loc.longitude}&daily=${DAILY_VARS}&forecast_days=${days}&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo daily weather failed: ${res.status}`);
  return res.json();
}

/** Historical daily weather between two ISO dates (YYYY-MM-DD), via the archive endpoint. */
export async function getHistoricalWeather(loc: WeatherLocation, startDate: string, endDate: string) {
  const url = `${ARCHIVE_URL}?latitude=${loc.latitude}&longitude=${loc.longitude}&start_date=${startDate}&end_date=${endDate}&daily=${DAILY_VARS}&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo archive weather failed: ${res.status}`);
  return res.json();
}

/**
 * Fetch daily weather and upsert it into the weather_data cache table so
 * repeated page loads don't re-hit Open-Meteo. Requires an authenticated
 * admin session (RLS restricts writes to admins).
 */
export async function cacheDailyWeather(loc: WeatherLocation, days = 7) {
  const json = await getDailyWeather(loc, days);
  const { time, temperature_2m_max, temperature_2m_min, precipitation_sum, rain_sum, wind_speed_10m_max, weathercode } = json.daily;

  const rows = time.map((observed_date: string, i: number) => ({
    location_id: loc.id,
    observed_date,
    temperature_max: temperature_2m_max?.[i] ?? null,
    temperature_min: temperature_2m_min?.[i] ?? null,
    precipitation: precipitation_sum?.[i] ?? null,
    rain: rain_sum?.[i] ?? null,
    wind_speed: wind_speed_10m_max?.[i] ?? null,
    weather_code: weathercode?.[i] ?? null,
    raw: json,
  }));

  const { error } = await supabase
    .from("weather_data")
    .upsert(rows, { onConflict: "location_id,observed_date" });
  if (error) throw error;
  return rows;
}

/** Read cached weather for a location from Supabase (fast path, no external call). */
export async function getCachedWeather(locationId: string, fromDate: string, toDate: string) {
  const { data, error } = await supabase
    .from("weather_data")
    .select("*")
    .eq("location_id", locationId)
    .gte("observed_date", fromDate)
    .lte("observed_date", toDate)
    .order("observed_date", { ascending: true });
  if (error) throw error;
  return data;
}

export async function listActiveLocations(): Promise<WeatherLocation[]> {
  const { data, error } = await supabase
    .from("weather_locations")
    .select("id, wilaya, location_name, latitude, longitude")
    .eq("active", true)
    .order("wilaya");
  if (error) throw error;
  return data || [];
}
