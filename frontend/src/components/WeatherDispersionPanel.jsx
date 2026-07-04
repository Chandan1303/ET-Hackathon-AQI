import { Wind, Thermometer, Droplets, Compass, CloudRain } from 'lucide-react';

function getDispersionRisk(windSpeed, pm25) {
  if (windSpeed >= 4) return { level: 'Good', color: 'text-green-600', note: 'Strong wind aids pollutant dispersion.' };
  if (windSpeed >= 2) return { level: 'Moderate', color: 'text-amber-600', note: 'Moderate mixing — monitor stagnant zones.' };
  if (pm25 > 100) return { level: 'Poor', color: 'text-red-600', note: 'Low wind + high PM2.5 — pollution may accumulate.' };
  return { level: 'Fair', color: 'text-amber-600', note: 'Light winds — limited horizontal dispersion.' };
}

export default function WeatherDispersionPanel({ sensors }) {
  const temp = sensors.find(s => s.id === 'SEN-MET-TEMP');
  const humid = sensors.find(s => s.id === 'SEN-MET-HUMID');
  const windSpd = sensors.find(s => s.id === 'SEN-MET-WIND-SPD');
  const windDir = sensors.find(s => s.id === 'SEN-MET-WIND-DIR');
  const rain = sensors.find(s => s.id === 'SEN-MET-RAIN');
  const pm25 = sensors.find(s => s.id?.includes('PM25'));

  const risk = getDispersionRisk(windSpd?.value ?? 0, pm25?.value ?? 0);

  const cards = [
    { icon: Thermometer, label: 'Temperature', value: temp ? `${temp.value} ${temp.unit}` : '—', color: 'text-red-500' },
    { icon: Droplets, label: 'Humidity', value: humid ? `${humid.value}${humid.unit}` : '—', color: 'text-blue-500' },
    { icon: Wind, label: 'Wind Speed', value: windSpd ? `${windSpd.value} ${windSpd.unit}` : '—', color: 'text-teal-500' },
    { icon: Compass, label: 'Wind Direction', value: windDir ? `${windDir.value}°` : '—', color: 'text-indigo-500' },
  ];

  return (
    <div className="tab-panel overflow-visible p-5 h-full flex flex-col">
      <p className="text-[11px] font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2 leading-none">
        <Wind className="w-4 h-4 text-teal-600 shrink-0" /> Weather &amp; Dispersion
      </p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {cards.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="metric-card p-3 min-h-[4.75rem] flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] text-gray-500 uppercase font-bold leading-tight">{label}</p>
              <p className="text-sm font-bold text-gray-900 leading-tight mt-0.5 truncate">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {rain && (
        <div className="flex items-center gap-2 px-1 py-2 mb-3 border-t border-gray-200">
          <CloudRain className="w-4 h-4 text-blue-500 shrink-0" />
          <p className="text-xs text-gray-600">
            Rainfall: <span className="font-bold text-gray-900">{rain.value} {rain.unit}</span>
            {rain.value > 5 && <span className="text-gray-500"> — Wet deposition may reduce particulate levels.</span>}
          </p>
        </div>
      )}

      <div className="mt-auto p-3.5 bg-teal-50 border border-teal-200 rounded-xl">
        <p className="text-[10px] font-bold text-teal-700 uppercase tracking-wide mb-1">
          Dispersion Risk: <span className={risk.color}>{risk.level}</span>
        </p>
        <p className="text-xs text-gray-700 leading-relaxed">{risk.note}</p>
      </div>
    </div>
  );
}
