import React, { useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Circle } from '@react-google-maps/api';
import { Activity, AlertTriangle, CheckCircle, Shield, Droplets } from 'lucide-react';
import { getStationAqi, getAqiColor, getStationCircleRadius } from '../services/airQualityAPI.js';

const libraries = [];

const AirQualityMap = ({
  city,
  stations,
  zones,
  heatmapData,
  onStationClick,
  mapLayer = 'roadmap'
}) => {
  const [selectedStation, setSelectedStation] = useState(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries
  });

  const mapContainerStyle = {
    width: '100%',
    height: '100%'
  };

  const mapOptions = {
    mapTypeId: mapLayer,
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: true,
    scaleControl: true,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: true,
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ]
  };

  const getMarkerIcon = (station) => {
    const value = getStationAqi(station);
    const color = getAqiColor(value);
    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="18" fill="${color}" stroke="white" stroke-width="3" opacity="0.9"/>
          <text x="24" y="28" font-size="12" font-weight="bold" fill="white" text-anchor="middle">${Math.round(value)}</text>
        </svg>
      `)}`,
      scaledSize: { width: 48, height: 48 },
      anchor: { x: 24, y: 24 }
    };
  };

  const getZoneStats = () => {
    if (!stations || stations.length === 0) return { safe: 0, moderate: 0, unhealthy: 0, hazardous: 0 };

    const stats = { safe: 0, moderate: 0, unhealthy: 0, hazardous: 0 };
    stations.forEach(station => {
      const aqi = getStationAqi(station);
      if (aqi <= 50) stats.safe++;
      else if (aqi <= 100) stats.moderate++;
      else if (aqi <= 200) stats.unhealthy++;
      else stats.hazardous++;
    });
    return stats;
  };

  const zoneStats = getZoneStats();

  const alertZoneIndices = new Set(
    (zones || []).map((z, i) => (z.alert ? i : -1)).filter(i => i >= 0)
  );

  if (loadError) {
    console.warn('Google Maps failed to load, using Leaflet fallback:', loadError);
    return null;
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <Activity className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-white font-bold">Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        key={city.name}
        mapContainerStyle={mapContainerStyle}
        center={city.center}
        zoom={city.zoom}
        options={mapOptions}
      >
        {/* One non-overlapping AQI circle per station */}
        {stations?.map((station, idx) => {
          const aqi = getStationAqi(station);
          const color = getAqiColor(aqi);
          const radius = getStationCircleRadius(station, stations);
          const hasAlert = alertZoneIndices.has(idx);
          return (
            <Circle
              key={`aqi-ring-${station.id}`}
              center={{ lat: station.lat, lng: station.lng }}
              radius={radius}
              options={{
                strokeColor: hasAlert ? '#ef4444' : color,
                strokeOpacity: 0.9,
                strokeWeight: hasAlert ? 3 : 2,
                fillColor: hasAlert ? '#ef4444' : color,
                fillOpacity: 0.22,
                clickable: false,
              }}
            />
          );
        })}

        {stations?.map((station) => (
          <Marker
            key={station.id}
            position={{ lat: station.lat, lng: station.lng }}
            icon={getMarkerIcon(station)}
            onClick={() => setSelectedStation(station)}
          />
        ))}

        {selectedStation && (
          <InfoWindow
            position={{ lat: selectedStation.lat, lng: selectedStation.lng }}
            onCloseClick={() => setSelectedStation(null)}
          >
            <div className="p-3 min-w-[260px]">
              <h3 className="font-bold text-slate-900 mb-2 text-sm flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-500" />
                {selectedStation.name}
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                  <span className="text-slate-600 font-medium">AQI Level:</span>
                  <span className={`font-bold px-2 py-1 rounded ${
                    selectedStation.aqi > 200 ? 'bg-red-600 text-white' :
                    selectedStation.aqi > 150 ? 'bg-red-500 text-white' :
                    selectedStation.aqi > 100 ? 'bg-amber-500 text-white' :
                    selectedStation.aqi > 50 ? 'bg-yellow-500 text-slate-900' :
                    'bg-emerald-500 text-white'
                  }`}>
                    {selectedStation.aqi}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">PM2.5:</span>
                  <span className={`font-bold ${selectedStation.pm25 > 150 ? 'text-red-600' : selectedStation.pm25 > 100 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {selectedStation.pm25?.toFixed(1)} µg/m³
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">PM10:</span>
                  <span className="font-bold text-slate-900">{selectedStation.pm10?.toFixed(1)} µg/m³</span>
                </div>
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-200">
                  <span className="text-slate-600">Status:</span>
                  <span className={`font-bold flex items-center gap-1 ${
                    selectedStation.status === 'Good' ? 'text-emerald-600' :
                    selectedStation.status === 'Moderate' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {selectedStation.status === 'Good' ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    {selectedStation.status}
                  </span>
                </div>
              </div>
              {onStationClick && (
                <button
                  onClick={() => onStationClick(selectedStation)}
                  className="w-full mt-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-xs font-bold py-2 px-3 rounded-lg transition-all shadow-sm hover:shadow-md"
                >
                  View Details
                </button>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      <div className="absolute top-4 right-4 bg-white rounded-xl shadow-xl border border-gray-200 p-4 max-w-[280px] z-10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-500" />
            AQI Monitoring
          </h3>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-6 h-6 rounded bg-emerald-500 border-2 border-white shadow-sm"></div>
            <span className="flex-1 font-medium text-slate-700">Good (0-50)</span>
            <span className="font-bold text-emerald-600">{zoneStats.safe}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-6 h-6 rounded bg-yellow-500 border-2 border-white shadow-sm"></div>
            <span className="flex-1 font-medium text-slate-700">Moderate (51-100)</span>
            <span className="font-bold text-yellow-600">{zoneStats.moderate}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-6 h-6 rounded bg-amber-500 border-2 border-white shadow-sm"></div>
            <span className="flex-1 font-medium text-slate-700">Unhealthy (101-200)</span>
            <span className="font-bold text-amber-600">{zoneStats.unhealthy}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-6 h-6 rounded bg-red-600 border-2 border-white shadow-sm"></div>
            <span className="flex-1 font-medium text-slate-700">Hazardous (200+)</span>
            <span className="font-bold text-red-600">{zoneStats.hazardous}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-200">
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-slate-600">Monitoring Stations:</span>
            <span className="font-bold text-slate-900">{stations?.length || 0}</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1.5">One AQI zone per station — sized to avoid overlap</p>
        </div>
      </div>
    </div>
  );
};

export default AirQualityMap;
