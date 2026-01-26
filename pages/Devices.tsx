
import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Cpu, WifiOff, Wifi, MapPin, Lock } from 'lucide-react';
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
    if (window.confirm("Confirmar remoção?")) {
      try {
        await sensorService.delete(id);
        fetchSensors();
      } catch (err) {
        alert("Erro ao deletar");
      }
    }
  };

  const canManage = currentUser?.role === 'gerencia' || currentUser?.role === 'admin';

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('dev.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('dev.subtitle')}</p>
        </div>
        {canManage && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <Plus size={18} />
            {t('dev.new_btn')}
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">{t('dash.loading')}</div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('dev.status')}</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('dev.id')}</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('dev.name')}</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('dev.last_seen')}</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase text-right">{t('dev.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {sensors.map((sensor) => (
                  <tr key={sensor.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        sensor.status === 'active' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {sensor.status === 'active' ? <Wifi size={12} /> : <WifiOff size={12} />}
                        {sensor.status === 'active' ? t('dash.online') : 'Offline'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
                          <Cpu size={18} />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{sensor.identifier}</div>
                          {sensor.latitude && sensor.longitude && (
                            <div className="flex items-center gap-1 text-[10px] text-blue-500">
                              <MapPin size={10} /> Localizado
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{sensor.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {sensor.last_seen ? new Date(sensor.last_seen).toLocaleString() : 'Nunca'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {canManage ? (
                        <button 
                          onClick={() => handleDelete(sensor.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      ) : (
                        <div className="text-gray-300 dark:text-slate-600 p-2 flex justify-end" title="Apenas leitura">
                          <Lock size={16} />
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal - Same as before, but only triggered if canManage is true */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('dev.add_title')}</h2>
            <form onSubmit={handleAddSensor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('dev.label_id')}</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: ESP32-LAB-01"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={newSensor.identifier}
                  onChange={e => setNewSensor({...newSensor, identifier: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('dev.label_name')}</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Sala de Reunião"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={newSensor.name}
                  onChange={e => setNewSensor({...newSensor, name: e.target.value})}
                />
              </div>
              
              <div className="pt-2 border-t border-gray-100 dark:border-slate-700 mt-4">
                <p className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-1">
                  <MapPin size={12} /> Localização (Opcional)
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">Latitude</label>
                    <input 
                      type="number" 
                      step="any"
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-lg text-sm"
                      value={newSensor.latitude}
                      onChange={e => setNewSensor({...newSensor, latitude: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">Longitude</label>
                    <input 
                      type="number" 
                      step="any"
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-lg text-sm"
                      value={newSensor.longitude}
                      onChange={e => setNewSensor({...newSensor, longitude: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
                  {t('dev.cancel')}
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-900/20">
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
