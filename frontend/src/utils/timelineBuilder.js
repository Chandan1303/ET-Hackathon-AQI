export function buildTimelineReplayStates(events, baseEquipment, baseSensors, baseIncidents) {
  if (!events?.length) return [];

  let equipment = JSON.parse(JSON.stringify(baseEquipment));
  let sensors = JSON.parse(JSON.stringify(baseSensors));
  let incidents = [];

  return events.map((evt) => {
    if (evt.parameters && Object.keys(evt.parameters).length > 0) {
      sensors = sensors.map(s => {
        if (evt.parameters[s.id] !== undefined) {
          const val = evt.parameters[s.id];
          return {
            ...s,
            value: val,
            status: val > 120 ? 'Warning' : val > 60 ? 'Moderate' : 'Normal',
          };
        }
        return s;
      });
    }

    const isSpike = /spike|warning|aqi|emission|violation/i.test(`${evt.title} ${evt.details}`);
    if (isSpike) {
      equipment = equipment.map(eq =>
        eq.tag === 'STN-B'
          ? { ...eq, status: 'Warning', healthScore: Math.min(eq.healthScore, 68) }
          : eq
      );
      const existing = baseIncidents.find(i => i.status === 'Active');
      if (existing) incidents = [existing];
    }

    return {
      time: evt.timestamp,
      title: evt.title,
      details: evt.details,
      zone: evt.zone,
      parameters: evt.parameters || {},
      equipment: JSON.parse(JSON.stringify(equipment)),
      sensors: JSON.parse(JSON.stringify(sensors)),
      incidents: JSON.parse(JSON.stringify(incidents)),
    };
  });
}
