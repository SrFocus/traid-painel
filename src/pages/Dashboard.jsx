import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStats, getOnlinePlayers } from '../services/api';
import { Users, Car, Wifi, Ban, DollarSign, TrendingUp, Crown } from 'lucide-react';

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
    loadOnlinePlayers();
    // Atualiza jogadores online a cada 5 segundos
    const interval = setInterval(loadOnlinePlayers, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadOnlinePlayers = async () => {
    try {
      const response = await getOnlinePlayers();
      setOnlineCount(response.data.onlineIds?.length || 0);
    } catch (err) {
      console.error('Erro ao carregar jogadores online:', err);
    }
  };

  const loadStats = async () => {
    try {
      const response = await getStats();
      setStats(response.data);
    } catch (err) {
      setError('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">
        {error}
      </div>
    );
  }

  const statCards = [
    { 
      title: 'Jogadores Online', 
      value: onlineCount, 
      icon: Wifi, 
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    { 
      title: 'Dinheiro no Cassino', 
      value: formatMoney(stats?.totalCasino), 
      icon: DollarSign, 
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      isFormatted: true
    },
    { 
      title: 'Dinheiro em Circulação', 
      value: formatMoney(stats?.totalBank), 
      icon: DollarSign, 
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      isFormatted: true
    },
    { 
      title: 'Jogadores Banidos', 
      value: stats?.totalBans || 0, 
      icon: Ban, 
      color: 'text-red-500',
      bgColor: 'bg-red-500/10'
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="animate-slideUp">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400">Painel de controle geral do Traid Roleplay</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div 
              key={index}
              className={`bg-slate-800 rounded-xl p-6 border border-slate-700 hover-lift hover-glow cursor-default animate-slideUp stagger-${index + 1}`}
              style={{ opacity: 0, animationFillMode: 'forwards' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">{card.title}</p>
                  <p className={`${card.isFormatted ? 'text-xl' : 'text-3xl'} font-bold text-white mt-1`}>
                    {card.value}
                  </p>
                </div>
                <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className={card.color} size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Richest Players */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 animate-slideUp hover-lift" style={{ animationDelay: '0.3s', opacity: 0, animationFillMode: 'forwards' }}>
          <div className="flex items-center gap-3 mb-4">
            <Crown className="text-yellow-500 animate-float" size={24} />
            <h2 className="text-lg font-semibold text-white">Jogadores Mais Ricos</h2>
          </div>
          
          <div className="space-y-3">
            {stats?.richestPlayers?.map((player, index) => (
              <div 
                key={index} 
                onClick={() => navigate(`/players/${player.id}`)}
                className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg transition-all duration-200 hover:bg-slate-700 hover:translate-x-1 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-transform duration-200 hover:scale-110 ${
                    index === 0 ? 'bg-yellow-500 text-black' :
                    index === 1 ? 'bg-slate-400 text-black' :
                    index === 2 ? 'bg-primary-600 text-white' :
                    'bg-slate-600 text-white'
                  }`}>
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-white font-medium">{player.name} {player.name2}</p>
                    <p className="text-slate-400 text-sm">ID: {player.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-green-400 text-xs">💵</span>
                    <span className="text-green-400 font-bold">{formatMoney(player.bank)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-yellow-400 text-xs">🎰</span>
                    <span className="text-yellow-400 font-bold">{formatMoney(player.casino || 0)}</span>
                  </div>
                </div>
              </div>
            )) || <p className="text-slate-500">Nenhum dado disponível</p>}
          </div>
        </div>

        {/* Recent Players */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 animate-slideUp hover-lift" style={{ animationDelay: '0.4s', opacity: 0, animationFillMode: 'forwards' }}>
          <div className="flex items-center gap-3 mb-4">
            <Users className="text-blue-500" size={24} />
            <h2 className="text-lg font-semibold text-white">Jogadores Recentes</h2>
          </div>
          
          <div className="space-y-3">
            {stats?.recentPlayers?.map((player, index) => (
              <div 
                key={index}
                onClick={() => navigate(`/players/${player.id}`)}
                className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg transition-all duration-200 hover:bg-slate-700 hover:translate-x-1 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center transition-transform duration-200 hover:scale-110">
                    <span className="text-white font-medium">
                      {(player.name?.[0] || 'U').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {player.name} {player.name2}
                    </p>
                    <p className="text-slate-400 text-sm">
                      {/* Tel: {player.phone || 'N/A'} | Idade: {player.age || 'N/A'} */}
                      Tel: {player.phone || 'N/A'}
                    </p>
                  </div>
                </div>
                <span className="text-slate-400 text-sm">ID: {player.id}</span>
              </div>
            )) || <p className="text-slate-500">Nenhum jogador encontrado</p>}
          </div>
        </div>

        {/* Vehicle Stats */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 lg:col-span-2 animate-slideUp hover-lift" style={{ animationDelay: '0.5s', opacity: 0, animationFillMode: 'forwards' }}>
          <div className="flex items-center gap-3 mb-4">
            <Car className="text-purple-500" size={24} />
            <h2 className="text-lg font-semibold text-white">Veículos Mais Populares</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {stats?.vehicleStats?.slice(0, 10).map((vehicle, index) => (
              <div key={index} className="p-3 bg-slate-700/50 rounded-lg text-center transition-all duration-200 hover:bg-slate-700 hover:scale-105 cursor-default">
                <p className="text-white font-medium text-sm truncate">{vehicle.vehicle}</p>
                <p className="text-slate-400 text-xs mt-1">{vehicle.count} unidades</p>
              </div>
            )) || <p className="text-slate-500 col-span-full">Nenhum veículo registrado</p>}
          </div>
        </div>
      </div>

      {/* System Info */}
      {/* <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-lg font-semibold text-white mb-4">Informações do Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-700/50 rounded-lg">
            <p className="text-slate-400 text-sm">Status da API</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-400 font-medium">Online</span>
            </div>
          </div>
          <div className="p-4 bg-slate-700/50 rounded-lg">
            <p className="text-slate-400 text-sm">Banco de Dados</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-white font-medium">MySQL Conectado</span>
            </div>
          </div>
          <div className="p-4 bg-slate-700/50 rounded-lg">
            <p className="text-slate-400 text-sm">Framework</p>
            <span className="text-white font-medium">vRP Framework</span>
          </div>
        </div>
      </div> */}
    </div>
  );
}

export default Dashboard;
