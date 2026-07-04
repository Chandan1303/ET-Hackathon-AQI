import { Radio, AlertTriangle, CheckCircle } from 'lucide-react';

const ZONE_TAGS = ['STN-A', 'STN-B', 'STN-C', 'STN-D'];

export default function StationScorecard({ equipment, sensors }) {
  return (
    <div className="tab-panel overflow-visible p-5 h-full flex flex-col">
      <p className="text-[11px] font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2 leading-none">
        <Radio className="w-4 h-4 text-blue-600 shrink-0" /> Station Health Scorecard
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
        {ZONE_TAGS.map(tag => {
          const eq = equipment.find(e => e.tag === tag);
          if (!eq) return null;

          const sensorTag = tag.replace('-', '');
          const pm25 = sensors.find(s => s.id === `SEN-${sensorTag}-PM25`);
          const pm10 = sensors.find(s => s.id === `SEN-${sensorTag}-PM10`);
          const isWarning = eq.status === 'Warning' || pm25?.status === 'Warning';

          return (
            <div
              key={tag}
              className={`metric-card p-4 border-l-4 ${isWarning ? 'border-amber-500' : 'border-green-500'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-xs font-bold text-teal-600">{tag}</p>
                  <p className="text-[11px] text-gray-700 font-medium leading-tight">{eq.name}</p>
                </div>
                {isWarning ? (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
              </div>

              <div className="flex items-end justify-between mt-3">
                <div>
                  <p className="text-[9px] text-gray-500 uppercase">Health Score</p>
                  <p className={`text-2xl font-black ${eq.healthScore < 70 ? 'text-amber-600' : 'text-green-600'}`}>
                    {eq.healthScore}%
                  </p>
                </div>
                <div className="text-right">
                  {pm25 && (
                    <p className="text-[10px] text-gray-600">
                      PM2.5: <span className={`font-bold ${pm25.status === 'Warning' ? 'text-amber-600' : 'text-gray-900'}`}>
                        {pm25.value} {pm25.unit}
                      </span>
                    </p>
                  )}
                  {pm10 && (
                    <p className="text-[10px] text-gray-600">
                      PM10: <span className="font-bold text-gray-900">{pm10.value} {pm10.unit}</span>
                    </p>
                  )}
                </div>
              </div>

              <p className="text-[9px] text-gray-500 mt-2 font-mono">
                RUL: {eq.rulDays}d · {eq.status}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
