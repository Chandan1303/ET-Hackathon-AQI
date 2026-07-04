import { db } from './database.js';

let intervalId = null;
let simulatedAQISpike = false;
let simulatedHeatwave = false;
let simulatedFlashFlood = false;

// Bounded coordinates for citizens / response teams in different city zones (GPS coordinates: New Delhi)
const ZONES_BOUNDS = {
  'Zone A (Commercial Center)': { x: [28.6200, 28.6300], y: [77.2100, 77.2200] },
  'Zone B (Industrial Area)': { x: [28.5800, 28.5900], y: [77.2400, 77.2500] },
  'Zone C (Residential District)': { x: [28.6350, 28.6450], y: [77.1650, 77.1750] },
  'Zone D (Coastal Greenbelt)': { x: [28.5950, 28.6050], y: [77.2700, 77.2800] }
};

const workers = [
  { id: 'CIT-101', name: 'Citizen Amit', zone: 'Zone A (Commercial Center)', x: 28.6250, y: 77.2150, role: 'Daily Commuter' },
  { id: 'CIT-102', name: 'Inspector Priya', zone: 'Zone B (Industrial Area)', x: 28.5850, y: 77.2450, role: 'Environmental Officer' },
  { id: 'CIT-103', name: 'Citizen Rahul', zone: 'Zone C (Residential District)', x: 28.6400, y: 77.1700, role: 'Student' },
  { id: 'CIT-104', name: 'Rescuer Bob', zone: 'Zone D (Coastal Greenbelt)', x: 28.6000, y: 77.2750, role: 'Disaster Team Lead' }
];

