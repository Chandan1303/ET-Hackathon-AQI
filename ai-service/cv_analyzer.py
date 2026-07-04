import os
import json
import re
from groq import Groq

def generate_rca_report(description: str, equipment_tag: str = "Unknown"):
  """
  Generates a structural 5 Whys chain and Ishikawa Fishbone Diagram data structure
  for a given urban environmental incident description.
  """
  groq_key = os.environ.get("GROQ_API_KEY")
  
  if groq_key:
    try:
      client = Groq(api_key=groq_key)
      prompt = (
        "You are a Smart City Environmental Root Cause Analysis (RCA) specialist.\n"
        f"Perform an environmental RCA for this incident:\n"
        f"Description: {description}\n"
        f"Monitoring Station/Area: {equipment_tag}\n\n"
        "You must respond with a strictly formatted JSON object containing:\n"
        "1. 'five_whys': an array of exactly 5 strings tracking the cause sequence.\n"
        "2. 'fishbone': an object with arrays for categories 'Equipment', 'Process', 'Operator', 'Environment'. Each array should contain 2-3 specific root cause items.\n"
        "3. 'probability': an integer between 10 and 100 indicating the primary cause probability.\n"
        "4. 'recommendation': a string recommending preventive intervention.\n\n"
        "Response must be valid JSON only. Do not wrap in markdown or explain."
      )
      
      completion = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama-3.1-8b-instant",
        temperature=0.1,
        max_tokens=600
      )
      
      res_content = completion.choices[0].message.content.strip()
      if res_content.startswith("```"):
        res_content = re.sub(r'^```json\s*|```$', '', res_content, flags=re.MULTILINE).strip()
      res_json = json.loads(res_content)
      res_json["explainability"] = get_explainability(equipment_tag)
      return res_json
    except Exception as e:
      print(f"RCA Groq completion failed, using local rule fallback: {e}")
      
  # Local expert fallback rules
  desc_lower = description.lower()
  tag_upper = equipment_tag.upper()
  
  # Default fallback template
  five_whys = [
    "Ambient sensor readings exceeded the local regulatory exposure threshold.",
    "Localized emission discharge rates surpassed the current atmospheric dispersion capacity.",
    "Physical obstacles or restricted drainage pathways constrained the pollutant/water flow.",
    "Municipal mitigation interventions (like street sweeping or pump checks) were delayed.",
    "Lack of real-time gridded policy enforcement allowed environmental risk factors to consolidate."
  ]
  
  fishbone = {
    "Equipment": ["Sensor monitoring drift", "Drainage pump power loss"],
    "Process": ["Delayed street water spraying", "Unrestricted heavy truck logistics"],
    "Operator": ["Enforcement officer patrol backlog", "Policy threshold miscalculation"],
    "Environment": ["Thermal air inversion layer", "Stagnant wind dispersal speed"]
  }
  
  probability = 75
  recommendation = "Deploy mechanical street sprayers, suspend close-range excavations, and divert heavy logistics."

  # Specific overrides
  if "vibration" in desc_lower or "pm" in desc_lower or "aqi" in desc_lower or "stn-b" in tag_upper:
    five_whys = [
      "Particulate PM2.5 concentrations exceeded the NAAQS safe limit of 60 µg/m³.",
      "High diesel exhaust and construction dust accumulated in the lower boundary layer.",
      "Local weather stagnated with low wind speeds (<1.5 m/s) preventing horizontal mixing.",
      "Industrial stack wet scrubbers at the Sector 4 cement kiln were temporarily bypassed.",
      "Lack of real-time vehicle route diversion and street-sweeping allowed dust to re-suspend."
    ]
    fishbone = {
      "Equipment": ["Cement stack scrubber bypass", "Ambient air monitor calibration drift", "Water sprinkler tanker breakdown"],
      "Process": ["Unrestricted cargo transit schedules", "GRAP dust controls activation lag"],
      "Operator": ["Factory compliance manager ignored warning", "Enforcement inspection delayed"],
      "Environment": ["Ground-level thermal inversion", "Low wind velocity dispersion collapse"]
    }
    probability = 92
    recommendation = "Divert cargo vehicle transit to the bypass corridor, mandate immediate construction pause, and spray streets."
    
  elif "pressure" in desc_lower or "heat" in desc_lower or "temp" in desc_lower or "stn-a" in tag_upper:
    five_whys = [
      "Ambient thermal index surpassed the safety limit of 40°C in Commercial Zone A.",
      "Surface concrete and asphalt absorbed and re-radiated solar radiation (Urban Heat Island).",
      "Stagnant high-pressure air dome locked hot air masses over the metropolitan area.",
      "Outdoor heavy labor shifts continued through the peak solar intensity window.",
      "Cooling shelters and localized misting sprayers were not activated early in the shift."
    ]
    fishbone = {
      "Equipment": ["Cooling shelter HVAC overloaded", "Public drinking water fountain dry", "Air mist sprayer scaling block"],
      "Process": ["Outdoor labor hours not restricted", "Heatwave hazard warning system delay"],
      "Operator": ["Construction foreman bypassed heat advisory", "Public shelter supervisor absent"],
      "Environment": ["Stationary solar radiation dome", "High humidity heat-index multiplier"]
    }
    probability = 88
    recommendation = "Activate emergency cooling center shelters, suspend heavy manual labor from 12 PM - 4 PM, and dispatch hydration trucks."
    
  elif "flow" in desc_lower or "flood" in desc_lower or "rain" in desc_lower or "stn-c" in tag_upper:
    five_whys = [
      "Waterlogging exceeded 35cm at Highway Route 4 underpass, halting traffic.",
      "Heavy convective precipitation dumped 115mm of rain within a 2-hour window.",
      "Storm sewer inlet grates were choked with trash and construction excavation debris.",
      "Localized stormwater pump B-12 lost electrical grid power supply.",
      "Auxiliary backup generator failed to start due to damp electrical relay switches."
    ]
    fishbone = {
      "Equipment": ["Storm pump motor power failure", "Backup generator starter relay short", "Water level ultrasonic sensor blocked"],
      "Process": ["Sewer grid desiltation cycle delayed", "Emergency drainage bypass valve closed"],
      "Operator": ["Control desk failed to trigger backup pumps", "Manual dispatch teams stuck in gridlock"],
      "Environment": ["Cloudburst convective precipitation", "Low-lying topographic underpass dip"]
    }
    probability = 85
    recommendation = "Perform grid desilting, deploy auxiliary diesel-powered pumps, and post digital traffic detours."

  return {
    "five_whys": five_whys,
    "fishbone": fishbone,
    "probability": probability,
    "recommendation": recommendation,
    "explainability": get_explainability(equipment_tag)
  }

