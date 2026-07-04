import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { db } from './database.js';
import { startSimulator, stopSimulator, setVibrationSim, setBoilerPressureSim, setChillerFlowSim, getWorkers } from './simulator.js';

const app = express();
const PORT = process.env.PORT || 5000;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

app.use(cors());
app.use(express.json());

const JWT_SECRET = 'industrial_copilot_secret_key_123';

function signToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const data = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 7200 })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${data}`).digest('base64url');
  return `${header}.${data}.${signature}`;
}

function verifyToken(token) {
  try {
    const [header, data, signature] = token.split('.');
    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${data}`).digest('base64url');
    if (signature !== expectedSignature) return null;
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch(e) {
    return null;
  }
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required.' });
  
  const user = verifyToken(token);
  if (!user) return res.status(403).json({ error: 'Invalid or expired token.' });
  
  req.user = user;
  next();
}

function requireRoles(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Unauthorized action. Required roles: ${roles.join(', ')}` });
    }
    next();
  };
}

// Authentication login endpoint
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required.' });
  }

  const users = db.getUsers();
  const user = users.find(u => u.username === username.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  const hash256 = crypto.createHash('sha256').update(password).digest('hex');
  if (hash256 !== user.passwordHash) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  const token = signToken({ username: user.username, role: user.role, name: user.name });
  db.addLedgerEntry(`User logged in: ${user.name} (${user.role})`, 'HSE Authentication Gateway');

  res.json({
    token,
    user: {
      username: user.username,
      name: user.name,
      role: user.role,
      department: user.department
    }
  });
});

// Authentication registration endpoint
app.post('/api/auth/register', (req, res) => {
  const { username, password, name, role, department } = req.body;
  if (!username || !password || !name || !role || !department) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const users = db.getUsers();
  if (users.some(u => u.username === username.toLowerCase())) {
    return res.status(400).json({ error: 'Username already exists.' });
  }

  const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
  const newUser = {
    username: username.toLowerCase(),
    name,
    role,
    department,
    passwordHash
  };

  db.addUser(newUser);
  db.addLedgerEntry(`New user registered: ${name} (${role})`, 'HSE Authentication Gateway');

  res.status(201).json({ success: true, message: 'User registered successfully.' });
});

// List of connected SSE clients
let clients = [];

// Broadcast helper for SSE
function broadcast(data) {
  clients.forEach(client => {
    try {
      client.res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch(e) {}
  });
}

// Start simulator with SSE broadcasting
startSimulator((updateData) => {
  broadcast({
    type: 'telemetry_update',
    payload: {
      telemetry: updateData.telemetry,
      equipment: updateData.equipment,
      workers: updateData.workers,
      incidents: updateData.incidents
    }
  });
});

// SSE Endpoint
app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  
  const clientId = Date.now();
  const newClient = { id: clientId, res };
  clients.push(newClient);

  // Send initial state immediately
  res.write(`data: ${JSON.stringify({
    type: 'initial_state',
    payload: {
      equipment: db.getEquipment(),
      telemetry: db.getSensors(),
      workers: getWorkers(),
      maintenance: db.getMaintenance(),
      incidents: db.getIncidents(),
      documents: db.getDocuments(),
      notifications: db.getNotifications(),
      logs: db.getLogs(50)
    }
  })}\n\n`);

  req.on('close', () => {
    clients = clients.filter(client => client.id !== clientId);
  });
});

// API Endpoints
app.get('/api/equipment', (req, res) => {
  res.json(db.getEquipment());
});

app.get('/api/sensors', (req, res) => {
  res.json(db.getSensors());
});

app.get('/api/maintenance', (req, res) => {
  res.json(db.getMaintenance());
});

// Add maintenance record (resolves health/RUL)
app.post('/api/maintenance', authenticateToken, requireRoles(['Admin', 'Engineer', 'Technician']), (req, res) => {
  const { equipmentTag, type, technician, details, downtimeHours, spareParts, priority } = req.body;
  if (!equipmentTag || !type || !technician) {
    return res.status(400).json({ error: 'Missing required parameters.' });
  }

  const record = db.addMaintenance({ equipmentTag, type, technician, details, downtimeHours, spareParts, priority });
  db.addLedgerEntry(`Maintenance logged for ${equipmentTag} by ${technician} (${type})`, `${req.user.role}: ${req.user.name}`);
  
  // Restore station health & RUL on maintenance action
  const stationDefaults = {
    'STN-A': { health: 94, rul: 180 },
    'STN-B': { health: 96, rul: 310 },
    'STN-C': { health: 96, rul: 320 },
    'STN-D': { health: 90, rul: 200 },
    'C-201': { health: 95, rul: 120 },
    'B-505': { health: 98, rul: 310 },
    'R-102': { health: 95, rul: 120 },
    'CH-304': { health: 90, rul: 180 },
  };
  const defaults = stationDefaults[equipmentTag] || { health: 95, rul: 150 };
  db.updateEquipmentHealth(equipmentTag, defaults.health, defaults.rul);
  db.addLog(`Equipment ${equipmentTag} repaired by ${technician}. Health restored to ${defaults.health}%.`, 'Maintenance');

  // Auto-resolve any active incidents for this machine
  const activeIncidents = db.getIncidents().filter(i => i.equipmentTag === equipmentTag && i.status === 'Active');
  activeIncidents.forEach(inc => {
    db.resolveIncident(inc.id, `Resolved via work order ${record.id} by ${technician}.`);
  });

  broadcast({
    type: 'initial_state',
    payload: {
      equipment: db.getEquipment(),
      telemetry: db.getSensors(),
      workers: getWorkers(),
      maintenance: db.getMaintenance(),
      incidents: db.getIncidents(),
      documents: db.getDocuments(),
      notifications: db.getNotifications(),
      logs: db.getLogs(50)
    }
  });

  res.status(201).json(record);
});

app.get('/api/incidents', (req, res) => {
  res.json(db.getIncidents());
});

app.post('/api/incidents', (req, res) => {
  const { equipmentTag, type, severity, description, rootCause } = req.body;
  const incident = db.addIncident({ equipmentTag, type, severity, description, rootCause });
  
  broadcast({
    type: 'initial_state',
    payload: {
      equipment: db.getEquipment(),
      telemetry: db.getSensors(),
      workers: getWorkers(),
      maintenance: db.getMaintenance(),
      incidents: db.getIncidents(),
      documents: db.getDocuments(),
      notifications: db.getNotifications(),
      logs: db.getLogs(50)
    }
  });
  res.status(201).json(incident);
});

app.post('/api/incidents/:id/resolve', (req, res) => {
  const { id } = req.params;
  const { rootCause } = req.body;
  const incident = db.resolveIncident(id, rootCause);
  if (incident) {
    broadcast({
      type: 'initial_state',
      payload: {
        equipment: db.getEquipment(),
        telemetry: db.getSensors(),
        workers: getWorkers(),
        maintenance: db.getMaintenance(),
        incidents: db.getIncidents(),
        documents: db.getDocuments(),
        notifications: db.getNotifications(),
        logs: db.getLogs(50)
      }
    });
    res.json(incident);
  } else {
    res.status(404).json({ error: 'Incident not found' });
  }
});

app.get('/api/documents', (req, res) => {
  res.json(db.getDocuments());
});

app.post('/api/documents', authenticateToken, requireRoles(['Admin', 'Safety Officer']), (req, res) => {
  const { title, category, content, metadata } = req.body;
  if (!title || !category || !content) {
    return res.status(400).json({ error: 'Missing required parameters.' });
  }
  const document = db.addDocument({ title, category, content, metadata: metadata || {} });
  db.addLedgerEntry(`Document indexed: "${title}" (${category})`, `${req.user.role}: ${req.user.name}`);
  
  broadcast({
    type: 'initial_state',
    payload: {
      equipment: db.getEquipment(),
      telemetry: db.getSensors(),
      workers: getWorkers(),
      maintenance: db.getMaintenance(),
      incidents: db.getIncidents(),
      documents: db.getDocuments(),
      notifications: db.getNotifications(),
      logs: db.getLogs(50)
    }
  });

  // Call RAG background re-indexer in FastAPI (non-blocking)
  fetch(`${AI_SERVICE_URL}/api/rag/reindex`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(document)
  }).catch(err => console.warn('RAG service reindex failed', err.message));

  res.status(201).json(document);
});

app.get('/api/notifications', (req, res) => {
  res.json(db.getNotifications());
});

app.post('/api/notifications/clear', (req, res) => {
  db.clearNotifications();
  broadcast({
    type: 'initial_state',
    payload: {
      equipment: db.getEquipment(),
      telemetry: db.getSensors(),
      workers: getWorkers(),
      maintenance: db.getMaintenance(),
      incidents: db.getIncidents(),
      documents: db.getDocuments(),
      notifications: db.getNotifications(),
      logs: db.getLogs(50)
    }
  });
  res.json({ success: true });
});

app.get('/api/logs', (req, res) => {
  res.json(db.getLogs(100));
});

app.get('/api/timeline', (req, res) => {
  res.json(db.getTimeline());
});

app.get('/api/workflows', (req, res) => {
  res.json(db.getWorkflows());
});

app.post('/api/workflows/:id/task', (req, res) => {
  const { id } = req.params;
  const { taskId, status, assignedTo } = req.body;
  const updatedWf = db.updateWorkflowTask(id, taskId, status, assignedTo);
  if (updatedWf) {
    broadcast({
      type: 'workflow_update',
      payload: updatedWf
    });
    res.json(updatedWf);
  } else {
    res.status(404).json({ error: 'Workflow or task not found.' });
  }
});

app.get('/api/memory', (req, res) => {
  res.json(db.getFactoryMemory());
});

app.get('/api/learning', (req, res) => {
  res.json(db.getLearningLedger());
});

app.get('/api/discussions/:incidentId', async (req, res) => {
  const { incidentId } = req.params;
  const incidents = db.getIncidents();
  const inc = incidents.find(i => i.id === incidentId);
  
  if (inc) {
    try {
      const response = await fetch(`${AI_SERVICE_URL}/api/agent/debate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId: inc.id,
          description: inc.description,
          equipmentTag: inc.equipmentTag
        })
      });
      if (response.ok) {
        const debate = await response.json();
        if (debate) return res.json(debate);
      }
    } catch(err) {
      console.warn("AI debate generator offline, using standard fallback", err.message);
    }
  }

  const conversations = {
    'INC-001': [
      { agent: 'Maintenance Agent', text: 'Station B air telemetry is critical (PM2.5: 142 µg/m³). Primary exhaust scrubbing filters may be saturated.', timestamp: '10:06:12' },
      { agent: 'Safety Agent', text: 'Caution: high exposure hazard in local parkways. Vulnerable population alerts should be published.', timestamp: '10:06:45' },
      { agent: 'Compliance Agent', text: 'Violates Graded Response Action Plan (GRAP) Stage II limits. Immediate municipal watering mandated.', timestamp: '10:07:05' },
      { agent: 'Supply Chain Agent', text: 'HEPA replacement screens and spray trucks ready. Fully loaded, Warehouse B.', timestamp: '10:07:30' },
      { agent: 'Executive Agent', text: 'Synthesized directive: Order localized water misting on Sector 4 bypass and authorize emergency filter swap.', timestamp: '10:08:00' }
    ],
    'INC-002': [
      { agent: 'Maintenance Agent', text: 'Station A temperature is soaring (42.5°C). Solar radiometers reporting extreme UV indices.', timestamp: '08:21:10' },
      { agent: 'Safety Agent', text: 'High risk of heat exhaustion for transit workers. Mandatory shade breaks are required.', timestamp: '08:21:40' },
      { agent: 'Compliance Agent', text: 'Exceeds standard heat SOP safety limits. Non-essential public works must halt.', timestamp: '08:22:00' },
      { agent: 'Supply Chain Agent', text: 'Hydration kits and emergency shelters activated in Central District.', timestamp: '08:22:30' },
      { agent: 'Executive Agent', text: 'Synthesized directive: Issue extreme heat warnings across transit hubs and suspend outdoor municipal labor.', timestamp: '08:23:00' }
    ]
  };
  const debate = conversations[incidentId] || [
    { agent: 'Maintenance Agent', text: 'Fault registered. Sensor metrics crossing warning threshold.', timestamp: new Date().toLocaleTimeString() },
    { agent: 'Safety Agent', text: 'Reviewing local worker presence and LOTO tags in zone.', timestamp: new Date().toLocaleTimeString() },
    { agent: 'Compliance Agent', text: 'Checking against safety standards and local compliance logs.', timestamp: new Date().toLocaleTimeString() },
    { agent: 'Supply Chain Agent', text: 'Verifying spare parts availability for resolution.', timestamp: new Date().toLocaleTimeString() },
    { agent: 'Executive Agent', text: 'Synthesizing preventive directive and assigning work order.', timestamp: new Date().toLocaleTimeString() }
  ];
  res.json(debate);
});

