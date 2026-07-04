import { Heart, Shield, Activity, Wind, Eye } from 'lucide-react';

const ADVISORIES = [
  { max: 50, level: 'Good', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800', icon: Heart, tips: ['Ideal for outdoor activities', 'No health precautions needed', 'Ventilation recommended indoors'] },
  { max: 100, level: 'Moderate', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800', icon: Activity, tips: ['Sensitive groups should limit prolonged outdoor exertion', 'Keep windows closed during peak traffic hours', 'Use air purifiers if available'] },
  { max: 150, level: 'Unhealthy for Sensitive', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800', icon: Wind, tips: ['Children and elderly should avoid outdoor activities', 'Wear N95 masks outdoors', 'Run HVAC on recirculation mode'] },
  { max: 200, level: 'Unhealthy', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800', icon: Shield, tips: ['Everyone should reduce outdoor exposure', 'Schools may consider indoor recess', 'Avoid strenuous exercise outdoors'] },
  { max: 999, level: 'Hazardous', color: 'text-rose-700', bg: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800', icon: Eye, tips: ['Stay indoors with windows sealed', 'Use N95/KN95 masks if going outside', 'Activate emergency response protocols'] },
];

export default function HealthAdvisory({ aqi, cityName }) {
  const advisory = ADVISORIES.find(a => aqi <= a.max) || ADVISORIES[ADVISORIES.length - 1];
  const Icon = advisory.icon;

  return (
    <div className={`hero-card p-4 border ${advisory.bg} fade-in`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${advisory.bg}`}>
          <Icon className={`w-5 h-5 ${advisory.color}`} />
        </div>
        <div>
          <p className="chrome-label-small">Health Advisory</p>
          <p className={`text-sm font-bold ${advisory.color}`}>{advisory.level} — AQI {aqi}</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">{cityName}</p>
        </div>
      </div>
      <ul className="space-y-1.5">
        {advisory.tips.map((tip, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
            <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${advisory.color.replace('text-', 'bg-')}`} />
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}
