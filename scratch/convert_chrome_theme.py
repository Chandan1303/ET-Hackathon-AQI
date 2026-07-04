import re

with open('frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Shell background & containers
text = text.replace(
    'className="flex-1 flex flex-col min-w-0 bg-[#050814] overflow-y-auto"',
    'className="flex-1 flex flex-col min-w-0 bg-[#f6f8fa] overflow-y-auto"'
)
text = text.replace(
    'className="h-20 cyber-header flex items-center justify-between px-8 shrink-0 print:hidden"',
    'className="h-20 chrome-header flex items-center justify-between px-8 shrink-0 print:hidden"'
)
text = text.replace(
    'className="w-64 cyber-sidebar flex flex-col justify-between shrink-0 print:hidden"',
    'className="w-64 chrome-sidebar flex flex-col justify-between shrink-0 print:hidden"'
)

# 2. Sidebar branding & headers
text = text.replace(
    'bg-slate-950/40 border-b border-cyan-500/10',
    'bg-white border-b border-gray-200'
)
text = text.replace(
    'text-cyan-400 uppercase tracking-tight glow-cyan">Urban Air Quality OS',
    'text-gray-900 uppercase tracking-tight font-bold">Urban Air Quality OS'
)
text = text.replace(
    'bg-slate-950/20 border-b border-cyan-500/10 p-4 flex items-center justify-between',
    'bg-white border-b border-gray-200 p-4 flex items-center justify-between'
)
text = text.replace(
    'text-cyan-400 bg-slate-900 p-1 rounded-full border border-cyan-500/20 shadow-md shadow-cyan-500/5',
    'text-blue-600 bg-blue-50 p-1 rounded-full border border-blue-200'
)
text = text.replace(
    'text-slate-400 tracking-wider flex items-center gap-1.5 font-mono uppercase font-black"><Sliders className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> EVENT SIMULATOR',
    'text-gray-650 tracking-wider flex items-center gap-1.5 font-sans uppercase font-bold text-xs"><Sliders className="w-3.5 h-3.5 text-blue-500" /> EVENT SIMULATOR'
)

# 3. Sidebar simulator checkbox wrapper
text = text.replace(
    'className="flex items-center justify-between text-[11px] text-slate-300 cursor-pointer bg-slate-900/40 hover:bg-slate-900/80 p-2 rounded-lg border border-cyan-500/10 transition"',
    'className="flex items-center justify-between text-[11px] text-gray-700 cursor-pointer bg-gray-50 hover:bg-gray-100 p-2 rounded-lg border border-gray-200 transition"'
)

# 4. Sidebar Navigation Items
text = text.replace('activeTab === \'dashboard\' ? \'cyber-active-badge\' : \'text-slate-400 hover:bg-cyan-500/5 hover:text-cyan-300\'', 'activeTab === \'dashboard\' ? \'chrome-active-tab\' : \'text-gray-700 hover:bg-gray-100\'')
text = text.replace('activeTab === \'copilot\' ? \'cyber-active-badge\' : \'text-slate-400 hover:bg-cyan-500/5 hover:text-cyan-300\'', 'activeTab === \'copilot\' ? \'chrome-active-tab\' : \'text-gray-700 hover:bg-gray-100\'')
text = text.replace('activeTab === \'graph\' ? \'cyber-active-badge\' : \'text-slate-400 hover:bg-cyan-500/5 hover:text-cyan-300\'', 'activeTab === \'graph\' ? \'chrome-active-tab\' : \'text-gray-700 hover:bg-gray-100\'')
text = text.replace('activeTab === \'simulator\' ? \'cyber-active-badge\' : \'text-slate-400 hover:bg-cyan-500/5 hover:text-cyan-300\'', 'activeTab === \'simulator\' ? \'chrome-active-tab\' : \'text-gray-700 hover:bg-gray-100\'')
text = text.replace('activeTab === \'executive\' ? \'cyber-active-badge\' : \'text-slate-400 hover:bg-cyan-500/5 hover:text-cyan-300\'', 'activeTab === \'executive\' ? \'chrome-active-tab\' : \'text-gray-700 hover:bg-gray-100\'')
text = text.replace('activeTab === \'rca\' ? \'cyber-active-badge\' : \'text-slate-400 hover:bg-cyan-500/5 hover:text-cyan-300\'', 'activeTab === \'rca\' ? \'chrome-active-tab\' : \'text-gray-700 hover:bg-gray-100\'')
text = text.replace('activeTab === \'timeline\' ? \'cyber-active-badge\' : \'text-slate-400 hover:bg-cyan-500/5 hover:text-cyan-300\'', 'activeTab === \'timeline\' ? \'chrome-active-tab\' : \'text-gray-700 hover:bg-gray-100\'')
text = text.replace('activeTab === \'upload\' ? \'cyber-active-badge\' : \'text-slate-400 hover:bg-cyan-500/5 hover:text-cyan-300\'', 'activeTab === \'upload\' ? \'chrome-active-tab\' : \'text-gray-700 hover:bg-gray-100\'')
text = text.replace('activeTab === \'report\' ? \'cyber-active-badge\' : \'text-slate-400 hover:bg-cyan-500/5 hover:text-cyan-300\'', 'activeTab === \'report\' ? \'chrome-active-tab\' : \'text-gray-700 hover:bg-gray-100\'')

# 5. Header Search Pill
text = text.replace(
    'className="flex items-center gap-3 bg-slate-900/60 px-4 py-2 rounded-xl border border-cyan-500/25 shadow-lg shadow-cyan-500/5"',
    'className="flex items-center gap-2 chrome-omnibox min-w-[320px]"'
)
text = text.replace(
    'className="text-sm font-bold text-slate-400 font-mono uppercase tracking-wide">Global Air Quality:',
    'className="hidden">'
)
text = text.replace(
    'className="bg-transparent text-cyan-300 font-semibold text-sm focus:outline-none cursor-text min-w-[200px] font-mono"',
    'className="bg-transparent text-gray-800 font-medium text-sm focus:outline-none cursor-text w-full placeholder-gray-500"'
)

# 6. Header Metric Cards
text = text.replace('cyber-card px-5 py-2', 'chrome-card px-4 py-2')
text = text.replace('stat-label', 'chrome-label-small')
text = text.replace('glow-green led-number', 'chrome-text-green chrome-number-large')
text = text.replace('glow-amber led-number', 'chrome-text-yellow chrome-number-large')
text = text.replace('glow-rose led-number', 'chrome-text-red chrome-number-large')
text = text.replace('text-gray-400', 'text-gray-400 chrome-number-large')

# 7. Login / Register screen
text = text.replace(
    'className="min-h-screen bg-[#050814] flex items-center justify-center font-sans p-4 relative overflow-hidden"',
    'className="min-h-screen bg-[#f6f8fa] flex items-center justify-center font-sans p-4 relative overflow-hidden"'
)
text = text.replace(
    'className="w-full max-w-md cyber-card p-8 relative z-10 shadow-2xl shadow-cyan-500/10"',
    'className="w-full max-w-md chrome-card p-8 relative z-10"'
)
text = text.replace(
    'bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/20',
    'bg-blue-50 text-blue-600 p-2 rounded-full border border-blue-200'
)
text = text.replace(
    'text-cyan-400 uppercase tracking-wider text-[10px] font-mono font-bold',
    'text-gray-700 uppercase tracking-wider text-[10px] font-semibold'
)
text = text.replace(
    'bg-slate-900/60 text-slate-100 border border-cyan-500/20 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-mono',
    'bg-white text-gray-900 border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all'
)
text = text.replace(
    'className="w-full mt-2 cyber-button font-bold py-3 rounded-lg text-sm tracking-wider uppercase"',
    'className="w-full mt-2 chrome-button py-3 text-sm font-semibold uppercase"'
)

# 8. Map Container HUD header
text = text.replace(
    'className="p-4 bg-slate-950/80 border-b border-cyan-500/10 flex items-center justify-between z-[400] relative backdrop-blur-md"',
    'className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between z-[400] relative"'
)
text = text.replace(
    'className="bg-slate-900 border border-cyan-500/20 text-slate-400 hover:text-cyan-300 hover:bg-slate-900"',
    'className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"'
)
text = text.replace(
    'className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${mapLayer === \'roadmap\' ? \'cyber-active-badge border-cyan-500\' : \'bg-slate-900 border border-cyan-500/20 text-slate-400 hover:text-cyan-300\'}`}',
    'className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${mapLayer === \'roadmap\' ? \'chrome-active-tab border-blue-500\' : \'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50\'}`}'
)
text = text.replace(
    'className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${mapLayer === \'satellite\' ? \'cyber-active-badge border-cyan-500\' : \'bg-slate-900 border border-cyan-500/20 text-slate-400 hover:text-cyan-300\'}`}',
    'className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${mapLayer === \'satellite\' ? \'chrome-active-tab border-blue-500\' : \'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50\'}`}'
)
text = text.replace(
    'className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${mapLayer === \'hybrid\' ? \'cyber-active-badge border-cyan-500\' : \'bg-slate-900 border border-cyan-500/20 text-slate-400 hover:text-cyan-300\'}`}',
    'className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${mapLayer === \'hybrid\' ? \'chrome-active-tab border-blue-500\' : \'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50\'}`}'
)

# 9. Main dashboard cards inside tabs
text = text.replace('cyber-card p-5 shadow-lg', 'chrome-card p-6')
text = text.replace('className="cyber-card p-5 shadow-lg"', 'className="chrome-card p-6"')
text = text.replace('className="cyber-card p-5 shadow-lg flex-1 flex flex-col"', 'className="chrome-card p-6 flex-1 flex flex-col"')
text = text.replace('className="bg-slate-950/80 border-b border-cyan-500/10"', 'className="bg-gray-50 border-b border-gray-200"')

# 10. General color variables conversion to light mode
text = text.replace('text-slate-100', 'text-gray-900')
text = text.replace('text-slate-200', 'text-gray-800')
text = text.replace('text-slate-300', 'text-gray-700')
text = text.replace('text-slate-400', 'text-gray-500')
text = text.replace('text-slate-500', 'text-gray-500')
text = text.replace('text-slate-650', 'text-gray-500')
text = text.replace('border-slate-800', 'border-gray-200')
text = text.replace('border-slate-850', 'border-gray-200')
text = text.replace('bg-slate-950', 'bg-white')
text = text.replace('bg-slate-900', 'bg-gray-50')
text = text.replace('text-cyan-400', 'text-blue-600')
text = text.replace('text-cyan-300', 'text-blue-500')

with open('frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Chrome/MSN flat light-mode theme successfully integrated into App.jsx!")