def get_explainability(equipment_tag: str):
    tag_upper = equipment_tag.upper()
    why = ["Environmental parameters exceeded standard regulatory boundaries."]
    docs = ["Municipal General Environment Codes"]
    conf = 85
    alts = ["Schedule immediate physical inspection by the environmental inspectorate."]
    conseq = ["Unmitigated public health exposure and potential respiratory hospital surge."]

    if "STN-B" in tag_upper or "C-201" in tag_upper:
      why = [
        "Particulate monitor PM2.5 readings exceed critical NAAQS guidelines (60 µg/m³).",
        "Particulate accumulation represents an immediate pulmonary health threat to nearby schools."
      ]
      docs = ["CPCB Ambient Air Quality Standards", "National Clean Air Program Guidelines (Page 12)"]
      conf = 94
      alts = [
        "Enforce Graded Response Action Plan (GRAP) Stage III immediately.",
        "Implement Odd-Even vehicle license limits within the downtown grid."
      ]
      conseq = [
        "Surge in local pediatric asthma hospitalizations and respiratory distress emergencies.",
        "Regulatory warnings and financial non-compliance penalties from federal agencies."
      ]
    elif "STN-A" in tag_upper or "B-505" in tag_upper:
      why = [
        "Municipal labor codes restrict continuous manual labor when heat index exceeds 40°C.",
        "Ambient heat sensor reading SEN-MET-TEMP indicates extreme thermal stress."
      ]
      docs = ["State Heat Action Plan Standard (Section 4)", "WHO Heatstroke Risk Guidelines"]
      conf = 95
      alts = [
        "Initiate gridded cooling mist spray operations along main corridors.",
        "Provide emergency hydration salt packets to industrial laborers."
      ]
      conseq = [
        "High incidence of heatstroke, dehydration, and potential workplace fatalities.",
        "Overloading of local community clinic ER cooling chambers."
      ]
    elif "STN-C" in tag_upper or "CH-304" in tag_upper:
      why = [
        "Hourly precipitation rainfall exceeded the 30mm safety limits of the drainage network.",
        "Waterlogging depth at Highway underpass poses motor vehicle submerge hazards."
      ]
      docs = ["Urban Drainage Master Plan Codes", "Emergency Disaster Response Protocols"]
      conf = 90
      alts = ["Divert commercial logistics traffic away from low-lying Route 4 underpass."]
      conseq = [
        "Total vehicular traffic gridlock on central logistics highways.",
        "Severe structural damage to flooded subway station basements."
      ]

    return {
      "whyDecision": why,
      "documentsUsed": docs,
      "confidenceScore": conf,
      "alternatives": alts,
      "consequences": conseq
    }
