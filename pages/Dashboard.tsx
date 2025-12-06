
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Thermometer, Droplets, Clock, BarChart3 } from 'lucide-react';
import { readingService } from '../services/api';
import { Reading } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export const Dashboard: React.FC = () => {
  const { t, units } = useLanguage();
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await readingService.getLatest();
        setReadings(data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Conversion Helper
  const convertTemp = (tempC: number) => {
    return units.temperature === 'F' ? (tempC * 1.8) + 32 : tempC;
  };
  const tempUnit = units.temperature === 'F' ? '°F' : '°C';

  const chartData = readings.map(r => ({
    ...r,
    displayTemp: Number(convertTemp(r.temperature).toFixed(1)),
    time: new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }));

  const latest = readings.length > 0 ? readings[readings.length - 1] : null;
  const displayLatestTemp = latest ? convertTemp(latest.temperature).toFixed(1) : '--';

  if (loading) {
    return <div className="p-10 text-center text-gray-500 dark:text-gray-400">{t('dash.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('dash.title')}</h1>
        <p className="text-gray-500 dark:text-gray-400">{t('dash.subtitle')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={t('dash.temp_avg')}
          value={`${displayLatestTemp}${tempUnit}`} 
          icon={<Thermometer className="text-orange-500" />}
          trend={t('dash.general')}
          trendColor="text-gray-500 dark:text-gray-400"
        />
        <StatCard 
          title={t('dash.hum_avg')} 
          value={`${latest?.humidity.toFixed(1) || '--'}%`} 
          icon={<Droplets className="text-blue-500" />}
          trend={t('dash.general')}
          trendColor="text-gray-500 dark:text-gray-400"
        />
        <StatCard 
          title={t('dash.network')}
          value={t('dash.online')}
          icon={<Activity className="text-green-500" />}
          trend={t('dash.stable')}
          trendColor="text-green-500"
        />
        <StatCard 
          title={t('dash.sync')} 
          value={latest ? new Date(latest.created_at).toLocaleTimeString() : '--:--'} 
          icon={<Clock className="text-gray-500 dark:text-gray-400" />}
          trend={t('dash.auto')}
          trendColor="text-blue-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-orange-500" />
            {t('dash.temp_avg')}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="stroke-gray-200 dark:stroke-slate-700" />
                <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgb(30, 41, 59)', border: 'none', borderRadius: '8px', color: '#fff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number) => [`${value}${tempUnit}`, t('dash.temp_avg')]}
                />
                <Area type="monotone" dataKey="displayTemp" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorTemp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Droplets size={20} className="text-blue-500" />
            {t('dash.hum_avg')}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="stroke-gray-200 dark:stroke-slate-700" />
                <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip 
                   contentStyle={{ backgroundColor: 'rgb(30, 41, 59)', border: 'none', borderRadius: '8px', color: '#fff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                   itemStyle={{ color: '#fff' }}
                   formatter={(value: number) => [`${value.toFixed(1)}%`, t('dash.hum_avg')]}
                />
                <Line type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; trend: string; trendColor: string }> = ({ title, value, icon, trend, trendColor }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-2">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      <div className="p-2 bg-gray-50 dark:bg-slate-700 rounded-lg">{icon}</div>
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-bold text-gray-800 dark:text-white">{value}</span>
      <span className={`text-xs font-medium ${trendColor}`}>{trend}</span>
    </div>
  </div>
);
