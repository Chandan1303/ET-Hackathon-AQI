import os
import math

def _station_sensor_id(equipment_tag: str, metric: str) -> str:
  """Map STN-B -> SEN-STNB-PM25 (matches backend sensor IDs)."""
  return f"SEN-{equipment_tag.replace('-', '')}-{metric}"

def evaluate_maintenance_metrics(equipment_tag: str, sensors: list, current_health: int, current_rul: int):
  """
  Environmental Forecast & Analytics Agent:
  Evaluates air quality telemetry, calculates health risk coefficients,
  computes AQI metrics, and recommends prioritized urban interventions.
  """
  health = current_health
  rul = current_rul
  
  # Fetch air quality sensors for this station
  pm25_sensor = next((s for s in sensors if s.get("id") == _station_sensor_id(equipment_tag, "PM25")), None)
  pm10_sensor = next((s for s in sensors if s.get("id") == _station_sensor_id(equipment_tag, "PM10")), None)
  no2_sensor = next((s for s in sensors if s.get("id") == _station_sensor_id(equipment_tag, "NO2")), None)
  
  pm25_val = pm25_sensor.get("value", 45.0) if pm25_sensor else 45.0
  pm10_val = pm10_sensor.get("value", 85.0) if pm10_sensor else 85.0

  priority = "Low"
  failure_prob = 0.05
  spares = []
  downtime_est = 2.0
  reasons = []

  # Calculate risk of exceeding standard regulatory threshold (e.g. PM2.5 > 60 µg/m³)
  if pm25_val > 90.0:
    failure_prob = min(0.98, 0.5 + (pm25_val - 90.0) * 0.005)
    priority = "Critical"
    spares = ["Deploy Water Sweepers", "Enforce Graded Response Plan Stage III", "Divert Cargo Traffic"]
    downtime_est = 24.0
    reasons.append(f"Hyperlocal PM2.5 density ({pm25_val} µg/m³) is at critical respiratory risk threshold.")
  elif pm25_val > 55.0:
    failure_prob = 0.45
    priority = "High"
    spares = ["Activate Ambient Misting", "Divert Heavy Logistics", "Issue Asthma Advisories"]
    downtime_est = 12.0
    reasons.append(f"Hyperlocal PM2.5 density ({pm25_val} µg/m³) exceeds standard safe exposure limit of 60 µg/m³.")
  else:
    spares = ["Deploy Routine Sweeping"]
    reasons.append("Air quality particulate indexes are within healthy breathing limits.")

  # Normalize failure probability percentage (representing AQI overrun chance)
  failure_prob_pct = int(failure_prob * 100)

  return {
    "equipmentTag": equipment_tag,
    "healthScore": health,
    "rulDays": rul,
    "priority": priority,
    "failureProbability": failure_prob_pct,
    "recommendedSpares": spares,
    "estimatedDowntimeHours": downtime_est,
    "reasons": reasons
  }


def audit_regulatory_compliance(sensors: list, incidents: list):
  """
  Environmental Compliance Agent:
  Audits city parameters against National Ambient Air Quality Standards (NAAQS),
  Workplace Heat Stress limits, and Municipal Drainage Guidelines.
  """
  violations = []
  corrective_actions = []
  score = 100

  # Check active incidents for violations
  active_incidents = [i for i in incidents if i.get("status") == "Active"]
  
  # Rule 1: Flash Flood Waterlogging (Municipal Drainage Guidelines)
  flood_active = any("waterlogging" in i.get("type", "").lower() or "flood" in i.get("type", "").lower() for i in active_incidents)
  rain_sensor = next((s for s in sensors if s.get("id") == "SEN-MET-RAIN"), None)
  rain_val = rain_sensor.get("value", 0.0) if rain_sensor else 0.0

  if flood_active or rain_val > 50.0:
    score -= 25
    violations.append(f"Violation: Urban waterlogging detected. Rainfall ({rain_val} mm) exceeds storm sewer discharge capacity.")
    corrective_actions.append("Activate underpass drainage storm pumps, divert local traffic on Route 4, and clean sewer blockages.")

  # Rule 2: Heatwave Safety (Heat Action Plan limits)
  temp_sensor = next((s for s in sensors if s.get("id") == "SEN-MET-TEMP"), None)
  temp_val = temp_sensor.get("value", 32.5) if temp_sensor else 32.5
  if temp_val > 40.0:
    score -= 25
    violations.append(f"Violation: Ambient heat index ({temp_val}°C) violates Municipal Heatwave Work Protection Act.")
    corrective_actions.append("Open cooling center shelters, suspend heavy manual labor between 12 PM - 4 PM, and adjust school timings.")

  # Rule 3: Extreme Particulate Spikes (NAAQS 24h standard violation)
  pm25_sensors = [s for s in sensors if "PM25" in s.get("id", "")]
  high_pm = any(s.get("value", 0.0) > 120.0 for s in pm25_sensors)
  if high_pm:
    score -= 30
    violations.append("Violation: Particulate density PM2.5 exceeds maximum NAAQS limits of 60 µg/m³ (Severe AQI category).")
    corrective_actions.append("Enforce Graded Response Action Plan (GRAP) Stage III: pause excavation, restrict construction, spray street water.")

  # Floor constraint
  score = max(10, score)

  status = "Compliant"
  if score < 50:
    status = "Critical Exposure Warning"
  elif score < 85:
    status = "Minor Exposure Advisory"

  return {
    "complianceScore": score,
    "complianceStatus": status,
    "violations": violations,
    "correctiveActions": corrective_actions
  }


