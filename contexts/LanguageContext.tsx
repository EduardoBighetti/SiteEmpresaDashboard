
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'pt' | 'en' | 'es';
type UnitSystem = 'metric' | 'imperial';

// Unit Preferences Interface based on the user's table
export interface UnitPreferences {
  system: UnitSystem;
  temperature: 'C' | 'F';
  length: 'm' | 'imp'; // m/km vs ft/mi
  mass: 'kg' | 'lb';
  volume: 'L' | 'gal';
  speed: 'kmh' | 'mph';
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  units: UnitPreferences;
  setUnits: (units: UnitPreferences) => void;
  updateUnit: (key: keyof UnitPreferences, value: any) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translations Dictionary
const translations: Record<Language, Record<string, string>> = {
  pt: {
    // Menu
    'menu.main': 'Menu Principal',
    'menu.dashboard': 'Dashboard',
    'menu.monitoring': 'Monitoramento',
    'menu.devices': 'Dispositivos',
    'menu.config': 'Configurações',
    'menu.account': 'Minha Conta',
    'menu.logout': 'Sair do Sistema',
    
    // Header
    'header.title': 'Painel de Controle - AL2 Tecnologia',
    'header.admin': 'Administrador',
    'header.user': 'Usuário Padrão',

    // Dashboard
    'dash.title': 'Visão Geral do Sistema',
    'dash.subtitle': 'Média global de todos os sensores ativos em tempo real.',
    'dash.temp_avg': 'Temperatura Média',
    'dash.hum_avg': 'Umidade Média',
    'dash.network': 'Atividade da Rede',
    'dash.sync': 'Última Sincronização',
    'dash.loading': 'Carregando métricas gerais...',
    'dash.stable': 'Estável',
    'dash.auto': 'Automático',
    'dash.online': 'Online',
    'dash.general': 'Geral',

    // Monitoring
    'mon.title': 'Monitoramento Individual',
    'mon.subtitle': 'Selecione uma aplicação para visualizar métricas detalhadas.',
    'mon.select_label': 'Aplicação / Dispositivo',
    'mon.select_placeholder': 'Selecione um dispositivo...',
    'mon.no_selection': 'Nenhum dispositivo selecionado',
    'mon.no_selection_sub': 'Escolha um sensor na lista acima para ver os dados.',
    'mon.last_read': 'Última leitura',
    'mon.history': 'Histórico de Registros',
    'mon.col_date': 'Data',
    'mon.col_time': 'Hora',
    'mon.col_temp': 'Temperatura',
    'mon.col_hum': 'Umidade',

    // Devices
    'dev.title': 'Dispositivos',
    'dev.subtitle': 'Gerencie seus sensores IoT conectados.',
    'dev.new_btn': 'Novo Sensor',
    'dev.status': 'Status',
    'dev.id': 'Identificador',
    'dev.name': 'Nome / Local',
    'dev.last_seen': 'Última Conexão',
    'dev.actions': 'Ações',
    'dev.empty': 'Nenhum sensor cadastrado.',
    'dev.add_title': 'Adicionar Novo Sensor',
    'dev.label_id': 'Identificador do Hardware (ID)',
    'dev.label_name': 'Nome do Local',
    'dev.cancel': 'Cancelar',
    'dev.save': 'Salvar',

    // Settings
    'set.title': 'Configurações e Perfil',
    'set.subtitle': 'Gerencie sua conta, idioma e preferências de exibição.',
    'set.lang_title': 'Idioma e Região',
    'set.lang_desc': 'Selecione o idioma de exibição do sistema.',
    'set.units_title': 'Unidades de Medida',
    'set.units_desc': 'Defina como os dados numéricos serão exibidos nos painéis.',
    'set.appearance': 'Aparência',
    'set.dark_mode': 'Modo Escuro',
    'set.dark_desc': 'Alterne entre temas claros e escuros.',
    'set.login_info': 'Informações de Login',
    'set.feedback': 'Avaliação e Suporte',
    'set.feedback_desc': 'Encontrou um erro ou tem uma sugestão? Envie uma mensagem.',
    'set.logout_title': 'Encerrar Sessão',
    'set.logout_desc': 'Desconectar sua conta deste dispositivo.',
    'set.btn_logout': 'Sair Agora',
    'set.btn_send': 'Enviar Avaliação',
    
    // Login
    'login.welcome': 'Bem-vindo de volta! Faça login.',
    'login.create': 'Crie sua conta para começar.',
    'login.user_label': 'Usuário',
    'login.pass_label': 'Senha',
    'login.btn_enter': 'Entrar',
    'login.btn_register': 'Cadastrar',
    'login.link_register': 'Não tem uma conta? Registre-se',
    'login.link_login': 'Já tem uma conta? Faça login',

    // Unit Table
    'unit.quantity': 'Grandeza',
    'unit.metric': 'Sistema Métrico (SI)',
    'unit.imperial': 'Sistema Imperial (EUA/UK)',
    'unit.length': 'Comprimento',
    'unit.mass': 'Massa (Peso)',
    'unit.volume': 'Volume (Líquidos)',
    'unit.temp': 'Temperatura',
    'unit.speed': 'Velocidade',
  },
  en: {
    'menu.main': 'Main Menu',
    'menu.dashboard': 'Dashboard',
    'menu.monitoring': 'Monitoring',
    'menu.devices': 'Devices',
    'menu.config': 'Settings',
    'menu.account': 'My Account',
    'menu.logout': 'Logout',

    'header.title': 'Control Panel - AL2 Technology',
    'header.admin': 'Administrator',
    'header.user': 'Standard User',

    'dash.title': 'System Overview',
    'dash.subtitle': 'Global average of all active sensors in real-time.',
    'dash.temp_avg': 'Avg Temperature',
    'dash.hum_avg': 'Avg Humidity',
    'dash.network': 'Network Activity',
    'dash.sync': 'Last Sync',
    'dash.loading': 'Loading metrics...',
    'dash.stable': 'Stable',
    'dash.auto': 'Automatic',
    'dash.online': 'Online',
    'dash.general': 'General',

    'mon.title': 'Individual Monitoring',
    'mon.subtitle': 'Select an application to view detailed metrics.',
    'mon.select_label': 'Application / Device',
    'mon.select_placeholder': 'Select a device...',
    'mon.no_selection': 'No device selected',
    'mon.no_selection_sub': 'Choose a sensor from the list above to view data.',
    'mon.last_read': 'Last reading',
    'mon.history': 'Reading History',
    'mon.col_date': 'Date',
    'mon.col_time': 'Time',
    'mon.col_temp': 'Temperature',
    'mon.col_hum': 'Humidity',

    'dev.title': 'Devices',
    'dev.subtitle': 'Manage your connected IoT sensors.',
    'dev.new_btn': 'New Sensor',
    'dev.status': 'Status',
    'dev.id': 'Identifier',
    'dev.name': 'Name / Location',
    'dev.last_seen': 'Last Connection',
    'dev.actions': 'Actions',
    'dev.empty': 'No sensors registered.',
    'dev.add_title': 'Add New Sensor',
    'dev.label_id': 'Hardware ID',
    'dev.label_name': 'Location Name',
    'dev.cancel': 'Cancel',
    'dev.save': 'Save',

    'set.title': 'Settings & Profile',
    'set.subtitle': 'Manage your account, language, and display preferences.',
    'set.lang_title': 'Language & Region',
    'set.lang_desc': 'Select the system display language.',
    'set.units_title': 'Measurement Units',
    'set.units_desc': 'Define how numerical data is displayed on dashboards.',
    'set.appearance': 'Appearance',
    'set.dark_mode': 'Dark Mode',
    'set.dark_desc': 'Toggle between light and dark themes.',
    'set.login_info': 'Login Information',
    'set.feedback': 'Feedback & Support',
    'set.feedback_desc': 'Found a bug or have a suggestion? Send a message.',
    'set.logout_title': 'End Session',
    'set.logout_desc': 'Disconnect your account from this device.',
    'set.btn_logout': 'Logout Now',
    'set.btn_send': 'Send Feedback',

    'login.welcome': 'Welcome back! Please login.',
    'login.create': 'Create your account to start.',
    'login.user_label': 'Username',
    'login.pass_label': 'Password',
    'login.btn_enter': 'Login',
    'login.btn_register': 'Register',
    'login.link_register': 'No account? Register',
    'login.link_login': 'Have an account? Login',

    'unit.quantity': 'Quantity',
    'unit.metric': 'Metric System (SI)',
    'unit.imperial': 'Imperial System (US/UK)',
    'unit.length': 'Length',
    'unit.mass': 'Mass (Weight)',
    'unit.volume': 'Volume (Liquids)',
    'unit.temp': 'Temperature',
    'unit.speed': 'Speed',
  },
  es: {
    'menu.main': 'Menú Principal',
    'menu.dashboard': 'Tablero',
    'menu.monitoring': 'Monitoreo',
    'menu.devices': 'Dispositivos',
    'menu.config': 'Configuración',
    'menu.account': 'Mi Cuenta',
    'menu.logout': 'Cerrar Sesión',

    'header.title': 'Panel de Control - AL2 Tecnología',
    'header.admin': 'Administrador',
    'header.user': 'Usuario Estándar',

    'dash.title': 'Visión General',
    'dash.subtitle': 'Promedio global de todos los sensores activos en tiempo real.',
    'dash.temp_avg': 'Temp. Promedio',
    'dash.hum_avg': 'Hum. Promedio',
    'dash.network': 'Actividad de Red',
    'dash.sync': 'Última Sinc.',
    'dash.loading': 'Cargando métricas...',
    'dash.stable': 'Estable',
    'dash.auto': 'Automático',
    'dash.online': 'En Línea',
    'dash.general': 'General',

    'mon.title': 'Monitoreo Individual',
    'mon.subtitle': 'Seleccione una aplicación para ver métricas detalladas.',
    'mon.select_label': 'Aplicación / Dispositivo',
    'mon.select_placeholder': 'Seleccione un dispositivo...',
    'mon.no_selection': 'Ningún dispositivo seleccionado',
    'mon.no_selection_sub': 'Elija un sensor de la lista para ver datos.',
    'mon.last_read': 'Última lectura',
    'mon.history': 'Historial de Registros',
    'mon.col_date': 'Fecha',
    'mon.col_time': 'Hora',
    'mon.col_temp': 'Temperatura',
    'mon.col_hum': 'Humedad',

    'dev.title': 'Dispositivos',
    'dev.subtitle': 'Gestione sus sensores IoT conectados.',
    'dev.new_btn': 'Nuevo Sensor',
    'dev.status': 'Estado',
    'dev.id': 'Identificador',
    'dev.name': 'Nombre / Ubicación',
    'dev.last_seen': 'Última Conexión',
    'dev.actions': 'Acciones',
    'dev.empty': 'No hay sensores registrados.',
    'dev.add_title': 'Agregar Nuevo Sensor',
    'dev.label_id': 'ID de Hardware',
    'dev.label_name': 'Nombre de Ubicación',
    'dev.cancel': 'Cancelar',
    'dev.save': 'Guardar',

    'set.title': 'Configuración y Perfil',
    'set.subtitle': 'Administre su cuenta, idioma y preferencias de visualización.',
    'set.lang_title': 'Idioma y Región',
    'set.lang_desc': 'Seleccione el idioma de visualización del sistema.',
    'set.units_title': 'Unidades de Medida',
    'set.units_desc': 'Defina cómo se muestran los datos numéricos.',
    'set.appearance': 'Apariencia',
    'set.dark_mode': 'Modo Oscuro',
    'set.dark_desc': 'Alternar entre temas claros y oscuros.',
    'set.login_info': 'Información de Inicio de Sesión',
    'set.feedback': 'Comentarios y Soporte',
    'set.feedback_desc': '¿Encontró un error? Envíe un mensaje.',
    'set.logout_title': 'Cerrar Sesión',
    'set.logout_desc': 'Desconectar su cuenta de este dispositivo.',
    'set.btn_logout': 'Salir Ahora',
    'set.btn_send': 'Enviar Comentario',

    'login.welcome': '¡Bienvenido! Inicie sesión.',
    'login.create': 'Cree su cuenta para comenzar.',
    'login.user_label': 'Usuario',
    'login.pass_label': 'Contraseña',
    'login.btn_enter': 'Entrar',
    'login.btn_register': 'Registrarse',
    'login.link_register': '¿No tiene cuenta? Regístrese',
    'login.link_login': '¿Ya tiene cuenta? Inicie sesión',

    'unit.quantity': 'Magnitud',
    'unit.metric': 'Sistema Métrico (SI)',
    'unit.imperial': 'Sistema Imperial (EE. UU./Reino Unido)',
    'unit.length': 'Longitud',
    'unit.mass': 'Masa (Peso)',
    'unit.volume': 'Volumen (Líquidos)',
    'unit.temp': 'Temperatura',
    'unit.speed': 'Velocidad',
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('pt');
  
  // Default to Metric
  const [units, setUnits] = useState<UnitPreferences>({
    system: 'metric',
    temperature: 'C',
    length: 'm',
    mass: 'kg',
    volume: 'L',
    speed: 'kmh'
  });

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const updateUnit = (key: keyof UnitPreferences, value: any) => {
    setUnits(prev => ({ ...prev, [key]: value }));
  };

  // Helper to bulk set system
  const setSystem = (system: UnitSystem) => {
    if (system === 'metric') {
      setUnits({
        system: 'metric',
        temperature: 'C',
        length: 'm',
        mass: 'kg',
        volume: 'L',
        speed: 'kmh'
      });
    } else {
      setUnits({
        system: 'imperial',
        temperature: 'F',
        length: 'imp',
        mass: 'lb',
        volume: 'gal',
        speed: 'mph'
      });
    }
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      units, 
      setUnits: (u) => {
        // If system changed entire object
        if (u.system !== units.system) {
            setSystem(u.system);
        } else {
            setUnits(u);
        }
      }, 
      updateUnit, 
      t 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
