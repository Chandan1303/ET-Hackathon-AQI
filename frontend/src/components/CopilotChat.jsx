import { Mic, Send, Sparkles, BookOpen, AlertTriangle, Activity } from 'lucide-react';

const QUICK_PROMPTS = [
  'What actions should we take for current PM2.5 levels?',
  'Explain GRAP Stage II requirements',
  'WHO PM2.5 safe exposure limits',
  'Heatwave emergency protocol for cities',
];

function formatAnswer(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^### (.*)$/gm, '<h4 class="font-bold text-teal-700 mt-3 mb-1">$1</h4>')
    .replace(/^## (.*)$/gm, '<h3 class="font-bold text-gray-900 mt-3 mb-1">$1</h3>')
    .replace(/^- (.*)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/\n/g, '<br/>');
}

export default function CopilotChat({
  chatMessages,
  chatInput,
  setChatInput,
  isTyping,
  isListening,
  ttsEnabled,
  setTtsEnabled,
  onSubmit,
  onToggleListening,
  liveContext,
}) {
  return (
    <div className="readable-panel flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
      {/* Live context sidebar */}
      <div className="lg:w-72 shrink-0 tab-panel p-4 flex flex-col gap-3">
        <p className="tab-section-title flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" /> Live City Context
        </p>
        <div className="metric-card p-3">
          <p className="text-[10px] text-gray-500 uppercase font-bold">City</p>
          <p className="text-sm font-bold text-gray-900">{liveContext.city}</p>
        </div>
        <div className="metric-card p-3">
          <p className="text-[10px] text-gray-500 uppercase font-bold">Current AQI</p>
          <p className={`text-2xl font-black ${liveContext.aqi > 150 ? 'text-red-600' : liveContext.aqi > 100 ? 'text-amber-600' : 'text-green-600'}`}>
            {liveContext.aqi}
          </p>
          <p className="text-[10px] text-gray-500">{liveContext.aqiLevel}</p>
        </div>
        <div className="metric-card p-3">
          <p className="text-[10px] text-gray-500 uppercase font-bold mb-2">Key Sensors</p>
          <div className="grid grid-cols-[1fr_auto] gap-x-2 gap-y-1.5 max-h-32 overflow-y-auto custom-scroll pr-2.5">
            {liveContext.sensors.slice(0, 6).map(s => (
              <div key={s.id} className="contents">
                <span className="text-[11px] text-gray-600 truncate min-w-0">{s.name}</span>
                <span className={`text-[11px] font-bold text-right whitespace-nowrap pl-1 ${s.status === 'Warning' ? 'text-amber-600' : 'text-gray-900'}`}>
                  {s.value} {s.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
        {liveContext.activeIncidents.length > 0 && (
          <div className="metric-card p-3 border-l-4 border-red-500">
            <p className="text-[10px] text-red-600 uppercase font-bold flex items-center gap-1 mb-1">
              <AlertTriangle className="w-3 h-3" /> Active Incidents
            </p>
            {liveContext.activeIncidents.map(inc => (
              <p key={inc.id} className="text-[11px] text-gray-700 leading-snug">{inc.type}</p>
            ))}
          </div>
        )}
        <div className="metric-card p-3">
          <p className="text-[10px] text-gray-500 uppercase font-bold">Compliance Score</p>
          <p className="text-xl font-bold text-green-600">{liveContext.complianceScore}/100</p>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col tab-panel min-h-0">
        <div className="tab-panel-header flex justify-between items-center">
          <div>
            <h2 className="tab-panel-title flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-500" /> AI Decision Copilot
            </h2>
            <p className="tab-panel-subtitle">Semantic RAG & Environmental Intelligence Engine</p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium" style={{ color: '#374151' }}>
            <input type="checkbox" checked={ttsEnabled} onChange={(e) => setTtsEnabled(e.target.checked)} className="rounded w-4 h-4" />
            <span>Speak Answer</span>
          </label>
        </div>

        <div className="px-4 py-2 border-b border-gray-200 flex flex-wrap gap-2">
          {QUICK_PROMPTS.map(prompt => (
            <button
              key={prompt}
              onClick={() => onSubmit(prompt)}
              className="text-[10px] px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition font-medium"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 tab-panel-body custom-scroll min-h-[300px]">
          {chatMessages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-2xl rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${msg.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
                <p className="chat-bubble-label">{msg.sender === 'user' ? 'City Inspector' : 'Eco Intelligence AI'}</p>
                {msg.sender === 'ai' ? (
                  <div className="chat-message-content" dangerouslySetInnerHTML={{ __html: formatAnswer(msg.text) }} />
                ) : (
                  <div className="whitespace-pre-line">{msg.text}</div>
                )}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-gray-200 flex flex-wrap gap-2">
                    {msg.sources.map((s, i) => (
                      <span key={i} className="source-chip flex items-center gap-1">
                        <BookOpen className="w-3 h-3" /> {s}
                      </span>
                    ))}
                  </div>
                )}
                {msg.online !== undefined && (
                  <p className="text-[9px] mt-2 text-gray-400 font-mono">
                    {msg.online ? 'Groq LLM + RAG' : 'Local RAG fallback'} · {msg.timestamp}
                  </p>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="text-gray-600 text-sm font-medium animate-pulse flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-500 animate-spin" /> Analyzing regulations and live sensor data...
            </div>
          )}
        </div>

        <div className="tab-panel-footer flex gap-3">
          <button
            onClick={onToggleListening}
            className={`px-4 py-2 rounded-xl border-2 transition-all ${isListening ? 'bg-red-500 text-white animate-pulse border-red-600' : 'bg-white text-teal-600 border-teal-500 hover:bg-teal-50'}`}
            aria-label="Voice input"
          >
            <Mic className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
            placeholder="Ask about air quality standards, WHO guidelines, PM2.5 limits..."
            className="copilot-input flex-1"
          />
          <button onClick={() => onSubmit()} className="btn-modern flex items-center gap-2 px-5">
            <Send className="w-4 h-4" /> Send
          </button>
        </div>
      </div>
    </div>
  );
}
