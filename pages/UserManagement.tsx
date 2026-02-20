
import React, { useEffect, useState } from 'react';
import { Users, Shield, User as UserIcon, Calendar, Mail, MoreVertical, Key, Plus, Copy, CheckCircle2, AlertCircle } from 'lucide-react';
import { authService, accessKeyService } from '../services/api';
import { User, AccessKey } from '../types';

export const UserManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'security'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [keys, setKeys] = useState<AccessKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const data = await authService.getUsers();
        setUsers(data);
      } else {
        const data = await accessKeyService.getAll();
        setKeys(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateKey = async (role: 'admin' | 'gerencia') => {
    try {
      await accessKeyService.generate(role);
      fetchData();
    } catch (err) {
      alert("Erro ao gerar chave");
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopying(text);
    setTimeout(() => setCopying(null), 2000);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'gerencia': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-700 dark:text-gray-400 dark:border-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-900/20">
              <Shield size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Centro de Controle</h1>
            <p className="text-gray-500 dark:text-gray-400">Gerencie usuários e chaves de segurança do sistema.</p>
          </div>
        </div>

        <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'users' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <Users size={16} /> Usuários
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'security' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <Key size={16} /> Segurança
          </button>
        </div>
      </div>

      {activeTab === 'users' ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
          {loading ? (
            <div className="text-center py-20 text-gray-500">Buscando base de usuários...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700">
                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Identidade</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Cargo</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">E-mail de Contato</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Data Cadastro</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 overflow-hidden border border-gray-200 dark:border-slate-600">
                            {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <UserIcon size={20} />}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white">{user.full_name || 'Usuário AL2'}</div>
                            <div className="text-xs text-blue-600 dark:text-blue-400 font-mono">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black border uppercase tracking-wider ${getRoleBadge(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <Mail size={14} className="text-gray-400" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Calendar size={14} />
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
              <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Plus size={18} className="text-blue-600" />
                Gerar Nova Chave
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                Gere uma chave única para autorizar o cadastro de novos administradores ou gerentes no sistema.
              </p>
              <div className="space-y-3">
                <button 
                  onClick={() => handleGenerateKey('admin')}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                >
                  Criar Chave ADMIN
                </button>
                <button 
                  onClick={() => handleGenerateKey('gerencia')}
                  className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2"
                >
                  Criar Chave GERÊNCIA
                </button>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-2xl border border-amber-100 dark:border-amber-900/30">
               <h4 className="text-amber-800 dark:text-amber-400 font-bold text-sm flex items-center gap-2 mb-2">
                 <AlertCircle size={16} /> Aviso Importante
               </h4>
               <p className="text-xs text-amber-700 dark:text-amber-500/80 leading-relaxed">
                 Chaves de acesso são descartáveis. Uma vez que um usuário utiliza a chave para se cadastrar, ela se torna inválida para novos registros.
               </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
               <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
                  <h3 className="font-bold text-gray-800 dark:text-white">Chaves Ativas</h3>
                  <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase">{keys.length} Chaves</span>
               </div>
               
               <div className="divide-y divide-gray-100 dark:divide-slate-700">
                 {loading ? (
                    <div className="p-10 text-center text-gray-500">Buscando chaves...</div>
                 ) : keys.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">Nenhuma chave gerada ainda.</div>
                 ) : (
                    keys.map(k => (
                      <div key={k.id} className={`p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-all ${k.is_used ? 'opacity-50 grayscale' : ''}`}>
                         <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${k.role === 'gerencia' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                               <Key size={18} />
                            </div>
                            <div>
                               <div className="flex items-center gap-2">
                                  <span className="font-mono font-black text-lg text-gray-800 dark:text-white tracking-wider">{k.key}</span>
                                  {k.is_used && <span className="text-[10px] text-red-500 font-bold uppercase border border-red-500 px-1 rounded">Usada</span>}
                               </div>
                               <div className="text-[10px] text-gray-500 uppercase font-bold">
                                  Nível: {k.role} • Criada em: {new Date(k.created_at).toLocaleDateString()}
                               </div>
                            </div>
                         </div>
                         {!k.is_used && (
                            <button 
                              onClick={() => handleCopy(k.key)}
                              className="p-2 hover:bg-white dark:hover:bg-slate-600 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-slate-500 text-gray-400 hover:text-blue-600 transition-all"
                            >
                               {copying === k.key ? <CheckCircle2 size={18} className="text-green-500" /> : <Copy size={18} />}
                            </button>
                         )}
                      </div>
                    ))
                 )}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
