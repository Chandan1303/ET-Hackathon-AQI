import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import AirQualityMap from './components/AirQualityMap';
import ToastContainer from './components/ToastContainer';
import CityComparison from './components/CityComparison';
import HealthAdvisory from './components/HealthAdvisory';
import PollutantTrendChart from './components/PollutantTrendChart';
import CopilotChat from './components/CopilotChat';
import EcoInsights from './components/EcoInsights';
import NotificationPanel from './components/NotificationPanel';
import { buildTimelineReplayStates } from './utils/timelineBuilder';
import { useToasts } from './hooks/useToasts';
// v2.0 - Updated imports
import { fetchCityAirQuality, generateHeatmapData, mergeBackendSensors, getStationAqi, getAqiColor, getAqiStatus, getEquipmentZoneCoords, getStationCircleRadius, WORKER_ZONE_MAP } from './services/airQualityAPI.js';
import { API_BASE, AI_BASE } from './config.js';
import { aiRequest, apiRequest, parseJsonResponse } from './services/api.js';
import {
  Shield,
  Activity,
  AlertTriangle,
  FileText,
  MessageSquare,
  BarChart3,
  Flame,
  User,
  AlertOctagon,
  CheckCircle,
  XCircle,
  Compass,
  Clock,
  Send,
  Zap,
  Upload,
  Wrench,
  Printer,
  BookOpen,
  Mic,
  Network,
  Sliders,
  Sparkles,
  AlertCircle,
  DollarSign,
  TrendingUp,
  RotateCcw,
  CheckSquare,
  Server,
  Wind,
  CloudRain,
  Sun,
  CloudSnow,
  Droplets,
  Eye,
  EyeOff,
  Leaf,
  Factory,
  Car,
  Home,
  Trees,
  Waves,
  Moon,
  Menu,
  X,
  Bell,
  Globe
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend
} from 'recharts';

// Helper component to update map view when center changes
function MapUpdater({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && center.length === 2) {
      map.setView(center, zoom || map.getZoom(), { animate: true, duration: 1 });
    }
  }, [center, zoom, map]);
  
  return null;
}

// Google Maps API Configuration
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';

// Global cities - works with any city coordinates
const CITIES = {
  'New Delhi': {
    name: 'New Delhi, India',
    center: [28.6139, 77.2090],
    zoom: 12,
    zones: {
      'Downtown': [28.6250, 77.2150],
      'Industrial': [28.5850, 77.2500],
      'Residential': [28.6400, 77.1700],
      'Airport': [28.6000, 77.2750]
    }
  },
  'Beijing': {
    name: 'Beijing, China',
    center: [39.9042, 116.4074],
    zoom: 11,
    zones: {
      'Downtown': [39.9042, 116.4074],
      'Industrial': [39.8642, 116.4474],
      'Residential': [39.9442, 116.3674],
      'Airport': [39.8842, 116.4874]
    }
  },
  'Los Angeles': {
    name: 'Los Angeles, USA',
    center: [34.0522, -118.2437],
    zoom: 11,
    zones: {
      'Downtown': [34.0522, -118.2437],
      'Industrial': [34.0122, -118.2837],
      'Residential': [34.0922, -118.2037],
      'Airport': [34.0322, -118.2837]
    }
  },
  'London': {
    name: 'London, UK',
    center: [51.5074, -0.1278],
    zoom: 11,
    zones: {
      'Downtown': [51.5074, -0.1278],
      'Industrial': [51.4674, -0.1678],
      'Residential': [51.5474, -0.0878],
      'Airport': [51.4874, -0.1878]
    }
  },
  'Tokyo': {
    name: 'Tokyo, Japan',
    center: [35.6762, 139.6503],
    zoom: 11,
    zones: {
      'Downtown': [35.6762, 139.6503],
      'Industrial': [35.6362, 139.6903],
      'Residential': [35.7162, 139.6103],
      'Airport': [35.6562, 139.7303]
    }
  },
  'Mumbai': {
    name: 'Mumbai, India',
    center: [19.0760, 72.8777],
    zoom: 11,
    zones: {
      'Downtown': [19.0760, 72.8777],
      'Industrial': [19.0360, 72.9177],
      'Residential': [19.1160, 72.8377],
      'Airport': [19.0560, 72.9577]
    }
  },
  'Chennai': {
    name: 'Chennai, India',
    center: [13.0827, 80.2707],
    zoom: 11,
    zones: {
      'Downtown': [13.0827, 80.2707],
      'Industrial': [13.0427, 80.3107],
      'Residential': [13.1227, 80.2307],
      'Airport': [13.0627, 80.3507]
    }
  },
  'São Paulo': {
    name: 'São Paulo, Brazil',
    center: [-23.5505, -46.6333],
    zoom: 11,
    zones: {
      'Downtown': [-23.5505, -46.6333],
      'Industrial': [-23.5905, -46.5933],
      'Residential': [-23.5105, -46.6733],
      'Airport': [-23.5705, -46.5533]
    }
  },
  'Cairo': {
    name: 'Cairo, Egypt',
    center: [30.0444, 31.2357],
    zoom: 11,
    zones: {
      'Downtown': [30.0444, 31.2357],
      'Industrial': [30.0044, 31.2757],
      'Residential': [30.0844, 31.1957],
      'Airport': [30.0244, 31.3157]
    }
  },
  'Sydney': {
    name: 'Sydney, Australia',
    center: [-33.8688, 151.2093],
    zoom: 11,
    zones: {
      'Downtown': [-33.8688, 151.2093],
      'Industrial': [-33.9088, 151.2493],
      'Residential': [-33.8288, 151.1693],
      'Airport': [-33.8888, 151.2893]
    }
  },
  'Mexico City': {
    name: 'Mexico City, Mexico',
    center: [19.4326, -99.1332],
    zoom: 11,
    zones: {
      'Downtown': [19.4326, -99.1332],
      'Industrial': [19.3926, -99.0932],
      'Residential': [19.4726, -99.1732],
      'Airport': [19.4126, -99.0532]
    }
  },
  'Paris': {
    name: 'Paris, France',
    center: [48.8566, 2.3522],
    zoom: 11,
    zones: {
      'Downtown': [48.8566, 2.3522],
      'Industrial': [48.8166, 2.3922],
      'Residential': [48.8966, 2.3122],
      'Airport': [48.8366, 2.4322]
    }
  },
  'Singapore': {
    name: 'Singapore',
    center: [1.3521, 103.8198],
    zoom: 11,
    zones: {
      'Downtown': [1.3521, 103.8198],
      'Industrial': [1.3121, 103.8598],
      'Residential': [1.3921, 103.7798],
      'Airport': [1.3321, 103.9098]
    }
  }
};

const NAV_ITEMS = [
  { id: 'dashboard', label: 'DASHBOARD GIS HUD', icon: BarChart3, roles: ['Admin', 'Engineer', 'Safety Officer', 'Technician'] },
  { id: 'compare', label: 'CITY COMPARISON', icon: Globe, roles: ['Admin', 'Engineer', 'Safety Officer'] },
  { id: 'insights', label: 'ECO INSIGHTS', icon: Leaf, roles: ['Admin', 'Engineer', 'Safety Officer', 'Technician'] },
  { id: 'copilot', label: 'AI Copilot', icon: MessageSquare, roles: ['Admin', 'Engineer', 'Safety Officer', 'Technician'] },
  { id: 'graph', label: 'KNOWLEDGE GRAPH', icon: Network, roles: ['Admin', 'Engineer', 'Safety Officer'] },
  { id: 'simulator', label: 'WHAT-IF URBAN TWIN', icon: Sparkles, roles: ['Admin', 'Engineer'] },
  { id: 'executive', label: 'EXECUTIVE COPILOT', icon: TrendingUp, roles: ['Admin', 'Safety Officer'] },
  { id: 'rca', label: 'ROOT CAUSE & DEBATE', icon: Zap, roles: ['Admin', 'Engineer', 'Safety Officer'] },
  { id: 'timeline', label: 'Historic Ops', icon: Clock, roles: ['Admin', 'Engineer', 'Technician'] },
  { id: 'upload', label: 'REGULATORY RAG', icon: Upload, roles: ['Admin', 'Safety Officer'] },
  { id: 'report', label: 'Audit Ledger', icon: FileText, roles: ['Admin', 'Engineer', 'Safety Officer', 'Technician'] },
];

