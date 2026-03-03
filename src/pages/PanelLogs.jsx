import { useState, useEffect } from 'react';
import { getPanelLogs } from '../services/api';
import { 
  FileText, Search, ChevronLeft, ChevronRight, Filter,
  LogIn, LogOut, UserPlus, UserMinus, Edit, Trash, DollarSign,
  Package, Car, Ban, Shield, Home
} from 'lucide-react';

function PanelLogs() {
  const [logs, setLogs] = useState([]);
  const [actions, setActions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, [pagination.page, selectedAction]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const response = await getPanelLogs(pagination.page, 50, search, selectedAction);
      setLogs(response.data.logs);
      setActions(response.data.actions || []);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Erro ao carregar logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    loadLogs();
  };

  const getActionIcon = (action) => {
    const iconMap = {
      'LOGIN_SUCCESS': <LogIn size={16} className="text-green-400" />,
      'LOGIN_FAILED': <LogIn size={16} className="text-red-400" />,
      'LOGOUT': <LogOut size={16} className="text-slate-400" />,
      'CREATE_USER': <UserPlus size={16} className="text-green-400" />,
      'UPDATE_USER': <Edit size={16} className="text-blue-400" />,
      'DELETE_USER': <UserMinus size={16} className="text-red-400" />,
      'UPDATE_PLAYER': <Edit size={16} className="text-blue-400" />,
      'MODIFY_MONEY': <DollarSign size={16} className="text-green-400" />,
      'ADD_ITEM': <Package size={16} className="text-green-400" />,
      'REMOVE_ITEM': <Package size={16} className="text-red-400" />,
      'ADD_VEHICLE': <Car size={16} className="text-green-400" />,
      'DELETE_VEHICLE': <Car size={16} className="text-red-400" />,
      'ADD_VEHICLE_TRUNK_ITEM': <Package size={16} className="text-green-400" />,
      'REMOVE_VEHICLE_TRUNK_ITEM': <Package size={16} className="text-red-400" />,
      'ADD_HOUSE': <Home size={16} className="text-green-400" />,
      'DELETE_HOUSE': <Home size={16} className="text-red-400" />,
      'DELETE_HOUSE_GLOBAL': <Home size={16} className="text-red-400" />,
      'ADD_HOUSE_STASH_ITEM': <Package size={16} className="text-green-400" />,
      'REMOVE_HOUSE_STASH_ITEM': <Package size={16} className="text-red-400" />,
      'BAN_PLAYER': <Ban size={16} className="text-red-400" />,
      'UNBAN_PLAYER': <Shield size={16} className="text-green-400" />,
      'ADD_GROUP': <Shield size={16} className="text-indigo-400" />,
      'REMOVE_GROUP': <Shield size={16} className="text-orange-400" />,
    };
    return iconMap[action] || <FileText size={16} className="text-slate-400" />;
  };

  const getActionLabel = (action) => {
    const labelMap = {
      'LOGIN_SUCCESS': 'Login Realizado',
      'LOGIN_FAILED': 'Login Falhou',
      'LOGOUT': 'Saíu do Sistema',
      'CREATE_USER': 'Criar Usuário do Painel',
      'UPDATE_USER': 'Atualizar Usuário do Painel',
      'DELETE_USER': 'Excluir Usuário do Painel',
      'UPDATE_PLAYER': 'Atualizar Jogador',
      'MODIFY_MONEY': 'Modificar Dinheiro',
      'ADD_ITEM': 'Adicionar Item',
      'REMOVE_ITEM': 'Remover Item',
      'ADD_VEHICLE': 'Adicionar Veículo',
      'DELETE_VEHICLE': 'Excluir Veículo',
      'ADD_VEHICLE_TRUNK_ITEM': 'Adicionar Item no Baú',
      'REMOVE_VEHICLE_TRUNK_ITEM': 'Remover Item do Baú',
      'ADD_HOUSE': 'Adicionar Casa',
      'DELETE_HOUSE': 'Excluir Casa',
      'DELETE_HOUSE_GLOBAL': 'Excluir Casa (Global)',
      'ADD_HOUSE_STASH_ITEM': 'Adicionar Item na Casa',
      'REMOVE_HOUSE_STASH_ITEM': 'Remover Item da Casa',
      'BAN_PLAYER': 'Banir Jogador',
      'UNBAN_PLAYER': 'Desbanir Jogador',
      'ADD_GROUP': 'Adicionar Permissão',
      'REMOVE_GROUP': 'Remover Permissão',
    };
    return labelMap[action] || action;
  };

  const getActionColor = (action) => {
    if (action === 'ADD_GROUP') return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
    if (action === 'REMOVE_GROUP') return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
    if (action === 'LOGOUT') return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    if (action.includes('DELETE') || action.includes('REMOVE') || action.includes('BAN') || action.includes('FAILED')) {
      return 'bg-red-500/10 text-red-400 border-red-500/30';
    }
    if (action.includes('CREATE') || action.includes('ADD') || action.includes('UNBAN') || action.includes('SUCCESS')) {
      return 'bg-green-500/10 text-green-400 border-green-500/30';
    }
    if (action.includes('UPDATE') || action.includes('MODIFY')) {
      return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
    return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('pt-BR');
  };

  const formatDetailsNumbers = (details) => {
    if (!details) return '-';
    return details.replace(/\d+/g, (n) => {
      const num = parseInt(n);
      return num >= 1000 ? num.toLocaleString('pt-BR') : n;
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slideUp">
        <div>
          <h1 className="text-2xl font-bold text-white">Logs de Ações</h1>
          <p className="text-slate-400">{pagination.total.toLocaleString('pt-BR')} registros de atividade</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por usuário, detalhes..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:border-primary-500"
            />
          </div>
          <button
            type="submit"
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Buscar
          </button>
        </form>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select
            value={selectedAction}
            onChange={(e) => {
              setSelectedAction(e.target.value);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="bg-slate-800 border border-slate-700 rounded-lg py-2 pl-10 pr-8 text-white focus:outline-none focus:border-primary-500 appearance-none cursor-pointer"
          >
            <option value="">Todas as ações</option>
            {actions.map((action) => (
              <option key={action} value={action}>{getActionLabel(action)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden animate-slideUp hover-lift" style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="text-left text-slate-300 font-medium px-6 py-4">Data/Hora</th>
                <th className="text-left text-slate-300 font-medium px-6 py-4">Usuário</th>
                <th className="text-left text-slate-300 font-medium px-6 py-4">Ação</th>
                <th className="text-left text-slate-300 font-medium px-6 py-4">Detalhes</th>
                <th className="text-left text-slate-300 font-medium px-6 py-4">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                      <span className="text-slate-400">Carregando...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                    Nenhum log encontrado
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-700/30 transition-all duration-200 hover:translate-x-1">
                    <td className="px-6 py-4">
                      <span className="text-slate-300 text-sm whitespace-nowrap">
                        {formatDate(log.created_at)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-medium">{log.username}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getActionColor(log.action)}`}>
                        {getActionIcon(log.action)}
                        {getActionLabel(log.action)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-300 text-sm">{formatDetailsNumbers(log.details)}</span>
                      {log.target_id && (
                        <span className="text-slate-500 text-xs ml-2">
                          ({log.target_type}: {log.target_id})
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-400 text-sm font-mono">{log.ip_address || '-'}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700">
            <p className="text-slate-400 text-sm">
              Página {pagination.page} de {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="p-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PanelLogs;
