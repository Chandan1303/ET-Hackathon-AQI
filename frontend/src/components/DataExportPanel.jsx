import { Download, FileJson, FileSpreadsheet } from 'lucide-react';

function downloadFile(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function toCsv(rows) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map(h => {
      const val = row[h];
      const str = val == null ? '' : String(val);
      return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
    }).join(','));
  }
  return lines.join('\n');
}

export default function DataExportPanel({ sensors, equipment, incidents, complianceReport, cityName }) {
  const timestamp = new Date().toISOString().split('T')[0];

  const exportSensorsCsv = () => {
    downloadFile(toCsv(sensors), `sensors-${cityName}-${timestamp}.csv`, 'text/csv');
  };

  const exportIncidentsCsv = () => {
    downloadFile(toCsv(incidents), `incidents-${timestamp}.csv`, 'text/csv');
  };

  const exportFullJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      city: cityName,
      sensors,
      equipment,
      incidents,
      compliance: complianceReport,
    };
    downloadFile(JSON.stringify(payload, null, 2), `urban-eco-export-${timestamp}.json`, 'application/json');
  };

  const buttons = [
    { label: 'Sensors CSV', icon: FileSpreadsheet, onClick: exportSensorsCsv, desc: `${sensors.length} live readings` },
    { label: 'Incidents CSV', icon: FileSpreadsheet, onClick: exportIncidentsCsv, desc: `${incidents.length} records` },
    { label: 'Full JSON Report', icon: FileJson, onClick: exportFullJson, desc: 'Sensors + equipment + compliance' },
  ];

  return (
    <div className="tab-panel overflow-visible p-5">
      <p className="text-[11px] font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2 leading-none">
        <Download className="w-4 h-4 text-blue-600 shrink-0" /> Data Export Hub
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {buttons.map(({ label, icon: Icon, onClick, desc }) => (
          <button
            key={label}
            onClick={onClick}
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300 transition text-left h-full min-h-[4.5rem]"
          >
            <Icon className="w-5 h-5 text-blue-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 leading-tight">{label}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
