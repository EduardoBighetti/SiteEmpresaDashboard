
import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Thermometer, Droplets, Clock, Wifi, WifiOff, Cpu, MapPin, Layers, Layout, Maximize2 } from 'lucide-react';
import { sensorService, readingService } from '../services/api';
import { Sensor, Reading } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

// --- SUB-COMPONENTE: PLANTA BAIXA ---
interface FloorPlanProps {
  sensors: Sensor[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const FloorPlan: React.FC<FloorPlanProps> = ({ sensors, selectedId, onSelect }) => {
  return (
    <div className="relative w-full h-full bg-slate-50 dark:bg-slate-900 overflow-hidden border-2 border-slate-200 dark:border-slate-700 rounded-xl">
      {/* Imagem de Fundo (Planta Técnica) */}
      <div className="absolute inset-0 opacity-40 dark:opacity-20 pointer-events-none">
        {/* Grid técnico simulando a planta */}
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)',
          backgroundSize: '40px 40px' 
        }}></div>
        {/* Paredes simuladas da loja */}
        <div className="absolute top-[10%] left-[10%] right-[10%] bottom-[10%] border-4 border-slate-400 dark:border-slate-500 rounded-lg"></div>
        <div className="absolute top-[10%] left-[50%] w-1 h-[40%] bg-slate-400 dark:bg-slate-500"></div>
        <div className="absolute top-[50%] left-[10%] right-[50%] h-1 bg-slate-400 dark:border-slate-500"></div>
        
        {/* Labels de Setores */}
        <span className="absolute top-[15%] left-[15%] text-[10px] font-black text-slate-400 uppercase tracking-widest">Estoque Central</span>
        <span className="absolute top-[15%] right-[15%] text-[10px] font-black text-slate-400 uppercase tracking-widest">Setor Vendas A</span>
        <span className="absolute bottom-[15%] left-[15%] text-[10px] font-black text-slate-400 uppercase tracking-widest">Câmaras Frias</span>
        <span className="absolute bottom-[15%] right-[15%] text-[10px] font-black text-slate-400 uppercase tracking-widest">Check-out / Entrada</span>
      </div>

