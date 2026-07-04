with open('frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Literal string replacements to bypass regex character class traps
text = text.replace('bg-[#0a1222]', 'bg-white border border-gray-200 rounded-xl shadow-sm')
text = text.replace('bg-[#060c18]', 'bg-gray-50 border-b border-gray-200')
text = text.replace('bg-[#080e1a]', 'bg-white')
text = text.replace('bg-[#050814]', 'bg-[#f6f8fa]')
text = text.replace('text-white leading-normal font-semibold', 'text-blue-800 leading-normal font-semibold')

# Correct chart grid colors for high contrast light mode
text = text.replace('stroke="#1e293b"', 'stroke="#e2e8f0"')
text = text.replace('stroke="#94a3b8"', 'stroke="#5f6368"')
text = text.replace('stroke="#e2e8f0"', 'stroke="#5f6368"')
text = text.replace("backgroundColor: '#090f1c', borderColor: '#1e293b'", "backgroundColor: '#ffffff', borderColor: '#dadce0'")

with open('frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Remaining dark containers and chart colors successfully fixed!")
