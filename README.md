# AirVision - Real-Time Air Quality Intelligence Platform

<div align="center">

![AirVision](frontend/src/assets/hero.png)

**Enterprise-grade Air Quality Monitoring & Predictive Analytics System**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-blue)](https://www.python.org/)

</div>

---

## 🌍 Overview

**AirVision** is a comprehensive air quality monitoring platform that combines real-time data visualization, AI-powered compliance checking, and predictive analytics. Built for the Economic Times Hackathon, it provides actionable insights for environmental monitoring, industrial compliance, and public health advisories.

### 🎯 Key Features

- **🗺️ Interactive Air Quality Maps** - Real-time visualization with heatmaps and station markers
- **📊 Multi-Pollutant Tracking** - Monitor PM2.5, PM10, NO2, SO2, CO, O3, and more
- **🤖 AI Compliance Assistant** - RAG-powered chatbot for environmental regulations
- **⚠️ GRAP Stage Monitoring** - Automated Graded Response Action Plan tracking for Delhi NCR
- **📈 Predictive Forecasting** - ML-based air quality predictions
- **🏙️ City Comparison** - Compare air quality across multiple cities
- **🌡️ Weather Integration** - Correlate meteorological factors with pollution levels
- **💊 Health Advisories** - Personalized recommendations based on AQI levels
- **📤 Data Export** - Export reports in PDF, CSV, and Excel formats

---

## 🏗️ Architecture

```
AirVision/
├── frontend/          # React + Vite frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API integration services
│   │   ├── utils/          # Utility functions
│   │   └── hooks/          # Custom React hooks
│   └── public/             # Static assets
│
├── backend/           # Node.js + Express backend
│   ├── server.js           # Main API server
│   ├── database.js         # Database layer
│   └── simulator.js        # Real-time data simulator
│
└── ai-service/        # Python AI/ML services
    ├── main.py             # FastAPI server
    ├── rag_compliance.py   # RAG chatbot engine
    ├── risk_engine.py      # Risk assessment ML
    └── cv_analyzer.py      # Computer vision analytics
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16+ ([Download](https://nodejs.org/))
- **Python** 3.8+ ([Download](https://www.python.org/))
- **npm** or **yarn**

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Chandan1303/ET-Hackathon-AQI.git
cd ET-Hackathon-AQI
```

### 2️⃣ Frontend Setup

```bash
cd frontend
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env and add your API keys (see API Keys section below)

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 3️⃣ Backend Setup

```bash
cd backend
npm install

# Start the backend server
node server.js
```

The backend will run on `http://localhost:5000`

### 4️⃣ AI Service Setup (Optional)

```bash
cd ai-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Add your GROQ_API_KEY to .env

# Start AI service
python main.py
```

The AI service will run on `http://localhost:8000`

---

## 🔑 API Keys Setup

AirVision requires several API keys for full functionality:

### Required APIs

1. **AQICN (Air Quality API)** - Primary data source
   - Get free API key: [https://aqicn.org/data-platform/token/](https://aqicn.org/data-platform/token/)
   - Add to `frontend/.env` as `VITE_AQICN_API_KEY`

2. **OpenWeather Air Pollution API** - Weather data
   - Get free API key: [https://openweathermap.org/api](https://openweathermap.org/api)
   - Add to `frontend/.env` as `VITE_OPENWEATHER_API_KEY`

### Optional APIs

3. **Google Maps API** (Optional - uses Leaflet fallback)
   - Get API key: [https://console.cloud.google.com/google/maps-apis](https://console.cloud.google.com/google/maps-apis)
   - Add to `frontend/.env` as `VITE_GOOGLE_MAPS_API_KEY`
   - ⚠️ Requires billing enabled

4. **Groq API** (For AI chatbot)
   - Get API key: [https://console.groq.com](https://console.groq.com)
   - Add to `ai-service/.env` as `GROQ_API_KEY`

### Environment File Example

```env
# frontend/.env
VITE_AQICN_API_KEY=your_aqicn_api_key_here
VITE_OPENWEATHER_API_KEY=your_openweather_api_key_here
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# ai-service/.env
GROQ_API_KEY=your_groq_api_key_here
```

---

## 📦 Technology Stack

### Frontend
- **React 18.3** - UI framework
- **Vite** - Build tool and dev server
- **Recharts** - Data visualization
- **Leaflet** - Interactive maps
- **Lucide React** - Icon library
- **Tailwind CSS** - Styling

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **JSON-based storage** - Lightweight data persistence

### AI Services
- **Python 3.8+** - Programming language
- **FastAPI** - API framework
- **LangChain** - RAG implementation
- **Groq Llama** - LLM for chatbot
- **ChromaDB** - Vector database

---

## 🎨 Features in Detail

### 1. Real-Time Air Quality Monitoring
- Live AQI updates from multiple monitoring stations
- Color-coded severity indicators (Good, Moderate, Unhealthy, etc.)
- Interactive heatmap visualization
- Location-based air quality search

### 2. AI Compliance Chatbot
- Ask questions about environmental regulations
- Get compliance guidance for industries
- RAG-powered responses using official documents
- Supports queries on GRAP, CPCB standards, and SOPs

### 3. GRAP Stage Calculator
- Automatic GRAP stage determination for Delhi NCR
- Timeline of required actions per stage
- Color-coded urgency indicators
- Export compliance reports

### 4. Predictive Analytics
- 48-hour air quality forecasts
- Trend analysis for individual pollutants
- Historical data visualization
- Weather correlation analysis

### 5. Multi-City Comparison
- Compare up to 6 cities simultaneously
- Side-by-side AQI metrics
- Identify best and worst air quality regions
- Export comparison reports

---

## 🛠️ Development

### Running in Development Mode

```bash
# Terminal 1 - Frontend
cd frontend
npm run dev

# Terminal 2 - Backend
cd backend
node server.js

# Terminal 3 - AI Service (optional)
cd ai-service
python main.py
```

### Building for Production

```bash
cd frontend
npm run build
# Output will be in frontend/dist/
```

### Code Quality

```bash
# Run linter
cd frontend
npm run lint
```

---

## 📊 Data Sources

- **AQICN/WAQI** - Global air quality data from 12,000+ stations
- **OpenWeather** - Meteorological data and air pollution API
- **Simulated Data** - Backend simulator for demo purposes
- **Regulatory Documents** - CPCB, MoEFCC, and Delhi Pollution Control Committee

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Chandan Kumar**

- GitHub: [@Chandan1303](https://github.com/Chandan1303)
- LinkedIn: [Connect with me](https://linkedin.com/in/chandan1303)

---

## 🙏 Acknowledgments

- Economic Times for organizing the hackathon
- AQICN for providing comprehensive air quality data
- OpenWeather for meteorological data
- Groq for AI infrastructure
- All contributors and supporters

---

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on [GitHub](https://github.com/Chandan1303/ET-Hackathon-AQI/issues)
- Contact: [Your Email]

---

<div align="center">

**Built with ❤️ for a cleaner, healthier planet**

⭐ Star this repo if you find it useful!

</div>
