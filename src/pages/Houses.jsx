import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHouses, deleteHouse, addPlayerHouse, getHouseStash, addHouseStashItem, removeHouseStashItem } from '../services/api';
import { Home, ChevronLeft, ChevronRight, Search, Trash2, User, Plus, X, Package } from 'lucide-react';

function Houses() {
  const navigate = useNavigate();
  const [houses, setHouses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [addHouseModal, setAddHouseModal] = useState(false);
  const [addHouseForm, setAddHouseForm] = useState({ userId: '', houseName: '' });
  const [addHouseMessage, setAddHouseMessage] = useState('');
  const [addHouseLoading, setAddHouseLoading] = useState(false);
  const [stashModal, setStashModal] = useState({ open: false, house: null, stashItems: [], loading: false });
  const [stashForm, setStashForm] = useState({ item: '', amount: 1 });
  const [stashRemoveTarget, setStashRemoveTarget] = useState({ slot: null, item: null, maxAmount: 0, qty: 1, qtyInput: '1' });
  const [stashMessage, setStashMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadHouses();
  }, [pagination.page]);

  const loadHouses = async () => {
    setLoading(true);
    try {
      const response = await getHouses(pagination.page, 20, search);
      setHouses(response.data.houses);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Erro ao carregar casas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    loadHouses();
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja remover esta casa?')) return;
    try {
      await deleteHouse(id);
      loadHouses();
    } catch (err) {
      console.error('Erro ao remover casa:', err);
    }
  };

  const openStashModal = async (house) => {
    setStashModal({ open: true, house, stashItems: [], loading: true });
    setStashForm({ item: '', amount: 1 });
    setStashRemoveTarget({ slot: null, item: null, maxAmount: 0, qty: 1, qtyInput: '1' });
    setStashMessage({ type: '', text: '' });
    try {
      const res = await getHouseStash(house.id);
      setStashModal(prev => ({ ...prev, stashItems: res.data.house.stashItems, loading: false }));
    } catch {
      setStashModal(prev => ({ ...prev, loading: false }));
    }
  };

  const refreshStash = async () => {
    if (!stashModal.house) return;
    try {
      const res = await getHouseStash(stashModal.house.id);
      const items = res.data.house.stashItems;
      setStashModal(prev => ({ ...prev, stashItems: items }));
      // Atualiza badge na linha da tabela
      setHouses(prev => prev.map(h =>
        h.id === stashModal.house.id ? { ...h, stashCount: items.length } : h
      ));
    } catch {}
  };

  const handleAddStashItem = async () => {
    if (!stashForm.item.trim() || stashForm.amount <= 0) return;
    try {
      await addHouseStashItem(stashModal.house.user_id, stashModal.house.id, stashForm.item.trim(), parseInt(stashForm.amount));
      setStashForm({ item: '', amount: 1 });
      setStashMessage({ type: 'success', text: 'Item adicionado com sucesso!' });
      setTimeout(() => setStashMessage({ type: '', text: '' }), 3000);
      await refreshStash();
    } catch (err) {
      setStashMessage({ type: 'error', text: err.response?.data?.error || 'Erro ao adicionar item' });
    }
  };

  const handleRemoveStashItem = async () => {
    const { slot, qty, maxAmount } = stashRemoveTarget;
    if (!slot) return;
    const amount = qty >= maxAmount ? null : qty;
    const removedQty = qty >= maxAmount ? maxAmount : qty;
    const removedItem = stashRemoveTarget.item;
    try {
      await removeHouseStashItem(stashModal.house.user_id, stashModal.house.id, slot, amount);
      setStashRemoveTarget({ slot: null, item: null, maxAmount: 0, qty: 1, qtyInput: '1' });
      await refreshStash();
      setStashMessage({ type: 'success', text: `Removido: ${removedItem} x${removedQty}` });
      setTimeout(() => setStashMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setStashMessage({ type: 'error', text: err.response?.data?.error || 'Erro ao remover item' });
    }
  };

  const handleAddHouse = async (e) => {
    e.preventDefault();
    if (!addHouseForm.userId || !addHouseForm.houseName) {
      setAddHouseMessage('Preencha todos os campos.');
      return;
    }
    setAddHouseLoading(true);
    setAddHouseMessage('');
    try {
      await addPlayerHouse(addHouseForm.userId, addHouseForm.houseName);
      setAddHouseMessage('Casa adicionada com sucesso!');
      setTimeout(() => {
        setAddHouseModal(false);
        setAddHouseForm({ userId: '', houseName: '' });
        setAddHouseMessage('');
        loadHouses();
      }, 1500);
    } catch (err) {
      setAddHouseMessage(err.response?.data?.error || 'Erro ao adicionar casa.');
    } finally {
      setAddHouseLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slideUp">
        <div>
          <h1 className="text-2xl font-bold text-white">Casas</h1>
          <p className="text-slate-400">{pagination.total} casas registradas</p>
        </div>

        {/* Search */}
        <div className="flex gap-2 items-center">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por casa ou jogador..."
                className="bg-slate-800 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:border-primary-500 w-64"
              />
            </div>
            <button
              type="submit"
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Buscar
            </button>
          </form>
          <button
            onClick={() => { setAddHouseModal(true); setAddHouseMessage(''); }}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={18} />
            Adicionar Casa
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden animate-slideUp hover-lift" style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="text-left text-slate-300 font-medium px-6 py-4">Casa</th>
                <th className="text-left text-slate-300 font-medium px-6 py-4">Proprietário</th>
                <th className="text-left text-slate-300 font-medium px-6 py-4">Tamanho</th>
                <th className="text-center text-slate-300 font-medium px-6 py-4">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                      <span className="text-slate-400">Carregando...</span>
                    </div>
                  </td>
                </tr>
              ) : houses.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-400">
                    Nenhuma casa encontrada
                  </td>
                </tr>
              ) : (
                houses.map((house) => (
                  <tr key={house.id} className="hover:bg-slate-700/30 transition-all duration-200 hover:translate-x-1">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                          <Home className="text-cyan-400" size={20} />
                        </div>
                        <span className="text-white font-medium">{house.home}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/players/${house.user_id}`)}
                        className="flex items-center gap-2 hover:text-primary-400 transition-colors group"
                      >
                        <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center group-hover:bg-primary-500/20">
                          <User size={14} className="text-slate-400 group-hover:text-primary-400" />
                        </div>
                        <div>
                          <p className="text-white group-hover:text-primary-400">{house.name} {house.name2}</p>
                          <p className="text-slate-400 text-sm">ID: {house.user_id}</p>
                        </div>
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-300">{house.vault || 0} kg</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openStashModal(house)}
                          className="relative p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                          title="Baú da casa"
                        >
                          <Package size={18} />
                          {house.stashCount > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-cyan-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                              {house.stashCount}
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(house.id)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Remover casa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
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
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stash Modal */}
      {stashModal.open && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setStashModal({ open: false, house: null, stashItems: [], loading: false })}
        >
          <div
            className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Baú: {stashModal.house?.home}</h3>
              <button onClick={() => setStashModal({ open: false, house: null, stashItems: [], loading: false })} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={stashForm.item}
                  onChange={(e) => setStashForm(prev => ({ ...prev, item: e.target.value }))}
                  placeholder="Item"
                  className="bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-cyan-500"
                />
                <input
                  type="number"
                  min="1"
                  value={stashForm.amount}
                  onChange={(e) => setStashForm(prev => ({ ...prev, amount: parseInt(e.target.value) || 1 }))}
                  className="bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <button
                onClick={handleAddStashItem}
                className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Adicionar no Baú
              </button>

              {stashMessage.text && (
                <div className={`px-3 py-2 rounded-lg text-sm ${
                  stashMessage.type === 'success'
                    ? 'bg-green-500/10 border border-green-500/50 text-green-400'
                    : 'bg-red-500/10 border border-red-500/50 text-red-400'
                }`}>{stashMessage.text}</div>
              )}

              <div className="max-h-64 overflow-y-auto">
                {stashModal.loading ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                  </div>
                ) : stashModal.stashItems.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {stashModal.stashItems.map((item) => (
                      <div key={item.slot} className="relative bg-slate-700/40 rounded-lg p-2 flex flex-col items-center text-center group">
                        <div className="w-12 h-12 mb-1 flex items-center justify-center">
                          <img
                            src={`https://media.githubusercontent.com/media/SrFocus/cdn-traid/main/inventory/${item.item.toLowerCase()}.png`}
                            alt={item.item}
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236b7280%22 stroke-width=%222%22><rect x=%223%22 y=%223%22 width=%2218%22 height=%2218%22 rx=%222%22/><path d=%22M12 8v8M8 12h8%22/></svg>'; }}
                          />
                        </div>
                        <p className="text-white text-xs font-medium truncate w-full">{item.item}</p>
                        <p className="text-cyan-400 text-xs font-bold">x{item.amount}</p>
                        <button
                          onClick={() => setStashRemoveTarget({ slot: item.slot, item: item.item, maxAmount: item.amount, qty: 1, qtyInput: '1' })}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500/80 text-white rounded-full text-xs items-center justify-center hidden group-hover:flex"
                          title="Remover"
                        >×</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">Baú da casa vazio</p>
                )}
              </div>
            </div>

            <div className="mt-5">
              <button
                onClick={() => setStashModal({ open: false, house: null, stashItems: [], loading: false })}
                className="w-full py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Stash Item Popup */}
      {stashRemoveTarget.slot && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          onClick={() => setStashRemoveTarget({ slot: null, item: null, maxAmount: 0, qty: 1, qtyInput: '1' })}
        >
          <div className="bg-slate-800 border border-slate-600 rounded-xl p-5 w-96 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 flex-shrink-0 bg-slate-700 rounded-lg flex items-center justify-center">
                <img
                  src={`https://media.githubusercontent.com/media/SrFocus/cdn-traid/main/inventory/${stashRemoveTarget.item?.toLowerCase()}.png`}
                  alt={stashRemoveTarget.item}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236b7280%22 stroke-width=%222%22><rect x=%223%22 y=%223%22 width=%2218%22 height=%2218%22 rx=%222%22/><path d=%22M12 8v8M8 12h8%22/></svg>'; }}
                />
              </div>
              <div className="min-w-0">
                <p className="text-white font-semibold text-sm truncate">{stashRemoveTarget.item}</p>
                <p className="text-slate-400 text-xs">disponível: {stashRemoveTarget.maxAmount.toLocaleString('pt-BR')}</p>
              </div>
            </div>
            <p className="text-slate-400 text-xs mb-2">Quantidade a remover</p>
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setStashRemoveTarget(prev => { const q = Math.max(1, prev.qty - 1); return { ...prev, qty: q, qtyInput: q.toLocaleString('pt-BR') }; })}
                className="w-9 h-9 bg-slate-700 hover:bg-red-500/80 text-white rounded-lg font-bold transition-colors flex items-center justify-center text-lg"
              >−</button>
              <input
                type="text"
                value={stashRemoveTarget.qtyInput}
                onChange={(e) => setStashRemoveTarget(prev => ({ ...prev, qtyInput: e.target.value.replace(/[^\d]/g, '') }))}
                onBlur={(e) => {
                  const q = Math.min(Math.max(1, parseInt(e.target.value.replace(/[^\d]/g, '')) || 1), stashRemoveTarget.maxAmount);
                  setStashRemoveTarget(prev => ({ ...prev, qty: q, qtyInput: q.toLocaleString('pt-BR') }));
                }}
                className="flex-1 bg-slate-700 border border-slate-600 rounded-lg py-2 text-white text-sm font-bold text-center focus:outline-none focus:border-red-400"
              />
              <button
                onClick={() => setStashRemoveTarget(prev => { const q = Math.min(prev.qty + 1, prev.maxAmount); return { ...prev, qty: q, qtyInput: q.toLocaleString('pt-BR') }; })}
                className="w-9 h-9 bg-slate-700 hover:bg-green-500/80 text-white rounded-lg font-bold transition-colors flex items-center justify-center text-lg"
              >+</button>
              <button
                onClick={() => setStashRemoveTarget(prev => ({ ...prev, qty: prev.maxAmount, qtyInput: prev.maxAmount.toLocaleString('pt-BR') }))}
                className="px-2 h-9 bg-slate-700 hover:bg-orange-500/80 text-orange-300 hover:text-white rounded-lg text-xs font-bold transition-colors"
              >Max</button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStashRemoveTarget({ slot: null, item: null, maxAmount: 0, qty: 1, qtyInput: '1' })}
                className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
              >Cancelar</button>
              <button
                onClick={handleRemoveStashItem}
                className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold transition-colors"
              >Remover</button>
            </div>
          </div>
        </div>
      )}

      {/* Add House Modal */}
      {addHouseModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setAddHouseModal(false)}
        >
          <div
            className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-96 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Home className="text-green-400" size={22} />
                </div>
                <h2 className="text-white font-semibold text-lg">Adicionar Casa</h2>
              </div>
              <button
                onClick={() => setAddHouseModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddHouse} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-1">ID do Usuário</label>
                <input
                  type="number"
                  value={addHouseForm.userId}
                  onChange={(e) => setAddHouseForm(prev => ({ ...prev, userId: e.target.value }))}
                  placeholder="Ex: 1234"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-1">Nome da Casa</label>
                <input
                  type="text"
                  value={addHouseForm.houseName}
                  onChange={(e) => setAddHouseForm(prev => ({ ...prev, houseName: e.target.value }))}
                  placeholder="Ex: motel_1"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-green-500"
                  required
                />
              </div>

              {addHouseMessage && (
                <p className={`text-sm text-center ${addHouseMessage.includes('sucesso') ? 'text-green-400' : 'text-red-400'}`}>
                  {addHouseMessage}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setAddHouseModal(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={addHouseLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2 rounded-lg transition-colors"
                >
                  {addHouseLoading ? 'Adicionando...' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Houses;