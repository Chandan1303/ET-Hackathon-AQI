import { useState, useEffect } from 'react';
import { Globe, RefreshCw, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { fetchCityAirQuality, getAQIInfo } from '../services/airQualityAPI';

export default function CityComparison({ cities, defaultCity }) {
  const [selectedCities, setSelectedCities] = useState([defaultCity, 'Beijing', 'London'].filter((v, i, a) => a.indexOf(v) === i));
  const [cityData, setCityData] = useState({});
  const [loading, setLoading] = useState(false);

  const loadComparison = async () => {
    setLoading(true);
    const results = {};
    await Promise.all(
      selectedCities.map(async (cityName) => {
        const config = cities[cityName];
        if (!config) return;
        const stations = await fetchCityAirQuality(cityName, config.center);
        const avgAqi = Math.round(stations.reduce((a, s) => a + s.aqi, 0) / stations.length);
        const avgPm25 = Math.round(stations.reduce((a, s) => a + s.pm25, 0) / stations.length);
        const worst = stations.reduce((w, s) => (s.aqi > w.aqi ? s : w), stations[0]);
        results[cityName] = { avgAqi, avgPm25, stations: stations.length, worst, aqiInfo: getAQIInfo(avgAqi) };
      })
    );
    setCityData(results);
    setLoading(false);
  };

  useEffect(() => {
    loadComparison();
  }, [selectedCities.join(',')]);

  const sorted = Object.entries(cityData).sort(([, a], [, b]) => a.avgAqi - b.avgAqi);
  const bestAqi = sorted[0]?.[1]?.avgAqi;

  const updateCity = (index, value) => {
    setSelectedCities(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  return (
    <div className="flex-1 flex flex-col gap-6 overflow-y-auto">
      <div className="hero-card p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Global City Comparison</h2>
              <p className="text-xs text-gray-500">Compare air quality across up to 3 cities side-by-side</p>
            </div>
          </div>
          <button onClick={loadComparison} disabled={loading} className="btn-modern flex items-center gap-2 self-start">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[0, 1, 2].map(i => (
            <div key={i} className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">City {i + 1}</label>
              <select
                value={selectedCities[i] || ''}
                onChange={(e) => updateCity(i, e.target.value)}
                className="w-full"
              >
                {Object.keys(cities).map(c => (
                  <option key={c} value={c}>{cities[c].name}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="loading-spinner" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {sorted.map(([cityName, data], rank) => {
              const isBest = data.avgAqi === bestAqi;
              const TrendIcon = isBest ? ArrowDown : data.avgAqi > bestAqi + 30 ? ArrowUp : Minus;
              return (
                <div
                  key={cityName}
                  className={`metric-card p-5 relative overflow-hidden ${isBest ? 'ring-2 ring-green-500' : ''}`}
                >
                  {isBest && (
                    <span className="absolute top-3 right-3 chip chip-good text-[9px]">Cleanest</span>
                  )}
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{cities[cityName]?.name || cityName}</p>
                  <div className="flex items-end gap-2 mb-4">
                    <span className="text-5xl font-black" style={{ color: data.aqiInfo.color }}>{data.avgAqi}</span>
                    <span className="text-sm font-semibold text-gray-500 mb-2">AQI</span>
                    <TrendIcon className={`w-5 h-5 mb-2 ${isBest ? 'text-green-500' : 'text-gray-400'}`} />
                  </div>
                  <p className="text-sm font-semibold mb-3" style={{ color: data.aqiInfo.color }}>{data.aqiInfo.level}</p>
                  <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>Avg PM2.5</span>
                      <span className="font-bold text-gray-900 dark:text-gray-100">{data.avgPm25} µg/m³</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monitoring Zones</span>
                      <span className="font-bold">{data.stations}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Worst Zone</span>
                      <span className="font-bold text-red-600">{data.worst?.aqi} AQI</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Global Rank</span>
                      <span className="font-bold text-indigo-600">#{rank + 1}</span>
                    </div>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, (data.avgAqi / 300) * 100)}%`, backgroundColor: data.aqiInfo.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
