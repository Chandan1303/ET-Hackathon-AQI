import { ShieldAlert, ChevronRight } from 'lucide-react';
import { getGrapStage, GRAP_STAGES } from '../utils/grapCalculator.js';

export default function GrapStagePanel({ aqi, cityName }) {
  const grap = getGrapStage(aqi);

  return (
    <div className="tab-panel overflow-visible p-5 h-full flex flex-col">
      <p className="text-[11px] font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2 leading-none">
        <ShieldAlert className="w-4 h-4 text-orange-600 shrink-0" /> GRAP Response Stage
      </p>

      <div className="flex items-center gap-4 mb-4">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shrink-0"
          style={{ background: grap.color }}
        >
          {grap.stage === 0 ? '✓' : `S${grap.stage}`}
        </div>
        <div className="min-w-0">
          <p className="text-lg font-bold text-gray-900 leading-tight">{grap.label}</p>
          <p className="text-xs text-gray-600 mt-0.5">{cityName} · Current AQI {aqi}</p>
        </div>
      </div>

      <div className="h-2 bg-gray-200 rounded-full mb-3 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.max(8, grap.progress)}%`, background: grap.color }}
        />
      </div>

      <div className="flex gap-1.5 mb-5">
        {GRAP_STAGES.filter(s => s.stage > 0).map(s => (
          <div
            key={s.stage}
            className={`flex-1 h-1.5 rounded-full ${aqi >= s.aqiMin ? 'opacity-100' : 'opacity-25'}`}
            style={{ background: s.color }}
            title={s.label}
          />
        ))}
      </div>

      <div className="mt-auto border-t border-gray-200 pt-4">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-3">Required Actions</p>
        <ul className="space-y-2.5">
          {grap.actions.map((action, i) => (
            <li key={i} className="flex items-start gap-2.5 text-xs text-gray-700 leading-relaxed">
              <ChevronRight className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
              <span>{action}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
