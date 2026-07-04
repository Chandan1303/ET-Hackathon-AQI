with open('frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Repair corrupted tokens caused by unescaped character class in regex
text = text.replace('bg-gray-50/80 border-b border-gray-200yan-600', 'bg-blue-600 hover:bg-blue-700 text-white')
text = text.replace('bg-gray-50/80 border-b border-gray-200yan-700', 'bg-blue-700')
text = text.replace('bg-gray-50/80 border-b border-gray-200yan-950/20', 'bg-blue-50')
text = text.replace('bg-gray-50/80 border-b border-gray-200yan-950/15', 'bg-blue-50/70')
text = text.replace('bg-gray-50/80 border-b border-gray-200yan-500/10', 'bg-blue-50')

with open('frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Class names successfully repaired!")
