import os
import re
import math
import json
from groq import Groq

# In-memory document chunk store
chunks = []

def index_document_content(doc_id, title, category, content, metadata=None):
  """
  Splits a document's content into paragraphs, extracts metadata via regex,
  and adds chunks to the RAG store.
  """
  global chunks
  paragraphs = content.split('\n\n')
  
  # Auto-extract equipment/station target tag (e.g. STN-A, C-201)
  tag_match = re.search(r'\b(?:[A-Z]-\d{3}|STN-[A-D])\b', content)
  extracted_tag = tag_match.group(0) if tag_match else 'All'
  
  for i, para in enumerate(paragraphs):
    para_clean = para.strip()
    if len(para_clean) > 25:
      chunks.append({
        "doc_id": doc_id,
        "title": title,
        "category": category,
        "content": para_clean,
        "index": i,
        "metadata": {
          "extracted_tag": extracted_tag,
          "version": metadata.get("version", "1.0") if metadata else "1.0",
          "author": metadata.get("author", "System") if metadata else "System"
        }
      })

# Seed initial documents
def seed_rag_index():
  global chunks
  chunks = []
  
  initial_docs = [
    {
      "id": "DOC-REG-GRAP",
      "title": "Graded Response Action Plan (GRAP) Guidelines",
      "category": "Regulation",
      "content": "Graded Response Action Plan Stage II Guidelines. When PM2.5 exceeds 120 ug/m3, municipal commissioners must mandate construction pauses, deploy mechanical road sweepers, divert heavy commercial vehicles from downtown residential streets, and issue outdoor warnings for schools."
    },
    {
      "id": "DOC-SOP-HEAT",
      "title": "SOP-301: Heatwave Emergency Protocol",
      "category": "SOP",
      "content": "Heatwave Emergency Standard Operating Procedure. If air temperature hits 40°C or relative humidity increases heat index past 42°C, municipal staff must open designated public cooling centers, suspend heavy outdoor construction work from 12 PM to 4 PM, and dispatch emergency medical teams for heatstroke triage."
    },
    {
      "id": "DOC-SOP-FLOOD",
      "title": "SOP-401: Flash Flood Waterlogging Action Plan",
      "category": "SOP",
      "content": "Flash Flood response SOP. If hourly precipitation rainfall exceeds 30mm, trigger automatic waterlogging risk alerts. Deploy emergency storm pumps to Underpass B-12 and close flooded traffic arteries. Advise citizens to avoid waterlogged roads."
    }
  ]
  
  for doc in initial_docs:
    index_document_content(doc["id"], doc["title"], doc["category"], doc["content"])

# Run seeding on module import
seed_rag_index()

def calculate_cosine_similarity(vec1, vec2):
  intersection = set(vec1.keys()) & set(vec2.keys())
  numerator = sum([vec1[x] * vec2[x] for x in intersection])
  
  sum1 = sum([vec1[x]**2 for x in vec1.keys()])
  sum2 = sum([vec2[x]**2 for x in vec2.keys()])
  denominator = math.sqrt(sum1) * math.sqrt(sum2)
  
  if not denominator:
    return 0.0
  return float(numerator) / denominator

def text_to_vector(text):
  words = re.findall(r'\w+', text.lower())
  vec = {}
  for w in words:
    vec[w] = vec.get(w, 0) + 1
  return vec

def retrieve_rag_context(query, top_k=3):
  """
  Performs hybrid search (TF-IDF vector cosine similarity + keyword matching)
  against the loaded RAG document chunks.
  """
  query_vec = text_to_vector(query)
  scored_chunks = []
  
  for chunk in chunks:
    chunk_vec = text_to_vector(chunk["content"])
    score = calculate_cosine_similarity(query_vec, chunk_vec)
    
    if any(keyword in chunk["content"].lower() for keyword in re.findall(r'\w+', query.lower())):
      score += 0.1
      
    if score > 0:
      scored_chunks.append((score, chunk))
      
  scored_chunks.sort(key=lambda x: x[0], reverse=True)
  return [item[1] for item in scored_chunks[:top_k]]

def get_factory_memory_context(query: str) -> str:
  try:
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'copilot_db.json')
    if not os.path.exists(db_path):
      return ""
    with open(db_path, 'r', encoding='utf-8') as f:
      data = json.load(f)
      
    memory_items = data.get("factory_memory", [])
    incidents = data.get("incidents", [])
    
    relevant_memories = []
    query_words = set(re.findall(r'\w+', query.lower()))
    if not query_words:
      return ""
      
    for m in memory_items:
      content = f"{m.get('equipmentTag')} {m.get('incidentType')} {m.get('details')}".lower()
      content_words = set(re.findall(r'\w+', content))
      if query_words & content_words:
        relevant_memories.append(
          f"Historical Intervention ({m.get('timestamp')}) - {m.get('equipmentTag')} {m.get('incidentType')}: "
          f"\"{m.get('details')}\" (Inspector: {m.get('technician')})"
        )
        
    for inc in incidents:
      content = f"{inc.get('equipmentTag')} {inc.get('type')} {inc.get('description')} {inc.get('rootCause')}".lower()
      content_words = set(re.findall(r'\w+', content))
      if query_words & content_words:
        relevant_memories.append(
          f"Past Environmental Incident {inc.get('id')} ({inc.get('timestamp')}) - {inc.get('equipmentTag')} {inc.get('type')}: "
          f"\"{inc.get('description')}\" - Root Cause: {inc.get('rootCause')} (Status: {inc.get('status')})"
        )
        
    if relevant_memories:
      return "\n\n--- AI City Environmental History Logs (Historical Action Ledger) ---\n" + "\n".join(relevant_memories[:3])
  except Exception as e:
    print("Error reading environmental memory for RAG", e)
  return ""

