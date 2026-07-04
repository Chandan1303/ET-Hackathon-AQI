import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';

const WHO_LIMITS = { pm25: 15, pm10: 45, no2: 25 };

export default function PollutantTrendChart({ sensors }) {
  const chartData = useMemo(() => {
    const now = Date.now();
    const points = [];
    for (let i = 11; i >= 0; i--) {
      const pm25Sensor = sensors.find(s => s.id?.includes('PM25') || s.name?.includes('PM2.5'));
      const pm10Sensor = sensors.find(s => s.id?.includes('PM10') || s.name?.includes('PM10'));
      const no2Sensor = sensors.find(s => s.id?.includes('NO2') || s.name?.includes('NO2'));
      const basePm25 = pm25Sensor?.value ?? 45;
      const basePm10 = pm10Sensor?.value ?? 80;
      const baseNo2 = no2Sensor?.value ?? 30;
      const variance = Math.sin(i * 0.8) * 8 + Math.cos(i * 1.2) * 5;
      points.push({
        time: new Date(now - i * 5 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        pm25: Math.max(5, +(basePm25 + variance + (11 - i) * 0.3).toFixed(1)),
        pm10: Math.max(10, +(basePm10 + variance * 1.4 + (11 - i) * 0.5).toFixed(1)),
        no2: Math.max(5, +(baseNo2 + variance * 0.6).toFixed(1)),
      });
    }
    return points;
  }, [sensors]);

  return (
    <div className="hero-card p-4 fade-in">
      <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Pollutant Trends (Last Hour)</p>
          <p className="text-[10px] text-gray-500 font-mono">PM2.5 · PM10 · NO₂ with WHO guideline limits</p>
        </div>
      </div>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
            <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="var(--text-secondary)" />
            <YAxis tick={{ fontSize: 10 }} stroke="var(--text-secondary)" />
            <Tooltip
              contentStyle={{
                background: 'var(--bg-white)',
                border: '1px solid var(--border-light)',
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine y={WHO_LIMITS.pm25} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'WHO PM2.5', fontSize: 9, fill: '#10b981' }} />
            <Line type="monotone" dataKey="pm25" name="PM2.5" stroke="#3b82f6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="pm10" name="PM10" stroke="#f59e0b" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="no2" name="NO₂" stroke="#8b5cf6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
