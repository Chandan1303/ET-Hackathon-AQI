import re

with open('frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

replacements = {
    r'bg-[#0a1222]': 'bg-white/80 backdrop-blur-md border border-gray-200 shadow-sm',
    r'bg-[#060c18]': 'bg-gray-50/80 border-b border-gray-200',
    r'bg-[#080e1a]': 'bg-white',
    r'bg-slate-900/60': 'bg-gray-50',
    r'bg-slate-950/40': 'bg-gray-100/50',
    r'bg-slate-900': 'bg-gray-50',
    r'bg-slate-950': 'bg-gray-100',
    r'border-slate-800': 'border-gray-200',
    r'border-slate-850': 'border-gray-200',
    r'border-slate-750': 'border-gray-200',
    r'text-slate-200': 'text-gray-900',
    r'text-slate-250': 'text-gray-800',
    r'text-slate-300': 'text-gray-700',
    r'text-slate-350': 'text-gray-650', # Intermediate step
    r'text-slate-400': 'text-gray-500',
    r'text-slate-450': 'text-gray-500',
    r'text-slate-500': 'text-gray-500',
    r'text-slate-550': 'text-gray-500',
    r'text-slate-650': 'text-gray-400',
    r'text-slate-555': 'text-gray-400',
    r'text-cyan-400': 'text-blue-600',
    r'text-cyan-300': 'text-blue-500',
    r'text-cyan-200': 'text-blue-700',
    r'bg-cyan-950/20': 'bg-blue-50',
    r'border-cyan-500': 'border-blue-300',
    r'accent-cyan-500': 'accent-blue-600',
    r'text-rose-400': 'text-red-600',
    r'text-teal-400': 'text-teal-600',
    r'bg-slate-850': 'bg-gray-200',
    r'text-gray-650': 'text-gray-600', # Fix intermediate
}

# Apply replacements
modified_text = text
for pattern, replacement in replacements.items():
    modified_text = re.sub(pattern, replacement, modified_text)

# Also fix checkbox bg/border styles inside sidebar/workflows
modified_text = re.sub(r'bg-slate-950 border-slate-700', 'bg-white border-gray-300', modified_text)
modified_text = re.sub(r'text-cyan-555 bg-slate-950 border-slate-700', 'text-blue-600 bg-white border-gray-300', modified_text)

with open('frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(modified_text)

print("Theme conversion successfully completed!")
