/**
 * Services for fetching city-specific air quality stations and heatmap projections.
 */

// EPA-inspired AQI breakpoints from PM2.5 (µg/m³)
export function calculateAQIFromPM25(pm25) {
  const c = Number(pm25) || 0;
  if (c <= 12) return Math.round((50 / 12) * c);
  if (c <= 35.4) return Math.round(((100 - 51) / (35.4 - 12.1)) * (c - 12.1) + 51);
  if (c <= 55.4) return Math.round(((150 - 101) / (55.4 - 35.5)) * (c - 35.5) + 101);
  if (c <= 150.4) return Math.round(((200 - 151) / (150.4 - 55.5)) * (c - 55.5) + 151);
  if (c <= 250.4) return Math.round(((300 - 201) / (250.4 - 150.5)) * (c - 150.5) + 201);
  return Math.min(500, Math.round(((500 - 301) / (500.4 - 250.5)) * (c - 250.5) + 301));
}

export function getStationAqi(station) {
  if (!station) return 0;
  if (station.aqi != null && !Number.isNaN(station.aqi)) return Math.round(station.aqi);
  if (station.pm25 != null) return calculateAQIFromPM25(station.pm25);
  return 0;
}

export function getAqiColor(aqi) {
  if (aqi > 200) return '#7c2d12';
  if (aqi > 150) return '#ef4444';
  if (aqi > 100) return '#f59e0b';
  if (aqi > 50) return '#fbbf24';
  return '#10b981';
}

export function getAqiStatus(aqi) {
  if (aqi > 200) return 'Hazardous';
  if (aqi > 150) return 'Very Unhealthy';
  if (aqi > 100) return 'Unhealthy';
  if (aqi > 50) return 'Moderate';
  return 'Good';
}

export function aqiToIntensity(aqi) {
  return Math.min(1, Math.max(0.08, aqi / 300));
}

/** Non-overlapping circle radius (meters) based on nearest station distance */
export function getStationCircleRadius(station, allStations) {
  if (!station || !allStations?.length) return 1000;

  let minDistM = Infinity;
  const latRad = (station.lat * Math.PI) / 180;

  for (const other of allStations) {
    if (other.id === station.id) continue;
    const dLat = station.lat - other.lat;
    const dLng = (station.lng - other.lng) * Math.cos(latRad);
    const distDeg = Math.sqrt(dLat * dLat + dLng * dLng);
    if (distDeg > 0) {
      minDistM = Math.min(minDistM, distDeg * 111320);
    }
  }

  if (!Number.isFinite(minDistM)) return 1000;
  // Each circle uses ~42% of nearest-neighbor distance so rings don't overlap
  return Math.round(Math.min(1100, Math.max(550, minDistM * 0.42)));
}

export const STATION_ZONE_MAP = {
  'STN-A': 'Downtown',
  'STN-B': 'Industrial',
  'STN-C': 'Residential',
  'STN-D': 'Airport',
};

export const WORKER_ZONE_MAP = {
  'Zone A (Commercial Center)': 'Downtown',
  'Zone B (Industrial Area)': 'Industrial',
  'Zone C (Residential District)': 'Residential',
  'Zone D (Coastal Greenbelt)': 'Airport',
};

export function getEquipmentZoneCoords(tag, cityZones) {
  const key = STATION_ZONE_MAP[tag];
  return key && cityZones?.[key] ? cityZones[key] : null;
}

// Classifies AQI values into human-readable levels and colors
export function getAQIInfo(aqi) {
  if (aqi <= 50) {
    return { level: 'Good', color: '#10b981', desc: 'Minimal impact' };
  } else if (aqi <= 100) {
    return { level: 'Moderate', color: '#fbbf24', desc: 'Acceptable quality' };
  } else if (aqi <= 150) {
    return { level: 'Unhealthy for Sensitive Groups', color: '#f59e0b', desc: 'Minor health effects' };
  } else if (aqi <= 200) {
    return { level: 'Unhealthy', color: '#ef4444', desc: 'Active respiratory risk' };
  } else if (aqi <= 300) {
    return { level: 'Very Unhealthy', color: '#7c2d12', desc: 'Significant hazard' };
  } else {
    return { level: 'Hazardous', color: '#450a0a', desc: 'Severe emergency alert' };
  }
}

function cityVariation(cityName) {
  let hash = 0;
  for (let i = 0; i < cityName.length; i++) {
    hash = ((hash << 5) - hash) + cityName.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(Math.sin(hash)) * 16) - 8;
}