def query_rag_engine(query: str, live_context: dict = None):
  retrieved = retrieve_rag_context(query)
  memory_ctx = get_factory_memory_context(query)

  live_ctx_str = ""
  if live_context:
    city = live_context.get("city", "Unknown")
    aqi = live_context.get("aqi", "N/A")
    aqi_level = live_context.get("aqiLevel", "Unknown")
    compliance = live_context.get("complianceScore", "N/A")
    sensors = live_context.get("sensors", [])
    incidents = live_context.get("activeIncidents", [])

    sensor_lines = "\n".join([
      f"  - {s.get('name', s.get('id', 'Sensor'))}: {s.get('value')} {s.get('unit', '')} ({s.get('status', 'Normal')})"
      for s in sensors[:8]
    ]) or "  - No sensor data available"

    incident_lines = "\n".join([
      f"  - {i.get('type', 'Incident')}: {i.get('description', '')}"
      for i in incidents
    ]) or "  - No active incidents"

    live_ctx_str = (
      f"\n\n--- LIVE CITY TELEMETRY ({city}) ---\n"
      f"Current AQI: {aqi} ({aqi_level})\n"
      f"Compliance Score: {compliance}/100\n"
      f"Active Sensors:\n{sensor_lines}\n"
      f"Active Incidents:\n{incident_lines}\n"
      "Use this live data to tailor your recommendations to the current situation."
    )
  
  if not retrieved:
    context_str = "No specific reference manuals found. Adhere to general urban environmental safety codes."
  else:
    context_str = "\n\n".join([f"Document: {c['title']} ({c['category']}) - Station Tag: {c['metadata']['extracted_tag']}\n{c['content']}" for c in retrieved])
    
  if memory_ctx:
    context_str += memory_ctx

  if live_ctx_str:
    context_str += live_ctx_str
    
  groq_key = os.environ.get("GROQ_API_KEY")
  
  if groq_key:
    try:
      client = Groq(api_key=groq_key)
      system_prompt = (
        "You are the AI Urban Environmental Decision Intelligence Platform, an agentic AI operating brain for smart cities.\n"
        "Your role is to analyze environmental queries using gridded monitoring manuals, SOPs, municipal regulations, and historical compliance records.\n"
        "Always provide evidence-based, concise answers. If historical city logs are present in the context, refer to them explicitly (e.g. referencing previous interventions or flash waterlogging events) to help optimize incident response.\n\n"
        f"Retrieved Context:\n{context_str}\n\n"
        "Format your answer with clear markdown sections: Risk Assessment, Relevant Regulation/SOP, and Recommended Municipal Actions."
      )
      
      completion = client.chat.completions.create(
        messages=[
          {"role": "system", "content": system_prompt},
          {"role": "user", "content": query}
        ],
        model="llama-3.1-8b-instant",
        temperature=0.1,
        max_tokens=800
      )
      
      return {
        "answer": completion.choices[0].message.content,
        "sources": list(set([c["title"] for c in retrieved])),
        "online": True
      }
    except Exception as e:
      print(f"RAG Groq error, falling back to local extractor: {e}")
      
  # Local Extract Fallback
  sources = list(set([c["title"] for c in retrieved]))
  live_note = ""
  if live_context and live_context.get("aqi"):
    live_note = (
      f"\n\n**Current Live Conditions ({live_context.get('city', 'City')}):**\n"
      f"- AQI: {live_context.get('aqi')} ({live_context.get('aqiLevel', 'Unknown')})\n"
      f"- Compliance Score: {live_context.get('complianceScore', 'N/A')}/100\n"
    )
    pm25_sensors = [s for s in live_context.get("sensors", []) if "PM2.5" in s.get("name", "") or "PM25" in s.get("id", "")]
    if pm25_sensors:
      live_note += f"- Highest PM2.5: {max(s.get('value', 0) for s in pm25_sensors)} µg/m³ (WHO 24h limit: 15 µg/m³)\n"

  if not retrieved:
    answer = (
      "### Environmental Decision Copilot (Local Extractive Engine)\n\n"
      f"{live_note}"
      "**Risk Assessment:** Review live sensor readings against WHO/NAAQS limits.\n\n"
      "**General Safeguards:** Deploy mechanical street sprayers, adjust outdoor work hours, and monitor local drainage pumps."
    )
  else:
    answer = (
      "### Environmental Decision Copilot (Local Extractive Engine)\n\n"
      f"{live_note}"
      f"**Retrieved References ({len(retrieved)} chunks from {len(sources)} files):**\n\n"
    )
    for c in retrieved:
      answer += f"- **{c['title']}** (Category: {c['category']}):\n  > \"{c['content']}\"\n\n"
      
    answer += (
      "**Actionable Recommendation:**\n"
      "1. Verify ambient temperature and air particulate values against regulatory limits.\n"
      "2. Initiate localized Graded Response Plan (GRAP) actions if warning thresholds are crossed.\n"
      "3. Conduct drainage pump electrical status checks prior to storm precipitation."
    )
    
  return {
    "answer": answer,
    "sources": sources,
    "online": False
  }