def run_whatif_analysis(action: str, target_equipment: str, current_sensors: list):
  """
  AI Scenario Simulator (Digital Twin):
  Runs urban environmental simulations for various policy interventions and weather shifts.
  Estimates AQI changes, carbon reductions, budget costs, and exposure metrics.
  """
  action_lower = action.lower()
  
  # Fetch baseline sensor readings for the target station
  station_pm25_id = _station_sensor_id(target_equipment, "PM25")
  pm25_sensor = next((s for s in current_sensors if s.get("id") == station_pm25_id), None)
  if not pm25_sensor:
    pm25_sensor = next((s for s in current_sensors if "PM25" in s.get("id", "")), None)
  pm25_val = pm25_sensor.get("value", 45.0) if pm25_sensor else 45.0
  rain_sensor = next((s for s in current_sensors if s.get("id") == "SEN-MET-RAIN"), None)
  rain_val = rain_sensor.get("value", 0.0) if rain_sensor else 0.0
  temp_sensor = next((s for s in current_sensors if s.get("id") == "SEN-MET-TEMP"), None)
  temp_val = temp_sensor.get("value", 32.5) if temp_sensor else 32.5
  
  # Initialize simulation outcomes
  aqi_reduction = 0
  carbon_reduction_ton = 0
  health_index_improvement = 0
  budget_cost = 0
  env_impact = "Baseline metropolitan air footprint."
  comp_impact = "Compliant with standard municipal environmental regulations."
  decision = "Continue regular monitoring. Telemetry ranges remain nominal."
  why = ["Current particulate levels are in the safe range."]
  docs = ["Municipal GRAP Codes", "NAAQS Act Section 4"]
  confidence = 90
  alternatives = ["Enforce mechanical street sweepers."]
  consequences = ["Routine exhaust emissions under normal commuter traffic."]
  
  chart_data = []

  # Scenario A: Divert Vehicle Traffic
  if "traffic" in action_lower or "vehicular" in action_lower:
    aqi_reduction = 18
    carbon_reduction_ton = 45.2
    health_index_improvement = 12
    budget_cost = 120000
    env_impact = "Reduces vehicular carbon emissions and nitrogen oxide (NOx) concentrations near schools."
    comp_impact = "Improves overall compliance against NAAQS 24-hour PM2.5 guidelines."
    decision = "DEPLOY DIVERSION ORDER: Divert heavy diesel freight traffic to Outer Bypass Corridor."
    why = [
      "Vehicular exhaust constitutes 62% of particulate matter at Station A.",
      "Diversion lowers ambient NO2 and PM2.5 levels by an estimated 18% in high-density school zones.",
      "Diverts particulate exposure away from 14,000 residents."
    ]
    docs = ["Municipal Traffic Control Code 14-B", "NAAQS Environmental Act Guidelines"]
    confidence = 94
    alternatives = ["Implement Odd-Even license plate schedule", "Deploy zero-emission public transit shuttles"]
    consequences = ["Increased travel times for commercial logistic routes.", "Minor congestion increases at bypass corridors."]

    for i in range(1, 6):
      chart_data.append({
        "step": f"Hour +{i*4}",
        "probability": max(10, int(pm25_val * (1 - (aqi_reduction/100) * (i/5.0)))),
        "cost": int(budget_cost * (i/5.0)),
        "energy": int(carbon_reduction_ton * (i/5.0))
      })

  # Scenario B: Pause Construction & Dust Control
  elif "construction" in action_lower or "pause" in action_lower or "excavation" in action_lower:
    aqi_reduction = 12
    carbon_reduction_ton = 18.0
    health_index_improvement = 8
    budget_cost = 480000
    env_impact = "Prevents dust suspension. Lowers PM10 coarse particulate concentrations significantly."
    comp_impact = "Strictly enforces environmental dust mitigation mandates (ASME Dust Mitigation Standards)."
    decision = "ENFORCE TEMPORARY SUSPENSION: Order all commercial excavations within 2km of Station B to pause."
    why = [
      "Construction dust contributes 24% of coarse particles (PM10) at Industrial Station B.",
      "Water mist spraying combined with excavation halt will yield 12% AQI reduction.",
      "Reduces dust-induced asthma emergency visits at local hospitals."
    ]
    docs = ["ASME Coarse Dust Control Specification", "Air Act Section 21 Guidelines"]
    confidence = 91
    alternatives = ["Enforce 100% dust-curtain barrier compliance", "Water spray excavation surfaces twice hourly"]
    consequences = ["Work stoppages delay the metro line construction timeline.", "Increases municipal oversight patrol costs."]

    for i in range(1, 6):
      chart_data.append({
        "step": f"Day +{i}",
        "probability": max(10, int(pm25_val * (1 - (aqi_reduction/100) * (i/5.0)))),
        "cost": int(budget_cost * (i/5.0)),
        "energy": int(carbon_reduction_ton * (i/5.0))
      })

  # Scenario C: Meteorological Shifts (Precipitation Rain wash-out)
  elif "rain" in action_lower or "rainfall" in action_lower or "precipitation" in action_lower:
    aqi_reduction = 45
    carbon_reduction_ton = 0.0
    health_index_improvement = 25
    budget_cost = 50000
    env_impact = "Natural wet deposition washes out PM2.5 and PM10, clearing metropolitan smog."
    comp_impact = "Reduces ambient air pollution to pristine levels. Increases waterlogging risk on roads."
    decision = "ACTIVATE STORM WATER DRAINS: Suspend street water sprayers. Deploy stormwater drainage pumps."
    why = [
      "Rain wash-out reduces particulate matter by 45% within 3 hours.",
      "High rainfall carries secondary flash flood risks in low-lying underpasses.",
      "Asthma and respiratory health risk scores will drop to pristine levels."
    ]
    docs = ["Disaster Management Flood Protocol", "Storm Sewers Design Manual"]
    confidence = 96
    alternatives = ["Initiate selective drainage pump checks in low-lying Zone C underpasses."]
    consequences = ["Potential waterlogging in underpasses.", "Heavy storm sewer inflow demands high pump electric load."]

    for i in range(1, 6):
      chart_data.append({
        "step": f"Hour +{i*2}",
        "probability": max(8, int(pm25_val * (1 - (aqi_reduction/100) * (i/5.0)))),
        "cost": int(budget_cost * (i/5.0)),
        "energy": 0
      })

  # Default baseline
  else:
    chart_data = [{"step": "+12h", "probability": int(pm25_val), "cost": 500, "energy": 5}, {"step": "+24h", "probability": int(pm25_val * 1.1), "cost": 1000, "energy": 10}]

  return {
    "action": action,
    "equipmentTag": target_equipment,
    "failureProbability": int(pm25_val * (1 - aqi_reduction / 100.0)), # Represents simulated AQI index
    "safetyRisk": "High" if pm25_val > 90.0 else "Low",
    "productionLoss": int(health_index_improvement), # represents health improvement index
    "downtimeCost": budget_cost,
    "energyConsumption": int(carbon_reduction_ton), # represents carbon reduction tons
    "environmentalImpact": env_impact,
    "complianceImpact": comp_impact,
    "recommendedDecision": decision,
    "chartData": chart_data,
    "explainability": {
      "whyDecision": why,
      "documentsUsed": docs,
      "confidenceScore": confidence,
      "alternatives": alternatives,
      "consequences": consequences
    }
  }
