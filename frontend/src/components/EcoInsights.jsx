import { Leaf } from 'lucide-react';
import GrapStagePanel from './GrapStagePanel.jsx';
import WeatherDispersionPanel from './WeatherDispersionPanel.jsx';
import StationScorecard from './StationScorecard.jsx';
import PollutionForecast from './PollutionForecast.jsx';
import DataExportPanel from './DataExportPanel.jsx';

export default function EcoInsights({
  cityName,
  aqi,
  sensors,
  equipment,
  incidents,
  complianceReport,
}) {
  return (
    <div className="readable-panel flex-1 flex flex-col gap-4 overflow-y-auto pr-3 pb-4 custom-scroll">
      <div className="tab-panel overflow-visible px-6 py-5 shrink-0">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 leading-normal">
          <Leaf className="w-5 h-5 text-green-600 shrink-0" /> Eco Insights Hub
        </h2>
        <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
          GRAP staging, weather dispersion, station scorecard, pollution forecast &amp; data export
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-stretch">
        <GrapStagePanel aqi={aqi} cityName={cityName} />
        <WeatherDispersionPanel sensors={sensors} />
        <StationScorecard equipment={equipment} sensors={sensors} />
        <PollutionForecast sensors={sensors} aqi={aqi} />
        <div className="xl:col-span-2">
          <DataExportPanel
            sensors={sensors}
            equipment={equipment}
            incidents={incidents}
            complianceReport={complianceReport}
            cityName={cityName}
          />
        </div>
      </div>
    </div>
  );
}
