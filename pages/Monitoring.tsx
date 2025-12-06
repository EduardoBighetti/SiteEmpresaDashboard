
import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Thermometer, Droplets, Clock, Wifi, Cpu } from 'lucide-react';
import { sensorService, readingService } from '../services/api';
import { Sensor, Reading } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export const Monitoring: React.FC = () => {
  const { t, units } = useLanguage();
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [selectedSensorId, setSelectedSensorId] = useState<string>('');
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(false);

  // Load sensor list on mount
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

  // Load readings when selection changes
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
    const interval = setInterval(fetchReadings, 30000); // Auto refresh
    return () => clearInterval(interval);
  }, [selectedSensorId]);

  const selectedSensor = sensors.find(s => s.id.toString() === selectedSensorId);
  const latestReading = readings.length > 0 ? readings[readings.length - 1] : null;

  // Conversion Helper
  const convertTemp = (tempC: number) => {
    return units.temperature === 'F' ? (tempC * 1.8) + 32 : tempC;
  };
  const tempUnit = units.temperature === 'F' ? '°F' : '°C';

  // Format data for charts
  const chartData = readings.map(r => ({
    ...r,
    displayTemp: Number(convertTemp(r.temperature).toFixed(1)),
    time: new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    date: new Date(r.created_at).toLocaleDateString()
  }));

  const latestTempDisplay = latestReading ? convertTemp(latestReading.temperature).toFixed(1) : '--';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('mon.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('mon.subtitle')}</p>
        </div>

        <div className="w-full md:w-72">
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">{t('mon.select_label')}</label>
          <div className="relative">
            <select
              value={selectedSensorId}
              onChange={(e) => setSelectedSensorId(e.target.value)}
              className="w-full appearance-none bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-white py-2.5 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
            >
              <option value="" disabled>{t('mon.select_placeholder')}</option>
              {sensors.map(sensor => (
                <option key={sensor.id} value={sensor.id}>
                  {sensor.name} ({sensor.identifier})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>
      </div>

      {!selectedSensorId ? (
        <div className="bg-white dark:bg-slate-800 p-12 rounded-xl text-center shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Cpu size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('mon.no_selection')}</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('mon.no_selection_sub')}</p>
        </div>
      ) : (
        <>
          {/* Header Card for Selected Device */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${selectedSensor?.status === 'active' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                <Wifi size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{selectedSensor?.name}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-mono bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded text-xs">{selectedSensor?.identifier}</span>
                  <span>•</span>
                  <span>{selectedSensor?.status === 'active' ? t('dash.online') : 'Offline'}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-700/50 px-6 py-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{t('mon.last_read')}: <strong>{latestReading ? new Date(latestReading.created_at).toLocaleTimeString() : '--:--'}</strong></span>
              </div>
            </div>
          </div>

          {loading && readings.length === 0 ? (
             <div className="text-center py-10 text-gray-500 dark:text-gray-400">{t('dash.loading')}</div>
          ) : (
            <>
              {/* Detailed Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 border-l-4 border-l-orange-500">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">
                      <Thermometer size={18} /> {t('mon.col_temp')}
                    </h3>
                    <span className="text-2xl font-bold text-gray-800 dark:text-white">
                      {latestTempDisplay}{tempUnit}
                    </span>
                  </div>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorTempMon" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="time" hide />
                        <Tooltip 
                            contentStyle={{ backgroundColor: 'rgb(30, 41, 59)', border: 'none', borderRadius: '8px', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(value: number) => [`${value}${tempUnit}`, t('mon.col_temp')]}
                        />
                        <Area type="monotone" dataKey="displayTemp" stroke="#f97316" fill="url(#colorTempMon)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 border-l-4 border-l-blue-500">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">
                      <Droplets size={18} /> {t('mon.col_hum')}
                    </h3>
                    <span className="text-2xl font-bold text-gray-800 dark:text-white">
                      {latestReading?.humidity.toFixed(1) || '--'}%
                    </span>
                  </div>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <XAxis dataKey="time" hide />
                        <Tooltip 
                             cursor={{fill: 'rgba(255,255,255,0.1)'}} 
                             contentStyle={{ backgroundColor: 'rgb(30, 41, 59)', border: 'none', borderRadius: '8px', color: '#fff' }}
                             itemStyle={{ color: '#fff' }}
                             formatter={(value: number) => [`${value}%`, t('mon.col_hum')]}
                        />
                        <Bar dataKey="humidity" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
                  <h3 className="font-semibold text-gray-800 dark:text-white">{t('mon.history')}</h3>
                </div>
                <div className="overflow-x-auto max-h-80 overflow-y-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-slate-700/50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t('mon.col_date')}</th>
                        <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t('mon.col_time')}</th>
                        <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t('mon.col_temp')}</th>
                        <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t('mon.col_hum')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                      {readings.slice().reverse().map((reading) => (
                        <tr key={reading.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                          <td className="px-6 py-3 text-gray-600 dark:text-gray-300">{new Date(reading.created_at).toLocaleDateString()}</td>
                          <td className="px-6 py-3 text-gray-600 dark:text-gray-300">{new Date(reading.created_at).toLocaleTimeString()}</td>
                          <td className="px-6 py-3 font-medium text-orange-600 dark:text-orange-400">
                             {convertTemp(reading.temperature).toFixed(1)}{tempUnit}
                          </td>
                          <td className="px-6 py-3 font-medium text-blue-600 dark:text-blue-400">{reading.humidity.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};