export function startSimulator(ioCallback) {
  if (intervalId) return;

  db.addLog('Environmental Decision simulator initialized.', 'System');

  intervalId = setInterval(() => {
    const equipment = db.getEquipment(); // STN-A, B, C, D
    const sensors = db.getSensors();
    const activeIncidents = db.getIncidents().filter(i => i.status === 'Active');

    // 1. Update station air purity health score
    equipment.forEach(stn => {
      let degradation = 0.05;
      if (stn.tag === 'STN-B' && simulatedAQISpike) degradation = 1.8;
      if (stn.tag === 'STN-A' && simulatedHeatwave) degradation = 1.2;
      if (stn.tag === 'STN-C' && simulatedFlashFlood) degradation = 2.0;

      const newScore = Math.max(10, Math.round(stn.healthScore - degradation));
      const newRul = Math.max(0, Math.round(stn.rulDays - (degradation * 0.5)));
      
      let status = stn.status;
      if (newScore < 50) status = 'Critical';
      else if (newScore < 75) status = 'Warning';
      else status = 'Online';

      // Automatically trigger incident alerts if health goes critical
      if (status === 'Critical' && !activeIncidents.some(i => i.equipmentTag === stn.tag)) {
        db.addIncident({
          equipmentTag: stn.tag,
          type: 'Environmental Risk Alert',
          severity: 'High',
          description: `Station ${stn.tag} air quality has degraded severely (Purity index: ${newScore}%). Active intervention recommended.`,
          rootCause: 'Particulate density exceeding critical regulatory thresholds.'
        });
      }

      db.updateEquipmentHealth(stn.tag, newScore, newRul);
    });

    // 2. Physics & Meteorological equations
    // Temperature & Heat Index (Zone A Commercial Center)
    let temp = 30.5;
    let humid = 60.0;
    if (simulatedHeatwave) {
      temp = Math.min(46.5, (sensors.find(s => s.id === 'SEN-MET-TEMP')?.value || 30.5) + 0.65 + (Math.random() - 0.5) * 0.1);
      humid = Math.max(20.0, (sensors.find(s => s.id === 'SEN-MET-HUMID')?.value || 60.0) - 0.9);
    } else {
      temp = 32.5 + Math.sin(Date.now() / 25000) * 1.5 + (Math.random() - 0.5) * 0.2;
      humid = 65.0 - Math.sin(Date.now() / 25000) * 5.0 + (Math.random() - 0.5) * 0.5;
    }

    // Flash Flood Rainfall (Zone C / D)
    let rain = 0.0;
    if (simulatedFlashFlood) {
      rain = Math.min(125.0, (sensors.find(s => s.id === 'SEN-MET-RAIN')?.value || 0.0) + 5.2 + (Math.random() - 0.5) * 0.8);
    } else {
      rain = Math.max(0.0, Math.sin(Date.now() / 60000) > 0.85 ? 12.0 + (Math.random() - 0.5) * 2.0 : 0.0);
    }

    // Wind Dynamics
    let windSpeed = 3.5 + Math.sin(Date.now() / 15000) * 1.2 + (Math.random() - 0.5) * 0.35;
    let windDir = Math.round(180 + Math.sin(Date.now() / 30000) * 45) % 360;

    // PM2.5, PM10, and NO2 linked by physical emission rates and wind dispersion
    // Dispersion factor: high wind disperses PM2.5 (reduces it)
    const dispersion = Math.max(0.5, 5.0 / windSpeed);

    // Station A (Commercial traffic zone)
    let stna_pm25 = (30.0 + (Math.random() - 0.5) * 4.0) * dispersion;
    if (simulatedHeatwave) stna_pm25 += 25.0; // stagnant hot air
    let stna_pm10 = stna_pm25 * 1.8;
    let stna_no2 = 18.0 + (Math.random() - 0.5) * 3.0;

    // Station B (Industrial zone)
    let stnb_pm25 = (55.0 + (Math.random() - 0.5) * 8.0) * dispersion;
    if (simulatedAQISpike) {
      stnb_pm25 = Math.min(285.0, stnb_pm25 + 18.0 + (Math.random() - 0.5) * 4.0);
    }
    let stnb_pm10 = stnb_pm25 * 1.6;
    let stnb_no2 = 38.0 + (Math.random() - 0.5) * 5.0;

    // Station C & D (Residential & Greenbelt)
    let stnc_pm25 = (15.0 + (Math.random() - 0.5) * 2.0) * dispersion;
    let stnd_pm25 = (20.0 + (Math.random() - 0.5) * 3.0) * dispersion;

    const sensorUpdates = sensors.map(sensor => {
      let value = sensor.value;
      let status = 'Normal';

      if (sensor.id === 'SEN-STNA-PM25') {
        value = stna_pm25;
        if (value > 90.0) status = 'Critical';
        else if (value > 55.0) status = 'Warning';
      }
      else if (sensor.id === 'SEN-STNA-PM10') {
        value = stna_pm10;
        if (value > 150.0) status = 'Critical';
        else if (value > 100.0) status = 'Warning';
      }
      else if (sensor.id === 'SEN-STNA-NO2') {
        value = stna_no2;
      }
      else if (sensor.id === 'SEN-STNB-PM25') {
        value = stnb_pm25;
        if (value > 90.0) status = 'Critical';
        else if (value > 55.0) status = 'Warning';
      }
      else if (sensor.id === 'SEN-STNB-PM10') {
        value = stnb_pm10;
        if (value > 150.0) status = 'Critical';
        else if (value > 100.0) status = 'Warning';
      }
      else if (sensor.id === 'SEN-STNB-NO2') {
        value = stnb_no2;
        if (value > 80.0) status = 'Warning';
      }
      else if (sensor.id === 'SEN-STNC-PM25') {
        value = stnc_pm25;
      }
      else if (sensor.id === 'SEN-STND-PM25') {
        value = stnd_pm25;
      }
      else if (sensor.id === 'SEN-MET-TEMP') {
        value = temp;
        if (value > 40.0) status = 'Critical';
        else if (value > 37.0) status = 'Warning';
      }
      else if (sensor.id === 'SEN-MET-HUMID') {
        value = humid;
      }
      else if (sensor.id === 'SEN-MET-WIND-SPD') {
        value = windSpeed;
      }
      else if (sensor.id === 'SEN-MET-WIND-DIR') {
        value = windDir;
      }
      else if (sensor.id === 'SEN-MET-RAIN') {
        value = rain;
        if (value > 50.0) status = 'Critical';
        else if (value > 20.0) status = 'Warning';
      }

      return { id: sensor.id, value: parseFloat(value.toFixed(2)), status };
    });

    db.updateSensors(sensorUpdates);

    // 3. Random Walk citizens/officers
    workers.forEach(worker => {
      const zoneName = Object.keys(ZONES_BOUNDS).find(k => k.includes(worker.zone.split(' (')[0]));
      const bounds = ZONES_BOUNDS[zoneName || worker.zone];
      if (bounds) {
        worker.x += (Math.random() - 0.5) * 0.001;
        worker.y += (Math.random() - 0.5) * 0.001;

        if (worker.x < bounds.x[0]) worker.x = bounds.x[0];
        if (worker.x > bounds.x[1]) worker.x = bounds.x[1];
        if (worker.y < bounds.y[0]) worker.y = bounds.y[0];
        if (worker.y > bounds.y[1]) worker.y = bounds.y[1];

        worker.x = parseFloat(worker.x.toFixed(4));
        worker.y = parseFloat(worker.y.toFixed(4));
      }
    });

    if (ioCallback) {
      ioCallback({
        equipment: db.getEquipment(),
        telemetry: db.getSensors(),
        workers,
        incidents: db.getIncidents()
      });
    }
  }, 4000);
}

