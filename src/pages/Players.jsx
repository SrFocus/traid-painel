import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPlayers } from '../services/api';
import { Search, ChevronLeft, ChevronRight, Eye, User, Phone, Wallet, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

function Players() {
  const [players, setPlayers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    loadPlayers();
  }, [pagination.page, sortBy, sortOrder]);

  const loadPlayers = async () => {
    setLoading(true);
    try {
      const response = await getPlayers(pagination.page, 20, search, sortBy, sortOrder);
      setPlayers(response.data.players);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Erro ao carregar jogadores:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    loadPlayers();
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      // Ciclo: asc → desc → volta para padrão (id asc)
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else {
        setSortBy('id');
        setSortOrder('asc');
      }
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <ArrowUpDown size={14} className="text-slate-500" />;
    return sortOrder === 'asc' 
      ? <ArrowUp size={14} className="text-primary-400" />
      : <ArrowDown size={14} className="text-primary-400" />;
  };

  const formatMoney = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slideUp">
        <div>
          <h1 className="text-2xl font-bold text-white">Jogadores</h1>
          <p className="text-slate-400">{pagination.total} jogadores registrados</p>
        </div>
        
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por ID, nome, telefone..."
              className="bg-slate-800 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 w-72"
            />
          </div>
          <button
            type="submit"
            className="bg-primary-500 hover:bg-primary-600 hover:shadow-lg hover:shadow-primary-500/25 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden animate-slideUp hover-lift" style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th 
                  className="text-left text-slate-300 font-medium px-6 py-4 cursor-pointer hover:bg-slate-700/50 transition-colors"
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center gap-2">
                    ID
                    <SortIcon field="id" />
                  </div>
                </th>
                <th 
                  className="text-left text-slate-300 font-medium px-6 py-4 cursor-pointer hover:bg-slate-700/50 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    Jogador
                    <SortIcon field="name" />
                  </div>
                </th>
                <th 
                  className="text-left text-slate-300 font-medium px-6 py-4 cursor-pointer hover:bg-slate-700/50 transition-colors"
                  onClick={() => handleSort('phone')}
                >
                  <div className="flex items-center gap-2">
                    Telefone
                    <SortIcon field="phone" />
                  </div>
                </th>
                <th 
                  className="text-left text-slate-300 font-medium px-6 py-4 cursor-pointer hover:bg-slate-700/50 transition-colors"
                  onClick={() => handleSort('bank')}
                >
                  <div className="flex items-center gap-2">
                    Banco
                    <SortIcon field="bank" />
                  </div>
                </th>
                <th 
                  className="text-left text-slate-300 font-medium px-6 py-4 cursor-pointer hover:bg-slate-700/50 transition-colors"
                  onClick={() => handleSort('casino_balance')}
                >
                  <div className="flex items-center gap-2">
                    Casino
                    <SortIcon field="casino_balance" />
                  </div>
                </th>
                <th className="text-center text-slate-300 font-medium px-6 py-4">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                      <span className="text-slate-400">Carregando...</span>
                    </div>
                  </td>
                </tr>
              ) : players.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                    Nenhum jogador encontrado
                  </td>
                </tr>
              ) : (
                players.map((player, index) => (
                  <tr key={player.id} className="hover:bg-slate-700/30 transition-all duration-200 hover:translate-x-1" style={{ animationDelay: `${index * 0.02}s` }}>
                    <td className="px-6 py-4">
                      <span className="bg-slate-700 text-white px-3 py-1 rounded-full text-sm font-mono">
                        #{player.id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center transition-transform duration-200 hover:scale-110">
                          <User className="text-slate-400" size={20} />
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {player.name} {player.name2}
                          </p>
                          <p className="text-slate-400 text-sm font-mono">
                            {player.steam?.substring(0, 20)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Phone size={14} className="text-slate-500" />
                        <span>{player.phone || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Wallet size={14} className="text-green-500" />
                        <span className="text-green-400 font-medium">
                          {formatMoney(player.bank)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {/* <span className="text-yellow-500 text-sm">🎰</span> */}
                        <span className="text-yellow-400 font-medium">
                          {player.casino_balance != null ? formatMoney(player.casino_balance) : <span className="text-slate-500 text-xs">N/A</span>}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        to={`/players/${player.id}`}
                        className="inline-flex items-center gap-2 bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 hover:scale-105 px-4 py-2 rounded-lg transition-all duration-200"
                      >
                        <Eye size={16} />
                        <span>Ver</span>
                      </Link>
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
                className="p-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

export default Players;
