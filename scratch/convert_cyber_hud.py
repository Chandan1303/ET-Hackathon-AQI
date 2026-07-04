import re

with open('frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Shell background & containers
text = text.replace(
    'className="flex-1 flex flex-col min-w-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 overflow-y-auto"',
    'className="flex-1 flex flex-col min-w-0 bg-[#050814] overflow-y-auto"'
)
text = text.replace(
    'className="h-20 modern-header flex items-center justify-between px-8 shrink-0 print:hidden"',
    'className="h-20 cyber-header flex items-center justify-between px-8 shrink-0 print:hidden"'
)
text = text.replace(
    'className="w-64 modern-sidebar flex flex-col justify-between shrink-0 print:hidden"',
    'className="w-64 cyber-sidebar flex flex-col justify-between shrink-0 print:hidden"'
)

# 2. Sidebar branding & headers
text = text.replace(
    'bg-white/80',
    'bg-slate-950/40 border-b border-cyan-500/10'
)
text = text.replace(
    'text-gray-900 uppercase tracking-tight">Urban Air Quality OS',
    'text-cyan-400 uppercase tracking-tight glow-cyan">Urban Air Quality OS'
)
text = text.replace(
    'bg-gradient-to-r from-blue-50 to-white flex items-center justify-between',
    'bg-slate-950/20 border-b border-cyan-500/10 p-4 flex items-center justify-between'
)
text = text.replace(
    'text-blue-500 bg-blue-100 p-1 rounded-full border border-blue-200',
    'text-cyan-400 bg-slate-900 p-1 rounded-full border border-cyan-500/20 shadow-md shadow-cyan-500/5'
)
text = text.replace(
    'text-gray-600 tracking-wider flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5 text-blue-500" /> AIR QUALITY EVENT SIMULATOR',
    'text-slate-400 tracking-wider flex items-center gap-1.5 font-mono uppercase font-black"><Sliders className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> EVENT SIMULATOR'
)

# 3. Sidebar simulator checkbox wrapper
text = text.replace(
    'className="flex items-center justify-between text-[11px] text-gray-700 cursor-pointer bg-gray-100/70 hover:bg-gray-100 p-2 rounded-xl border border-gray-200/60"',
    'className="flex items-center justify-between text-[11px] text-slate-300 cursor-pointer bg-slate-900/40 hover:bg-slate-900/80 p-2 rounded-lg border border-cyan-500/10 transition"'
)

# 4. Sidebar Active Navigation Badges
text = text.replace(
    'activeTab === \'dashboard\' ? \'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg\' : \'text-gray-700 hover:bg-gray-100\'',
    'activeTab === \'dashboard\' ? \'cyber-active-badge\' : \'text-slate-400 hover:bg-cyan-500/5 hover:text-cyan-300\''
)
text = text.replace(
    'activeTab === \'copilot\' ? \'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg\' : \'text-gray-700 hover:bg-gray-100\'',
    'activeTab === \'copilot\' ? \'cyber-active-badge\' : \'text-slate-400 hover:bg-cyan-500/5 hover:text-cyan-300\''
)
text = text.replace(
    'activeTab === \'graph\' ? \'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg\' : \'text-gray-700 hover:bg-gray-100\'',
    'activeTab === \'graph\' ? \'cyber-active-badge\' : \'text-slate-400 hover:bg-cyan-500/5 hover:text-cyan-300\''
)
text = text.replace(
    'activeTab === \'simulator\' ? \'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg\' : \'text-gray-700 hover:bg-gray-100\'',
    'activeTab === \'simulator\' ? \'cyber-active-badge\' : \'text-slate-400 hover:bg-cyan-500/5 hover:text-cyan-300\''
)
text = text.replace(
    'activeTab === \'executive\' ? \'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg\' : \'text-gray-700 hover:bg-gray-100\'',
    'activeTab === \'executive\' ? \'cyber-active-badge\' : \'text-slate-400 hover:bg-cyan-500/5 hover:text-cyan-300\''
)
text = text.replace(
    'activeTab === \'rca\' ? \'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg\' : \'text-gray-700 hover:bg-gray-100\'',
    'activeTab === \'rca\' ? \'cyber-active-badge\' : \'text-slate-400 hover:bg-cyan-500/5 hover:text-cyan-300\''
)
text = text.replace(
    'activeTab === \'timeline\' ? \'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg\' : \'text-gray-700 hover:bg-gray-100\'',
    'activeTab === \'timeline\' ? \'cyber-active-badge\' : \'text-slate-400 hover:bg-cyan-500/5 hover:text-cyan-300\''
)
text = text.replace(
    'activeTab === \'upload\' ? \'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg\' : \'text-gray-700 hover:bg-gray-100\'',
    'activeTab === \'upload\' ? \'cyber-active-badge\' : \'text-slate-400 hover:bg-cyan-500/5 hover:text-cyan-300\''
)
text = text.replace(
    'activeTab === \'report\' ? \'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg\' : \'text-gray-700 hover:bg-gray-100\'',
    'activeTab === \'report\' ? \'cyber-active-badge\' : \'text-slate-400 hover:bg-cyan-500/5 hover:text-cyan-300\''
)

# 5. Header Search Pill
text = text.replace(
    'className="flex items-center gap-3 search-pill"',
    'className="flex items-center gap-3 bg-slate-900/60 px-4 py-2 rounded-xl border border-cyan-500/25 shadow-lg shadow-cyan-500/5"'
)
text = text.replace(
    'className="text-sm font-semibold text-gray-700">Global Air Quality:',
    'className="text-sm font-bold text-slate-400 font-mono uppercase tracking-wide">Global Air Quality:'
)
text = text.replace(
    'className="bg-transparent text-blue-600 font-semibold text-sm focus:outline-none cursor-text min-w-[200px]"',
    'className="bg-transparent text-cyan-300 font-semibold text-sm focus:outline-none cursor-text min-w-[200px] font-mono"'
)

# 6. Header Metric Cards
text = text.replace(
    'metric-card px-4 py-2',
    'cyber-card px-5 py-2'
)
text = text.replace(
    'text-gradient-good',
    'glow-green led-number'
)
text = text.replace(
    'text-gradient-moderate',
    'glow-amber led-number'
)
text = text.replace(
    'text-gradient-unhealthy',
    'glow-rose led-number'
)

# 7. Login / Register screen
text = text.replace(
    'className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center font-sans p-4 relative overflow-hidden"',
    'className="min-h-screen bg-[#050814] flex items-center justify-center font-sans p-4 relative overflow-hidden"'
)
text = text.replace(
    'className="w-full max-w-md hero-card p-8 relative z-10"',
    'className="w-full max-w-md cyber-card p-8 relative z-10 shadow-2xl shadow-cyan-500/10"'
)
text = text.replace(
    'bg-gradient-to-br from-blue-400 to-blue-600',
    'bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/20'
)
text = text.replace(
    'text-slate-300 uppercase tracking-wide',
    'text-cyan-400 uppercase tracking-wider text-[10px] font-mono font-bold'
)
text = text.replace(
    'bg-slate-950/80 text-slate-200 border border-slate-700/50 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all',
    'bg-slate-900/60 text-slate-100 border border-cyan-500/20 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono'
)
text = text.replace(
    'className="w-full mt-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3.5 rounded-lg text-sm tracking-wider transition-all shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 uppercase"',
    'className="w-full mt-2 cyber-button font-bold py-3 rounded-lg text-sm tracking-wider uppercase"'
)
text = text.replace(
    'className="w-full mt-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3.5 rounded-lg text-sm tracking-wider transition-all shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50"',
    'className="w-full mt-2 cyber-button font-bold py-3 rounded-lg text-sm tracking-wider uppercase"'
)

# 8. Map Container HUD header
text = text.replace(
    'className="p-4 bg-white/95 border-b border-gray-200 flex items-center justify-between z-[400] relative backdrop-blur-md"',
    'className="p-4 bg-slate-950/80 border-b border-cyan-500/10 flex items-center justify-between z-[400] relative backdrop-blur-md"'
)
text = text.replace(
    'text-gray-900',
    'text-slate-200 font-bold'
)
text = text.replace(
    'className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"',
    'className="bg-slate-900 border border-cyan-500/20 text-slate-400 hover:text-cyan-300 hover:bg-slate-900"'
)
text = text.replace(
    'className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${mapLayer === \'roadmap\' ? \'btn-modern\' : \'bg-white border-gray-300 text-gray-700 hover:bg-gray-50\'}`}',
    'className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${mapLayer === \'roadmap\' ? \'cyber-active-badge border-cyan-500\' : \'bg-slate-900 border border-cyan-500/20 text-slate-400 hover:text-cyan-300\'}`}'
)
text = text.replace(
    'className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${mapLayer === \'satellite\' ? \'btn-modern\' : \'bg-white border-gray-300 text-gray-700 hover:bg-gray-50\'}`}',
    'className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${mapLayer === \'satellite\' ? \'cyber-active-badge border-cyan-500\' : \'bg-slate-900 border border-cyan-500/20 text-slate-400 hover:text-cyan-300\'}`}'
)
text = text.replace(
    'className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${mapLayer === \'hybrid\' ? \'btn-modern\' : \'bg-white border-gray-300 text-gray-700 hover:bg-gray-50\'}`}',
    'className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${mapLayer === \'hybrid\' ? \'cyber-active-badge border-cyan-500\' : \'bg-slate-900 border border-cyan-500/20 text-slate-400 hover:text-cyan-300\'}`}'
)

# 9. General light-mode cards inside tabs to cyber-cards
text = text.replace('className="bg-white/80 backdrop-blur-md border border-gray-200 shadow-sm"', 'className="cyber-card p-5 shadow-lg"')
text = text.replace('className="bg-gray-50/80 border-b border-gray-200"', 'className="bg-slate-950/80 border-b border-cyan-500/10"')
text = text.replace('className="bg-white"', 'className="bg-transparent"')

# 10. General text conversion
text = text.replace('text-gray-900', 'text-slate-100')
text = text.replace('text-gray-700', 'text-slate-300')
text = text.replace('text-gray-600', 'text-slate-400')
text = text.replace('text-gray-500', 'text-slate-400')

with open('frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Cyber HUD theme successfully fully integrated into App.jsx!")
