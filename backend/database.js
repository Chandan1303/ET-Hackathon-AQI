import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DB_FILE = path.resolve('copilot_db.json');

const defaultData = {
  equipment: [
    { tag: 'STN-A', name: 'Station A - Commercial Center', location: 'Zone A (Commercial Center)', status: 'Online', healthScore: 94, rulDays: 180, vendor: 'EnviroTech Corp', installDate: '2022-03-15' },
    { tag: 'STN-B', name: 'Station B - Industrial Corridor', location: 'Zone B (Industrial Area)', status: 'Warning', healthScore: 68, rulDays: 45, vendor: 'SensAir Ltd', installDate: '2021-08-10' },
    { tag: 'STN-C', name: 'Station C - Residential Greenbelt', location: 'Zone C (Residential District)', status: 'Online', healthScore: 96, rulDays: 320, vendor: 'AeroGuard Global', installDate: '2023-01-22' },
    { tag: 'STN-D', name: 'Station D - Coastal Port Corridor', location: 'Zone D (Coastal Greenbelt)', status: 'Online', healthScore: 90, rulDays: 200, vendor: 'EnviroTech Corp', installDate: '2024-05-18' }
  ],
  sensors: [
    { id: 'SEN-STNA-PM25', equipmentTag: 'STN-A', name: 'PM2.5 Particulate', value: 45.0, unit: 'µg/m³', status: 'Normal', timestamp: new Date().toISOString() },
    { id: 'SEN-STNA-PM10', equipmentTag: 'STN-A', name: 'PM10 Particulate', value: 85.0, unit: 'µg/m³', status: 'Normal', timestamp: new Date().toISOString() },
    { id: 'SEN-STNA-NO2', equipmentTag: 'STN-A', name: 'Nitrogen Dioxide', value: 24.5, unit: 'ppb', status: 'Normal', timestamp: new Date().toISOString() },
    { id: 'SEN-STNB-PM25', equipmentTag: 'STN-B', name: 'PM2.5 Particulate', value: 142.5, unit: 'µg/m³', status: 'Warning', timestamp: new Date().toISOString() },
    { id: 'SEN-STNB-PM10', equipmentTag: 'STN-B', name: 'PM10 Particulate', value: 210.0, unit: 'µg/m³', status: 'Warning', timestamp: new Date().toISOString() },
    { id: 'SEN-STNB-NO2', equipmentTag: 'STN-B', name: 'Nitrogen Dioxide', value: 68.2, unit: 'ppb', status: 'Warning', timestamp: new Date().toISOString() },
    { id: 'SEN-STNC-PM25', equipmentTag: 'STN-C', name: 'PM2.5 Particulate', value: 18.2, unit: 'µg/m³', status: 'Normal', timestamp: new Date().toISOString() },
    { id: 'SEN-STND-PM25', equipmentTag: 'STN-D', name: 'PM2.5 Particulate', value: 34.0, unit: 'µg/m³', status: 'Normal', timestamp: new Date().toISOString() },
    
    // Weather Telemetry (City-wide global values linked to Zones)
    { id: 'SEN-MET-TEMP', equipmentTag: 'STN-A', name: 'Ambient Temperature', value: 32.5, unit: '°C', status: 'Normal', timestamp: new Date().toISOString() },
    { id: 'SEN-MET-HUMID', equipmentTag: 'STN-A', name: 'Relative Humidity', value: 65.0, unit: '%', status: 'Normal', timestamp: new Date().toISOString() },
    { id: 'SEN-MET-WIND-SPD', equipmentTag: 'STN-A', name: 'Wind Speed', value: 3.5, unit: 'm/s', status: 'Normal', timestamp: new Date().toISOString() },
    { id: 'SEN-MET-WIND-DIR', equipmentTag: 'STN-A', name: 'Wind Direction', value: 180, unit: '°', status: 'Normal', timestamp: new Date().toISOString() },
    { id: 'SEN-MET-RAIN', equipmentTag: 'STN-C', name: 'Precipitation Rainfall', value: 0.0, unit: 'mm', status: 'Normal', timestamp: new Date().toISOString() }
  ],
  maintenance: [
    {
      id: 'INT-001',
      equipmentTag: 'STN-B',
      type: 'Source Control',
      technician: 'Sarah Davis',
      details: 'Construction suspension and road water spraying deployed in Zone B Corridor.',
      downtimeHours: 4.0,
      spareParts: ['Water Sprayer Tanker', 'Traffic Diversion Cones'],
      priority: 'High',
      timestamp: new Date(Date.now() - 3 * 86400000).toISOString()
    }
  ],
  incidents: [
    {
      id: 'INC-001',
      equipmentTag: 'STN-B',
      type: 'Hyperlocal AQI Spike',
      severity: 'High',
      description: 'Particulate matter PM2.5 in Industrial Zone B exceeded municipal safety limits, peaking at 142 µg/m³.',
      rootCause: 'Low wind dispersion coupled with illegal crop burning residues and heavy truck congestion.',
      status: 'Active',
      timestamp: new Date().toISOString()
    }
  ],
  documents: [
    {
      id: 'DOC-REG-GRAP',
      title: 'Graded Response Action Plan (GRAP) Guidelines',
      category: 'Regulation',
      content: 'Graded Response Action Plan Stage II Guidelines. When PM2.5 exceeds 120 ug/m3, municipal commissioners must mandate construction pauses, deploy mechanical road sweepers, divert heavy commercial vehicles from downtown residential streets, and issue outdoor warnings for schools.',
      metadata: { author: 'Ministry of Environment', version: '2025-Rev', targetEquipment: 'All' }
    },
    {
      id: 'DOC-SOP-HEAT',
      title: 'SOP-301: Heatwave Emergency Protocol',
      category: 'SOP',
      content: 'Heatwave Emergency Standard Operating Procedure. If air temperature hits 40°C or relative humidity increases heat index past 42°C, municipal staff must open designated public cooling centers, suspend heavy outdoor construction work from 12 PM to 4 PM, and dispatch emergency medical teams for heatstroke triage.',
      metadata: { author: 'Disaster Mgmt Authority', version: '1.2', targetEquipment: 'All' }
    },
    {
      id: 'DOC-SOP-FLOOD',
      title: 'SOP-401: Flash Flood Waterlogging Action Plan',
      category: 'SOP',
      content: 'Flash Flood response SOP. If hourly precipitation rainfall exceeds 30mm, trigger automatic waterlogging risk alerts. Deploy emergency storm pumps to Underpass B-12 and close flooded traffic arteries. Advise citizens to avoid waterlogged roads.',
      metadata: { author: 'Urban Drainage Dept', version: '2.0', targetEquipment: 'All' }
    }
  ],
  users: [
    { username: 'admin', name: 'Sarah Davis', role: 'Admin', department: 'City Administration', passwordHash: 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f' },
    { username: 'safety', name: 'Alice Johnson', role: 'Safety Officer', department: 'HSE Environmental Inspectorate', passwordHash: 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f' },
    { username: 'engineer', name: 'John Doe', role: 'Engineer', department: 'Air Quality Research', passwordHash: 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f' },
    { username: 'technician', name: 'Bob Miller', role: 'Technician', department: 'Field Operations & Dispatch', passwordHash: 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f' }
  ],
  notifications: [
    { id: 'NOT-001', type: 'High Risk', message: 'Hyperlocal AQI Spike at Station B. Wind carrying industrial plume towards Zone C Residential.', timestamp: new Date().toISOString(), read: false }
  ],
  logs: [
    { id: 'SYS-LOG-001', timestamp: new Date().toISOString(), message: 'AI Urban Environmental Platform Database initialized.', category: 'System' }
  ],
  timeline: [
    { timestamp: '08:00:00', title: 'Shift Started', details: 'Morning environmental operations shift started. Sensor verification completed.', zone: 'System', parameters: {} },
    { timestamp: '08:30:00', title: 'Industrial Zone Emission Spike', details: 'Station B recorded elevated PM10 particulate readings.', zone: 'Zone B (Industrial Area)', parameters: { 'SEN-STNB-PM10': 180.0 } },
    { timestamp: '09:15:00', title: 'GRAP Notification Issued', details: 'Compliance advisory generated recommending road water spraying.', zone: 'Zone B (Industrial Area)', parameters: {} },
    { timestamp: '09:45:00', title: 'Road Water Spraying Initiated', details: 'Technician dispatched water tanker to commercial corridors.', zone: 'Zone A (Commercial Center)', parameters: {} },
    { timestamp: '10:07:00', title: 'AQI Warning Active', details: 'Particulate levels peaked at 142.5 ug/m3 in industrial corridor.', zone: 'Zone B (Industrial Area)', parameters: { 'SEN-STNB-PM25': 142.5 } }
  ],
  workflows: [
    {
      id: 'WF-001',
      incidentId: 'INC-001',
      equipmentTag: 'STN-B',
      tasks: [
        { id: 'T1', name: 'Deploy mechanical water sprayers in Zone B corridor', status: 'Completed', assignedTo: 'Bob Miller' },
        { id: 'T2', name: 'Suspend commercial excavation sites within 1km of Station B', status: 'Pending', assignedTo: 'Alice Johnson' },
        { id: 'T3', name: 'Divert heavy trucks to Outer Ring road', status: 'Pending', assignedTo: 'Traffic Dispatch' },
        { id: 'T4', name: 'Issue localized Asthma risk alerts to schools in Zone C', status: 'Completed', assignedTo: 'Sarah Davis' }
      ]
    }
  ],
  factory_memory: [
    { timestamp: '2025-11-12T10:30:00Z', equipmentTag: 'STN-B', incidentType: 'Pollution Spike', details: 'Winter crop burning plume intercepted. gridded spraying reduced PM10 by 24 ug/m3 in 4 hours.', technician: 'Alice Johnson' }
  ],
  learning_ledger: [
    { timestamp: new Date().toISOString(), type: 'Vector Update', details: 'Indexed GRAP-II SOP guidelines. Learned 6 atmospheric correlation rules.', version: 'v2.0.1' },
    { timestamp: new Date().toISOString(), type: 'Model Adjustment', details: 'Retrained source attribution coefficients on June 2026 industrial traffic logs.', version: 'v2.1.0' }
  ],
  ledger: [
    {
      id: 'GENESIS-BLOCK-0',
      timestamp: '2026-07-01T08:00:00.000Z',
      action: 'Urban Environmental Operations Ledger initialized. Secure SHA-256 blockchain tracking active.',
      performedBy: 'HSE compliance System',
      previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
      hash: '4d8e5f2dfa2a3e813a36db5e17a419266a1a1f0a1cbbd25c4efc78b4097f394f'
    }
  ]
};

// Force database initialization / rewrite
fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');

export function readDb() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading database file, using default data', err);
    return defaultData;
  }
}

export function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing to database file', err);
    return false;
  }
}

