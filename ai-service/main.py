import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

# Import our custom modules
from rag_compliance import query_rag_engine, index_document_content
from cv_analyzer import generate_rca_report
from risk_engine import evaluate_maintenance_metrics, audit_regulatory_compliance, run_whatif_analysis

load_dotenv()

app = FastAPI(title="Urban Eco OS - Environmental Decision Intelligence Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas
class ChatQueryRequest(BaseModel):
    query: str
    context: Optional[Dict[str, Any]] = None

class DocumentIndexRequest(BaseModel):
    id: str
    title: str
    category: str
    content: str
    metadata: Optional[Dict[str, Any]] = None

class RcaRequest(BaseModel):
    description: str
    equipmentTag: Optional[str] = "Unknown"

class MaintenanceRequest(BaseModel):
    equipmentTag: str
    sensors: List[Dict[str, Any]]
    healthScore: int
    rulDays: int

class ComplianceRequest(BaseModel):
    sensors: List[Dict[str, Any]]
    incidents: List[Dict[str, Any]]

class WhatIfRequest(BaseModel):
    action: str
    equipmentTag: str
    sensors: List[Dict[str, Any]]

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Urban Eco OS - Environmental Decision Intelligence Platform",
        "ragIndexLoaded": True
    }

@app.post("/api/rag/query")
def post_rag_query(payload: ChatQueryRequest):
    try:
        if not payload.query.strip():
            raise HTTPException(status_code=400, detail="Query cannot be empty.")
        result = query_rag_engine(payload.query, payload.context)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG Error: {str(e)}")

@app.post("/api/rag/reindex")
def post_rag_reindex(payload: DocumentIndexRequest):
    try:
        index_document_content(
            doc_id=payload.id,
            title=payload.title,
            category=payload.category,
            content=payload.content,
            metadata=payload.metadata
        )
        return {"success": True, "message": f"Document {payload.id} successfully indexed."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Indexing Error: {str(e)}")

@app.post("/api/agent/rca")
def post_agent_rca(payload: RcaRequest):
    try:
        if not payload.description.strip():
            raise HTTPException(status_code=400, detail="Incident description cannot be empty.")
        result = generate_rca_report(payload.description, payload.equipmentTag)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RCA Agent Error: {str(e)}")

@app.post("/api/agent/maintenance")
def post_agent_maintenance(payload: MaintenanceRequest):
  try:
      result = evaluate_maintenance_metrics(
          equipment_tag=payload.equipmentTag,
          sensors=payload.sensors,
          current_health=payload.healthScore,
          current_rul=payload.rulDays
      )
      return result
  except Exception as e:
      raise HTTPException(status_code=500, detail=f"Maintenance Agent Error: {str(e)}")

@app.post("/api/agent/compliance")
def post_agent_compliance(payload: ComplianceRequest):
  try:
      result = audit_regulatory_compliance(
          sensors=payload.sensors,
          incidents=payload.incidents
      )
      return result
  except Exception as e:
      raise HTTPException(status_code=500, detail=f"Compliance Agent Error: {str(e)}")

@app.post("/api/agent/simulate_decision")
def post_simulate_decision(payload: WhatIfRequest):
  try:
      result = run_whatif_analysis(
          action=payload.action,
          target_equipment=payload.equipmentTag,
          current_sensors=payload.sensors
      )
      return result
  except Exception as e:
      raise HTTPException(status_code=500, detail=f"Decision Simulator Agent Error: {str(e)}")

class DebateRequest(BaseModel):
    incidentId: str
    description: str
    equipmentTag: str

@app.post("/api/agent/debate")
def post_generate_debate(payload: DebateRequest):
    desc = payload.description.lower()
    tag = payload.equipmentTag
    
    if "emission" in desc or "pm2.5" in desc or "particulate" in desc or "leak" in desc:
        debate = [
            {"agent": "Maintenance Agent", "text": f"Air telemetry spike on {tag} points to high particulate loading. Recommend physical cartridge checks.", "timestamp": "14:02:10"},
            {"agent": "Safety Agent", "text": f"Warning: PM2.5 levels near {tag} are unsafe for citizens. Protective N95 distribution is advisable.", "timestamp": "14:02:35"},
            {"agent": "Compliance Agent", "text": f"Exceeds clean air limits. If levels persist, we must trigger GRAP Stage 2 operational curbs.", "timestamp": "14:03:00"},
            {"agent": "Supply Chain Agent", "text": "Purification blower fans and replacement filter cartridges are fully stocked in municipal warehouse.", "timestamp": "14:03:30"},
            {"agent": "Executive Agent", "text": f"Synthesized directive: Order water sprinkling on local corridors surrounding {tag} and dispatch response teams.", "timestamp": "14:04:00"}
        ]
    elif "temp" in desc or "heat" in desc or "fire" in desc:
        debate = [
            {"agent": "Maintenance Agent", "text": f"Ambient sensor on {tag} shows extreme heat. Heat exhaust fans operating at maximum load.", "timestamp": "11:15:10"},
            {"agent": "Safety Agent", "text": "Risk is high for outdoor staff. We must mandate shade breaks and hydration protocols.", "timestamp": "11:15:40"},
            {"agent": "Compliance Agent", "text": "Heat Index values exceed the safety threshold. Industrial labor must be suspended during peak sunlight hours.", "timestamp": "11:16:10"},
            {"agent": "Supply Chain Agent", "text": "Hydration supplies, electrolytes, and cooling tents are loaded on municipal response vehicles.", "timestamp": "11:16:40"},
            {"agent": "Executive Agent", "text": "Synthesized directive: Activate city cooling shelters and issue warnings on public display panels.", "timestamp": "11:17:10"}
        ]
    else:
        debate = [
            {"agent": "Maintenance Agent", "text": f"Telemetry anomaly registered on {tag}. Running remote system health diagnostics.", "timestamp": "09:30:10"},
            {"agent": "Safety Agent", "text": f"Monitoring local citizen tracks. Safety buffers around {tag} must be preserved.", "timestamp": "09:30:45"},
            {"agent": "Compliance Agent", "text": "Validating metrics against standardized environmental compliance registers.", "timestamp": "09:31:15"},
            {"agent": "Supply Chain Agent", "text": "Verifying parts and emergency response resources are fully available.", "timestamp": "09:31:45"},
            {"agent": "Executive Agent", "text": f"Synthesized directive: Continue monitoring. Dispatch mobile inspection units if thresholds are exceeded.", "timestamp": "09:32:15"}
        ]
    return debate

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)

