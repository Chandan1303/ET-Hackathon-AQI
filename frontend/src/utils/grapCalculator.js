/** GRAP (Graded Response Action Plan) stage from city AQI */

const GRAP_STAGES = [
  {
    stage: 0,
    label: 'Normal',
    aqiMin: 0,
    aqiMax: 200,
    color: '#10b981',
    actions: ['Routine monitoring', 'Standard vehicular checks', 'Public awareness campaigns'],
  },
  {
    stage: 1,
    label: 'Stage I — Poor',
    aqiMin: 201,
    aqiMax: 300,
    color: '#f59e0b',
    actions: [
      'Stop garbage burning in open',
      'Enforce PUC norms strictly',
      'Mechanical road sweeping in hotspot corridors',
      'Dust control at construction sites',
    ],
  },
  {
    stage: 2,
    label: 'Stage II — Very Poor',
    aqiMin: 301,
    aqiMax: 400,
    color: '#f97316',
    actions: [
      'Ban diesel generator sets (except essential services)',
      'Increase parking fees by 3–4× in commercial zones',
      'Stop coal and firewood in hotels/restaurants',
      'Intensify public transport frequency',
    ],
  },
  {
    stage: 3,
    label: 'Stage III — Severe',
    aqiMin: 401,
    aqiMax: 500,
    color: '#ef4444',
    actions: [
      'Halt construction and demolition activity',
      'Ban entry of trucks except essential goods',
      'Mandate work-from-home for 50% of staff',
      'Deploy water sprinklers on arterial roads',
    ],
  },
  {
    stage: 4,
    label: 'Stage IV — Severe+',
    aqiMin: 501,
    aqiMax: 9999,
    color: '#7c2d12',
    actions: [
      'Emergency shutdown of polluting industries',
      'Odd-even vehicle rationing in city core',
      'School closures and health emergency alerts',
      'Maximum GRAP enforcement across all sectors',
    ],
  },
];

export function getGrapStage(aqi) {
  const match = [...GRAP_STAGES].reverse().find(s => aqi >= s.aqiMin) || GRAP_STAGES[0];
  const progress = match.aqiMax < 9999
    ? Math.min(100, Math.round(((aqi - match.aqiMin) / (match.aqiMax - match.aqiMin + 1)) * 100))
    : 100;
  return { ...match, currentAqi: aqi, progress };
}

export { GRAP_STAGES };