export function stopSimulator() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    db.addLog('Environmental Simulator stopped.', 'System');
  }
}

export function setVibrationSim(active) {
  simulatedAQISpike = active;
  db.addLog(`Simulation: Industrial particulate emission set to ${active}`, 'System');
  if (active) {
    const existing = db.getIncidents().some(i => i.status === 'Active' && i.equipmentTag === 'STN-B' && i.type === 'Industrial Emission Leak');
    if (!existing) {
      db.addIncident({
        equipmentTag: 'STN-B',
        type: 'Industrial Emission Leak',
        severity: 'High',
        description: 'Particulate emission spike detected at Station B. PM2.5 crossed 140 ug/m3 under south wind drift.',
        rootCause: 'Unmitigated stack discharge coupled with zero scrubbing operation at Sector 4 cement plant.'
      });
    }
  }
}

export function setBoilerPressureSim(active) {
  simulatedHeatwave = active;
  db.addLog(`Simulation: Heatwave thermal anomaly set to ${active}`, 'System');
  if (active) {
    const existing = db.getIncidents().some(i => i.status === 'Active' && i.equipmentTag === 'STN-A' && i.type === 'Severe Heatwave Event');
    if (!existing) {
      db.addIncident({
        equipmentTag: 'STN-A',
        type: 'Severe Heatwave Event',
        severity: 'Critical',
        description: 'Thermal index surpassed 42.5°C in downtown Zone A. Extreme heatstroke risks logged.',
        rootCause: 'Localized urban heat island accumulation under stationary high-pressure air mass.'
      });
    }
  }
}

export function setChillerFlowSim(active) {
  simulatedFlashFlood = active;
  db.addLog(`Simulation: Heavy storm waterlogging set to ${active}`, 'System');
  if (active) {
    const existing = db.getIncidents().some(i => i.status === 'Active' && i.equipmentTag === 'STN-C' && i.type === 'Urban Waterlogging Alert');
    if (!existing) {
      db.addIncident({
        equipmentTag: 'STN-C',
        type: 'Urban Waterlogging Alert',
        severity: 'High',
        description: 'Flash flooding observed at Highway Route 4 underpass. Local water level reading: 35cm.',
        rootCause: 'Intense precipitation rainfall exceeding storm sewer outlet drainage capacity.'
      });
    }
  }
}

export function getWorkers() {
  return workers;
}