const createMachineIcon = (tag, status) => {
  const color = status === 'Offline' ? 'bg-slate-400' : status === 'Critical' || status === 'Warning' ? 'bg-amber-500 animate-pulse' : 'bg-teal-500';
  return L.divIcon({
    className: 'custom-machine-icon',
    html: `<div class="relative w-10 h-10 rounded-lg ${color} border-2 border-slate-900 flex items-center justify-center font-bold text-slate-950 text-xs shadow-2xl">${tag}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
};

const createWorkerIcon = (name) => {
  const initial = name.split(' ').map(n => n[0]).join('');
  return L.divIcon({
    className: 'custom-worker-icon',
    html: `<div class="w-7 h-7 rounded-full bg-indigo-500 border border-slate-900 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">${initial}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

const TIMELINE_STATES = [
  {
    time: '08:00:00',
    title: 'Morning Operations Commenced',
    equipment: [
      { tag: 'STN-A', name: 'Station A - Downtown', location: 'Zone A (Downtown)', status: 'Online', healthScore: 94, rulDays: 180 },
      { tag: 'STN-B', name: 'Station B - Industrial', location: 'Zone B (Industrial)', status: 'Online', healthScore: 96, rulDays: 310 },
      { tag: 'STN-C', name: 'Station C - Residential', location: 'Zone C (Residential)', status: 'Online', healthScore: 92, rulDays: 120 },
      { tag: 'STN-D', name: 'Station D - Airport Area', location: 'Zone D (Airport Area)', status: 'Online', healthScore: 90, rulDays: 200 }
    ],
    sensors: [
      { id: 'SEN-STNA-PM25', name: 'Station A PM2.5', value: 45.0, unit: 'µg/m³', status: 'Normal' },
      { id: 'SEN-STNB-PM25', name: 'Station B PM2.5', value: 55.0, unit: 'µg/m³', status: 'Normal' },
      { id: 'SEN-MET-TEMP', name: 'Ambient Temperature', value: 30.5, unit: '°C', status: 'Normal' }
    ],
    incidents: []
  },
  {
    time: '08:30:00',
    title: 'Industrial Sector Emission Spike',
    equipment: [
      { tag: 'STN-A', name: 'Station A - Downtown', location: 'Zone A (Downtown)', status: 'Online', healthScore: 94, rulDays: 180 },
      { tag: 'STN-B', name: 'Station B - Industrial', location: 'Zone B (Industrial)', status: 'Warning', healthScore: 68, rulDays: 45 },
      { tag: 'STN-C', name: 'Station C - Residential', location: 'Zone C (Residential)', status: 'Online', healthScore: 92, rulDays: 120 },
      { tag: 'STN-D', name: 'Station D - Airport Area', location: 'Zone D (Airport Area)', status: 'Online', healthScore: 90, rulDays: 200 }
    ],
    sensors: [
      { id: 'SEN-STNA-PM25', name: 'Station A PM2.5', value: 45.0, unit: 'µg/m³', status: 'Normal' },
      { id: 'SEN-STNB-PM25', name: 'Station B PM2.5', value: 142.5, unit: 'µg/m³', status: 'Warning' },
      { id: 'SEN-MET-TEMP', name: 'Ambient Temperature', value: 30.5, unit: '°C', status: 'Normal' }
    ],
    incidents: [
      { id: 'INC-001', equipmentTag: 'STN-B', type: 'Industrial Emission Leak', severity: 'High', description: 'Particulate emission spike detected at Station B. PM2.5 crossed 140 µg/m³.', status: 'Active', timestamp: '2026-07-01T08:30:00Z' }
    ]
  }
];

const getInitialAuth = () => {
  const t = localStorage.getItem('token');
  if (!t) return { auth: false, token: null, user: null };
  try {
    const parts = t.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (payload.exp && payload.exp < Date.now() / 1000) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return { auth: false, token: null, user: null };
      }
      const user = localStorage.getItem('user');
      return {
        auth: true,
        token: t,
        user: user ? JSON.parse(user) : null
      };
    }
  } catch (e) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
  return { auth: false, token: null, user: null };
};

export default function App() {
  const initialAuth = getInitialAuth();
  const { toasts, addToast, removeToast } = useToasts();
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuth.auth);
  const [token, setToken] = useState(initialAuth.token);
  const [currentUser, setCurrentUser] = useState(initialAuth.user);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [secureLedger, setSecureLedger] = useState([]);

  // City Selection
  const [selectedCity, setSelectedCity] = useState('New Delhi');
  const [customCityCenters, setCustomCityCenters] = useState({});
  
  // Helper to resolve AQI info with Lucide icons for dashboard widgets
  const getAQIInfo = (aqi) => {
    if (aqi <= 50) {
      return { 
        level: 'Good', 
        color: 'text-green-600', 
        borderColor: 'border-green-500', 
        gradientFrom: 'from-green-400', 
        gradientTo: 'to-emerald-500', 
        emoji: '🟢', 
        icon: CheckCircle 
      };
    } else if (aqi <= 100) {
      return { 
        level: 'Moderate', 
        color: 'text-amber-500', 
        borderColor: 'border-amber-400', 
        gradientFrom: 'from-amber-400', 
        gradientTo: 'to-yellow-500', 
        emoji: '🟡', 
        icon: AlertTriangle 
      };
    } else if (aqi <= 150) {
      return { 
        level: 'Poor', 
        color: 'text-orange-500', 
        borderColor: 'border-orange-400', 
        gradientFrom: 'from-orange-400', 
        gradientTo: 'to-amber-600', 
        emoji: '🟠', 
        icon: AlertTriangle 
      };
    } else {
      return { 
        level: 'Critical', 
        color: 'text-red-500', 
        borderColor: 'border-red-500', 
        gradientFrom: 'from-red-400', 
        gradientTo: 'to-rose-600', 
        emoji: '🔴', 
        icon: AlertOctagon 
      };
    }
  };

  // Generate city config - either from presets or create a dynamic one
  const getCurrentCityConfig = () => {
    if (CITIES[selectedCity]) {
      return CITIES[selectedCity];
    }
    // Fallback to New Delhi coordinates while geocoding is in progress
    const coords = customCityCenters[selectedCity] || [28.6139, 77.2090];
    const [lat, lon] = coords;
    return {
      name: selectedCity,
      center: coords,
      zoom: 12,
      zones: {
        'Downtown': [lat, lon],
        'Industrial': [lat - 0.03, lon + 0.03],
        'Residential': [lat + 0.04, lon - 0.02],
        'Airport': [lat + 0.02, lon + 0.04]
      }
    };
  };
  
  const currentCityConfig = getCurrentCityConfig();

  // Asynchronously geocode custom cities via OpenStreetMap Nominatim API
  useEffect(() => {
    if (!selectedCity || selectedCity.trim() === '') return;
    if (CITIES[selectedCity]) return;
    if (customCityCenters[selectedCity]) return;

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(selectedCity)}&format=json&limit=1`,
          {
            headers: {
              'User-Agent': 'UrbanEcoOS/1.0'
            }
          }
        );
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            setCustomCityCenters(prev => ({
              ...prev,
              [selectedCity]: [lat, lon]
            }));
          }
        }
      } catch (error) {
        console.warn('Geocoding failed for custom city:', error);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [selectedCity, customCityCenters]);
  
  // Real Air Quality Data
  const [realAirQualityStations, setRealAirQualityStations] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [loadingAirQuality, setLoadingAirQuality] = useState(false);

  // Register Form States
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [registerName, setRegisterName] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerRole, setRegisterRole] = useState('Technician');
  const [registerDepartment, setRegisterDepartment] = useState('Operations');
  const [registerSuccess, setRegisterSuccess] = useState('');

  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole, setUserRole] = useState(JSON.parse(localStorage.getItem('user'))?.role || 'Engineer');
  const [mapLayer, setMapLayer] = useState('hybrid');
  const [equipment, setEquipment] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [logs, setLogs] = useState([]);
  
  // Replay timeline state
  const [timelineIndex, setTimelineIndex] = useState(-1);
  const [timelineMode, setTimelineMode] = useState(false);
  const [workflows, setWorkflows] = useState([]);
  const [factoryMemory, setFactoryMemory] = useState([]);
  const [learningLedger, setLearningLedger] = useState([]);

  // Simulator state
  const [simEquipment, setSimEquipment] = useState('STN-B');
  const [simAction, setSimAction] = useState('Divert heavy cargo vehicle traffic to Outer Bypass Corridor');
  const [simHours, setSimHours] = useState(24);
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);
  const [carbonPrice, setCarbonPrice] = useState(3500);
  const [penaltyPrice, setPenaltyPrice] = useState(15000);

  // Fault injector state
  const [simVib, setSimVib] = useState(false);
  const [simBoiler, setSimBoiler] = useState(false);
  const [simChiller, setSimChiller] = useState(false);

  // Chat/RAG State
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your Global Air Quality Intelligence assistant. Ask me about air quality standards, pollution control measures, emergency protocols, or regulatory compliance worldwide.', timestamp: new Date().toLocaleTimeString() }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // RCA & Multi-Agent debate state
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [rcaInput, setRcaInput] = useState('');
  const [rcaResult, setRcaResult] = useState(null);
  const [rcaLoading, setRcaLoading] = useState(false);
  const [agentDebate, setAgentDebate] = useState([]);
  const [debateLoading, setDebateLoading] = useState(false);

  const [highlightedNode, setHighlightedNode] = useState(null);
  const [complianceReport, setComplianceReport] = useState({ complianceScore: 100, complianceStatus: 'Compliant', violations: [], correctiveActions: [] });

  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('SOP');
  const [uploadContent, setUploadContent] = useState('');
  const [uploading, setUploading] = useState(false);

  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const prevIncidentCount = useRef(0);

  const [backendTimeline, setBackendTimeline] = useState([]);
  const [timelineReplayStates, setTimelineReplayStates] = useState(TIMELINE_STATES);

  const recognitionRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    const activeCount = incidents.filter(i => i.status === 'Active').length;
    if (prevIncidentCount.current > 0 && activeCount > prevIncidentCount.current) {
      const latest = incidents.find(i => i.status === 'Active');
      addToast(`New incident: ${latest?.type || 'Environmental alert'}`, 'error', 6000);
    }
    prevIncidentCount.current = activeCount;
  }, [incidents, addToast]);

  const apiFetch = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    const storedToken = localStorage.getItem('token') || token;
    if (storedToken) {
      headers['Authorization'] = `Bearer ${storedToken}`;
    }
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      handleLogout();
      throw new Error('Session expired. Please sign in again.');
    }
    if (res.status === 403) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'You do not have permission for this action.');
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.detail || `Request failed (${res.status})`);
    }
    return res;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setToken(null);
    setCurrentUser(null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setRegisterSuccess('');
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || 'Authentication failed');
        return;
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setCurrentUser(data.user);
      setUserRole(data.user.role);
      setIsAuthenticated(true);
      addToast(`Welcome back, ${data.user.name}!`, 'success');
      fetchLedger(data.token);
    } catch (err) {
      setLoginError('Could not contact authentication gateway.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoginError('');
    setRegisterSuccess('');
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: registerUsername,
          password: registerPassword,
          name: registerName,
          role: registerRole,
          department: registerDepartment
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || 'Registration failed');
        return;
      }
      setRegisterSuccess('Account successfully created! You can now Sign In.');
      setIsRegisterMode(false);
      setLoginUsername(registerUsername);
      setLoginPassword('');
    } catch (err) {
      setLoginError('Could not contact authentication gateway.');
    }
  };

  const fetchLedger = async (activeToken = null) => {
    const t = activeToken || token || localStorage.getItem('token');
    if (!t) return;
    try {
      const res = await fetch(`${API_BASE}/ledger`, {
        headers: { 'Authorization': `Bearer ${t}` }
      });
      if (res.status === 401 || res.status === 403) {
        handleLogout();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setSecureLedger(data);
      }
    } catch(e) {}
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const eventSource = new EventSource(`${API_BASE}/events`);
    eventSource.onmessage = (event) => {
      if (timelineMode) return;
      const data = JSON.parse(event.data);
      if (data.type === 'initial_state' || data.type === 'telemetry_update') {
        const payload = data.payload;
        if (payload.equipment) setEquipment(payload.equipment);
        if (payload.telemetry) setSensors(payload.telemetry);
        if (payload.workers) setWorkers(payload.workers);
        if (payload.maintenance) setMaintenance(payload.maintenance);
        if (payload.incidents) setIncidents(payload.incidents);
        if (payload.documents) setDocuments(payload.documents);
        if (payload.notifications) setNotifications(payload.notifications);
        if (payload.logs) setLogs(payload.logs);
      }
      if (data.type === 'workflow_update' && data.payload) {
        setWorkflows(prev => prev.map(wf => wf.id === data.payload.id ? data.payload : wf));
      }
    };

    fetch(`${API_BASE}/memory`).then(r => r.json()).then(d => setFactoryMemory(d)).catch(e => {});
    fetch(`${API_BASE}/learning`).then(r => r.json()).then(d => setLearningLedger(d)).catch(e => {});
    fetch(`${API_BASE}/workflows`).then(r => r.json()).then(d => setWorkflows(d)).catch(e => {});
    fetch(`${API_BASE}/timeline`).then(r => r.json()).then(d => setBackendTimeline(d)).catch(e => {});
    fetchLedger();

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onresult = (e) => {
        setChatInput(e.results[0][0].transcript);
        setIsListening(false);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
    }
    return () => eventSource.close();
  }, [timelineMode, isAuthenticated]);

  useEffect(() => {
    if (backendTimeline.length > 0 && equipment.length > 0) {
      const states = buildTimelineReplayStates(backendTimeline, equipment, sensors, incidents);
      if (states.length > 0) setTimelineReplayStates(states);
    }
  }, [backendTimeline, equipment, sensors, incidents]);

  useEffect(() => {
    if (sensors.length > 0 && !timelineMode) {
      aiRequest('/agent/compliance', { sensors, incidents })
        .then(data => setComplianceReport(data))
        .catch(err => console.warn('Compliance check failed', err.message));
    }
  }, [sensors, incidents, timelineMode]);

  // Fetch real air quality data when city changes (debounced)
  useEffect(() => {
    if (!isAuthenticated) {
      console.log('Not authenticated, skipping air quality fetch');
      return;
    }
    
    // Basic validation
    if (!selectedCity || typeof selectedCity !== 'string') {
      console.log('Invalid selectedCity type:', typeof selectedCity, selectedCity);
      return;
    }
    
    const trimmedCity = selectedCity.trim();
    if (trimmedCity === '') {
      console.log('Empty city name after trimming');
      return;
    }
    
    console.log(`Debouncing air quality fetch for: "${trimmedCity}"`);
    
    // Debounce: Wait 800ms after user stops typing
    const debounceTimer = setTimeout(async () => {
      console.log(`Fetching air quality for: "${trimmedCity}"`);
      setLoadingAirQuality(true);
      
      // Get current config for this city
      const config = CITIES[trimmedCity]
        ? CITIES[trimmedCity]
        : customCityCenters[trimmedCity]
        ? { center: customCityCenters[trimmedCity], name: trimmedCity, zoom: 12, zones: {
            'Downtown': customCityCenters[trimmedCity],
            'Industrial': [customCityCenters[trimmedCity][0] - 0.03, customCityCenters[trimmedCity][1] + 0.03],
            'Residential': [customCityCenters[trimmedCity][0] + 0.04, customCityCenters[trimmedCity][1] - 0.02],
            'Airport': [customCityCenters[trimmedCity][0] + 0.02, customCityCenters[trimmedCity][1] + 0.04],
          }}
        : { center: [28.6139, 77.2090], name: trimmedCity, zoom: 12 };
      
      try {
        const stations = await fetchCityAirQuality(trimmedCity, config.center);
        
        if (stations && stations.length > 0) {
          const merged = mergeBackendSensors(stations, sensors, trimmedCity);
          setRealAirQualityStations(merged);
          
          // Update custom city center with REAL coordinates from API
          const mainStation = stations.find(s => s.id === 'main') || stations[0];
          if (mainStation && !CITIES[trimmedCity]) {
            console.log(`Updating map center for "${trimmedCity}":`, [mainStation.lat, mainStation.lng]);
            setCustomCityCenters(prev => ({
              ...prev,
              [trimmedCity]: [mainStation.lat, mainStation.lng]
            }));
          }
          
          // Generate heatmap data from stations
          const heatmap = generateHeatmapData(merged, config);
          setHeatmapData(heatmap);
        } else {
          console.warn(`No air quality stations returned for ${trimmedCity}`);
          // If no stations, clear data
          setRealAirQualityStations([]);
          setHeatmapData([]);
        }
      } catch (error) {
        console.error('Failed to fetch air quality data:', error);
        // Clear data on error
        setRealAirQualityStations([]);
        setHeatmapData([]);
      } finally {
        setLoadingAirQuality(false);
      }
    }, 800); // Wait 800ms after user stops typing
    
    // Cleanup: Cancel previous timer if user types again
    return () => clearTimeout(debounceTimer);
  }, [selectedCity, isAuthenticated, sensors, customCityCenters]);

  // Keep map stations in sync with live backend sensors for every city
  useEffect(() => {
    if (!isAuthenticated || timelineMode || !sensors.length) return;
    setRealAirQualityStations(prev => {
      if (!prev.length) return prev;
      const merged = mergeBackendSensors(prev, sensors, selectedCity.trim());
      const config = getCurrentCityConfig();
      setHeatmapData(generateHeatmapData(merged, config));
      return merged;
    });
  }, [sensors, isAuthenticated, timelineMode, selectedCity]);

  // Update sim action when equipment changes
  useEffect(() => {
    if (simEquipment === 'STN-B') {
      setSimAction('Divert heavy cargo vehicle traffic to Outer Bypass Corridor');
    } else if (simEquipment === 'STN-A') {
      setSimAction('Activate emergency public cooling shelter networks');
    } else if (simEquipment === 'STN-C') {
      setSimAction('Trigger automatic waterlogging underpass drainage pumps');
    }
  }, [simEquipment]);

  const toggleListening = () => {
    if (!recognitionRef.current) return alert("Speech recognition is not supported in this browser.");
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const speakText = (text) => {
    if (!ttsEnabled) return;
    const utterance = new SpeechSynthesisUtterance(text.replace(/[#*`>]/g, ''));
    window.speechSynthesis.speak(utterance);
  };

  const submitChat = async (prefillQuery = null) => {
    const query = prefillQuery || chatInput;
    if (!query.trim()) return;

    setChatMessages(prev => [...prev, { sender: 'user', text: query, timestamp: new Date().toLocaleTimeString() }]);
    setChatInput('');
    setIsTyping(true);

    try {
      const liveContext = {
        city: selectedCity,
        aqi: realAQI,
        aqiLevel: realAQIInfo.level,
        complianceScore: complianceReport.complianceScore,
        sensors: sensors.map(s => ({ id: s.id, name: s.name, value: s.value, unit: s.unit, status: s.status })),
        activeIncidents: incidents.filter(i => i.status === 'Active').map(i => ({ id: i.id, type: i.type, description: i.description })),
      };
      const data = await aiRequest('/rag/query', { query, context: liveContext });
      setChatMessages(prev => [...prev, {
        sender: 'ai',
        text: data.answer || 'No response received.',
        sources: data.sources || [],
        online: data.online,
        timestamp: new Date().toLocaleTimeString()
      }]);
      speakText(data.answer);
    } catch (e) {
      setChatMessages(prev => [...prev, { sender: 'ai', text: `Error: ${e.message}. Ensure the AI service is running on port 8000.`, timestamp: new Date().toLocaleTimeString() }]);
      addToast(e.message, 'error');
    } finally {
      setIsTyping(false);
    }
  };

  const runRca = async (incidentText, eqTag = 'Unknown', incidentId = null) => {
    setRcaLoading(true);
    setRcaResult(null);
    setAgentDebate([]);
    setDebateLoading(true);

    const debateId = incidentId || selectedIncident?.id || 'INC-001';
    fetch(`${API_BASE}/discussions/${debateId}`)
      .then(res => res.json())
      .then(d => setAgentDebate(Array.isArray(d) ? d : []))
      .catch(() => setAgentDebate([]))
      .finally(() => setDebateLoading(false));

    try {
      const data = await aiRequest('/agent/rca', { description: incidentText, equipmentTag: eqTag });
      setRcaResult(data);
    } catch(e) {
      addToast(`RCA analysis failed: ${e.message}`, 'error');
    } finally {
      setRcaLoading(false);
    }
  };

  const runDecisionSimulation = async () => {
    setSimLoading(true);
    setSimResult(null);
    try {
      const data = await aiRequest('/agent/simulate_decision', {
        action: `${simAction} (Duration: ${simHours} hours)`,
        equipmentTag: simEquipment,
        sensors
      });
      setSimResult(data);
      addToast('What-if simulation completed successfully', 'success');
    } catch (e) {
      addToast(`Simulation failed: ${e.message}`, 'error');
    } finally {
      setSimLoading(false);
    }
  };

  const executeRepair = async (tag) => {
    try {
      const response = await apiFetch(`${API_BASE}/maintenance`, {
        method: 'POST',
        body: JSON.stringify({
          equipmentTag: tag,
          type: 'Corrective',
          technician: currentUser ? currentUser.name : `${userRole} User`,
          details: `Manual intervention and sensor recalibration to clear warning thresholds.`,
          downtimeHours: 1.5,
          spareParts: ['Recalibration Kit'],
          priority: 'Medium'
        })
      });
      if (response.ok) {
        addToast(`Maintenance logged for ${tag}. Equipment health restored.`, 'success');
        fetch(`${API_BASE}/memory`).then(r => r.json()).then(d => setFactoryMemory(d));
      } else {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Maintenance request failed');
      }
    } catch(e) {
      addToast(`Failed to execute repair: ${e.message}`, 'error');
    }
  };

  const submitDocument = async () => {
    if (!uploadTitle || !uploadContent) {
      addToast('Title and content are required.', 'warning');
      return;
    }
    setUploading(true);
    try {
      const response = await apiFetch(`${API_BASE}/documents`, {
        method: 'POST',
        body: JSON.stringify({ title: uploadTitle, category: uploadCategory, content: uploadContent })
      });
      if (response.ok) {
        addToast('Document indexed and vectorized successfully.', 'success');
        setUploadTitle('');
        setUploadContent('');
        fetch(`${API_BASE}/learning`).then(r => r.json()).then(d => setLearningLedger(d));
      } else {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Indexing failed');
      }
    } catch (e) {
      addToast(`Indexing failed: ${e.message}`, 'error');
    } finally {
      setUploading(false);
    }
  };

  const runSimulatorToggle = async (label, endpoint, val, setState) => {
    setState(val);
    if (timelineMode) {
      setTimelineMode(false);
      setTimelineIndex(-1);
    }
    try {
      await apiFetch(`${API_BASE}${endpoint}`, { method: 'POST', body: JSON.stringify({ active: val }) });
      addToast(`${label} ${val ? 'activated' : 'deactivated'}`, val ? 'warning' : 'success');
    } catch (e) {
      addToast(`Simulation failed: ${e.message}`, 'error');
      setState(!val);
    }
  };

  const toggleVibSim = (val) => runSimulatorToggle('Industrial emission event', '/simulate/vibration', val, setSimVib);
  const toggleBoilerSim = (val) => runSimulatorToggle('Heatwave event', '/simulate/boiler', val, setSimBoiler);
  const toggleChillerSim = (val) => runSimulatorToggle('Flash flood event', '/simulate/chiller', val, setSimChiller);

  const handleTimelineScrub = (index) => {
    const idx = parseInt(index);
    setTimelineIndex(idx);
    if (idx === -1) {
      setTimelineMode(false);
    } else {
      setTimelineMode(true);
      const state = timelineReplayStates[idx];
      setEquipment(state.equipment);
      setSensors(state.sensors);
      setIncidents(state.incidents);
    }
  };

  const handleWorkflowTaskToggle = async (workflowId, taskId, currentStatus) => {
    const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    try {
      const updated = await apiRequest(`/workflows/${workflowId}/task`, {
        method: 'POST',
        body: JSON.stringify({ taskId, status: newStatus }),
      });
      setWorkflows(prev => prev.map(wf => wf.id === updated.id ? updated : wf));
    } catch (e) {
      addToast(`Workflow update failed: ${e.message}`, 'error');
    }
  };

  const plantHealth = Math.round(equipment.reduce((acc, eq) => acc + eq.healthScore, 0) / (equipment.length || 1));
  const activeAlarms = incidents.filter(i => i.status === 'Active');
  
  // Calculate real AQI from air quality stations
  const realAQI = realAirQualityStations && realAirQualityStations.length > 0
    ? Math.round(realAirQualityStations.reduce((acc, station) => acc + getStationAqi(station), 0) / realAirQualityStations.length)
    : plantHealth; // Fallback to equipment health if no real data
  
  // Calculate real AQI info for dashboard display
  const realAQIInfo = getAQIInfo(realAQI);

  // Executive Copilot Projections
  const executiveKPIs = {
    financialRisk: activeAlarms.length > 0 ? 142500 : 8500,
    safetyScore: complianceReport.complianceScore,
    energyPotential: simVib ? '4,820 kWh' : '1,200 kWh',
    activeIncidentsCount: activeAlarms.length
  };

  const financialProjections = [
    { name: 'Wk 1', risk: 8500, baseline: 8500, savings: 0 },
    { name: 'Wk 2', risk: activeAlarms.length > 0 ? 45000 : 8500, baseline: 8500, savings: activeAlarms.length > 0 ? 36500 : 0 },
    { name: 'Wk 3', risk: activeAlarms.length > 0 ? 98000 : 8500, baseline: 8500, savings: activeAlarms.length > 0 ? 89500 : 0 },
    { name: 'Wk 4', risk: activeAlarms.length > 0 ? 142500 : 8500, baseline: 8500, savings: activeAlarms.length > 0 ? 134000 : 0 }
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--bg-light)] flex items-center justify-center font-sans p-4 relative overflow-hidden">
        <div className="environmental-bg" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.08)_0%,transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.06)_0%,transparent_50%)] pointer-events-none" />

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="absolute top-6 right-6 p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition z-20"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-600" />}
        </button>

        <div className="w-full max-w-md hero-card p-8 relative z-10 fade-in shadow-2xl">
          {/* Logo and Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="icon-circle mb-4 w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-display font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent tracking-tight">
              {isRegisterMode ? 'Create Account' : 'Urban Eco OS'}
            </h2>
            <p className="text-sm text-gray-500 font-medium mt-2">
              {isRegisterMode ? 'Join the environmental intelligence platform' : 'Global Air Quality Intelligence Platform'}
            </p>
          </div>

          {registerSuccess && (
            <div className="mb-6 p-3 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-500/30 rounded-lg">
              <p className="text-teal-600 font-medium text-sm text-center">{registerSuccess}</p>
            </div>
          )}

          {isRegisterMode ? (
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Full Name</label>
                <input 
                  type="text" 
                  value={registerName} 
                  onChange={(e) => setRegisterName(e.target.value)} 
                  placeholder="Enter your full name" 
                  className="bg-gray-100/80 text-gray-800 font-bold border border-slate-700/50 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all" 
                  required 
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Username</label>
                <input 
                  type="text" 
                  value={registerUsername} 
                  onChange={(e) => setRegisterUsername(e.target.value)} 
                  placeholder="Choose a username" 
                  className="bg-gray-100/80 text-gray-800 font-bold border border-slate-700/50 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all font-mono" 
                  required 
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Role</label>
                <select 
                  value={registerRole} 
                  onChange={(e) => setRegisterRole(e.target.value)} 
                  className="bg-gray-100/80 text-blue-600 border border-slate-700/50 p-3 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                >
                  <option value="Admin">Admin - Full Access</option>
                  <option value="Engineer">Engineer - Analysis & Simulation</option>
                  <option value="Safety Officer">Safety Officer - Compliance</option>
                  <option value="Technician">Technician - Maintenance</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Department</label>
                <input 
                  type="text" 
                  value={registerDepartment} 
                  onChange={(e) => setRegisterDepartment(e.target.value)} 
                  placeholder="e.g. Environmental Monitoring" 
                  className="bg-gray-100/80 text-gray-800 font-bold border border-slate-700/50 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all" 
                  required 
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Password</label>
                <input 
                  type="password" 
                  value={registerPassword} 
                  onChange={(e) => setRegisterPassword(e.target.value)} 
                  placeholder="Create a secure password" 
                  className="bg-gray-100/80 text-gray-800 font-bold border border-slate-700/50 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all" 
                  required 
                />
              </div>

              {loginError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{loginError}</p>
                </div>
              )}

              <button 
                type="submit" 
                className="w-full mt-2 chrome-button py-3 text-sm font-semibold uppercase"
              >
                Create Account
              </button>
              
              <button 
                type="button" 
                onClick={() => { setIsRegisterMode(false); setLoginError(''); setRegisterSuccess(''); }} 
                className="w-full text-center text-gray-500 hover:text-blue-600 transition text-sm font-medium mt-2"
              >
                Already have an account? <span className="text-blue-600 font-semibold">Sign In</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Username</label>
                <input 
                  type="text" 
                  value={loginUsername} 
                  onChange={(e) => setLoginUsername(e.target.value)} 
                  placeholder="Enter your username" 
                  className="bg-gray-100/80 text-gray-800 font-bold border border-slate-700/50 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all font-mono" 
                  required 
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Password</label>
                <input 
                  type="password" 
                  value={loginPassword} 
                  onChange={(e) => setLoginPassword(e.target.value)} 
                  placeholder="Enter your password" 
                  className="bg-gray-100/80 text-gray-800 font-bold border border-slate-700/50 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all font-mono" 
                  required 
                />
              </div>

              {loginError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm text-center">{loginError}</p>
                </div>
              )}

              <button 
                type="submit" 
                className="w-full mt-2 chrome-button py-3 text-sm font-semibold uppercase"
              >
                Sign In
              </button>
              
              <button 
                type="button" 
                onClick={() => { setIsRegisterMode(true); setLoginError(''); setRegisterSuccess(''); }} 
                className="w-full text-center text-gray-500 hover:text-blue-600 transition text-sm font-medium mt-1"
              >
                Don't have an account? <span className="text-blue-600 font-semibold">Sign Up</span>
              </button>
            </form>
          )}

          {!isRegisterMode && (
            <div className="mt-6 pt-6 border-t border-gray-200/50">
              <div className="bg-gradient-to-r from-slate-900/80 to-slate-950/80 border border-blue-300/20 rounded-xl p-4">
                <p className="font-bold text-blue-600 uppercase mb-3 text-xs tracking-wide flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Demo Credentials
                </p>
                <p className="text-gray-500 mb-3 text-xs">Quick login with these test accounts:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-100/60 p-2 rounded border border-gray-200/50">
                    <p className="text-blue-600 font-bold">admin</p>
                    <p className="text-gray-500 text-[10px]">Full access</p>
                  </div>
                  <div className="bg-gray-100/60 p-2 rounded border border-gray-200/50">
                    <p className="text-amber-600 font-bold">engineer</p>
                    <p className="text-gray-500 text-[10px]">Simulations</p>
                  </div>
                  <div className="bg-gray-100/60 p-2 rounded border border-gray-200/50">
                    <p className="text-indigo-600 font-bold">safety</p>
                    <p className="text-gray-500 text-[10px]">Compliance</p>
                  </div>
                  <div className="bg-gray-100/60 p-2 rounded border border-gray-200/50">
                    <p className="text-emerald-600 font-bold">technician</p>
                    <p className="text-gray-500 text-[10px]">Maintenance</p>
                  </div>
                </div>
                <p className="text-blue-600/60 mt-3 text-center text-xs font-mono">
                  Password: <span className="font-bold text-blue-600">password123</span>
                </p>
              </div>
            </div>
          )}
        </div>
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </div>
    );
  }

  const visibleNavItems = NAV_ITEMS.filter(item => item.roles.includes(userRole));

  return (
    <div className="flex h-screen bg-[var(--bg-light)] text-gray-800 font-sans overflow-hidden">
      {sidebarOpen && <div className="sidebar-backdrop lg:hidden" onClick={() => setSidebarOpen(false)} />}
      
      {/* SIDEBAR */}
      <aside className={`w-64 chrome-sidebar flex flex-col justify-between shrink-0 print:hidden mobile-sidebar lg:relative lg:translate-x-0 ${sidebarOpen ? 'open' : ''}`}>
        <div>
          <div className="sidebar-brand px-5 py-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                  <Server className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-sm uppercase tracking-tight leading-tight">Urban Eco OS</h1>
                  <p className="text-[10px] font-medium mt-0.5">Global Environmental Monitoring</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded hover:bg-white/10 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="sidebar-user px-4 py-3 border-b flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{currentUser ? currentUser.name : 'Sarah Davis'}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wide">{userRole}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="text-[10px] shrink-0 px-2.5 py-1.5 rounded-md font-semibold transition">
              Sign Out
            </button>
          </div>

          <nav className="sidebar-nav p-3 flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-280px)] custom-scroll">
            {visibleNavItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                  className={`sidebar-nav-item flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition ${activeTab === item.id ? 'sidebar-nav-active' : ''}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200 bg-[#1a2332] flex flex-col gap-2.5">
          <p className="text-[10px] font-bold text-white tracking-wider flex items-center gap-1.5 uppercase">
            <Sliders className="w-3.5 h-3.5 text-blue-400" /> Event Simulator
          </p>
          <div className="flex flex-col gap-1.5">
            {(() => {
              const canSimulate = ['Admin', 'Safety Officer', 'Engineer'].includes(userRole);
              return (
                <>
                  {!canSimulate && (
                    <p className="text-[10px] text-amber-300 bg-amber-950/40 border border-amber-700/50 rounded p-2 leading-snug">
                      Sign in as Admin, Engineer, or Safety Officer to run simulations.
                    </p>
                  )}
                  <label className={`flex items-center justify-between text-[11px] p-2 rounded border ${canSimulate ? 'text-gray-200 bg-white/5 border-gray-600 cursor-pointer hover:bg-white/10' : 'text-gray-500 bg-gray-800/50 border-gray-700 cursor-not-allowed'}`} title={!canSimulate ? 'Requires Admin, Safety Officer, or Engineer role' : 'Trigger industrial zone PM2.5 spike'}>
                    <span>Industrial Emission Event</span>
                    <input type="checkbox" disabled={!canSimulate} checked={simVib} onChange={(e) => toggleVibSim(e.target.checked)} className="rounded text-cyan-500 w-3.5 h-3.5 disabled:opacity-30" />
                  </label>
                  <label className={`flex items-center justify-between text-[11px] p-2 rounded border ${canSimulate ? 'text-gray-200 bg-white/5 border-gray-600 cursor-pointer hover:bg-white/10' : 'text-gray-500 bg-gray-800/50 border-gray-700 cursor-not-allowed'}`} title={!canSimulate ? 'Requires Admin, Safety Officer, or Engineer role' : 'Trigger severe heatwave'}>
                    <span>Heatwave / Wildfire Smoke</span>
                    <input type="checkbox" disabled={!canSimulate} checked={simBoiler} onChange={(e) => toggleBoilerSim(e.target.checked)} className="rounded text-cyan-500 w-3.5 h-3.5 disabled:opacity-30" />
                  </label>
                  <label className={`flex items-center justify-between text-[11px] p-2 rounded border ${canSimulate ? 'text-gray-200 bg-white/5 border-gray-600 cursor-pointer hover:bg-white/10' : 'text-gray-500 bg-gray-800/50 border-gray-700 cursor-not-allowed'}`} title={!canSimulate ? 'Requires Admin, Safety Officer, or Engineer role' : 'Trigger flash flood / waterlogging'}>
                    <span>Flash Flood / Waterlogging</span>
                    <input type="checkbox" disabled={!canSimulate} checked={simChiller} onChange={(e) => toggleChillerSim(e.target.checked)} className="rounded text-cyan-500 w-3.5 h-3.5 disabled:opacity-30" />
                  </label>
                </>
              );
            })()}
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col min-w-0 bg-[var(--bg-light)] overflow-y-auto">
        <header className="h-auto min-h-[5rem] chrome-header flex flex-wrap items-center justify-between px-4 lg:px-8 py-3 gap-4 shrink-0 print:hidden">
          <div className="flex items-center gap-3 lg:gap-6">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 border border-gray-200">
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 chrome-omnibox min-w-0 lg:min-w-[320px] flex-1">
              <Activity className="w-5 h-5 text-blue-500" />
              <div className="flex items-center gap-3">
                <span className="hidden"></span>
                <input 
                  type="text"
                  list="cities-list"
                  value={selectedCity} 
                  onChange={(e) => setSelectedCity(e.target.value)}
                  placeholder="Search any city..."
                  className="bg-transparent text-gray-800 font-medium text-sm focus:outline-none cursor-text w-full placeholder-gray-500"
                />
                <datalist id="cities-list">
                  {Object.keys(CITIES).map(city => (
                    <option key={city} value={city}>{CITIES[city].name}</option>
                  ))}
                </datalist>
              </div>
            </div>
            {timelineMode && (
              <span className="chip chip-moderate flex items-center gap-2">
                <RotateCcw className="w-3.5 h-3.5 animate-spin" /> HISTORICAL REPLAY: {timelineReplayStates[timelineIndex].time}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 lg:gap-4 flex-wrap">
            <button
              onClick={() => setNotificationPanelOpen(true)}
              className="relative p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {activeAlarms.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {activeAlarms.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>
            {(() => {
              const AQIIcon = realAQIInfo.icon;
              return (
                <div className={`chrome-card px-5 py-3 shadow-lg border-l-4 ${realAQIInfo.borderColor}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${realAQIInfo.gradientFrom} ${realAQIInfo.gradientTo} flex items-center justify-center shadow-md`}>
                      <AQIIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="chrome-label-small text-[10px]">Air Quality Index</p>
                      <div className="flex items-center gap-2">
                        <p className={`text-4xl font-bold ${realAQIInfo.color}`}>{realAQI}</p>
                        <span className="text-2xl">{realAQIInfo.emoji}</span>
                      </div>
                      <p className={`text-[9px] font-semibold ${realAQIInfo.color}`}>{realAQIInfo.level}</p>
                      {realAirQualityStations && realAirQualityStations.length > 0 && realAirQualityStations[0].source && (
                        <p className="text-[8px] text-gray-500 mt-0.5">Source: {realAirQualityStations[0].source}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
            
            <div className={`chrome-card px-5 py-3 shadow-lg border-l-4 ${complianceReport.complianceScore >= 80 ? 'border-green-500' : complianceReport.complianceScore >= 60 ? 'border-amber-500' : 'border-red-500'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${complianceReport.complianceScore >= 80 ? 'bg-gradient-to-br from-green-400 to-emerald-500' : complianceReport.complianceScore >= 60 ? 'bg-gradient-to-br from-amber-400 to-yellow-500' : 'bg-gradient-to-br from-red-400 to-rose-600'}`}>
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="chrome-label-small text-[10px]">Compliance</p>
                  <p className={`text-4xl font-bold ${complianceReport.complianceScore >= 80 ? 'text-green-600' : complianceReport.complianceScore >= 60 ? 'text-amber-600' : 'text-red-600'}`}>{complianceReport.complianceScore}</p>
                  <p className={`text-[9px] font-semibold ${complianceReport.complianceScore >= 80 ? 'text-green-600' : complianceReport.complianceScore >= 60 ? 'text-amber-600' : 'text-red-600'}`}>{complianceReport.complianceStatus || 'Compliant'}</p>
                </div>
              </div>
            </div>
            
            <div className={`chrome-card px-5 py-3 shadow-lg border-l-4 ${activeAlarms.length > 0 ? 'border-red-500' : 'border-gray-300'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${activeAlarms.length > 0 ? 'bg-gradient-to-br from-red-400 to-rose-600 animate-pulse' : 'bg-gradient-to-br from-gray-300 to-gray-400'}`}>
                  <AlertOctagon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="chrome-label-small text-[10px]">Active Alerts</p>
                  <p className={`text-4xl font-bold ${activeAlarms.length > 0 ? 'text-red-600' : 'text-gray-400'}`}>{activeAlarms.length}</p>
                  <p className={`text-[9px] font-semibold ${activeAlarms.length > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                    {activeAlarms.length > 0 ? 'Attention Required' : 'All Clear'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-hidden flex flex-col">
          
          {/* TAB 1: DASHBOARD HUD & HEATMAP */}
          {activeTab === 'dashboard' && (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto pr-1">
              <div className="lg:col-span-8 flex flex-col gap-6">
                <div className="h-[500px] hero-card relative overflow-hidden flex flex-col map-container-modern">
                  <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between z-[400] relative">
                    <div className="flex items-center gap-3">
                      <div className="icon-circle w-10 h-10">
                        <Compass className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800 font-bold">Live Global Air Quality Map</p>
                        <p className="text-[10px] text-blue-600 font-mono">Real-time monitoring • {currentCityConfig.name}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setMapLayer('roadmap')} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${mapLayer === 'roadmap' ? 'chrome-active-tab border-blue-500' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>Roadmap</button>
                      <button onClick={() => setMapLayer('satellite')} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${mapLayer === 'satellite' ? 'chrome-active-tab border-blue-500' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>Satellite</button>
                      <button onClick={() => setMapLayer('hybrid')} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${mapLayer === 'hybrid' ? 'chrome-active-tab border-blue-500' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>Hybrid</button>
                    </div>
                  </div>
                  <div className="flex-1 z-10 relative">
                    {/* Google Maps with Air Quality Heatmap */}
                    {import.meta.env.VITE_GOOGLE_MAPS_API_KEY && import.meta.env.VITE_GOOGLE_MAPS_API_KEY !== 'YOUR_API_KEY_HERE' ? (
                      <AirQualityMap
                        city={{
                          center: { lat: currentCityConfig.center[0], lng: currentCityConfig.center[1] },
                          zoom: currentCityConfig.zoom,
                          name: currentCityConfig.name
                        }}
                        stations={realAirQualityStations}
                        zones={Object.entries(currentCityConfig.zones).map(([name, coords]) => ({
                          name,
                          center: { lat: coords[0], lng: coords[1] },
                          radius: 2200,
                          alert: activeAlarms.some(i => equipment.find(e => e.tag === i.equipmentTag)?.location === name)
                        }))}
                        heatmapData={heatmapData}
                        mapLayer={mapLayer}
                        onStationClick={(station) => {
                          setSelectedIncident({ 
                            equipmentTag: station.id, 
                            description: `Air quality analysis for ${station.name}` 
                          });
                          setActiveTab('rca');
                          runRca(`Air quality analysis for ${station.name}`, station.id);
                        }}
                      />
                    ) : (
                      /* Leaflet Fallback Map with Heatmap */
                      <div className="relative w-full h-full">
                        <MapContainer center={currentCityConfig.center} zoom={currentCityConfig.zoom} maxZoom={18} minZoom={3} attributionControl={false} style={{ height: "100%", width: "100%" }} key={`${selectedCity}-${currentCityConfig.center[0]}-${currentCityConfig.center[1]}`}>
                          <MapUpdater center={currentCityConfig.center} zoom={currentCityConfig.zoom} />
                          <TileLayer
                            url={
                              mapLayer === 'satellite' ? 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}' :
                              mapLayer === 'roadmap' ? 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}' :
                              'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
                            }
                          />
                          
                          {/* One AQI circle per station — sized to avoid overlap */}
                          {realAirQualityStations && realAirQualityStations.map(station => {
                            const aqi = getStationAqi(station);
                            const color = getAqiColor(aqi);
                            const radius = getStationCircleRadius(station, realAirQualityStations);
                            const hasIncident = activeAlarms.some(i => {
                              const zoneKey = { 'STN-A': 0, 'STN-B': 1, 'STN-C': 2, 'STN-D': 3 }[i.equipmentTag];
                              return zoneKey != null && realAirQualityStations[zoneKey]?.id === station.id;
                            });
                            return (
                              <Circle
                                key={`aqi-zone-${station.id}`}
                                center={[station.lat, station.lng]}
                                radius={radius}
                                pathOptions={{
                                  color: hasIncident ? '#ef4444' : color,
                                  fillColor: hasIncident ? '#ef4444' : color,
                                  fillOpacity: 0.22,
                                  weight: hasIncident ? 3 : 2,
                                  opacity: 0.9,
                                }}
                              />
                            );
                          })}

                          {/* AQI value markers */}
                          {realAirQualityStations && realAirQualityStations.map(station => {
                            const aqi = getStationAqi(station);
                            const color = getAqiColor(aqi);
                            const statusText = getAqiStatus(aqi);
                            
                            const aqiIcon = L.divIcon({
                              className: 'custom-aqi-marker',
                              html: `<div style="background: ${color}; color: white; border: 3px solid white; border-radius: 50%; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">${Math.round(aqi)}</div>`,
                              iconSize: [48, 48],
                              iconAnchor: [24, 24]
                            });
                            
                            return (
                              <Marker key={station.id} position={[station.lat, station.lng]} icon={aqiIcon}>
                                <Popup>
                                  <div className="min-w-[260px] p-3">
                                    <h3 className="font-bold text-slate-900 mb-3 text-sm flex items-center gap-2">
                                      <Droplets className="w-4 h-4 text-blue-500" />
                                      {station.name}
                                    </h3>
                                    <div className="space-y-2 text-xs">
                                      <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                                        <span className="text-slate-600 font-medium">AQI Level:</span>
                                        <span className={`font-bold px-2 py-1 rounded ${
                                          aqi > 200 ? 'bg-red-600 text-white' : 
                                          aqi > 150 ? 'bg-red-500 text-white' : 
                                          aqi > 100 ? 'bg-amber-500 text-white' : 
                                          aqi > 50 ? 'bg-yellow-500 text-slate-900' : 
                                          'bg-emerald-500 text-white'
                                        }`}>
                                          {Math.round(aqi)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-600">PM2.5:</span>
                                        <span className={`font-bold ${station.pm25 > 150 ? 'text-red-600' : station.pm25 > 100 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                          {station.pm25?.toFixed(1)} µg/m³
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-600">PM10:</span>
                                        <span className="font-bold text-slate-900">{station.pm10?.toFixed(1)} µg/m³</span>
                                      </div>
                                      <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-200">
                                        <span className="text-slate-600">Status:</span>
                                        <span className={`font-bold flex items-center gap-1 ${
                                          statusText === 'Good' ? 'text-emerald-600' : 
                                          statusText === 'Moderate' ? 'text-yellow-600' :
                                          'text-red-600'
                                        }`}>
                                          {statusText === 'Good' ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                                          {statusText}
                                        </span>
                                      </div>
                                    </div>
                                    <button 
                                      onClick={() => { 
                                        setSelectedIncident({ equipmentTag: station.id, description: `Air quality analysis for ${station.name}` }); 
                                        setActiveTab('rca'); 
                                        runRca(`Air quality analysis for ${station.name}`, station.id); 
                                      }} 
                                      className="w-full mt-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-xs font-bold py-2 px-3 rounded-lg transition-all shadow-sm hover:shadow-md"
                                    >
                                      View Details
                                    </button>
                                  </div>
                                </Popup>
                              </Marker>
                            );
                          })}
                        {equipment.map(eq => {
                          let displayStatus = eq.status;
                          if (timelineMode && eq.tag === 'STN-B') {
                            const pm25 = sensors.find(s => s.id === 'SEN-STNB-PM25')?.value;
                            displayStatus = pm25 > 90 ? 'Critical' : pm25 > 55 ? 'Warning' : 'Online';
                          }
                          const zoneCoords = getEquipmentZoneCoords(eq.tag, currentCityConfig.zones);
                          if (!zoneCoords) return null;
                          return (
                            <Marker key={eq.tag} position={zoneCoords} icon={createMachineIcon(eq.tag, displayStatus)}>
                              <Popup>
                                <div className="w-52 text-gray-800 font-bold text-xs bg-gray-50 p-3 rounded-lg">
                                  <p className="font-bold border-b border-gray-200 pb-2 mb-2 text-gray-900 text-sm">{eq.name}</p>
                                  <div className="space-y-1.5">
                                    <p className="font-mono text-[10px] text-blue-600 flex justify-between"><span>Status:</span><span className="font-bold">{eq.healthScore < 50 ? 'CRITICAL' : 'SAFE'}</span></p>
                                    <p className="flex justify-between"><span className="text-gray-500">Air Quality:</span><span className="font-bold text-teal-600">{eq.healthScore}%</span></p>
                                    <p className="flex justify-between"><span className="text-gray-500">Risk Level:</span><span className={`font-bold ${eq.healthScore < 50 ? 'text-red-400' : 'text-emerald-400'}`}>{eq.healthScore < 50 ? '88%' : '5%'}</span></p>
                                  </div>
                                  <button onClick={() => { setSelectedIncident({ equipmentTag: eq.tag, description: `Environmental audit for ${eq.tag}` }); setActiveTab('rca'); runRca(`Environmental audit for ${eq.tag}`, eq.tag); }} className="w-full mt-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white text-[11px] font-bold py-2 rounded-lg transition-all shadow-lg">Analyze Source</button>
                                </div>
                              </Popup>
                            </Marker>
                          );
                        })}
                        {workers.map(w => {
                          const zoneKey = WORKER_ZONE_MAP[w.zone];
                          const base = zoneKey && currentCityConfig.zones[zoneKey]
                            ? currentCityConfig.zones[zoneKey]
                            : (w.x && w.y ? [w.x, w.y] : currentCityConfig.center);
                          const jitter = w.id.charCodeAt(w.id.length - 1) % 5 * 0.001;
                          return (
                            <Marker
                              key={w.id}
                              position={[base[0] + jitter, base[1] - jitter]}
                              icon={createWorkerIcon(w.name)}
                            />
                          );
                        })}
                      </MapContainer>
                      
                      {/* Heatmap Legend - Floating Panel */}
                      <div className="absolute top-4 right-4 bg-white rounded-xl shadow-xl border border-gray-200 p-4 max-w-[280px] z-[1000]">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-blue-500" />
                            AQI Monitoring
                          </h3>
                        </div>

                        {/* AQI Categories */}
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center gap-2 text-xs">
                            <div className="w-6 h-6 rounded bg-emerald-500 border-2 border-white shadow-sm"></div>
                            <span className="flex-1 font-medium text-slate-700">Good (0-50)</span>
                            <span className="font-bold text-emerald-600">{realAirQualityStations?.filter(s => getStationAqi(s) <= 50).length || 0}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <div className="w-6 h-6 rounded bg-yellow-500 border-2 border-white shadow-sm"></div>
                            <span className="flex-1 font-medium text-slate-700">Moderate (51-100)</span>
                            <span className="font-bold text-yellow-600">{realAirQualityStations?.filter(s => {
                              const aqi = getStationAqi(s);
                              return aqi > 50 && aqi <= 100;
                            }).length || 0}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <div className="w-6 h-6 rounded bg-amber-500 border-2 border-white shadow-sm"></div>
                            <span className="flex-1 font-medium text-slate-700">Unhealthy (101-200)</span>
                            <span className="font-bold text-amber-600">{realAirQualityStations?.filter(s => {
                              const aqi = getStationAqi(s);
                              return aqi > 100 && aqi <= 200;
                            }).length || 0}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <div className="w-6 h-6 rounded bg-red-600 border-2 border-white shadow-sm"></div>
                            <span className="flex-1 font-medium text-slate-700">Hazardous (200+)</span>
                            <span className="font-bold text-red-600">{realAirQualityStations?.filter(s => getStationAqi(s) > 200).length || 0}</span>
                          </div>
                        </div>

                        {/* Total Zones */}
                        <div className="pt-3 border-t border-gray-200">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-medium text-slate-600">Total Monitoring Zones:</span>
                            <span className="font-bold text-slate-900">{realAirQualityStations?.length || 0}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1.5">One AQI zone per station — sized to avoid overlap</p>
                          {loadingAirQuality && (
                            <div className="mt-2 flex items-center gap-2 text-xs text-blue-600">
                              <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                              <span>Loading data...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    )}
                  </div>
                </div>

                <div className="hero-card p-5">
                  <div className="flex items-center gap-3 border-b border-gray-200 pb-3 mb-4">
                    <div className="icon-circle w-10 h-10">
                      <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800 font-bold">Environmental Telemetry Sensors</p>
                      <p className="text-[10px] text-blue-600 font-mono">Live air quality monitoring stations</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {sensors.map(s => (
                      <div key={s.id} className="metric-card p-4">
                        <p className="chrome-label-small text-[10px] truncate mb-1">{s.name}</p>
                        <p className="stat-value text-2xl">{s.value}<span className="text-sm text-gray-500"> {s.unit}</span></p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${s.status === 'Warning' ? 'bg-amber-500' : s.status === 'Critical' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                          <span className={`text-xs font-medium ${s.status === 'Warning' ? 'text-amber-600' : s.status === 'Critical' ? 'text-red-600' : 'text-green-600'}`}>{s.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col gap-6">
                <HealthAdvisory aqi={realAQI} cityName={currentCityConfig.name} />
                <PollutantTrendChart sensors={sensors} />

                <div className="hero-card p-4 flex flex-col max-h-96">
                  <p className="section-header text-sm border-b border-gray-200 pb-2 mb-3 flex justify-between items-center">
                    <span className="flex items-center gap-1.5">
                      <AlertOctagon className="w-4 h-4 text-red-500" /> 
                      <span>Active System Incidents</span>
                    </span></p>
                  <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto">
                    {activeAlarms.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                        <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                        <p className="text-xs font-bold">All parameters nominal</p>
                      </div>
                    ) : (
                      activeAlarms.map(inc => (
                        <div key={inc.id} className="aqi-status-unhealthy p-3 rounded-lg flex flex-col gap-1.5">
                          <span className="font-mono text-[9px] text-red-600 font-bold uppercase">{inc.type}</span>
                          <p className="text-xs text-gray-800 leading-normal">{inc.description}</p>
                          
                          {/* Auto Workflow checklist indicator */}
                          <div className="border-t border-red-200 pt-2 my-1">
                            <p className="text-[8px] font-mono text-gray-500 uppercase font-bold mb-1">AUTO WORKFLOW GENERATED (WF-001)</p>
                            <div className="flex gap-1.5 text-[8.5px] text-gray-500">
                              <span>Checklist: 2/5 Completed</span>
                            </div>
                            <div className="flex gap-2 mt-2">
                              <button onClick={() => { setSelectedIncident(inc); setActiveTab('rca'); runRca(inc.description, inc.equipmentTag, inc.id); }} className="flex-1 bg-red-100 border border-red-300 text-red-700 text-[10px] py-1 rounded font-bold hover:bg-red-200 transition">SOURCE DEBATE</button>
                              {(() => {
                                const canRepair = ['Admin', 'Engineer', 'Technician'].includes(userRole);
                                return (
                                  <button disabled={!canRepair} onClick={() => executeRepair(inc.equipmentTag)} className={`flex-1 text-[10px] py-1 rounded font-bold transition ${canRepair ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`} title={!canRepair ? "Access Denied: Requires Technician/Engineer role" : "Log environmental mitigation action"}>INTERVENE</button>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="hero-card p-4 flex flex-col flex-1">
                  <p className="section-header text-sm border-b border-gray-200 pb-2 mb-3 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-500" /> 
                    <span>AI Operating Brain Directives</span>
                  </p>
                  <div className="flex-1 flex flex-col gap-3 overflow-y-auto text-xs text-gray-700">
                    {complianceReport.violations.map((v, i) => (
                      <div key={i} className="aqi-status-moderate p-2.5 rounded">
                        <p className="font-bold text-amber-700 mb-0.5">Eco Compliance Violation:</p>
                        <p>{v}</p>
                      </div>
                    ))}
                    <div className="metric-card p-2.5 flex flex-col gap-2">
                      <p className="font-bold text-gray-800 font-bold">Suggested City Directives:</p>
                      <button onClick={() => { setActiveTab('simulator'); setSimEquipment('STN-B'); setSimAction('Divert heavy vehicle traffic to Outer Bypass Corridor'); }} className="text-left bg-blue-50 p-2 rounded text-[10px] text-blue-700 hover:text-blue-900 hover:bg-blue-100 font-mono transition border border-blue-200">⚡ Run What-If: Divert vehicle traffic away from Commercial sectors?</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CITY COMPARISON */}
          {activeTab === 'compare' && (
            <CityComparison cities={CITIES} defaultCity={selectedCity} />
          )}

          {/* TAB: ECO INSIGHTS (additive — no changes to existing tabs) */}
          {activeTab === 'insights' && (
            <EcoInsights
              cityName={selectedCity}
              aqi={realAQI}
              sensors={sensors}
              equipment={equipment}
              incidents={incidents}
              complianceReport={complianceReport}
            />
          )}

          {/* TAB 2: COPILOT CHAT & VOICE ASSISTANT */}
          {activeTab === 'copilot' && (
            <CopilotChat
              chatMessages={chatMessages}
              chatInput={chatInput}
              setChatInput={setChatInput}
              isTyping={isTyping}
              isListening={isListening}
              ttsEnabled={ttsEnabled}
              setTtsEnabled={setTtsEnabled}
              onSubmit={submitChat}
              onToggleListening={toggleListening}
              liveContext={{
                city: selectedCity,
                aqi: realAQI,
                aqiLevel: realAQIInfo.level,
                complianceScore: complianceReport.complianceScore,
                sensors,
                activeIncidents: incidents.filter(i => i.status === 'Active'),
              }}
            />
          )}

          {/* TAB 3: KNOWLEDGE GRAPH */}
          {activeTab === 'graph' && (
            <div className="flex-1 flex flex-col hero-card overflow-hidden">
              <div className="p-5 modern-header border-b border-gray-200 shrink-0">
                <h2 className="font-bold text-lg text-gray-900 uppercase flex items-center gap-2"><Network className="w-5 h-5 text-teal-500" /> Urban Eco Knowledge Graph Relations</h2>
                <p className="text-[10px] text-gray-500 font-mono">Interactive SVG Relationship Visualizer: Stations, Sensors, Incidents, Officers, Regulations</p>
              </div>
              <div className="flex-1 relative bg-gray-100/50 p-6 flex items-center justify-center">
                <svg width="100%" height="100%" viewBox="0 0 800 480" className="max-w-3xl max-h-[420px]">
                  <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#334155" /></marker>
                    <marker id="arrow-active" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#06b6d4" /></marker>
                  </defs>
                  
                  {/* Edges */}
                  <g>
                    <line x1="250" y1="120" x2="150" y2="220" stroke={highlightedNode === 'C-201' ? '#06b6d4' : '#1e293b'} strokeWidth={highlightedNode === 'C-201' ? 3 : 1.5} markerEnd="url(#arrow)" />
                    <line x1="150" y1="220" x2="250" y2="320" stroke={highlightedNode === 'C-201' ? '#06b6d4' : '#1e293b'} strokeWidth={highlightedNode === 'C-201' ? 3 : 1.5} markerEnd="url(#arrow)" />
                    <line x1="250" y1="320" x2="400" y2="250" stroke={highlightedNode === 'C-201' ? '#06b6d4' : '#1e293b'} strokeWidth={highlightedNode === 'C-201' ? 3 : 1.5} markerEnd="url(#arrow)" />
                    <line x1="400" y1="250" x2="550" y2="220" stroke={highlightedNode === 'C-201' ? '#06b6d4' : '#1e293b'} strokeWidth={highlightedNode === 'C-201' ? 3 : 1.5} markerEnd="url(#arrow)" />
                    
                    <line x1="350" y1="120" x2="350" y2="220" stroke={highlightedNode === 'B-505' ? '#f59e0b' : '#1e293b'} strokeWidth={highlightedNode === 'B-505' ? 3 : 1.5} markerEnd="url(#arrow)" />
                    <line x1="350" y1="220" x2="250" y2="320" stroke={highlightedNode === 'B-505' ? '#f59e0b' : '#1e293b'} strokeWidth={highlightedNode === 'B-505' ? 3 : 1.5} markerEnd="url(#arrow)" />
                  </g>

                  {/* Nodes */}
                  <g>
                    <g onMouseEnter={() => setHighlightedNode('C-201')} onMouseLeave={() => setHighlightedNode(null)} className="cursor-pointer">
                      <circle cx="250" cy="120" r="28" fill="#0f172a" stroke="#0891b2" strokeWidth="3" />
                      <text x="250" y="123" textAnchor="middle" fill="#e2e8f0" fontSize="10" fontWeight="bold">STN-B</text>
                      <text x="250" y="85" textAnchor="middle" fill="#06b6d4" fontSize="8" fontWeight="bold" className="uppercase font-mono">Air Station</text>
                    </g>
                    <g onMouseEnter={() => setHighlightedNode('B-505')} onMouseLeave={() => setHighlightedNode(null)} className="cursor-pointer">
                      <circle cx="350" cy="120" r="28" fill="#0f172a" stroke="#d97706" strokeWidth="3" />
                      <text x="350" y="123" textAnchor="middle" fill="#e2e8f0" fontSize="10" fontWeight="bold">STN-A</text>
                      <text x="350" y="85" textAnchor="middle" fill="#f59e0b" fontSize="8" fontWeight="bold" className="uppercase font-mono">Meteo Hub</text>
                    </g>
                    <g className="cursor-pointer">
                      <rect x="110" y="200" width="80" height="35" rx="5" fill="#090f1c" stroke="#64748b" strokeWidth="1.5" />
                      <text x="150" y="215" textAnchor="middle" fill="#cbd5e1" fontSize="9" fontWeight="semibold">SEN-STNB-PM25</text>
                    </g>
                    <g className="cursor-pointer">
                      <rect x="310" y="200" width="80" height="35" rx="5" fill="#090f1c" stroke="#64748b" strokeWidth="1.5" />
                      <text x="350" y="215" textAnchor="middle" fill="#cbd5e1" fontSize="9" fontWeight="semibold">SEN-MET-TEMP</text>
                    </g>
                    <g className="cursor-pointer">
                      <polygon points="250,290 280,335 220,335" fill="#0f172a" stroke="#ef4444" strokeWidth="2.5" />
                      <text x="250" y="325" textAnchor="middle" fill="#fca5a5" fontSize="8" fontWeight="bold">INC-001</text>
                    </g>
                    <g className="cursor-pointer">
                      <circle cx="400" cy="250" r="22" fill="#0f172a" stroke="#6366f1" strokeWidth="2" />
                      <text x="400" y="253" textAnchor="middle" fill="#e2e8f0" fontSize="8" fontWeight="bold">Alice J.</text>
                    </g>
                    <g className="cursor-pointer">
                      <rect x="510" y="200" width="80" height="40" rx="3" fill="#0f172a" stroke="#059669" strokeWidth="2" />
                      <text x="550" y="215" textAnchor="middle" fill="#34d399" fontSize="9" fontWeight="bold">SOP-101</text>
                    </g>
                  </g>
                </svg>

                <div className="absolute bottom-4 left-4 bg-gray-100/90 border border-gray-200 p-4 rounded-lg text-xs w-64 backdrop-blur-md">
                  <p className="text-blue-600 font-bold border-b border-gray-200 pb-1 mb-2 font-mono uppercase tracking-wide">Node Explorer</p>
                  {highlightedNode ? (
                    <p className="text-gray-500">{highlightedNode === 'C-201' ? 'Station STN-B is currently monitored via PM2.5 sensor SEN-STNB-PM25. Linked to active environmental warning INC-001, technician Alice, and manual SOP-101.' : 'Station STN-A air temperature is linked to emergency heatwave protocol SOP-301 and sensor SEN-MET-TEMP.'}</p>
                  ) : (
                    <p className="text-gray-500 font-mono">Hover over main equipment nodes to view connected paths.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WHAT-IF SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto pr-1">
              <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm border border-gray-200 rounded-xl p-5 shadow-xl">
                  <h3 className="text-xs font-bold text-gray-800 font-bold border-b border-gray-200 pb-2 mb-4 uppercase tracking-wide flex items-center gap-1.5">
                    <Sliders className="w-4.5 h-4.5 text-blue-600 animate-spin" /> Scenario Controls
                  </h3>

                  <div className="flex flex-col gap-4 text-xs">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-gray-500 font-mono">SELECT TARGET SECTOR:</label>
                      <select value={simEquipment} onChange={(e) => setSimEquipment(e.target.value)} className="bg-gray-100 text-blue-600 border border-gray-200 p-2.5 rounded-lg text-xs font-mono font-bold" >
                        <option value="STN-B">Station B - Industrial Area</option>
                        <option value="STN-A">Station A - Commercial Center</option>
                        <option value="STN-C">Station C - Residential District</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-gray-500 font-mono">PROPOSED MUNICIPAL POLICY ACTION:</label>
                      <select value={simAction} onChange={(e) => setSimAction(e.target.value)} className="bg-gray-100 text-gray-800 font-bold border border-gray-200 p-2.5 rounded-lg text-xs" >
                        {simEquipment === 'STN-B' && (
                          <>
                            <option value="Divert heavy cargo vehicle traffic to Outer Bypass Corridor">Divert vehicle traffic to Outer Bypass Corridor</option>
                            <option value="Pause commercial construction and excavation within 2km">Pause construction and excavation within 2km</option>
                            <option value="Initiate gridded water spraying along road corridors">Initiate water spraying along road corridors</option>
                            <option value="Enforce temporary industrial emission limits">Enforce temporary industrial emission limits</option>
                            <option value="Deploy mobile air quality monitoring units">Deploy mobile monitoring units</option>
                          </>
                        )}
                        {simEquipment === 'STN-A' && (
                          <>
                            <option value="Activate emergency public cooling shelter networks">Activate emergency cooling shelter networks</option>
                            <option value="Enforce outdoor labor shift suspension during peak hours (12 PM - 4 PM)">Enforce outdoor labor shift suspension (12-4 PM)</option>
                            <option value="Implement congestion pricing for downtown traffic">Implement congestion pricing for downtown</option>
                            <option value="Activate public transit fare reduction program">Activate transit fare reduction program</option>
                            <option value="Deploy emergency medical response teams">Deploy emergency medical teams</option>
                          </>
                        )}
                        {simEquipment === 'STN-C' && (
                          <>
                            <option value="Trigger automatic waterlogging underpass drainage pumps">Trigger underpass drainage pumps</option>
                            <option value="Issue residential outdoor activity advisory">Issue outdoor activity advisory</option>
                            <option value="Activate community air purification centers">Activate air purification centers</option>
                            <option value="Distribute N95 masks to vulnerable populations">Distribute N95 masks to residents</option>
                            <option value="Deploy neighborhood green barrier planting">Deploy green barrier planting</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
                        <span>SIMULATION RANGE:</span>
                        <span className="text-blue-600 font-bold">{simHours} Hours</span>
                      </div>
                      <input type="range" min={12} max={72} value={simHours} onChange={(e) => setSimHours(parseInt(e.target.value))} className="w-full accent-blue-600 bg-gray-100 rounded-lg appearance-none h-1.5" />
                    </div>

                    <button onClick={runDecisionSimulation} disabled={simLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-xs tracking-wider transition uppercase mt-2 shadow-md flex items-center justify-center gap-2" >
                      {simLoading ? (
                        <>
                          <Activity className="w-4 h-4 animate-spin" /> SIMULATING OUTCOMES...
                        </>
                      ) : (
                        'EXECUTE SCENARIO PROJECTION'
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 flex flex-col gap-6">
                {simResult ? (
                  <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
                      <div className="bg-white border border-gray-200 rounded-xl shadow-sm border border-gray-200 rounded-xl p-3">
                        <p className="text-[9px] text-gray-500 font-mono uppercase">Exceedance Probability</p>
                        <p className={`text-lg font-black mt-1 ${simResult.failureProbability > 70 ? 'text-red-500' : simResult.failureProbability > 30 ? 'text-amber-400' : 'text-teal-600'}`}>{simResult.failureProbability}%</p>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-xl shadow-sm border border-gray-200 rounded-xl p-3">
                        <p className="text-[9px] text-gray-500 font-mono uppercase">Public Health Risk</p>
                        <p className={`text-lg font-black mt-1 ${simResult.safetyRisk === 'Critical' || simResult.safetyRisk === 'High' ? 'text-red-500' : 'text-teal-600'}`}>{simResult.safetyRisk}</p>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-xl shadow-sm border border-gray-200 rounded-xl p-3">
                        <p className="text-[9px] text-gray-500 font-mono uppercase">Health Improvement</p>
                        <p className="text-lg font-black text-teal-600 mt-1">+{simResult.productionLoss}%</p>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-xl shadow-sm border border-gray-200 rounded-xl p-3">
                        <p className="text-[9px] text-gray-500 font-mono uppercase">Intervention Budget</p>
                        <p className="text-lg font-black text-red-500 mt-1">₹{simResult.downtimeCost.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white border border-gray-200 rounded-xl shadow-sm border border-gray-200 rounded-xl p-4 h-64">
                        <p className="text-[10px] font-bold text-gray-800 font-bold border-b border-gray-200 pb-1.5 mb-2 font-mono uppercase tracking-wide">Projected PM2.5 & Budget Accumulator</p>
                        <ResponsiveContainer width="100%" height="85%">
                          <LineChart data={simResult.chartData}>
                            <CartesianGrid stroke="#5f6368" strokeDasharray="3 3" />
                            <XAxis dataKey="step" stroke="#5f6368" fontSize={9} />
                            <YAxis yAxisId="left" stroke="#ef4444" fontSize={9} />
                            <YAxis yAxisId="right" orientation="right" stroke="#5f6368" fontSize={9} />
                            <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#dadce0', fontSize: 10 }} />
                            <Legend wrapperStyle={{ fontSize: 9 }} />
                            <Line yAxisId="left" type="monotone" dataKey="probability" stroke="#ef4444" name="PM2.5 Conc" strokeWidth={2} />
                            <Line yAxisId="right" type="monotone" dataKey="cost" stroke="#06b6d4" name="Budget (₹)" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-xl shadow-sm border border-gray-200 rounded-xl p-4 flex flex-col justify-between text-xs">
                        <div>
                          <p className="text-[10px] font-bold text-gray-800 font-bold border-b border-gray-200 pb-1.5 mb-2 font-mono uppercase tracking-wide">Environmental & Compliance Impact</p>
                          <div className="flex flex-col gap-2.5 text-gray-500">
                            <div className="p-2.5 bg-gray-50 border border-gray-200 rounded">
                              <p className="font-bold text-amber-500 text-[10px] font-mono">ENVIRONMENTAL BENEFIT:</p>
                              <p>{simResult.environmentalImpact}</p>
                              <p className="text-[9px] text-gray-500 mt-1">Projected Carbon Cut: {simResult.energyConsumption} Tons CO2e</p>
                            </div>
                            <div className="p-2.5 bg-gray-50 border border-gray-200 rounded">
                              <p className="font-bold text-rose-500 text-[10px] font-mono">REGULATORY AUDIT:</p>
                              <p>{simResult.complianceImpact}</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-blue-50 border border-blue-300/30 rounded-lg mt-3">
                          <p className="text-[10px] font-black text-blue-600 flex items-center gap-1 mb-0.5"><CheckCircle className="w-3.5 h-3.5" /> REVENUE RECOMMENDATION DIRECTIVE:</p>
                          <p className="text-xs text-blue-800 leading-normal font-semibold">{simResult.recommendedDecision}</p>
                        </div>
                      </div>
                    </div>

                    {/* Economic Twin Calculator Card */}
                    <div className="chrome-card p-6 flex flex-col gap-4">
                      <div className="border-b border-gray-200 pb-2 flex justify-between items-center">
                        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide flex items-center gap-1.5">
                          <DollarSign className="w-4.5 h-4.5 text-green-600" /> Carbon Credit & Taxation Policy Model (Economic Twin)
                        </h4>
                        <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 font-mono px-2.5 py-0.5 rounded uppercase font-bold">Interactive Dynamic Model</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                        {/* Sliders Area */}
                        <div className="flex flex-col gap-4 border-r border-gray-200 pr-6">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center text-[10px] text-gray-600 font-mono">
                              <span>CARBON OFFSET PRICE:</span>
                              <span className="text-blue-600 font-bold">₹{carbonPrice.toLocaleString()} / Ton</span>
                            </div>
                            <input type="range" min={1000} max={10000} step={500} value={carbonPrice} onChange={(e) => setCarbonPrice(parseInt(e.target.value))} className="w-full accent-blue-600 bg-gray-100 rounded-lg appearance-none h-1.5 cursor-pointer" />
                          </div>
                          
                          <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center text-[10px] text-gray-600 font-mono">
                              <span>DAILY EMISSION PENALTY:</span>
                              <span className="text-blue-600 font-bold">₹{penaltyPrice.toLocaleString()} / unit PM2.5 &gt; 100</span>
                            </div>
                            <input type="range" min={5000} max={50000} step={2500} value={penaltyPrice} onChange={(e) => setPenaltyPrice(parseInt(e.target.value))} className="w-full accent-blue-600 bg-gray-100 rounded-lg appearance-none h-1.5 cursor-pointer" />
                          </div>
                        </div>
                        
                        {/* Computations Area */}
                        <div className="flex flex-col gap-2.5 justify-center border-r border-gray-200 pr-6 pl-2">
                          <div className="flex justify-between text-gray-600">
                            <span>Carbon Offset Earnings:</span>
                            <span className="font-semibold text-green-600">+₹{(simResult.energyConsumption * carbonPrice).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>Pollution Penalty Fees:</span>
                            <span className="font-semibold text-red-600">-₹{(Math.max(0, simResult.failureProbability - 100) * penaltyPrice).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-gray-600 border-b border-gray-100 pb-2">
                            <span>Policy Enactment Cost:</span>
                            <span className="font-semibold text-red-600">-₹{simResult.downtimeCost.toLocaleString()}</span>
                          </div>
                        </div>
                        
                        {/* Net Impact Area */}
                        <div className="flex flex-col justify-center items-center gap-1">
                          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Projected Net Fiscal Impact</span>
                          {(() => {
                            const netImpact = (simResult.energyConsumption * carbonPrice) - (Math.max(0, simResult.failureProbability - 100) * penaltyPrice) - simResult.downtimeCost;
                            const isPositive = netImpact >= 0;
                            return (
                              <>
                                <span className={`text-2xl font-black ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
                                  {isPositive ? '+' : '-'}₹{Math.abs(netImpact).toLocaleString()}
                                </span>
                                <span className={`text-[9px] px-2 py-0.5 rounded font-mono uppercase ${isPositive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                  {isPositive ? 'Fiscally Viable' : 'Demands Subsidy'}
                                </span>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    <div className="chrome-card p-5">
                      <p className="text-xs font-bold text-gray-800 border-b border-gray-200 pb-2 mb-3 uppercase tracking-wide flex items-center gap-1.5"><Shield className="w-4 h-4 text-blue-600" /> Explainable AI (XAI) Verification Ledger</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="flex flex-col gap-3">
                          <div>
                            <p className="font-mono text-[9px] text-blue-600 font-bold uppercase tracking-wider mb-1">Causal Factors (Why Decision Was Made)</p>
                            <ul className="list-disc pl-4 text-gray-700 flex flex-col gap-1.5 leading-normal">
                              {simResult.explainability.whyDecision.map((item, idx) => <li key={idx}>{item}</li>)}
                            </ul>
                          </div>
                          <div>
                            <p className="font-mono text-[9px] text-blue-600 font-bold uppercase tracking-wider mb-1">Referenced OEM Manuals & Regulations</p>
                            <div className="flex flex-wrap gap-1">
                              {simResult.explainability.documentsUsed.map((item, idx) => (
                                <span key={idx} className="bg-gray-100 text-[9px] px-2 py-0.5 rounded text-gray-500 border border-gray-200 font-mono">{item}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-3">
                          <div>
                            <p className="font-mono text-[9px] text-amber-500 font-bold uppercase tracking-wider mb-1">Alternative Options Considered</p>
                            <ul className="list-disc pl-4 text-gray-500 flex flex-col gap-1">
                              {simResult.explainability.alternatives.map((item, idx) => <li key={idx}>{item}</li>)}
                            </ul>
                          </div>
                          <div>
                            <p className="font-mono text-[9px] text-red-400 font-bold uppercase tracking-wider mb-1">Critical Consequences of Non-Action</p>
                            <ul className="list-disc pl-4 text-gray-500 flex flex-col gap-1">
                              {simResult.explainability.consequences.map((item, idx) => <li key={idx} className="text-rose-600">{item}</li>)}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm border border-gray-200 rounded-xl flex-1 flex flex-col items-center justify-center p-12 text-gray-500 shadow-xl min-h-[400px]">
                    <Sparkles className="w-12 h-12 text-slate-700 mb-3 animate-pulse" />
                    <p className="font-bold text-gray-500">What-If Operating Scenarios</p>
                    <p className="text-xs text-gray-500 mt-1">Select proposed actions on the left sidebar to run the digital twin simulator.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: EXECUTIVE COPILOT */}
          {activeTab === 'executive' && (
            <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-1">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 shrink-0">
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm border border-gray-200 rounded-xl p-4 flex flex-col justify-between">
                  <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">CUMULATIVE CITIZEN RISK</p>
                  <p className="text-2xl font-black text-rose-500 mt-2">High Exposure</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm border border-gray-200 rounded-xl p-4 flex flex-col justify-between">
                  <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">SAFETY COMPLIANCE SCORE</p>
                  <p className="text-2xl font-black text-teal-600 mt-2">{executiveKPIs.safetyScore}%</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm border border-gray-200 rounded-xl p-4 flex flex-col justify-between">
                  <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">CARBON REDUCTION POTENTIAL</p>
                  <p className="text-2xl font-black text-emerald-400 mt-2">12.4 Tons</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm border border-gray-200 rounded-xl p-4 flex flex-col justify-between">
                  <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">MITIGATION BUDGET UTILIZED</p>
                  <p className="text-2xl font-black text-blue-600 mt-2">₹1,75,000 <span className="text-xs text-gray-500 font-sans">this month</span></p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm border border-gray-200 rounded-xl p-5 h-72 shadow-xl">
                  <p className="text-xs font-bold text-gray-800 font-bold border-b border-gray-200 pb-2 mb-3 uppercase tracking-wide">Exceedance Risks Trend (Next 30 Days)</p>
                  <ResponsiveContainer width="100%" height="80%">
                    <AreaChart data={financialProjections}>
                      <CartesianGrid stroke="#5f6368" />
                      <XAxis dataKey="name" stroke="#5f6368" fontSize={9} />
                      <YAxis stroke="#5f6368" fontSize={9} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#dadce0', fontSize: 10 }} />
                      <Area type="monotone" dataKey="risk" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.1} name="AQI Exceedance Probability (%)" />
                      <Area type="monotone" dataKey="baseline" stroke="#0d9488" fill="#0d9488" fillOpacity={0.05} name="Safe Limit Baseline" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl shadow-sm border border-gray-200 rounded-xl p-5 h-72 shadow-xl">
                  <p className="text-xs font-bold text-gray-800 font-bold border-b border-gray-200 pb-2 mb-3 uppercase tracking-wide">Carbon footprint distribution (CO2 Tons/Yr)</p>
                  <ResponsiveContainer width="100%" height="80%">
                    <BarChart data={[
                      { name: 'STN-B Industrial Area', em: 120, opt: 95 },
                      { name: 'STN-A Commercial Center', em: 480, opt: 420 },
                      { name: 'STN-C Residential District', em: 80, opt: 45 }
                    ]}>
                      <CartesianGrid stroke="#5f6368" />
                      <XAxis dataKey="name" stroke="#5f6368" fontSize={8} />
                      <YAxis stroke="#5f6368" fontSize={9} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#dadce0', fontSize: 10 }} />
                      <Legend wrapperStyle={{ fontSize: 9 }} />
                      <Bar dataKey="em" fill="#ef4444" name="Current Emissions" />
                      <Bar dataKey="opt" fill="#10b981" name="Optimized Run" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl shadow-sm border border-gray-200 rounded-xl p-5 shadow-xl">
                <p className="text-xs font-bold text-gray-800 font-bold border-b border-gray-200 pb-2 mb-3 uppercase tracking-wide flex items-center justify-between">
                  <span>Executive Boardroom Decision Directives</span>
                  <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white hover:bg-blue-700 text-white text-[10px] py-1 px-3 rounded font-bold transition flex items-center gap-1"><Printer className="w-3.5 h-3.5" /> EXPORT REPORT</button>
                </p>
                <div className="flex flex-col gap-3 text-xs leading-relaxed text-gray-700">
                  <div className="p-3 bg-red-950/15 border border-red-500/20 rounded-lg">
                    <p className="font-bold text-red-600 text-xs font-mono uppercase mb-0.5">⚡ PARTICULATE SPIKE DIRECTIVE (STN-B Industrial Corridor)</p>
                    <p>Current stack emissions and cargo volume pose a <strong>92% probability of regulatory exceedance</strong> if continuously unmitigated. Diverting heavy trucks to the Bypass Corridor avoids this risk, lowering PM2.5 by 18%.</p>
                  </div>
                  <div className="p-3 bg-blue-50/70 border border-blue-300/20 rounded-lg">
                    <p className="font-bold text-blue-600 text-xs font-mono uppercase mb-0.5">⚡ HEATWAVE MITIGATION DIRECTIVE (STN-A Commercial Center)</p>
                    <p>Local ambient thermal indexes exceed 40°C. Opening cooling shelters and suspending manual outdoor labor shifts saves citizens from severe heat exhaustion incidents.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ROOT CAUSE ANALYSIS & AGENT DEBATE */}
          {activeTab === 'rca' && (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto pr-1">
              <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm border border-gray-200 rounded-xl p-4 shadow-xl">
                  <p className="text-xs font-bold text-gray-800 font-bold border-b border-gray-200 pb-2 mb-3 uppercase tracking-wide flex items-center gap-1.5"><Zap className="w-4 h-4 text-blue-600" /> Source Attribution Console</p>
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] text-gray-500 font-mono">CHOOSE ENVIRONMENTAL ALERT:</label>
                    <div className="flex flex-col gap-1.5">
                      {incidents.map(inc => (
                        <button key={inc.id} onClick={() => { setSelectedIncident(inc); runRca(inc.description, inc.equipmentTag, inc.id); }} className={`p-2 rounded text-left text-xs transition border ${selectedIncident?.id === inc.id ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                          <div className="flex justify-between font-mono text-[9px] mb-0.5 font-bold">
                            <span>{inc.id} - {inc.equipmentTag}</span>
                            <span className={inc.status === 'Active' ? 'text-red-400 animate-pulse' : 'text-gray-500'}>{inc.status}</span>
                          </div>
                          <p className="truncate text-[10px]">{inc.description}</p>
                        </button>
                      ))}
                    </div>

                    <div className="border-t border-gray-200/60 my-2 pt-3">
                      <label className="text-[10px] text-gray-500 font-mono block mb-1">OR ENTER CUSTOM FAILURE TEXT:</label>
                      <textarea value={rcaInput} onChange={(e) => setRcaInput(e.target.value)} placeholder="e.g. Ambient PM2.5 levels rose at Station B due to Sector 4 cement kiln exhaust..." rows={3} className="w-full bg-gray-100 text-gray-700 border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500" />
                      <button onClick={() => runRca(rcaInput)} disabled={rcaLoading} className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white hover:bg-blue-700 text-white font-bold text-xs py-2 rounded-lg transition">{rcaLoading ? 'Processing RCA...' : 'GENERATE RCA ANALYSIS'}</button>
                    </div>
                  </div>
                </div>

                {/* Multi-Agent Debate chat */}
                {agentDebate.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm border border-gray-200 rounded-xl p-4 shadow-xl flex flex-col max-h-[300px]">
                    <p className="text-[10px] font-bold text-gray-800 font-bold border-b border-gray-200 pb-2 mb-2 font-mono uppercase tracking-wide flex items-center gap-1.5"><Network className="w-4 h-4 text-blue-600" /> Multi-Agent Debate Arena</p>
                    <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1 text-[11px]">
                      {agentDebate.map((msg, idx) => (
                        <div key={idx} className="p-2 bg-gray-50 border border-gray-200 rounded">
                          <div className="flex justify-between font-mono text-[9px] mb-0.5 font-bold text-blue-600">
                            <span>{msg.agent}</span>
                            <span className="text-gray-500">{msg.timestamp}</span>
                          </div>
                          <p className="text-gray-700 leading-normal">{msg.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-8 flex flex-col gap-6">
                {rcaLoading ? (
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm border border-gray-200 rounded-xl flex-1 flex flex-col items-center justify-center p-12 text-gray-500 min-h-[400px]">
                    <Activity className="w-8 h-8 text-blue-600 animate-spin mb-3" />
                    <p className="font-bold">RCA Agent Processing Causal Analysis</p>
                  </div>
                ) : rcaResult ? (
                  <div className="flex-1 flex flex-col gap-6">
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm border border-gray-200 rounded-xl p-5 shadow-xl">
                      <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-3">
                        <p className="text-xs font-bold text-gray-800 font-bold uppercase tracking-wide">Ishikawa (Fishbone) Diagram</p>
                        <span className="bg-blue-50 text-blue-600 border border-cyan-850 text-[10px] font-mono px-2 py-0.5 rounded">Probability: {rcaResult.probability}%</span>
                      </div>
                      <div className="p-4 bg-gray-100/50 rounded-lg flex items-center justify-center">
                        <svg width="100%" height="220" viewBox="0 0 600 220" className="max-w-xl">
                          <line x1="40" y1="110" x2="520" y2="110" stroke="#475569" strokeWidth="4" />
                          <polygon points="520,103 540,110 520,117" fill="#475569" />
                          <rect x="535" y="90" width="60" height="40" rx="3" fill="#ef4444" />
                          <text x="565" y="115" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="black" className="uppercase font-mono">PROBLEM</text>
                          
                          <line x1="160" y1="40" x2="220" y2="110" stroke="#334155" strokeWidth="2" />
                          <text x="160" y="32" textAnchor="middle" fill="#06b6d4" fontSize="9" fontWeight="bold">EQUIPMENT</text>
                          <line x1="360" y1="40" x2="420" y2="110" stroke="#334155" strokeWidth="2" />
                          <text x="360" y="32" textAnchor="middle" fill="#06b6d4" fontSize="9" fontWeight="bold">PROCESS</text>
                          
                          <line x1="160" y1="180" x2="220" y2="110" stroke="#334155" strokeWidth="2" />
                          <text x="160" y="195" textAnchor="middle" fill="#06b6d4" fontSize="9" fontWeight="bold">OPERATOR</text>
                          <line x1="360" y1="180" x2="420" y2="110" stroke="#334155" strokeWidth="2" />
                          <text x="360" y="195" textAnchor="middle" fill="#06b6d4" fontSize="9" fontWeight="bold">ENVIRONMENT</text>

                          {rcaResult.fishbone && (
                            <>
                              <text x="110" y="65" fill="#94a3b8" fontSize="8">{rcaResult.fishbone.Equipment?.[0] || 'Hardware Anomaly'}</text>
                              <text x="140" y="85" fill="#94a3b8" fontSize="8">{rcaResult.fishbone.Equipment?.[1]}</text>
                              <text x="310" y="65" fill="#94a3b8" fontSize="8">{rcaResult.fishbone.Process?.[0] || 'Calibration Drift'}</text>
                              <text x="340" y="85" fill="#94a3b8" fontSize="8">{rcaResult.fishbone.Process?.[1]}</text>
                              <text x="110" y="155" fill="#94a3b8" fontSize="8">{rcaResult.fishbone.Operator?.[0] || 'Inspection Delayed'}</text>
                              <text x="310" y="155" fill="#94a3b8" fontSize="8">{rcaResult.fishbone.Environment?.[0] || 'Thermal Heat'}</text>
                            </>
                          )}
                        </svg>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm border border-gray-200 rounded-xl p-5 shadow-xl">
                      <p className="text-xs font-bold text-gray-800 font-bold border-b border-gray-200 pb-2 mb-3 uppercase tracking-wide flex items-center gap-1.5"><Clock className="w-4 h-4 text-blue-600" /> Causal Chain: 5 Whys Analysis</p>
                      <div className="relative pl-6 border-l-2 border-gray-200 ml-3 py-2 flex flex-col gap-4">
                        {rcaResult.five_whys?.map((why, i) => (
                          <div key={i} className="relative">
                            <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white border border-slate-900 flex items-center justify-center text-[9px] font-bold text-white shadow-md">{i + 1}</span>
                            <div className="bg-gray-50 p-2.5 rounded border border-gray-200 text-xs">
                              <p className="text-[9px] text-blue-600 font-mono font-bold tracking-wider mb-0.5">Why #{i + 1}?</p>
                              <p className="text-gray-700">{why}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* RCA Explainability Widget */}
                    {rcaResult.explainability && (
                      <div className="bg-white border border-gray-200 rounded-xl shadow-sm border border-gray-200 rounded-xl p-5 shadow-xl text-xs">
                        <p className="text-xs font-bold text-gray-800 font-bold border-b border-gray-200 pb-2 mb-3 uppercase tracking-wide flex items-center gap-1.5"><Shield className="w-4.5 h-4.5 text-blue-600" /> Explainable Decision Factors (RCA Agent)</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-3">
                            <div>
                              <p className="font-mono text-[9px] text-blue-600 font-bold uppercase mb-1">Causal Evidence</p>
                              <ul className="list-disc pl-4 text-gray-700 flex flex-col gap-1">
                                {rcaResult.explainability.whyDecision.map((item, idx) => <li key={idx}>{item}</li>)}
                              </ul>
                            </div>
                            <div>
                              <p className="font-mono text-[9px] text-blue-600 font-bold uppercase mb-1">Referenced Manuals / Regulations</p>
                              <div className="flex flex-wrap gap-1">
                                {rcaResult.explainability.documentsUsed.map((item, idx) => (
                                  <span key={idx} className="bg-gray-100 text-[9px] px-2 py-0.5 rounded text-gray-500 border border-gray-200 font-mono">{item}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-3">
                            <div>
                              <p className="font-mono text-[9px] text-amber-500 font-bold uppercase mb-1">Alternative Action Routes</p>
                              <ul className="list-disc pl-4 text-gray-500 flex flex-col gap-1">
                                {rcaResult.explainability.alternatives.map((item, idx) => <li key={idx}>{item}</li>)}
                              </ul>
                            </div>
                            <div>
                              <p className="font-mono text-[9px] text-red-400 font-bold uppercase mb-1">Direct Risk Consequences</p>
                              <ul className="list-disc pl-4 text-gray-500 flex flex-col gap-1">
                                {rcaResult.explainability.consequences.map((item, idx) => <li key={idx} className="text-rose-300">{item}</li>)}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm border border-gray-200 rounded-xl flex-1 flex flex-col items-center justify-center p-12 text-gray-500 shadow-xl min-h-[400px]">
                    <Zap className="w-12 h-12 text-slate-700 mb-3" />
                    <p className="font-bold text-gray-500">RCA Diagnostic Diagrams</p>
                    <p className="text-xs text-gray-500 mt-1">Select an incident from the side console or type a custom failure to start analysis.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: TIMELINE REPLAY & ACTIVE WORKFLOWS */}
          {activeTab === 'timeline' && (
            <div className="readable-panel flex-1 flex flex-col gap-6 overflow-y-auto pr-1">
              <div className="tab-panel p-5">
                <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-4">
                  <div>
                    <h3 className="tab-panel-title text-sm flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" /> Historic Operations Timeline
                    </h3>
                    <p className="tab-panel-subtitle">Scrub timeline to reconstruct sensor states from backend event log</p>
                  </div>
                  {timelineIndex !== -1 && (
                    <button onClick={() => handleTimelineScrub(-1)} className="btn-modern text-[10px] py-1.5 px-3">
                      Resume Live Feed
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  <input
                    type="range"
                    min="-1"
                    max={timelineReplayStates.length - 1}
                    value={timelineIndex}
                    onChange={(e) => handleTimelineScrub(e.target.value)}
                    className="w-full accent-blue-600 h-2 rounded-lg"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleTimelineScrub(-1)}
                      className={`text-[10px] px-3 py-1 rounded-full border font-mono ${timelineIndex === -1 ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-600 border-gray-200'}`}
                    >
                      LIVE
                    </button>
                    {timelineReplayStates.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => handleTimelineScrub(i)}
                        className={`text-[10px] px-3 py-1 rounded-full border font-mono ${timelineIndex === i ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                      >
                        {s.time}
                      </button>
                    ))}
                  </div>

                  {timelineIndex !== -1 && timelineReplayStates[timelineIndex] && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <p className="font-bold text-blue-700 text-sm mb-1">{timelineReplayStates[timelineIndex].title}</p>
                      <p className="text-gray-700 text-xs mb-2">{timelineReplayStates[timelineIndex].details}</p>
                      {timelineReplayStates[timelineIndex].zone && (
                        <p className="text-[10px] text-gray-500 font-mono">Zone: {timelineReplayStates[timelineIndex].zone}</p>
                      )}
                    </div>
                  )}

                  {timelineIndex !== -1 && timelineReplayStates[timelineIndex] && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {timelineReplayStates[timelineIndex].sensors.slice(0, 8).map(s => (
                        <div key={s.id} className="metric-card p-3 text-center">
                          <p className="text-[9px] text-gray-500 uppercase font-bold truncate">{s.name}</p>
                          <p className={`text-lg font-black ${s.status === 'Warning' ? 'text-amber-600' : 'text-gray-900'}`}>
                            {s.value}
                          </p>
                          <p className="text-[10px] text-gray-500">{s.unit}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Event chronology from backend */}
              <div className="tab-panel p-5">
                <p className="tab-section-title mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" /> Event Chronology ({backendTimeline.length} events)
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scroll">
                  {backendTimeline.map((evt, i) => (
                    <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-[10px] font-mono text-blue-600 font-bold shrink-0">{evt.timestamp}</span>
                      <div>
                        <p className="text-xs font-bold text-gray-900">{evt.title}</p>
                        <p className="text-[11px] text-gray-600">{evt.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Workflows checklist board */}
              <div className="tab-panel p-5 flex-1 flex flex-col">
                <p className="tab-section-title mb-4 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-blue-600" /> Incident Response Workflows
                </p>
                <div className="flex-1 overflow-y-auto flex flex-col gap-4 text-xs custom-scroll">
                  {workflows.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No active workflows</p>
                  ) : workflows.map(wf => (
                    <div key={wf.id} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-3">
                        <span className="font-bold text-red-600 text-sm">Incident {wf.incidentId} · {wf.equipmentTag}</span>
                        <span className="text-gray-500 font-mono text-[10px]">{wf.id}</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {wf.tasks.map(t => (
                          <label key={t.id} className="flex items-center gap-3 p-2 bg-white rounded border border-gray-200 cursor-pointer hover:bg-gray-50 transition">
                            <input type="checkbox" checked={t.status === 'Completed'} onChange={() => handleWorkflowTaskToggle(wf.id, t.id, t.status)} className="rounded w-4 h-4" />
                            <div className="flex-1 flex justify-between items-center">
                              <span className={t.status === 'Completed' ? 'line-through text-gray-400' : 'text-gray-800 font-semibold'}>{t.name}</span>
                              <span className={`text-[9px] font-mono px-2 py-0.5 rounded ${t.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                {t.assignedTo}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: DOCUMENT RAG & LEARNING LEDGER */}
          {activeTab === 'upload' && (
            <div className="flex-1 flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm border border-gray-200 rounded-xl overflow-hidden shadow-2xl">
              <div className="p-4 bg-gray-50 border-b border-gray-200 border-b border-gray-200 shrink-0">
                <h2 className="font-bold text-sm text-gray-900 uppercase flex items-center gap-1.5"><Upload className="w-4.5 h-4.5 text-blue-600" /> RAG Policy Indexer & Self-Learning Engine</h2>
                <p className="text-[10px] text-slate-500 font-mono">Upload city environmental plans, Graded Response (GRAP) manuals, and meteorological logs.</p>
              </div>

              <div className="flex-1 p-6 flex flex-col md:flex-row gap-6 overflow-y-auto">
                <div className="flex-1 flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-gray-500 font-mono">DOCUMENT TITLE:</label>
                      <input type="text" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder="e.g. SOP-302: HVAC Chiller Compressor Overhaul" className="bg-gray-100 text-gray-800 border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-gray-500 font-mono">CATEGORY:</label>
                      <select value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)} className="bg-gray-100 text-blue-600 border border-gray-200 p-2.5 rounded-lg text-xs" >
                        <option value="SOP">SOP (Standard Procedure)</option>
                        <option value="Manual">Manual (Station/Meteo Spec)</option>
                        <option value="Regulation">Regulation (Compliance Standard)</option>
                        <option value="ShiftLog">Shift Log / History</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-1.5 font-mono">
                    <label className="text-[10px] text-gray-500 font-mono">RAW CONTENT TEXT FOR SEMANTIC CHUNKING:</label>
                    <textarea value={uploadContent} onChange={(e) => setUploadContent(e.target.value)} placeholder="Paste raw manual or procedure content here. Double newlines chunk paragraphs." className="flex-1 bg-gray-100 text-gray-800 border border-gray-200 rounded-lg p-3 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono leading-relaxed" />
                  </div>

                  {(() => {
                    const canIndex = ['Admin', 'Safety Officer'].includes(userRole);
                    return (
                      <button disabled={uploading || !canIndex} onClick={submitDocument} className={`w-full font-bold py-2.5 rounded-lg text-xs tracking-wider transition uppercase shrink-0 ${canIndex ? 'bg-blue-600 hover:bg-blue-700 text-white hover:bg-blue-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`} title={!canIndex ? "Access Denied: Requires Safety Officer role" : "Vectorize manual into RAG index"}>
                        {uploading ? 'Processing & Chunk Indexing...' : 'INDEX DOCUMENT INTO OPERATING BRAIN'}
                      </button>
                    );
                  })()}
                </div>

                <div className="w-80 flex flex-col gap-4 shrink-0">
                  <div className="bg-gray-100/50 p-4 rounded-xl border border-gray-200 h-56 flex flex-col">
                    <p className="text-[10px] font-bold text-gray-800 font-bold border-b border-gray-200 pb-1.5 mb-2 font-mono uppercase">Indexed Knowledge Index ({documents.length})</p>
                    <div className="flex-1 overflow-y-auto flex flex-col gap-1.5">
                      {documents.map(doc => (
                        <div key={doc.id} className="p-2 bg-gray-50 border border-gray-200 rounded text-xs">
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="font-mono text-[8px] text-blue-600 font-bold uppercase">{doc.category}</span>
                            <span className="text-[8px] text-gray-500 font-mono">{doc.id}</span>
                          </div>
                          <p className="font-semibold text-gray-700 truncate">{doc.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Learning Engine Ledger */}
                  <div className="bg-gray-100/50 p-4 rounded-xl border border-gray-200 flex-1 flex flex-col">
                    <p className="text-[10px] font-bold text-gray-800 font-bold border-b border-gray-200 pb-1.5 mb-2 font-mono uppercase">Self-learning Ledger Logs</p>
                    <div className="flex-1 overflow-y-auto flex flex-col gap-2 text-[10px]">
                      {learningLedger.map((l, idx) => (
                        <div key={idx} className="p-2 bg-gray-50 border border-gray-200 rounded leading-normal">
                          <div className="flex justify-between font-mono text-[8px] mb-0.5 text-blue-600 font-bold">
                            <span>{l.type}</span>
                            <span className="text-gray-500">{l.version}</span>
                          </div>
                          <p className="text-gray-500">{l.details}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: AUDIT REPORT */}
          {activeTab === 'report' && (
            <div className="readable-panel flex-1 flex flex-col tab-panel overflow-hidden">
              <div className="tab-panel-header flex justify-between items-center print:hidden">
                <div>
                  <h2 className="tab-panel-title flex items-center gap-2">
                    <FileText className="w-5 h-5 text-teal-500" /> Secure Audit Ledger
                  </h2>
                  <p className="tab-panel-subtitle">Formal audit report with tamper-proof SHA-256 blockchain verification</p>
                </div>
                <button onClick={() => window.print()} className="btn-modern flex items-center gap-2">
                  <Printer className="w-4 h-4" /> Export Report
                </button>
              </div>

              <div className="flex-1 p-6 overflow-y-auto tab-panel-body flex flex-col xl:flex-row gap-6 print:bg-white print:p-0 custom-scroll">
                <div className="flex-1 max-w-4xl mx-auto border-2 border-gray-300 p-8 rounded-lg shadow-xl audit-report-doc min-h-[842px] flex flex-col print:border-none print:shadow-none">
                  <div>
                    <div className="flex justify-between items-start border-b-4 border-teal-600 pb-4 mb-6">
                      <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900">Environmental Audit Report</h1>
                        <p className="text-sm text-gray-600 font-semibold mt-1">Report ID: AUD-{new Date().toISOString().split('T')[0]}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Generated: {new Date().toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Auditor: {currentUser?.name || 'Environmental Officer'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold text-teal-600">Urban Eco OS</p>
                        <p className="text-xs text-gray-600 font-semibold">Environmental Intelligence</p>
                        <p className="text-xs text-gray-500 mt-1">City: {selectedCity}</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h2 className="text-sm font-black uppercase tracking-wider text-gray-900 border-b-2 border-gray-300 pb-2 mb-3">1.0 Executive Summary</h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-4">
                        <div className="metric-card text-center p-4">
                          <p className="stat-label text-[10px] mb-2">AIR QUALITY INDEX</p>
                          <p className={`text-3xl font-bold ${realAQI > 150 ? 'text-red-600' : realAQI > 100 ? 'text-amber-600' : 'text-green-600'}`}>{realAQI}</p>
                          <p className="text-[10px] text-gray-500">{realAQIInfo.level}</p>
                        </div>
                        <div className="metric-card text-center p-4">
                          <p className="stat-label text-[10px] mb-2">COMPLIANCE SCORE</p>
                          <p className={`text-3xl font-bold ${complianceReport.complianceScore >= 80 ? 'text-green-600' : complianceReport.complianceScore >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                            {complianceReport.complianceScore}
                          </p>
                          <p className="text-[10px] text-gray-500">{complianceReport.complianceStatus}</p>
                        </div>
                        <div className="metric-card text-center p-4">
                          <p className="stat-label text-[10px] mb-2">ACTIVE ALERTS</p>
                          <p className={`text-3xl font-bold ${activeAlarms.length > 0 ? 'text-red-600' : 'text-gray-400'}`}>{activeAlarms.length}</p>
                        </div>
                        <div className="metric-card text-center p-4">
                          <p className="stat-label text-[10px] mb-2">STATIONS ONLINE</p>
                          <p className="text-3xl font-bold text-teal-600">{equipment.filter(e => e.status === 'Online').length}/{equipment.length}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h2 className="text-sm font-black uppercase tracking-wider text-gray-900 border-b-2 border-gray-300 pb-2 mb-3">2.0 Live Sensor Readings</h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {sensors.slice(0, 9).map(s => (
                          <div key={s.id} className="metric-card p-3 flex justify-between items-center">
                            <span className="text-[10px] text-gray-600 font-medium">{s.name}</span>
                            <span className={`font-bold text-sm ${s.status === 'Warning' ? 'text-amber-600' : s.status === 'Critical' ? 'text-red-600' : 'text-gray-900'}`}>
                              {s.value} {s.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <h2 className="text-sm font-black uppercase tracking-wider text-gray-900 border-b-2 border-gray-300 pb-2 mb-3">3.0 Monitoring Stations Registry</h2>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-gray-100 border-b-2 border-gray-300">
                              <th className="py-2 px-3 font-bold text-gray-900">Station ID</th>
                              <th className="py-2 px-3 font-bold text-gray-900">Description</th>
                              <th className="py-2 px-3 font-bold text-gray-900">Location</th>
                              <th className="py-2 px-3 font-bold text-gray-900">Status</th>
                              <th className="py-2 px-3 text-right font-bold text-gray-900">Health Score</th>
                            </tr>
                          </thead>
                          <tbody>
                            {equipment.map(eq => (
                              <tr key={eq.tag} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="py-2 px-3 font-bold text-teal-600">{eq.tag}</td>
                                <td className="py-2 px-3 text-gray-700">{eq.name}</td>
                                <td className="py-2 px-3 text-gray-700">{eq.location}</td>
                                <td className="py-2 px-3">
                                  <span className={`px-2 py-1 rounded text-[10px] font-bold ${eq.status === 'Online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {eq.status}
                                  </span>
                                </td>
                                <td className="py-2 px-3 text-right font-bold text-gray-900">{eq.healthScore}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h2 className="text-sm font-black uppercase tracking-wider text-gray-900 border-b-2 border-gray-300 pb-2 mb-3">4.0 Regulatory Compliance Analysis</h2>
                      {complianceReport.violations.length === 0 ? (
                        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                          <p className="text-sm text-green-800 font-semibold flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" /> No regulatory violations detected in current monitoring period.
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {complianceReport.violations.map((v, i) => (
                            <div key={i} className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                              <p className="font-bold text-red-900 text-sm mb-1">Violation #{i + 1}</p>
                              <p className="text-gray-700 text-xs leading-relaxed">{v}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {complianceReport.correctiveActions?.length > 0 && (
                        <div className="mt-4">
                          <p className="text-xs font-bold text-gray-900 mb-2">Recommended Corrective Actions</p>
                          <ul className="list-disc pl-5 space-y-1">
                            {complianceReport.correctiveActions.map((a, i) => (
                              <li key={i} className="text-xs text-gray-700">{a}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {activeAlarms.length > 0 && (
                      <div className="mb-6">
                        <h2 className="text-sm font-black uppercase tracking-wider text-gray-900 border-b-2 border-gray-300 pb-2 mb-3">5.0 Active Incidents</h2>
                        {activeAlarms.map(inc => (
                          <div key={inc.id} className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded mb-2">
                            <p className="font-bold text-amber-900 text-sm">{inc.type}</p>
                            <p className="text-gray-700 text-xs mt-1">{inc.description}</p>
                            <p className="text-[10px] text-gray-500 mt-1 font-mono">Station: {inc.equipmentTag} · Severity: {inc.severity}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t-2 border-gray-300 pt-6 mt-8 flex justify-between items-end text-xs">
                    <div>
                      <p className="font-bold text-gray-900 mb-2">AUDITED BY:</p>
                      <div className="border-t-2 border-gray-400 pt-1 w-48">
                        <p className="text-gray-600">Environmental Officer</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 mb-2">VERIFIED BY:</p>
                      <div className="border-t-2 border-gray-400 pt-1 w-48">
                        <p className="text-gray-600">AI Compliance System</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tamper-Proof Cryptographic Ledger Panel */}
                <div className="w-full xl:w-96 tab-panel p-6 flex flex-col print:hidden max-h-[842px]">
                  <div className="border-b-2 border-teal-500 pb-3 mb-4">
                    <p className="text-base font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                      <Shield className="w-5 h-5 text-teal-500" /> Blockchain Ledger
                    </p>
                    <p className="text-[10px] text-gray-600 font-semibold mt-2 leading-relaxed">
                      Tamper-proof SHA-256 chain verification ensures immutable audit trail for compliance.
                    </p>
                  </div>
                  <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-2">
                    {secureLedger.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                        <Shield className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-sm font-medium">No ledger entries yet</p>
                        <p className="text-xs text-gray-400 mt-1">Actions will be recorded here</p>
                      </div>
                    ) : (
                      secureLedger.map((block, idx) => (
                        <div key={block.id} className="metric-card p-4 text-[10px] font-mono relative border-l-4 border-teal-500">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-teal-600">BLOCK #{idx}</span>
                            <span className="chip chip-good text-[8px]">
                              <CheckCircle className="w-2.5 h-2.5" /> VERIFIED
                            </span>
                          </div>
                          <div className="space-y-1 text-gray-700">
                            <p><span className="font-bold text-gray-900">Action:</span> {block.action}</p>
                            <p><span className="font-bold text-gray-900">User:</span> {block.performedBy}</p>
                            <p><span className="font-bold text-gray-900">Time:</span> {new Date(block.timestamp).toLocaleString()}</p>
                            <p className="truncate"><span className="font-bold text-gray-900">Prev:</span> <span className="text-teal-600" title={block.previousHash}>{block.previousHash}</span></p>
                            <p className="truncate"><span className="font-bold text-gray-900">Hash:</span> <span className="text-emerald-600 font-bold" title={block.hash}>{block.hash}</span></p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>

      <NotificationPanel
        open={notificationPanelOpen}
        onClose={() => setNotificationPanelOpen(false)}
        notifications={notifications}
        incidents={incidents}
        onNavigate={setActiveTab}
      />
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
