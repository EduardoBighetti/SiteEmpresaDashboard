
import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Cpu, WifiOff, Wifi, MapPin, Lock, ShieldCheck } from 'lucide-react';
import { sensorService, authService } from '../services/api';
import { Sensor, User } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export const Devices: React.FC = () => {
  const { t } = useLanguage();
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSensor, setNewSensor] = useState({ identifier: '', name: '', latitude: '', longitude: '' });
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const init = async () => {
      const { user } = await authService.me();
      setCurrentUser(user);
      fetchSensors();
    };
    init();
  }, []);

  const fetchSensors = async () => {
    try {
      const data = await sensorService.getAll();
      setSensors(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSensor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const lat = newSensor.latitude ? parseFloat(newSensor.latitude) : undefined;
      const lng = newSensor.longitude ? parseFloat(newSensor.longitude) : undefined;
      await sensorService.create(newSensor.identifier, newSensor.name, lat, lng);
      setNewSensor({ identifier: '', name: '', latitude: '', longitude: '' });
      setIsModalOpen(false);
      fetchSensors();
    } catch (err) {
      alert("Erro ao criar sensor");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Confirmar remoção permanente deste dispositivo?")) {
      try {
        await sensorService.delete(id);
        fetchSensors();
      } catch (err) {
        alert("Erro ao deletar");
      }
    }
  };

  // admin e gerencia podem gerenciar projetos (adicionar/remover)
  const canManage = currentUser?.role === 'gerencia' || currentUser?.role === 'admin';

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">{t('dev.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{t('dev.subtitle')}</p>
        </div>
        {canManage ? (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95"
          >
            <Plus size={18} />
            {t('dev.new_btn')}
          </button>
        ) : (
          <div className="px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 text-xs text-gray-400 font-bold flex items-center gap-2">
            <Lock size={14} /> MODO APENAS LEITURA
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
           <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
           {t('dash.loading')}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-700/30 border-b border-gray-100 dark:border-slate-700">
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('dev.status')}</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('dev.id')}</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('dev.name')}</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('dev.last_seen')}</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-right">{t('dev.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {sensors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic text-sm">Nenhum sensor registrado no sistema.</td>
                  </tr>
                ) : (
                  sensors.map((sensor) => (
                    <tr key={sensor.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                          sensor.status === 'active' 
                            ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50' 
                            : 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${sensor.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                          {sensor.status === 'active' ? t('dash.online') : 'Offline'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 transition-colors">
                            <Cpu size={16} />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white text-sm">{sensor.identifier}</div>
                            {sensor.latitude && sensor.longitude && (
                              <div className="flex items-center gap-1 text-[10px] text-blue-500 font-bold uppercase mt-0.5">
                                <MapPin size={10} /> Localizado
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-300">{sensor.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                          {sensor.last_seen ? new Date(sensor.last_seen).toLocaleString() : 'NUNCA CONECTADO'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {canManage ? (
                          <button 
                            onClick={() => handleDelete(sensor.id)}
                            className="text-gray-400 hover:text-red-600 transition-all p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
                            title="Remover Dispositivo"
                          >
                            <Trash2 size={18} />
                          </button>
                        ) : (
                          <div className="text-gray-300 dark:text-slate-700 p-2 inline-block cursor-not-allowed" title="Apenas leitura">
                            <Lock size={16} />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Cadastro */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-blue-600 p-6 text-white">
               <h2 className="text-xl font-black italic tracking-tighter flex items-center gap-2">
                 <Cpu size={24} /> {t('dev.add_title')}
               </h2>
               <p className="text-blue-100 text-xs mt-1 font-medium">Preencha os dados do hardware para iniciar a coleta.</p>
            </div>
            
            <form onSubmit={handleAddSensor} className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('dev.label_id')}</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: ESP32-REFEITORIO-01"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm"
                  value={newSensor.identifier}
                  onChange={e => setNewSensor({...newSensor, identifier: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('dev.label_name')}</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Ar-condicionado Central"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                  value={newSensor.name}
                  onChange={e => setNewSensor({...newSensor, name: e.target.value})}
                />
              </div>
              
              <div className="pt-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                  <MapPin size={12} className="text-blue-500" /> Coordenadas de Instalação (GPS)
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400">LATITUDE</label>
                    <input 
                      type="number" 
                      step="any"
                      placeholder="-23.5505"
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-gray-900 dark:text-white rounded-lg text-xs"
                      value={newSensor.latitude}
                      onChange={e => setNewSensor({...newSensor, latitude: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400">LONGITUDE</label>
                    <input 
                      type="number" 
                      step="any"
                      placeholder="-46.6333"
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-gray-900 dark:text-white rounded-lg text-xs"
                      value={newSensor.longitude}
                      onChange={e => setNewSensor({...newSensor, longitude: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 px-4 py-3 text-gray-500 dark:text-gray-400 font-bold text-xs uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all"
                >
                  {t('dev.cancel')}
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-95"
                >
                  {t('dev.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
