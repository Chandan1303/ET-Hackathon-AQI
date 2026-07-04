import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { CloudSun } from 'lucide-react';

export default function PollutionForecast({ sensors, aqi }) {
  const pm25Base = sensors.find(s => s.id === 'SEN-STNB-PM25')?.value
    ?? sensors.find(s => s.id?.includes('PM25'))?.value
    ?? 45;

  const chartData = useMemo(() => {
    const wind = sensors.find(s => s.id === 'SEN-MET-WIND-SPD')?.value ?? 3;
    const rain = sensors.find(s => s.id === 'SEN-MET-RAIN')?.value ?? 0;
    const drift = rain > 2 ? -0.08 : wind < 2 ? 0.06 : 0.02;

    return Array.from({ length: 7 }, (_, i) => {
      const hour = i * 2;
      const projected = Math.max(10, pm25Base * (1 + drift * i) + Math.sin(i * 1.1) * 5);
      const projectedAqi = Math.round(projected * 1.15);
      return {
        label: i === 0 ? 'Now' : `+${hour}h`,
        pm25: +projected.toFixed(1),
        aqi: projectedAqi,
      };
    });
  }, [pm25Base, sensors]);

  const peak = chartData.reduce((max, p) => (p.aqi > max.aqi ? p : max), chartData[0]);
  const trend = chartData[chartData.length - 1].aqi - chartData[0].aqi;

  return (
    <div className="tab-panel overflow-visible p-5 h-full flex flex-col">
      <p className="text-[11px] font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2 leading-none">
        <CloudSun className="w-4 h-4 text-amber-500 shrink-0" /> 12-Hour Pollution Forecast
      </p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="metric-card px-3 py-2.5 flex flex-col justify-center min-h-[4.5rem]">
          <p className="text-[9px] text-gray-500 uppercase font-bold">Peak AQI</p>
          <p className="text-lg font-black text-gray-900 leading-tight">{peak.aqi}</p>
          <p className="text-[9px] text-gray-500 mt-0.5">at {peak.label}</p>
        </div>
        <div className="metric-card px-3 py-2.5 flex flex-col justify-center min-h-[4.5rem]">
          <p className="text-[9px] text-gray-500 uppercase font-bold">Trend</p>
          <p className={`text-lg font-black leading-tight ${trend > 10 ? 'text-red-600' : trend < -10 ? 'text-green-600' : 'text-amber-600'}`}>
            {trend > 0 ? '+' : ''}{trend}
          </p>
          <p className="text-[9px] text-gray-500 mt-0.5">vs now ({aqi})</p>
        </div>
      </div>

      <div className="h-44 flex-1 min-h-[11rem]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <ReferenceLine y={100} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'Moderate', fontSize: 9 }} />
            <ReferenceLine y={200} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Poor', fontSize: 9 }} />
            <Area type="monotone" dataKey="aqi" name="Projected AQI" stroke="#f59e0b" fill="url(#aqiGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="text-[10px] text-gray-500 mt-2 font-mono">
        Model uses wind speed, rainfall, and current PM2.5 baseline. For planning only.
      </p>
    </div>
  );
}