      {/* Mapeamento dos Sensores */}
      {sensors.map(sensor => {
        if (sensor.floor_x === undefined || sensor.floor_y === undefined) return null;
        
        const isActive = sensor.id.toString() === selectedId;
        const statusColor = sensor.status === 'active' ? 'bg-green-500' : 'bg-red-500';

        return (
          <button
            key={sensor.id}
            onClick={() => onSelect(sensor.id.toString())}
            style={{ left: `${sensor.floor_x}%`, top: `${sensor.floor_y}%` }}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 group transition-all duration-300 ${isActive ? 'z-20 scale-125' : 'z-10 hover:scale-110'}`}
          >
            {/* Ping Animado */}
            {sensor.status === 'active' && (
              <span className={`absolute inset-0 rounded-full animate-ping opacity-75 ${statusColor} scale-150`}></span>
            )}
            
            {/* LED principal */}
            <div className={`relative w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 shadow-lg ${statusColor} ${isActive ? 'ring-4 ring-blue-500/30' : ''}`}></div>
            
            {/* Tooltip Hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap">
              <div className="bg-slate-800 text-white text-[10px] py-1 px-2 rounded-md shadow-xl border border-slate-700 font-bold uppercase tracking-wider">
                {sensor.name}
              </div>
            </div>
          </button>
        );
      })}

      {/* Marca D'água da Planta */}
      <div className="absolute bottom-4 right-4 text-[10px] font-black text-slate-400/50 uppercase tracking-[0.2em] flex items-center gap-2">
        <Layout size={12} /> AL2 FLOOR_PLAN v1.0
      </div>
    </div>
  );
};

export const Monitoring: React.FC = () => {
  const { t, units } = useLanguage();
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [selectedSensorId, setSelectedSensorId] = useState<string>('');
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSensors = async () => {
      try {
        const data = await sensorService.getAll();
        setSensors(data);
        if (data.length > 0) {
          setSelectedSensorId(data[0].id.toString());
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadSensors();
  }, []);

  useEffect(() => {
    if (!selectedSensorId) return;

    const fetchReadings = async () => {
      setLoading(true);
      try {
        const data = await readingService.getLatest(Number(selectedSensorId));
        setReadings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReadings();
    const interval = setInterval(fetchReadings, 30000);
    return () => clearInterval(interval);
  }, [selectedSensorId]);

  const selectedSensor = sensors.find(s => s.id.toString() === selectedSensorId);
  const latestReading = readings.length > 0 ? readings[readings.length - 1] : null;

  const convertTemp = (tempC: number) => {
    return units.temperature === 'F' ? (tempC * 1.8) + 32 : tempC;
  };
  const tempUnit = units.temperature === 'F' ? '°F' : '°C';

  const latestTempDisplay = latestReading ? convertTemp(latestReading.temperature).toFixed(1) : '--';

  return (
    <div className="space-y-6 pb-20">
      {/* HEADER E SELEÇÃO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">Monitoramento em Tempo Real</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Visualização de ativos e localização em planta baixa.</p>
        </div>

        <div className="w-full md:w-80">
          <div className="relative">
            <select
              value={selectedSensorId}
              onChange={(e) => setSelectedSensorId(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-white py-3 px-4 pr-10 rounded-xl font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all appearance-none"
            >
              <option value="" disabled>{t('mon.select_placeholder')}</option>
              {sensors.map(sensor => (
                <option key={sensor.id} value={sensor.id}>
                  {sensor.name} • {sensor.identifier}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
               <Layers size={18} />
            </div>
          </div>
        </div>
      </div>

      {!selectedSensorId ? (
        <div className="bg-white dark:bg-slate-800 p-16 rounded-3xl text-center shadow-xl border border-gray-100 dark:border-slate-700">
          <Cpu size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Selecione uma Unidade</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Escolha um projeto no menu acima para iniciar o monitoramento.</p>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* CARDS DE MÉTRICAS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 flex items-center gap-4 shadow-sm">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 text-orange-600 rounded-xl">
                <Thermometer size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Temperatura</p>
                <h4 className="text-2xl font-black text-gray-800 dark:text-white">{latestTempDisplay}{tempUnit}</h4>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 flex items-center gap-4 shadow-sm">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-xl">
                <Droplets size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Umidade</p>
                <h4 className="text-2xl font-black text-gray-800 dark:text-white">{latestReading?.humidity.toFixed(1) || '--'}%</h4>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 flex items-center gap-4 col-span-1 lg:col-span-2 shadow-sm">
               <div className={`p-3 rounded-xl ${selectedSensor?.status === 'active' ? 'bg-green-100 text-green-600 dark:bg-green-900/20' : 'bg-red-100 text-red-600 dark:bg-red-900/20'}`}>
                  <Wifi size={24} />
               </div>
               <div className="flex-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Status do Gateway</p>
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-bold text-gray-800 dark:text-white">
                      {selectedSensor?.status === 'active' ? 'Conectado via LoRaWAN' : 'Falha na Comunicação'}
                    </h4>
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-bold text-blue-500 uppercase">{selectedSensor?.identifier}</p>
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">{latestReading ? new Date(latestReading.created_at).toLocaleTimeString() : '--:--'}</p>
               </div>
            </div>
          </div>

          {/* TABELA DE HISTÓRICO */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
             <div className="px-8 py-6 border-b border-gray-50 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-gray-800 dark:text-white tracking-tight">Histórico de Eventos</h3>
                  <p className="text-xs text-gray-400 mt-0.5 font-medium">Logs detalhados de recepção RF.</p>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Sync</span>
                </div>
             </div>
             
             <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
               <table className="w-full text-left">
                 <thead className="bg-slate-50/50 dark:bg-slate-700/30 sticky top-0 backdrop-blur-md">
                   <tr>
                     <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Data/Hora</th>
                     <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Temp.</th>
                     <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Umidade</th>
                     <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Qualidade do Link</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
                   {readings.length === 0 ? (
                      <tr><td colSpan={4} className="px-8 py-10 text-center text-gray-400 italic text-xs">Sem dados para este período.</td></tr>
                   ) : (
                     readings.slice().reverse().map((r) => (
                       <tr key={r.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group">
                         <td className="px-8 py-4">
                           <div className="text-sm font-bold text-gray-600 dark:text-gray-300">
                             {new Date(r.created_at).toLocaleDateString()}
                             <span className="ml-2 font-mono text-gray-400 text-xs">{new Date(r.created_at).toLocaleTimeString()}</span>
                           </div>
                         </td>
                         <td className="px-8 py-4 text-center">
                            <span className="font-black text-orange-600 dark:text-orange-400">{convertTemp(r.temperature).toFixed(1)}{tempUnit}</span>
                         </td>
                         <td className="px-8 py-4 text-center">
                            <span className="font-black text-blue-600 dark:text-blue-400">{r.humidity.toFixed(1)}%</span>
                         </td>
                         <td className="px-8 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                               <div className="w-1 h-3 bg-green-500 rounded-full"></div>
                               <div className="w-1 h-3 bg-green-500 rounded-full"></div>
                               <div className="w-1 h-3 bg-green-500 rounded-full opacity-30"></div>
                               <span className="text-[10px] font-mono text-gray-400 ml-1">-78 dBm</span>
                            </div>
                         </td>
                       </tr>
                     ))
                   )}
                 </tbody>
               </table>
             </div>
          </div>

          {/* SEÇÃO DE GEOLOCALIZAÇÃO E PLANTA BAIXA */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* MAPA DA PLANTA BAIXA (LOJA) */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden flex flex-col h-[550px]">
               <div className="p-6 border-b border-gray-50 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-gray-800 dark:text-white flex items-center gap-2 tracking-tight uppercase text-sm">
                      <Layout size={18} className="text-blue-600" />
                      Mapa da Unidade / Implantação
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Mercadão Atacadista - Unidade Central</p>
                  </div>
                  <button className="p-2 text-gray-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                     <Maximize2 size={18} />
                  </button>
               </div>
               
               <div className="flex-1 p-6">
                  <FloorPlan 
                    sensors={sensors} 
                    selectedId={selectedSensorId} 
                    onSelect={setSelectedSensorId} 
                  />
               </div>

               <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-700 flex justify-center gap-6">
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full bg-green-500"></div>
                     <span className="text-[10px] font-black text-gray-500 uppercase">Operacional</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full bg-red-500"></div>
                     <span className="text-[10px] font-black text-gray-500 uppercase">Offline</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                     <span className="text-[10px] font-black text-gray-500 uppercase">Alerta</span>
                  </div>
               </div>
            </div>

            {/* LOCALIZAÇÃO VIA SATÉLITE */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden flex flex-col h-[550px]">
               <div className="p-6 border-b border-gray-50 dark:border-slate-700 flex items-center justify-between">
                  <h3 className="font-black text-gray-800 dark:text-white flex items-center gap-2 tracking-tight uppercase text-sm">
                    <MapPin size={18} className="text-red-500" />
                    Localização via Satélite (GPS)
                  </h3>
               </div>
               
               {selectedSensor?.latitude && selectedSensor?.longitude ? (
                 <div className="flex-1 relative">
                    <iframe 
                      title="GPS Location"
                      width="100%" 
                      height="100%" 
                      frameBorder="0" 
                      src={`https://maps.google.com/maps?q=${selectedSensor.latitude},${selectedSensor.longitude}&z=17&output=embed`}
                      className="dark:invert dark:hue-rotate-180 dark:brightness-90"
                    />
                    <div className="absolute bottom-6 left-6 right-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-4 rounded-2xl border border-white dark:border-slate-600 shadow-2xl">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/40">
                             <MapPin size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Coordenadas Precisas</p>
                            <p className="text-xs font-bold text-slate-800 dark:text-white">
                              {selectedSensor.latitude}, {selectedSensor.longitude}
                            </p>
                          </div>
                       </div>
                    </div>
                 </div>
               ) : (
                 <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-gray-50 dark:bg-slate-900/50">
                    <WifiOff size={40} className="text-gray-300 mb-4" />
                    <h4 className="font-bold text-gray-700 dark:text-gray-300">GPS não configurado</h4>
                    <p className="text-xs text-gray-400 mt-2 max-w-xs">Ative o GPS nas configurações do dispositivo para visualização via satélite.</p>
                 </div>
               )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