export const db = {
  getEquipment: () => readDb().equipment,
  updateEquipmentHealth: (tag, score, rul) => {
    const data = readDb();
    const eq = data.equipment.find(e => e.tag === tag);
    if (eq) {
      eq.healthScore = score;
      eq.rulDays = rul;
      writeDb(data);
      return eq;
    }
    return null;
  },

  getSensors: () => readDb().sensors,
  updateSensors: (sensorUpdates) => {
    const data = readDb();
    sensorUpdates.forEach(update => {
      const s = data.sensors.find(item => item.id === update.id);
      if (s) {
        s.value = update.value;
        s.status = update.status;
        s.timestamp = new Date().toISOString();
      }
    });
    writeDb(data);
    return data.sensors;
  },

  getMaintenance: () => readDb().maintenance,
  addMaintenance: (record) => {
    const data = readDb();
    const newRecord = {
      id: `INT-${String(data.maintenance.length + 1).padStart(3, '0')}`,
      timestamp: new Date().toISOString(),
      ...record
    };
    data.maintenance.push(newRecord);
    writeDb(data);
    db.addLog(`Environmental intervention logged for ${newRecord.equipmentTag} by ${newRecord.technician}`, 'Intervention');
    return newRecord;
  },

  getIncidents: () => readDb().incidents,
  addIncident: (incident) => {
    const data = readDb();
    const newIncident = {
      id: `INC-${String(data.incidents.length + 1).padStart(3, '0')}`,
      timestamp: new Date().toISOString(),
      status: 'Active',
      ...incident
    };
    data.incidents.push(newIncident);
    writeDb(data);
    db.addLog(`Incident Alert: ${newIncident.type} (${newIncident.severity}) logged for ${newIncident.equipmentTag}`, 'Incident');
    db.addNotification('High Risk', `New incident ${newIncident.id} (${newIncident.type}) active in ${newIncident.equipmentTag}.`);
    return newIncident;
  },
  resolveIncident: (id, rootCause) => {
    const data = readDb();
    const inc = data.incidents.find(i => i.id === id);
    if (inc) {
      inc.status = 'Resolved';
      if (rootCause) inc.rootCause = rootCause;
      writeDb(data);
      db.addLog(`Incident ${id} marked Resolved.`, 'Incident');
      return inc;
    }
    return null;
  },

  getDocuments: () => readDb().documents,
  addDocument: (doc) => {
    const data = readDb();
    const newDoc = {
      id: `DOC-${doc.category.toUpperCase()}-${Date.now().toString().slice(-4)}`,
      ...doc
    };
    data.documents.push(newDoc);
    writeDb(data);
    db.addLog(`Document indexed: "${newDoc.title}" (${newDoc.category})`, 'Compliance');
    return newDoc;
  },

  getUsers: () => readDb().users,
  addUser: (user) => {
    const data = readDb();
    data.users.push(user);
    writeDb(data);
    return user;
  },
  getNotifications: () => readDb().notifications,
  addNotification: (type, message) => {
    const data = readDb();
    const newNotif = {
      id: `NOT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      message,
      timestamp: new Date().toISOString(),
      read: false
    };
    data.notifications.push(newNotif);
    writeDb(data);
    return newNotif;
  },
  clearNotifications: () => {
    const data = readDb();
    data.notifications = [];
    writeDb(data);
    return true;
  },

  getLogs: (limit = 100) => {
    return readDb().logs.slice(-limit).reverse();
  },
  addLog: (message, category = 'System') => {
    const data = readDb();
    const newLog = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      message,
      category
    };
    data.logs.push(newLog);
    if (data.logs.length > 500) {
      data.logs.shift();
    }
    writeDb(data);
    return newLog;
  },
  getTimeline: () => readDb().timeline || [],
  getWorkflows: () => readDb().workflows || [],
  updateWorkflowTask: (workflowId, taskId, status, assignedTo) => {
    const data = readDb();
    const wf = data.workflows.find(w => w.id === workflowId);
    if (wf) {
      const task = wf.tasks.find(t => t.id === taskId);
      if (task) {
        if (status !== undefined) task.status = status;
        if (assignedTo !== undefined) task.assignedTo = assignedTo;
        writeDb(data);
        return wf;
      }
    }
    return null;
  },
  addWorkflow: (wf) => {
    const data = readDb();
    data.workflows.push(wf);
    writeDb(data);
    return wf;
  },
  getFactoryMemory: () => readDb().factory_memory || [],
  addFactoryMemory: (mem) => {
    const data = readDb();
    const newMem = { timestamp: new Date().toISOString(), ...mem };
    data.factory_memory.push(newMem);
    writeDb(data);
    return newMem;
  },
  getLearningLedger: () => readDb().learning_ledger || [],
  addLearningLedger: (entry) => {
    const data = readDb();
    const newEntry = { timestamp: new Date().toISOString(), ...entry };
    data.learning_ledger.push(newEntry);
    writeDb(data);
    return newEntry;
  },
  getLedger: () => readDb().ledger || [],
  addLedgerEntry: (action, performedBy) => {
    const data = readDb();
    if (!data.ledger) data.ledger = [];
    const previousBlock = data.ledger[data.ledger.length - 1];
    const previousHash = previousBlock ? previousBlock.hash : '0000000000000000000000000000000000000000000000000000000000000000';
    const timestamp = new Date().toISOString();
    const id = `BLK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const hashContent = `${id}${timestamp}${action}${performedBy}${previousHash}`;
    const hash = crypto.createHash('sha256').update(hashContent).digest('hex');
    
    const newBlock = { id, timestamp, action, performedBy, previousHash, hash };
    data.ledger.push(newBlock);
    writeDb(data);
    return newBlock;
  }
};