// Simulates monitoring stations surrounding a selected city center coordinate
export async function fetchCityAirQuality(cityName, center) {
  const [lat, lng] = center;
  const variation = cityVariation(cityName);

  const stationOffsets = [
    { name: 'City Center (Commercial)', latOffset: 0.011, lngOffset: -0.006, baseAQI: 90 },
    { name: 'Industrial Sector (East)', latOffset: -0.028, lngOffset: 0.041, baseAQI: 165 },
    { name: 'Residential District (West)', latOffset: 0.026, lngOffset: -0.039, baseAQI: 55 },
    { name: 'Greenbelt Zone (South)', latOffset: -0.014, lngOffset: 0.066, baseAQI: 35 },
  ];

  return stationOffsets.map((offset, idx) => {
    const varSeed = Math.sin(idx + cityName.length * 0.7);
    const aqi = Math.max(15, Math.round(offset.baseAQI + variation + varSeed * 8));
    const pm25 = Math.max(5, Math.round(aqi * 0.55));
    const pm10 = Math.max(10, Math.round(aqi * 0.95));

    let status = 'Good';
    if (aqi > 150) status = 'Poor';
    else if (aqi > 100) status = 'Moderate';

    return {
      id: `STN-${cityName.substring(0, 3).toUpperCase()}-${idx + 1}`,
      name: `${cityName} - ${offset.name}`,
      lat: lat + offset.latOffset,
      lng: lng + offset.lngOffset,
      aqi,
      pm25,
      pm10,
      no2: Math.round(aqi * 0.3 + varSeed * 5),
      co: +(aqi * 0.01).toFixed(2),
      o3: Math.round(aqi * 0.25),
      status,
      source: 'Urban Eco OS Simulation',
      updatedAt: new Date().toISOString(),
    };
  });
}

// Overlay live backend sensor readings onto each city's 4 map stations
export function mergeBackendSensors(stations, sensors, cityName) {
  if (!stations?.length || !sensors?.length) {
    return stations;
  }

  const zoneTags = ['STN-A', 'STN-B', 'STN-C', 'STN-D'];
  return stations.map((station, idx) => {
    const tag = zoneTags[idx];
    if (!tag) return station;

    const sensorTag = tag.replace('-', '');
    const pm25 = sensors.find(s => s.id === `SEN-${sensorTag}-PM25`);
    const pm10 = sensors.find(s => s.id === `SEN-${sensorTag}-PM10`);
    const no2 = sensors.find(s => s.id === `SEN-${sensorTag}-NO2`);
    if (!pm25) return station;

    const aqi = calculateAQIFromPM25(pm25.value);
    let status = 'Good';
    if (aqi > 150) status = 'Poor';
    else if (aqi > 100) status = 'Moderate';

    const isLiveCity = cityName === 'New Delhi';

    return {
      ...station,
      id: isLiveCity ? tag : station.id,
      name: station.name,
      aqi,
      pm25: pm25.value,
      pm10: pm10?.value ?? station.pm10,
      no2: no2?.value ?? station.no2,
      status,
      source: isLiveCity ? 'Live Backend Sensors (SSE)' : `Live Simulation Overlay · ${cityName}`,
      updatedAt: pm25.timestamp || new Date().toISOString(),
    };
  });
}

// Generates heatmap grid with AQI-interpolated values for circle coloring
export function generateHeatmapData(stations, cityConfig) {
  if (!stations || stations.length === 0) return [];

  const [centerLat, centerLng] = cityConfig.center;
  const points = [];

  for (let latOffset = -0.05; latOffset <= 0.05; latOffset += 0.015) {
    for (let lngOffset = -0.05; lngOffset <= 0.05; lngOffset += 0.015) {
      const pointLat = centerLat + latOffset;
      const pointLng = centerLng + lngOffset;

      let weightedAqi = 0;
      let totalWeight = 0;

      stations.forEach(station => {
        const dLat = pointLat - station.lat;
        const dLng = pointLng - station.lng;
        const distSq = dLat * dLat + dLng * dLng;
        const weight = 1 / (distSq + 0.00001);
        weightedAqi += getStationAqi(station) * weight;
        totalWeight += weight;
      });

      const aqi = Math.round(weightedAqi / totalWeight);
      const intensity = aqiToIntensity(aqi);

      points.push({
        lat: pointLat,
        lng: pointLng,
        aqi,
        intensity: parseFloat(intensity.toFixed(2)),
      });
    }
  }

  return points;
}