// Simulation Control routes
function broadcastTelemetry() {
  broadcast({
    type: 'telemetry_update',
    payload: {
      telemetry: db.getSensors(),
      equipment: db.getEquipment(),
      workers: getWorkers(),
      incidents: db.getIncidents()
    }
  });
}

app.post('/api/simulate/vibration', authenticateToken, requireRoles(['Admin', 'Safety Officer', 'Engineer']), (req, res) => {
  const { active } = req.body;
  setVibrationSim(active);
  db.addLedgerEntry(`Manual fault simulated: vibration active=${active}`, `${req.user.role}: ${req.user.name}`);
  broadcastTelemetry();
  res.json({ success: true, active });
});

app.post('/api/simulate/boiler', authenticateToken, requireRoles(['Admin', 'Safety Officer', 'Engineer']), (req, res) => {
  const { active } = req.body;
  setBoilerPressureSim(active);
  db.addLedgerEntry(`Manual fault simulated: boiler pressure active=${active}`, `${req.user.role}: ${req.user.name}`);
  broadcastTelemetry();
  res.json({ success: true, active });
});

app.post('/api/simulate/chiller', authenticateToken, requireRoles(['Admin', 'Safety Officer', 'Engineer']), (req, res) => {
  const { active } = req.body;
  setChillerFlowSim(active);
  db.addLedgerEntry(`Manual fault simulated: chiller loop choke active=${active}`, `${req.user.role}: ${req.user.name}`);
  broadcastTelemetry();
  res.json({ success: true, active });
});

