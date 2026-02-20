
import React, { useEffect, useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Thermometer, Droplets, Clock, BarChart3, Filter, CheckSquare, Square, ChevronDown, ChevronUp } from 'lucide-react';
import { readingService, sensorService, authService } from '../services/api';
import { Reading, Sensor, User } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export const Dashboard: React.FC = () => {
  const { t, units } = useLanguage();
  const [readings, setReadings] = useState<Reading[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const [{ user }, allSensors, allReadings] = await Promise.all([
          authService.me(),
          sensorService.getAll(),
          readingService.getLatest()
        ]);
        
        setCurrentUser(user);
        setSensors(allSensors);
        setReadings(allReadings);
        // Por padrão, seleciona todos os sensores ativos
        setSelectedIds(allSensors.filter(s => s.status === 'active').map(s => s.id));
      } catch (error) {
        console.error("Failed to init dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    init();
    const interval = setInterval(async () => {
      const data = await readingService.getLatest();
      setReadings(data);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const isManagement = currentUser?.role === 'gerencia' || currentUser?.role === 'admin';

  const toggleSensor = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedIds(sensors.map(s => s.id));
  const selectNone = () => setSelectedIds([]);

  // Lógica de Conversão
  const convertTemp = (tempC: number) => {
    return units.temperature === 'F' ? (tempC * 1.8) + 32 : tempC;
  };
  const tempUnit = units.temperature === 'F' ? '°F' : '°C';

  // --- CÁLCULO DAS MÉTRICAS FILTRADAS ---
  const aggregatedData = useMemo(() => {
    const filtered = readings.filter(r => selectedIds.includes(r.sensor_id));
    
    if (filtered.length === 0) return { avgTemp: 0, avgHum: 0, chartData: [] };

    const avgTemp = filtered.reduce((acc, r) => acc + r.temperature, 0) / filtered.length;
    const avgHum = filtered.reduce((acc, r) => acc + r.humidity, 0) / filtered.length;

    // Agrupamento por tempo para o gráfico (Média dos selecionados no mesmo timestamp)
    const timeGroups: Record<string, { temps: number[], hums: number[] }> = {};
    
    filtered.forEach(r => {
      const time = new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (!timeGroups[time]) timeGroups[time] = { temps: [], hums: [] };
      timeGroups[time].temps.push(r.temperature);
      timeGroups[time].hums.push(r.humidity);
    });

    const chartData = Object.entries(timeGroups).map(([time, data]) => ({
      time,
      displayTemp: Number(convertTemp(data.temps.reduce((a, b) => a + b, 0) / data.temps.length).toFixed(1)),
      humidity: Number((data.hums.reduce((a, b) => a + b, 0) / data.hums.length).toFixed(1))
    })).sort((a, b) => a.time.localeCompare(b.time));

    return { avgTemp, avgHum, chartData };
  }, [readings, selectedIds, units.temperature]);

  if (loading) {
    return <div className="h-96 flex items-center justify-center text-gray-500 font-bold animate-pulse">{t('dash.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">{t('dash.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{selectedIds.length} projetos selecionados para composição da média.</p>
        </div>

        {isManagement && (
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all border-2 ${showFilters ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 text-gray-600 dark:text-gray-300'}`}
          >
            <Filter size={18} />
            {showFilters ? 'Ocultar Filtros' : 'Filtrar Projetos'}
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}
      </div>

      {/* PAINEL DE FILTROS DINÂMICO */}
      {showFilters && isManagement && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Activity size={14} className="text-blue-500" />
              Selecione Projetos para Agregação
            </h3>
            <div className="flex gap-4">
              <button onClick={selectAll} className="text-[10px] font-black text-blue-600 uppercase hover:underline">Todos</button>
              <button onClick={selectNone} className="text-[10px] font-black text-gray-400 uppercase hover:underline">Limpar</button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {sensors.map(sensor => (
              <button
                key={sensor.id}
                onClick={() => toggleSensor(sensor.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                  selectedIds.includes(sensor.id) 
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' 
                    : 'border-transparent bg-gray-50 dark:bg-slate-900/50'
                }`}
              >
                {selectedIds.includes(sensor.id) ? (
                  <CheckSquare size={18} className="text-blue-600 shrink-0" />
                ) : (
                  <Square size={18} className="text-gray-300 dark:text-slate-700 shrink-0" />
                )}
                <div className="overflow-hidden">
                  <p className={`text-xs font-bold truncate ${selectedIds.includes(sensor.id) ? 'text-blue-700 dark:text-blue-400' : 'text-gray-500'}`}>
                    {sensor.name}
                  </p>
                  <p className="text-[9px] font-mono text-gray-400 uppercase">{sensor.identifier}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid - Agora baseada no Agregado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Média de Temperatura"
          value={aggregatedData.avgTemp ? `${convertTemp(aggregatedData.avgTemp).toFixed(1)}${tempUnit}` : '--'} 
          icon={<Thermometer className="text-orange-500" />}
          trend={selectedIds.length > 0 ? `${selectedIds.length} ativos` : 'Sem dados'}
          trendColor="text-orange-500"
        />
        <StatCard 
          title="Média de Umidade" 
          value={aggregatedData.avgHum ? `${aggregatedData.avgHum.toFixed(1)}%` : '--'} 
          icon={<Droplets className="text-blue-500" />}
          trend="Média ponderada"
          trendColor="text-blue-500"
        />
        <StatCard 
          title="Sensores no Grupo"
          value={selectedIds.length.toString()}
          icon={<Activity className="text-green-500" />}
          trend="Monitoramento Ativo"
          trendColor="text-green-500"
        />
        <StatCard 
          title="Última Agregação" 
          value={new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
          icon={<Clock className="text-gray-400" />}
          trend="Live Sync"
          trendColor="text-slate-400"
        />
      </div>

      {/* Charts Section - Gráfico da Média do Grupo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-gray-800 dark:text-white flex items-center gap-2 uppercase tracking-tight">
              <BarChart3 size={18} className="text-orange-500" />
              Tendência de Temperatura (Grupo)
            </h3>
            <span className="text-[10px] font-bold px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-600 rounded-lg">Consolidado</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={aggregatedData.chartData}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="stroke-gray-200 dark:stroke-slate-700" />
                <XAxis dataKey="time" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgb(30, 41, 59)', border: 'none', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                  labelStyle={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="displayTemp" name="Temp. Média" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
           <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-gray-800 dark:text-white flex items-center gap-2 uppercase tracking-tight">
              <Droplets size={18} className="text-blue-500" />
              Tendência de Umidade (Grupo)
            </h3>
            <span className="text-[10px] font-bold px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-lg">Consolidado</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={aggregatedData.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="stroke-gray-200 dark:stroke-slate-700" />
                <XAxis dataKey="time" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip 
                   contentStyle={{ backgroundColor: 'rgb(30, 41, 59)', border: 'none', borderRadius: '12px', color: '#fff' }}
                   itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                   labelStyle={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px' }}
                />
                <Line type="monotone" dataKey="humidity" name="Umidade Média" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; trend: string; trendColor: string }> = ({ title, value, icon, trend, trendColor }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition-all group">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</h3>
      <div className="p-2 bg-gray-50 dark:bg-slate-700 rounded-xl group-hover:scale-110 transition-transform">{icon}</div>
    </div>
    <div className="flex flex-col">
      <span className="text-3xl font-black text-gray-800 dark:text-white leading-none mb-2 tracking-tighter">{value}</span>
      <span className={`text-[10px] font-black uppercase tracking-widest ${trendColor}`}>{trend}</span>
    </div>
  </div>
);
