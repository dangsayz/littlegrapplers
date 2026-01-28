import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Location coordinates for weather lookup
const LOCATION_COORDS: Record<string, { lat: number; lon: number; timezone: string }> = {
  'lionheart-central-church': { lat: 33.0198, lon: -96.6989, timezone: 'America/Chicago' },
  'lionheart-first-baptist-plano': { lat: 33.0198, lon: -96.6989, timezone: 'America/Chicago' },
  'pinnacle-montessori': { lat: 33.0462, lon: -96.7475, timezone: 'America/Chicago' },
};

// Weather code to icon/description mapping
const WEATHER_CODES: Record<number, { icon: string; description: string }> = {
  0: { icon: 'sun', description: 'Clear sky' },
  1: { icon: 'sun', description: 'Mainly clear' },
  2: { icon: 'cloud-sun', description: 'Partly cloudy' },
  3: { icon: 'cloud', description: 'Overcast' },
  45: { icon: 'cloud-fog', description: 'Foggy' },
  48: { icon: 'cloud-fog', description: 'Depositing rime fog' },
  51: { icon: 'cloud-drizzle', description: 'Light drizzle' },
  53: { icon: 'cloud-drizzle', description: 'Moderate drizzle' },
  55: { icon: 'cloud-drizzle', description: 'Dense drizzle' },
  61: { icon: 'cloud-rain', description: 'Slight rain' },
  63: { icon: 'cloud-rain', description: 'Moderate rain' },
  65: { icon: 'cloud-rain', description: 'Heavy rain' },
  71: { icon: 'cloud-snow', description: 'Slight snow' },
  73: { icon: 'cloud-snow', description: 'Moderate snow' },
  75: { icon: 'cloud-snow', description: 'Heavy snow' },
  80: { icon: 'cloud-rain', description: 'Rain showers' },
  81: { icon: 'cloud-rain', description: 'Moderate rain showers' },
  82: { icon: 'cloud-rain', description: 'Violent rain showers' },
  95: { icon: 'cloud-lightning', description: 'Thunderstorm' },
  96: { icon: 'cloud-lightning', description: 'Thunderstorm with hail' },
  99: { icon: 'cloud-lightning', description: 'Thunderstorm with heavy hail' },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Get coordinates for this location
    const coords = LOCATION_COORDS[slug];
    if (!coords) {
      // Default to Plano, TX if location not found
      return NextResponse.json({
        temperature: null,
        description: 'Weather unavailable',
        icon: 'cloud',
        localTime: new Date().toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          timeZone: 'America/Chicago'
        }),
      });
    }

    // Fetch weather from Open-Meteo (free, no API key needed)
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=${encodeURIComponent(coords.timezone)}`;
    
    const weatherRes = await fetch(weatherUrl, { next: { revalidate: 600 } }); // Cache for 10 minutes
    
    if (!weatherRes.ok) {
      throw new Error('Weather API error');
    }

    const weatherData = await weatherRes.json();
    const current = weatherData.current;
    
    const weatherCode = current?.weather_code ?? 0;
    const weatherInfo = WEATHER_CODES[weatherCode] || WEATHER_CODES[0];
    
    // Get local time
    const localTime = new Date().toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      timeZone: coords.timezone
    });

    return NextResponse.json({
      temperature: Math.round(current?.temperature_2m || 0),
      description: weatherInfo.description,
      icon: weatherInfo.icon,
      localTime,
    });
  } catch (error) {
    console.error('Error fetching weather:', error);
    return NextResponse.json({
      temperature: null,
      description: 'Weather unavailable',
      icon: 'cloud',
      localTime: new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        timeZone: 'America/Chicago'
      }),
    });
  }
}