// Secure cryptographic audit ledger route
app.get('/api/ledger', authenticateToken, (req, res) => {
  res.json(db.getLedger());
});

// Ranked environmental inspections endpoint
app.get('/api/inspections', (req, res) => {
  const sensors = db.getSensors();
  const windSpd = sensors.find(s => s.id === 'SEN-MET-WIND-SPD')?.value || 3.5;
  const windDir = sensors.find(s => s.id === 'SEN-MET-WIND-DIR')?.value || 180;
  const stnb_pm25 = sensors.find(s => s.id === 'SEN-STNB-PM25')?.value || 55.0;

  const inspections = [
    {
      id: 'INSP-001',
      zone: 'Zone B Industrial Area',
      target: 'Sector 4 Cement Kiln Stack',
      priority: stnb_pm25 > 100.0 ? 'High' : 'Medium',
      reason: `Elevated PM2.5 levels of ${stnb_pm25} µg/m³. Wind vectors (${windSpd} m/s, blowing at ${windDir}°) carry plumes toward Zone C residential sectors.`,
      history: '2 environmental violations logged in past 6 months.'
    },
    {
      id: 'INSP-002',
      zone: 'Zone A Commercial Corridor',
      target: 'Route 4 Construction Excavation',
      priority: stnb_pm25 > 150.0 ? 'High' : 'Low',
      reason: 'Ambient particulate count is elevated due to dry soil conditions and dust agitation.',
      history: 'First inspection of the current shift cycle.'
    }
  ];
  res.json(inspections);
});

app.listen(PORT, () => {
  console.log(`Urban Eco OS Backend Server running on port ${PORT}`);
});

